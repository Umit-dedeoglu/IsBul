/* ============================================================
   İşBul – Ana JavaScript Dosyası  (v5)
   ============================================================ */
'use strict';

// USERS, ILLER, TÜM_UZMANLAR ve yardımcı fonksiyonlar data.js'den gelir

/* ============================================================
   ZOOM YÖNETİMİ — Tüm sayfalarda zoom seviyesini korur
   ============================================================ */
(function initZoomPersistence() {
  const ZOOM_KEY = 'isbul_zoom_level';
  
  // Sayfa yüklendiğinde kaydedilmiş zoom seviyesini uygula
  function applyZoom() {
    try {
      const savedZoom = localStorage.getItem(ZOOM_KEY);
      if (savedZoom) {
        const zoomValue = parseFloat(savedZoom);
        if (zoomValue >= 0.25 && zoomValue <= 5) {
          document.body.style.zoom = zoomValue;
        }
      }
    } catch(e) {
      console.warn('Zoom seviyesi yüklenemedi:', e);
    }
  }
  
  // Zoom değişikliklerini izle ve kaydet
  function saveZoom() {
    try {
      const currentZoom = parseFloat(document.body.style.zoom) || 1;
      localStorage.setItem(ZOOM_KEY, currentZoom.toString());
    } catch(e) {
      console.warn('Zoom seviyesi kaydedilemedi:', e);
    }
  }
  
  // Zoom değişikliklerini dinle
  function observeZoom() {
    // MutationObserver ile body'nin style değişikliklerini izle
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          saveZoom();
        }
      });
    });
    
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style']
    });
  }
  
  // Sayfa yüklendiğinde zoom'u uygula
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyZoom();
      observeZoom();
    });
  } else {
    applyZoom();
    observeZoom();
  }
})();

/* Expert index to object helper (geriye dönük uyumluluk) */
function getExpertByIndex(i) { return TÜM_UZMANLAR[i] || TÜM_UZMANLAR[0]; }
function getExpertsByCategory(cat) {
  return TÜM_UZMANLAR.filter(e => e.categories.includes(cat));
}

/* ============================================================
   AUTH SİSTEMİ — localStorage tabanlı, sayfa değişiminde korunur
   ============================================================ */

const AUTH_KEY     = 'isbul_auth';
const USERS_DB_KEY = 'isbul_users_db';

/* Kullanıcı veritabanı — localStorage'da saklanır */
function getUsersDB() {
  try { return JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}'); }
  catch(e) { return {}; }
}
function saveUsersDB(db) {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
}

/* Demo uzman hesabını oluştur / güncelle - SADECE DEVELOPMENT MODUNDA */
function seedDemoExpert() {
  // 🔒 GÜVENLİK: Production'da demo hesap oluşturma
  const hostname = window.location.hostname;
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    console.log('🔒 Demo hesap sadece development modunda oluşturulur');
    return; // Production'da çalıştırma
  }
  
  const db = getUsersDB();
  const email = 'demo@isbul.local'; // Demo email
  const password = 'demo123456'; // Demo şifre

  // Her zaman güncel veriyle kaydet (varsa üstüne yaz, kategoriler dahil)
  db[email] = {
    id: 'u_demo_expert_001',
    firstName: 'Demo',
    lastName: 'Dedeoğlu',
    email: email,
    passwordHash: btoa(password + '_isbul_salt'),
    createdAt: db[email]?.createdAt || new Date().toISOString(),
    avatar: 'ÜD',
    color: '#6C63FF',
    role: 'expert',
    isExpert: true,
    expertData: {
      tags:       ['Mobilya Montajı', 'TV Montajı', 'Elektrik'],
      categories: ['montaj', 'tv', 'elektrik'],
      city:       'İstanbul',
      price:      350,
      rating:     5.0,
      reviews:    0,
      experience: '5+ yıl',
      bio:        'Profesyonel mobilya montajı, TV montajı ve elektrik işleri uzmanı. İstanbul genelinde hizmet veriyorum.',
      verified:   true,
      elite:      true,
      hours:      'Pzt-Cum: 09:00-18:00'
    }
  };
  saveUsersDB(db);

  // Eğer oturum açıksa ve bu kullanıcıysa session'ı da güncelle
  const session = getSession();
  if (session && session.email === email) {
    session.isExpert  = true;
    session.role      = 'expert';
    session.expertData = db[email].expertData;
    saveSession(session);
  }

  console.log('✅ Demo uzman hesabı senkronize edildi:', email);
}

/* Oturum yönetimi */
function getSession() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); }
  catch(e) { return null; }
}
function saveSession(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem(AUTH_KEY);
}

function isLoggedIn() {
  return getSession() !== null;
}
window.isLoggedIn = isLoggedIn;

/* Kayıt ol — API öncelikli, localStorage fallback */
function registerUser(firstName, lastName, email, password) {
  const db = getUsersDB();
  if (db[email.toLowerCase()]) {
    return { success: false, error: 'Bu e-posta adresi zaten kayıtlı.' };
  }
  const user = {
    id: 'u_' + Date.now(),
    firstName, lastName,
    email: email.toLowerCase(),
    passwordHash: btoa(password + '_isbul_salt'),
    createdAt: new Date().toISOString(),
    avatar: (firstName[0] + lastName[0]).toUpperCase(),
    color: ['#6C63FF','#FF6B6B','#4ECDC4','#FFD93D','#96CEB4','#56AB2F'][Math.floor(Math.random()*6)]
  };
  db[email.toLowerCase()] = user;
  saveUsersDB(db);
  return { success: true, user };
}

/* Giriş yap — API öncelikli, localStorage fallback */
function loginUser(email, password) {
  const db = getUsersDB();
  const user = db[email.toLowerCase()];
  if (!user) {
    return { success: false, error: 'Bu e-posta adresi ile kayıtlı hesap bulunamadı.' };
  }
  const expectedHash = btoa(password + '_isbul_salt');
  if (user.passwordHash !== expectedHash) {
    return { success: false, error: 'Şifre hatalı. Lütfen tekrar deneyin.' };
  }
  const session = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatar: user.avatar,
    color: user.color,
    role: user.role || 'customer',
    isExpert: user.isExpert || false,
    expertData: user.expertData || null
  };
  saveSession(session);
  return { success: true, user: session };
}

/* Çıkış yap */
function logoutUser() {
  // Backend'e logout bildir (token blacklist)
  const token = localStorage.getItem('isbul_jwt');
  if (token && typeof IsbulAPI !== 'undefined') {
    fetch((window.ISBUL_CONFIG?.backendUrl || 'https://isbul-backend.onrender.com') + '/api/v1/auth/logout', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    }).catch(() => {}); // Sessizce başarısız ol
  }
  clearSession();
  if (typeof TokenManager !== 'undefined') TokenManager.clear();
  _updateNavbarGuest();
  showToast('Çıkış yapıldı. Görüşmek üzere!', 'info');
  setTimeout(() => { window.location.href = 'index.html'; }, 800);
}
window.logoutUser = logoutUser;

/* ============================================================
   AUTH GUARD — giriş gerektiren aksiyonlar için
   ============================================================ */
let _pendingCallback = null;

function requireAuth(callback, message) {
  if (isLoggedIn()) {
    if (typeof callback === 'function') callback();
    return;
  }
  const modal = document.getElementById('authModal');
  if (!modal) return;

  const existingMsg = modal.querySelector('.auth-required-msg');
  if (existingMsg) existingMsg.remove();

  const msg = document.createElement('div');
  msg.className = 'auth-required-msg';
  msg.innerHTML = `<span>🔒</span><span>${message || 'Bu işlem için giriş yapmanız gerekiyor.'}</span>`;
  const authBody = modal.querySelector('.auth-body');
  if (authBody) authBody.insertAdjacentElement('beforebegin', msg);

  if (typeof openAuthModal === 'function') openAuthModal('login');
  if (typeof callback === 'function') _pendingCallback = callback;
}
window.requireAuth = requireAuth;

/* ============================================================
   NAVBAR — oturum durumuna göre güncelle
   ============================================================ */
