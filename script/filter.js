// --- filters.js: LİSTELEME VE FİLTRELEME MANTIĞI ---

// Core.js veriyi yüklediğinde bu fonksiyonu çağıracak
window.startListingPage = function(materialsData) {
    console.log("🔍 Filtreleme Sistemi Başlatıldı.");
    
    // Dropdownları Doldur
    populateDropdown(materialsData, 'filter-treatment', 'processing_state'); // İşlem Durumu
    populateDropdown(materialsData, 'filter-bonding', 'properties.structure.bonding_type'); // Bağ Türü
    populateDropdown(materialsData, 'filter-crystal', 'properties.structure.crystal_structure'); // Kristal Yapı
    populateDropdown(materialsData, 'filter-corrosion', 'properties.environmental.corrosion_resistance'); // Korozyon

    // Filtreleri URL'den oku ve başlat
    initializeListingPage();
};

// --- BAŞLANGIÇ AYARLARI ---
function initializeListingPage() {
    renderSidebarFilters();
    const urlParams = new URLSearchParams(window.location.search);

    // Kategori
    const classParam = urlParams.get('material_class');
    if (classParam) {
        const classes = classParam.split(',');
        classes.forEach(cls => {
            const checkbox = document.querySelector(`.category-filter[value="${decodeURIComponent(cls)}"]`);
            if (checkbox) checkbox.checked = true;
            const listingLink = document.getElementById('listing-material_class');
            if(listingLink) listingLink.textContent = decodeURIComponent(cls);
        });
    }

    // Basit Inputlar (Text/Number)
    const inputIds = [
        'min_density', 'max_thermal', 
        'min_elasticity', 'min_hardness', 'min_conductivity'
    ];
    inputIds.forEach(id => {
        const val = urlParams.get(id);
        if(val) document.getElementById(id.replace('_', '-')).value = val;
    });

    // Select Boxlar
    if (urlParams.get('bonding')) document.getElementById('filter-bonding').value = urlParams.get('bonding');
    if (urlParams.get('crystal')) document.getElementById('filter-crystal').value = urlParams.get('crystal');
    if (urlParams.get('treatment')) document.getElementById('filter-treatment').value = urlParams.get('treatment');
    if (urlParams.get('corrosion')) document.getElementById('filter-corrosion').value = urlParams.get('corrosion');

    // Checkbox (Manyetik)
    if (urlParams.get('magnetic') === 'true') document.getElementById('filter-magnetic').checked = true;

    // Sliderlar
    if (urlParams.get('max_carbon')) {
        document.getElementById('max-carbon').value = urlParams.get('max_carbon');
        document.getElementById('carbon-val').innerText = urlParams.get('max_carbon');
    }
    if (urlParams.get('min_recycle')) {
        document.getElementById('min-recycle').value = urlParams.get('min_recycle');
        document.getElementById('recycle-val').innerText = '%' + urlParams.get('min_recycle');
    }
    if (urlParams.get('max_water')) {
        document.getElementById('max-water').value = urlParams.get('max_water');
        document.getElementById('water-val').innerText = '%' + urlParams.get('max_water');
    }

    // Arama
    const searchParam = urlParams.get('search');
    if (searchParam) document.getElementById('search-input').value = decodeURIComponent(searchParam);

    setupFilterListeners();
    applyFilters(false);
}

// --- DİNLEYİCİLER ---
function setupFilterListeners() {
    const inputs = document.querySelectorAll('.category-filter, .filter-input, #max-carbon, #min-recycle, #max-water, select');
    
    inputs.forEach(input => {
        const eventType = (input.type === 'range' || input.type === 'checkbox') ? 'input' : 'change';
        
        input.addEventListener(eventType, () => {
             if(input.id === 'max-carbon') document.getElementById('carbon-val').innerText = input.value;
             if(input.id === 'min-recycle') document.getElementById('recycle-val').innerText = '%' + input.value;
             if(input.id === 'max-water') document.getElementById('water-val').innerText = '%' + input.value;
             
             applyFilters(true); 
        });
    });

    const resetBtn = document.getElementById('reset-filters-btn');
    if (resetBtn) resetBtn.addEventListener('click', resetFilters);
}

