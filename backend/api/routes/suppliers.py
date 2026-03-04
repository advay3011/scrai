"""
GET /api/suppliers
GET /api/suppliers/{id}

Returns the supplier list with dynamically computed risk scores.

How risk scores are computed:
  - Each supplier has a home country.
  - We look at all recent GDELT events and count how many match
    that country (or are globally impactful).
  - The base score is adjusted up/down based on event severity.
  - This means scores change automatically as new events come in —
    no manual updates needed.
"""

import sys
import os
from fastapi import APIRouter, HTTPException

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
from backend.api.routes.events import _get_cached_events
from backend.models.schemas import Supplier, SuppliersResponse

router = APIRouter(prefix="/api/suppliers", tags=["Suppliers"])

# ─── Supplier registry ────────────────────────────────────────────────────────
# In a real app this would come from a database.
# For now it's a static list — risk scores are computed dynamically.

SUPPLIER_REGISTRY = [
    {
        "id":      1,
        "name":    "TSMC",
        "location":"Hsinchu, Taiwan",
        "country": "Taiwan",
        "category":"Semiconductor",
    },
    {
        "id":      2,
        "name":    "Samsung Electronics",
        "location":"Suwon, South Korea",
        "country": "South Korea",
        "category":"Electronics",
    },
    {
        "id":      3,
        "name":    "Foxconn",
        "location":"Shenzhen, China",
        "country": "China",
        "category":"Manufacturing",
    },
    {
        "id":      4,
        "name":    "Flex Ltd.",
        "location":"Singapore",
        "country": "Singapore",
        "category":"Contract Manufacturing",
    },
    {
        "id":      5,
        "name":    "Jabil Inc.",
        "location":"Guadalajara, Mexico",
        "country": "Mexico",
        "category":"Electronics Manufacturing",
    },
]

# Country aliases — GDELT sometimes uses different names
COUNTRY_ALIASES: dict[str, list[str]] = {
    "Taiwan":      ["Taiwan", "Taipei", "ROC"],
    "China":       ["China", "PRC", "Shenzhen", "Shanghai", "Beijing"],
    "South Korea": ["South Korea", "Korea", "Seoul"],
    "Singapore":   ["Singapore"],
    "Mexico":      ["Mexico", "Guadalajara", "Monterrey"],
}


# ─── Risk score computation ────────────────────────────────────────────────────

def _compute_risk_score(country: str, events: list[dict]) -> int:
    """
    Derive a 0–100 risk score for a supplier based on recent GDELT events
    in or near their country.

    Algorithm:
      1. Find events whose location.country matches (using aliases).
      2. Average their severity scores (1–10 scale).
      3. Scale to 0–100 and clamp.
      4. Add a global-events boost for high-severity worldwide events.
    """
    aliases = COUNTRY_ALIASES.get(country, [country])

    # Split events into country-specific and global high-impact
    country_events = [
        e for e in events
        if e.get("location", {}).get("country") in aliases
    ]
    global_high    = [
        e for e in events
        if e["severity_score"] >= 8
        and e.get("location", {}).get("country") not in aliases
    ]

    if not country_events and not global_high:
        return 15  # baseline low risk when no data

    scores = [e["severity_score"] for e in country_events]
    if global_high:
        # Global shocks add a small bump
        scores += [e["severity_score"] * 0.3 for e in global_high[:3]]

    avg_severity = sum(scores) / len(scores)   # 1–10 scale
    raw_score    = avg_severity * 10            # 10–100 scale

    # Volume bonus: more events = more unstable environment
    volume_bonus = min(len(country_events) * 1.5, 15)
    final        = int(raw_score + volume_bonus)

    return max(0, min(100, final))


def _build_supplier(base: dict, events: list[dict]) -> Supplier:
    """Combine static supplier data with a freshly computed risk score."""
    risk_score = _compute_risk_score(base["country"], events)

    # Fake delta for now — in a real system this compares to yesterday's score
    delta_val = risk_score - 50
    delta_str = f"+{delta_val}" if delta_val >= 0 else str(delta_val)
    delta_up  = delta_val > 0

    # Active alerts = high-severity events in this supplier's country
    aliases       = COUNTRY_ALIASES.get(base["country"], [base["country"]])
    active_alerts = sum(
        1 for e in events
        if e["severity_score"] >= 7
        and e.get("location", {}).get("country") in aliases
    )

    return Supplier(
        **base,
        risk_score=risk_score,
        delta=delta_str,
        delta_up=delta_up,
        alerts=active_alerts,
    )


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("", response_model=SuppliersResponse, summary="List all suppliers")
async def get_suppliers():
    """
    Returns all tracked suppliers with dynamically computed risk scores.

    Risk scores update automatically as new GDELT events come in —
    no manual recalculation needed.
    """
    events    = _get_cached_events()
    suppliers = [_build_supplier(s, events) for s in SUPPLIER_REGISTRY]

    # Sort by risk score descending so the riskiest appears first
    suppliers.sort(key=lambda s: s.risk_score, reverse=True)

    return SuppliersResponse(total=len(suppliers), suppliers=suppliers)


@router.get("/{supplier_id}", response_model=Supplier, summary="Get a single supplier")
async def get_supplier(supplier_id: int):
    """Returns one supplier by ID with its current risk score."""
    base = next((s for s in SUPPLIER_REGISTRY if s["id"] == supplier_id), None)
    if not base:
        raise HTTPException(status_code=404, detail=f"Supplier {supplier_id} not found")

    events = _get_cached_events()
    return _build_supplier(base, events)
