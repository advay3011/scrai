"""
GET /api/stats

Returns the aggregate KPI numbers shown in the dashboard stat cards:
  - Total active events
  - Average risk score
  - Number of suppliers at risk (score > 60)
  - Rough cost exposure estimate in USD
  - Event breakdown by category

Everything here is computed on the fly from the cached event + supplier
data — no separate aggregation table needed at this scale.
"""

import sys
import os
from datetime import datetime, timezone
from fastapi import APIRouter

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
from backend.api.routes.events    import _get_cached_events
from backend.api.routes.suppliers import SUPPLIER_REGISTRY, _compute_risk_score
from backend.models.schemas       import DashboardStats, EventsByCategory

router = APIRouter(prefix="/api/stats", tags=["Stats"])

# ─── Cost estimation constants ────────────────────────────────────────────────
# Very rough heuristic: each severity point on a critical event
# costs an estimated $50K/day in supply chain disruption.
# This is intentionally simple — a real model would use supplier revenue data.

COST_PER_SEVERITY_POINT_USD = 50_000


# ─── Endpoint ─────────────────────────────────────────────────────────────────

@router.get("", response_model=DashboardStats, summary="Get dashboard KPI stats")
async def get_stats():
    """
    Returns aggregate KPI numbers for the top stat cards.

    All values are derived from the live GDELT event cache, so they
    update automatically every 10 minutes when the cache refreshes.

    Cost exposure is a heuristic estimate — not financial advice.
    """
    events = _get_cached_events()

    # ── Active events ──────────────────────────────────────────────
    active_events = len(events)

    # ── Average severity (mapped to 0–100 scale) ───────────────────
    if events:
        avg_severity   = sum(e["severity_score"] for e in events) / len(events)
        avg_risk_score = round(avg_severity * 10, 1)   # 1–10 → 10–100
    else:
        avg_risk_score = 0.0

    # ── Suppliers at risk (risk score > 60) ────────────────────────
    suppliers_at_risk = sum(
        1 for s in SUPPLIER_REGISTRY
        if _compute_risk_score(s["country"], events) > 60
    )

    # ── Cost exposure estimate ─────────────────────────────────────
    # Sum up cost contribution of all severity-8+ events
    critical_events   = [e for e in events if e["severity_score"] >= 8]
    cost_exposure_usd = sum(
        e["severity_score"] * COST_PER_SEVERITY_POINT_USD
        for e in critical_events
    )

    # ── Events by category ─────────────────────────────────────────
    by_category = EventsByCategory()
    for e in events:
        cat = e.get("risk_category", "")
        if cat == "weather":
            by_category.weather      += 1
        elif cat == "geopolitical":
            by_category.geopolitical += 1
        elif cat == "disaster":
            by_category.disaster     += 1
        elif cat == "labor":
            by_category.labor        += 1

    return DashboardStats(
        active_events=active_events,
        avg_risk_score=avg_risk_score,
        suppliers_at_risk=suppliers_at_risk,
        cost_exposure_usd=cost_exposure_usd,
        events_by_category=by_category,
        last_updated=datetime.now(timezone.utc).isoformat(),
    )
