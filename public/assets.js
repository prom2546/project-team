import { db, collection, getDocs, addDoc, updateDoc, doc } from "./firebase-config.js";

const productsRef = collection(db, "products");
const transactionsRef = collection(db, "transactions");

// โหลดสินค้าจาก Firestore
async function loadProducts() {
    let response = await fetch(firebaseUrl);
    let products = await response.json();
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";
 
    if (products) {
        Object.keys(products).forEach(id => {
            let product = products[id];
            let item = document.createElement("div");
            item.classList.add("product-card");
 
            item.innerHTML = `
<img src="${product.image}" alt="${product.name}" style="width:100%; height:auto; border-radius:10px;">
<h3>${product.name}</h3>
<p>ราคา: ${product.price} THB</p>
<p>คงเหลือ: <span id="stock-${id}">${product.stock}</span></p>
<button onclick="addToCart('${id}', '${product.name}', ${product.price}, ${product.stock})">🛒 เพิ่มลงตะกร้า</button>
            `;
 
            productList.appendChild(item);
        });
    }
}
// ✅ ฟังก์ชันขายสินค้า (ลดสต็อก และบันทึกธุรกรรม)
async function sellProduct(productId, name, price) {
    const productDoc = doc(db, "products", productId);
    const querySnapshot = await getDocs(productsRef);

    let currentStock = 0;
    querySnapshot.forEach(docSnap => {
        if (docSnap.id === productId) {
            currentStock = docSnap.data().stock;
        }
    });

    if (currentStock <= 0) {
        alert("❌ สินค้าหมดสต็อก!");
        return;
    }

    await updateDoc(productDoc, { stock: currentStock - 1 });

    // 🔥 บันทึกการขายสินค้า
    await addDoc(transactionsRef, {
        productId,
        name,
        price,
        type: "sell",
        timestamp: new Date().toISOString()
    });

    alert("✅ ขายสินค้าสำเร็จ!");
    window.location.reload();
}

// ✅ ฟังก์ชันเพิ่มสต็อกสินค้า
async function addStock(productId, name, amount) {
    const productDoc = doc(db, "products", productId);
    const querySnapshot = await getDocs(productsRef);

    let currentStock = 0;
    querySnapshot.forEach(docSnap => {
        if (docSnap.id === productId) {
            currentStock = docSnap.data().stock;
        }
    });

    await updateDoc(productDoc, { stock: currentStock + Number(amount) });

    // 🔥 บันทึกการเพิ่มสต็อก
    await addDoc(transactionsRef, {
        productId,
        name,
        amount: Number(amount),
        type: "restock",
        timestamp: new Date().toISOString()
    });

    alert("✅ เพิ่มสต็อกสำเร็จ!");
    window.location.reload();
}

// โหลดสินค้าเมื่อเปิดหน้าเว็บ
window.onload = loadProducts;