// --- ANA FİLTRELEME MOTORU ---
function applyFilters(updateUrl = true) {
    // 1. Değerleri HTML'den Oku
    const selectedClasses = Array.from(document.querySelectorAll('.category-filter:checked')).map(cb => cb.value);
    
    const maxCarbon = parseFloat(document.getElementById('max-carbon')?.value) || 99999;
    const minDensity = parseFloat(document.getElementById('min-density')?.value) || 0;
    const maxThermal = parseFloat(document.getElementById('max-thermal')?.value) || 999; 
    const minRecycle = parseFloat(document.getElementById('min-recycle')?.value) || 0;
    const minElasticity = parseFloat(document.getElementById('min-elasticity')?.value) || 0;
    const maxWater = parseFloat(document.getElementById('max-water')?.value) || 100;
    
    const filterBonding = document.getElementById('filter-bonding')?.value || "";
    const filterCrystal = document.getElementById('filter-crystal')?.value || "";
    const minHardness = parseFloat(document.getElementById('min-hardness')?.value) || 0;
    const filterTreatment = document.getElementById('filter-treatment')?.value || "";
    const minConductivity = parseFloat(document.getElementById('min-conductivity')?.value) || 0;
    const isMagnetic = document.getElementById('filter-magnetic')?.checked || false;
    const filterCorrosion = document.getElementById('filter-corrosion')?.value || "";

    const searchTerm = document.getElementById('search-input')?.value.toLowerCase().trim() || "";
    const breadcrumbContainer = document.getElementById('listing-breadcrumbs');

    if (breadcrumbContainer) {
        // 1. Önce içini temizle
        breadcrumbContainer.innerHTML = '';

        if (selectedClasses.length === 0) {
            // 2. Hiçbir şey seçili değilse standart linki koy
            breadcrumbContainer.innerHTML = '<a href="materials-listing.html" class="hover:text-green-600 transition">Tüm Malzemeler</a>';
        } else {
            // 3. Seçili her kategori için ayrı link oluştur
            selectedClasses.forEach((cls, index) => {
                // Link Oluştur
                const link = document.createElement('a');
                link.textContent = cls;
                // Sadece o sınıfa ait link veriyoruz:
                link.href = `materials-listing.html?material_class=${encodeURIComponent(cls)}`;
                link.className = "text-sm text-gray-500 hover:text-green-600 mb-0 inline-block";

                breadcrumbContainer.appendChild(link);

                // Son eleman değilse araya "/" işareti koy
                if (index < selectedClasses.length - 1) {
                    const separator = document.createElement('span');
                    separator.textContent = '/';
                    separator.className = "text-gray-400 mx-2";
                    breadcrumbContainer.appendChild(separator);
                }
            });
        }
    }

    // 2. URL Güncelleme
    if (updateUrl) {
        const newUrl = new URL(window.location);
        
        // Parametreleri ayarla
        if (selectedClasses.length > 0) newUrl.searchParams.set('material_class', selectedClasses.join(','));
        else newUrl.searchParams.delete('material_class');

        if (maxCarbon < 99999) newUrl.searchParams.set('max_carbon', maxCarbon); else newUrl.searchParams.delete('max_carbon');
        if (minDensity > 0) newUrl.searchParams.set('min_density', minDensity); else newUrl.searchParams.delete('min_density');
        if (maxThermal < 999) newUrl.searchParams.set('max_thermal', maxThermal); else newUrl.searchParams.delete('max_thermal');
        if (minRecycle > 0) newUrl.searchParams.set('min_recycle', minRecycle); else newUrl.searchParams.delete('min_recycle');
        if (minElasticity > 0) newUrl.searchParams.set('min_elasticity', minElasticity); else newUrl.searchParams.delete('min_elasticity');
        if (maxWater < 100) newUrl.searchParams.set('max_water', maxWater); else newUrl.searchParams.delete('max_water');

        if (filterBonding) newUrl.searchParams.set('bonding', filterBonding); else newUrl.searchParams.delete('bonding');
        if (filterCrystal) newUrl.searchParams.set('crystal', filterCrystal); else newUrl.searchParams.delete('crystal');
        if (minHardness > 0) newUrl.searchParams.set('min_hardness', minHardness); else newUrl.searchParams.delete('min_hardness');
        if (filterTreatment) newUrl.searchParams.set('treatment', filterTreatment); else newUrl.searchParams.delete('treatment');
        if (minConductivity > 0) newUrl.searchParams.set('min_conductivity', minConductivity); else newUrl.searchParams.delete('min_conductivity');
        if (isMagnetic) newUrl.searchParams.set('magnetic', 'true'); else newUrl.searchParams.delete('magnetic');
        if (filterCorrosion) newUrl.searchParams.set('corrosion', filterCorrosion); else newUrl.searchParams.delete('corrosion');
        
        if (searchTerm) newUrl.searchParams.set('search', searchTerm); else newUrl.searchParams.delete('search');

        window.history.pushState({}, '', newUrl);
    }

    // 3. Veriyi Süzme Mantığı (allMaterials global değişkendir - core.js'den gelir)
    const filteredList = allMaterials.filter(material => {
        let isValid = true;
        
        if (selectedClasses.length > 0 && !selectedClasses.includes(material.material_class)) isValid = false;

        const mProps = material.properties?.mechanical || {};
        const pProps = material.properties?.physical || {};
        const eProps = material.properties?.environmental || {};
        const sProps = material.properties?.structure || {};
        const elecProps = material.properties?.electrical || {};
        const magProps = material.properties?.magnetic || {};
        const carbon = material.carbon_emission || material.carbon || 0;

        if (carbon > maxCarbon) isValid = false;
        if (pProps.density !== undefined && pProps.density < minDensity) isValid = false;
        if (pProps.thermal_conductivity !== undefined && pProps.thermal_conductivity > maxThermal) isValid = false;
        if (eProps.recyclability !== undefined && eProps.recyclability < minRecycle) isValid = false;
        if (mProps.elastic_modulus !== undefined && mProps.elastic_modulus < minElasticity) isValid = false;
        if (pProps.water_absorption !== undefined && pProps.water_absorption > maxWater) isValid = false;

        if (filterBonding && sProps.bonding_type !== filterBonding) isValid = false;
        if (filterCrystal && sProps.crystal_structure !== filterCrystal) isValid = false;
        if (mProps.hardness_vickers !== undefined && mProps.hardness_vickers < minHardness) isValid = false;
        if (filterTreatment && material.processing_state !== filterTreatment) isValid = false;
        if (elecProps.conductivity_iacs !== undefined && elecProps.conductivity_iacs < minConductivity) isValid = false;
        if (isMagnetic && !magProps.is_magnetic) isValid = false;
        if (filterCorrosion && eProps.corrosion_resistance !== filterCorrosion) isValid = false;

        if (searchTerm) {
            const mName = material.name.toLowerCase();
            const mDesc = (material.desc || "").toLowerCase();
            if (!mName.includes(searchTerm) && !mDesc.includes(searchTerm)) isValid = false;
        }

        return isValid;
    });

    renderMaterials(filteredList);
}

