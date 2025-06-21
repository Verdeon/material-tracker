// product-page.js

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!productId) {
    document.body.innerHTML = "<p>Ürün ID'si bulunamadı.</p>";
    return;
  }

  // products.json dosyasının doğru yolunu kontrol edin.
  // Eğer products.json, product-page.js ile aynı seviyede değilse, yolu düzeltin.
  // Örneğin: fetch("../products.json") veya fetch("/products.json")
fetch("products.json")
  .then(res => res.json())
  .then(data => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    let foundProduct = null;
    let foundCategory = null;

    // Her kategori içinde ara
    for (const [category, products] of Object.entries(data)) {
      const match = products.find(p => p.id === productId);
      if (match) {
        foundProduct = match;
        foundCategory = category;
        break;
      }
    }

    if (!foundProduct) {
      document.body.innerHTML = "<p>Ürün bulunamadı.</p>";
      return;
    }

    // Verileri DOM'a yerleştir
    document.getElementById("product-name").textContent = foundProduct.name;
    document.getElementById("productName").textContent = foundProduct.name;
    document.getElementById("product-desc").textContent = foundProduct.desc;
    document.getElementById("product-description").textContent = foundProduct.desc;
    document.getElementById("product-carbon").textContent = foundProduct.carbon;
    document.getElementById("product-id").textContent = foundProduct.id;

    const categoryText = document.getElementById("product-category");
    categoryText.textContent = foundCategory;
    categoryText.addEventListener("click", () => {
    window.location.href = `products-listing.html?kategori=${encodeURIComponent(foundCategory)}`;
    });

    const categoryLink = document.getElementById("product-category-link")
    categoryLink.textContent = foundCategory;
    categoryLink.href = `products-listing.html?kategori=${encodeURIComponent(foundCategory)}`;

    const imageEl = document.getElementById("product-image");
    imageEl.src = foundProduct.image;
    imageEl.alt = foundProduct.name;

  })
  .catch(err => {
    console.error(err);
    document.body.innerHTML = "<p>Veri yüklenirken hata oluştu.</p>";
    });
});