"""
Unit verification for RELOOP Decision Engine with all 4 sample items.
"""

from sample_items import SAMPLE_ITEMS
from models import ItemProfile
from decision_engine import rank_recovery_routes

def test_samples():
    print("Testing RELOOP Decision Engine...")
    for sample in SAMPLE_ITEMS:
        print(f"\n==========================================")
        print(f"Testing Sample: {sample['name']} ({sample['category']})")
        expected = sample["expected_profile"]
        profile = ItemProfile(
            item_type=expected["item_type"],
            material=expected["material"],
            condition=expected["condition"],
            quantity=expected["quantity"],
            confidence=expected["confidence"],
            recyclable=expected["recyclable"],
            notes=expected["notes"],
            estimated_weight_kg=expected["estimated_weight_kg"],
            city=expected["city"],
            lat=expected["lat"],
            lng=expected["lng"]
        )
        rec_res = rank_recovery_routes(profile)
        print(f"Top Recommended Route: {rec_res.top_recommendation.upper()} (Score: {rec_res.recommendations[0].score}/100)")
        print(f"Indicative Value/Cost: {rec_res.recommendations[0].price_range_inr}")
        print(f"CO2 Saved: {rec_res.recommendations[0].co2_saved_kg} kg")
        print(f"Why: {rec_res.recommendations[0].why}")
        print("Comparison Breakdown:")
        for r in rec_res.recommendations:
            b = r.score_breakdown
            print(f"  - {r.title:<22} | Score: {r.score:>3}/100 | Val: {b.resale_value_score:>2} | Feas: {b.repair_feasibility_score:>2} | Local: {b.local_availability_score:>2} | Eco: {b.environmental_benefit_score:>2} | {r.price_range_inr}")

if __name__ == "__main__":
    test_samples()
