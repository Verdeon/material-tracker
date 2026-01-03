// --- script.js: VMT ANA SİSTEM (Tam Link Entegrasyonu ve Hata Düzeltmeleri) ---

// 1. GLOBAL DEĞİŞKENLER
let allMaterials = []; 

// --- Quantity (Adet) Kontrol Fonksiyonları (Detay Sayfası) ---
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
    if (typeof window.updateCarbonCountFromWarehouse === 'function') window.updateCarbonCountFromWarehouse();
    if (typeof window.updateCartCountFromWarehouse === 'function') window.updateCartCountFromWarehouse();
}

// --- SAYFA YÜKLENDİĞİNDE ---
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Sistem Başlatılıyor...");

    fetch("materials.json")
        .then(res => {
            if (!res.ok) throw new Error("JSON yüklenemedi.");
            return res.json();
        })
        .then(data => {
            allMaterials = data.materials || []; 

            // 1. Sidebar Sayaçlarını Güncelle
            updateSidebarCounts();

            // 2. Navigasyon Butonlarını Oluştur
            setupNavButtons();

            // 3. Eğer Listeleme Sayfasındaysak Başlat
            if (document.getElementById('materials-listing-page')) {
                initializeListingPage();
            }
            
            // 4. Detay Sayfasındaysak Mantığı Kur
            setupDetailPageLogic(); 
        })
        .catch(err => console.error("Hata:", err));

    if (typeof window.updateCartCountFromWarehouse === 'function') {
        window.updateCartCountFromWarehouse();
    }
});

// --- YARDIMCI FONKSİYONLAR ---
function updateSidebarCounts() {
    document.querySelectorAll(".material-count").forEach(span => {
        const mClass = span.dataset.material_class;
        const count = allMaterials.filter(m => m.material_class === mClass).length;
        span.textContent = `${count} malzeme`;
    });
}

function setupNavButtons() {
    const container = document.getElementById('material_class-buttons');
    if (!container) return;

    container.innerHTML = ''; 
    const urlParams = new URLSearchParams(window.location.search);
    const activeClass = urlParams.get('material_class');

    // "Tüm Malzeme Sınıfları"
    const allButton = document.createElement('button');
    allButton.textContent = 'Tüm Malzeme Sınıfları';
    allButton.className = `material_class-button px-3 py-1 m-1 rounded cursor-pointer ${!activeClass ? 'bg-green-600 text-white' : 'bg-green-300 hover:bg-gray-500'}`;
    allButton.addEventListener('click', () => { window.location.href = 'materials-listing.html'; });
    container.appendChild(allButton);

    const uniqueClasses = [...new Set(allMaterials.map(m => m.material_class))];
    uniqueClasses.forEach(mClass => {
        const button = document.createElement('button');
        button.textContent = mClass;
        // URL'de bu sınıf var mı kontrol et (virgüllü yapıyı destekler)
        const isActive = activeClass && activeClass.split(',').includes(mClass);
        
        button.className = `material_class-button px-3 py-1 m-1 rounded cursor-pointer ${isActive ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-400'}`;
        button.addEventListener('click', () => {
            window.location.href = `materials-listing.html?material_class=${encodeURIComponent(mClass)}`;
        });
        container.appendChild(button);
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

// --- LİSTELEME SAYFASI BAŞLANGICI ---
// --- initializeListingPage FONKSİYONU ---
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
        });
    }

    // Basit Inputlar (Text/Number) - HEPSİNİ BURAYA EKLE
    const inputIds = [
        'min_strength', 'max_strength', 'min_density', 'max_thermal', 
        'min_elasticity', 'min_hardness', 'min_conductivity'
    ];
    inputIds.forEach(id => {
        const val = urlParams.get(id);
        if(val) document.getElementById(id.replace('_', '-')).value = val;
    });

    // Select Boxlar (Dropdown) - YENİ
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

// --- DİNLEYİCİLERİ KUR (Her değişiklikte URL güncellensin) ---
// --- setupFilterListeners FONKSİYONU ---
function setupFilterListeners() {
    // Select kutularını da seçiciye ekledik (select)
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
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if(e.key === 'Enter') applyFilters(true);
        });
    }
}

