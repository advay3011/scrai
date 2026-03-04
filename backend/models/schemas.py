"""
Pydantic schemas — the single source of truth for every
data shape that flows between the API and the frontend.

If a field changes here, the whole API stays consistent.
"""

from pydantic import BaseModel, Field
from typing import Optional


# ─── Sub-models ──────────────────────────────────────────────────────────────

class Location(BaseModel):
    """Geographic position of an event."""
    country: Optional[str] = None
    lat:     Optional[float] = None
    lng:     Optional[float] = None


# ─── Core domain models ───────────────────────────────────────────────────────

class RiskEvent(BaseModel):
    """
    A single supply-chain risk event sourced from GDELT.
    Mirrors the dict shape returned by gdelt_collector.
    """
    event_id:       str
    date:           str
    headline:       str
    location:       Location
    risk_category:  str   # "weather" | "geopolitical" | "disaster" | "labor"
    severity_score: int   # 1–10
    source_url:     str


class Supplier(BaseModel):
    """A tier-1 supplier with a computed risk score."""
    id:         int
    name:       str
    location:   str          # human-readable city, country
    country:    str          # ISO-style country name for event matching
    category:   str          # e.g. "Semiconductor"
    risk_score: int          # 0–100
    delta:      str          # e.g. "+12" or "-3"
    delta_up:   bool         # True = risk went up (bad)
    alerts:     int          # number of active alerts


class Alert(BaseModel):
    """
    A formatted alert card shown in the dashboard sidebar.
    Derived from the highest-severity RiskEvents.
    """
    id:          str
    title:       str
    severity:    str          # "critical" | "warning" | "resolved"
    category:    str          # maps to risk_category
    time_ago:    str          # human-readable, e.g. "2 min ago"
    source_url:  Optional[str] = None


class EventsByCategory(BaseModel):
    """Breakdown of event count per risk category."""
    weather:      int = 0
    geopolitical: int = 0
    disaster:     int = 0
    labor:        int = 0


class DashboardStats(BaseModel):
    """
    Aggregate KPI numbers for the top stat cards on the dashboard.
    Computed fresh from the latest event batch.
    """
    active_events:       int
    avg_risk_score:      float
    suppliers_at_risk:   int
    cost_exposure_usd:   int           # rough estimate in USD
    events_by_category:  EventsByCategory
    last_updated:        str           # ISO timestamp


# ─── API response wrappers ────────────────────────────────────────────────────

class EventsResponse(BaseModel):
    """Envelope for GET /api/events."""
    total:  int
    events: list[RiskEvent]


class SuppliersResponse(BaseModel):
    """Envelope for GET /api/suppliers."""
    total:     int
    suppliers: list[Supplier]


class AlertsResponse(BaseModel):
    """Envelope for GET /api/alerts."""
    total:  int
    alerts: list[Alert]
