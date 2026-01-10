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

// --- Quantity Kontrol Fonksiyonları (Detay Sayfası İçin) ---
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
                    showToast('Malzeme metraj listenize eklendi!', 'success');
                } else {
                    showToast('Lütfen geçerli bir miktar giriniz.', 'error');
                }
            });
        }
    }
}

// --- Renkler (index.html için) ---
    const mainSection = document.getElementById('class-selection-color');
    const cards = document.querySelectorAll('.material_class-card');
    if (mainSection && cards.length > 0) {
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                const cardColor = window.getComputedStyle(card).backgroundColor;
                
                mainSection.style.backgroundColor = cardColor;
            });
            card.addEventListener('mouseleave', function() {
                mainSection.style.backgroundColor = ''; 
            });
        });
    }

    var body = document.body;

    const containerColorY = document.getElementById('container-color-y');
    const imgY = containerColorY.querySelector('.container-img');
        containerColorY.addEventListener('mouseenter', function() {
            body.style.backgroundColor = '#FFFDE7'; 
            imgY.style.transform = 'scale(1.2)';
        });
        containerColorY.addEventListener('mouseleave', function() {
            body.style.backgroundColor = '#f9f9f9'; 
            imgY.style.transform = 'scale(1)';
        });

    const containerColorB = document.getElementById('container-color-b');
    const imgB = containerColorB.querySelector('.container-img')
        containerColorB.addEventListener('mouseenter', function() {
            body.style.backgroundColor = '#eff6ff'; 
            imgB.style.transform = 'scale(1.2)';
        });
        containerColorB.addEventListener('mouseleave', function() {
            body.style.backgroundColor = '#f9f9f9'; 
            imgB.style.transform = 'scale(1)';
        });

        // SAHTE YÜKLENİYOR KARTLARI OLUŞTURUCU
function getSkeletonHTML(count = 6) {
    let skeletons = '';
    
    for (let i = 0; i < count; i++) {
        skeletons += `
        <div class="material-card bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col h-full animate-pulse">
            <div class="p-5 flex-1 flex flex-col justify-between">
                
                <div class="flex justify-between items-start gap-3 mb-2">
                    
                    <div class="flex flex-col flex-1 pr-2 space-y-2">
                        <div class="h-3 w-20 bg-gray-200 rounded"></div>
                        <div class="h-5 w-3/4 bg-gray-300 rounded"></div>
                        <div class="h-3 w-1/3 bg-gray-100 rounded"></div>
                        <div class="h-3 w-full bg-gray-200 rounded"></div>
                        <div class="h-3 w-2/3 bg-gray-200 rounded"></div>
                    </div>

                    <div class="w-16 h-16 flex-shrink-0 bg-gray-200 rounded-lg"></div>
                </div>

                <div class="flex justify-between items-center border-t border-gray-100 pt-3 mt-8">
                    
                    <div class="flex flex-col gap-1">
                        <div class="h-2 w-10 bg-gray-200 rounded"></div>
                        <div class="h-4 w-20 bg-gray-300 rounded"></div>
                    </div>

                    <div class="flex gap-2 items-center">
                        <div class="h-8 w-16 bg-gray-100 rounded-lg"></div>
                        <div class="h-9 w-24 bg-gray-800 rounded-lg opacity-10"></div>
                    </div>
                </div>

            </div>
        </div>
        `;
    }
    return skeletons;
}

// --- MODERN TOAST BİLDİRİM SİSTEMİ ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    
    // İKON VE RENK AYARLARI
    const config = {
        success: {
            icon: '<i class="fa-solid fa-circle-check"></i>',
            bgColor: 'bg-white',
            borderColor: 'border-green-500',
            iconColor: 'text-green-500',
            title: 'Başarılı',
            closeColor: 'bg-green-50'
        },
        error: {
            icon: '<i class="fa-solid fa-circle-exclamation"></i>',
            bgColor: 'bg-white',
            borderColor: 'border-red-500',
            iconColor: 'text-red-500',
            title: 'Hata',
            closeColor: 'bg-red-50'
        },
        warning: {
            icon: '<i class="fa-solid fa-triangle-exclamation"></i>',
            bgColor: 'bg-white',
            borderColor: 'border-yellow-500',
            iconColor: 'text-yellow-500',
            title: 'Dikkat',
            closeColor: 'bg-yellow-50'
        }
    };

    const style = config[type] || config.success;

    // HTML OLUŞTUR
    const toast = document.createElement('div');
    toast.className = `toast-enter flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow-xl border-l-4 ${style.borderColor} relative overflow-hidden cursor-pointer`;
    
    toast.innerHTML = `
        <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${style.iconColor} bg-gray-50 rounded-lg">
            ${style.icon}
        </div>
        <div class="ml-3 text-sm font-normal mr-2">
            <div class="font-bold text-gray-900 mb-0.5">${style.title}</div>
            <div class="text-xs text-gray-500">${message}</div>
        </div>
        <button type="button" onclick="this.parentElement.remove()" class="ms-auto flex items-center justify-center text-body hover:${style.closeColor} hover:text-heading bg-transparent box-border border border-transparent hover:bg-neutral-secondary-medium font-medium leading-5 rounded text-sm h-8 w-8 focus:outline-none" data-dismiss-target="#toast-default" aria-label="Close">
            <span class="sr-only">Close</span>
            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/></svg>
        </button>
        <div class="absolute bottom-0 left-0 h-1 bg-gray-100 w-full">
            <div class="h-full ${style.iconColor.replace('text', 'bg')} transition-all duration-[3000ms] ease-linear w-full" id="progress-${Date.now()}"></div>
        </div>
    `;

    // Konteynera Ekle
    container.appendChild(toast);

    // Süre Çubuğunu Küçült (Animasyon)
    setTimeout(() => {
        const bar = toast.querySelector('div[id^="progress-"]');
        if(bar) bar.style.width = '0%';
    }, 10);

    // 3 Saniye Sonra Kaldır
    setTimeout(() => {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');
        
        // Animasyon bitince DOM'dan sil
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3000);
}