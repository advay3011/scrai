"""
GET /api/alerts

Returns a formatted alert feed for the dashboard sidebar.

Alerts are NOT a separate data source — they are derived from
the same GDELT events, just reformatted for the UI:

  severity_score 8–10  →  "critical"
  severity_score 5–7   →  "warning"
  severity_score 1–4   →  "resolved" (low-impact / fading events)

This means the alert feed always stays in sync with the event data
automatically — no separate alert table needed.
"""

import sys
import os
from datetime import datetime, timezone
from fastapi import APIRouter, Query

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
from backend.api.routes.events import _get_cached_events
from backend.models.schemas import Alert, AlertsResponse

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _severity_label(score: int) -> str:
    """Map a 1–10 severity score to a UI-friendly severity label."""
    if score >= 8:
        return "critical"
    if score >= 5:
        return "warning"
    return "resolved"


def _time_ago(date_str: str) -> str:
    """
    Convert a YYYY-MM-DD date string into a human-readable relative time.
    e.g. "today" → "just now", "yesterday" → "1 day ago"

    GDELT only gives us day-level precision, so we can't do "2 min ago"
    from the raw data — that's a frontend concern for real-time WebSockets
    (a future module). For now we give day-level labels.
    """
    try:
        event_date = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        today      = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        delta_days = (today - event_date).days

        if delta_days == 0:
            return "today"
        if delta_days == 1:
            return "1 day ago"
        return f"{delta_days} days ago"
    except ValueError:
        return "recently"


def _event_to_alert(event: dict, index: int) -> Alert:
    """Convert a raw GDELT event dict into an Alert schema object."""
    return Alert(
        id=event["event_id"],
        title=event["headline"],
        severity=_severity_label(event["severity_score"]),
        category=event["risk_category"],
        time_ago=_time_ago(event["date"]),
        source_url=event.get("source_url"),
    )


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("", response_model=AlertsResponse, summary="Get live alert feed")
async def get_alerts(
    limit: int = Query(
        10,
        ge=1, le=50,
        description="Max alerts to return (default 10 for sidebar)",
    ),
    severity: str = Query(
        None,
        description="Filter by severity: critical | warning | resolved",
    ),
):
    """
    Returns the live alert feed sorted by severity then date.

    Alerts are derived from GDELT events — no separate alert store needed.
    The frontend sidebar typically requests limit=10. You can also filter
    by severity to show only critical alerts.
    """
    raw_events = _get_cached_events()

    # Sort: critical first, then by severity score descending
    sorted_events = sorted(raw_events, key=lambda e: e["severity_score"], reverse=True)

    # Convert to alerts
    all_alerts = [_event_to_alert(e, i) for i, e in enumerate(sorted_events)]

    # Apply severity filter if provided
    if severity:
        all_alerts = [a for a in all_alerts if a.severity == severity]

    return AlertsResponse(
        total=len(all_alerts[:limit]),
        alerts=all_alerts[:limit],
    )