function _updateNavbarLoggedIn(email, name) {
  const session = getSession();
  const displayName = name || (session ? session.firstName + ' ' + session.lastName : email?.split('@')[0]) || 'Kullanıcı';
  const initials    = session ? session.avatar : (displayName[0]||'U').toUpperCase();
  const color       = session?.color || '#6C63FF';

  document.querySelectorAll('.navbar__actions').forEach(actions => {
    // Mevcut butonları gizle
    actions.querySelectorAll('button:not(.hamburger), a.btn').forEach(b => {
      if (b.textContent.includes('Giriş') || b.textContent.includes('Kaydol')) {
        b.style.display = 'none';
      }
    });
    // Daha önce eklenmiş kullanıcı butonunu kaldır
    actions.querySelector('.user-menu-btn')?.remove();

    // Kullanıcı menu butonu ekle
    const userBtn = document.createElement('div');
    userBtn.className = 'user-menu-btn';
    userBtn.style.cssText = 'display:flex;align-items:center;gap:8px;padding:7px 14px;border-radius:50px;background:var(--primary-light);color:var(--primary);font-weight:600;font-size:14px;cursor:pointer;position:relative;user-select:none';
    userBtn.innerHTML = `
      <div style="width:28px;height:28px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${initials}</div>
      <span style="max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${displayName.split(' ')[0]}</span>
      <span style="font-size:10px;opacity:.7">▼</span>
      <div class="user-dropdown" style="display:none;position:absolute;top:calc(100% + 8px);right:0;background:var(--white);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.12);border:1.5px solid var(--border);min-width:180px;overflow:hidden;z-index:200">
        <div style="padding:14px 16px;border-bottom:1px solid var(--border)">
          <div style="font-size:13px;font-weight:700">${displayName}</div>
          <div style="font-size:11px;color:var(--text-muted)">${session?.email||email||''}</div>
        </div>
        ${session?.role === 'admin' || session?.email === 'umityakupdedeoglu0@gmail.com'
          ? '<a href="admin-panel.html" style="display:flex;align-items:center;gap:10px;padding:12px 16px;font-size:14px;color:#6C63FF;text-decoration:none;transition:.15s;font-weight:700;border-bottom:1px solid var(--border);background:#f5f3ff" onmouseover="this.style.background=\'#ede9ff\'" onmouseout="this.style.background=\'#f5f3ff\'">🛡️ Admin Girişi</a>'
          : ''}
        <a href="profil.html" style="display:flex;align-items:center;gap:10px;padding:12px 16px;font-size:14px;color:var(--text);text-decoration:none;transition:.15s" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''">👤 Profilim</a>
        <button onclick="logoutUser()" style="display:flex;align-items:center;gap:10px;padding:12px 16px;font-size:14px;color:#ef4444;background:none;border:none;cursor:pointer;width:100%;text-align:left;border-top:1px solid var(--border)" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background=''">🚪 Çıkış Yap</button>
      </div>`;
    userBtn.addEventListener('click', e => {
      e.stopPropagation();
      const dd = userBtn.querySelector('.user-dropdown');
      dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
    });

    // Dışarıya tıklayınca kapat — tek seferlik global listener (öncekini temizle)
    if (!window._userDropdownListener) {
      window._userDropdownListener = () => {
        document.querySelectorAll('.user-dropdown').forEach(d => d.style.display = 'none');
      };
      document.addEventListener('click', window._userDropdownListener);
    }

    const hamburger = actions.querySelector('.hamburger');
    if (hamburger) actions.insertBefore(userBtn, hamburger);
    else actions.appendChild(userBtn);
  });
}

function _updateNavbarGuest() {
  document.querySelectorAll('.navbar__actions').forEach(actions => {
    actions.querySelector('.user-menu-btn')?.remove();
    actions.querySelectorAll('button:not(.hamburger), a.btn').forEach(b => {
      b.style.display = '';
    });
  });
}

/* Sayfa yüklendiğinde oturumu kontrol et ve navbar'ı güncelle */
function _initAuthState() {
  // Demo uzman hesabını her zaman güncel veriyle kaydet
  seedDemoExpert();
  
  if (isLoggedIn()) {
    _updateNavbarLoggedIn();
  }
  
  // Uzman listesi varsa cache'i sıfırla ve yeniden yükle
  // (seedDemoExpert çalıştıktan sonra güncel listeyi göstermek için)
  if (typeof renderExperts === 'function') {
    renderExperts(true);
  }
  
  // Navbar'daki "Uzman Ol" linkini dinamik yap
  const session = getSession();
  const navLinks = document.querySelectorAll('.navbar__links a[href="uzman-ol.html"]');
  navLinks.forEach(link => {
    if (session && session.role === 'admin') {
      link.href      = 'admin-panel.html';
      link.textContent = 'Admin Paneli';
      link.style.color = '#ef4444';
      link.style.fontWeight = '700';
    } else if (session && session.isExpert) {
      link.href        = 'uzman-panel.html';
      link.textContent = 'Uzman Panelim';
      
      // Eğer uzman-panel.html sayfasındaysa aktif stili uygula
      const currentPage = window.location.pathname.split('/').pop();
      if (currentPage === 'uzman-panel.html') {
        link.style.color = 'var(--primary)';
        link.style.fontWeight = '700';
      } else {
        link.style.color = '';
        link.style.fontWeight = '';
      }
    }
  });
}

/* ---------- 1. FEATHER ICONS + AUTH STATE ---------- */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof feather !== 'undefined') feather.replace();
  _initAuthState(); // Her sayfa yüklendiğinde oturum durumunu kontrol et
});

// Component loader'dan çağrılabilmesi için global'e expose et
window._initAuthState = _initAuthState;
window._initAuthModalFull = _initAuthModalFull;

/* ---------- 2. NAVBAR SCROLL ---------- */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---------- 3. HAMBURGER MENU ---------- */
(function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      links.classList.remove('open');
      document.body.style.overflow = '';
    })
  );
})();

/* ---------- 4. ARAMA ÖNERİLERİ + ŞEHİR DROPDOWN ---------- */
(function initSearch() {
  const SERVICES = [
    'Mobilya Montajı','Mobilya Montajı','Raf Montajı','Yatak Montajı','Karyola Montajı',
    'Ev Temizliği','Derin Temizlik','Ofis Temizliği','Cam Temizliği','Banyо Temizliği',
    'Nakliyat','Ev Taşıma','Ofis Taşıma','Eşya Depolama','Parça Taşıma',
    'Elektrikçi','Priz Montajı','Aydınlatma Kurulumu','Sigorta Paneli','Kablo Çekme',
    'Tesisatçı','Su Tesisatı','Musluk Tamiri','Kalorifer Tamiri','Tıkanıklık Açma',
    'Boyacı','İç Cephe Boya','Duvar Kağıdı','Dekoratif Boya','Alçı Tamiri',
    'TV Montajı','Uydu Kurulumu','Klima Montajı','Çanak Anten','Projeksiyon Kurulum',
    'Bahçe Bakımı','Çim Biçme','Ağaç Budama','Peyzaj Düzenleme','Sulama Sistemi',
    'Tadilat','Alçıpan','Seramik Döşeme','Parke Döşeme','Kapı Kilit Değişimi',
    'Halı Yıkama','Koltuk Yıkama','Stor Perde Montajı','Çilingir','Bilgisayar Destek',
  ];

  const categoryInput = document.getElementById('categoryInput');
  const categoryDropdown = document.getElementById('categoryDropdown');
  const cityInput    = document.getElementById('cityInput');
  const cityDropdown = document.getElementById('cityDropdown');

  if (categoryInput && categoryDropdown) {
    // Tüm kategorileri bir array'e al
    const allCategories = Array.from(categoryDropdown.querySelectorAll('.category-option')).map(opt => ({
      element: opt,
      category: opt.dataset.category,
      text: opt.textContent
    }));

    // Input'a focus olduğunda dropdown'u aç
    categoryInput.addEventListener('focus', () => {
      categoryDropdown.classList.add('active');
      // Tüm kategorileri göster
      allCategories.forEach(cat => {
        cat.element.style.display = '';
      });
    });

    // Yazarken filtreleme yap - İLK HARF EŞLEŞMESI
    categoryInput.addEventListener('input', () => {
      const searchText = categoryInput.value.toLowerCase().trim();
      categoryDropdown.classList.add('active');
      
      if (!searchText) {
        // Boşsa hepsini göster
        allCategories.forEach(cat => {
          cat.element.style.display = '';
        });
      } else {
        // Filtrele - İLK HARFLE BAŞLAYANLAR
        allCategories.forEach(cat => {
          const matches = cat.text.toLowerCase().startsWith(searchText);
          cat.element.style.display = matches ? '' : 'none';
        });
      }
    });

    // Kategori seçildiğinde
    categoryDropdown.querySelectorAll('.category-option').forEach(opt =>
      opt.addEventListener('click', () => {
        categoryInput.value = opt.textContent;
        categoryDropdown.classList.remove('active');
      })
    );

    // Dışarıya tıklayınca kapat
    document.addEventListener('click', e => {
      if (!categoryInput.parentElement.contains(e.target)) categoryDropdown.classList.remove('active');
    });
  }

  if (cityInput && cityDropdown) {
    // Tüm şehirleri bir array'e al
    const allCities = Array.from(cityDropdown.querySelectorAll('.city-option')).map(opt => ({
      element: opt,
      name: opt.dataset.city,
      text: opt.textContent
    }));

    // Input'a focus olduğunda dropdown'u aç
    cityInput.addEventListener('focus', () => {
      cityDropdown.classList.add('active');
      // Tüm şehirleri göster
      allCities.forEach(city => {
        if (city.element.dataset.city) city.element.style.display = '';
      });
    });

    // Yazarken filtreleme yap - İLK HARF EŞLEŞMESI
    cityInput.addEventListener('input', () => {
      const searchText = cityInput.value.toLowerCase().trim();
      cityDropdown.classList.add('active');
      
      if (!searchText) {
        // Boşsa hepsini göster
        allCities.forEach(city => {
          if (city.element.dataset.city) city.element.style.display = '';
        });
      } else {
        // Filtrele - İLK HARFLE BAŞLAYANLAR
        allCities.forEach(city => {
          if (city.name) {
            const matches = city.name.toLowerCase().startsWith(searchText);
            city.element.style.display = matches ? '' : 'none';
          }
        });
      }
    });

    // Şehir seçildiğinde
    cityDropdown.querySelectorAll('.city-option').forEach(opt => {
      opt.addEventListener('click', () => {
        if (opt.dataset.city) {
          cityInput.value = opt.dataset.city;
        }
        cityDropdown.classList.remove('active');
      });
    });

    // Dışarıya tıklayınca kapat
    document.addEventListener('click', e => {
      if (!cityInput.parentElement.contains(e.target)) {
        cityDropdown.classList.remove('active');
      }
    });
  }
})();

/* ---------- 5. REZERVASYON MODAL (gerçek veriler) ---------- */
const MOCK_EXPERTS = TÜM_UZMANLAR; // geriye dönük uyumluluk

let bookingState = { step:1, expert:null, service:'', city:'', date:'', endDate:'', time:'', endTime:'', durationType:'hours', durationValue:1, notes:'' };

