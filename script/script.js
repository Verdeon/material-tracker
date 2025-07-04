let activeCategory;
const urlParams = new URLSearchParams(window.location.search);
const kategoriParam = urlParams.get('kategori');
activeCategory = kategoriParam ? kategoriParam : 'all';

// --- Quantity Control Functions ---
function incrementQuantity() {
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        let currentValue = parseInt(quantityInput.value);
        quantityInput.value = currentValue + 1;
        if (typeof updateCarbonEmission === 'function') { // Fonksiyonun varlığını kontrol et
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
            if (typeof updateCarbonEmission === 'function') { // Fonksiyonun varlığını kontrol et
                updateCarbonEmission();
            }
        }
    }
}

// Function to calculate and update carbon emission on product-page.html
function updateCarbonEmission() {
    const quantityInput = document.getElementById('quantity');
    const carbonPerUnitDisplay = document.getElementById('carbon-per-unit');
    const totalCarbonDisplay = document.getElementById('total-carbon-emission');

    if (!quantityInput || !carbonPerUnitDisplay || !totalCarbonDisplay) {
        return; // İlgili elemanlar yoksa fonksiyonu çalıştırma
    }

    const quantity = parseInt(quantityInput.value) || 0;
    const carbonPerUnit = parseFloat(carbonPerUnitDisplay.dataset.carbon) || 0;

    const totalCarbon = quantity * carbonPerUnit;
    totalCarbonDisplay.textContent = `${totalCarbon} g CO₂`;
}

// --- Shopping Cart / Warehouse Logic ---
// Bu fonksiyonu kaldırıyoruz, çünkü common.js'deki updateCartCountFromWarehouse global olarak daha doğru çalışıyor.
// function updateCartCount(count) { /* ... */ }

