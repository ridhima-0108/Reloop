"""
Standalone seed script for RELOOP database.
Usage: python seed.py
"""

import os
from database import init_db, DB_PATH

if __name__ == "__main__":
    if os.path.exists(DB_PATH):
        print(f"Removing existing database at {DB_PATH} for fresh reseed...")
        os.remove(DB_PATH)
    init_db()
    print("Database successfully re-seeded with 31 verified partners, 5 recovery requests, and 4 marketplace listings!")
