"""
Four rich one-click sample items for RELOOP instant demo experience.
Includes clean inline vector SVG previews, rich technical descriptions,
and realistic benchmark attributes.
"""

from typing import List, Dict, Any

# Inline SVG Data URIs for instant visual rendering without external image host dependency
SAMPLE_IMAGES = {
    "tshirts": "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' width='400' height='300'><rect width='400' height='300' fill='%23f0fdf4'/><path d='M140 70 L200 110 L260 70 L320 110 L290 160 L260 145 L260 250 L140 250 L140 145 L110 160 L80 110 Z' fill='%2310b981' stroke='%23047857' stroke-width='4'/><path d='M170 70 C170 95, 230 95, 230 70' fill='none' stroke='%23047857' stroke-width='4'/><circle cx='180' cy='180' r='6' fill='%23064e3b'/><circle cx='180' cy='200' r='6' fill='%23064e3b'/><text x='200' y='285' font-family='sans-serif' font-weight='bold' font-size='16' text-anchor='middle' fill='%23065f46'>Vintage Cotton T-Shirts (Pack of 4)</text></svg>",
    "phone": "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' width='400' height='300'><rect width='400' height='300' fill='%23fef2f2'/><rect x='140' y='40' width='120' height='220' rx='20' fill='%231e293b' stroke='%23475569' stroke-width='4'/><rect x='150' y='60' width='100' height='175' rx='6' fill='%2338bdf8'/><path d='M150 120 L190 140 L170 170 L220 180 L250 160' stroke='%23ffffff' stroke-width='3' fill='none' stroke-linecap='round'/><path d='M190 140 L220 120' stroke='%23ffffff' stroke-width='2' fill='none'/><circle cx='200' cy='50' r='3' fill='%2394a3b8'/><circle cx='200' cy='248' r='5' fill='%2394a3b8'/><text x='200' y='285' font-family='sans-serif' font-weight='bold' font-size='16' text-anchor='middle' fill='%23991b1b'>OnePlus 9RT (Cracked Outer Glass)</text></svg>",
    "cardboard": "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' width='400' height='300'><rect width='400' height='300' fill='%23fffbeb'/><polygon points='200,60 300,110 200,160 100,110' fill='%23d97706' stroke='%23b45309' stroke-width='3'/><polygon points='100,110 200,160 200,240 100,190' fill='%23b45309' stroke='%2392400e' stroke-width='3'/><polygon points='200,160 300,110 300,190 200,240' fill='%23f59e0b' stroke='%23b45309' stroke-width='3'/><line x1='200' y1='60' x2='200' y2='160' stroke='%2392400e' stroke-width='2' stroke-dasharray='4,4'/><text x='200' y='280' font-family='sans-serif' font-weight='bold' font-size='16' text-anchor='middle' fill='%2392400e'>Corrugated E-Commerce Boxes (8 pcs)</text></svg>",
    "vegetable": "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' width='400' height='300'><rect width='400' height='300' fill='%23f0fdf4'/><ellipse cx='200' cy='160' rx='90' ry='60' fill='%2384cc16' stroke='%2365a30d' stroke-width='3'/><path d='M150 140 Q180 100 230 130 Q260 160 200 180 Z' fill='%23eab308'/><circle cx='170' cy='170' r='18' fill='%23ef4444'/><circle cx='230' cy='165' r='14' fill='%23a855f7'/><path d='M200 95 C190 70, 220 60, 215 50' stroke='%2315803d' stroke-width='4' fill='none'/><text x='200' y='275' font-family='sans-serif' font-weight='bold' font-size='16' text-anchor='middle' fill='%23166534'>Organic Kitchen & Coffee Scraps (2 kg)</text></svg>"
}

