// common.js
document.addEventListener('DOMContentLoaded', () => {
  updateCartCountFromWarehouse();
  window.updateCarbonCountFromWarehouse()
});

function updateCartCountFromWarehouse() {
  try {
    const warehouse = JSON.parse(localStorage.getItem('warehouse')) || [];

    const totalCount = warehouse.reduce((acc, item) => {
      return acc + (parseInt(item.quantity) || 0);
    }, 0);

    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
      cartCountElement.textContent = totalCount;
    }
  } catch (error) {
    console.error('Metraj sayısı güncellenirken hata:', error);
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = 0;
    }
  }
}

window.updateCartCountFromWarehouse = updateCartCountFromWarehouse;

window.updateCarbonCountFromWarehouse = function () {
    const warehouseItems = JSON.parse(localStorage.getItem("warehouse")) || [];
    const totalCarbon = warehouseItems.reduce((sum, item) => {
        return sum + (item.carbon * item.quantity);
    }, 0);

    const carbonDisplay = document.getElementById("total-carbon");
    if (carbonDisplay) {
        carbonDisplay.textContent = `${totalCarbon.toFixed(2)}kg CO₂`;
    }
};

// --- LOADER YÖNETİMİ ---
window.addEventListener('load', function() {
    const loader = document.getElementById('page-loader');
    
    if (loader) {
        // Minimum bekleme süresi ekleyelim (Çok hızlı yüklenirse bile loader görünsün)
        setTimeout(() => {
            // 1. Şeffaflaştır (Fade Out)
            loader.classList.add('opacity-0');
            
            // 2. CSS transition (0.5s) bitince tamamen kaldır
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500); 
            
        }, 300); // Sayfa yüklendikten sonra en az 300ms daha bekle (Estetik için)
    }
});