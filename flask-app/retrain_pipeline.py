import subprocess

print("\n⚙️ เริ่ม Auto Retrain Pipeline...\n")

# Step 1: จัด Dataset
print("📦 จัดเรียงข้อมูลจาก scan_history.csv -> organized_dataset")
subprocess.run(["python", "dataset_organizer.py"], check=True)

# Step 2: Augment dataset
print("\n🔄 ทำ Augmentation ขยายข้อมูล -> augmented_dataset")
subprocess.run(["python", "augment.py"], check=True)

# Step 3: Train Model
print("\n🎯 เริ่ม Train Model จาก augmented_dataset")
subprocess.run(["python", "train_model.py"], check=True)

# Step 4: Export TFLite model
print("\n📤 Export เป็น model.tflite")
subprocess.run(["python", "export_model.py"], check=True)

print("\n✅ Retrain Pipeline เสร็จสมบูรณ์พร้อมใช้งานแล้ว 🎉")
