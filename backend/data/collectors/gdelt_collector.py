"""
GDELT Collector for Supply Chain Risk Events
Fetches and filters news events from the GDELT API related to supply chain disruptions.
"""

import requests
import hashlib
from datetime import datetime, timedelta
from typing import Optional

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# GDELT DOC 2.0 API endpoint for article-level search
GDELT_API_BASE = "https://api.gdeltproject.org/api/v2/doc/doc"

# Search queries mapped to risk categories.
# Each tuple is (query_string, risk_category).
SUPPLY_CHAIN_QUERIES = [
    ("factory fire explosion manufacturing plant",       "disaster"),
    ("port closure blockage shipping disruption",        "geopolitical"),
    ("earthquake tsunami supply chain",                  "weather"),
    ("flood hurricane typhoon logistics disruption",     "weather"),
    ("political unrest protest government shutdown",     "geopolitical"),
    ("strike labour union workers walkout",              "labor"),
    ("trade dispute tariff sanction embargo",            "geopolitical"),
]

# Keywords that boost relevance — articles missing all of these are dropped.
RELEVANCE_KEYWORDS = [
    "supply chain", "shipping", "port", "factory", "manufacturing",
    "logistics", "cargo", "freight", "trade", "export", "import",
    "production", "warehouse", "disruption", "shortage",
]

# How many days back to fetch events
LOOKBACK_DAYS = 7

# Max articles to fetch per query (GDELT caps at 250)
MAX_RECORDS = 75

# Minimum severity score to keep an event (1–10 scale)
MIN_SEVERITY = 3

# Timeout for HTTP requests (seconds)
REQUEST_TIMEOUT = 15


# ---------------------------------------------------------------------------
# Severity scoring
# ---------------------------------------------------------------------------

# Words that raise or lower the computed severity score
SEVERITY_BOOSTERS = {
    "catastrophic": 4, "massive": 3, "major": 3, "severe": 3,
    "critical": 3, "destroyed": 3, "fatal": 3, "deaths": 2,
    "significant": 2, "serious": 2, "extensive": 2, "large": 2,
    "disruption": 2, "closure": 2, "shutdown": 2, "halted": 2,
    "delayed": 1, "affected": 1, "impact": 1, "concern": 1,
}

SEVERITY_REDUCERS = {
    "minor": -2, "small": -1, "limited": -1, "partial": -1,
    "temporary": -1, "brief": -1, "slight": -1,
}


def _compute_severity(title: str, seencount: int) -> int:
    """
    Estimate a 1–10 severity score from article title and GDELT's seencount.

    seencount = number of articles covering the same event; higher means
    more media attention, which correlates with real-world severity.
    """
    score = 5  # neutral baseline

    text = title.lower()
    for word, delta in SEVERITY_BOOSTERS.items():
        if word in text:
            score += delta
    for word, delta in SEVERITY_REDUCERS.items():
        if word in text:
            score += delta  # delta is already negative

    # Media-attention bonus: log-like scaling up to +2
    if seencount >= 100:
        score += 2
    elif seencount >= 20:
        score += 1

    return max(1, min(10, score))


# ---------------------------------------------------------------------------
# Relevance filtering
# ---------------------------------------------------------------------------

def _is_relevant(title: str) -> bool:
    """
    Return True if the article title contains at least one supply-chain keyword.
    Drops articles that happen to match the query string but aren't really
    about supply chain impacts.
    """
    text = title.lower()
    return any(kw in text for kw in RELEVANCE_KEYWORDS)


# ---------------------------------------------------------------------------
# GDELT API interaction
# ---------------------------------------------------------------------------

def _build_params(query: str, start_date: str, end_date: str) -> dict:
    """
    Build the query-string parameters for the GDELT DOC 2.0 API.

    mode=artlist   → returns individual articles (not themes or timelines)
    format=json    → JSON response
    maxrecords     → cap results per call
    startdatetime / enddatetime → YYYYMMDDHHMMSS format
    """
    return {
        "query":         query,
        "mode":          "artlist",
        "format":        "json",
        "maxrecords":    MAX_RECORDS,
        "startdatetime": start_date,
        "enddatetime":   end_date,
        "sort":          "datedesc",
    }


