"""
RELOOP Vision & AI Service
Extracts item type, material composition, visible condition, recyclability, and confidence.
Uses Gemini Vision API when GEMINI_API_KEY is available.
Includes smart heuristic Demo Mode fallback that gracefully handles missing keys or network errors,
ensuring the hackathon presentation never breaks.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Ensure .env is loaded
root_dir = Path(__file__).resolve().parent.parent
backend_dir = Path(__file__).resolve().parent
load_dotenv(backend_dir / ".env")
load_dotenv(root_dir / ".env")

import json
import base64
import re
from typing import Tuple, Dict, Any
from models import ItemProfile, ItemCondition
from sample_items import SAMPLE_ITEMS

def clean_json_response(raw_text: str) -> str:
    """Cleans markdown backticks and trims response to valid JSON."""
    text = raw_text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

def match_sample_by_text(description: str) -> Dict[str, Any]:
    """Matches known sample keywords or generates contextual estimates."""
    desc = description.lower()
    
    if any(k in desc for k in ["shirt", "cotton", "cloth", "garment", "wear", "fabric", "tee"]):
        return SAMPLE_ITEMS[0]["expected_profile"]
    elif any(k in desc for k in ["phone", "screen", "mobile", "oneplus", "iphone", "samsung", "display"]):
        return SAMPLE_ITEMS[1]["expected_profile"]
    elif any(k in desc for k in ["box", "cardboard", "carton", "corrugated", "amazon", "packaging"]):
        return SAMPLE_ITEMS[2]["expected_profile"]
    elif any(k in desc for k in ["scraps", "vegetable", "kitchen", "coffee", "fruit", "peel", "organic"]):
        return SAMPLE_ITEMS[3]["expected_profile"]
    elif any(k in desc for k in ["laptop", "computer", "macbook", "dell"]):
        return {
            "item_type": "Laptop Computer",
            "material": "Aluminum, Plastic, Copper, Lithium Battery, PCB",
            "condition": "fair",
            "quantity": 1,
            "confidence": 0.88,
            "recyclable": True,
            "notes": "Secondary value exists. Repair or refurbishment recommended over direct recycling.",
            "estimated_weight_kg": 1.8,
            "city": "Bengaluru",
            "lat": 12.9716,
            "lng": 77.5946
        }
    elif any(k in desc for k in ["book", "paper", "novel", "textbook"]):
        return {
            "item_type": "Books & Textbooks",
            "material": "Paper Pulp, Cardboard Binding",
            "condition": "good",
            "quantity": 2,
            "confidence": 0.92,
            "recyclable": True,
            "notes": "High donation or resale utility. Direct pulp recycling is a secondary fallback.",
            "estimated_weight_kg": 0.9,
            "city": "Delhi NCR",
            "lat": 28.6139,
            "lng": 77.2090
        }
    else:
        # Intelligent fallback based on description
        condition = "fair"
        if any(w in desc for w in ["broken", "cracked", "damaged", "dead"]):
            condition = "broken"
        elif any(w in desc for w in ["new", "unused", "sealed", "pristine"]):
            condition = "like_new"
        elif any(w in desc for w in ["good", "clean", "working"]):
            condition = "good"
            
        return {
            "item_type": description.strip().capitalize() if description else "Household Item",
            "material": "Composite / Mixed Material",
            "condition": condition,
            "quantity": 1,
            "confidence": 0.82,
            "recyclable": True,
            "notes": "Visual inspection indicative. User can edit material and condition details.",
            "estimated_weight_kg": 0.75,
            "city": "Bengaluru",
            "lat": 12.9716,
            "lng": 77.5946
        }

async def analyze_item_vision(
    image_base64: str = None,
    description: str = "",
    quantity: int = 1,
    city: str = "Bengaluru",
    lat: float = 12.9716,
    lng: float = 77.5946
) -> Tuple[ItemProfile, bool]:
    """
    Analyzes an item using Gemini Vision API if configured;
    falls back cleanly to robust Demo Mode heuristics if missing/failed.
    Returns: (ItemProfile, is_demo_mode)
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    
    # Check if we should attempt Gemini API
    if api_key and (image_base64 or description):
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            
            # Using current gemini models (e.g. gemini-1.5-flash or gemini-2.0-flash)
            model = genai.GenerativeModel("gemini-flash-latest")
            
            prompt = """
            You are an expert circular economy and material salvage AI inspector.
            Analyze this item and return ONLY a strict JSON object with these exact keys:
            {
              "item_type": "string (e.g. Cotton T-Shirt, Smartphone, Corrugated Box)",
              "material": "string (e.g. 100% Cotton, Aluminum & Glass, Kraft Paper, HDPE)",
              "condition": "string (one of: broken, poor, fair, good, like_new)",
              "confidence": float between 0.65 and 0.99,
              "recyclable": boolean,
              "estimated_weight_kg": float (realistic unit weight in kilograms),
              "notes": "string (1-2 sentences on salvage condition, key flaws or material purity)"
            }
            Do NOT include markdown backticks or extra commentary.
            """
            
            contents = [prompt]
            if description:
                contents.append(f"User Description/Context: {description}")
            if image_base64:
                import base64, io
                from PIL import Image

                raw_b64 = image_base64
                if "data:" in raw_b64 and ";base64," in raw_b64:
                    _, raw_b64 = raw_b64.split(";base64,", 1)
                img = Image.open(io.BytesIO(base64.b64decode(raw_b64)))
                contents.append(img)
                
            response = model.generate_content(contents)
            cleaned = clean_json_response(response.text)
            parsed = json.loads(cleaned)
            
            profile = ItemProfile(
                item_type=parsed.get("item_type", "Household Item"),
                material=parsed.get("material", "Mixed Material"),
                condition=parsed.get("condition", "fair").lower(),
                quantity=max(1, quantity),
                confidence=round(float(parsed.get("confidence", 0.88)), 2),
                recyclable=bool(parsed.get("recyclable", True)),
                notes=parsed.get("notes", "AI visual inspection completed."),
                estimated_weight_kg=round(float(parsed.get("estimated_weight_kg", 0.5)), 2),
                city=city,
                lat=lat,
                lng=lng,
                image_preview=image_base64
            )
            return profile, False # Live Gemini AI mode
            
        except Exception as e:
            print(f"[VisionService Warning] Gemini API call error: {e}. Activating Demo Mode fallback.")
            # Fall through to demo mode fallback

    # --- DEMO MODE FALLBACK ---
    mock_data = match_sample_by_text(description)
    profile = ItemProfile(
        item_type=mock_data.get("item_type", "Household Item"),
        material=mock_data.get("material", "Mixed Material"),
        condition=mock_data.get("condition", "fair"),
        quantity=max(1, quantity),
        confidence=mock_data.get("confidence", 0.91),
        recyclable=mock_data.get("recyclable", True),
        notes=mock_data.get("notes", "Demo Mode: Evaluated via circular economy heuristic benchmark."),
        estimated_weight_kg=mock_data.get("estimated_weight_kg", 0.6),
        city=city,
        lat=lat,
        lng=lng,
        image_preview=image_base64 or mock_data.get("image_preview")
    )
    return profile, True # Demo Mode
