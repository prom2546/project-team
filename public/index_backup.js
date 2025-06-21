const { createApp } = Vue;

createApp({
  data() {
    return {
      apiBaseUrl: "https://this-pro-done-default-rtdb.asia-southeast1.firebasedatabase.app",
      products: {},
      cart: [],
      selectedProduct: null,
      quantity: 1,
      showCart: false,
      loading: true
    };
  },
  computed: {
    totalPrice() {
      return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    totalItems() {
      return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }
  },
  methods: {
    async loadProducts() {
      try {
        const res = await fetch(`${this.apiBaseUrl}/products.json`);
        const all = await res.json();
        const filtered = {};

        for (const id in all) {
          const p = all[id];
          if (p.visible !== false) {
            filtered[id] = {
              id,
              name: p.name || "ไม่มีชื่อสินค้า",
              price: p.price || 0,
              stock: p.stock ?? 0,
              image: p.image || "images/default.jpg",
              footType: p.footType || "ไม่ระบุ",
              visible: p.visible
            };
          }
        }

        this.products = filtered;
      } catch (error) {
        console.error("❌ โหลดสินค้าล้มเหลว:", error);
      } finally {
        this.loading = false;
      }
    },

    openProductModal(id, product) {
      this.selectedProduct = { ...product, id };
      this.quantity = 1;
    },

    changeQuantity(amount) {
      if (
        this.selectedProduct &&
        this.quantity + amount > 0 &&
        this.quantity + amount <= this.selectedProduct.stock
      ) {
        this.quantity += amount;
      }
    },

    async confirmAddToCart() {
      if (!this.selectedProduct) return;
      const product = this.products[this.selectedProduct.id];
      if (!product || product.stock < this.quantity) {
        alert("❌ สินค้าไม่เพียงพอในสต็อก");
        this.selectedProduct = null;
        return;
      }

      let existingItem = this.cart.find(item => item.id === this.selectedProduct.id);
      if (existingItem) {
        existingItem.quantity += this.quantity;
      } else {
        this.cart.push({
          id: this.selectedProduct.id,
          name: this.selectedProduct.name,
          price: this.selectedProduct.price,
          quantity: this.quantity
        });
      }

      // ลด stock
      product.stock -= this.quantity;
      await fetch(`${this.apiBaseUrl}/products/${this.selectedProduct.id}.json`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: product.stock })
      });

      this.selectedProduct = null;
    },

    async removeFromCart(index) {
      const item = this.cart[index];
      const product = this.products[item.id];
      if (!product) return;

      product.stock++;

      await fetch(`${this.apiBaseUrl}/products/${item.id}.json`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: product.stock })
      });

      if (item.quantity > 1) {
        item.quantity--;
      } else {
        this.cart.splice(index, 1);
      }
    },

    checkout() {
      if (this.cart.length === 0) return;

      const amount = this.totalPrice.toFixed(2);
      const products = this.cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      }));

      const footType = localStorage.getItem("footType") || "0";

      window.location.href = `payment.html?amount=${amount}&products=${encodeURIComponent(JSON.stringify(products))}&footType=${footType}`;
    },

    handleImgError(e) {
      e.target.src = "images/default.jpg";
    }
  },
  mounted() {
    this.loadProducts();
  }
}).mount("#app");

// ปุ่ม Enter เข้าหน้า admin
document.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    window.location.href = 'admin.html';
  }
});