// --- ANA FİLTRELEME VE URL GÜNCELLEME MOTORU ---
function applyFilters(updateUrl = true) {
    // 1. Değerleri HTML'den Oku
    const selectedClasses = Array.from(document.querySelectorAll('.category-filter:checked')).map(cb => cb.value);
    
    // Mevcut Sayısal Değerler
    const minStrength = parseFloat(document.getElementById('min-strength')?.value) || 0;
    const maxStrength = parseFloat(document.getElementById('max-strength')?.value) || 99999;
    const maxCarbon = parseFloat(document.getElementById('max-carbon')?.value) || 99999;
    const minDensity = parseFloat(document.getElementById('min-density')?.value) || 0;
    const maxThermal = parseFloat(document.getElementById('max-thermal')?.value) || 999; 
    const minRecycle = parseFloat(document.getElementById('min-recycle')?.value) || 0;
    
    // YENİ EKLENEN MALZEME BİLİMİ FİLTRELERİ
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

    // 2. URL Güncelleme
    if (updateUrl) {
        const newUrl = new URL(window.location);
        
        // Malzeme Sınıfı
        if (selectedClasses.length > 0) newUrl.searchParams.set('material_class', selectedClasses.join(','));
        else newUrl.searchParams.delete('material_class');

        // Mevcut Filtreler URL
        if (minStrength > 0) newUrl.searchParams.set('min_strength', minStrength); else newUrl.searchParams.delete('min_strength');
        if (maxStrength < 99999) newUrl.searchParams.set('max_strength', maxStrength); else newUrl.searchParams.delete('max_strength');
        if (maxCarbon < 99999) newUrl.searchParams.set('max_carbon', maxCarbon); else newUrl.searchParams.delete('max_carbon');
        if (minDensity > 0) newUrl.searchParams.set('min_density', minDensity); else newUrl.searchParams.delete('min_density');
        if (maxThermal < 999) newUrl.searchParams.set('max_thermal', maxThermal); else newUrl.searchParams.delete('max_thermal');
        if (minRecycle > 0) newUrl.searchParams.set('min_recycle', minRecycle); else newUrl.searchParams.delete('min_recycle');
        if (minElasticity > 0) newUrl.searchParams.set('min_elasticity', minElasticity); else newUrl.searchParams.delete('min_elasticity');
        if (maxWater < 100) newUrl.searchParams.set('max_water', maxWater); else newUrl.searchParams.delete('max_water');

        // YENİ FİLTRELER URL (BURAYI EKLEDİK)
        if (filterBonding) newUrl.searchParams.set('bonding', filterBonding); else newUrl.searchParams.delete('bonding');
        if (filterCrystal) newUrl.searchParams.set('crystal', filterCrystal); else newUrl.searchParams.delete('crystal');
        if (minHardness > 0) newUrl.searchParams.set('min_hardness', minHardness); else newUrl.searchParams.delete('min_hardness');
        if (filterTreatment) newUrl.searchParams.set('treatment', filterTreatment); else newUrl.searchParams.delete('treatment');
        if (minConductivity > 0) newUrl.searchParams.set('min_conductivity', minConductivity); else newUrl.searchParams.delete('min_conductivity');
        if (isMagnetic) newUrl.searchParams.set('magnetic', 'true'); else newUrl.searchParams.delete('magnetic');
        if (filterCorrosion) newUrl.searchParams.set('corrosion', filterCorrosion); else newUrl.searchParams.delete('corrosion');
        
        // Arama
        if (searchTerm) newUrl.searchParams.set('search', searchTerm); else newUrl.searchParams.delete('search');

        window.history.pushState({}, '', newUrl);
    }

    // 3. Veriyi Süzme Mantığı (Logic)
    const filteredList = allMaterials.filter(material => {
        let isValid = true;
        
        // Kategori Kontrolü
        if (selectedClasses.length > 0 && !selectedClasses.includes(material.material_class)) isValid = false;

        // Özellik Tanımları
        const mProps = material.properties?.mechanical || {};
        const pProps = material.properties?.physical || {};
        const eProps = material.properties?.environmental || {};
        const sProps = material.properties?.structure || {};
        const elecProps = material.properties?.electrical || {};
        const magProps = material.properties?.magnetic || {};
        const carbon = material.carbon_emission || material.carbon || 0;

        // Mevcut Kontroller
        if (mProps.yield_strength !== undefined && (mProps.yield_strength < minStrength || mProps.yield_strength > maxStrength)) isValid = false;
        if (carbon > maxCarbon) isValid = false;
        if (pProps.density !== undefined && pProps.density < minDensity) isValid = false;
        if (pProps.thermal_conductivity !== undefined && pProps.thermal_conductivity > maxThermal) isValid = false;
        if (eProps.recyclability !== undefined && eProps.recyclability < minRecycle) isValid = false;
        if (mProps.elastic_modulus !== undefined && mProps.elastic_modulus < minElasticity) isValid = false;
        if (pProps.water_absorption !== undefined && pProps.water_absorption > maxWater) isValid = false;

        // YENİ KONTROLLER (Logic)
        if (filterBonding && sProps.bonding_type !== filterBonding) isValid = false;
        if (filterCrystal && sProps.crystal_structure !== filterCrystal) isValid = false;
        if (mProps.hardness_vickers !== undefined && mProps.hardness_vickers < minHardness) isValid = false;
        if (filterTreatment && material.processing_state !== filterTreatment) isValid = false;
        if (elecProps.conductivity_iacs !== undefined && elecProps.conductivity_iacs < minConductivity) isValid = false;
        if (isMagnetic && !magProps.is_magnetic) isValid = false;
        if (filterCorrosion && eProps.corrosion_resistance !== filterCorrosion) isValid = false;

        // Arama
        if (searchTerm) {
            const mName = material.name.toLowerCase();
            const mDesc = (material.desc || "").toLowerCase();
            if (!mName.includes(searchTerm) && !mDesc.includes(searchTerm)) isValid = false;
        }

        return isValid;
    });

    renderMaterials(filteredList);
}

