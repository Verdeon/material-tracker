document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('warehouse-container');
  let warehouseItems = JSON.parse(localStorage.getItem('warehouseItems')) || [];

  function updateCartCount() {
    const total = warehouseItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.textContent = total;
  }

  function saveItems() {
    localStorage.setItem('warehouseItems', JSON.stringify(warehouseItems));
    updateCartCount();
  }

  function renderWarehouse() {
    container.innerHTML = '';

    if (warehouseItems.length === 0) {
      container.innerHTML = '<p class="text-gray-600 text-center">Depoda ürün yok.</p>';
      return;
    }

    warehouseItems.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'product-card bg-white shadow rounded-lg p-4 flex justify-between items-center';

      card.innerHTML = `
        <div class="flex items-center gap-4">
          <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded">
          <div>
            <h3 class="text-lg font-semibold">${item.name}</h3>
            <p class="text-sm text-gray-500">${item.desc}</p>
            <div class="text-green-600 font-semibold mt-1">
              <span class="carbon-total">${item.quantity * item.carbon}</span> g CO₂
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button class="decrement bg-gray-200 px-2 py-1 rounded">−</button>
          <input type="number" value="${item.quantity}" min="1" class="quantity-input w-12 text-center border rounded">
          <button class="increment bg-gray-200 px-2 py-1 rounded">+</button>

          <button class="favorite text-red-500 hover:text-red-600"><i class="fas fa-heart"></i></button>
          <button class="share text-blue-500 hover:text-blue-600"><i class="fas fa-share-alt"></i></button>
          <button class="delete text-gray-500 hover:text-red-600"><i class="fas fa-trash-alt"></i></button>
        </div>
      `;

      const input = card.querySelector('.quantity-input');
      const carbonDisplay = card.querySelector('.carbon-total');

      const refreshCarbon = () => {
        carbonDisplay.textContent = item.quantity * item.carbon;
      };

      // --- Quantity Events ---
      card.querySelector('.increment').addEventListener('click', () => {
        item.quantity++;
        input.value = item.quantity;
        refreshCarbon();
        saveItems();
      });

      card.querySelector('.decrement').addEventListener('click', () => {
        if (item.quantity > 1) {
          item.quantity--;
          input.value = item.quantity;
          refreshCarbon();
          saveItems();
        } else {
          warehouseItems.splice(index, 1);
          saveItems();
          renderWarehouse();
        }
      });

      input.addEventListener('change', () => {
        let val = parseInt(input.value);
        if (isNaN(val) || val < 1) {
          warehouseItems.splice(index, 1);
        } else {
          item.quantity = val;
        }
        saveItems();
        renderWarehouse();
      });

      // --- Silme Butonu ---
      card.querySelector('.delete').addEventListener('click', () => {
        warehouseItems.splice(index, 1);
        saveItems();
        renderWarehouse();
      });

      // --- Favori & Paylaş ---
      card.querySelector('.favorite').addEventListener('click', () => {
        alert('Favorilere eklendi (simülasyon)');
      });

      card.querySelector('.share').addEventListener('click', () => {
        const url = `${window.location.origin}/product-page.html?id=${item.id}&category=${item.category}`;
        navigator.clipboard.writeText(url).then(() => {
          alert('Bağlantı kopyalandı!');
        });
      });

      container.appendChild(card);
    });
  }

  // --- Depoyu Temizle Butonu ---
  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Depoyu Temizle';
  clearBtn.className = 'mb-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700';
  clearBtn.addEventListener('click', () => {
    if (confirm('Tüm ürünleri silmek istiyor musun?')) {
      warehouseItems = [];
      saveItems();
      renderWarehouse();
    }
  });

  container.parentElement.insertBefore(clearBtn, container);
  renderWarehouse();
});