document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('warehouse-container');
  // localStorage anahtarını 'warehouseItems' yerine 'warehouse' olarak değiştirin
  let warehouseItems = JSON.parse(localStorage.getItem('warehouse')) || []; // <-- BURASI 'warehouse' olmalı

  // saveItems fonksiyonu, metrajdaki değişiklikleri kaydeder ve global sepet sayısını günceller.
  function saveItems() {
    localStorage.setItem('warehouse', JSON.stringify(warehouseItems)); // <-- BURASI 'warehouse' olmalı
    updateCarbonCountFromWarehouse();
    // Metraj güncellendiğinde global sepet sayısını güncelleme fonksiyonunu ÇAĞIR
    if (typeof window.updateCartCountFromWarehouse === 'function') {
      window.updateCartCountFromWarehouse(); // <--- KRİTİK ÇAĞRI BURADA
    } else {
        console.warn("common.js'deki updateCartCountFromWarehouse fonksiyonu bulunamadı.");
    }
  }

  function renderWarehouse() {
    container.innerHTML = ''; // İçeriği temizle

    if (warehouseItems.length === 0) {
      container.innerHTML = `<p class=\"text-gray-600 text-center\">Henüz metraj hesabı için malzeme seçilmedi.</p>
      <div class="text-center mt-4">
        <a href="materials-listing.html" class="text-green-600 hover:text-green-700 underline font-medium text-sm py-2 px-4 rounded inline-block transition duration-300">Malzemeleri İncele</a>
      </div>
      `;
      // Metraj boşaldığında da sepet sayısını güncelle
      if (typeof window.updateCartCountFromWarehouse === 'function') {
        window.updateCartCountFromWarehouse(); // <--- KRİTİK ÇAĞRI BURADA
      }
      return;
    }

    warehouseItems.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'material-card bg-white shadow rounded-lg mb-2 p-4 flex justify-between items-center';

      
    let mClass = (item.material_class || "").toLowerCase();
        const mClassClean = mClass.replaceAll('ç', 'c').replaceAll('ğ', 'g').replaceAll('ı', 'i').replaceAll('ö', 'o').replaceAll('ş', 's').replaceAll('ü', 'u');
        const materialImg = `./img/${item.name}.png`;

      // item.image, item.name, item.desc gibi değerlerin undefined olmaması için kontroller eklendi
      card.innerHTML = `
        <div class="flex items-center gap-4">
          <img src="${materialImg}" alt="${item.name}" class="w-20 h-20 object-cover rounded"
                        onerror="this.onerror=function(){this.src='./img/favicon.png'; this.onerror=null;}; this.src='./img/${mClassClean}.png';" />
          <div>
            <a href="material-page.html?id=${item.id}"><h3 class="text-lg font-semibold">${item.name || 'Bilinmeyen Malzeme'}</h3></a>
            <p class="text-sm text-gray-500">${item.desc || 'Açıklama Yok'}</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <button class="decrement-quantity bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300">-</button>
          <input type="number" value="${item.quantity}" min="1" class="quantity-input w-16 text-center border rounded-md">
          <button class="increment-quantity bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300">+</button>
          <span class="font-semibold text-lg">${(item.carbon * item.quantity).toFixed(2) || '0.00'} kg CO₂</span>
          <button class="delete text-red-600 hover:text-red-800">Sil</button>
        </div>
      `;

      // Miktar artırma butonu
      card.querySelector('.increment-quantity').addEventListener('click', () => {
          input.value = parseInt(input.value) + 1;
          input.dispatchEvent(new Event('change')); // Değişikliği tetikle
      });

      // Miktar azaltma butonu
      card.querySelector('.decrement-quantity').addEventListener('click', () => {
          let currentValue = parseInt(input.value);
          if (currentValue > 1) {
              input.value = currentValue - 1;
              input.dispatchEvent(new Event('change')); // Değişikliği tetikle
          }
      });

      // --- Miktar Değişikliği ---
      const input = card.querySelector('.quantity-input');
      if (input) { // input elementinin varlığını kontrol edin
        input.addEventListener('change', () => {
          let val = parseInt(input.value);
          if (isNaN(val) || val < 1) {
            // Miktar 1'den azsa veya geçersizse malzemeü sil
            warehouseItems.splice(index, 1);
          } else {
            item.quantity = val;
          }
          saveItems(); // Miktar değiştiğinde metrajyu kaydet ve sepeti güncelle
          renderWarehouse(); // Metrajı yeniden render et (UI güncellemek için)
        });
      }

      // --- Silme Butonu ---
      const deleteButton = card.querySelector('.delete');
      if (deleteButton) { // deleteButton elementinin varlığını kontrol edin
        deleteButton.addEventListener('click', () => {
          warehouseItems.splice(index, 1);
          saveItems(); // Malzeme silindiğinde metrajyu kaydet ve sepeti güncelle
          renderWarehouse(); // Metrajı yeniden render et (UI güncellemek için)
        });
      }

      container.appendChild(card);
    });
  }

  // --- Metrajı Temizle Butonu ---
  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Metrajı Temizle';
  clearBtn.className = 'mb-4 mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700';
  clearBtn.addEventListener('click', () => {
    localStorage.removeItem('warehouse'); // <--- BURASI 'warehouse' olmalı
    warehouseItems = [];
    renderWarehouse(); // Metrajı boşalt ve render et
    if (typeof window.updateCartCountFromWarehouse === 'function') {
      window.updateCartCountFromWarehouse(); // <--- KRİTİK ÇAĞRI BURADA
    }
    updateCarbonCountFromWarehouse();
  });

  const btnContainer = document.createElement('div');
  btnContainer.className = 'flex justify-end';
  btnContainer.appendChild(clearBtn);

  if (container && container.parentNode) {
    container.parentNode.insertBefore(btnContainer, container.nextSibling);
  } else {
      console.warn("warehouse-container veya parent elementi bulunamadı, Temizle butonu eklenemedi.");
  }


  // Sayfa ilk yüklendiğinde hem metrajyu render et hem de sepet sayısını güncelle
  renderWarehouse();
  if (typeof window.updateCartCountFromWarehouse === 'function') {
    window.updateCartCountFromWarehouse(); // <--- KRİTİK ÇAĞRI BURADA
  }
});