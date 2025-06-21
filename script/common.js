// common.js
document.addEventListener('DOMContentLoaded', () => {
  updateCartCountFromWarehouse();
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
    console.error('Depo sayısı güncellenirken hata:', error);
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = 0;
    }
  }
}

window.updateCartCountFromWarehouse = updateCartCountFromWarehouse;