/* ── Takvim yardımcı fonksiyonları ── */
function getSlotsBetween(startDate, startTime, endDate, endTime) {
  // startDate–endDate arasındaki tüm gün+saat kombinasyonlarını döndürür
  const slots = [];
  const times = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];
  const start = new Date(startDate + 'T' + startTime);
  const end   = new Date((endDate || startDate) + 'T' + (endTime || startTime));
  const cur   = new Date(start);
  while (cur <= end) {
    const d = cur.toISOString().split('T')[0];
    const h = cur.toTimeString().slice(0,5);
    if (times.includes(h)) slots.push(d + '_' + h);
    cur.setHours(cur.getHours() + 1);
  }
  return slots;
}

function markSlotsInCalendar(expertId, slots, rezId) {
  const TAKVIM_KEY = 'isbul_takvim_' + expertId;
  let takvim = {};
  try { takvim = JSON.parse(localStorage.getItem(TAKVIM_KEY) || '{}'); } catch(e) {}
  slots.forEach(s => { takvim[s] = rezId; });
  localStorage.setItem(TAKVIM_KEY, JSON.stringify(takvim));
}

function clearSlotsFromCalendar(expertId, slots) {
  const TAKVIM_KEY = 'isbul_takvim_' + expertId;
  let takvim = {};
  try { takvim = JSON.parse(localStorage.getItem(TAKVIM_KEY) || '{}'); } catch(e) {}
  slots.forEach(s => { delete takvim[s]; });
  localStorage.setItem(TAKVIM_KEY, JSON.stringify(takvim));
}

function calcDurationLabel(durationType, durationValue) {
  if (durationType === 'hours') return durationValue + ' saat';
  if (durationType === 'days')  return durationValue + ' gün (tüm gün)';
  if (durationType === 'weeks') return durationValue + ' hafta';
  return '';
}

function calcEndDatetime(startDate, startTime, durationType, durationValue) {
  const start = new Date(startDate + 'T' + startTime);
  let end = new Date(start);
  if (durationType === 'hours') end.setHours(end.getHours() + durationValue - 1);
  if (durationType === 'days')  { end.setDate(end.getDate() + durationValue - 1); end.setHours(19); }
  if (durationType === 'weeks') { end.setDate(end.getDate() + durationValue * 7 - 1); end.setHours(19); }
  return {
    endDate: end.toISOString().split('T')[0],
    endTime: end.toTimeString().slice(0,5)
  };
}

function calcTotalPrice(price, durationType, durationValue) {
  if (durationType === 'hours') return price * durationValue;
  if (durationType === 'days')  return price * 8 * durationValue;  // 8 saat/gün
  if (durationType === 'weeks') return price * 8 * 5 * durationValue; // 5 gün/hafta
  return price;
}

function openBookingModal(expertIndexOrId, serviceName) {
  // AUTH GUARD — giriş gerekli
  requireAuth(function() {
    const city = document.getElementById('cityInput')?.value || '';
    let expert;

    // Önce getTumUzmanlar'dan ara (gerçek kullanıcılar dahil)
    const tumUzmanlar = typeof getTumUzmanlar === 'function' ? getTumUzmanlar() : TÜM_UZMANLAR;

    if (typeof expertIndexOrId === 'string' && expertIndexOrId.startsWith('e')) {
      // Statik uzman id'si — önce gerçek listede ara, sonra statik listede
      expert = tumUzmanlar.find(e => e.id === expertIndexOrId) || TÜM_UZMANLAR[0];
    } else if (typeof expertIndexOrId === 'string' && expertIndexOrId.startsWith('u_')) {
      // Gerçek kullanıcı id'si
      expert = tumUzmanlar.find(e => e.id === expertIndexOrId);
      if (!expert) {
        // users_db'den direkt oluştur
        const db = getUsersDB();
        const u = Object.values(db).find(u => u.id === expertIndexOrId && u.isExpert);
        if (u) expert = {
          id: u.id, name: u.firstName + ' ' + u.lastName,
          city: u.expertData?.city || 'İstanbul',
          avatar: u.avatar, color: u.color,
          title: (u.expertData?.tags?.[0] || 'Uzman') + ' Uzmanı',
          categories: (u.expertData?.tags || []).map(t => t.toLowerCase()),
          rating: u.expertData?.rating || 5.0, reviews: u.expertData?.reviews || 0,
          price: u.expertData?.price || 300, experience: u.expertData?.experience || '1 yıl',
          elite: false, bio: u.expertData?.bio || '', tags: u.expertData?.tags || [],
          reviewList: [], isRealUser: true
        };
      }
      if (!expert) expert = TÜM_UZMANLAR[0];
    } else {
      const idx = typeof expertIndexOrId === 'number' ? expertIndexOrId : parseInt(expertIndexOrId) || 0;
      expert = TÜM_UZMANLAR[idx] || TÜM_UZMANLAR[0];
    }

    bookingState = { step:1, expert, service: serviceName||'', city, date:'', endDate:'', time:'', endTime:'', durationType:'hours', durationValue:1, notes:'' };
    renderBookingModal();
    const m = document.getElementById('bookingModal');
    if (m) { m.classList.add('active'); document.body.style.overflow='hidden'; }
  }, 'Rezervasyon yapmak için önce giriş yapmanız gerekiyor.');
}
window.openBookingModal = openBookingModal;

function closeBookingModal() {
  const m = document.getElementById('bookingModal');
  if (m) { m.classList.remove('active'); document.body.style.overflow = ''; }
}
window.closeBookingModal = closeBookingModal;

