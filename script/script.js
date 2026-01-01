let activeMaterialClass;
const urlParams = new URLSearchParams(window.location.search);
const material_class = urlParams.get('material_class');
activeMaterialClass = material_class ? material_class : 'all';
let allMaterials = []; // Global değişken olarak tanımladık, her yerden erişilebilsin

// --- Quantity Control Functions ---
function incrementQuantity() {
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        let currentValue = parseInt(quantityInput.value);
        quantityInput.value = currentValue + 1;
        if (typeof updateCarbonEmission === 'function') {
            updateCarbonEmission();
        }
    }
}

function decrementQuantity() {
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
            if (typeof updateCarbonEmission === 'function') {
                updateCarbonEmission();
            }
        }
    }
}

// Function to calculate and update carbon emission on material-page.html
function updateCarbonEmission() {
    const quantityInput = document.getElementById('quantity');
    const carbonPerUnitDisplay = document.getElementById('carbon-per-unit');
    const totalCarbonDisplay = document.getElementById('total-carbon-emission');

    if (!quantityInput || !carbonPerUnitDisplay || !totalCarbonDisplay) {
        return;
    }

    const quantity = parseInt(quantityInput.value) || 0;
    const carbonPerUnit = parseFloat(carbonPerUnitDisplay.dataset.carbon) || 0;

    const totalCarbon = quantity * carbonPerUnit;
    totalCarbonDisplay.textContent = `${totalCarbon} g CO₂`;
}

// Metraj Ekleme Fonksiyonu
function addToWarehouse(materialId, material_class, quantity, name, desc, carbon) {
    const warehouseKey = 'warehouse';
    let warehouse = JSON.parse(localStorage.getItem(warehouseKey)) || [];

    const existingItem = warehouse.find(item => item.id === materialId); // Malzeme Sınıfı kontrolüne gerek yok, ID unique varsayılır

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        warehouse.push({
            id: materialId,
            material_class: material_class,
            quantity: quantity,
            name: name,
            desc: desc,
            carbon: carbon
        });
    }

    localStorage.setItem(warehouseKey, JSON.stringify(warehouse));
    updateCarbonCountFromWarehouse();

    if (typeof window.updateCartCountFromWarehouse === 'function') {
        window.updateCartCountFromWarehouse();
    } else {
        console.warn("addToWarehouse: updateCartCountFromWarehouse fonksiyonu bulunamadı.");
    }
}

