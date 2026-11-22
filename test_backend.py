import subprocess
import time
import urllib.request
import json
import os

backend_dir = r"C:\Users\ridhi\.gemini\antigravity\scratch\reloop\backend"

print("[Test] Starting FastAPI server on port 8000...")
proc = subprocess.Popen(
    ["python", "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"],
    cwd=backend_dir,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

time.sleep(2)

try:
    print("[Test] Probing http://127.0.0.1:8000/api/health ...")
    req = urllib.request.urlopen("http://127.0.0.1:8000/api/health", timeout=5)
    data = json.loads(req.read().decode("utf-8"))
    print(f"[Test] Health response: {data}")

    print("[Test] Probing http://127.0.0.1:8000/api/sample-items ...")
    req_samples = urllib.request.urlopen("http://127.0.0.1:8000/api/sample-items", timeout=5)
    samples = json.loads(req_samples.read().decode("utf-8"))
    print(f"[Test] Loaded {len(samples)} sample items: {[s['name'] for s in samples]}")

    print("[Test] Probing http://127.0.0.1:8000/api/impact ...")
    req_impact = urllib.request.urlopen("http://127.0.0.1:8000/api/impact", timeout=5)
    impact = json.loads(req_impact.read().decode("utf-8"))
    print(f"[Test] Impact: {impact['total_items_diverted']} items diverted, {impact['total_co2_saved_kg']} kg CO2 saved.")
except Exception as e:
    print(f"[Test] Backend probe error: {e}")
finally:
    print("[Test] Stopping FastAPI server...")
    proc.terminate()
    try:
        proc.wait(timeout=3)
    except:
        proc.kill()
    print("[Test] Backend probe complete.")
