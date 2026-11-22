"""
RELOOP FastAPI Backend API
Powers circular economy decision engine, Gemini vision identification,
localized recovery partner search, booking tracking, and impact metrics.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend/ or project root
root_dir = Path(__file__).resolve().parent.parent
backend_dir = Path(__file__).resolve().parent
load_dotenv(backend_dir / ".env")
load_dotenv(root_dir / ".env")

from typing import Optional, List
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from models import (
    ItemAnalysisRequest, ItemProfile, RecommendationResponse,
    CreateRequestPayload, RecoveryRequest, StatusUpdatePayload,
    MarketplaceListing, ImpactSummary, SampleItem
)
from vision_service import analyze_item_vision
from decision_engine import rank_recovery_routes, calculate_distance_km
from database import (
    init_db, list_partners, get_partner, create_recovery_request,
    list_recovery_requests, update_request_status,
    list_marketplace_listings, create_marketplace_listing,
    get_impact_analytics
)
from sample_items import SAMPLE_ITEMS

app = FastAPI(
    title="RELOOP Circular Economy API",
    description="Multi-route recovery decision engine and partner directory",
    version="1.0.0"
)

# Enable CORS for local Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()
    print("[RELOOP Backend] Database initialized with 30+ partners and demo benchmarks.")

@app.get("/api/health")
def health_check():
    has_gemini = bool(os.getenv("GEMINI_API_KEY", "").strip())
    return {
        "status": "healthy",
        "service": "RELOOP API",
        "gemini_api_configured": has_gemini,
        "mode": "live" if has_gemini else "demo"
    }

@app.get("/api/sample-items")
def get_sample_items():
    """Returns the 4 rich one-click demo sample items."""
    return SAMPLE_ITEMS

@app.post("/api/analyze")
async def analyze_item(req: ItemAnalysisRequest):
    """
    Step 1 & 2: Analyzes item image and/or text description.
    Returns editable item profile with confidence score and uncertainty indicators.
    """
    profile, is_demo_mode = await analyze_item_vision(
        image_base64=req.image_base64,
        description=req.description or "",
        quantity=req.quantity or 1,
        city=req.location_city or "Bengaluru",
        lat=req.lat or 12.9716,
        lng=req.lng or 77.5946
    )
    return {
        "item_profile": profile,
        "is_demo_mode": is_demo_mode
    }

@app.post("/api/recommend", response_model=RecommendationResponse)
def get_recommendations(profile: ItemProfile):
    """
    Step 3: Ranks recovery routes (repair, reuse, resell, donate, compost, recycle)
    transparently comparing value, feasibility, local partner availability, and carbon impact.
    """
    response = rank_recovery_routes(profile)
    # Check if demo mode was active
    has_gemini = bool(os.getenv("GEMINI_API_KEY", "").strip())
    response.is_demo_mode = not has_gemini
    return response

@app.get("/api/partners")
def search_partners(
    city: Optional[str] = Query("all", description="City filter (e.g. Bengaluru, Delhi NCR, Mumbai)"),
    material: Optional[str] = Query("all", description="Material filter (e.g. plastic, cardboard, e-waste)"),
    type: Optional[str] = Query("all", description="Partner type filter"),
    lat: Optional[float] = Query(None, description="User latitude for distance sorting"),
    lng: Optional[float] = Query(None, description="User longitude for distance sorting")
):
    """
    Step 4: Returns matching recovery partners with real-time distance calculations and ratings.
    """
    partners = list_partners(city=city, material=material, partner_type=type)
    
    # Calculate distance if user coords provided
    user_lat = lat or 12.9716
    user_lng = lng or 77.5946
    for p in partners:
        p["distance_km"] = calculate_distance_km(user_lat, user_lng, p["lat"], p["lng"])
        
    partners.sort(key=lambda x: x["distance_km"])
    return partners

@app.post("/api/requests")
def create_booking(payload: CreateRequestPayload):
    """
    Step 5: Books a partner pickup or drop-off.
    """
    created = create_recovery_request(payload)
    return created

@app.get("/api/requests")
def get_bookings():
    """
    Step 6: Lists recovery requests for timeline tracking.
    """
    return list_recovery_requests()

@app.patch("/api/requests/{request_id}/status")
def change_request_status(request_id: str, payload: StatusUpdatePayload):
    """
    Updates recovery status: Requested → Scheduled → Collected → Recovered.
    Partner dashboard or admin demo simulator.
    """
    updated = update_request_status(request_id, payload.status.value)
    if not updated:
        raise HTTPException(status_code=404, detail="Request not found")
    return updated

@app.get("/api/marketplace")
def get_marketplace(category: Optional[str] = Query("all")):
    """
    Lists circular marketplace pre-loved listings.
    """
    return list_marketplace_listings(category=category)

@app.post("/api/marketplace")
def add_marketplace_listing(listing: dict):
    """
    Creates a new listing directly from item recommendation results.
    """
    return create_marketplace_listing(listing)

@app.get("/api/impact", response_model=ImpactSummary)
def get_impact():
    """
    Returns circular economy aggregate impact dashboard metrics.
    """
    return get_impact_analytics()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
