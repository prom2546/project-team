
async function fetchData() {
    const dbRef = firebase.database().ref("products");
    const snapshot = await dbRef.once("value");
    return snapshot.val();
  }
  
  async function renderSalesReport() {
    const data = await fetchData();
    let totalSold = 0;
    let totalRevenue = 0;
    const typeCount = {};
    const topProducts = [];
  
    Object.values(data || {}).forEach(product => {
      const sold = product.sold || 0;
      const price = product.price || 0;
      const type = product.footType || "อื่นๆ";
  
      totalSold += sold;
      totalRevenue += sold * price;
      typeCount[type] = (typeCount[type] || 0) + sold;
      topProducts.push({ name: product.name, sold });
    });
  
    // Update summary
    document.getElementById("totalSold").textContent = totalSold;
    document.getElementById("totalRevenue").textContent = totalRevenue.toLocaleString();
  
    // Chart by foot type
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
  
    // Top 5 selling products
    topProducts.sort((a, b) => b.sold - a.sold);
    const top = topProducts.slice(0, 5);
    new Chart(document.getElementById("topProductsChart"), {
      type: "bar",
      data: {
        labels: top.map(p => p.name),
        datasets: [{
          label: "จำนวนที่ขายได้",
          data: top.map(p => p.sold),
          backgroundColor: "#10b981"
        }]
      }
    });
  }
  
  window.onload = renderSalesReport;
  