function addToWarehouse(productId, category, quantity, name, image, desc, carbon) {
    const warehouseKey = 'warehouse';
    let warehouse = JSON.parse(localStorage.getItem(warehouseKey)) || [];

    const existingItem = warehouse.find(item => item.id === productId && item.category === category);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        warehouse.push({
            id: productId,
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

    // Sepet sayısını güncellemek için global fonksiyonu çağır
    if (typeof window.updateCartCountFromWarehouse === 'function') {
        window.updateCartCountFromWarehouse();
    } else {
        console.warn("addToWarehouse: updateCartCountFromWarehouse fonksiyonu bulunamadı. common.js dosyasının doğru yüklendiğinden emin olun.");
    }
}

// --- Global DOMContentLoaded Listener (Tüm sayfalar için genel mantık burada birleştirildi) ---
document.addEventListener('DOMContentLoaded', function() {

  const categoryButtonsContainer = document.getElementById('category-buttons');
  if (!categoryButtonsContainer) return;

  const allButton = document.createElement('button');
  allButton.textContent = 'Tüm Kategoriler';
  allButton.className = 'category-button px-3 py-1 m-1 bg-green-300 rounded cursor-pointer hover:bg-gray-500';
  allButton.addEventListener('click', () => {
    window.location.href = 'products-listing.html'; // kategori filtresiz sayfa
  });
  categoryButtonsContainer.appendChild(allButton);

  fetch("products.json")
    .then(res => {
      if (!res.ok) throw new Error("JSON yüklenemedi.");
      return res.json();
    })
    .then(data => {

    Object.keys(data).forEach(category => {
        const button = document.createElement('button');
        button.textContent = category;
        button.className = 'category-button px-3 py-1 m-1 bg-gray-200 rounded cursor-pointer hover:bg-gray-400';
        button.addEventListener('click', () => {
          // Kategoriye tıklayınca products-listing.html?kategori= kategorinin adı olacak şekilde aç
          window.location.href = `products-listing.html?kategori=${encodeURIComponent(category)}`;
        });
        categoryButtonsContainer.appendChild(button);
    });

      document.querySelectorAll(".product-count").forEach(span => {
        const category = span.dataset.category;
        const count = data[category]?.length ?? 0;
        span.textContent = `${count} ürün`;
      });
    })
    .catch(err => {
      console.error("Hata:", err);
      document.querySelectorAll(".product-count").forEach(span => {
        span.textContent = "Yüklenemedi";
      });
    });

    // Sayfa yüklendiğinde sepet sayısını da güncelleyelim (common.js'den gelen)
    if (typeof window.updateCartCountFromWarehouse === 'function') {
        window.updateCartCountFromWarehouse();
    } else {
        console.warn("DOMContentLoaded: updateCartCountFromWarehouse fonksiyonu bulunamadı. common.js dosyasının doğru yüklendiğinden emin olun.");
    }

    // --- Product Page Specific Logic (product-page.html) ---
    if (document.getElementById('product-page-container')) {
        const incrementButton = document.getElementById('increment-quantity');
        const decrementButton = document.getElementById('decrement-quantity');
        const quantityInput = document.getElementById('quantity');
        const addToWarehouseButton = document.getElementById('add-to-cart'); // Ürün detay sayfasındaki "Depoya ekle" butonu

        if (incrementButton) {
            incrementButton.addEventListener('click', incrementQuantity);
        }
        if (decrementButton) {
            decrementButton.addEventListener('click', decrementQuantity);
        }
        if (quantityInput) {
            quantityInput.addEventListener('change', updateCarbonEmission);
            quantityInput.addEventListener('keyup', updateCarbonEmission);
            updateCarbonEmission(); // Sayfa yüklendiğinde karbon emisyonunu göster
        }

        if (addToWarehouseButton) {
            const productId = urlParams.get('id');
            const productCategory = urlParams.get('category');

            if (productId && productCategory) {
                fetch('products.json')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status} - products.json yüklenemedi.`);
                        }
                        return response.json();
                    })
                    .then(productsData => {
                        // productsData genellikle { "category1": [...], "category2": [...] } şeklinde gelir
                        // İlgili kategorideki ürünü bul
                        const categoryProducts = productsData[productCategory];
                        const product = categoryProducts ? categoryProducts.find(p => p.id === productId) : null;

                        if (product) {
                            addToWarehouseButton.addEventListener('click', function() {
                                const quantityToAdd = parseInt(document.getElementById('quantity')?.value || '1', 10);
                                if (quantityToAdd > 0) {
                                    addToWarehouse(
                                        product.id,
                                        product.category,
                                        quantityToAdd,
                                        product.name,
                                        product.image,
                                        product.description || product.desc,
                                        product.carbon
                                    );
                                    window.updateCarbonCountFromWarehouse()
                                } else {
                                    alert('Lütfen eklenecek ürün miktarını seçin.');
                                }
                            });
                        } else {
                            console.error("Ürün detay sayfası hatası: Ürün detayları products.json'da bulunamadı veya eşleşmedi.", {productId, productCategory});
                        }
                    })
                .catch(error => console.error('product-page products.json yüklenirken veya işlenirken hata:', error));
            } else {
                console.warn("Ürün detayları URL'den alınamadı (id veya category eksik).");
            }
        }
    }


    // --- Products Listing Page Specific Logic (products-listing.html) ---
    if (document.getElementById('products-listing-page')) {
        const productCardsContainer = document.getElementById('product-cards-container');
        const searchInput = document.getElementById('search-input');
        let allProducts = {}; // Tüm ürünleri kategori bazında saklamak için

        function renderProducts(productsToRender) {
            const productCardsContainer = document.getElementById('product-cards-container');
            if (!productCardsContainer) return;
            productCardsContainer.innerHTML = '';

            const warehouse = JSON.parse(localStorage.getItem("warehouse")) || [];

            if (productsToRender.length === 0) {
                productCardsContainer.innerHTML = '<p class="text-center text-gray-600 col-span-full">Eşleşen ürün bulunamadı.</p>';
                return;
            }

            productsToRender.forEach(product => {
                const warehouseItem = warehouse.find(item => item.id === product.id);
                const depotInfo = warehouseItem
                ? `<p class="text-sm text-green-600 mt-1 depot-info" data-id="${product.id}">Depoda ${warehouseItem.quantity} adet var</p>`
                : `<p class="text-sm text-green-600 mt-1 depot-info" data-id="${product.id}"></p>`;

                let badgeClass = '';
                if (product.rating === 'Çok Önerilen') {
                    badgeClass = 'bg-green-500';
                } else if (product.rating === 'Önerilen') {
                    badgeClass = 'bg-yellow-500';
                } else if (product.rating === 'Az Önerilen') {
                    badgeClass = 'bg-orange-500';
                } else if (product.rating === 'Önerilmeyen') {
                    badgeClass = 'bg-red-500';
                }

                let starsHtml = '';
                if (product.rating) {
                    const ratingMap = {
                        'Çok Önerilen': 5,
                        'Önerilen': 4,
                        'Az Önerilen': 3,
                        'Önerilmeyen': 1
                    };
                    const numberOfStars = ratingMap[product.rating] || 0;

                    for (let i = 0; i < 5; i++) {
                        if (i < numberOfStars) {
                            starsHtml += `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
                        } else {
                            starsHtml += `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
                        }
                    }
                }

                const productCard = `
                    <div class="product-card bg-white rounded-lg overflow-hidden shadow-md transition duration-300">
                        <div class="relative">
                            <div class="h-60 bg-gray-200 flex items-center justify-center">
                                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
                            </div>
                            ${product.rating ? `<span class="recommend-badge ${badgeClass}">${product.rating}</span>` : ''}
                        </div>
                        <div class="p-4">
                            <div class="flex items-center mb-2">
                                <div class="flex text-yellow-400">
                                    ${starsHtml}
                                </div>
                            </div>
                            <a href="product-page.html?id=${product.id}" ><h3 class="font-semibold mb-1 hover:text-green-700">${product.name}</h3></a>
                            <p class="text-gray-500 text-sm mb-2">${product.desc}</p>
                            <div class="flex justify-between items-center mt-4">
                                <div>
                                    <span class="text-green-600 font-bold ml-2">${product.carbon} g CO₂</span>${depotInfo}
                                </div>
                                <div class="flex items-center space-x-2">
                                    <button class="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-300 quantity-decrement-btn hidden">
                                        -
                                    </button>
                                    <input type="number" value="0" min="0" class="w-16 text-center border rounded-md p-1 focus:outline-none focus:ring focus:ring-green-400 quantity-input-field" data-product-id="${product.id}" data-product-category="${product.category}" />
                                    <button class="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring focus:ring-green-400 quantity-increment-btn">
                                        +
                                    </button>
                                </div>
                            </div>
                           <button class="bg-green-600 text-white w-full py-2 px-4 mt-4 rounded-md text-sm hover:bg-green-700 transition duration-300 add-to-cart-btn" data-product-id="${product.id}" data-product-category="${product.category}">
                                Depoya Ekle
                           </button>
                        </div>
                    </div>
                `;
                productCardsContainer.innerHTML += productCard;
            });

            // "Depoya Ekle" butonları için olay dinleyicileri
            document.querySelectorAll('.add-to-cart-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const card = button.closest('.product-card');
                    const quantityInput = card.querySelector('.quantity-input-field');
                    const quantityToAdd = parseInt(quantityInput?.value || '0', 10); // null veya undefined kontrolü ekledim

                    if (quantityToAdd > 0) {
                        const productId = button.dataset.productId;
                        const productCategory = button.dataset.productCategory;
                        const product = allProducts[productCategory]?.find(p => p.id === productId); // Kategoriye göre bul

                        if (product) {
                            addToWarehouse(
                                product.id,
                                product.category,
                                quantityToAdd,
                                product.name,
                                product.image,
                                product.description || product.desc,
                                product.carbon || 0 
                            );
                            quantityInput.value = 0; // Miktarı sıfırla
                            // Miktar inputu ve decrement butonunu gizle
                            const decrementButton = card.querySelector('.quantity-decrement-btn');
                            decrementButton?.classList.add('hidden');
                            quantityInput?.classList.add('hidden');
                            updateSingleDepotInfo(product.id);
                        } else {
                            console.error("Listeleme sayfasında ürün bulunamadı:", productId, productCategory);
                        }
                    } else {
                        alert('Lütfen eklenecek ürün miktarını seçin.');
                    }
                });
            });

            // Miktar kontrol butonları ve input alanları için olay dinleyicileri
            document.querySelectorAll('.product-card').forEach(card => {
                const quantityInput = card.querySelector('.quantity-input-field');
                const incrementButton = card.querySelector('.quantity-increment-btn');
                const decrementButton = card.querySelector('.quantity-decrement-btn');

                if (quantityInput) quantityInput.value = 0;
                if (decrementButton) decrementButton.classList.add('hidden');
                if (quantityInput) quantityInput.classList.add('hidden');

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

                quantityInput?.addEventListener('change', () => {
                    if (quantityInput) {
                        let val = parseInt(quantityInput.value);
                        if (isNaN(val) || val < 0) {
                            quantityInput.value = 0;
                        }
                        if (quantityInput.value == 0) {
                            decrementButton?.classList.add('hidden');
                            quantityInput?.classList.add('hidden');
                        } else {
                            decrementButton?.classList.remove('hidden');
                            quantityInput?.classList.remove('hidden');
                        }
                    }
                });

                quantityInput?.addEventListener('keyup', () => {
                    if (quantityInput) {
                        let val = parseInt(quantityInput.value);
                        if (isNaN(val) || val < 0) {
                            quantityInput.value = 0;
                        }
                        if (quantityInput.value == 0) {
                            decrementButton?.classList.add('hidden');
                            quantityInput?.classList.add('hidden');
                        } else {
                            decrementButton?.classList.remove('hidden');
                            quantityInput?.classList.remove('hidden');
                        }
                    }
                });
            });
        }

        // Fetch products and initialize
        fetch('products.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} - products.json yüklenemedi.`);
                }
                return response.json();
            })
            .then(data => {
                allProducts = data; // Tüm ürünleri sakla
                const categories = ['all', ...Object.keys(data)];

                categories.forEach(category => {
                    const button = document.createElement('li');
                    button.textContent = category === 'all' ? 'Tüm Kategoriler' : category.charAt(0).toUpperCase() + category.slice(1);
                    button.classList.add('block', 'px-4', 'py-2', 'cursor-pointer');
                    button.dataset.category = category;

                    button.addEventListener('click', () => {
                        activeCategory = category;
                        const newUrl = `${window.location.pathname}?kategori=${encodeURIComponent(category)}`;
                        history.pushState(null, '', newUrl);
                        categoryShow();
                        document.querySelectorAll('#category-buttons li').forEach(btn => {
                            if (btn.dataset.category === activeCategory) {
                                btn.classList.remove('bg-white', 'text-gray-800', 'hover:bg-gray-100');
                                btn.classList.add('bg-green-600', 'text-white', 'hover:bg-green-800');
                            } else {
                                btn.classList.remove('bg-green-600', 'text-white', 'hover:bg-green-800');
                                btn.classList.add('bg-white', 'text-gray-800', 'hover:bg-gray-100');
                            }
                        });
                        filterProducts();
                    });
                });

                document.querySelectorAll('#category-buttons li').forEach(btn => {
                    if (btn.dataset.category === activeCategory) {
                        btn.classList.remove('bg-white', 'text-gray-800', 'hover:bg-gray-100');
                        btn.classList.add('bg-green-600', 'text-white', 'hover:bg-green-800');
                    } else {
                        btn.classList.remove('bg-green-600', 'text-white', 'hover:bg-green-800');
                        btn.classList.add('bg-white', 'text-gray-800', 'hover:bg-gray-100');
                    }
                });

                categoryShow();
                filterProducts();
            })
            .catch(error => console.error('Error fetching products for listing page:', error));


        // Event listener for search input
        searchInput?.addEventListener('keyup', filterProducts);
        searchInput?.addEventListener('change', filterProducts);


        function filterProducts() {
            const searchTerm = searchInput?.value.toLowerCase() || '';
            let allFlatProducts = [];

            for (const category in allProducts) {
                allProducts[category].forEach(product => {
                    product.category = category; // Ürün objesine kategori ekle
                    allFlatProducts.push(product);
                });
            }

            if (activeCategory !== 'all') {
                allFlatProducts = allFlatProducts.filter(p => p.category === activeCategory);
            }

            if (searchTerm) {
                allFlatProducts = allFlatProducts.filter(p =>
                    p.name.toLowerCase().includes(searchTerm) ||
                    (p.desc && p.desc.toLowerCase().includes(searchTerm)) || // desc boş olabilir
                    p.id.toLowerCase().includes(searchTerm)
                );
            }            
            renderProducts(allFlatProducts);
        }
    }
});

