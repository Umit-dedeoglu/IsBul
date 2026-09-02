/**
 * Merkezi Kategori Loader
 * Tüm sayfalarda kategorileri tek kaynaktan yükler
 * data.js'deki KATEGORİLER array'ini kullanır
 */

function renderSubCategoryCards(filterCat = 'all', containerId = 'servicesgrid') {
  const container = document.getElementById(containerId);
  if (!container || typeof KATEGORİLER === 'undefined') return;

  let subCats = [];
  if (filterCat === 'all') {
    subCats = KATEGORİLER.flatMap(k => (k.subCategories || []).map(sc => ({...sc, parentCat: k.cat})));
  } else {
    const kat = KATEGORİLER.find(k => k.cat === filterCat);
    if (kat && kat.subCategories) {
      subCats = kat.subCategories.map(sc => ({...sc, parentCat: kat.cat}));
    }
  }

  container.innerHTML = subCats.map(sc => `
    <div class="service-card-v2" style="cursor:pointer" 
         onclick="window.location='uzmanlar.html?kategori=${encodeURIComponent(sc.label)}'" 
         data-cat="${sc.parentCat}" data-price="${sc.price}" data-rating="4.9">
      <div class="service-card-v2__thumb" style="background:${getColorForCategory(sc.parentCat)}">
        ${sc.icon}
        ${sc.hot ? '<span class="service-card-v2__badge service-card-v2__badge--hot">Popüler</span>' : ''}
      </div>
      <div class="service-card-v2__body">
        <h3>${sc.label}</h3>
        <p>${sc.desc}</p>
        <div class="service-card-v2__meta">
          <div class="service-meta-left">
            <div class="price-tag">₺${sc.price}'den başlar</div>
            <div class="rating-tag"><span>⭐</span> 4.9+</div>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  const rc = document.getElementById('resultCount');
  if (rc) rc.textContent = subCats.length;
}

// Kategorileri sidebar'a yükle (hizmetler.html, uzmanlar.html)
function loadCategorySidebar(containerId = 'categoryList') {
  const container = document.getElementById(containerId);
  if (!container || typeof KATEGORİLER === 'undefined') return;

  container.innerHTML = `
    <li>
      <a href="#" class="sidebar-cat-link active" data-cat="all">
        <span style="display:flex;align-items:center;gap:8px">
          <span style="font-size:18px">🌍</span>
          Tüm Hizmetler
        </span>
        <span>${KATEGORİLER.reduce((acc,k)=>acc+(k.subCategories?.length||0),0)}</span>
      </a>
    </li>
  ` + KATEGORİLER.map(kat => `
    <li>
      <a href="#" class="sidebar-cat-link" data-cat="${kat.cat}">
        <span style="display:flex;align-items:center;gap:8px">
          <span style="font-size:18px">${kat.icon}</span>
          ${kat.label}
        </span>
        <span>${kat.subCategories?.length || 0}</span>
      </a>
    </li>
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