function renderBookingModal() {
  const body = document.getElementById('bookingModalBody');
  if (!body) return;
  const e = bookingState.expert;
  const initials = e.avatar || e.initials || e.name.split(' ').map(w=>w[0]).join('').slice(0,2);
  const steps = ['Uzman Profili','Tarih & Saat','Onay'];
  const stepHTML = steps.map((s,i) => `
    <div style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:${bookingState.step===i+1?'var(--primary)':bookingState.step>i+1?'var(--success)':'var(--text-muted)'}">
      <div style="width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;background:${bookingState.step===i+1?'var(--primary)':bookingState.step>i+1?'var(--success)':'var(--border)'};color:${bookingState.step>=i+1?'#fff':'var(--text-muted)'}">${bookingState.step>i+1?'✓':i+1}</div>
      <span class="modal-step-label">${s}</span>
    </div>
    ${i<2?'<div style="flex:1;height:2px;background:'+(bookingState.step>i+1?'var(--success)':'var(--border)')+'"></div>':''}
  `).join('');

  const reviewsHTML = (e.reviewList||[]).slice(0,2).map(r => {
    const cust = USERS.customers.find(c=>c.id===r.user)||{ name:'Müşteri', avatar:'M', color:'#999' };
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5-r.rating);
    return `<div style="background:var(--bg);border-radius:10px;padding:12px;margin-bottom:8px">
      <div style="color:#f59e0b;font-size:12px;margin-bottom:4px">${stars}</div>
      <p style="font-size:13px;color:var(--text);font-style:italic;margin-bottom:8px">"${r.text}"</p>
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:26px;height:26px;border-radius:50%;background:${cust.color};color:#fff;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center">${cust.avatar}</div>
        <div style="font-size:12px"><strong>${cust.name}</strong> <span style="color:var(--text-muted)">• ${r.service}</span></div>
      </div>
    </div>`;
  }).join('');

  if (bookingState.step === 1) {
    body.innerHTML = `
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:20px;flex-wrap:wrap">${stepHTML}</div>
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
        <div style="width:56px;height:56px;border-radius:50%;background:${e.color};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:15px;flex-shrink:0">${initials}</div>
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:8px">
            <strong style="font-size:17px">${e.name}</strong>
            ${e.elite?'<span style="background:#fbbf24;color:#78350f;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px">🏆 Elite</span>':''}
          </div>
          <div style="font-size:13px;color:var(--text-muted)">${e.title||e.bio?.slice(0,40)} • ${e.city}</div>
          <div style="font-size:13px;color:#f59e0b">★ ${e.rating} <span style="color:var(--text-muted)">(${e.reviews} yorum) • ${e.experience}</span></div>
        </div>
        <div style="margin-left:auto;text-align:right;flex-shrink:0">
          <strong style="color:var(--primary);font-size:18px">₺${e.price}</strong>
          <div style="font-size:11px;color:var(--text-muted)">/saat</div>
        </div>
      </div>
      <div style="background:var(--bg);border-radius:10px;padding:14px;margin-bottom:12px;font-size:14px;color:var(--text);line-height:1.7">${e.bio}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">${(e.tags||[]).map(t=>`<span style="padding:4px 12px;border-radius:20px;background:var(--primary-light);color:var(--primary);font-size:12px;font-weight:500">${t}</span>`).join('')}</div>
      ${reviewsHTML ? `<div style="margin-bottom:14px"><div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Son Yorumlar</div>${reviewsHTML}</div>` : ''}
      <div style="background:#fffbe6;border-radius:10px;padding:12px;font-size:13px;color:#92400e;margin-bottom:16px">✅ Kimlik Doğrulandı &nbsp;|&nbsp; 🛡️ Sigortalı &nbsp;|&nbsp; 💳 Güvenli Ödeme</div>
      <div class="form-group"><label style="font-size:13px;font-weight:600">Hizmet Notu (isteğe bağlı)</label>
        <textarea id="bmNotes" rows="2" placeholder="Uzman için notlarınız..." style="width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid var(--border);font-family:var(--font);font-size:14px;outline:none;resize:none;margin-top:6px">${bookingState.notes}</textarea>
      </div>
      <button onclick="bookingState.notes=document.getElementById('bmNotes').value;bookingState.step=2;renderBookingModal()" class="btn btn--primary" style="width:100%;justify-content:center;border-radius:50px">Tarih & Saat Seç →</button>`;

  } else if (bookingState.step === 2) {
    const today = new Date();
    const dates = Array.from({length:30},(_,i)=>{ const d=new Date(today); d.setDate(today.getDate()+i); return { label:i===0?'Bugün':i===1?'Yarın':d.toLocaleDateString('tr-TR',{weekday:'short',day:'numeric',month:'short'}), val:d.toISOString().split('T')[0] }; });
    const times = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];

    // Uzmanın dolu slotlarını yükle
    const TAKVIM_KEY = 'isbul_takvim_' + bookingState.expert.id;
    let takvim = {};
    try { takvim = JSON.parse(localStorage.getItem(TAKVIM_KEY) || '{}'); } catch(err) {}

    // Süre seçenekleri
    const durationOptions = {
      hours: [1,2,3,4,5,6,7,8],
      days:  [1,2,3,4,5,6,7],
      weeks: [1,2,3,4]
    };

    body.innerHTML = `
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:20px;flex-wrap:wrap">${stepHTML}</div>

      <!-- Tarih Seçimi -->
      <p style="font-size:13px;font-weight:700;margin-bottom:10px">📅 Başlangıç Tarihi</p>
      <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;margin-bottom:16px" id="dateBtns">
        ${dates.map(d=>`<button onclick="bookingState.date='${d.val}';document.querySelectorAll('.date-btn').forEach(b=>{b.style.background='var(--bg)';b.style.color='var(--text)';b.style.borderColor='var(--border)'});this.style.background='var(--primary)';this.style.color='#fff';this.style.borderColor='var(--primary)';bookingState.time='';updateDurationPreview();renderTimeSlots('${d.val}')" class="date-btn" style="flex-shrink:0;padding:8px 14px;border-radius:10px;border:1.5px solid ${bookingState.date===d.val?'var(--primary)':'var(--border)'};font-size:12px;font-weight:600;cursor:pointer;background:${bookingState.date===d.val?'var(--primary)':'var(--bg)'};color:${bookingState.date===d.val?'#fff':'var(--text)'};transition:.2s">${d.label}</button>`).join('')}
      </div>

      <!-- Başlangıç Saati -->
      <p style="font-size:13px;font-weight:700;margin-bottom:10px">🕐 Başlangıç Saati</p>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px" id="timeSlotsGrid">
        ${times.map(t=>{
          const slotKey = (bookingState.date||'') + '_' + t;
          const dolu = bookingState.date && takvim[slotKey];
          return `<button
            ${dolu ? 'disabled title="Bu saat dolu"' : `onclick="bookingState.time='${t}';document.querySelectorAll('.time-btn').forEach(b=>{b.style.background='var(--bg)';b.style.color='var(--text)';b.style.borderColor='var(--border)'});this.style.background='var(--primary)';this.style.color='#fff';this.style.borderColor='var(--primary)';updateDurationPreview()"`}
            class="time-btn"
            style="padding:9px 4px;border-radius:10px;border:1.5px solid ${dolu?'#e5e7eb':bookingState.time===t?'var(--primary)':'var(--border)'};font-size:13px;font-weight:600;cursor:${dolu?'not-allowed':'pointer'};background:${dolu?'#f3f4f6':bookingState.time===t?'var(--primary)':'var(--bg)'};color:${dolu?'#9ca3af':bookingState.time===t?'#fff':'var(--text)'};transition:.2s">
            ${t}${dolu?'<br><span style="font-size:9px;color:#ef4444">Dolu</span>':''}
          </button>`;
        }).join('')}
      </div>

      <!-- Süre Seçimi -->
      <div style="background:#f8f9fa;border-radius:12px;padding:16px;margin-bottom:16px;">
        <p style="font-size:13px;font-weight:700;margin-bottom:12px;">⏱️ İş Süresi</p>
        <div style="display:flex;gap:8px;margin-bottom:12px;">
          <button onclick="bookingState.durationType='hours';document.querySelectorAll('.dur-type-btn').forEach(b=>b.style.background='#e5e7eb');this.style.background='var(--primary)';this.style.color='#fff';updateDurationSelect();updateDurationPreview()" class="dur-type-btn" style="flex:1;padding:10px;border-radius:8px;border:none;font-size:13px;font-weight:700;cursor:pointer;background:${bookingState.durationType==='hours'?'var(--primary)':'#e5e7eb'};color:${bookingState.durationType==='hours'?'#fff':'#374151'}">⏰ Saatlik</button>
          <button onclick="bookingState.durationType='days';document.querySelectorAll('.dur-type-btn').forEach(b=>{b.style.background='#e5e7eb';b.style.color='#374151'});this.style.background='var(--primary)';this.style.color='#fff';updateDurationSelect();updateDurationPreview()" class="dur-type-btn" style="flex:1;padding:10px;border-radius:8px;border:none;font-size:13px;font-weight:700;cursor:pointer;background:${bookingState.durationType==='days'?'var(--primary)':'#e5e7eb'};color:${bookingState.durationType==='days'?'#fff':'#374151'}">📅 Günlük</button>
          <button onclick="bookingState.durationType='weeks';document.querySelectorAll('.dur-type-btn').forEach(b=>{b.style.background='#e5e7eb';b.style.color='#374151'});this.style.background='var(--primary)';this.style.color='#fff';updateDurationSelect();updateDurationPreview()" class="dur-type-btn" style="flex:1;padding:10px;border-radius:8px;border:none;font-size:13px;font-weight:700;cursor:pointer;background:${bookingState.durationType==='weeks'?'var(--primary)':'#e5e7eb'};color:${bookingState.durationType==='weeks'?'#fff':'#374151'}">📆 Haftalık</button>
        </div>
        <select id="durationSelect" onchange="bookingState.durationValue=+this.value;updateDurationPreview()" style="width:100%;padding:10px 14px;border-radius:8px;border:1.5px solid #e5e7eb;font-size:14px;font-weight:600;color:#1a202c;">
          ${(durationOptions[bookingState.durationType]||durationOptions.hours).map(v=>`<option value="${v}" ${bookingState.durationValue===v?'selected':''}>${v} ${bookingState.durationType==='hours'?'saat':bookingState.durationType==='days'?'gün':'hafta'}</option>`).join('')}
        </select>
        <!-- Önizleme -->
        <div id="durationPreview" style="margin-top:10px;padding:10px 14px;background:#ede9ff;border-radius:8px;font-size:13px;color:#6C63FF;font-weight:600;">
          ${bookingState.date && bookingState.time ? '📋 Seçiminizi aşağıda göreceksiniz' : '⬆️ Önce tarih ve başlangıç saati seçin'}
        </div>
      </div>

      <p style="font-size:11px;color:var(--text-muted);margin-bottom:16px">ℹ️ Tarih seçince dolu saatler güncellenir</p>
      <div style="display:flex;gap:10px">
        <button onclick="bookingState.step=1;renderBookingModal()" class="btn btn--ghost" style="flex:1">← Geri</button>
        <button onclick="validateAndNextStep()" class="btn btn--primary" style="flex:2;justify-content:center;border-radius:50px">Onaya Git →</button>
      </div>`;

    // Süre select güncelle
    window.updateDurationSelect = function() {
      const sel = document.getElementById('durationSelect');
      if (!sel) return;
      const opts = durationOptions[bookingState.durationType] || durationOptions.hours;
      const label = bookingState.durationType==='hours'?'saat':bookingState.durationType==='days'?'gün':'hafta';
      sel.innerHTML = opts.map(v=>`<option value="${v}">${v} ${label}</option>`).join('');
      bookingState.durationValue = opts[0];
      sel.value = opts[0];
      updateDurationPreview();
    };

    // Önizleme güncelle
    window.updateDurationPreview = function() {
      const el = document.getElementById('durationPreview');
      if (!el) return;
      if (!bookingState.date || !bookingState.time) {
        el.textContent = '⬆️ Önce tarih ve başlangıç saati seçin';
        return;
      }
      const { endDate, endTime } = calcEndDatetime(bookingState.date, bookingState.time, bookingState.durationType, bookingState.durationValue);
      bookingState.endDate = endDate;
      bookingState.endTime = endTime;
      const startStr = new Date(bookingState.date).toLocaleDateString('tr-TR',{weekday:'short',day:'numeric',month:'short'});
      const endStr   = endDate === bookingState.date ? '' : ' → ' + new Date(endDate).toLocaleDateString('tr-TR',{weekday:'short',day:'numeric',month:'short'});
      const totalPrice = calcTotalPrice(bookingState.expert.price, bookingState.durationType, bookingState.durationValue);
      el.innerHTML = `📋 ${startStr} ${bookingState.time}${endStr} ${endDate !== bookingState.date ? endTime : '– '+endTime} &nbsp;|&nbsp; <strong>${calcDurationLabel(bookingState.durationType, bookingState.durationValue)}</strong> &nbsp;|&nbsp; Toplam: <strong style="color:#6C63FF">₺${totalPrice.toLocaleString('tr-TR')}</strong>`;

      // Çakışan slot kontrolü
      const slots = getSlotsBetween(bookingState.date, bookingState.time, endDate, endTime);
      const doluSlot = slots.find(s => takvim[s]);
      if (doluSlot) {
        const [doluDate, doluTime] = doluSlot.split('_');
        el.innerHTML += `<br><span style="color:#ef4444;font-size:12px;">⚠️ ${new Date(doluDate).toLocaleDateString('tr-TR',{day:'numeric',month:'short'})} ${doluTime} saati dolu! Lütfen farklı aralık seçin.</span>`;
      }
    };

    // Tarih seçildiğinde saatleri güncelle
    window.renderTimeSlots = function(selectedDate) {
      const grid = document.getElementById('timeSlotsGrid');
      if (!grid) return;
      grid.innerHTML = times.map(t => {
        const slotKey = selectedDate + '_' + t;
        const dolu = takvim[slotKey];
        return `<button
          ${dolu ? 'disabled title="Bu saat dolu"' : `onclick="bookingState.time='${t}';document.querySelectorAll('.time-btn').forEach(b=>{b.style.background='var(--bg)';b.style.color='var(--text)';b.style.borderColor='var(--border)'});this.style.background='var(--primary)';this.style.color='#fff';this.style.borderColor='var(--primary)';updateDurationPreview()"`}
          class="time-btn"
          style="padding:9px 4px;border-radius:10px;border:1.5px solid ${dolu?'#e5e7eb':'var(--border)'};font-size:13px;font-weight:600;cursor:${dolu?'not-allowed':'pointer'};background:${dolu?'#f3f4f6':'var(--bg)'};color:${dolu?'#9ca3af':'var(--text)'};transition:.2s">
          ${t}${dolu?'<br><span style="font-size:9px;color:#ef4444">Dolu</span>':''}
        </button>`;
      }).join('');
      bookingState.time = '';
    };

    // Validation + geçiş
    window.validateAndNextStep = function() {
      if (!bookingState.date) { showToast('Lütfen başlangıç tarihi seçin.','error'); return; }
      if (!bookingState.time) { showToast('Lütfen başlangıç saati seçin.','error'); return; }
      // Önce önizlemeyi güncelle (endDate/endTime hesaplansın)
      updateDurationPreview();
      // Çakışma kontrolü
      const slots = getSlotsBetween(bookingState.date, bookingState.time, bookingState.endDate, bookingState.endTime);
      const doluSlot = slots.find(s => takvim[s]);
      if (doluSlot) {
        const [doluDate, doluTime] = doluSlot.split('_');
        showToast(`❌ ${new Date(doluDate).toLocaleDateString('tr-TR',{day:'numeric',month:'short'})} ${doluTime} saati dolu! Farklı aralık seçin.`,'error');
        return;
      }
      bookingState.step = 3;
      renderBookingModal();
    };

  } else {
    const e2 = bookingState.expert;
    const initials2 = e2.avatar || e2.name.split(' ').map(w=>w[0]).join('').slice(0,2);
    const startStr = bookingState.date ? new Date(bookingState.date).toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long'}) : '—';
    const endStr   = bookingState.endDate && bookingState.endDate !== bookingState.date
      ? new Date(bookingState.endDate).toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long'})
      : null;
    const durationLabel = calcDurationLabel(bookingState.durationType, bookingState.durationValue);
    const totalPrice    = calcTotalPrice(e2.price, bookingState.durationType, bookingState.durationValue);

    body.innerHTML = `
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:20px;flex-wrap:wrap">${stepHTML}</div>
      <h3 style="font-size:17px;font-weight:800;margin-bottom:16px">Rezervasyon Özeti</h3>
      <div style="background:var(--bg);border-radius:12px;padding:18px;margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--border)">
          <div style="width:44px;height:44px;border-radius:50%;background:${e2.color};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px">${initials2}</div>
          <div><strong>${e2.name}</strong><div style="font-size:12px;color:var(--text-muted)">${e2.title||''}</div></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;font-size:14px">
          <div style="display:flex;justify-content:space-between">
            <span style="color:var(--text-muted)">📅 Başlangıç</span>
            <strong>${startStr} – ${bookingState.time}</strong>
          </div>
          ${endStr ? `
          <div style="display:flex;justify-content:space-between">
            <span style="color:var(--text-muted)">🏁 Bitiş</span>
            <strong>${endStr} – ${bookingState.endTime}</strong>
          </div>` : ''}
          <div style="display:flex;justify-content:space-between">
            <span style="color:var(--text-muted)">⏱️ Süre</span>
            <strong>${durationLabel}</strong>
          </div>
          <div style="display:flex;justify-content:space-between">
            <span style="color:var(--text-muted)">📍 Şehir</span>
            <strong>${bookingState.city||e2.city}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;border-top:1px solid var(--border);padding-top:10px;margin-top:2px">
            <span style="color:var(--text-muted)">💰 Saatlik Ücret</span>
            <span>₺${e2.price}/saat</span>
          </div>
          <div style="display:flex;justify-content:space-between;background:#ede9ff;border-radius:8px;padding:10px 14px">
            <span style="font-weight:700;color:#4c1d95">💳 Toplam Tahmini Tutar</span>
            <strong style="color:var(--primary);font-size:16px">₺${totalPrice.toLocaleString('tr-TR')}</strong>
          </div>
        </div>
      </div>
      ${bookingState.notes?`<div style="background:#f0fdf4;border-radius:10px;padding:12px;font-size:13px;color:#166534;margin-bottom:16px">📝 Not: ${bookingState.notes}</div>`:''}
      <div style="background:#fffbe6;border-radius:10px;padding:12px;font-size:12px;color:#92400e;margin-bottom:20px">🔒 Ödemeniz iş tamamlanana kadar güvende tutulur.</div>
      <div style="display:flex;gap:10px">
        <button onclick="bookingState.step=2;renderBookingModal()" class="btn btn--ghost" style="flex:1">← Geri</button>
        <button onclick="confirmBooking()" class="btn btn--primary" style="flex:2;justify-content:center;border-radius:50px">✅ Rezervasyonu Onayla</button>
      </div>`;
  }
}

