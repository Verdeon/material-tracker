fetch('products.json')
  .then(response => response.json())
  .then(data => {
    // Tüm ürünleri düz bir diziye çevir (kategori bilgisiyle)
    let allFlatProducts = [];
    for (const category in data) {
      data[category].forEach(product => {
        product.category = category;
        allFlatProducts.push(product);
      });
    }

    // Çok önerilen ürünleri filtrele
    const popularProducts = allFlatProducts.filter(p => p.rating === "Çok Önerilen");

    // Popüler ürünleri render et
    renderPopularProducts(popularProducts);

    // ... diğer işlemler
  });

// JavaScript dosyanızda (muhtemelen script.js veya ayrı bir .js dosyası)
function renderPopularProducts(products) {
    const container = document.getElementById('popular-products-container');
    container.innerHTML = ''; // Konteyneri her render işleminden önce temizle

    if (products.length === 0) {
        container.innerHTML = '<p class="text-gray-600 text-center col-span-full">Popüler ürün bulunamadı.</p>';
        return;
    }

    products.forEach(product => {
        const productHTML = `
            <div class="product-card bg-white rounded-lg overflow-hidden shadow-md transition duration-300 transform hover:scale-105">
                <div class="relative">
                    <div class="h-60 bg-gray-200 flex items-center justify-center overflow-hidden">
                        <img src="${product.image}" alt="${product.name}" class="max-h-full max-w-full object-contain">
                    </div>
                    <div class="absolute top-0 left-0 p-3">
                        <div class="flex text-yellow-400 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        </div>
                    </div>
                    <span class="recommend-badge">Çok Önerilen</span>
                </div>
                <div class="p-4">
                    <a href="product-page.html?id=${product.id}&category=${product.category}" class="block">
                        <h3 class="font-semibold mb-1 text-gray-800 hover:text-green-600 transition duration-200">${product.name}</h3>
                    </a>
                    <p class="text-gray-500 text-sm mb-2">${product.desc}</p>
                    <div class="flex justify-between items-center mt-3">
                        <div>
                        <span class="text-gray-500 text-sm ml-2">(${product.carbon} g CO₂)</span> </div>
                            </div>
                </div>
            </div>
        `;
        container.innerHTML += productHTML;
    });

    // Her ürün kartı eklendikten sonra olay dinleyicilerini ekle
    attachProductCardListeners(container);
}