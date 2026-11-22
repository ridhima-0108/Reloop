"""
RELOOP SQLite Database & Repository Layer.
Manages persistent storage for partners, recovery requests, marketplace listings,
and computes real-time circular economy impact analytics.
Zero setup required — automatically initializes and seeds on first launch.
"""

import sqlite3
import json
import os
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from models import (
    Partner, RecoveryRequest, RequestStatus, MarketplaceListing,
    CreateRequestPayload, ImpactSummary
)
from seed_data import SEED_PARTNERS

DB_PATH = os.path.join(os.path.dirname(__file__), "reloop.db")

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes tables and seeds initial realistic demo data if empty."""
    conn = get_connection()
    cursor = conn.cursor()

    # Partners Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS partners (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        city TEXT NOT NULL,
        address TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        phone TEXT NOT NULL,
        rating REAL NOT NULL,
        reviews_count INTEGER NOT NULL,
        accepted_materials TEXT NOT NULL, -- JSON string
        pickup_available INTEGER NOT NULL,
        price_expectation TEXT NOT NULL,
        timing TEXT NOT NULL,
        verified INTEGER NOT NULL DEFAULT 1
    )
    """)

    # Recovery Requests Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS recovery_requests (
        id TEXT PRIMARY KEY,
        user_name TEXT NOT NULL,
        user_phone TEXT NOT NULL,
        user_address TEXT NOT NULL,
        item_type TEXT NOT NULL,
        material TEXT NOT NULL,
        condition TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        route TEXT NOT NULL,
        partner_id TEXT,
        partner_name TEXT,
        status TEXT NOT NULL,
        scheduled_date TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        weight_kg REAL NOT NULL,
        co2_saved_kg REAL NOT NULL
    )
    """)

    # Marketplace Listings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS marketplace_listings (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        condition TEXT NOT NULL,
        price_inr INTEGER NOT NULL,
        location TEXT NOT NULL,
        image_url TEXT,
        seller_name TEXT NOT NULL,
        seller_contact TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    conn.commit()

    # Seed Partners if table empty
    cursor.execute("SELECT COUNT(*) as count FROM partners")
    if cursor.fetchone()["count"] == 0:
        for p in SEED_PARTNERS:
            cursor.execute("""
            INSERT INTO partners (id, name, type, city, address, lat, lng, phone, rating, reviews_count, accepted_materials, pickup_available, price_expectation, timing, verified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                p["id"], p["name"], p["type"], p["city"], p["address"],
                p["lat"], p["lng"], p["phone"], p["rating"], p["reviews_count"],
                json.dumps(p["accepted_materials"]), 1 if p["pickup_available"] else 0,
                p["price_expectation"], p["timing"], 1 if p["verified"] else 0
            ))
        conn.commit()

    # Seed initial demo recovery requests if empty
    cursor.execute("SELECT COUNT(*) as count FROM recovery_requests")
    if cursor.fetchone()["count"] == 0:
        initial_requests = [
            (
                "req-101", "Priya Sharma", "+91 98451 22334", "Flat 402, Green Glen, Bellandur, Bengaluru",
                "Old Cotton T-Shirts (Pack of 4)", "100% Cotton Textile", "fair", 4, "donate",
                "blr-textile-1", "Goonj Bengaluru Dropping & Upcycling Hub",
                "Recovered", "2026-11-18", "Dignity packs prepared for distribution",
                "2026-11-17T10:30:00Z", "2026-11-19T14:20:00Z", 0.8, 3.2
            ),
            (
                "req-102", "Rahul Verma", "+91 98112 55667", "Sector 43, DLF Phase 5, Gurugram, Delhi NCR",
                "Corrugated Cardboard Boxes", "Kraft Paper Pulp", "good", 8, "recycle",
                "del-kabadi-1", "ScrapUncle Digital Doorstep Kabadi",
                "Recovered", "2026-11-19", "Doorstep electronic weigh-in: 3.4 kg pulp collected",
                "2026-11-18T12:00:00Z", "2026-11-19T16:45:00Z", 3.4, 5.44
            ),
            (
                "req-103", "Ananya Deshmukh", "+91 98203 77889", "Bandra West, Mumbai",
                "Kitchen Vegetable & Fruit Scraps", "Organic Wet Biomass", "fair", 2, "compost",
                "mum-compost-1", "RUR GreenLife Wet Waste Composting Center",
                "Collected", "2026-11-21", "Loaded into aerobic bin #4",
                "2026-11-20T08:15:00Z", "2026-11-21T11:00:00Z", 2.0, 1.5
            ),
            (
                "req-104", "Vikram Sen", "+91 98765 43210", "Indiranagar, Bengaluru",
                "Smartphone (Cracked Screen)", "Gorilla Glass, Aluminum Alloy", "broken", 1, "repair",
                "blr-repair-1", "SP Road Micro-Electronics & Chip Repair",
                "Scheduled", "2026-11-22", "Technician visit booked for display glass replacement",
                "2026-11-21T15:40:00Z", "2026-11-21T15:40:00Z", 0.22, 16.5
            ),
            (
                "req-105", "Deepak Rao", "+91 94480 11223", "Koramangala 4th Block, Bengaluru",
                "Dell 24-inch IPS Monitor", "ABS Plastic, Electronics", "fair", 1, "resell",
                "blr-resale-1", "Cashify Kiosk - Forum Mall Koramangala",
                "Requested", "2026-11-23", "Awaiting doorstep inspection",
                "2026-11-21T17:10:00Z", "2026-11-21T17:10:00Z", 3.8, 22.8
            )
        ]
        cursor.executemany("""
        INSERT INTO recovery_requests VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, initial_requests)
        conn.commit()

    # Seed marketplace listings if empty
    cursor.execute("SELECT COUNT(*) as count FROM marketplace_listings")
    if cursor.fetchone()["count"] == 0:
        initial_listings = [
            (
                "mkt-201", "Vintage Levi's Trucker Denim Jacket",
                "Pure cotton washed indigo jacket in great condition. Minor vintage fade, all brass buttons intact. Washed and sanitized.",
                "Textiles", "good", 650, "Indiranagar, Bengaluru",
                "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80",
                "Kavita Nair", "+91 98450 44211", "2026-11-20T11:00:00Z"
            ),
            (
                "mkt-202", "Dell UltraSharp 24'' Full HD IPS Monitor",
                "Fully functional monitor with HDMI/DisplayPort. Screen has zero dead pixels. Includes power cable and stand.",
                "Electronics", "good", 3200, "HSR Layout, Bengaluru",
                "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
                "Arjun Mehta", "+91 97312 33901", "2026-11-19T14:30:00Z"
            ),
            (
                "mkt-203", "Solid Sheesham Wood Study Chair",
                "Handcrafted wooden chair with cushioned seat. Sturdy joints, slight scratch on armrest buffed out.",
                "Furniture", "fair", 850, "South Extension, Delhi NCR",
                "https://images.unsplash.com/photo-1580481077195-c22ae4534782?w=600&auto=format&fit=crop&q=80",
                "Rohit Chadha", "+91 98110 88219", "2026-11-18T16:00:00Z"
            ),
            (
                "mkt-204", "Engineering & Computer Science Textbooks (Set of 4)",
                "CLRS Algorithms, Operating Systems Concepts, and Clean Code. Clean pages, no highlights.",
                "Books", "good", 450, "Parel, Mumbai",
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
                "Siddharth Joshi", "+91 98200 11984", "2026-11-17T09:20:00Z"
            )
        ]
        cursor.executemany("""
        INSERT INTO marketplace_listings VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, initial_listings)
        conn.commit()

    conn.close()

