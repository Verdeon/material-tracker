<h3>🌱 Material Tracker</h3>

Material Tracker, inşaat malzemelerinin çevresel etkilerini analiz etmenizi sağlayan açık kaynaklı bir web uygulamasıdır.
Her malzeme için karbon salımı, öneri derecesi ve açıklama gibi detaylar sunar.
Ayrıca kullanıcılar, malzemeleri kendi yerel metrajlarına ekleyerek karbon yükünü hesaplayabilir.

<h3>🚀 Özellikler</h3>

🧱 Malzeme kataloğu (Beton, Çelik, Yalıtım vb.)

🔍 Arama ve kategori filtreleme sistemi

📦 Metraj yönetimi (localStorage üzerinden)

🌍 Karbon salımı takibi

📄 Malzeme detay sayfası

🎯 Gerçek zamanlı öneriler ve kategoriye göre filtreleme

<h3>📁 Proje Yapısı</h3>
<pre>
material-tracker/
├── index.html              # Ana sayfa
├── materials-listing.html   # Malzeme katalog sayfası
├── material-page.html       # Malzeme detay sayfası
├── materials.json           # Tüm malzeme verileri
├── warehouse.html          # Metraj ekranı
├── script/
│   ├── common.js           # Ortak fonksiyonlar
│   ├── material-page.js     # Malzeme detay yükleyici
│   ├── search.js           # Arama kutusu
│   ├── warehouse.js        # Metraj yönetimi
├── style/
│   └── main.css            # Tailwind/özel stil dosyaları
├── img/                    # Malzeme ikonları ve görseller
	</pre>

<h3>🛠️ Kurulum</h3>
<pre>
<code>git clone https://github.com/Verdeon/material-tracker
cd material-tracker
npx serve
</code></pre>
Veya VSCode Live Server ile doğrudan çalıştırabilirsiniz.

<h3>🧪 Geliştirici Notları</h3>

materials.json üzerinden tüm malzeme verileri yüklenir.

Sayfalar arası veri paylaşımı URL parametreleriyle yapılır:

?id= → malzeme detay

?kategori= → kategori filtreleme

Metraj içeriği ve karbon salımı localStorage ile saklanır.

<h3>🤝 Katkı</h3>

Katkıda bulunmak için pull request gönderebilir veya <a href="https://github.com/Verdeon/material-tracker/issues"> issue</a>  açabilirsiniz.

<h3>📄 Lisans</h3>

MIT Lisansı. Açık kaynak, dilediğiniz gibi kullanabilir ve geliştirebilirsiniz.
