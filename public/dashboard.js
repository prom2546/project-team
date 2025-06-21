const firebaseBase = "https://this-pro-done-default-rtdb.asia-southeast1.firebasedatabase.app/products";
const firebaseUrl = firebaseBase + ".json";
let allProducts = {};

window.onload = () => {
  loadProductOptions();
  displaySalesSummary();
};

async function loadProductOptions() {
  let response = await fetch(firebaseUrl);
  let products = await response.json();
  const productSelect = document.getElementById("productSelect");
  productSelect.innerHTML = "";
  allProducts = products;

  if (products) {
    Object.keys(products).forEach(id => {
      let option = document.createElement("option");
      option.value = id;
      option.textContent = products[id].name;
      productSelect.appendChild(option);
    });
  }

  updateFootTypeStatus();
}

function updateFootTypeStatus() {
  const productId = document.getElementById("productSelect").value;
  const editFootType = document.getElementById("editFootType");

  if (productId && allProducts[productId]) {
    const hasType = !!allProducts[productId].footType;
    editFootType.disabled = hasType;
    editFootType.value = hasType ? allProducts[productId].footType : "";
  }
}

async function addNewProduct() {
  const name = document.getElementById("newProductName").value;
  const price = document.getElementById("newProductPrice").value;
  const stock = document.getElementById("newProductStock").value;
  const footType = document.getElementById("newProductFootType").value;

  if (!name || price <= 0 || stock < 0 || !footType) {
    alert("❌ กรุณากรอกข้อมูลให้ครบถ้วน!");
    return;
  }

  let newProduct = {
    name,
    price: Number(price),
    stock: Number(stock),
    footType,
    visible: true,
    sold: 0
  };

  let response = await fetch(firebaseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newProduct)
  });

  if (response.ok) {
    alert("✅ เพิ่มสินค้าใหม่สำเร็จ!");
    window.location.reload();
  } else {
    alert("❌ มีบางอย่างผิดพลาด");
  }
}

async function addStockToProduct() {
  const productId = document.getElementById("productSelect").value;
  const amount = Number(document.getElementById("stockAmount").value);
  const footType = document.getElementById("editFootType").value;

  if (!productId || amount <= 0) {
    alert("❌ กรุณาเลือกสินค้าและระบุจำนวนที่ถูกต้อง");
    return;
  }

  const current = allProducts[productId];
  const updatedData = {
    stock: current.stock + amount
  };

  if (!current.footType && footType) {
    updatedData.footType = footType;
  }

  await fetch(`${firebaseBase}/${productId}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData)
  });

  alert("✅ อัปเดตข้อมูลสำเร็จ!");
  window.location.reload();
}

function goToStore() {
  window.location.href = "index_backup.html";
}

async function displaySalesSummary() {
  let response = await fetch(firebaseUrl);
  let products = await response.json();

  let summaryContainer = document.getElementById("salesSummary");
  let chartCanvas = document.getElementById("salesChart");
  summaryContainer.innerHTML = "";

  if (!products) {
    summaryContainer.innerHTML = "<p>❌ ไม่พบข้อมูลสินค้า</p>";
    return;
  }

  let totalSold = 0;
  let totalStock = 0;
  let totalRevenue = 0;

  const labels = [];
  const revenues = [];

  Object.keys(products).forEach(id => {
    const p = products[id];
    const sold = p.sold || 0;
    const revenue = sold * p.price;
    const stock = p.stock;

    totalSold += sold;
    totalStock += stock;
    totalRevenue += revenue;

    labels.push(p.name);
    revenues.push(revenue);

    let pElement = document.createElement("p");
    pElement.textContent = `🛍️ ${p.name} | เหลือ: ${stock} | ขายแล้ว: ${sold} | รายได้: ${revenue.toLocaleString()} ฿`;
    summaryContainer.appendChild(pElement);
  });

  let totalEl = document.createElement("p");
  totalEl.innerHTML = `<strong>💰 ยอดรวมทั้งหมด:</strong><br>
    ขายแล้ว: ${totalSold} ชิ้น <br>
    สินค้าเหลือ: ${totalStock} ชิ้น <br>
    รายได้รวม: ${totalRevenue.toLocaleString()} ฿`;
  totalEl.style.marginTop = "20px";
  summaryContainer.appendChild(totalEl);

  new Chart(chartCanvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'รายได้ต่อสินค้า (บาท)',
        data: revenues,
        backgroundColor: '#4CAF50'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: ${context.formattedValue} ฿`
          }
        }
      }
    }
  });
}
function logout() {
    alert('กำลังออกจากระบบ...');
    localStorage.removeItem("adminLoggedIn");  // เคลียร์ session ถ้ามี
    window.location.href = "index_backup.html";       // กลับไปหน้า index
}