// --- SIDEBAR KATEGORİLERİNİ OLUŞTUR (HATA DÜZELTİLDİ) ---
function renderSidebarFilters() {
    const container = document.getElementById('sidebar-category-filters');
    if (!container) return; 
    container.innerHTML = ''; 

    // URL'den seçili olanları al
    const urlParams = new URLSearchParams(window.location.search);
    const classParam = urlParams.get('material_class');
    const selectedClasses = classParam ? classParam.split(',') : [];

    // Tüm benzersiz sınıfları al ve sırala
    let uniqueClasses = [...new Set(allMaterials.map(m => m.material_class))].sort();

    // Seçili olanları en başa taşı (Kullanıcı deneyimi için)
    if (selectedClasses.length > 0) {
        const selected = uniqueClasses.filter(c => selectedClasses.includes(c));
        const unselected = uniqueClasses.filter(c => !selectedClasses.includes(c));
        uniqueClasses = [...selected, ...unselected];
    }

    const LIMIT = 5; 

    // İlk 5 taneyi ekle
    uniqueClasses.slice(0, LIMIT).forEach(mClass => {
        container.appendChild(createFilterItem(mClass));
    });

    // Kalanları gizli alana ekle
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

// Yardımcı: Checkbox Oluştur
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

// --- TEMİZLEME ---
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
    // Checkbox reset
    if (document.getElementById('filter-magnetic')) document.getElementById('filter-magnetic').checked = false;

    window.history.pushState({}, '', window.location.pathname);
    applyFilters(false);
}