// --- Global DOMContentLoaded Listener ---
document.addEventListener('DOMContentLoaded', function() {

    // --- Veri Çekme ve Malzeme Sınıfı Butonları ---
    
    const material_classButtonsContainer = document.getElementById('material_class-buttons');
    
    // Veriyi çekiyoruz (Tüm sayfalar için ortak)
    fetch("materials.json")
        .then(res => {
            if (!res.ok) throw new Error("JSON yüklenemedi.");
            return res.json();
        })
        .then(data => {
            //Veriyi 'materials' array'inden alıyoruz
            allMaterials = data.materials || []; 

            // Sayıların güncellenmesi (Sidebar vb. için)
            document.querySelectorAll(".material-count").forEach(span => {
                const material_class = span.dataset.material_class;
                const count = allMaterials.filter(m => m.material_class === material_class).length;
                span.textContent = `${count} malzeme`;
            });

            // Eğer malzeme sınıfı butonları alanı varsa (Listing sayfası veya sidebar)
            if (material_classButtonsContainer) {
                material_classButtonsContainer.innerHTML = ''; // Temizle

                // "Tüm Malzeme Sınıfları" Butonu
                const allButton = document.createElement('button');
                allButton.textContent = 'Tüm Malzeme Sınıfları';
                // 1. Kodun stilini koruduk
                allButton.className = `material_class-button px-3 py-1 m-1 rounded cursor-pointer ${activeMaterialClass === 'all' ? 'bg-green-600 text-white' : 'bg-green-300 hover:bg-gray-500'}`;
                allButton.addEventListener('click', () => {
                    window.location.href = 'materials-listing.html';
                });
                material_classButtonsContainer.appendChild(allButton);

                // Dinamik Malzeme Sınıfları
                const uniqueCategories = [...new Set(allMaterials.map(m => m.material_class))];

                uniqueCategories.forEach(material_class => {
                    const button = document.createElement('button');
                    button.textContent = material_class;
                    // Aktif malzeme sınıfı kontrolü ile stil
                    const isActive = material_class === activeMaterialClass;
                    button.className = `material_class-button px-3 py-1 m-1 rounded cursor-pointer ${isActive ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-400'}`;
                    
                    button.addEventListener('click', () => {
                        window.location.href = `materials-listing.html?material_class=${encodeURIComponent(material_class)}`;
                    });
                    material_classButtonsContainer.appendChild(button);
                });
            }

            // Eğer Listeleme Sayfasındaysak listeyi render et
            if (document.getElementById('materials-listing-page')) {
                initializeListingPage();
            }

        })
        .catch(err => {
            console.error("Hata:", err);
            document.querySelectorAll(".material-count").forEach(span => span.textContent = "Yüklenemedi");
        });

    // Sepet sayısını güncelle
    if (typeof window.updateCartCountFromWarehouse === 'function') {
        window.updateCartCountFromWarehouse();
    }


    // --- Material Page Specific Logic (material-page.html) ---
        const incrementButton = document.getElementById('increment-quantity');
        const decrementButton = document.getElementById('decrement-quantity');
        const quantityInput = document.getElementById('quantity');
        const addToWarehouseButton = document.querySelector('[data-action="add-to-warehouse"]');;

        if (incrementButton) incrementButton.addEventListener('click', incrementQuantity);
        if (decrementButton) decrementButton.addEventListener('click', decrementQuantity);
        if (quantityInput) {
            quantityInput.addEventListener('change', updateCarbonEmission);
            quantityInput.addEventListener('keyup', updateCarbonEmission);
            updateCarbonEmission();
        }

        if (addToWarehouseButton) {
            const materialId = urlParams.get('id');

            if (materialId) {
                // Fetch tekrar çağrılıyor çünkü detay sayfası bağımsız açılabilir
                fetch('materials.json')
                    .then(response => response.json())
                    .then(data => {
                        // GÜNCELLEME: data.materials içinden ID'ye göre buluyoruz
                        const materialsArray = data.materials || [];
                        const material = materialsArray.find(p => p.id === materialId);

                        if (material) {
                            addToWarehouseButton.addEventListener('click', function() {
                                const quantityToAdd = parseInt(document.getElementById('quantity')?.value || '1', 10);
                                if (quantityToAdd > 0) {
                                    addToWarehouse(
                                        material.id,
                                        material.material_class,
                                        quantityToAdd,
                                        material.name,
                                        material.description || material.desc,
                                        material.carbon || material.carbon_emission
                                    );
                                    if(typeof window.updateCarbonCountFromWarehouse === 'function') window.updateCarbonCountFromWarehouse();
                                } else {
                                    alert('Lütfen eklenecek malzeme miktarını seçin.');
                                }
                            });
                        } else {
                            console.error("Malzeme bulunamadı:", materialId);
                        }
                    })
                    .catch(error => console.error('Hata:', error));
            }
        }

    // --- Materials Listing Page Specific Logic (materials-listing.html) ---
    function initializeListingPage() {
        if (!document.getElementById('materials-listing-page')) return;

        const materialCardsContainer = document.getElementById('material-cards-container');
        const searchInput = document.getElementById('search-input');
        const activeMaterialClassLabel = document.getElementById('active-material_class');

        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('search'); // URL'deki ?search=... kısmını al

        if (searchParam && searchInput) {
            // Eğer arama varsa kutucuğa yaz
            searchInput.value = searchParam; 
        }

        // Başlığı Güncelle
        if (activeMaterialClassLabel) {
            activeMaterialClassLabel.textContent = activeMaterialClass === 'all' ? 'Tüm Malzeme Sınıfları' : activeMaterialClass;
        }

        // Listeyi Filtrele ve Göster (İlk Yükleme)
        filterMaterials();

        // Arama Dinleyicileri
        searchInput?.addEventListener('keyup', filterMaterials);
        searchInput?.addEventListener('change', filterMaterials);

        // Filtreleme Fonksiyonu
        function filterMaterials() {
            const searchTerm = searchInput?.value.toLowerCase() || '';
            
            // allMaterials (data.materials)
            let filteredList = allMaterials;

            // Malzeme Sınıfı Filtresi
            if (activeMaterialClass !== 'all') {
                filteredList = filteredList.filter(p => p.material_class === activeMaterialClass);
            }

            // Arama Filtresi
            if (searchTerm) {
                filteredList = filteredList.filter(p =>
                    p.name.toLowerCase().includes(searchTerm) ||
                    (p.desc && p.desc.toLowerCase().includes(searchTerm)) ||
                    p.id.toLowerCase().includes(searchTerm)
                );
            }

            renderMaterials(filteredList);
        }

        // Kartları Ekrana Basma Fonksiyonu
        function renderMaterials(materialsToRender) {
            if (!materialCardsContainer) return;
            materialCardsContainer.innerHTML = '';

            const warehouse = JSON.parse(localStorage.getItem("warehouse")) || [];

            if (materialsToRender.length === 0) {
                materialCardsContainer.innerHTML = '<p class="text-center text-gray-600 col-span-full">Eşleşen malzeme bulunamadı.</p>';
                return;
            }

            materialsToRender.forEach(material => {
                const warehouseItem = warehouse.find(item => item.id === material.id);
                const metrajInfo = warehouseItem
                ? `<p class="text-sm text-green-600 mt-1 metraj-info" data-id="${material.id}">Metrajda ${warehouseItem.quantity} adet var</p>`
                : `<p class="text-sm text-green-600 mt-1 metraj-info" data-id="${material.id}"></p>`;

                // Yıldız HTML oluşturma
                let starsHtml = '';
                const ratingMap = { 'Çok Önerilen': 5, 'Önerilen': 4, 'Az Önerilen': 3, 'Önerilmeyen': 2, 'Hiç Önerilmeyen': 1 };
                const numberOfStars = ratingMap[material.rating] || 0;

                for (let i = 0; i < 5; i++) {
                    if (i < numberOfStars) {
                        starsHtml += `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
                    } else {
                        starsHtml += `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
                    }
                }

                let materialImg = './img/banner.png';
                if (material.material_class === "Tuğla") {
                    materialImg = "./img/Brick.svg";
                } else if (material.material_class === "Çimento") {
                    materialImg = "./img/Cement.svg";
                } else if (material.material_class === "Beton") {
                    materialImg = "./img/Concrete.svg";
                } else if (material.material_class === "Ahşap") {
                    materialImg = "./img/Wood.svg";
                } else if (material.material_class === "Çelik") {
                    materialImg = "./img/Steel.svg";
                } else if (material.material_class === "Yalıtım") {
                    materialImg = "./img/Isolation.svg";
                } else if (material.material_class === "Cam") {
                    materialImg = "./img/Glass.svg";
                } else if (material.material_class === "Zemin") {
                    materialImg = "./img/Tile.svg";
                }
                else {
                    materialImg = './img/banner.png';
                }

                // Kart Yapısı
               const materialCard = `
<div class="material-card bg-white rounded-xl shadow-sm hover:shadow-lg transition border border-gray-100 overflow-hidden group flex flex-col h-full">
    <div class="p-5 flex-1 flex flex-col justify-between">
        
        <div class="flex justify-between items-start gap-3 mb-2">
            
            <div class="flex flex-col flex-1 pr-2">
                <div class="flex text-yellow-400 mb-1 text-xs">
                    ${starsHtml}
                </div>

                <h3 class="text-lg font-bold text-gray-800 mb-1 leading-tight">
                    <a href="material-page.html?id=${material.id}" class="hover:text-green-600 transition">${material.name}</a>
                </h3>

                <p class="text-sm text-gray-500 line-clamp-2 mb-2">${material.desc}</p>
                
                ${metrajInfo}
            </div>

            <div class="w-16 h-16 flex-shrink-0 bg-gray-50 rounded-lg p-2 flex items-center justify-center">
                <img src="${materialImg}" alt="${material.name}" class="w-full h-full object-contain" />
            </div>

        </div>
        
        <div class="flex justify-between items-center border-t pt-3 mt-2">
            
            <div class="flex flex-col">
                <span class="text-[10px] uppercase text-gray-400 font-bold">Emisyon</span>
                <span class="text-green-600 font-bold text-sm">🌱 ${material.carbon || material.carbon_emission} g CO₂</span>
            </div>
            
            <div class="flex gap-2 items-center">
                <div class="flex items-center bg-gray-100 rounded-lg p-1">
                    <button class="px-2 py-1 text-gray-600 hover:text-red-500 focus:outline-none quantity-decrement-btn hidden font-bold text-lg">-</button>
                    <input type="number" value="0" min="1" class="w-10 bg-transparent text-center text-sm font-semibold focus:outline-none quantity-input-field hidden" data-material-id="${material.id}" />
                    <button class="px-2 py-1 text-gray-600 hover:text-green-600 focus:outline-none quantity-increment-btn font-bold text-lg">+</button>
                </div>

                <button class="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition add-to-warehouse-btn shadow-md whitespace-nowrap" data-material-id="${material.id}">
                    Metraja İşle
                </button>
            </div>
        </div>
    </div>
</div>
`;
                materialCardsContainer.innerHTML += materialCard;
            });

            setupCardEventListeners(allMaterials);
        }

        // Kart içi butonların olaylarını tanımlama (Event Listeners)
        function setupCardEventListeners(materialsSource) {
            // "Metraja İşle" butonları
            document.querySelectorAll('.add-to-warehouse-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const card = button.closest('.material-card');
                    const quantityInput = card.querySelector('.quantity-input-field');
                    const quantityToAdd = parseInt(quantityInput?.value || '0', 10);

                    if (quantityToAdd > 0) {
                        const materialId = button.dataset.materialId;
                        const material = materialsSource.find(p => p.id === materialId);

                        if (material) {
                            addToWarehouse(
                                material.id,
                                material.material_class,
                                quantityToAdd,
                                material.name,
                                material.description || material.desc,
                                material.carbon || material.carbon_emission
                            );
                            quantityInput.value = 0;
                            // Arayüzü sıfırla
                            const decrementButton = card.querySelector('.quantity-decrement-btn');
                            decrementButton?.classList.add('hidden');
                            quantityInput?.classList.add('hidden');
                            updateSingleMetrajInfo(material.id);
                        }
                    } else {
                        alert('Lütfen eklenecek malzeme miktarını seçin.');
                    }
                });
            });

            // Miktar Arttırma/Azaltma Butonları
            document.querySelectorAll('.material-card').forEach(card => {
                const quantityInput = card.querySelector('.quantity-input-field');
                const incrementButton = card.querySelector('.quantity-increment-btn');
                const decrementButton = card.querySelector('.quantity-decrement-btn');

                incrementButton?.addEventListener('click', () => {
                    if (quantityInput) {
                        let currentValue = parseInt(quantityInput.value) || 0;
                        quantityInput.value = currentValue + 1;
                        decrementButton?.classList.remove('hidden');
                        quantityInput?.classList.remove('hidden');
                    }
                });

                decrementButton?.addEventListener('click', () => {
                    if (quantityInput) {
                        let currentValue = parseInt(quantityInput.value) || 0;
                        if (currentValue > 0) {
                            quantityInput.value = currentValue - 1;
                            if (quantityInput.value == 0) {
                                decrementButton.classList.add('hidden');
                                quantityInput.classList.add('hidden');
                            }
                        }
                    }
                });
            });
        }
    }
});

// Yardımcı Fonksiyon: Tek bir ün metraj bilgisini güncelle
function updateSingleMetrajInfo(materialId) {
  const warehouse = JSON.parse(localStorage.getItem("warehouse")) || [];
  const item = warehouse.find(w => w.id === materialId);
  const el = document.querySelector(`.metraj-info[data-id="${materialId}"]`);

  if (el) {
    if (item) {
      el.textContent = `Metraj cetvelinde ${item.quantity} adet var`;
    } else {
      el.textContent = "";
    }
  }
}

// --- Tab Functionality ---
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => {
                    btn.classList.remove('tab-active', 'border-green-600', 'text-green-600');
                    btn.classList.add('border-transparent', 'text-gray-500');
                });
                tabContents.forEach(content => content.classList.add('hidden'));

                const targetTab = button.dataset.tab;
                button.classList.add('tab-active', 'border-green-600', 'text-green-600');
                document.getElementById(targetTab)?.classList.remove('hidden');
            });
        });
        if(tabButtons[0]) tabButtons[0].click();
    }
});