function confirmBooking() {
  const body = document.getElementById('bookingModalBody');
  const e = bookingState.expert;
  const session = typeof getSession === 'function' ? getSession() : null;
  if (!session) return;

  const startStr = bookingState.date ? new Date(bookingState.date).toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long'}) : '—';
  const endStr   = bookingState.endDate && bookingState.endDate !== bookingState.date
    ? new Date(bookingState.endDate).toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long'})
    : null;
  const durationLabel = calcDurationLabel(bookingState.durationType, bookingState.durationValue);
  const totalPrice    = calcTotalPrice(e.price, bookingState.durationType, bookingState.durationValue);

  // ── Tüm aralık slotlarını kontrol et ──
  const allSlots = getSlotsBetween(
    bookingState.date, bookingState.time,
    bookingState.endDate || bookingState.date,
    bookingState.endTime || bookingState.time
  );
  const TAKVIM_KEY = 'isbul_takvim_' + e.id;
  let takvim = {};
  try { takvim = JSON.parse(localStorage.getItem(TAKVIM_KEY) || '{}'); } catch(err) {}
  const doluSlot = allSlots.find(s => takvim[s]);
  if (doluSlot) {
    const [doluDate, doluTime] = doluSlot.split('_');
    showToast(`❌ ${new Date(doluDate).toLocaleDateString('tr-TR',{day:'numeric',month:'short'})} ${doluTime} dolu! Farklı aralık seçin.`, 'error');
    bookingState.step = 2;
    renderBookingModal();
    return;
  }

  // ── Rezervasyonu merkezi DB'ye yaz ──
  const BOOKING_DB_KEY = 'isbul_booking_db';
  let bookingDB = {};
  try { bookingDB = JSON.parse(localStorage.getItem(BOOKING_DB_KEY) || '{}'); } catch(err) {}

  const rezId = 'rez_' + Date.now();
  const rezervasyon = {
    id:             rezId,
    customerId:     session.id,
    customerName:   session.firstName + ' ' + session.lastName,
    customerEmail:  session.email,
    customerAvatar: session.avatar,
    customerColor:  session.color,
    expertId:       e.id,
    expertName:     e.name,
    expertInitials: e.avatar || e.name.split(' ').map(w=>w[0]).join('').slice(0,2),
    expertColor:    e.color,
    service:        bookingState.service || e.title,
    date:           bookingState.date,
    dateStr:        startStr,
    endDate:        bookingState.endDate || bookingState.date,
    endTime:        bookingState.endTime || bookingState.time,
    time:           bookingState.time,
    durationType:   bookingState.durationType,
    durationValue:  bookingState.durationValue,
    durationLabel,
    totalPrice,
    slots:          allSlots,  // takvim referansı için
    city:           bookingState.city || e.city,
    price:          e.price,
    notes:          bookingState.notes,
    status:         'pending',
    createdAt:      new Date().toISOString()
  };

  bookingDB[rezId] = rezervasyon;
  localStorage.setItem(BOOKING_DB_KEY, JSON.stringify(bookingDB));

  // ── Tüm slotları takvime işaretle ──
  markSlotsInCalendar(e.id, allSlots, rezId);

  // ── Müşteri listesine de yaz ──
  const REZ_KEY = 'isbul_rezervasyonlar_' + session.id;
  let rezList = [];
  try { rezList = JSON.parse(localStorage.getItem(REZ_KEY) || '[]'); } catch(err) {}
  rezList.push(rezervasyon);
  localStorage.setItem(REZ_KEY, JSON.stringify(rezList));

  // ── API'ye de gönder (varsa) ──
  let apiBookingId = null;
  if (typeof IsbulAPI !== 'undefined') {
    try {
      const apiRes = await IsbulAPI.bookings.create({
        expertId:      e.id,
        service:       rezervasyon.service,
        date:          rezervasyon.date,
        endDate:       rezervasyon.endDate,
        time:          rezervasyon.time,
        endTime:       rezervasyon.endTime,
        durationType:  rezervasyon.durationType,
        durationValue: rezervasyon.durationValue,
        durationLabel: rezervasyon.durationLabel,
        totalPrice:    rezervasyon.totalPrice,
        slots:         allSlots,
        city:          rezervasyon.city,
        notes:         rezervasyon.notes,
      });
      if (apiRes && apiRes.success && apiRes.booking?.id) {
        apiBookingId = apiRes.booking.id;
        // localStorage'daki kaydı backend id ile güncelle
        bookingDB[rezId].apiBookingId = apiBookingId;
        localStorage.setItem(BOOKING_DB_KEY, JSON.stringify(bookingDB));
      }
    } catch (err) {
      console.warn('[API] Rezervasyon API kaydı başarısız:', err);
    }
  }

  const timeRange = endStr
    ? `${startStr} ${bookingState.time} → ${endStr} ${bookingState.endTime}`
    : `${startStr} ${bookingState.time}`;

  // ── Ödeme başlat (API booking ID varsa) ──
  if (apiBookingId && typeof IsbulAPI !== 'undefined') {
    body.innerHTML = `
      <div style="text-align:center;padding:28px 0">
        <div style="font-size:48px;margin-bottom:12px">💳</div>
        <h3 style="font-size:18px;font-weight:900;margin-bottom:8px">Ödeme Sayfasına Yönlendiriliyorsunuz</h3>
        <p style="font-size:14px;color:var(--text-muted);margin-bottom:16px">
          Rezervasyonunuz alındı. Ödemeyi tamamlamak için iyzico güvenli ödeme sayfasına yönlendiriliyorsunuz.
        </p>
        <div class="spinner" style="width:36px;height:36px;border:4px solid #e2e8f0;border-top-color:#6C63FF;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto"></div>
      </div>`;

    try {
      const payRes = await IsbulAPI.payments.initialize(apiBookingId);
      if (payRes && payRes.success) {
        if (payRes.checkoutFormContent) {
          // İyzico inline form — modal içine render et
          body.innerHTML = `
            <div>
              <h3 style="font-size:16px;font-weight:800;margin-bottom:16px;text-align:center">Güvenli Ödeme</h3>
              <div id="iyzico-checkout-form" class="responsive">${payRes.checkoutFormContent}</div>
            </div>`;
          // iyzico script'lerini execute et
          body.querySelectorAll('script').forEach(oldScript => {
            const newScript = document.createElement('script');
            if (oldScript.src) newScript.src = oldScript.src;
            else newScript.textContent = oldScript.textContent;
            document.head.appendChild(newScript);
          });
        } else if (payRes.paymentPageUrl) {
          // Hosted ödeme sayfasına yönlendir
          window.location.href = payRes.paymentPageUrl;
        }
        return;
      } else {
        console.warn('[ödeme] Başlatılamadı:', payRes?.error);
        // Ödeme başlatılamazsa normal başarı ekranı göster
      }
    } catch (err) {
      console.warn('[ödeme] Hata:', err);
    }
  }

  body.innerHTML = `
    <div style="text-align:center;padding:20px 0">
      <div style="font-size:64px;margin-bottom:16px">🎉</div>
      <h3 style="font-size:20px;font-weight:900;margin-bottom:8px">Rezervasyon Alındı!</h3>
      <p style="font-size:14px;color:var(--text-muted);line-height:1.7;margin-bottom:20px">
        <strong>${e.name}</strong> için rezervasyonunuz oluşturuldu.<br>
        <strong>${timeRange}</strong><br>
        Süre: ${durationLabel} — Toplam: <strong style="color:var(--primary)">₺${totalPrice.toLocaleString('tr-TR')}</strong>
      </p>
      <div style="background:var(--bg);border-radius:12px;padding:16px;text-align:left;margin-bottom:20px;font-size:13px">
        <div style="font-weight:700;margin-bottom:8px">Sonraki Adımlar:</div>
        <div style="display:flex;flex-direction:column;gap:6px;color:var(--text-muted)">
          <div>📋 Rezervasyon profilinize kaydedildi</div>
          <div>⏳ Uzman onayı bekleniyor</div>
          <div>📍 Onaylandığında adresinizi uzmanla paylaşın</div>
        </div>
      </div>
      <div style="display:flex;gap:10px;justify-content:center">
        <button onclick="closeBookingModal()" class="btn btn--ghost">Kapat</button>
        <a href="profil.html" onclick="closeBookingModal()" class="btn btn--primary">Rezervasyonlarım →</a>
      </div>
    </div>`;
  showToast('✅ Rezervasyonunuz alındı! Uzman onayı bekleniyor.', 'success');
}
window.confirmBooking = confirmBooking;

