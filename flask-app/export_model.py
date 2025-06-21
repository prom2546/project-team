import tensorflow as tf
import os

# Input / Output Path
MODEL_DIR = "saved_model"
OUTPUT_FILE = "model.tflite"

# โหลด Keras Model ที่เทรนไว้ล่าสุด
model = tf.keras.models.load_model(os.path.join(MODEL_DIR, "foot_model.h5"))

# แปลงเป็น TensorFlow Lite (Quantized Float16)
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.float16]

tflite_model = converter.convert()

# เขียนไฟล์ .tflite ออกมา
with open(OUTPUT_FILE, "wb") as f:
    f.write(tflite_model)

print("✅ Export completed: model.tflite created.")
