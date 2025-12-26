// material-page.js

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const materialId = params.get("id");

  if (!materialId) {
    document.body.innerHTML = "<p>Malzeme ID'si bulunamadı.</p>";
    return;
  }

  // materials.json dosyasının doğru yolunu kontrol edin.
  // Eğer materials.json, material-page.js ile aynı seviyede değilse, yolu düzeltin.
  // Örneğin: fetch("../materials.json") veya fetch("/materials.json")
fetch("materials.json")
  .then(res => res.json())
  .then(data => {
    const params = new URLSearchParams(window.location.search);
    const materialId = params.get("id");

    let foundMaterial = null;
    let foundCategory = null;

    // Her kategori içinde ara
    for (const [category, materials] of Object.entries(data)) {
      const match = materials.find(p => p.id === materialId);
      if (match) {
        foundMaterial = match;
        foundCategory = category;
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
    document.getElementById("material-description").textContent = foundMaterial.desc;
    document.getElementById("material-carbon").textContent = foundMaterial.carbon;
    document.getElementById("material-id").textContent = foundMaterial.id;

    const categoryText = document.getElementById("material-category");
    categoryText.textContent = foundCategory;
    categoryText.addEventListener("click", () => {
    window.location.href = `materials-listing.html?kategori=${encodeURIComponent(foundCategory)}`;
    });

    const categoryLink = document.getElementById("material-category-link")
    categoryLink.textContent = foundCategory;
    categoryLink.href = `materials-listing.html?kategori=${encodeURIComponent(foundCategory)}`;

    const imageEl = document.getElementById("material-image");
    imageEl.src = foundMaterial.image;
    imageEl.alt = foundMaterial.name;

  })
  .catch(err => {
    console.error(err);
    document.body.innerHTML = "<p>Veri yüklenirken hata oluştu.</p>";
    });
});