/* ---------- 6. ARAMA MODAL (gerçek veriler) ---------- */
(function initSearchModal() {
  const searchBtn    = document.getElementById('searchBtn');
  const modal        = document.getElementById('searchModal');
  const modalClose   = document.getElementById('modalClose');
  const modalTitle   = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');

  function renderExperts(query, city) {
    const q = (query||'').toLowerCase();
    // API önbellekten veya getTumUzmanlar'dan al
    const allExperts = window._searchModalExperts
      || (typeof getTumUzmanlar === 'function' ? getTumUzmanlar() : TÜM_UZMANLAR);
    let base = city ? allExperts.filter(e => e.city === city) : allExperts;
    if (!base.length) base = allExperts;
    const filtered = q
      ? base.filter(e =>
          (e.tags||[]).some(t => t.toLowerCase().includes(q)) ||
          (e.title||'').toLowerCase().includes(q) ||
          (e.categories||[]).some(c => c.includes(q)) ||
          (e.name||'').toLowerCase().includes(q)
        )
      : base;
    const list = filtered.length ? filtered : base;
    const cityLabel = city ? city : 'Türkiye geneli';
    modalTitle.textContent = `${query ? '"'+query+'" için' : 'Tüm'} uzmanlar – ${cityLabel}`;
    modalContent.innerHTML = list.map((e) => {
      const init = e.avatar||(e.name||'').split(' ').map(w=>w[0]).join('').slice(0,2);
      const realBadge = e.isRealUser ? '<span style="background:#d1fae5;color:#065f46;font-size:9px;font-weight:700;padding:1px 6px;border-radius:20px;margin-left:4px">✅</span>' : '';
      return `
      <div style="display:flex;align-items:center;gap:14px;padding:14px;border:1.5px solid var(--border);border-radius:12px;margin-bottom:10px;background:#fff;transition:.2s;cursor:pointer"
           onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border)'">
        <div style="width:48px;height:48px;border-radius:50%;background:${e.color||'#6C63FF'};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;flex-shrink:0">${init}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px">
            <strong style="font-size:15px">${e.name}</strong>
            ${e.elite?'<span style="background:#fbbf24;color:#78350f;font-size:9px;font-weight:700;padding:1px 6px;border-radius:20px">🏆 Elite</span>':''}
            ${realBadge}
          </div>
          <div style="font-size:12px;color:var(--text-muted)">${e.title||''} • 📍 ${e.city||''}</div>
          <div style="font-size:12px;color:#f59e0b">★ ${e.rating||5} <span style="color:var(--text-muted)">(${e.reviews||0} yorum)${e.experience?' • '+e.experience:''}</span></div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <strong style="display:block;color:var(--primary);font-size:14px">₺${e.price||0}/saat</strong>
          <div style="display:flex;gap:6px;margin-top:6px;justify-content:flex-end">
            <a href="uzman-profil.html?id=${e.id}" style="padding:6px 12px;border-radius:50px;border:1.5px solid var(--border);font-size:12px;font-weight:600;color:var(--text);text-decoration:none">Profil</a>
            <a href="uzmanlar.html?kategori=${(e.categories||[])[0]||''}"
              onclick="closeSearchModal()"
              style="padding:7px 16px;border-radius:50px;background:var(--primary);color:#fff;font-size:12px;font-weight:600;text-decoration:none">
              Uzmanları Gör →</a>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  async function openSearchModal() {
    const query = document.getElementById('heroSearch')?.value.trim()||'';
    const city  = document.getElementById('cityInput')?.value||'';
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (modalTitle)   modalTitle.textContent = 'Uzmanlar Aranıyor...';
    if (modalContent) modalContent.innerHTML = `<div class="loading-spinner"></div><p style="color:var(--text-muted);margin-top:8px">Bölgenizdeki uzmanlar yükleniyor...</p>`;

    // API'den önce dene, yoksa localStorage+statik
    if (typeof IsbulAPI !== 'undefined') {
      const params = {};
      if (city)  params.city   = city;
      if (query) params.search = query;
      const apiExperts = await IsbulAPI.experts.list(params);
      if (apiExperts !== null) {
        // API + localStorage realExperts + statik birleştir (uzmanlar.html ile aynı mantık)
        const realExperts = typeof getRealExperts === 'function' ? getRealExperts() : [];
        const apiIds      = new Set(apiExperts.map(e => e.id));
        const realIds     = new Set(realExperts.map(e => e.id));
        // API uzmanlarına categories normalize et
        const normalizedApi = apiExperts.map(e => ({
          ...e,
          categories: e.categories?.length
            ? e.categories
            : (typeof tagsToCategoryList === 'function' ? tagsToCategoryList(e.tags || []) : []),
        }));
        const staticOnly  = TÜM_UZMANLAR.filter(e => !apiIds.has(e.id) && !realIds.has(e.id));
        const realOnly    = realExperts.filter(e => !apiIds.has(e.id));
        const allExperts  = [...realOnly, ...normalizedApi, ...staticOnly];
        window._searchModalExperts = allExperts;
        renderExperts(query, city);
        return;
      }
    }
    window._searchModalExperts = null;
    setTimeout(() => renderExperts(query, city), 300);
  }
  window.closeSearchModal = function() {
    if (modal) { modal.classList.remove('active'); document.body.style.overflow=''; }
  };
  if (searchBtn)  searchBtn.addEventListener('click', openSearchModal);
  if (modalClose) modalClose.addEventListener('click', window.closeSearchModal);
  if (modal)      modal.addEventListener('click', e => { if (e.target===modal) window.closeSearchModal(); });
  const hi = document.getElementById('heroSearch');
  if (hi) hi.addEventListener('keydown', e => { if (e.key==='Enter') openSearchModal(); });
})();
    

/* ---------- 7. YORUMLAR SLİDER ---------- */
(function initReviewSlider() {
  const slider   = document.getElementById('reviewsSlider');
  const dotsWrap = document.getElementById('reviewDots');
  const prevBtn  = document.getElementById('reviewPrev');
  const nextBtn  = document.getElementById('reviewNext');
  if (!slider || !dotsWrap) return;

  const cards = slider.querySelectorAll('.review-card');
  const total  = cards.length;
  let current  = 0;
  let perView  = getPerView();
  let autoTimer;

  function getPerView() {
    if (window.innerWidth < 768)  return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    const pages = Math.ceil(total / perView);
    for (let i = 0; i < pages; i++) {
      const d = document.createElement('div');
      d.className = 'review-dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => { goTo(i * perView); resetAuto(); });
      dotsWrap.appendChild(d);
    }
  }

  function updateDots() {
    const page = Math.floor(current / perView);
    dotsWrap.querySelectorAll('.review-dot').forEach((d,i) => d.classList.toggle('active', i === page));
  }

  function goTo(idx) {
    const max = Math.max(0, total - perView);
    current = Math.max(0, Math.min(idx, max));
    const gap = 24;
    // Slider container genişliğinden kart genişliği hesapla
    const sliderW = slider.parentElement?.offsetWidth || slider.offsetWidth || 900;
    const cardW   = (sliderW - gap * (perView - 1)) / perView;
    slider.style.transform = `translateX(-${current * (cardW + gap)}px)`;
    slider.style.transition = 'transform .4s ease';
    updateDots();
  }

  function next() { goTo(current + perView >= total ? 0 : current + 1); }
  function prev() { goTo(current <= 0 ? Math.max(0, total - perView) : current - 1); }

  function startAuto() { autoTimer = setInterval(next, 4500); }
  function resetAuto()  { clearInterval(autoTimer); startAuto(); }

  slider.addEventListener('touchstart', e => { slider._tx = e.touches[0].clientX; }, { passive:true });
  slider.addEventListener('touchend',   e => {
    const diff = (slider._tx||0) - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); resetAuto(); }
  });

  if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAuto(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAuto(); });

  slider.style.display = 'flex';
  slider.style.overflow = 'hidden';
  buildDots();
  startAuto();

  window.addEventListener('resize', () => { perView = getPerView(); buildDots(); goTo(0); });
})();

/* ---------- 8. SAYAÇ ANİMASYONU ---------- */
(function initCounters() {
  const items = document.querySelectorAll('.stat-number[data-target]');
  if (!items.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.target;
      let current = 0;
      const step = target / (1800 / 16);
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current).toLocaleString('tr-TR');
        if (current >= target) clearInterval(timer);
      }, 16);
      observer.unobserve(el);
    });
  }, { threshold: 0.4 });
  items.forEach(el => observer.observe(el));
})();

/* ---------- 9. SCROLL FADE-UP ---------- */
(function initFadeUp() {
  // Hizmetler sayfasındaki service-card-v2'lere fade-up EKLEME — zaten görünür durumdalar
  const sel = '.category-card,.trust-card,.step,.benefit-item,.service-card,.hiw-step-card';
  document.querySelectorAll(sel).forEach(el => el.classList.add('fade-up'));
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
})();

/* ---------- 10. HİZMETLER FİLTRE ---------- */
(function initServiceFilter() {
  const tabs  = document.querySelectorAll('.filter-tab[data-cat]');
  if (!tabs.length) return;

  function getCards() {
    return document.querySelectorAll('.service-card-v2[data-cat]');
  }

  function applyFilters() {
    const activeCat = document.querySelector('.filter-tab.active')?.dataset.cat || 'all';
    const maxPrice  = parseInt(document.getElementById('priceRange')?.value || '99999');
    const minRating = parseFloat(document.querySelector('.rating-filter.active')?.dataset.min || '0');
    const cards = getCards();
    let count = 0;

    cards.forEach(card => {
      // fade-up / visible state'ini temizle — filtre display ile çalışsın
      card.classList.remove('fade-up');
      card.style.opacity = '';
      card.style.transform = '';

      const catMatch    = activeCat === 'all' || card.dataset.cat === activeCat;
      const cardPrice   = parseInt(card.dataset.price || '99999');
      const priceMatch  = cardPrice <= maxPrice;
      const cardRating  = parseFloat(card.dataset.rating || '5');
      const ratingMatch = cardRating >= minRating;
      const show = catMatch && priceMatch && ratingMatch;

      card.style.display = show ? '' : 'none';
      if (show) count++;
    });

    const rc = document.getElementById('resultCount');
    if (rc) rc.textContent = count;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      applyFilters();
    });
  });

  // Fiyat aralığı
  const priceRange = document.getElementById('priceRange');
  const priceLabel = document.getElementById('priceLabel');
  if (priceRange) {
    priceRange.addEventListener('input', () => {
      if (priceLabel) priceLabel.textContent = `₺100 – ₺${priceRange.value}`;
      applyFilters();
    });
  }

  // Puan filtresi
  document.querySelectorAll('.rating-filter').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.rating-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });

  // Sıralama
  const sortSel = document.getElementById('sortSelect');
  if (sortSel) {
    sortSel.addEventListener('change', () => {
      const grid = document.getElementById('servicesGrid');
      if (!grid) return;
      const items = [...grid.querySelectorAll('.service-card-v2')].filter(c => c.style.display !== 'none');
      items.sort((a, b) => {
        const v = sortSel.value;
        if (v === 'rating')     return (parseFloat(b.dataset.rating)||0) - (parseFloat(a.dataset.rating)||0);
        if (v === 'price-asc')  return (parseInt(a.dataset.price)||0)   - (parseInt(b.dataset.price)||0);
        if (v === 'price-desc') return (parseInt(b.dataset.price)||0)   - (parseInt(a.dataset.price)||0);
        return 0;
      });
      items.forEach(item => grid.appendChild(item));
    });
  }

  // Müsaitlik filtreleri
  document.querySelectorAll('.avail-filter').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      showToast('Bu filtre yakında aktif olacak!', 'info');
    });
  });

  // Sidebar link → tab
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const cat = link.dataset.cat;
      const matchTab = document.querySelector(`.filter-tab[data-cat="${cat}"]`);
      if (matchTab) matchTab.click();
      window.scrollTo({ top: document.getElementById('servicesGrid')?.offsetTop - 120 || 0, behavior: 'smooth' });
    });
  });

  // İlk yüklemede applyFilters'ı biraz gecikmeli çalıştır — DOM tam render olsun
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      applyFilters();
    });
  });
})();

/* ---------- 11. HİZMETLER SAYFA ARAMASI ---------- */
(function initServicePageSearch() {
  const inp = document.getElementById('serviceSearch');
  const cards = document.querySelectorAll('.service-card-v2');
  if (!inp || !cards.length) return;
  inp.addEventListener('input', () => {
    const val = inp.value.trim().toLowerCase();
    let count = 0;
    cards.forEach(card => {
      const h3 = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const p  = card.querySelector('p')?.textContent.toLowerCase()  || '';
      const show = !val || h3.includes(val) || p.includes(val);
      card.style.display = show ? '' : 'none';
      if (show) count++;
    });
    const rc = document.getElementById('resultCount');
    if (rc) rc.textContent = count;
  });
})();

/* ---------- 12. URL KATEGORİ PARAMETRESİ ---------- */
(function initCategoryParam() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('kategori');
  if (!cat) return;
  const tab = document.querySelector(`.filter-tab[data-cat="${cat}"]`);
  if (tab) setTimeout(() => tab.click(), 100);
})();

/* ---------- 13. TOAST BİLDİRİMİ ---------- */
function showToast(msg, type) {
  const bg = type === 'error' ? '#ef4444' : type === 'info' ? '#3b82f6' : '#10b981';
  const t  = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;background:${bg};color:#fff;padding:14px 20px;border-radius:12px;font-size:14px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.2);transform:translateY(80px);opacity:0;transition:all .35s ease;max-width:320px;line-height:1.5;font-family:var(--font)`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => { t.style.transform='translateY(0)'; t.style.opacity='1'; }));
  setTimeout(() => { t.style.transform='translateY(80px)'; t.style.opacity='0'; setTimeout(() => t.remove(), 400); }, 3500);
}
window.showToast = showToast;

/* ---------- 14. SMOOTH SCROLL ---------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior:'smooth', block:'start' });
  });
});

/* ---------- 15. AUTH MODAL + OAuth Altyapısı ---------- */

/* openAuthModal — modal henüz yüklenmemiş olsa bile çalışır */
window.openAuthModal = function(tab) {
  const modal = document.getElementById('authModal');
  if (!modal) {
    console.warn('authModal bulunamadı, sayfa yenileniyor...');
    return;
  }
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  if (tab) _switchAuthTab(tab);
};

window.closeAuthModal = function() {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
};

function _switchAuthTab(name) {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.querySelectorAll('.auth-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.tab === name)
  );
  modal.querySelectorAll('.auth-panel').forEach(p =>
    p.classList.toggle('active', p.id === `auth-${name}`)
  );
}

/* OAuth */
window.handleOAuth = function(provider) {
  if (provider === 'google') {
    // Modal'ı kapat
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
    
    // API base URL'i api-client.js'den al (tutarlılık için)
    const apiBase = window.IsbulAPI?.baseUrl 
      ? window.IsbulAPI.baseUrl.replace('/v1', '')  // /api/v1 → /api
      : 'https://isbul-backend.onrender.com/api';    // Fallback
    
    console.log('🔐 Google OAuth başlatılıyor...');
    console.log('📍 Backend URL:', apiBase);
    console.log('📍 Current URL:', window.location.href);

    // Mevcut sayfayı kaydet — hem session hem localStorage'a (domain değişimi için)
    const currentUrl = window.location.href;
    sessionStorage.setItem('oauth_return_url', currentUrl);
    localStorage.setItem('oauth_return_url', currentUrl);
    console.log('💾 Return URL kaydedildi:', currentUrl);
    
    // Backend'i uyandır ve kontrol et (Render free tier uyuyabilir)
    showToast('Backend bağlantısı kontrol ediliyor...', 'info');
    
    const startTime = Date.now();
    
    // Backend health check (30 saniye timeout)
    const checkBackend = () => {
      return fetch(`${apiBase}/health`, { 
        signal: AbortSignal.timeout(30000) 
      })
        .then(res => {
          if (res.ok) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`✅ Backend erişilebilir (${elapsed}s)`);
            showToast('Backend hazır, Google\'a yönlendiriliyorsunuz...', 'success');
            
            // 500ms sonra yönlendir
            setTimeout(() => {
              window.location.href = `${apiBase}/auth/google`;
            }, 500);
          } else {
            throw new Error(`Backend HTTP ${res.status}`);
          }
        });
    };
    
    // İlk deneme
    checkBackend().catch(err => {
      console.warn('⚠️ İlk deneme başarısız, backend uyanıyor olabilir...', err.message);
      showToast('Backend uyandırılıyor, lütfen bekleyin... (30 saniye)', 'info');
      
      // 5 saniye bekle ve tekrar dene
      setTimeout(() => {
        checkBackend().catch(err => {
          console.error('❌ Backend hala erişilemiyor:', err);
          showToast('Backend sunucusuna erişilemiyor. Lütfen sistem yöneticisiyle iletişime geçin.', 'error');
          
          // Modal'ı tekrar aç
          if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
          }
          
          // Hata detayı göster
          const errorDetail = document.createElement('div');
          errorDetail.style.cssText = 'position:fixed;bottom:80px;right:24px;background:#1f2937;color:#fff;padding:12px 16px;border-radius:8px;font-size:12px;max-width:320px;z-index:9999';
          errorDetail.innerHTML = `
            <div style="font-weight:700;margin-bottom:4px">Backend Hata Detayı:</div>
            <div style="opacity:0.8">${err.message}</div>
            <div style="margin-top:8px;opacity:0.6">Backend URL: ${apiBase}</div>
          `;
          document.body.appendChild(errorDetail);
          setTimeout(() => errorDetail.remove(), 10000);
        });
      }, 5000);
    });
    
    return;
  }

  const name = { apple:'Apple', facebook:'Facebook' }[provider] || provider;
  showToast(`${name} ile giriş yakında aktif olacak! 🚀`, 'info');
};