// --- KARTLARI ÇİZME (Görsel Tasarım) ---
function renderMaterials(materialsToRender) {
    const countLabel = document.getElementById('result-count') || document.getElementById('filtered-count');
    if (countLabel) countLabel.textContent = materialsToRender.length === 0 ? `Malzeme Bulunamadı` : `${materialsToRender.length} malzeme bulundu`;

    const container = document.getElementById('material-cards-container');
    if (!container) return;
    container.innerHTML = '';

    if (materialsToRender.length === 0) {
        container.innerHTML = `
    <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
        <div class="relative mb-4">
            <i class="fa-solid fa-helmet-safety text-6xl text-yellow-500"></i>
            <span class="absolute -top-2 -right-2 bg-gray-100 rounded-full p-1 border border-gray-200">
                <i class="fa-solid fa-question text-lg text-gray-500 w-6 h-6 flex items-center justify-center"></i>
            </span>
        </div>
        <h3 class="text-lg font-bold text-gray-700 mb-1">Aradığın Malzemeyi Bulamadık</h3>
        <p class="text-gray-500 text-sm">Farklı anahtar kelimelerle aramayı deneyebilirsin.</p>
        <button onclick="window.location.href='materials-listing.html'" class="mt-4 text-green-600 hover:text-green-700 font-medium text-sm underline">
            Tüm listeye dön
        </button>
    </div>
`;
        return;
    }

    const warehouse = JSON.parse(localStorage.getItem("warehouse")) || [];

    materialsToRender.forEach(material => {
        const props = material.properties || {};
        const struct = props.structure || {};
        const therm = props.physical || {};
        const mech = props.mechanical || {};
        const env = props.environmental || {};
        
        // Etiketler
        let tagsHtml = '<div class="flex flex-wrap gap-1 mb-2">';
        if (struct.bonding_type) tagsHtml += `<span class="text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">${struct.bonding_type}</span>`;
        if (struct.crystal_structure) tagsHtml += `<span class="text-[10px] font-semibold bg-purple-50 text-purple-600 px-2 py-0.5 rounded border border-purple-100">${struct.crystal_structure}</span>`;
        if (therm.melting_point) tagsHtml += `<span class="text-[10px] font-semibold bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100">🔥 ${therm.melting_point}°C</span>`;
        if (mech.hardness_vickers) tagsHtml += `<span class="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">💎 ${mech.hardness_vickers} HV</span>`;
        if (env.corrosion_resistance) tagsHtml += `<span class="text-[10px] font-semibold bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100">🛡️ ${env.corrosion_resistance}</span>`;
        tagsHtml += '</div>';

        const item = warehouse.find(w => w.id === material.id);
        const metrajInfo = item ? `<p class="text-sm text-green-600 mt-1 font-bold">Metrajda ${item.quantity} adet var</p>` : `<p class="text-sm text-green-600 mt-1 h-5"></p>`;

        // Yıldızlar
        let starsHtml = '';
        const ratingMap = { 'Yüksek Performans': 5, 'Yüksek Dayanım': 4, 'Standart Kalite': 3, 'Düşük Dayanım': 2, 'Yetersiz': 1 };
        const stars = ratingMap[material.rating] || 0;
        for (let i = 0; i < 5; i++) {
            starsHtml += i < stars ? `<i class="fa-solid fa-star text-yellow-400 text-xs"></i>` : `<i class="fa-solid fa-star text-gray-300 text-xs"></i>`;
        }

        let mClass = (material.material_class || "").toLowerCase();
        const mClassClean = mClass.replaceAll('ç', 'c').replaceAll('ğ', 'g').replaceAll('ı', 'i').replaceAll('ö', 'o').replaceAll('ş', 's').replaceAll('ü', 'u');
        const materialImg = `./img/${material.name}.png`;

        const cardHTML = `
        <div class="material-card bg-white rounded-xl shadow-sm hover:shadow-lg transition border border-gray-100 overflow-hidden group flex flex-col h-full">
            <div class="p-5 flex-1 flex flex-col justify-between">
                <div class="flex justify-between items-start gap-3 mb-2">
                    <div class="flex flex-col flex-1 pr-2">
                        <div class="flex gap-0.5 mb-1">${starsHtml}</div>
                        <h3 class="text-lg font-bold text-gray-800 mb-1 leading-tight">
                            <a href="material-page.html?id=${material.id}" class="hover:text-green-600 transition">${material.name}</a>
                        </h3>
                        ${tagsHtml}
                        <p class="text-sm text-gray-500 line-clamp-2 mb-2">${material.desc || ""}</p>
                        ${metrajInfo}
                    </div>
                    <div class="w-16 h-16 flex-shrink-0 bg-gray-50 rounded-lg p-2 flex items-center justify-center">
                        <img src="${materialImg}" alt="${material.name}" class="w-full h-full object-contain"
                        onerror="this.onerror=function(){this.src='./img/favicon.png'; this.onerror=null;}; this.src='./img/${mClassClean}.png';" />
                    </div>
                </div>
                <div class="flex justify-between items-center border-t pt-3 mt-2">
                    <div class="flex flex-col">
                        <span class="text-[10px] uppercase text-gray-400 font-bold">Emisyon</span>
                        <span class="text-green-600 font-bold text-sm">🌱 ${material.carbon_emission || material.carbon || 0} kg CO₂</span>
                    </div>
                    <div class="flex gap-2 items-center">
                        <div class="flex items-center bg-gray-100 rounded-lg p-1">
                            <button class="px-2 py-1 text-gray-600 hover:text-red-500 quantity-decrement-btn hidden font-bold text-lg">-</button>
                            <input type="number" value="0" min="1" class="w-10 bg-transparent text-center text-sm font-semibold focus:outline-none quantity-input-field hidden" data-material-id="${material.id}" />
                            <button class="px-2 py-1 text-gray-600 hover:text-green-600 quantity-increment-btn font-bold text-lg">+</button>
                        </div>
                        <button class="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition add-to-warehouse-btn shadow-md whitespace-nowrap" data-material-id="${material.id}">Metraja İşle</button>
                    </div>
                </div>
            </div>
        </div>`;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });

    setupCardEventListeners(materialsToRender);
}

