document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const resultsContainer = document.createElement("div");
  resultsContainer.id = "search-results";
  resultsContainer.style.position = "absolute";
  resultsContainer.style.backgroundColor = "white";
  resultsContainer.style.border = "none";
  resultsContainer.style.width = searchInput.offsetWidth + "px";
  resultsContainer.style.maxHeight = "200px";
  resultsContainer.style.overflowY = "auto";
  resultsContainer.style.zIndex = "1000";

  searchInput.parentNode.style.position = "relative"; // container relative olsun
  searchInput.parentNode.appendChild(resultsContainer);

  let materials = [];

  // materials.json'dan malzemeleri çek
  fetch("materials.json")
    .then(res => res.json())
    .then(data => {
      materials = Object.values(data).flat();
    });

  function filterMaterials(query) {
    const q = query.toLowerCase();
    return materials.filter(p =>
      p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
    );
  }

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();
    resultsContainer.innerHTML = "";

    if (query.length === 0) {
      resultsContainer.style.display = "none";
      return;
    } else {
      resultsContainer.style.border = "1px solid #ccc";
    }

    const filtered = filterMaterials(query).slice(0, 10); // max 10 sonuç

    filtered.forEach(item => {
      const div = document.createElement("div");
      div.textContent = item.name;
      div.style.padding = "5px 10px";
      div.style.cursor = "pointer";

      div.addEventListener("click", () => {
        window.location.href = `material-page.html?id=${encodeURIComponent(item.id)}`;
      });

      resultsContainer.appendChild(div);
    });

    resultsContainer.style.display = filtered.length > 0 ? "block" : "none";
  });

  // Enter tuşu ile arama gönder
  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query.length > 0) {
            window.location.href = `materials-listing.html?search=${encodeURIComponent(query)}`;
        }
    }
  });

  searchButton.addEventListener("click", (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query.length > 0) {
            window.location.href = `materials-listing.html?search=${encodeURIComponent(query)}`;
        }
  });

  // Tıklama dışı sonuçları kapat
  document.addEventListener("click", e => {
    if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
      resultsContainer.style.display = "none";
    }
  });

  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search'); // ?search=... kısmını alır

  if (searchParam) {
  // 1. Arama kutusuna yazıyı koy
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = searchParam;
  // 2. Filtreleme fonksiyonunu çağır
      if (typeof filterMaterials === 'function') {
        filterMaterials(); 
      }
 }
});