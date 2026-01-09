// --- core.js: VMT ÇEKİRDEK SİSTEM (Veri, Depo ve Detay Sayfası) ---

// 1. GLOBAL DEĞİŞKENLER
let allMaterials = []; 

// --- SAYFA YÜKLENDİĞİNDE (ANA GİRİŞ NOKTASI) ---
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Çekirdek Sistem Başlatılıyor...");

    fetch("materials.json")
        .then(res => {
            if (!res.ok) throw new Error("JSON yüklenemedi.");
            return res.json();
        })
        .then(data => {
            allMaterials = data.materials || []; 
            console.log(`📦 ${allMaterials.length} malzeme yüklendi.`);

            // 1. Sidebar Sayaçlarını Güncelle (Her sayfada varsa)
            updateSidebarCounts();

            // 2. Detay Sayfasındaysak Mantığı Kur
            setupDetailPageLogic(); 

            // 3. Eğer Filtreleme Dosyası Yüklü ve Listeleme Sayfasıysa -> Oraya Devret
            // filters.js içerisindeki 'startListingPage' fonksiyonunu tetikler.
            if (typeof window.startListingPage === 'function' && document.getElementById('materials-listing-page')) {
                window.startListingPage(allMaterials);
            }
        })
        .catch(err => console.error("Hata:", err));

    // Sepet/Depo sayacını güncelle (eğer fonksiyon tanımlıysa)
    if (typeof window.updateCartCountFromWarehouse === 'function') {
        window.updateCartCountFromWarehouse();
    }
});

// --- Metraj (Depo) İşlemleri ---
function addToWarehouse(materialId, material_class, quantity, name, desc, carbon) {
    const warehouseKey = 'warehouse';
    let warehouse = JSON.parse(localStorage.getItem(warehouseKey)) || [];
    const existingItem = warehouse.find(item => item.id === materialId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        warehouse.push({ id: materialId, material_class, quantity, name, desc, carbon });
    }

    localStorage.setItem(warehouseKey, JSON.stringify(warehouse));
    
    // Eğer sepet güncelleme fonksiyonları varsa çalıştır
    if (typeof window.updateCarbonCountFromWarehouse === 'function') window.updateCarbonCountFromWarehouse();
    if (typeof window.updateCartCountFromWarehouse === 'function') window.updateCartCountFromWarehouse();
}

// --- Quantity (Adet) Kontrol Fonksiyonları (Detay Sayfası İçin) ---
function incrementQuantity() {
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        let currentValue = parseInt(quantityInput.value);
        quantityInput.value = currentValue + 1;
        if (typeof updateCarbonEmission === 'function') updateCarbonEmission();
    }
}

function decrementQuantity() {
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
            if (typeof updateCarbonEmission === 'function') updateCarbonEmission();
        }
    }
}

function updateCarbonEmission() {
    const quantityInput = document.getElementById('quantity');
    const carbonPerUnitDisplay = document.getElementById('carbon-per-unit');
    const totalCarbonDisplay = document.getElementById('total-carbon-emission');

    if (!quantityInput || !carbonPerUnitDisplay || !totalCarbonDisplay) return;

    const quantity = parseInt(quantityInput.value) || 0;
    const carbonPerUnit = parseFloat(carbonPerUnitDisplay.dataset.carbon) || 0;
    totalCarbonDisplay.textContent = `${quantity * carbonPerUnit} kg CO₂`;
}

// --- YARDIMCI GENEL FONKSİYONLAR ---
function updateSidebarCounts() {
    document.querySelectorAll(".material-count").forEach(span => {
        const mClass = span.dataset.material_class;
        const count = allMaterials.filter(m => m.material_class === mClass).length;
        span.textContent = `${count} malzeme`;
    });
}

function setupDetailPageLogic() {
    const incrementButton = document.getElementById('increment-quantity');
    const decrementButton = document.getElementById('decrement-quantity');
    const quantityInput = document.getElementById('quantity');
    const addToWarehouseButton = document.querySelector('[data-action="add-to-warehouse"]');
    const urlParams = new URLSearchParams(window.location.search);
    const materialId = urlParams.get('id');

    if (incrementButton) incrementButton.addEventListener('click', incrementQuantity);
    if (decrementButton) decrementButton.addEventListener('click', decrementQuantity);
    
    if (quantityInput) {
        quantityInput.addEventListener('change', updateCarbonEmission);
        quantityInput.addEventListener('keyup', updateCarbonEmission);
        updateCarbonEmission(); 
    }

    if (addToWarehouseButton && materialId && allMaterials.length > 0) {
        const material = allMaterials.find(p => p.id === materialId);
        if (material) {
            const newBtn = addToWarehouseButton.cloneNode(true);
            addToWarehouseButton.parentNode.replaceChild(newBtn, addToWarehouseButton);
            newBtn.addEventListener('click', function() {
                const quantityToAdd = parseInt(document.getElementById('quantity')?.value || '1', 10);
                if (quantityToAdd > 0) {
                    addToWarehouse(material.id, material.material_class, quantityToAdd, material.name, material.description || material.desc, material.carbon || material.carbon_emission);
                    alert(`${quantityToAdd} adet ${material.name} eklendi!`);
                } else {
                    alert('Lütfen miktar seçin.');
                }
            });
        }
    }
}