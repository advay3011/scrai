"""
GET /api/events

Returns a list of supply-chain risk events fetched from GDELT.

Key design decisions:
  - Results are cached in memory for CACHE_TTL seconds so we don't
    hammer the GDELT API on every page load.
  - Query params let the frontend filter without extra endpoints.
  - If GDELT is down or slow, we return an empty list with a warning
    rather than a 500 error — the dashboard degrades gracefully.
"""

import time
import sys
import os
from fastapi import APIRouter, Query, HTTPException
from typing import Optional

# Allow importing from the backend root
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
from backend.data.collectors.gdelt_collector import collect_supply_chain_risks
from backend.models.schemas import RiskEvent, EventsResponse, Location

router = APIRouter(prefix="/api/events", tags=["Events"])

# ─── Simple in-memory cache ───────────────────────────────────────────────────
# Avoids hitting GDELT on every request. Refreshes every 10 minutes.

CACHE_TTL = 600  # seconds

_cache: dict = {
    "data":       [],   # list of raw event dicts from the collector
    "expires_at": 0,    # unix timestamp when cache should be refreshed
}


def _get_cached_events() -> list[dict]:
    """
    Return cached events if still fresh, otherwise fetch from GDELT
    and repopulate the cache.
    """
    now = time.time()
    if now < _cache["expires_at"] and _cache["data"]:
        return _cache["data"]

    # Cache is stale — fetch fresh data
    try:
        events = collect_supply_chain_risks()
        _cache["data"]       = events
        _cache["expires_at"] = now + CACHE_TTL
    except Exception as exc:
        # GDELT is unreachable; return whatever we have (may be empty)
        print(f"[events] GDELT fetch failed: {exc}")

    return _cache["data"]


def _to_schema(raw: dict) -> RiskEvent:
    """Convert the raw dict from gdelt_collector into a typed RiskEvent."""
    loc = raw.get("location", {}) or {}
    return RiskEvent(
        event_id=raw["event_id"],
        date=raw["date"],
        headline=raw["headline"],
        location=Location(
            country=loc.get("country"),
            lat=loc.get("lat"),
            lng=loc.get("lng"),
        ),
        risk_category=raw["risk_category"],
        severity_score=raw["severity_score"],
        source_url=raw["source_url"],
    )


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("", response_model=EventsResponse, summary="List risk events")
async def get_events(
    category: Optional[str] = Query(
        None,
        description="Filter by risk_category: weather | geopolitical | disaster | labor",
    ),
    min_severity: int = Query(
        1,
        ge=1, le=10,
        description="Only return events with severity_score >= this value",
    ),
    limit: int = Query(
        50,
        ge=1, le=250,
        description="Max number of events to return",
    ),
):
    """
    Returns supply-chain risk events from GDELT, sorted by severity (highest first).

    Results are cached for 10 minutes to avoid excessive API calls.
    Use `min_severity=7` to get only serious events, or `category=weather`
    to filter by type.
    """
    raw_events = _get_cached_events()

    # Apply filters
    filtered = [
        e for e in raw_events
        if e["severity_score"] >= min_severity
        and (category is None or e["risk_category"] == category)
    ]

    # Convert to typed schemas and respect the limit
    events = [_to_schema(e) for e in filtered[:limit]]

    return EventsResponse(total=len(events), events=events)


@router.get("/refresh", summary="Force-refresh the GDELT cache")
async def refresh_events():
    """
    Bypasses the cache and fetches a fresh batch from GDELT immediately.
    Useful after triggering a manual data pull.
    """
    _cache["expires_at"] = 0  # invalidate cache
    events = _get_cached_events()
    return {"message": "Cache refreshed", "total": len(events)}


@router.get("/{event_id}", response_model=RiskEvent, summary="Get a single event")
async def get_event(event_id: str):
    """Returns a single risk event by its ID."""
    raw_events = _get_cached_events()
    match = next((e for e in raw_events if e["event_id"] == event_id), None)
    if not match:
        raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found")
    return _to_schema(match)
