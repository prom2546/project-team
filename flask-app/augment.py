import os
import cv2
import numpy as np
from tqdm import tqdm
import random

# ตำแหน่ง dataset ที่ถูกจัดเรียบร้อยแล้ว
DATASET_DIR = 'organized_dataset'
AUGMENTED_DIR = 'augmented_dataset'
TARGET_COUNT = 500  # จำนวนเป้าหมายต่อ class (คุณปรับตัวเลขนี้ได้)

os.makedirs(AUGMENTED_DIR, exist_ok=True)

def augment_image(image):
    rows, cols, ch = image.shape

    # Random rotate
    angle = random.uniform(-15, 15)
    M = cv2.getRotationMatrix2D((cols/2, rows/2), angle, 1)
    image = cv2.warpAffine(image, M, (cols, rows))

    # Random flip
    if random.random() > 0.5:
        image = cv2.flip(image, 1)

    # Random brightness
    value = random.randint(-30, 30)
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    hsv[:,:,2] = np.clip(hsv[:,:,2] + value, 0, 255)
    image = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)

    return image

# วนทุก class
for class_name in os.listdir(DATASET_DIR):
    class_path = os.path.join(DATASET_DIR, class_name)
    save_class_path = os.path.join(AUGMENTED_DIR, class_name)
    os.makedirs(save_class_path, exist_ok=True)

    images = os.listdir(class_path)
    for img_name in images:
        src = os.path.join(class_path, img_name)
        dst = os.path.join(save_class_path, img_name)
        os.system(f"cp \"{src}\" \"{dst}\"")

    pbar = tqdm(total=TARGET_COUNT, desc=f'Augmenting {class_name}')
    pbar.update(len(images))

    while len(os.listdir(save_class_path)) < TARGET_COUNT:
        img_file = random.choice(images)
        img_path = os.path.join(class_path, img_file)
        image = cv2.imread(img_path)
        aug_image = augment_image(image)

        aug_filename = f"aug_{random.randint(100000, 999999)}.jpg"
        cv2.imwrite(os.path.join(save_class_path, aug_filename), aug_image)
        pbar.update(1)

    pbar.close()

print("✅ Augmentation เสร็จเรียบร้อย")
