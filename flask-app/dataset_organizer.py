import os
import csv
import shutil

# ตำแหน่งไฟล์ log กับรูปภาพ
SCAN_HISTORY_FILE = "scan_history.csv"
SCAN_IMAGE_DIR = "scan_images"
OUTPUT_DIR = "organized_dataset"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# อ่าน scan_history.csv
data = []
with open(SCAN_HISTORY_FILE, "r") as csvfile:
    reader = csv.reader(csvfile)
    for row in reader:
        if len(row) != 3:
            continue
        timestamp, label, confidence = row
        data.append((timestamp, label, confidence))

# วนข้อมูลทั้งหมด
for timestamp, label, confidence in data:
    # สร้างโฟลเดอร์ตาม label ถ้ายังไม่มี
    class_dir = os.path.join(OUTPUT_DIR, label.replace(" ", "_"))
    os.makedirs(class_dir, exist_ok=True)

    # หาตำแหน่งไฟล์รูป
    filename = f"{timestamp}.jpg"
    src = os.path.join(SCAN_IMAGE_DIR, filename)

    # เช็คว่ามีไฟล์ภาพจริงก่อน
    if os.path.exists(src):
        dst = os.path.join(class_dir, filename)
        shutil.copy(src, dst)
        print(f"✅ Moved {filename} --> {class_dir}")
    else:
        print(f"⚠️ Image not found for timestamp: {timestamp}")

print("✅ Dataset organization completed.")