const activeCategoryLabel = document.getElementById('active-category');

function categoryShow() {
    if (activeCategoryLabel) {
        activeCategoryLabel.textContent =
            activeCategory === 'all' ?
            'Tüm Kategoriler' :
            activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1);
    }
}


// --- Tab Functionality (product-page.html veya benzeri sayfalar için) ---
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabButtons.length > 0 && tabContents.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => {
                    btn.classList.remove('tab-active', 'border-green-600', 'text-green-600');
                    btn.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700');
                });
                tabContents.forEach(content => content.classList.add('hidden'));

                const targetTab = button.dataset.tab;
                button.classList.add('tab-active', 'border-green-600', 'text-green-600');
                button.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700');
                document.getElementById(targetTab)?.classList.remove('hidden'); // Eleman varlığını kontrol et
            });
        });

        const initialActiveTabButton = document.querySelector('.tab-button.tab-active');
        if (initialActiveTabButton) {
            const targetTab = initialActiveTabButton.dataset.tab;
            document.getElementById(targetTab)?.classList.remove('hidden');
            initialActiveTabButton.classList.add('border-green-600', 'text-green-600');
            initialActiveTabButton.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700');
        } else {
            if (tabButtons.length > 0) {
                tabButtons[0].click();
            }
        }
    }