function setupCardEventListeners(materialsSource) {
    document.querySelectorAll('.quantity-increment-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const wrapper = this.parentElement;
            const input = wrapper.querySelector('.quantity-input-field');
            const decBtn = wrapper.querySelector('.quantity-decrement-btn');
            input.value = (parseInt(input.value) || 0) + 1;
            input.classList.remove('hidden');
            decBtn.classList.remove('hidden');
        });
    });

    document.querySelectorAll('.quantity-decrement-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('.quantity-input-field');
            let val = parseInt(input.value) || 0;
            if (val > 0) input.value = val - 1;
            if (input.value == 0) {
                input.classList.add('hidden');
                this.classList.add('hidden');
            }
        });
    });

    document.querySelectorAll('.add-to-warehouse-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.materialId;
            const card = this.closest('.material-card');
            const input = card.querySelector('.quantity-input-field');
            const qty = parseInt(input.value) || 0;

            if (qty > 0) {
                const material = materialsSource.find(m => m.id === id);
                if (material) {
                    // Core.js'deki fonksiyonu çağır
                    if(typeof addToWarehouse === 'function') {
                        addToWarehouse(material.id, material.material_class, qty, material.name, material.description || material.desc, material.carbon || material.carbon_emission);
                    }
                    input.value = 0;
                    input.classList.add('hidden');
                    card.querySelector('.quantity-decrement-btn').classList.add('hidden');
                    applyFilters(); 
                }
            } else {
                alert("Lütfen en az 1 adet seçin.");
            }
        });
    });
}

