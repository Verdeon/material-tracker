let activeCategory;
const urlParams = new URLSearchParams(window.location.search);
const kategoriParam = urlParams.get('kategori');
activeCategory = kategoriParam ? kategoriParam : 'all';

// --- Quantity Control Functions ---
function incrementQuantity() {
    const quantityInput = document.getElementById('quantity');
    let currentValue = parseInt(quantityInput.value);
    quantityInput.value = currentValue + 1;
    updateCarbonEmission();
}

function decrementQuantity() {
    const quantityInput = document.getElementById('quantity');
    let currentValue = parseInt(quantityInput.value);
    if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
        updateCarbonEmission();
    }
}

// --- Image Selection Function ---
function changeImage(color) {
    const mainImage = document.getElementById('mainImage');
    const thumbnails = document.querySelectorAll('.thumbnail');

    // Remove 'active' class from all thumbnails
    thumbnails.forEach(thumb => thumb.classList.remove('active'));

    // Update main image color and add 'active' class to clicked thumbnail
    // Note: Your SVGs are placeholders, so this changes the fill color.
    // If you had actual image URLs, you'd change mainImage.src
    switch (color) {
        case 'green':
            mainImage.classList.remove('text-red-600', 'text-yellow-500', 'text-blue-600');
            mainImage.classList.add('text-green-600');
            document.querySelector('.thumbnail[onclick="changeImage(\'green\')"]').classList.add('active');
            break;
        case 'red':
            mainImage.classList.remove('text-green-600', 'text-yellow-500', 'text-blue-600');
            mainImage.classList.add('text-red-600');
            document.querySelector('.thumbnail[onclick="changeImage(\'red\')"]').classList.add('active');
            break;
        case 'yellow':
            mainImage.classList.remove('text-green-600', 'text-red-600', 'text-blue-600');
            mainImage.classList.add('text-yellow-500');
            document.querySelector('.thumbnail[onclick="changeImage(\'yellow\')"]').classList.add('active');
            break;
        case 'blue':
            mainImage.classList.remove('text-green-600', 'text-red-600', 'text-yellow-500');
            mainImage.classList.add('text-blue-600');
            document.querySelector('.thumbnail[onclick="changeImage(\'blue\')"]').classList.add('active');
            break;
    }
}


// --- Shopping Cart / Warehouse Logic ---
function updateCartCount(count) {
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = count;
        localStorage.setItem('cartCount', count); // Save to localStorage
    }
    // Update the warehouse total (assuming 1 unit of product adds 1g for simplicity)
    const warehouseTotalElement = document.querySelector('.header .font-semibold.text-green-700');
    if (warehouseTotalElement) {
        warehouseTotalElement.textContent = `${count}.00 g`; // Update with the new total
    }
}

// Function to calculate and update carbon emission on product-page.html
function updateCarbonEmission() {
    const quantityInput = document.getElementById('quantity');
    const carbonPerUnitDisplay = document.getElementById('carbon-per-unit');
    const totalCarbonDisplay = document.getElementById('total-carbon-emission');

    if (!quantityInput || !carbonPerUnitDisplay || !totalCarbonDisplay) {
        // Not on the product-page.html, or elements not found
        return;
    }

    const quantity = parseInt(quantityInput.value) || 0;
    // Ensure data-carbon is parsed as a float
    const carbonPerUnit = parseFloat(carbonPerUnitDisplay.dataset.carbon) || 0; // Get base carbon from data attribute

    const totalCarbon = quantity * carbonPerUnit;
    totalCarbonDisplay.textContent = `${totalCarbon} g CO₂`;
}


