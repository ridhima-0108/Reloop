from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class RouteType(str, Enum):
    REPAIR = "repair"
    REUSE = "reuse"
    RESELL = "resell"
    DONATE = "donate"
    COMPOST = "compost"
    RECYCLE = "recycle"

class ItemCondition(str, Enum):
    BROKEN = "broken"
    POOR = "poor"
    FAIR = "fair"
    GOOD = "good"
    LIKE_NEW = "like_new"

class RequestStatus(str, Enum):
    REQUESTED = "Requested"
    SCHEDULED = "Scheduled"
    COLLECTED = "Collected"
    RECOVERED = "Recovered"

class PartnerType(str, Enum):
    KABADIWALA = "kabadiwala"
    EWASTE_RECYCLER = "ewaste_recycler"
    TEXTILE_COLLECTOR = "textile_collector"
    REPAIR_SHOP = "repair_shop"
    COMPOSTER = "composter"
    RESALE_BUYER = "resale_buyer"

class ItemAnalysisRequest(BaseModel):
    image_base64: Optional[str] = None
    description: Optional[str] = ""
    quantity: Optional[int] = 1
    location_city: Optional[str] = "Bengaluru"
    lat: Optional[float] = 12.9716
    lng: Optional[float] = 77.5946

class ItemProfile(BaseModel):
    item_type: str
    material: str
    condition: str
    quantity: int = 1
    confidence: float = 0.85
    recyclable: bool = True
    notes: Optional[str] = ""
    estimated_weight_kg: float = 0.5
    city: str = "Bengaluru"
    lat: Optional[float] = 12.9716
    lng: Optional[float] = 77.5946
    image_preview: Optional[str] = None

class ScoreBreakdown(BaseModel):
    resale_value_score: int
    repair_feasibility_score: int
    local_availability_score: int
    environmental_benefit_score: int
    total_score: int
    factor_notes: str

class RouteRecommendation(BaseModel):
    route: RouteType
    title: str
    rank: int
    score: int
    score_breakdown: ScoreBreakdown
    price_range_inr: str
    indicative_value_inr: int
    co2_saved_kg: float
    why: str
    instructions: List[str]
    feasibility: str # "High", "Medium", "Low"
    is_recommended: bool = False
    action_type: str # "pickup", "dropoff", "sell_listing", "diy_repair"

class RecommendationResponse(BaseModel):
    item_profile: ItemProfile
    recommendations: List[RouteRecommendation]
    top_recommendation: RouteType
    summary_explanation: str
    is_demo_mode: bool = False

class Partner(BaseModel):
    id: str
    name: str
    type: PartnerType
    city: str
    address: str
    lat: float
    lng: float
    phone: str
    rating: float
    reviews_count: int
    accepted_materials: List[str]
    pickup_available: bool
    price_expectation: str
    timing: str
    verified: bool = True
    distance_km: Optional[float] = None

class CreateRequestPayload(BaseModel):
    user_name: str
    user_phone: str
    user_address: str
    item_type: str
    material: str
    condition: str
    quantity: int
    route: RouteType
    partner_id: Optional[str] = None
    partner_name: Optional[str] = None
    scheduled_date: Optional[str] = None
    notes: Optional[str] = ""
    estimated_weight_kg: Optional[float] = 1.0
    co2_saved_kg: Optional[float] = 2.0

class RecoveryRequest(BaseModel):
    id: str
    user_name: str
    user_phone: str
    user_address: str
    item_type: str
    material: str
    condition: str
    quantity: int
    route: RouteType
    partner_id: Optional[str] = None
    partner_name: Optional[str] = None
    status: RequestStatus
    scheduled_date: Optional[str] = None
    notes: Optional[str] = ""
    created_at: str
    updated_at: str
    weight_kg: float
    co2_saved_kg: float

class StatusUpdatePayload(BaseModel):
    status: RequestStatus

class MarketplaceListing(BaseModel):
    id: str
    title: str
    description: str
    category: str
    condition: str
    price_inr: int
    location: str
    image_url: Optional[str] = None
    seller_name: str
    seller_contact: str
    created_at: str

class ImpactSummary(BaseModel):
    total_items_diverted: int
    total_weight_kg: float
    total_co2_saved_kg: float
    active_requests_count: int
    route_breakdown: List[Dict[str, Any]]
    monthly_trend: List[Dict[str, Any]]
    recent_activities: List[Dict[str, Any]]

class SampleItem(BaseModel):
    id: str
    name: str
    category: str
    image_url: str
    description: str
    quantity: int
    city: str
    lat: float
    lng: float
    expected_profile: ItemProfile
