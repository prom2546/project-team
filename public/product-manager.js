//========================= CONFIG ===========================
const BASE_URL = "https://this-pro-done-default-rtdb.asia-southeast1.firebasedatabase.app/products";
const FULL_URL = `${BASE_URL}.json`;

//====================== SWITCH MENU ========================
function showSection(id) {
  document.querySelectorAll('.main-section').forEach(sec => sec.style.display = 'none');
  document.getElementById(id).style.display = 'block';
  document.querySelectorAll('aside nav a').forEach(link => link.classList.remove('active'));
  const link = Array.from(document.querySelectorAll('aside nav a')).find(a => a.textContent.includes(id.charAt(0).toUpperCase() + id.slice(1)));
  if (link) link.classList.add('active');
  if (id === 'products') loadProductOptions();
}

//====================== LOAD PRODUCTS ========================
async function loadProductOptions() {
  try {
    const res = await fetch(FULL_URL);
    const data = await res.json();

    const productSelect = document.getElementById("productSelect");
    const deleteProductSelect = document.getElementById("deleteProductSelect");

    productSelect.innerHTML = "<option value=''>-- เลือกสินค้า --</option>";
    deleteProductSelect.innerHTML = "<option value=''>-- เลือกสินค้า --</option>";

    if (!data) {
      console.warn("❌ ยังไม่มีข้อมูลสินค้าในระบบ");
      return;
    }

    Object.entries(data).forEach(([id, product]) => {
  const option = document.createElement("option");
  option.value = id;
  option.textContent = product.name;
  productSelect.appendChild(option.cloneNode(true));
  deleteProductSelect.appendChild(option.cloneNode(true));
});


    // เลือก default ตัวแรกให้อัตโนมัติ (ถ้ามีสินค้า)
    const firstId = Object.keys(data)[0];
    productSelect.value = firstId;
    deleteProductSelect.value = firstId;

  } catch (err) {
    console.error("โหลดสินค้าล้มเหลว", err);
    alert("❌ โหลดสินค้าล้มเหลว");
  }
}

//====================== ADD NEW PRODUCT ========================
async function addNewProduct() {
  try {
    const name = document.getElementById("newProductName").value.trim();
    const price = parseFloat(document.getElementById("newProductPrice").value);
    const stock = parseInt(document.getElementById("newProductStock").value);
    const footType = document.getElementById("newProductFootType").value;
    const image = document.getElementById("newProductImage").value;

    if (!name || isNaN(price) || isNaN(stock) || !footType) {
      alert("❌ กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    const newProduct = { name, price, stock, footType, image, visible: true, sold: 0 };

    await fetch(FULL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct)
    });

    alert("✅ เพิ่มสินค้าแล้ว");

    document.querySelectorAll('#newProductName, #newProductPrice, #newProductStock, #newProductFootType, #newProductImage').forEach(input => input.value = "");

    loadProductOptions();

  } catch (err) {
    console.error("เพิ่มสินค้าล้มเหลว", err);
    alert("❌ เพิ่มสินค้าล้มเหลว");
  }
}

//====================== INCREASE STOCK ========================
async function increaseStock() {
  try {
    const id = document.getElementById("productSelect").value;
    const amt = parseInt(document.getElementById("stockAmount").value);
    if (!id || amt <= 0) return alert("❌ กรุณาเลือกสินค้าและจำนวน");

    const res = await fetch(`${BASE_URL}/${id}.json`);
    const data = await res.json();
    const newStock = (data.stock || 0) + amt;

    await fetch(`${BASE_URL}/${id}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: newStock })
    });

    alert("✅ เพิ่มสต็อกสำเร็จ");
    loadProductOptions();

  } catch (err) {
    console.error("เพิ่มสต็อกล้มเหลว", err);
    alert("❌ เพิ่มสต็อกล้มเหลว");
  }
}

//====================== DECREASE STOCK ========================
async function decreaseStock() {
  try {
    const id = document.getElementById("productSelect").value;
    const amt = parseInt(document.getElementById("stockAmount").value);
    if (!id || amt <= 0) return alert("❌ กรุณาเลือกสินค้าและจำนวน");

    const res = await fetch(`${BASE_URL}/${id}.json`);
    const data = await res.json();
    const newStock = Math.max(0, (data.stock || 0) - amt);

    await fetch(`${BASE_URL}/${id}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: newStock })
    });

    alert("✅ ลดสต็อกสำเร็จ");
    loadProductOptions();

  } catch (err) {
    console.error("ลดสต็อกล้มเหลว", err);
    alert("❌ ลดสต็อกล้มเหลว");
  }
}

//====================== DELETE PRODUCT ========================
async function deleteProduct() {
  try {
    const id = document.getElementById("deleteProductSelect").value;
    if (!id) return alert("❌ กรุณาเลือกสินค้าที่จะลบ");

    if (!confirm("⚠️ ต้องการลบสินค้านี้ใช่หรือไม่?")) return;

    await fetch(`${BASE_URL}/${id}.json`, { method: "DELETE" });

    alert("✅ ลบสินค้าเรียบร้อย");
    loadProductOptions();

  } catch (err) {
    console.error("ลบสินค้าล้มเหลว", err);
    alert("❌ ลบสินค้าล้มเหลว");
  }
}

//====================== LOGOUT ========================
function logout() {
  alert("กำลังออกจากระบบ...");
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "index_backup.html";
}

//====================== INITIAL LOAD ========================
window.onload = () => {
  loadProductOptions();
}
