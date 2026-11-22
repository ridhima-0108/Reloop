"""
RELOOP Hybrid Decision Engine
Scores and ranks recovery routes (repair, reuse, resell, donate, compost, recycle)
based on multi-criteria analysis:
1. Resale Value Potential (0-25)
2. Feasibility & Physical Condition (0-25)
3. Local Availability & Partner Distance (0-25)
4. Environmental Carbon & Hierarchy Benefit (0-25)

Produces transparent score breakdowns, indicative INR pricing, CO2 estimates,
and actionable step-by-step instructions.
"""

import math
from typing import List, Dict, Any, Tuple
from models import (
    RouteType, ItemCondition, ScoreBreakdown, RouteRecommendation,
    ItemProfile, RecommendationResponse
)
from seed_data import ITEM_BENCHMARKS, SEED_PARTNERS

def calculate_distance_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Haversine distance in kilometers."""
    R = 6371.0 # Earth radius
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlng / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def find_item_benchmark(item_type: str, material: str) -> Dict[str, Any]:
    """Finds best matching benchmark or provides an intelligent default."""
    search_str = f"{item_type} {material}".lower()
    
    # Priority 1: Wet waste / Organic
    if any(k in search_str for k in ["vegetable", "fruit", "kitchen", "food waste", "peel", "coffee ground", "wet waste", "organic"]):
        return ITEM_BENCHMARKS["vegetable scraps / kitchen waste"]

    # Priority 2: Corrugated / Cardboard / Paper
    if any(k in search_str for k in ["cardboard", "carton", "corrugated", "shipping box", "amazon box"]):
        return ITEM_BENCHMARKS["cardboard boxes"]
    if any(k in search_str for k in ["newspaper", "paper pulp", "newsprint", "magazine"]):
        return ITEM_BENCHMARKS["newspapers"]
    if any(k in search_str for k in ["book", "textbook", "novel"]):
        return ITEM_BENCHMARKS["books / textbooks"]

    # Priority 3: Electronics / E-waste
    if any(k in search_str for k in ["phone", "mobile", "smartphone", "iphone", "oneplus", "samsung", "android"]):
        return ITEM_BENCHMARKS["smartphone"]
    if any(k in search_str for k in ["laptop", "macbook", "thinkpad", "notebook"]):
        return ITEM_BENCHMARKS["laptop"]
    if any(k in search_str for k in ["tablet", "ipad"]):
        return ITEM_BENCHMARKS["tablet / ipad"]
    if any(k in search_str for k in ["monitor", "display", "screen"]):
        return ITEM_BENCHMARKS["computer monitor"]
    if any(k in search_str for k in ["charger", "cable", "wire", "adapter"]):
        return ITEM_BENCHMARKS["charger / cable"]
    if any(k in search_str for k in ["headphone", "earbud", "earphone"]):
        return ITEM_BENCHMARKS["headphones / earbuds"]

    # Priority 4: Textiles / Garments
    if any(k in search_str for k in ["shirt", "t-shirt", "cloth", "garment", "fabric", "textile", "cotton"]):
        return ITEM_BENCHMARKS["cotton t-shirt"]
    if any(k in search_str for k in ["jean", "denim", "trouser", "pant"]):
        return ITEM_BENCHMARKS["jeans / denim"]
    if any(k in search_str for k in ["jacket", "coat", "winterwear", "sweater"]):
        return ITEM_BENCHMARKS["winter jacket / coat"]

    # Priority 5: Plastics
    if any(k in search_str for k in ["pet bottle", "plastic bottle", "water bottle"]):
        return ITEM_BENCHMARKS["plastic pet bottles"]
    if any(k in search_str for k in ["hdpe", "container", "bucket", "hard plastic"]):
        return ITEM_BENCHMARKS["hard plastic container / bucket"]

    # Priority 6: Metals
    if any(k in search_str for k in ["copper", "brass"]):
        return ITEM_BENCHMARKS["copper utensils / wire"]
    if any(k in search_str for k in ["can", "aluminum", "tin"]):
        return ITEM_BENCHMARKS["aluminum beverage cans"]
    if any(k in search_str for k in ["steel", "iron", "metal scrap"]):
        return ITEM_BENCHMARKS["steel utensils / scrap"]

    # Priority 7: Furniture & Footwear
    if any(k in search_str for k in ["chair", "stool"]):
        return ITEM_BENCHMARKS["wooden chair"]
    if any(k in search_str for k in ["table", "desk"]):
        return ITEM_BENCHMARKS["office desk / table"]
    if any(k in search_str for k in ["shoe", "sneaker", "footwear"]):
        return ITEM_BENCHMARKS["sneakers / running shoes"]
    if any(k in search_str for k in ["backpack", "bag", "luggage"]):
        return ITEM_BENCHMARKS["backpack"]
    if any(k in search_str for k in ["glass bottle", "jar"]):
        return ITEM_BENCHMARKS["glass bottles / jars"]
        
    # Generic dry recyclable fallback
    return {
        "category": "dry_scrap",
        "material": material or "Mixed",
        "avg_weight_kg": 0.5,
        "co2_factor_kg_per_kg": 2.0,
        "resale_range_inr": (20, 150),
        "scrap_rate_per_kg_inr": 15,
        "repair_cost_range_inr": (50, 150),
        "primary_routes": ["reuse", "recycle", "donate"],
        "repairable": False,
        "compostable": False
    }

def get_matching_local_partners(city: str, lat: float, lng: float, route: RouteType, material: str) -> List[Dict[str, Any]]:
    """Filters partners by city, route affinity, and calculates distances."""
    route_to_partner_types = {
        RouteType.REPAIR: ["repair_shop"],
        RouteType.REUSE: ["resale_buyer", "kabadiwala"],
        RouteType.RESELL: ["resale_buyer"],
        RouteType.DONATE: ["textile_collector"],
        RouteType.COMPOST: ["composter"],
        RouteType.RECYCLE: ["kabadiwala", "ewaste_recycler", "textile_collector"]
    }
    
    target_types = route_to_partner_types.get(route, ["kabadiwala"])
    matches = []
    
    for partner in SEED_PARTNERS:
        if partner["city"].lower() == city.lower() or city.lower() in partner["city"].lower():
            if partner["type"] in target_types:
                dist = calculate_distance_km(lat, lng, partner["lat"], partner["lng"])
                partner_copy = dict(partner)
                partner_copy["distance_km"] = dist
                matches.append(partner_copy)
                
    matches.sort(key=lambda x: x["distance_km"])
    return matches

def score_route(
    route: RouteType,
    profile: ItemProfile,
    benchmark: Dict[str, Any],
    nearby_partners: List[Dict[str, Any]]
) -> RouteRecommendation:
    """Computes transparent 4-factor scoring for a given route."""
    cond = profile.condition.lower()
    qty = max(1, profile.quantity)
    weight_kg = profile.estimated_weight_kg * qty
    is_organic = benchmark.get("compostable", False) or "organic" in profile.material.lower() or "vegetable" in profile.item_type.lower()
    is_ewaste = benchmark.get("category") == "e-waste" or "electronics" in profile.item_type.lower() or "phone" in profile.item_type.lower()
    is_textile = benchmark.get("category") == "textile" or "cotton" in profile.material.lower() or "cloth" in profile.item_type.lower()

    # 1. RESALE VALUE SCORE (0-25)
    resale_score = 0
    indicative_val = 0
    price_range_str = "₹0"
    
    if route == RouteType.RESELL:
        if is_organic:
            resale_score = 0
            price_range_str = "Not sellable"
        elif cond in ["like_new", "good"]:
            resale_score = 24 if cond == "like_new" else 20
            low, high = benchmark["resale_range_inr"]
            indicative_val = int(((low + high) / 2) * qty)
            price_range_str = f"₹{low * qty:,} - ₹{high * qty:,}"
        elif cond == "fair":
            resale_score = 13
            low, high = benchmark["resale_range_inr"]
            indicative_val = int((low * 0.8) * qty)
            price_range_str = f"₹{int(low * 0.6 * qty):,} - ₹{int(low * 1.2 * qty):,}"
        elif cond == "broken":
            if is_ewaste:
                # E-waste for parts / scrap
                resale_score = 10
                low, high = benchmark["resale_range_inr"]
                salvage_val = max(300, int(low * 0.25 * qty))
                indicative_val = salvage_val
                price_range_str = f"₹{int(salvage_val * 0.7):,} - ₹{int(salvage_val * 1.3):,} (Parts)"
            else:
                resale_score = 2
                price_range_str = "Negligible (< ₹50)"
        else: # poor
            resale_score = 4
            price_range_str = "Very low (< ₹100)"

    elif route == RouteType.REPAIR:
        if benchmark.get("repairable", False) and cond in ["broken", "poor", "fair"]:
            resale_score = 22 # Restores high potential asset value
            r_low, r_high = benchmark.get("repair_cost_range_inr", (100, 300))
            v_low, v_high = benchmark["resale_range_inr"]
            restored_value = int((v_low + v_high) / 2)
            indicative_val = restored_value - int((r_low + r_high) / 2)
            price_range_str = f"Estimated repair cost: ₹{r_low:,} - ₹{r_high:,} (Adds ₹{restored_value:,} value)"
        else:
            resale_score = 3
            price_range_str = "Repair economically unviable"

    elif route == RouteType.RECYCLE:
        scrap_rate = benchmark.get("scrap_rate_per_kg_inr", 15)
        scrap_total = int(scrap_rate * weight_kg)
        if scrap_total > 500:
            resale_score = 18
        elif scrap_total > 100:
            resale_score = 14
        elif scrap_total > 20:
            resale_score = 9
        else:
            resale_score = 4
        indicative_val = max(10, scrap_total)
        price_range_str = f"₹{max(10, int(scrap_total * 0.8)):,} - ₹{int(scrap_total * 1.2):,} (₹{scrap_rate}/kg)"

    elif route == RouteType.REUSE:
        # Avoided purchase value
        avoided_low, avoided_high = benchmark["resale_range_inr"]
        indicative_val = int((avoided_low + avoided_high) / 2 * qty)
        resale_score = 17 if cond in ["good", "fair", "like_new"] else 8
        price_range_str = f"₹{avoided_low * qty:,} - ₹{avoided_high * qty:,} (Avoided purchase)"

    elif route == RouteType.DONATE:
        resale_score = 12 # Social valuation / 80G tax benefit
        indicative_val = 0
        price_range_str = "₹0 (Charity 80G tax exemption / social impact)"

    elif route == RouteType.COMPOST:
        if is_organic:
            resale_score = 14 # Compost value
            indicative_val = int(15 * weight_kg)
            price_range_str = f"Yields ~{round(weight_kg * 0.25, 1)} kg high-grade vermicompost"
        else:
            resale_score = 0
            price_range_str = "Non-compostable material"

    # 2. FEASIBILITY SCORE (0-25)
    feasibility_score = 0
    feasibility_label = "Medium"
    
    if route == RouteType.REPAIR:
        if not benchmark.get("repairable", False) or is_organic:
            feasibility_score = 0
            feasibility_label = "Low"
        elif cond == "broken":
            feasibility_score = 23 # Exactly what broken repairable items need!
            feasibility_label = "High"
        elif cond in ["poor", "fair"]:
            feasibility_score = 21
            feasibility_label = "High"
        else: # like_new or good
            feasibility_score = 5 # Doesn't need repair
            feasibility_label = "Low"

    elif route == RouteType.REUSE:
        if is_organic:
            feasibility_score = 6
            feasibility_label = "Low"
        elif cond in ["like_new", "good"]:
            feasibility_score = 24
            feasibility_label = "High"
        elif cond == "fair":
            feasibility_score = 20
            feasibility_label = "High"
        else:
            feasibility_score = 8
            feasibility_label = "Low"

    elif route == RouteType.RESELL:
        if is_organic:
            feasibility_score = 0
            feasibility_label = "Low"
        elif cond in ["like_new", "good"]:
            feasibility_score = 23
            feasibility_label = "High"
        elif cond == "fair":
            feasibility_score = 16
            feasibility_label = "Medium"
        elif cond == "broken" and is_ewaste:
            feasibility_score = 14 # Sell for scrap/parts
            feasibility_label = "Medium"
        else:
            feasibility_score = 5
            feasibility_label = "Low"

    elif route == RouteType.DONATE:
        if is_organic:
            feasibility_score = 0
            feasibility_label = "Low"
        elif cond in ["like_new", "good", "fair"]:
            feasibility_score = 24
            feasibility_label = "High"
        else:
            feasibility_score = 4 # NGOs don't accept broken/torn trash
            feasibility_label = "Low"

    elif route == RouteType.COMPOST:
        if is_organic or benchmark.get("compostable", False):
            feasibility_score = 25
            feasibility_label = "High"
        else:
            feasibility_score = 0
            feasibility_label = "Low"

    elif route == RouteType.RECYCLE:
        if profile.recyclable:
            feasibility_score = 24
            feasibility_label = "High"
        else:
            feasibility_score = 5
            feasibility_label = "Low"

    # 3. LOCAL AVAILABILITY SCORE (0-25)
    # Check verified partners within driving/pickup distance
    availability_score = 5 # baseline
    partner_count = len(nearby_partners)
    has_doorstep_pickup = any(p.get("pickup_available", False) for p in nearby_partners)
    
    if partner_count >= 3:
        availability_score = 21
    elif partner_count >= 1:
        availability_score = 16
    else:
        availability_score = 8
        
    if has_doorstep_pickup:
        availability_score = min(25, availability_score + 4)
        
    if route == RouteType.REUSE: # DIY reuse is always locally possible at home!
        availability_score = max(availability_score, 23)

    # 4. ENVIRONMENTAL CARBON BENEFIT (0-25)
    # Circular Economy hierarchy: Reuse > Repair > Resell/Donate > Recycle > Compost > Landfill
    base_co2_factor = benchmark.get("co2_factor_kg_per_kg", 2.0)
    co2_saved = round(weight_kg * base_co2_factor, 2)
    
    if route == RouteType.REUSE:
        env_score = 25
        co2_saved = round(co2_saved * 1.2, 2) # avoids new manufacturing completely
    elif route == RouteType.REPAIR:
        env_score = 24
        co2_saved = round(co2_saved * 1.15, 2)
    elif route == RouteType.RESELL or route == RouteType.DONATE:
        env_score = 23
        co2_saved = round(co2_saved * 1.1, 2)
    elif route == RouteType.RECYCLE:
        env_score = 19
        co2_saved = round(co2_saved * 0.85, 2) # processing has some footprint
    elif route == RouteType.COMPOST:
        if is_organic:
            env_score = 24
            co2_saved = round(weight_kg * 0.75, 2) # avoids methane from anaerobic landfill
        else:
            env_score = 0
            co2_saved = 0.0
    else:
        env_score = 10

    # Total Score calculation
    total_score = min(100, max(5, resale_score + feasibility_score + availability_score + env_score))

    # Route title, explanation, and action instructions
    why, instructions, action_type, factor_notes = generate_route_details(
        route=route,
        item_type=profile.item_type,
        cond=cond,
        total_score=total_score,
        resale_score=resale_score,
        feasibility_score=feasibility_score,
        avail_score=availability_score,
        env_score=env_score,
        price_str=price_range_str,
        co2_kg=co2_saved,
        nearby_count=partner_count
    )

    breakdown = ScoreBreakdown(
        resale_value_score=resale_score,
        repair_feasibility_score=feasibility_score,
        local_availability_score=availability_score,
        environmental_benefit_score=env_score,
        total_score=total_score,
        factor_notes=factor_notes
    )

    return RouteRecommendation(
        route=route,
        title=get_route_display_title(route),
        rank=1, # sorted later
        score=total_score,
        score_breakdown=breakdown,
        price_range_inr=price_range_str,
        indicative_value_inr=indicative_val,
        co2_saved_kg=co2_saved,
        why=why,
        instructions=instructions,
        feasibility=feasibility_label,
        action_type=action_type
    )

def get_route_display_title(route: RouteType) -> str:
    titles = {
        RouteType.REPAIR: "Repair & Restore",
        RouteType.REUSE: "Repurpose & Reuse",
        RouteType.RESELL: "Resell for Cash",
        RouteType.DONATE: "Donate to Community",
        RouteType.COMPOST: "Compost & Regenerate",
        RouteType.RECYCLE: "Material Recycling"
    }
    return titles.get(route, route.value.capitalize())

def generate_route_details(
    route: RouteType,
    item_type: str,
    cond: str,
    total_score: int,
    resale_score: int,
    feasibility_score: int,
    avail_score: int,
    env_score: int,
    price_str: str,
    co2_kg: float,
    nearby_count: int
) -> Tuple[str, List[str], str, str]:
    """Generates human-readable 'why', step-by-step instructions, action type, and factor breakdown."""
    
    factor_notes = (
        f"Value: {resale_score}/25 | Feasibility: {feasibility_score}/25 | "
        f"Local Access: {avail_score}/25 | Carbon Benefit: {env_score}/25"
    )

    if route == RouteType.REPAIR:
        why = f"Replacing or servicing damaged parts unlocks highest residual economic utility while saving {co2_kg} kg embodied CO2."
        instructions = [
            "Take clear photos of the damage / malfunction for the technician.",
            "Compare free quotes with top verified repair centers on your map.",
            "Backup personal data if electronic, or request a diagnostic check first.",
            "Once repaired, keep the invoice and enjoy an extended lifecycle."
        ]
        action_type = "diy_repair" if cond == "fair" else "dropoff"

    elif route == RouteType.RESELL:
        why = f"Strong secondary market demand for this category in {cond} condition. Indicative payout: {price_str}."
        instructions = [
            "Wipe clean and remove any dust, stickers, or previous user data.",
            "Take 3 bright photos: front, back, and any visible flaws.",
            "Publish directly on the RELOOP Marketplace or request instant pickup from a verified resale partner.",
            "Receive instant UPI payment upon doorstep handoff."
        ]
        action_type = "sell_listing"

    elif route == RouteType.REUSE:
        why = f"Direct reuse at home or work yields maximum circular efficiency, zero carbon logistics, and avoids replacement costs."
        instructions = [
            "Inspect item cleanliness and suitability for secondary household roles.",
            "Repurpose for organization, workshop storage, or creative upcycling.",
            "If textiles, cut stained garments into lint-free cleaning rags.",
            "Share with family members or flatmates before discarding."
        ]
        action_type = "diy_repair"

    elif route == RouteType.DONATE:
        why = f"Quality condition is ideal for grassroots charitable initiatives, providing essential dignity packs to underprivileged families."
        instructions = [
            "Wash and fold textiles, or check electronics for basic functionality.",
            "Pack into a dry bag and label with quantity.",
            "Schedule a doorstep donation pickup with certified NGO partners like Goonj.",
            "Collect your 80G tax receipt and verified recovery badge."
        ]
        action_type = "pickup"

    elif route == RouteType.COMPOST:
        why = f"Biological nutrient cycle return. Diverting wet biomass from landfills avoids methane gas formation and regenerates soil."
        instructions = [
            "Chop large peelings and organic trimmings into smaller 1-inch pieces.",
            "Mix with dry carbon browns (shredded cardboard, dry leaves, or sawdust) in a 1:2 ratio.",
            "Deposit in your home aerated compost pot or drop at the nearest community bio-digester.",
            "Harvest nutrient-packed vermicompost in 4-6 weeks."
        ]
        action_type = "dropoff"

    elif route == RouteType.RECYCLE:
        why = f"Reliable closed-loop material recovery. {nearby_count} local kabadiwalas/recyclers accept this material with doorstep weighing."
        instructions = [
            "Keep dry and clean; separate from wet kitchen waste.",
            "Bundle or flatten to minimize pickup volume.",
            "Request doorstep collection from our certified kabadiwala network.",
            "Verify weight on digital Bluetooth scale and receive instant UPI cash."
        ]
        action_type = "pickup"

    else:
        why = f"Alternative recovery pathway based on material composition."
        instructions = ["Follow municipal segregation guidelines.", "Keep separated from toxic waste."]
        action_type = "dropoff"

    return why, instructions, action_type, factor_notes

def rank_recovery_routes(
    profile: ItemProfile,
    llm_explanation: str = None
) -> RecommendationResponse:
    """Ranks all 6 recovery routes and flags the clear winner with transparent comparisons."""
    benchmark = find_item_benchmark(profile.item_type, profile.material)
    
    recommendations: List[RouteRecommendation] = []
    
    for route in RouteType:
        nearby_partners = get_matching_local_partners(
            city=profile.city,
            lat=profile.lat or 12.9716,
            lng=profile.lng or 77.5946,
            route=route,
            material=profile.material
        )
        rec = score_route(route, profile, benchmark, nearby_partners)
        recommendations.append(rec)
        
    # Sort descending by total score
    recommendations.sort(key=lambda x: x.score, reverse=True)
    
    # Assign ranks and flag top recommendation
    for idx, rec in enumerate(recommendations):
        rec.rank = idx + 1
        if idx == 0:
            rec.is_recommended = True
            
    top_route = recommendations[0].route
    runner_up = recommendations[1]
    
    # Concise, punchy summary explaining the clear differentiator
    summary = (
        f"RELOOP Decision Engine prioritized {recommendations[0].title} with a score of {recommendations[0].score}/100 "
        f"over {runner_up.title} ({runner_up.score}/100). "
        f"Key factor: {recommendations[0].why}"
    )
    if llm_explanation:
        summary = f"{summary} | AI Insights: {llm_explanation}"

    return RecommendationResponse(
        item_profile=profile,
        recommendations=recommendations,
        top_recommendation=top_route,
        summary_explanation=summary,
        is_demo_mode=False
    )