const addToWarehouseButton = document.querySelector('[data-action="add-to-cart"]');
if (addToWarehouseButton) {
  addToWarehouseButton.addEventListener('click', () => {
    console.log("Sepete Ekle butonu tıklandı!");

    const productIdEl = document.getElementById('product-id');
    const productNameEl = document.getElementById('product-name');
    const productCarbonEl = document.getElementById('product-carbon');
    const productImageEl = document.getElementById('product-image');
    const productCategoryEl = document.getElementById('product-category');
    const productDescEl = document.getElementById('product-desc');

    const quantityInput = document.getElementById('quantity');
    const quantity = parseInt(quantityInput?.value || "1");

    // ❗ Elementler varsa içeriği alalım
    const id = productIdEl?.textContent?.trim();
    const name = productNameEl?.textContent?.trim();
    const carbon = parseInt(productCarbonEl?.textContent?.trim());
    const image = productImageEl?.getAttribute("src") || "";
    const category = productCategoryEl?.textContent?.trim();
    const desc = productDescEl?.textContent?.trim();

    if (!name || isNaN(carbon) || isNaN(quantity)) {
      console.error("Ürün bilgileri eksik veya hatalı.");
      alert("Ürün bilgileri eksik veya hatalı. Lütfen sayfayı yenileyin.");
      return;
    }

    const newItem = {
        id,
      name,
      carbon,
      image,
      category,
      desc,
      quantity,
    };

    let warehouseItems = JSON.parse(localStorage.getItem('warehouse')) || [];

    const existingItemIndex = warehouseItems.findIndex(item => item.name === newItem.name);

    if (existingItemIndex > -1) {
      warehouseItems[existingItemIndex].quantity += newItem.quantity;
    } else {
      warehouseItems.push(newItem);
    }

    localStorage.setItem('warehouse', JSON.stringify(warehouseItems));
    updateCarbonCountFromWarehouse();

    if (typeof window.updateCartCountFromWarehouse === 'function') {
      window.updateCartCountFromWarehouse();
    }
    if (typeof window.updateCarbonCountFromWarehouse === 'function') {
      window.updateCarbonCountFromWarehouse();
    }
    console.log("Güncel depo:", warehouseItems);
  });
}
    
});

function updateSingleDepotInfo(productId) {
  const warehouse = JSON.parse(localStorage.getItem("warehouse")) || [];
  const item = warehouse.find(w => w.id === productId);
  const el = document.querySelector(`.depot-info[data-id="${productId}"]`);

  if (el) {
    if (item) {
      el.textContent = `Depoda ${item.quantity} adet var`;
    } else {
      el.textContent = "";
    }
  }
}