def _fetch_articles(query: str, risk_category: str,
                    start_date: str, end_date: str) -> list[dict]:
    """
    Call the GDELT API for one query and return a list of normalised event dicts.
    Returns an empty list on any network or parsing error.
    """
    params = _build_params(query, start_date, end_date)

    try:
        response = requests.get(
            GDELT_API_BASE,
            params=params,
            timeout=REQUEST_TIMEOUT,
        )
        response.raise_for_status()
    except requests.exceptions.Timeout:
        print(f"[GDELT] Timeout fetching query: '{query}'")
        return []
    except requests.exceptions.HTTPError as exc:
        print(f"[GDELT] HTTP error {exc.response.status_code} for query: '{query}'")
        return []
    except requests.exceptions.RequestException as exc:
        print(f"[GDELT] Request error for query '{query}': {exc}")
        return []

    try:
        data = response.json()
    except ValueError:
        print(f"[GDELT] Invalid JSON response for query: '{query}'")
        return []

    articles = data.get("articles") or []
    if not articles:
        return []

    events = []
    for article in articles:
        title      = article.get("title", "").strip()
        url        = article.get("url", "").strip()
        domain     = article.get("domain", "")
        seencount  = int(article.get("seencount", 1))
        raw_date   = article.get("seendate", "")  # YYYYMMDDTHHMMSSZ
        socialimage = article.get("socialimage", "")

        # Skip articles with no title or URL
        if not title or not url:
            continue

        # Drop irrelevant articles
        if not _is_relevant(title):
            continue

        # Parse date → ISO format
        try:
            dt = datetime.strptime(raw_date, "%Y%m%dT%H%M%SZ")
            iso_date = dt.strftime("%Y-%m-%d")
        except ValueError:
            iso_date = "unknown"

        severity = _compute_severity(title, seencount)

        # Apply minimum severity filter
        if severity < MIN_SEVERITY:
            continue

        # Stable event_id from URL hash (so duplicates across queries merge)
        event_id = "gdelt_" + hashlib.md5(url.encode()).hexdigest()[:12]

        events.append({
            "event_id":      event_id,
            "date":          iso_date,
            "headline":      title,
            "location": {
                "country":   _extract_country(article),
                "lat":       article.get("latitude"),
                "lng":       article.get("longitude"),
            },
            "risk_category": risk_category,
            "severity_score": severity,
            "source_url":    url,
        })

    return events


def _extract_country(article: dict) -> Optional[str]:
    """
    Pull a country name from whichever GDELT field is available.
    GDELT doesn't always provide geo data, so we fall back gracefully.
    """
    return (
        article.get("sourcecountry")
        or article.get("country")
        or None
    )


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------

def collect_supply_chain_risks() -> list[dict]:
    """
    Fetch supply-chain risk events from GDELT for the past LOOKBACK_DAYS days.

    Steps:
      1. Build date range (today minus LOOKBACK_DAYS → now).
      2. For each risk query, call the GDELT API and normalise articles.
      3. Deduplicate events by event_id.
      4. Sort by severity (descending).

    Returns a list of event dicts, each with fields:
        event_id, date, headline, location, risk_category,
        severity_score, source_url
    """
    # Build GDELT date strings (YYYYMMDDHHMMSS)
    now        = datetime.utcnow()
    start_dt   = now - timedelta(days=LOOKBACK_DAYS)
    start_str  = start_dt.strftime("%Y%m%d%H%M%S")
    end_str    = now.strftime("%Y%m%d%H%M%S")

    print(f"[GDELT] Fetching events from {start_dt.date()} to {now.date()}")

    all_events: dict[str, dict] = {}  # keyed by event_id for deduplication

    for query, category in SUPPLY_CHAIN_QUERIES:
        print(f"[GDELT] Query ({category}): '{query}'")
        events = _fetch_articles(query, category, start_str, end_str)
        print(f"         → {len(events)} events after filtering")

        for event in events:
            eid = event["event_id"]
            # Keep the higher-severity version if the same URL appears twice
            if eid not in all_events or event["severity_score"] > all_events[eid]["severity_score"]:
                all_events[eid] = event

    # Sort by severity descending, then date descending
    sorted_events = sorted(
        all_events.values(),
        key=lambda e: (e["severity_score"], e["date"]),
        reverse=True,
    )

    print(f"[GDELT] Total unique events collected: {len(sorted_events)}")
    return sorted_events


# ---------------------------------------------------------------------------
# Test / demo
# ---------------------------------------------------------------------------

def _print_event(event: dict, index: int) -> None:
    """Pretty-print a single risk event."""
    loc = event["location"]
    lat = f"{loc['lat']:.4f}" if loc.get("lat") else "N/A"
    lng = f"{loc['lng']:.4f}" if loc.get("lng") else "N/A"

    print(f"""
  ─── Event {index} ───────────────────────────────────────────
  ID       : {event['event_id']}
  Date     : {event['date']}
  Headline : {event['headline']}
  Country  : {loc.get('country') or 'Unknown'}
  Lat/Lng  : {lat} / {lng}
  Category : {event['risk_category']}
  Severity : {event['severity_score']} / 10
  URL      : {event['source_url']}""")


def run_test() -> None:
    """
    Entry-point for manual testing.
    Collects events and prints the top 5 by severity.
    """
    print("=" * 60)
    print("  GDELT Supply Chain Risk Collector — Test Run")
    print("=" * 60)

    events = collect_supply_chain_risks()

    if not events:
        print("\n[!] No events returned. Check your internet connection or try again later.")
        return

    print(f"\nShowing top 5 of {len(events)} collected events:\n")
    for i, event in enumerate(events[:5], start=1):
        _print_event(event, i)

    print("\n" + "=" * 60)


if __name__ == "__main__":
    run_test()
