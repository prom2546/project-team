from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import base64
import time
import os
import csv

# สร้าง Flask App
app = Flask(__name__)
CORS(app)

# โหลดโมเดล TFLite
interpreter = tf.lite.Interpreter(model_path="model.tflite")
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# โหลด Labels
with open("labels.txt", "r") as f:
    labels = [line.strip() for line in f.readlines()]

@app.route('/scan', methods=['POST'])
def scan():
    try:
        print("📥 ได้รับคำขอสแกนภาพ")

        if not request.is_json:
            return jsonify({'error': 'คำขอไม่ใช่ JSON'}), 400

        data = request.get_json()
        image_data = data.get('image')

        if not image_data or ',' not in image_data:
            return jsonify({'error': 'ไม่มีข้อมูลภาพหรือข้อมูลผิดรูปแบบ'}), 400

        print("✅ ได้รับภาพ base64 ยาวประมาณ:", len(image_data))

        # ถอดรหัส base64
        image_data_bytes = base64.b64decode(image_data.split(',')[1])
        image = Image.open(io.BytesIO(image_data_bytes)).convert("RGB")

        # ✅ เซฟภาพเก็บ log
        timestamp = time.strftime("%Y%m%d-%H%M%S")
        os.makedirs("scan_images", exist_ok=True)
        with open(f"scan_images/{timestamp}.jpg", "wb") as f:
            f.write(image_data_bytes)

        # Resize และแปลงเป็น uint8 ตามที่ Quantized Model ต้องการ
        img = np.array(image.resize((224, 224)), dtype=np.uint8)
        input_data = np.expand_dims(img, axis=0)

        # ส่งเข้าโมเดล
        interpreter.set_tensor(input_details[0]['index'], input_data)
        interpreter.invoke()
        output = interpreter.get_tensor(output_details[0]['index'])[0]

        # หาค่าที่ได้สูงสุด
        predicted_index = int(np.argmax(output))
        predicted_label = labels[predicted_index]

        # ปรับสเกล confidence กลับมาเป็น %
        confidence = (np.max(output) / 255) * 100

        print(f"✅ ผลลัพธ์: {predicted_label} ({confidence:.2f}%)")

        # ✅ เก็บประวัติ scan ลง CSV
        with open("scan_history.csv", "a", newline="") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow([timestamp, predicted_label, confidence])

        return jsonify({
            'label': predicted_label,
            'confidence': confidence
        })

    except Exception as e:
        print("❌ เกิดข้อผิดพลาด:", e)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