// --- KARTLARI ÇİZME (Görsel Tasarım) ---
function renderMaterials(materialsToRender) {
    // Sonuç sayısını güncelle
    const countLabel = document.getElementById('result-count') || document.getElementById('filtered-count');
    if (countLabel) countLabel.textContent = `${materialsToRender.length} malzeme bulundu`;

    const container = document.getElementById('material-cards-container');
    if (!container) return;
    container.innerHTML = '';

    if (materialsToRender.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-600 col-span-full py-10">Eşleşen malzeme bulunamadı.</p>';
        return;
    }

    const warehouse = JSON.parse(localStorage.getItem("warehouse")) || [];

    materialsToRender.forEach(material => {
        // 1. Verileri Güvenle Al
        const props = material.properties || {};
        const struct = props.structure || {};
        const therm = props.physical || {};
        const mech = props.mechanical || {};
        const chem = props.chemical || {};
        const env = props.environmental || {};
        const elec = props.electrical || {};
        
        // 2. Etiketleri Oluştur
        let tagsHtml = '<div class="flex flex-wrap gap-1 mb-2">';
        
        if (struct.bonding_type) {
            tagsHtml += `<span class="text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">${struct.bonding_type}</span>`;
        }
        if (struct.crystal_structure) {
            tagsHtml += `<span class="text-[10px] font-semibold bg-purple-50 text-purple-600 px-2 py-0.5 rounded border border-purple-100">${struct.crystal_structure}</span>`;
        }
        if (therm.melting_point) {
            tagsHtml += `<span class="text-[10px] font-semibold bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100">🔥 ${therm.melting_point}°C</span>`;
        }
        if (mech.hardness_vickers) {
            tagsHtml += `<span class="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">💎 ${mech.hardness_vickers} HV</span>`;
        }
        if (env.corrosion_resistance) {
            tagsHtml += `<span class="text-[10px] font-semibold bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100">🛡️ ${env.corrosion_resistance}</span>`;
        }
        
        tagsHtml += '</div>';

        const item = warehouse.find(w => w.id === material.id);
        const metrajInfo = item ? `<p class="text-sm text-green-600 mt-1 font-bold">Metrajda ${item.quantity} adet var</p>` : `<p class="text-sm text-green-600 mt-1 h-5"></p>`;

        // Yıldızlar
        let starsHtml = '';
        const ratingMap = { 'Çok Önerilen': 5, 'Önerilen': 4, 'Az Önerilen': 3, 'Önerilmeyen': 2, 'Hiç Önerilmeyen': 1 };
        const stars = ratingMap[material.rating] || 0;
        for (let i = 0; i < 5; i++) {
            starsHtml += i < stars 
                ? `<i class="fa-solid fa-star text-yellow-400 text-xs"></i>`
                : `<i class="fa-solid fa-star text-gray-300 text-xs"></i>`;
        }

        // Resim Seçimi
        let materialImg = material.image || './img/banner.png';
        const mClass = material.material_class;
        if (mClass === "Tuğla") materialImg = "./img/Brick.svg";
        else if (mClass === "Çimento") materialImg = "./img/Cement.svg";
        else if (mClass === "Beton") materialImg = "./img/Concrete.svg";
        else if (mClass === "Ahşap") materialImg = "./img/Wood.png";
        else if (mClass === "Çelik") materialImg = "./img/Steel.svg";
        else if (mClass === "Yalıtım") materialImg = "./img/Isolation.svg";
        else if (mClass === "Cam") materialImg = "./img/Glass.svg";
        else if (mClass === "Zemin") materialImg = "./img/Tile.png";

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
                        <img src="${materialImg}" alt="${material.name}" class="w-full h-full object-contain" />
                    </div>
                </div>

                <div class="flex justify-between items-center border-t pt-3 mt-2">
                    <div class="flex flex-col">
                        <span class="text-[10px] uppercase text-gray-400 font-bold">Emisyon</span>
                        <span class="text-green-600 font-bold text-sm">🌱 ${material.carbon_emission || material.carbon || 0} kg</span>
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
                    addToWarehouse(material.id, material.material_class, qty, material.name, material.description || material.desc, material.carbon || material.carbon_emission);
                    input.value = 0;
                    input.classList.add('hidden');
                    card.querySelector('.quantity-decrement-btn').classList.add('hidden');
                    //alert(`${qty} adet ${material.name} metraja eklendi.`);
                    applyFilters(); 
                }
            } else {
                alert("Lütfen en az 1 adet seçin.");
            }
        });
    });
}