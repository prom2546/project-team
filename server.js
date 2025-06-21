const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const firebaseAdmin = require("firebase-admin");
const fetch = require("node-fetch");
const app = express();

// ใช้ CORS และ bodyParser (เพิ่มการตั้งค่า limit)
app.use(cors());
app.use(bodyParser.json({ limit: "200mb" }));

// ตั้งค่า Firebase
const serviceAccount = require("./this-pro-done-firebase-adminsdk-fbsvc-72157f3dbb.json");
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: "https://this-pro-done-default-rtdb.asia-southeast1.firebasedatabase.app"
});

// เข้าถึง Firebase Realtime Database
const db = firebaseAdmin.database();

// กำหนดที่เก็บไฟล์อัปโหลด
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// เสิร์ฟไฟล์ static จาก public
app.use(express.static(path.join(__dirname, "public")));

// เสิร์ฟหน้าแรกเป็น home.html
app.get("/", (req, res) => {
  console.log("Serving home.html...");
  res.sendFile(path.resolve(__dirname, "public", "home.html"));
});

// ดึงสินค้าทั้งหมด (เฉพาะที่ visible = true)
app.get("/products", async (req, res) => {
  try {
    const snapshot = await db.ref("products").once("value");
    const allProducts = snapshot.val();
    const visibleOnly = {};

    for (const id in allProducts) {
      const product = allProducts[id];
      if (product.visible) {
        visibleOnly[id] = product;
      }
    }

    res.json(visibleOnly);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// เพิ่มสินค้าใหม่ (พร้อม sold: 0)
app.post("/products", async (req, res) => {
  try {
    const { name, price, stock } = req.body;

    if (!name || !price || stock === undefined) {
      return res.status(400).json({ error: "Missing fields!" });
    }

    const newProductRef = db.ref("products").push();
    await newProductRef.set({
      name,
      price,
      stock,
      visible: true,
      sold: 0
    });

    res.json({ message: "✅ เพิ่มสินค้าใหม่สำเร็จ!", productId: newProductRef.key });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// อัปเดตสต็อกสินค้า
app.patch("/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const { stock } = req.body;

    if (stock === undefined) {
      return res.status(400).json({ error: "Stock is required!" });
    }

    await db.ref(`products/${productId}`).update({ stock });
    res.json({ message: "✅ อัปเดตสต็อกสำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// บันทึกคำสั่งซื้อ
app.post("/orders", async (req, res) => {
  try {
    const order = req.body;
    const newOrderRef = db.ref("orders").push();
    await newOrderRef.set(order);

    res.json({ message: "✅ คำสั่งซื้อถูกบันทึก!", orderId: newOrderRef.key });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// เสิร์ฟข้อมูลการสแกนจากหน้าจอ
app.post("/scan", upload.single("image"), async (req, res) => {
  try {
    const imageData = req.file.path;
    const response = await fetch("http://localhost:5001/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageData })
    });
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error("Error during scanning:", error);
    res.status(500).send("เกิดข้อผิดพลาด");
  }
});

// เพิ่มฟังก์ชันในการรับการวิเคราะห์เท้าจากหน้าเว็บ
app.get("/foot-type", async (req, res) => {
  try {
    const snapshot = await db.ref("foot-type").once("value");
    const footType = snapshot.val();
    res.json({ footType });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// เริ่มต้นเซิร์ฟเวอร์
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
