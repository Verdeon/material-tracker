// material-page.js

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const materialId = params.get("id");

  if (!materialId) {
    document.body.innerHTML = "<p>Malzeme ID'si bulunamadı.</p>";
    return;
  }

fetch("materials.json")
  .then(res => res.json())
  .then(data => {
    if (data.materials) {
        const groups = {};
        data.materials.forEach(item => {
            // Eğer malzeme sınıfı yoksa oluştur, varsa içine at
            if (!groups[item.material_class]) groups[item.material_class] = [];
            groups[item.material_class].push(item);
        });
        data = groups;
    }

    const params = new URLSearchParams(window.location.search);
    const materialId = params.get("id");

    let foundMaterial = null;
    let foundMaterialClass = null;

    // Her malzeme sınıfı içinde ara
    for (const [materialClass, materials] of Object.entries(data)) {
      const match = materials.find(p => p.id === materialId);
      if (match) {
        foundMaterial = match;
        foundMaterialClass = materialClass;
        break;
      }
    }

    if (!foundMaterial) {
      document.body.innerHTML = "<p>Malzeme bulunamadı.</p>";
      return;
    }

    // Verileri DOM'a yerleştir
    document.getElementById("material-name").textContent = foundMaterial.name;
    document.getElementById("materialName").textContent = foundMaterial.name;
    document.getElementById("title-material").textContent = "VMT - " + foundMaterial.name;
    document.getElementById("material-desc").textContent = foundMaterial.desc;
    document.getElementById("material-carbon").textContent = foundMaterial.carbon_emission;
    document.getElementById("material-id").textContent = foundMaterial.id;
    document.getElementById("material-rating").innerHTML = document.getElementById("material-rating");

    function renderTabs(material) {
      // Yıldız Değerlendirmesi
      let materialRating = '';
      const ratingMap = { 'Çok Önerilen': 5, 'Önerilen': 4, 'Az Önerilen': 3, 'Önerilmeyen': 2, 'Hiç Önerilmeyen': 1 };
      const numberOfStars = ratingMap[material.rating] || 0;

      for (let i = 0; i < 5; i++) {
        if (i < numberOfStars) {
          materialRating += `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>`;
        } else {
          materialRating += `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>`;
        }
      }
      document.getElementById("material-rating").innerHTML = materialRating;
    
    // Veri güvenliği (Boş gelirse hata vermesin)
    const props = material.properties || {};
    const mech = props.mechanical || {};
    const phys = props.physical || {};
    const chem = props.chemical || {};
    const env = props.environmental || {};

    // 1. Mekanik Özellikler Tablosu
    document.getElementById('mechanical').innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h4 class="font-bold text-gray-800 mb-4 border-b pb-2">Mukavemet Değerleri</h4>
                ${createRow('Akma Dayanımı', mech.yield_strength, 'Elastik şekil değiştirmenin bittiği sınır.')}
                ${createRow('Çekme Dayanımı', mech.tensile_strength, 'Kopmadan önceki maksimum yük.')}
                ${createRow('Elastisite Modülü', mech.elastic_modulus, 'Malzemenin rijitliği (E).')}
            </div>
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h4 class="font-bold text-gray-800 mb-4 border-b pb-2">Diğer Özellikler</h4>
                ${createRow('Süneklik', mech.ductility, 'Kopma uzaması (%).')}
                ${createRow('Sertlik', mech.hardness, 'Batmaya karşı direnç.')}
                ${createRow('Tokluk', mech.toughness, 'Enerji yutma kapasitesi.')}
            </div>
        </div>
        <p class="text-xs text-gray-400 mt-4">*Bu değerler standart test koşulları içindir.</p>
    `;

    // 2. Fiziksel Özellikler Tablosu
    document.getElementById('physical').innerHTML = `
        <div class="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h4 class="font-bold text-blue-900 mb-4 border-b border-blue-200 pb-2">Fiziksel Parametreler</h4>
            ${createRow('Yoğunluk', phys.density, 'Birim hacim ağırlığı.')}
            ${createRow('Erime Noktası', phys.melting_point, 'Sıvı fazına geçiş sıcaklığı.')}
            ${createRow('Isıl İletkenlik', phys.thermal_conductivity, 'Isıyı iletme hızı.')}
            ${createRow('Elektrik Direnci', phys.electrical_resistivity, 'Elektrik akımına karşı direnç.')}
        </div>
    `;

    // 3. Kimyasal ve Yapısal (Ders notu mantığı burada)
    let phaseInfo = "";
    if (material.material_class === "Metal" && chem.carbon_content) {
        if (chem.carbon_content < 0.77) phaseInfo = "Hipoeutektoid Çelik (Ferrit + Perlit)";
        else if (chem.carbon_content == 0.77) phaseInfo = "Eutektoid Çelik (Perlit)";
        else phaseInfo = "Hipereutektoid Çelik (Sementit + Perlit)";
    }

    document.getElementById('chemical').innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-purple-50 p-6 rounded-xl border border-purple-100">
                <h4 class="font-bold text-purple-900 mb-4 border-b border-purple-200 pb-2">Mikroyapı</h4>
                ${createRow('Karbon Oranı', chem.carbon_content ? `%${chem.carbon_content}` : '-', 'Sertliği belirleyen ana unsur.')}
                ${createRow('Kristal Yapı', chem.crystal_structure, 'Atom dizilişi (BCC/FCC).')}
                ${createRow('Faz Yapısı', chem.microstructure, phaseInfo)}
            </div>
            <div class="bg-white p-6 rounded-xl border border-gray-200">
                <h4 class="font-bold text-gray-800 mb-4">Korozyon & Bileşim</h4>
                <p class="text-gray-600 mb-2"><strong>Direnç:</strong> ${chem.corrosion_resistance || 'Belirtilmemiş'}</p>
                <p class="text-sm text-gray-500">Not: Demir esaslı malzemeler neme karşı korunmalıdır.</p>
            </div>
        </div>
    `;

    // 4. Çevresel Etki Tablosu
    document.getElementById('environmental').innerHTML = `
        <div class="bg-green-50 p-6 rounded-xl border border-green-200 text-center">
            <div class="text-4xl mb-2">🌱</div>
            <h4 class="font-bold text-green-800 text-xl mb-2">Sürdürülebilirlik Raporu</h4>
            <p class="text-green-700 mb-4">Bu malzeme <strong>${env.recyclability || 'Bilinmiyor'}</strong> oranında geri dönüştürülebilir.</p>
            <div class="inline-block bg-white px-6 py-3 rounded-full shadow-sm border border-green-100">
                <span class="block text-xs text-gray-500 uppercase font-bold">Gömülü Enerji</span>
                <span class="text-2xl font-bold text-green-600">${env.embodied_energy || '-'}</span>
            </div>
        </div>
    `;

    setupTabClickLogic();
}

// Yardımcı: Satır Oluşturucu
function createRow(label, value, hint) {
    if (!value) return '';
    return `
    <div class="flex justify-between items-center py-2 border-b border-gray-200 last:border-0 hover:bg-black/5 px-2 rounded transition group relative cursor-help">
        <span class="text-gray-600 font-medium">${label}</span>
        <span class="font-mono font-bold text-gray-800">${value}</span>
        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-gray-800 text-white text-xs p-2 rounded z-20 text-center shadow-xl">
            ${hint}
        </div>
    </div>`;
}

// Sekme Tıklama Mantığı
function setupTabClickLogic() {
    const buttons = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // 1. Tüm butonların aktifliğini kaldır
            buttons.forEach(b => {
                b.classList.remove('border-green-600', 'text-green-600', 'font-bold');
                b.classList.add('border-transparent', 'text-gray-500', 'font-medium');
            });
            // 2. Tıklanan butonu aktif yap
            btn.classList.remove('border-transparent', 'text-gray-500', 'font-medium');
            btn.classList.add('border-green-600', 'text-green-600', 'font-bold');

            // 3. İçerikleri gizle/göster
            const targetId = btn.getAttribute('data-tab');
            contents.forEach(c => c.classList.add('hidden'));
            document.getElementById(targetId).classList.remove('hidden');
        });
    });
}

    const material_classText = document.getElementById("material-material_class");
    material_classText.textContent = foundMaterialClass;
    material_classText.addEventListener("click", () => {
    window.location.href = `materials-listing.html?material_class=${encodeURIComponent(foundMaterialClass)}`;
    });

    const material_classLink = document.getElementById("material-material_class-link")
    material_classLink.textContent = foundMaterialClass;
    material_classLink.href = `materials-listing.html?material_class=${encodeURIComponent(foundMaterialClass)}`;

    const imageEl = document.getElementById("material-image");
    imageEl.src = foundMaterial.image;
    imageEl.alt = foundMaterial.name;

    renderTabs(foundMaterial);
  })
  .catch(err => {
    console.error(err);
    document.body.innerHTML = "<p>Veri yüklenirken hata oluştu.</p>";
    });
});