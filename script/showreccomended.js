fetch('materials.json')
  .then(response => response.json())
  .then(data => {
    // Tüm malzemeleri düz bir diziye çevir (malzeme sınıfı bilgisiyle)
    allFlatMaterials = data.materials || []; 
    const popularMaterials = allFlatMaterials.filter(p => p.rating === "Yüksek Performans" || p.rating === "Çok Önerilen");


    // Popüler malzemeleri render et
    renderPopularMaterials(popularMaterials);

    // ... diğer işlemler
  });

// JavaScript dosyanızda (muhtemelen script.js veya ayrı bir .js dosyası)
function renderPopularMaterials(materials) {
    const container = document.getElementById('popular-materials-container');
    container.innerHTML = ''; // Konteyneri her render işleminden önce temizle

    if (materials.length === 0) {
        container.innerHTML = '<p class="text-gray-600 text-center col-span-full">Popüler malzeme bulunamadı.</p>';
        return;
    }

    materials.forEach(material => {
        
        let mClass = (material.material_class || "").toLowerCase();
        const mClassClean = mClass.replaceAll('ç', 'c').replaceAll('ğ', 'g').replaceAll('ı', 'i').replaceAll('ö', 'o').replaceAll('ş', 's').replaceAll('ü', 'u');

        
        const materialHTML = `
<div class="material-card bg-transparent transform transition duration-300 hover:-translate-y-2 relative group z-0 mt-8 flex flex-col h-full">
        
        <a href="material-page.html?id=${material.id}" class="block relative z-20 mt-12 -mb-20 px-6 flex justify-center cursor-pointer">
            <div class="h-48 w-auto flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <img src="./img/${material.name}.png" 
                     alt="${material.name}" 
                     class="max-h-full max-w-full object-contain drop-shadow-2xl"
                     onerror="this.onerror=function(){this.src='./img/favicon.png'; this.onerror=null;}; this.src='./img/${mClassClean}.png';" />
            </div>
        </a>

        <div class="p-6 bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-3xl z-10 relative pt-16 border border-gray-50 flex-1 flex flex-col">
            
            <div class="text-center">
                <div class="flex justify-center text-yellow-400 mb-2 gap-1">
                    ${'<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>'.repeat(5)}
                </div>

                <h3 class="font-bold text-xl mb-2 text-gray-900 hover:text-green-600 transition duration-200 line-clamp-1">
                    <a href="material-page.html?id=${material.id}">${material.name}</a>
                </h3>

                <p class="text-gray-500 text-sm line-clamp-2 px-2 -mb-4">${material.desc || "Açıklama bulunmuyor."}</p>
            </div>

            <div class="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center w-full">
                <div class="flex flex-col ml-auto mr-auto items-center">
                    <span class="text-[10px] uppercase text-gray-400 font-bold">Emisyon</span>
                    <span class="text-green-600 font-bold text-sm">🌱 ${material.carbon_emission || material.carbon || 0} kg</span>
                </div>
            </div>

        </div>
    </div>
        `;
        container.innerHTML += materialHTML;
    });

    // Her malzeme kartı eklendikten sonra olay dinleyicilerini ekle
    attachMaterialCardListeners(container);
}                                
