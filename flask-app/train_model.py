import tensorflow as tf
import numpy as np
import os
from tensorflow.keras.preprocessing import image
from tensorflow.keras import layers, models, optimizers

ImageDataGenerator = image.ImageDataGenerator

# พาธ dataset หลังจาก augment เสร็จแล้ว
DATASET_DIR = "augmented_dataset"
MODEL_DIR = "saved_model"
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 20

# เตรียมข้อมูลด้วย ImageDataGenerator
datagen = ImageDataGenerator(rescale=1./255, validation_split=0.2)

train_gen = datagen.flow_from_directory(
    DATASET_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training'
)

val_gen = datagen.flow_from_directory(
    DATASET_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation'
)

# Model architecture (MobileNetV2 based)
base_model = tf.keras.applications.MobileNetV2(input_shape=(IMG_SIZE, IMG_SIZE, 3),
                                                include_top=False,
                                                weights='imagenet')

base_model.trainable = False  # freeze base model

model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.3),
    layers.Dense(train_gen.num_classes, activation='softmax')
])

model.compile(optimizer=optimizers.Adam(learning_rate=0.0005),
              loss='categorical_crossentropy',
              metrics=['accuracy'])

model.summary()

# เทรนโมเดล
history = model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=EPOCHS
)

# สร้างโฟลเดอร์ model
os.makedirs(MODEL_DIR, exist_ok=True)
model.save(os.path.join(MODEL_DIR, "foot_model.h5"))

# บันทึก labels ไว้ด้วย
labels = list(train_gen.class_indices.keys())
with open(os.path.join(MODEL_DIR, "labels.txt"), "w") as f:
    for label in labels:
        f.write(label + "\n")

print("✅ Training completed and model saved.")