def list_partners(
    city: Optional[str] = None,
    material: Optional[str] = None,
    partner_type: Optional[str] = None
) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM partners WHERE 1=1"
    params = []

    if city and city.lower() != "all":
        query += " AND LOWER(city) = LOWER(?)"
        params.append(city)
    if partner_type and partner_type.lower() != "all":
        query += " AND type = ?"
        params.append(partner_type)

    cursor.execute(query, params)
    rows = cursor.fetchall()
    results = []

    for row in rows:
        p = dict(row)
        p["accepted_materials"] = json.loads(p["accepted_materials"])
        p["pickup_available"] = bool(p["pickup_available"])
        p["verified"] = bool(p["verified"])
        
        # Filter by material if specified
        if material and material.lower() != "all":
            mat_lower = material.lower()
            if not any(mat_lower in m.lower() or m.lower() in mat_lower for m in p["accepted_materials"]):
                continue
        results.append(p)

    conn.close()
    return results

def get_partner(partner_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM partners WHERE id = ?", (partner_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        p = dict(row)
        p["accepted_materials"] = json.loads(p["accepted_materials"])
        p["pickup_available"] = bool(p["pickup_available"])
        p["verified"] = bool(p["verified"])
        return p
    return None

def create_recovery_request(payload: CreateRequestPayload) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    req_id = f"req-{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc).isoformat()

    cursor.execute("""
    INSERT INTO recovery_requests VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        req_id, payload.user_name, payload.user_phone, payload.user_address,
        payload.item_type, payload.material, payload.condition, payload.quantity,
        payload.route.value, payload.partner_id, payload.partner_name,
        RequestStatus.REQUESTED.value, payload.scheduled_date or "Next Business Day",
        payload.notes, now, now, payload.estimated_weight_kg or 1.0, payload.co2_saved_kg or 2.0
    ))
    conn.commit()
    conn.close()
    return get_recovery_request(req_id)

def get_recovery_request(req_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM recovery_requests WHERE id = ?", (req_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def list_recovery_requests() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM recovery_requests ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_request_status(req_id: str, new_status: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
    UPDATE recovery_requests
    SET status = ?, updated_at = ?
    WHERE id = ?
    """, (new_status, now, req_id))
    conn.commit()
    conn.close()
    return get_recovery_request(req_id)

def list_marketplace_listings(category: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM marketplace_listings"
    params = []
    if category and category.lower() != "all":
        query += " WHERE LOWER(category) = LOWER(?)"
        params.append(category)
    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def create_marketplace_listing(listing: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    mkt_id = f"mkt-{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
    INSERT INTO marketplace_listings VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        mkt_id, listing["title"], listing["description"], listing.get("category", "General"),
        listing.get("condition", "good"), listing["price_inr"], listing.get("location", "Bengaluru"),
        listing.get("image_url"), listing["seller_name"], listing["seller_contact"], now
    ))
    conn.commit()
    conn.close()
    return {**listing, "id": mkt_id, "created_at": now}

def get_impact_analytics() -> ImpactSummary:
    conn = get_connection()
    cursor = conn.cursor()

    # Aggregate diverted
    cursor.execute("""
    SELECT 
        COUNT(*) as total_items,
        COALESCE(SUM(weight_kg), 0) as total_weight,
        COALESCE(SUM(co2_saved_kg), 0) as total_co2
    FROM recovery_requests
    WHERE status IN ('Collected', 'Recovered')
    """)
    totals = cursor.fetchone()

    # Active requests count
    cursor.execute("""
    SELECT COUNT(*) as active_count
    FROM recovery_requests
    WHERE status IN ('Requested', 'Scheduled')
    """)
    active_count = cursor.fetchone()["active_count"]

    # Route breakdown
    cursor.execute("""
    SELECT route, COUNT(*) as count, COALESCE(SUM(co2_saved_kg), 0) as co2_kg, COALESCE(SUM(weight_kg), 0) as weight_kg
    FROM recovery_requests
    GROUP BY route
    """)
    breakdown_rows = cursor.fetchall()
    route_breakdown = [dict(r) for r in breakdown_rows]

    # Recent activities
    cursor.execute("""
    SELECT id, user_name, item_type, route, status, weight_kg, co2_saved_kg, updated_at
    FROM recovery_requests
    ORDER BY updated_at DESC
    LIMIT 6
    """)
    recent_activities = [dict(r) for r in cursor.fetchall()]

    conn.close()

    # Mock historical monthly progression for recharts
    monthly_trend = [
        {"month": "Jun", "items": 14, "co2_kg": 42.5, "weight_kg": 28.0},
        {"month": "Jul", "items": 26, "co2_kg": 85.0, "weight_kg": 52.0},
        {"month": "Aug", "items": 48, "co2_kg": 145.2, "weight_kg": 98.4},
        {"month": "Sep", "items": 72, "co2_kg": 230.8, "weight_kg": 140.2},
        {"month": "Oct", "items": 110, "co2_kg": 380.0, "weight_kg": 215.5},
        {"month": "Nov", "items": 165, "co2_kg": 542.0, "weight_kg": 312.8}
    ]

    return ImpactSummary(
        total_items_diverted=totals["total_items"] + 158, # combined with baseline
        total_weight_kg=round(totals["total_weight"] + 302.5, 1),
        total_co2_saved_kg=round(totals["total_co2"] + 524.0, 1),
        active_requests_count=active_count,
        route_breakdown=route_breakdown,
        monthly_trend=monthly_trend,
        recent_activities=recent_activities
    )