/* Auth modal tam başlatma — DOM hazır olduğunda çalıştır */
function _initAuthModalFull() {
  const modal = document.getElementById('authModal');
  if (!modal) return;

  const closeBtn = document.getElementById('authModalClose');
  closeBtn?.addEventListener('click', window.closeAuthModal);
  modal.addEventListener('click', e => { if (e.target === modal) window.closeAuthModal(); });
  modal.querySelectorAll('.auth-tab').forEach(t =>
    t.addEventListener('click', () => _switchAuthTab(t.dataset.tab))
  );

  /* Email login — API öncelikli, localStorage fallback */
  const loginForm = document.getElementById('loginForm');
  if (loginForm && !loginForm._bound) {
    loginForm._bound = true;
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const emailEl = e.target.querySelector('[name=email]');
      const passEl  = e.target.querySelector('[name=password]');
      if (!emailEl?.value.trim()) { showToast('E-posta adresini girin.', 'error'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) { showToast('Geçerli bir e-posta girin.', 'error'); return; }
      if (!passEl?.value) { showToast('Şifrenizi girin.', 'error'); return; }

      const btn = e.target.querySelector('button[type=submit]');
      const origText = btn.textContent;
      btn.textContent = 'Giriş yapılıyor...'; btn.disabled = true;

      try {
        let result = null;

        // API dene
        if (typeof IsbulAPI !== 'undefined') {
          const apiResult = await IsbulAPI.auth.login(emailEl.value.trim(), passEl.value);
          if (apiResult) {
            if (!apiResult.success) {
              showToast(apiResult.error, 'error');
              btn.textContent = origText; btn.disabled = false;
              return;
            }
            // API başarılı — session'a kaydet
            const u = apiResult.user;
            saveSession({
              id: u.id, firstName: u.firstName, lastName: u.lastName,
              email: u.email, avatar: u.avatar, color: u.color,
              role: u.role || 'customer',
              isExpert: u.isExpert, expertData: u.expertData || null
            });
            result = { success: true, user: u };
          }
        }

        // Fallback: localStorage
        if (!result) {
          result = loginUser(emailEl.value.trim(), passEl.value);
        }

        if (!result.success) {
          showToast(result.error, 'error');
          btn.textContent = origText; btn.disabled = false;
          return;
        }

        window.closeAuthModal();
        showToast(`✅ Hoş geldiniz, ${result.user.firstName}!`, 'success');
        _updateNavbarLoggedIn();
        if (_pendingCallback) {
          const cb = _pendingCallback; _pendingCallback = null;
          setTimeout(cb, 300);
        }
        document.querySelector('.auth-required-msg')?.remove();
        btn.textContent = origText; btn.disabled = false;
      } catch (err) {
        console.error('[login]', err);
        btn.textContent = origText; btn.disabled = false;
      }
    });
  }

  /* Email register — API öncelikli, localStorage fallback */
  const regForm = document.getElementById('registerForm');
  if (regForm && !regForm._bound) {
    regForm._bound = true;
    regForm.addEventListener('submit', async e => {
      e.preventDefault();
      const fn = e.target.querySelector('[name=regFirstName]')?.value.trim();
      const ln = e.target.querySelector('[name=regLastName]')?.value.trim();
      const em = e.target.querySelector('[name=regEmail]')?.value.trim();
      const p1 = e.target.querySelector('[name=regPassword]')?.value;
      const p2 = e.target.querySelector('[name=regPasswordConfirm]')?.value;

      if (!fn) { showToast('Ad alanı zorunludur.', 'error'); return; }
      if (!ln) { showToast('Soyad alanı zorunludur.', 'error'); return; }
      if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { showToast('Geçerli bir e-posta girin.', 'error'); return; }
      if (!p1 || p1.length < 8) { showToast('Şifre en az 8 karakter olmalıdır.', 'error'); return; }
      if (p1 !== p2) { showToast('Şifreler eşleşmiyor!', 'error'); return; }

      const btn = e.target.querySelector('button[type=submit]');
      const origText = btn.textContent;
      btn.textContent = 'Kaydediliyor...'; btn.disabled = true;

      try {
        let result = null;

        // API dene
        if (typeof IsbulAPI !== 'undefined') {
          const apiResult = await IsbulAPI.auth.register(fn, ln, em, p1);
          if (apiResult) {
            if (!apiResult.success) {
              showToast(apiResult.error, 'error');
              btn.textContent = origText; btn.disabled = false;
              return;
            }
            const u = apiResult.user;
            saveSession({
              id: u.id, firstName: u.firstName, lastName: u.lastName,
              email: u.email, avatar: u.avatar, color: u.color,
              role: u.role || 'customer',
              isExpert: u.isExpert || false, expertData: null
            });
            result = { success: true, user: u };
          }
        }

        // Fallback: localStorage
        if (!result) {
          result = registerUser(fn, ln, em, p1);
          if (result.success) loginUser(em, p1);
        }

        if (!result.success) {
          showToast(result.error, 'error');
          btn.textContent = origText; btn.disabled = false;
          return;
        }

        window.closeAuthModal();
        showToast(`🎉 Hoş geldiniz, ${fn}! Hesabınız oluşturuldu.`, 'success');
        _updateNavbarLoggedIn();
        if (_pendingCallback) {
          const cb = _pendingCallback; _pendingCallback = null;
          setTimeout(cb, 300);
        }
        document.querySelector('.auth-required-msg')?.remove();
        btn.textContent = origText; btn.disabled = false;
      } catch (err) {
        console.error('[register]', err);
        btn.textContent = origText; btn.disabled = false;
      }
    });
  }
}

/* DOM hazır olduğunda başlat */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _initAuthModalFull);
} else {
  _initAuthModalFull();
}

/* ---------- 16. APP BUTTONS (kaldırıldı) ---------- */

/* ---------- 17. FAQ ACCORDION (genel) ---------- */
document.querySelectorAll('.faq-question').forEach(q => {
  if (q._faqBound) return;
  q._faqBound = true;
  q.addEventListener('click', () => {
    const item   = q.parentElement;
    const isOpen = item.classList.contains('open');
    item.closest('.faq-list')?.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

console.log('%cİşBul ⚡', 'color:#6C63FF;font-size:22px;font-weight:900');
console.log('%cv2 — Tüm butonlar aktif', 'color:#10b981;font-size:13px');



/* ---------- İLETİŞİM MODAL (tüm sayfalarda) ---------- */
(function initContactModal() {
  const modal = document.getElementById('contactModal');
  if (!modal) return;
  // Overlay'e tıklayınca kapat
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
  // ESC ile kapat
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
})();

