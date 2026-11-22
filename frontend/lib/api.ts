/**
 * RELOOP API Client
 * Connects Next.js frontend to Python FastAPI backend
 */

// In production on Vercel, /api/* is rewritten to the backend service by vercel.json,
// so we use a relative base (""). Locally, Next.js dev server proxies don't apply, so
// we fall back to the FastAPI dev server at localhost:8000.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? ""
    : "http://localhost:8000");

export interface ItemProfile {
  item_type: string;
  material: string;
  condition: "broken" | "poor" | "fair" | "good" | "like_new" | string;
  quantity: number;
  confidence: number;
  recyclable: boolean;
  notes: string;
  estimated_weight_kg: number;
  city: string;
  lat: number;
  lng: number;
  image_preview?: string;
}

export interface ScoreBreakdown {
  resale_value_score: number;
  repair_feasibility_score: number;
  local_availability_score: number;
  environmental_benefit_score: number;
  total_score: number;
  factor_notes: string;
}

export interface RouteRecommendation {
  route: "repair" | "reuse" | "resell" | "donate" | "compost" | "recycle";
  title: string;
  rank: number;
  score: number;
  score_breakdown: ScoreBreakdown;
  price_range_inr: string;
  indicative_value_inr: number;
  co2_saved_kg: number;
  why: string;
  instructions: string[];
  feasibility: "High" | "Medium" | "Low" | string;
  is_recommended: boolean;
  action_type: "pickup" | "dropoff" | "sell_listing" | "diy_repair" | string;
}

export interface RecommendationResponse {
  item_profile: ItemProfile;
  recommendations: RouteRecommendation[];
  top_recommendation: string;
  summary_explanation: string;
  is_demo_mode: boolean;
}

export interface Partner {
  id: string;
  name: string;
  type: "kabadiwala" | "ewaste_recycler" | "textile_collector" | "repair_shop" | "composter" | "resale_buyer" | string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  rating: number;
  reviews_count: number;
  accepted_materials: string[];
  pickup_available: boolean;
  price_expectation: string;
  timing: string;
  verified: boolean;
  distance_km?: number;
}

export interface RecoveryRequest {
  id: string;
  user_name: string;
  user_phone: string;
  user_address: string;
  item_type: string;
  material: string;
  condition: string;
  quantity: number;
  route: string;
  partner_id?: string;
  partner_name?: string;
  status: "Requested" | "Scheduled" | "Collected" | "Recovered";
  scheduled_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  weight_kg: number;
  co2_saved_kg: number;
}

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  price_inr: number;
  location: string;
  image_url?: string;
  seller_name: string;
  seller_contact: string;
  created_at: string;
}

export interface ImpactSummary {
  total_items_diverted: number;
  total_weight_kg: number;
  total_co2_saved_kg: number;
  active_requests_count: number;
  route_breakdown: Array<{ route: string; count: number; co2_kg: number; weight_kg: number }>;
  monthly_trend: Array<{ month: string; items: number; co2_kg: number; weight_kg: number }>;
  recent_activities: Array<{
    id: string;
    user_name: string;
    item_type: string;
    route: string;
    status: string;
    weight_kg: number;
    co2_saved_kg: number;
    updated_at: string;
  }>;
}

export interface SampleItem {
  id: string;
  name: string;
  category: string;
  image_url: string;
  description: string;
  quantity: number;
  city: string;
  lat: number;
  lng: number;
  expected_profile: ItemProfile;
}

export async function fetchHealth(): Promise<{ status: string; mode: string; gemini_api_configured: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (!res.ok) throw new Error("Health check failed");
    return await res.json();
  } catch (e) {
    return { status: "offline", mode: "demo", gemini_api_configured: false };
  }
}

export async function getSampleItems(): Promise<SampleItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/sample-items`);
  if (!res.ok) throw new Error("Failed to load sample items");
  return await res.json();
}

export async function analyzeItem(payload: {
  image_base64?: string;
  description?: string;
  quantity?: number;
  location_city?: string;
  lat?: number;
  lng?: number;
}): Promise<{ item_profile: ItemProfile; is_demo_mode: boolean }> {
  const res = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Analysis failed");
  return await res.json();
}

export async function getRecommendations(profile: ItemProfile): Promise<RecommendationResponse> {
  const res = await fetch(`${API_BASE_URL}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error("Failed to generate recommendations");
  return await res.json();
}

export async function getPartners(params?: {
  city?: string;
  material?: string;
  type?: string;
  lat?: number;
  lng?: number;
}): Promise<Partner[]> {
  const q = new URLSearchParams();
  if (params?.city) q.set("city", params.city);
  if (params?.material) q.set("material", params.material);
  if (params?.type) q.set("type", params.type);
  if (params?.lat) q.set("lat", params.lat.toString());
  if (params?.lng) q.set("lng", params.lng.toString());

  const res = await fetch(`${API_BASE_URL}/api/partners?${q.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch partners");
  return await res.json();
}

export async function createBooking(payload: {
  user_name: string;
  user_phone: string;
  user_address: string;
  item_type: string;
  material: string;
  condition: string;
  quantity: number;
  route: string;
  partner_id?: string;
  partner_name?: string;
  scheduled_date?: string;
  notes?: string;
  estimated_weight_kg?: number;
  co2_saved_kg?: number;
}): Promise<RecoveryRequest> {
  const res = await fetch(`${API_BASE_URL}/api/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Booking failed");
  return await res.json();
}

export async function getBookings(): Promise<RecoveryRequest[]> {
  const res = await fetch(`${API_BASE_URL}/api/requests`);
  if (!res.ok) throw new Error("Failed to load recovery requests");
  return await res.json();
}

export async function updateRequestStatus(
  requestId: string,
  status: "Requested" | "Scheduled" | "Collected" | "Recovered"
): Promise<RecoveryRequest> {
  const res = await fetch(`${API_BASE_URL}/api/requests/${requestId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return await res.json();
}

export async function getMarketplaceListings(category?: string): Promise<MarketplaceListing[]> {
  const q = category ? `?category=${encodeURIComponent(category)}` : "";
  const res = await fetch(`${API_BASE_URL}/api/marketplace${q}`);
  if (!res.ok) throw new Error("Failed to load marketplace listings");
  return await res.json();
}

export async function createMarketplaceListing(listing: Partial<MarketplaceListing>): Promise<MarketplaceListing> {
  const res = await fetch(`${API_BASE_URL}/api/marketplace`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(listing),
  });
  if (!res.ok) throw new Error("Failed to create listing");
  return await res.json();
}

export async function getImpactMetrics(): Promise<ImpactSummary> {
  const res = await fetch(`${API_BASE_URL}/api/impact`);
  if (!res.ok) throw new Error("Failed to load impact metrics");
  return await res.json();
}
