import urllib.request
import zipfile
import os
import shutil

url = "https://nodejs.org/dist/v20.18.0/node-v20.18.0-win-x64.zip"
temp_zip = os.path.join(os.environ.get("TEMP", "C:\\temp"), "node.zip")
target_base = r"C:\Users\ridhi\AppData\Local\Programs"
extracted_folder = os.path.join(target_base, "node-v20.18.0-win-x64")
final_dir = os.path.join(target_base, "nodejs")

print("Downloading Node.js portable zip...")
urllib.request.urlretrieve(url, temp_zip)
print("Download complete. Extracting...")

with zipfile.ZipFile(temp_zip, 'r') as zip_ref:
    zip_ref.extractall(target_base)

if os.path.exists(final_dir):
    shutil.rmtree(final_dir)

os.rename(extracted_folder, final_dir)

if os.path.exists(temp_zip):
    os.remove(temp_zip)

node_exe = os.path.join(final_dir, "node.exe")
print(f"Node.js successfully installed at: {node_exe}")
print("Testing node execution...")
os.system(f'"{node_exe}" --version')
