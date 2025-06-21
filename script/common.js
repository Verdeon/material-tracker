document.addEventListener('DOMContentLoaded', () => {
  updateCartCountFromWarehouse();
});

function updateCartCountFromWarehouse() {
  try {
    const warehouse = JSON.parse(localStorage.getItem('warehouse')) || [];
    
    // Her ürünün miktarını toplayalım
    const totalCount = warehouse.reduce((acc, item) => {
      return acc + (parseInt(item.quantity) || 0);
    }, 0);

    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
      cartCountElement.textContent = totalCount;
    }
  } catch (error) {
    console.error('Depo sayısı güncellenirken hata:', error);
  }
}

// Diğer JS dosyalardan çağırmak için global olarak dışa aktar
window.updateCartCountFromWarehouse = updateCartCountFromWarehouse;