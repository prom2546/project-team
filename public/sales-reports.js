const firebaseUrl = "https://this-pro-done-default-rtdb.asia-southeast1.firebasedatabase.app/products.json";

async function fetchSalesData() {
  const res = await fetch(firebaseUrl);
  return await res.json();
}

async function renderSalesReport() {
  const data = await fetchSalesData();
  if (!data) return;

  let totalSold = 0;
  let totalRevenue = 0;
  const typeCount = {};
  const topProducts = [];

  Object.values(data).forEach(product => {
    const sold = product.sold || 0;
    const price = product.price || 0;
    const footType = product.footType || "อื่นๆ";

    totalSold += sold;
    totalRevenue += sold * price;
    typeCount[footType] = (typeCount[footType] || 0) + sold;
    topProducts.push({ name: product.name, sold });
  });

  // สรุปด้านบน
  document.getElementById("totalSold").textContent = totalSold;
  document.getElementById("totalRevenue").textContent = totalRevenue.toLocaleString();

  // Chart by Foot Type
  new Chart(document.getElementById("salesByTypeChart"), {
    type: "bar",
    data: {
      labels: Object.keys(typeCount),
      datasets: [{
        label: "จำนวนที่ขายได้",
        data: Object.values(typeCount),
        backgroundColor: "#3b82f6"
      }]
    }
  });

  // Top 5 Products
  topProducts.sort((a, b) => b.sold - a.sold);
  const top5 = topProducts.slice(0, 5);
  new Chart(document.getElementById("topProductsChart"), {
    type: "bar",
    data: {
      labels: top5.map(p => p.name),
      datasets: [{
        label: "ขายแล้ว (ชิ้น)",
        data: top5.map(p => p.sold),
        backgroundColor: "#10b981"
      }]
    }
  });
}

// ✅ เมื่อเปิดหน้า Sales ให้โหลด renderSalesReport()
function showSection(sectionId) {
  document.querySelectorAll('.main-section').forEach(sec => sec.style.display = 'none');
  document.getElementById(sectionId).style.display = 'block';

  if (sectionId === 'sales') renderSalesReport();
  if (sectionId === 'products') loadProductOptions();
}