SAMPLE_ITEMS: List[Dict[str, Any]] = [
    {
        "id": "sample-tshirts",
        "name": "Old Cotton T-Shirts",
        "category": "textile",
        "image_url": SAMPLE_IMAGES["tshirts"],
        "description": "Pack of 4 used cotton crew-neck t-shirts. 2 are wearable with mild fading, 1 has a torn arm seam, 1 has paint stains. 100% natural fiber.",
        "quantity": 4,
        "city": "Bengaluru",
        "lat": 12.9345,
        "lng": 77.6190,
        "expected_profile": {
            "item_type": "Cotton T-Shirts (Pack of 4)",
            "material": "100% Cotton Textile",
            "condition": "fair",
            "quantity": 4,
            "confidence": 0.94,
            "recyclable": True,
            "notes": "2 pieces can be worn or resold/donated directly; 1 requires minor seam stitching; 1 is suitable for rag shredding / textile yarn recycling.",
            "estimated_weight_kg": 0.8,
            "city": "Bengaluru",
            "lat": 12.9345,
            "lng": 77.6190,
            "image_preview": SAMPLE_IMAGES["tshirts"]
        }
    },
    {
        "id": "sample-phone",
        "name": "Broken Smartphone",
        "category": "e-waste",
        "image_url": SAMPLE_IMAGES["phone"],
        "description": "OnePlus 9RT 5G (128GB Hacker Black). Front glass is cracked after drop, but AMOLED touchscreen displays colors fine. Camera, speaker, and charging port work.",
        "quantity": 1,
        "city": "Bengaluru",
        "lat": 12.9716,
        "lng": 77.5946,
        "expected_profile": {
            "item_type": "Smartphone (Cracked Screen)",
            "material": "Gorilla Glass, Aluminum Alloy Chassis, Lithium-Ion, Circuit Board",
            "condition": "broken",
            "quantity": 1,
            "confidence": 0.96,
            "recyclable": True,
            "notes": "High residual economic value. Replacing the glass screen costs ~₹1,800, restoring device value to ₹11,000+. If not repaired, authorized e-waste recovery extracts copper, gold, and rare earths.",
            "estimated_weight_kg": 0.22,
            "city": "Bengaluru",
            "lat": 12.9716,
            "lng": 77.5946,
            "image_preview": SAMPLE_IMAGES["phone"]
        }
    },
    {
        "id": "sample-cardboard",
        "name": "Cardboard Shipping Boxes",
        "category": "paper",
        "image_url": SAMPLE_IMAGES["cardboard"],
        "description": "Stack of 8 corrugated cardboard shipping boxes from Amazon & Flipkart deliveries. Clean, dry, tape removed, flattened, unsoiled fluting.",
        "quantity": 8,
        "city": "Delhi NCR",
        "lat": 28.6080,
        "lng": 77.3690,
        "expected_profile": {
            "item_type": "Corrugated Cardboard Boxes",
            "material": "Kraft Paper Pulp (Corrugated Cardboard)",
            "condition": "good",
            "quantity": 8,
            "confidence": 0.98,
            "recyclable": True,
            "notes": "High grade dry packaging. Can either be reused directly for household storage/moving, or sold to doorstep kabadiwala for ₹14-16/kg pulp recycling.",
            "estimated_weight_kg": 3.2,
            "city": "Delhi NCR",
            "lat": 28.6080,
            "lng": 77.3690,
            "image_preview": SAMPLE_IMAGES["cardboard"]
        }
    },
    {
        "id": "sample-vegetable",
        "name": "Kitchen Vegetable Scraps",
        "category": "organic",
        "image_url": SAMPLE_IMAGES["vegetable"],
        "description": "Fresh kitchen organic waste: potato peels, onion skins, cauliflower stems, tomato trimmings, and spent espresso coffee grounds. Non-cooked, no oil.",
        "quantity": 2,
        "city": "Mumbai",
        "lat": 19.0410,
        "lng": 72.8440,
        "expected_profile": {
            "item_type": "Kitchen Vegetable & Fruit Scraps",
            "material": "Organic Wet Biomass (Nitrogen-Rich)",
            "condition": "fair",
            "quantity": 2,
            "confidence": 0.95,
            "recyclable": False,
            "notes": "Ideal feed for aerobic vermicomposting or local biomethanation digester. Diverting this from landfills prevents toxic anaerobic methane emissions.",
            "estimated_weight_kg": 2.0,
            "city": "Mumbai",
            "lat": 19.0410,
            "lng": 72.8440,
            "image_preview": SAMPLE_IMAGES["vegetable"]
        }
    }
]
