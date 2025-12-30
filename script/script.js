let activeCategory;
const urlParams = new URLSearchParams(window.location.search);
const kategoriParam = urlParams.get('kategori');
activeCategory = kategoriParam ? kategoriParam : 'all';
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

// Depo Ekleme Fonksiyonu
function addToWarehouse(materialId, category, quantity, name, image, desc, carbon) {
    const warehouseKey = 'warehouse';
    let warehouse = JSON.parse(localStorage.getItem(warehouseKey)) || [];

    const existingItem = warehouse.find(item => item.id === materialId); // Kategori kontrolüne gerek yok, ID unique varsayılır

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        warehouse.push({
            id: materialId,
            category: category,
            quantity: quantity,
            name: name,
            image: image,
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

    // --- Veri Çekme ve Kategori Butonları ---
    
    const categoryButtonsContainer = document.getElementById('category-buttons');
    
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
                const category = span.dataset.category;
                const count = allMaterials.filter(m => m.category === category).length;
                span.textContent = `${count} malzeme`;
            });

            // Eğer kategori butonları alanı varsa (Listing sayfası veya sidebar)
            if (categoryButtonsContainer) {
                categoryButtonsContainer.innerHTML = ''; // Temizle

                // "Tüm Kategoriler" Butonu
                const allButton = document.createElement('button');
                allButton.textContent = 'Tüm Kategoriler';
                // 1. Kodun stilini koruduk
                allButton.className = `category-button px-3 py-1 m-1 rounded cursor-pointer ${activeCategory === 'all' ? 'bg-green-600 text-white' : 'bg-green-300 hover:bg-gray-500'}`;
                allButton.addEventListener('click', () => {
                    window.location.href = 'materials-listing.html';
                });
                categoryButtonsContainer.appendChild(allButton);

                // Dinamik Kategoriler
                const uniqueCategories = [...new Set(allMaterials.map(m => m.category))];

                uniqueCategories.forEach(category => {
                    const button = document.createElement('button');
                    button.textContent = category;
                    // Aktif kategori kontrolü ile stil
                    const isActive = category === activeCategory;
                    button.className = `category-button px-3 py-1 m-1 rounded cursor-pointer ${isActive ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-400'}`;
                    
                    button.addEventListener('click', () => {
                        window.location.href = `materials-listing.html?kategori=${encodeURIComponent(category)}`;
                    });
                    categoryButtonsContainer.appendChild(button);
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
                                        material.category,
                                        quantityToAdd,
                                        material.name,
                                        material.image,
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
        const activeCategoryLabel = document.getElementById('active-category');

        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('search'); // URL'deki ?search=... kısmını al

        if (searchParam && searchInput) {
            // Eğer arama varsa kutucuğa yaz
            searchInput.value = searchParam; 
        }

        // Başlığı Güncelle
        if (activeCategoryLabel) {
            activeCategoryLabel.textContent = activeCategory === 'all' ? 'Tüm Kategoriler' : activeCategory;
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

            // Kategori Filtresi
            if (activeCategory !== 'all') {
                filteredList = filteredList.filter(p => p.category === activeCategory);
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
                const depotInfo = warehouseItem
                ? `<p class="text-sm text-green-600 mt-1 depot-info" data-id="${material.id}">Depoda ${warehouseItem.quantity} adet var</p>`
                : `<p class="text-sm text-green-600 mt-1 depot-info" data-id="${material.id}"></p>`;

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

                // Kart Yapısı
                const materialCard = `
                <div class="material-card bg-white rounded-xl shadow-sm hover:shadow-lg transition border border-gray-100 overflow-hidden group flex flex-col h-full">
                    <div class="h-48 relative overflow-hidden">
                        <img src="${material.image}" alt="${material.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    </div>

                    <div class="p-5 flex-1 flex flex-col justify-between">
                        <div>
                            <div class="flex text-yellow-400 mb-1">
                                ${starsHtml}
                            </div>
                            
                            <h3 class="text-lg font-bold text-gray-800 mb-1">
                                <a href="material-page.html?id=${material.id}" class="hover:text-green-600 transition">${material.name}</a>
                            </h3>
                            
                            <p class="text-sm text-gray-500 line-clamp-2 mb-2">${material.desc}</p>
                            
                            ${depotInfo}
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
                                    Depoya Ekle
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
            // "Depoya Ekle" butonları
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
                                material.category,
                                quantityToAdd,
                                material.name,
                                material.image,
                                material.description || material.desc,
                                material.carbon || material.carbon_emission
                            );
                            quantityInput.value = 0;
                            // Arayüzü sıfırla
                            const decrementButton = card.querySelector('.quantity-decrement-btn');
                            decrementButton?.classList.add('hidden');
                            quantityInput?.classList.add('hidden');
                            updateSingleDepotInfo(material.id);
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

// Yardımcı Fonksiyon: Tek bir ürünün depo bilgisini güncelle
function updateSingleDepotInfo(materialId) {
  const warehouse = JSON.parse(localStorage.getItem("warehouse")) || [];
  const item = warehouse.find(w => w.id === materialId);
  const el = document.querySelector(`.depot-info[data-id="${materialId}"]`);

  if (el) {
    if (item) {
      el.textContent = `Depoda ${item.quantity} adet var`;
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