import subprocess
import time
import urllib.request
import os
import signal

node_exe = r"C:\Users\ridhi\AppData\Local\Programs\nodejs\node.exe"
frontend_dir = r"C:\Users\ridhi\.gemini\antigravity\scratch\reloop\frontend"
next_bin = os.path.join(frontend_dir, "node_modules", "next", "dist", "bin", "next")

print("[Test] Starting Next.js server on port 3000...")
proc = subprocess.Popen(
    [node_exe, next_bin, "start", "-p", "3000"],
    cwd=frontend_dir,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

time.sleep(3)

try:
    print("[Test] Probing http://localhost:3000 ...")
    req = urllib.request.urlopen("http://localhost:3000", timeout=5)
    status = req.getcode()
    body = req.read().decode("utf-8")
    print(f"[Test] Success! HTTP Status: {status}")
    print(f"[Test] Page Title in response: {'RELOOP' in body}")
    print(f"[Test] HTML snippet: {body[:250]}...")
except Exception as e:
    print(f"[Test] Probe error: {e}")
finally:
    print("[Test] Stopping server process...")
    proc.terminate()
    try:
        proc.wait(timeout=3)
    except:
        proc.kill()
    print("[Test] Verification complete.")
