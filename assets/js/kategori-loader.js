/**
 * Merkezi Kategori Loader
 * Tüm sayfalarda kategorileri tek kaynaktan yükler
 * data.js'deki KATEGORİLER array'ini kullanır
 */

// Kategorileri sidebar'a yükle (hizmetler.html, uzmanlar.html)
function loadCategorySidebar(containerId = 'categoryList') {
  const container = document.getElementById(containerId);
  if (!container || typeof KATEGORİLER === 'undefined') return;

  container.innerHTML = KATEGORİLER.map(kat => `
    <li>
      <a href="uzmanlar.html?kategori=${kat.cat}" data-cat="${kat.cat}">
        <span style="display:flex;align-items:center;gap:8px">
          <span style="font-size:18px">${kat.icon}</span>
          ${kat.label}
        </span>
        <span>${kat.tags.length}</span>
      </a>
    </li>
  `).join('');
}

// Kategorileri filtre tab'larına yükle (hizmetler.html üst kısım)
function loadCategoryTabs(containerId = 'filterTabs') {
  const container = document.getElementById(containerId);
  if (!container || typeof KATEGORİLER === 'undefined') return;

  // İlk 8 popüler kategori + Tümü
  const popularCats = ['temizlik', 'mobilya-montaj', 'nakliyat', 'elektrik', 'tesisat', 'tadilat', 'bahce', 'diger'];
  
  const tabs = [
    '<button class="filter-tab active" data-cat="all">Tümü</button>',
    ...popularCats.map(slug => {
      const kat = KATEGORİLER.find(k => k.cat === slug);
      return kat ? `<button class="filter-tab" data-cat="${kat.cat}">${kat.icon} ${kat.label}</button>` : '';
    }).filter(Boolean)
  ];

  container.innerHTML = tabs.join('');
}

// Kategorileri select dropdown'a yükle (uzman-panel.html)
function loadCategorySelect(selectId = 'categorySelect') {
  const select = document.getElementById(selectId);
  if (!select || typeof KATEGORİLER === 'undefined') return;

  // Tüm tag'leri topluca ekle (uzman birden fazla seçebilir)
  const allTags = [...new Set(KATEGORİLER.flatMap(k => k.tags))].sort();
  
  select.innerHTML = `
    <option value="">Kategori seçin</option>
    ${allTags.map(tag => `<option value="${tag}">${tag}</option>`).join('')}
  `;
}

// Kategorileri hizmet kartları olarak render et (hizmetler.html)
function renderCategoryCards(containerId = 'servicesGrid') {
  const container = document.getElementById(containerId);
  if (!container || typeof KATEGORİLER === 'undefined') return;

  container.innerHTML = KATEGORİLER.map(kat => `
    <div class="service-card-v2" style="cursor:pointer" 
         onclick="window.location='uzmanlar.html?kategori=${kat.cat}'" 
         data-cat="${kat.cat}">
      <div class="service-card-v2__thumb" style="background:${getColorForCategory(kat.cat)}">
        ${kat.icon}
      </div>
      <div class="service-card-v2__body">
        <h3>${kat.label}</h3>
        <p>${kat.desc}</p>
        <div class="service-card-v2__meta">
          <div class="service-meta-left">
            <div class="price-tag">₺200'den başlar</div>
            <div class="rating-tag"><span>⭐</span> 4.9+ (${kat.tags.length * 10}+ yorum)</div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Kategori için renk seç
function getColorForCategory(cat) {
  const colors = {
    temizlik: '#fce7f3',
    nakliyat: '#fef3c7',
    tadilat: '#fce7f3',
    elektrik: '#fef9c3',
    tesisat: '#e0f2fe',
    'mobilya-montaj': '#ede9ff',
    'beyaz-esya': '#f0fdf4',
    klima: '#dbeafe',
    'zemin-kaplama': '#ecfdf5',
    'cam-balkon': '#e0f2fe',
    bahce: '#dcfce7',
    cilingir: '#f5f3ff',
    'perde-stor': '#ede9ff',
    'uydu-anten': '#dbeafe',
    'kalorifer-petek': '#fed7aa',
    yalitim: '#e0e7ff',
    'kapı-pencere': '#fce7f3',
    'hasar-onarim': '#fef3c7',
    diger: '#f3f4f6'
  };
  return colors[cat] || '#f3f4f6';
}

// Kategori slug'dan kategori objesini bul
function getCategoryBySlug(slug) {
  if (typeof KATEGORİLER === 'undefined') return null;
  return KATEGORİLER.find(k => k.cat === slug);
}

// URL'den kategori parametresini al
function getUrlCategory() {
  const params = new URLSearchParams(window.location.search);
  return params.get('kategori');
}

// Sayfa yüklendiğinde otomatik çalıştır
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Hangi sayfada olduğumuzu kontrol et
    const path = window.location.pathname;
    
    if (path.includes('hizmetler.html')) {
      loadCategorySidebar();
      loadCategoryTabs();
    } else if (path.includes('uzmanlar.html')) {
      loadCategorySidebar();
    } else if (path.includes('uzman-panel.html')) {
      loadCategorySelect();
    }
  });
}