// --- SIDEBAR UI ---
function renderSidebarFilters() {
    const container = document.getElementById('sidebar-category-filters');
    if (!container) return; 
    container.innerHTML = ''; 

    const urlParams = new URLSearchParams(window.location.search);
    const classParam = urlParams.get('material_class');
    const selectedClasses = classParam ? classParam.split(',') : [];

    let uniqueClasses = [...new Set(allMaterials.map(m => m.material_class))].sort();

    if (selectedClasses.length > 0) {
        const selected = uniqueClasses.filter(c => selectedClasses.includes(c));
        const unselected = uniqueClasses.filter(c => !selectedClasses.includes(c));
        uniqueClasses = [...selected, ...unselected];
    }

    const LIMIT = 5; 
    uniqueClasses.slice(0, LIMIT).forEach(mClass => {
        container.appendChild(createFilterItem(mClass));
    });

    if (uniqueClasses.length > LIMIT) {
        const hiddenDiv = document.createElement('div');
        hiddenDiv.id = 'extra-filters';
        hiddenDiv.className = 'hidden space-y-2 mt-2';
        
        uniqueClasses.slice(LIMIT).forEach(mClass => {
            hiddenDiv.appendChild(createFilterItem(mClass));
        });
        container.appendChild(hiddenDiv);

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'text-xs font-bold text-green-600 hover:text-green-800 mt-2 flex items-center gap-1';
        toggleBtn.innerHTML = '<i class="fa-solid fa-chevron-down"></i> Daha Fazla Göster';
        
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hiddenDiv.classList.toggle('hidden');
            const isHidden = hiddenDiv.classList.contains('hidden');
            toggleBtn.innerHTML = isHidden 
                ? '<i class="fa-solid fa-chevron-down"></i> Daha Fazla Göster' 
                : '<i class="fa-solid fa-chevron-up"></i> Daha Az Göster';
        });
        container.appendChild(toggleBtn);
    }
}

function createFilterItem(mClass) {
    const div = document.createElement('div');
    div.innerHTML = `
        <label class="flex items-center space-x-2 cursor-pointer group hover:bg-gray-50 p-1 rounded transition">
            <input type="checkbox" onchange="applyFilters()" class="category-filter form-checkbox text-green-600 rounded border-gray-300 focus:ring-green-500" value="${mClass}">
            <span class="text-sm text-gray-600 group-hover:text-green-700 font-medium transition">${mClass}</span>
        </label>
    `;
    return div;
}

// --- DROPDOWN DOLDURMA ---
function populateDropdown(materials, selectId, keyPath) {
    const selectBox = document.getElementById(selectId);
    if (!selectBox) return;

    const values = new Set(); 
    materials.forEach(material => {
        let value = material;
        const keys = keyPath.split('.'); 
        for (let k of keys) {
            if (value) value = value[k];
            else break;
        }
        if (value && typeof value === 'string') {
            values.add(value.trim());
        }
    });

    const sortedValues = Array.from(values).sort();
    sortedValues.forEach(val => {
        const option = document.createElement('option');
        option.value = val;
        option.textContent = val;
        selectBox.appendChild(option);
    });
}

function resetFilters() {
    document.querySelectorAll('.category-filter').forEach(cb => cb.checked = false);
    document.querySelectorAll('.filter-input').forEach(el => el.value = '');
    
    if(document.getElementById('max-carbon')) {
        document.getElementById('max-carbon').value = 50;
        document.getElementById('carbon-val').innerText = '50';
    }

    if(document.getElementById('min-recycle')) {
        document.getElementById('min-recycle').value = 0;
        document.getElementById('recycle-val').innerText = '%0';
    }

    if (document.getElementById('filter-magnetic')) document.getElementById('filter-magnetic').checked = false;

    window.history.pushState({}, '', window.location.pathname);
    applyFilters(false);
}

// URL Geri/İleri değişimi
window.addEventListener('popstate', function() {
    if (document.getElementById('materials-listing-page')) {
        initializeListingPage(); 
    }
});