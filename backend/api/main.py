"""
Foresight API — entry point.

Run with:
    uvicorn backend.api.main:app --reload --port 8000

Interactive docs available at:
    http://localhost:8000/docs      (Swagger UI)
    http://localhost:8000/redoc     (ReDoc)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from backend.api.routes import events, suppliers, alerts, stats

load_dotenv()

# ─── App setup ────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Foresight API",
    description="AI-powered supply chain risk intelligence platform.",
    version="0.2.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
# Allow the React dev server (port 5173) and any production origin
# listed in the CORS_ORIGINS env variable.

origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
# Each router owns its own prefix (/api/events, /api/suppliers, etc.)
# so main.py stays clean and each module is independently testable.

app.include_router(events.router)
app.include_router(suppliers.router)
app.include_router(alerts.router)
app.include_router(stats.router)


# ─── Root & health ────────────────────────────────────────────────────────────

@app.get("/", tags=["Meta"])
async def root():
    return {
        "product": "Foresight API",
        "version": "0.2.0",
        "docs":    "/docs",
        "routes": [
            "GET /api/events",
            "GET /api/events/{event_id}",
            "GET /api/events/refresh",
            "GET /api/suppliers",
            "GET /api/suppliers/{id}",
            "GET /api/alerts",
            "GET /api/stats",
        ],
    }


@app.get("/health", tags=["Meta"])
async def health():
    """Lightweight liveness check for deployment health probes."""
    return {"status": "healthy"}