// --- Global Logic for both index.html and product-page.html ---
document.addEventListener('DOMContentLoaded', function() {
    // Load cart count from localStorage on page load
    const savedCartCount = localStorage.getItem('cartCount');
    if (savedCartCount !== null) {
        updateCartCount(parseInt(savedCartCount));
    }

    // --- Product Page Specific Logic ---
    // Check if we are on product-page.html by checking for a specific element ID present only on that page
    if (document.getElementById('product-page-container')) {
        // Event listeners for quantity buttons
        const incrementButton = document.getElementById('increment-quantity');
        const decrementButton = document.getElementById('decrement-quantity');
        const quantityInput = document.getElementById('quantity');

        if (incrementButton) {
            incrementButton.addEventListener('click', incrementQuantity);
        }
        if (decrementButton) {
            decrementButton.addEventListener('click', decrementQuantity);
        }
        if (quantityInput) {
            quantityInput.addEventListener('change', updateCarbonEmission);
            quantityInput.addEventListener('keyup', updateCarbonEmission); // For real-time updates while typing
        }

        // Add event listener for the "Depoya ekle" button
        const addToWarehouseButton = document.getElementById('add-to-cart');
        if (addToWarehouseButton) {
            addToWarehouseButton.addEventListener('click', function() {
                let currentCartCount = parseInt(document.getElementById('cartCount').textContent);
                const quantityToAdd = parseInt(document.getElementById('quantity').value);
                updateCartCount(currentCartCount + quantityToAdd);
            });
        }

        // --- Handle dynamic product details on product-page.html ---
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const productCategory = urlParams.get('category');

        if (productId && productCategory) {
            fetch('products.json')
                .then(response => response.json())
                .then(data => {
                    const categoryProducts = data[productCategory];
                    if (categoryProducts) {
                        const product = categoryProducts.find(p => p.id === productId);
                        if (product) {
                            document.getElementById('product-name').textContent = product.name;
                            document.getElementById('product-description').textContent = product.desc;
                            // Set both textContent and data-carbon for calculation
                            document.getElementById('carbon-per-unit').textContent = `${product.carbon} g CO₂`;
                            document.getElementById('carbon-per-unit').dataset.carbon = product.carbon; // Store carbon value

                            const mainImage = document.getElementById('mainImage');
                            if (mainImage && product.image) {
                                mainImage.src = product.image;
                                mainImage.alt = product.name;
                            }

                            // Update recommendation badge if applicable
                            const recommendationBadge = document.getElementById('recommendation-badge');
                            if (recommendationBadge) {
                                recommendationBadge.textContent = product.rating;
                                recommendationBadge.className = 'recommend-badge'; // Reset classes
                                if (product.rating === 'Çok Önerilen') {
                                    recommendationBadge.classList.add('bg-green-500');
                                } else if (product.rating === 'Önerilen') {
                                    recommendationBadge.classList.add('bg-yellow-500');
                                } else if (product.rating === 'Az Önerilen') {
                                    recommendationBadge.classList.add('bg-orange-500');
                                } else if (product.rating === 'Önerilmeyen') {
                                    recommendationBadge.classList.add('bg-red-500');
                                }
                            }
                            // Crucial: Call updateCarbonEmission after product data and data-carbon are set
                            updateCarbonEmission();
                        } else {
                            console.error('Product not found:', productId);
                        }
                    } else {
                        console.error('Category not found:', productCategory);
                    }
                })
                .catch(error => console.error('Error fetching products:', error));
        }
    }


    // --- Products Listing Page Specific Logic (Search and Category Filtering) ---
    // Check if we are on products-listing.html by checking for a specific element ID present only on that page
    if (document.getElementById('products-listing-page')) {
        const productCardsContainer = document.getElementById('product-cards-container');
        const searchInput = document.getElementById('search-input');
        const categoryButtonsContainer = document.getElementById('category-buttons');
        let allProducts = {}; // To store all products fetched from JSON

        // Function to render product cards
        function renderProducts(productsToRender) {
            const productCardsContainer = document.getElementById('product-cards-container');
            productCardsContainer.innerHTML = ''; // Clear existing products

            if (productsToRender.length === 0) {
                productCardsContainer.innerHTML = '<p class="text-center text-gray-600 col-span-full">Eşleşen ürün bulunamadı.</p>';
                return;
            }

            productsToRender.forEach(product => {
                // Determine the recommendation badge classes based on product.rating
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

                // Construct the star ratings based on the recommendation (simplified for 5 stars)
                let starsHtml = '';
                if (product.rating) {
                    const ratingMap = {
                        'Çok Önerilen': 5,
                        'Önerilen': 4,
                        'Az Önerilen': 3,
                        'Önerilmeyen': 1
                    };
                    const numberOfStars = ratingMap[product.rating] || 0; // Default to 0 stars

                    for (let i = 0; i < 5; i++) {
                        if (i < numberOfStars) {
                            starsHtml += `
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                </svg>
                            `;
                        } else {
                            starsHtml += `
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                </svg>
                            `;
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
                            <a href="product-page.html?id=${product.id}&category=${product.category}" ><h3 class="font-semibold mb-1 hover:text-green-700">${product.name}</h3></a>
                            <p class="text-gray-500 text-sm mb-2">${product.desc}</p>
                            <div class="flex justify-between items-center mt-4">
                                <div>
                                    <span class="text-green-600 font-bold ml-2">${product.carbon} g CO₂</span>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <button class="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-300 quantity-decrement-btn hidden">
                                        -
                                    </button>
                                    <input type="number" value="0" min="0" class="w-16 text-center border rounded-md p-1 focus:outline-none focus:ring focus:ring-green-400 quantity-input-field" />
                                    <button class="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring focus:ring-green-400 quantity-increment-btn">
                                        +
                                    </button>
                                </div>
                                </div>
                             <button class="bg-green-600 text-white w-full py-2 px-4 mt-4 rounded-md text-sm hover:bg-green-700 transition duration-300 add-to-cart" data-product-id="${product.id}" data-product-category="${product.category}">
                                Depoya Ekle
                             </button>
                        </div>
                    </div>
                `;
                productCardsContainer.innerHTML += productCard;
            });

            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', function () {
                    let currentCartCount = parseInt(document.getElementById('cartCount').textContent);
                    const card = button.closest('.product-card');
                    const quantityInput = card.querySelector('.quantity-input-field');
                    const quantityToAdd = parseInt(quantityInput.value) || 0;

                    if (quantityToAdd > 0) {
                        updateCartCount(currentCartCount + quantityToAdd);
                        quantityInput.value = 0;// Ürün bilgilerini al
const productId = button.dataset.productId;
const productCategory = button.dataset.productCategory;

const product = allProducts[productCategory].find(p => p.id === productId);
const selectedQuantity = quantityToAdd;

if (product) {
    const newItem = {
        id: product.id,
        name: product.name,
        desc: product.desc,
        image: product.image,
        carbon: product.carbon,
        quantity: selectedQuantity,
        category: product.category
    };

    let warehouseItems = JSON.parse(localStorage.getItem('warehouseItems')) || [];

    const existing = warehouseItems.find(i => i.id === newItem.id && i.category === newItem.category);
    if (existing) {
        existing.quantity += selectedQuantity;
    } else {
        warehouseItems.push(newItem);
    }

    localStorage.setItem('warehouseItems', JSON.stringify(warehouseItems));
}

                    } else {
                        alert('Lütfen eklenecek ürün miktarını seçin.');
                    }
                });
            });

            document.querySelectorAll('.product-card').forEach(card => {
                const quantityInput = card.querySelector('.quantity-input-field');
                const incrementButton = card.querySelector('.quantity-increment-btn');
                const decrementButton = card.querySelector('.quantity-decrement-btn');

                quantityInput.value = 0;
                decrementButton.classList.add('hidden');
                quantityInput.classList.add('hidden')

                incrementButton.addEventListener('click', () => {
                    let currentValue = parseInt(quantityInput.value) || 0;
                    quantityInput.value = currentValue + 1;
                    decrementButton.classList.remove('hidden');
                    quantityInput.classList.remove('hidden')
                });

                decrementButton.addEventListener('click', () => {
                    let currentValue = parseInt(quantityInput.value) || 0;
                    if (currentValue > 0) {
                        quantityInput.value = currentValue - 1;
                        if (quantityInput.value == 0) {
                            decrementButton.classList.add('hidden');
                            quantityInput.classList.add('hidden')
                        }
                    }
                });

                quantityInput.addEventListener('change', () => {
                    let val = parseInt(quantityInput.value);
                    if (isNaN(val) || val < 0) {
                        quantityInput.value = 0;
                    }
                    if (quantityInput.value == 0) {
                        decrementButton.classList.add('hidden');
                    } else {
                        decrementButton.classList.remove('hidden');
                    }
                });

                quantityInput.addEventListener('keyup', () => {
                    let val = parseInt(quantityInput.value);
                    if (isNaN(val) || val < 0) {
                        quantityInput.value = 0;
                    }
                    if (quantityInput.value == 0) {
                        decrementButton.classList.add('hidden');
                    } else {
                        decrementButton.classList.remove('hidden');
                    }
                });
            });
        }


        // Function to filter products
        function filterProducts() {
            const searchTerm = searchInput.value.toLowerCase();
            let allFlatProducts = [];

            for (const category in allProducts) {
                allProducts[category].forEach(product => {
                    product.category = category; // Add category to product object
                    allFlatProducts.push(product);
                });
            }

            if (activeCategory !== 'all') {
                allFlatProducts = allFlatProducts.filter(p => p.category === activeCategory);
            }

            if (searchTerm) {
                allFlatProducts = allFlatProducts.filter(p =>
                    p.name.toLowerCase().includes(searchTerm) ||
                    p.desc.toLowerCase().includes(searchTerm) ||
                    p.id.toLowerCase().includes(searchTerm)
                );
            }

            renderProducts(allFlatProducts);
        }

        // Fetch products and initialize
        fetch('products.json')
            .then(response => response.json())
            .then(data => {
                allProducts = data;
                const categories = ['all', ...Object.keys(data)];

                categories.forEach(category => {
                    const button = document.createElement('li');
                    button.textContent = category === 'all' ? 'Tüm Kategoriler' : category.charAt(0).toUpperCase() + category.slice(1);
                    button.classList.add('block', 'px-4', 'py-2', 'cursor-pointer');

                    button.dataset.category = category;

                    button.addEventListener('click', () => {
                        activeCategory = category;

                        // URL güncelle
                        const newUrl = `${window.location.pathname}?kategori=${encodeURIComponent(category)}`;
                        history.pushState(null, '', newUrl);

                        // Kategori adı güncelle
                        categoryShow();

                        // Buton stillerini güncelle
                        document.querySelectorAll('#category-buttons li').forEach(btn => {
                            if (btn.dataset.category === activeCategory) {
                                btn.classList.remove('bg-white', 'text-gray-800', 'hover:bg-gray-100');
                                btn.classList.add('bg-green-600', 'text-white', 'hover:bg-green-800');
                            } else {
                                btn.classList.remove('bg-green-600', 'text-white', 'hover:bg-green-800');
                                btn.classList.add('bg-white', 'text-gray-800', 'hover:bg-gray-100');
                            }
                        });

                        // Ürünleri filtrele
                        filterProducts();
                    });

                    categoryButtonsContainer.appendChild(button);
                });

                // Apply initial active category styling after buttons are created
                document.querySelectorAll('#category-buttons li').forEach(btn => {
                    if (btn.dataset.category === activeCategory) {
                        btn.classList.remove('bg-white', 'text-gray-800', 'hover:bg-gray-100');
                        btn.classList.add('bg-green-600', 'text-white', 'hover:bg-green-800');
                    } else {
                        btn.classList.remove('bg-green-600', 'text-white', 'hover:bg-green-800');
                        btn.classList.add('bg-white', 'text-gray-800', 'hover:bg-gray-100');
                    }
                });

                // Sayfa açıldığında ürünleri ve başlığı göster
                categoryShow();
                filterProducts();
            })
            .catch(error => console.error('Error fetching products:', error));


        // Event listener for search input
        searchInput.addEventListener('keyup', filterProducts);
        searchInput.addEventListener('change', filterProducts);
    }

    const addToCartButton = document.getElementById('add-to-cart');
    if (addToCartButton) {
        addToCartButton.addEventListener('click', function() {
            let currentCartCount = parseInt(document.getElementById('cartCount').textContent);
            const quantityToAdd = parseInt(document.getElementById('quantity').value);
            updateCartCount(currentCartCount + quantityToAdd);
        });
    }
});

const activeCategoryLabel = document.getElementById('active-category');

function categoryShow() {
  activeCategoryLabel.textContent =
    activeCategory === 'all'
      ? 'Tüm Kategoriler'
      : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1);
}

// --- Product Tabs Functionality (assuming this is for product-page.html based on context) ---
document.addEventListener('DOMContentLoaded', function() {
    // Only apply tab functionality if the elements are present
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabButtons.length > 0 && tabContents.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active classes
                tabButtons.forEach(btn => {
                    btn.classList.remove('tab-active', 'border-green-600', 'text-green-600');
                    btn.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700');
                });
                tabContents.forEach(content => content.classList.add('hidden'));

                // Add active class to clicked button and show corresponding content
                const targetTab = button.dataset.tab;
                button.classList.add('tab-active', 'border-green-600', 'text-green-600');
                button.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700');
                document.getElementById(targetTab).classList.remove('hidden');
            });
        });

        // Initial active tab setup
        const initialActiveTabButton = document.querySelector('.tab-button.tab-active');
        if (initialActiveTabButton) {
             const targetTab = initialActiveTabButton.dataset.tab;
             document.getElementById(targetTab).classList.remove('hidden');
             initialActiveTabButton.classList.add('border-green-600', 'text-green-600');
             initialActiveTabButton.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700');
        } else {
             // Fallback: If no initial active class, make the first tab active
             if (tabButtons.length > 0) {
                 tabButtons[0].click();
             }
        }
    }
});

// script.js (ilgili kısım)
function addToWarehouse(productId, category, quantity) {
    const warehouseKey = 'warehouse'; // BURASI DOĞRU
    let warehouse = JSON.parse(localStorage.getItem(warehouseKey)) || [];

    const existingItem = warehouse.find(item => item.id === productId && item.category === category);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        // ... ürün detaylarını bulma ve ekleme mantığı ...
        warehouse.push({ id: productId, category: category, quantity: quantity, /* diğer detaylar */ });
    }
    localStorage.setItem(warehouseKey, JSON.stringify(warehouse)); // BURASI DOĞRU
    // Sepet sayısını güncellemek için global fonksiyonu çağır
    if (typeof window.updateCartCount === 'function') {
        window.updateCartCount();
    }
}