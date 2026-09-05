/* ============================================================
   Ä°ÅŸBul â€“ Ana JavaScript DosyasÄ±  (v5)
   ============================================================ */
'use strict';

// USERS, ILLER, TÃœM_UZMANLAR ve yardÄ±mcÄ± fonksiyonlar data.js'den gelir

/* ============================================================
   ZOOM YÃ–NETÄ°MÄ° â€” TÃ¼m sayfalarda zoom seviyesini korur
   ============================================================ */
(function initZoomPersistence() {
  const ZOOM_KEY = 'isbul_zoom_level';
  
  // Sayfa yÃ¼klendiÄŸinde kaydedilmiÅŸ zoom seviyesini uygula
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
      console.warn('Zoom seviyesi yÃ¼klenemedi:', e);
    }
  }
  
  // Zoom deÄŸiÅŸikliklerini izle ve kaydet
  function saveZoom() {
    try {
      const currentZoom = parseFloat(document.body.style.zoom) || 1;
      localStorage.setItem(ZOOM_KEY, currentZoom.toString());
    } catch(e) {
      console.warn('Zoom seviyesi kaydedilemedi:', e);
    }
  }
  
  // Zoom deÄŸiÅŸikliklerini dinle
  function observeZoom() {
    // MutationObserver ile body'nin style deÄŸiÅŸikliklerini izle
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
  
  // Sayfa yÃ¼klendiÄŸinde zoom'u uygula
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

/* Expert index to object helper (geriye dÃ¶nÃ¼k uyumluluk) */
function getExpertByIndex(i) { return TÃœM_UZMANLAR[i] || TÃœM_UZMANLAR[0]; }
function getExpertsByCategory(cat) {
  return TÃœM_UZMANLAR.filter(e => e.categories.includes(cat));
}

/* ============================================================
   AUTH SÄ°STEMÄ° â€” localStorage tabanlÄ±, sayfa deÄŸiÅŸiminde korunur
   ============================================================ */

const AUTH_KEY     = 'isbul_auth';
const USERS_DB_KEY = 'isbul_users_db';

/* KullanÄ±cÄ± veritabanÄ± â€” localStorage'da saklanÄ±r */
function getUsersDB() {
  try { return JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}'); }
  catch(e) { return {}; }
}
function saveUsersDB(db) {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
}

/* Demo uzman hesabÄ±nÄ± oluÅŸtur / gÃ¼ncelle - SADECE DEVELOPMENT MODUNDA */
function seedDemoExpert() {
  // ğŸ”’ GÃœVENLÄ°K: Production'da demo hesap oluÅŸturma
  const hostname = window.location.hostname;
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    console.log('ğŸ”’ Demo hesap sadece development modunda oluÅŸturulur');
    return; // Production'da Ã§alÄ±ÅŸtÄ±rma
  }
  
  const db = getUsersDB();
  const email = 'demo@isbul.local'; // Demo email
  const password = 'demo123456'; // Demo ÅŸifre

  // Her zaman gÃ¼ncel veriyle kaydet (varsa Ã¼stÃ¼ne yaz, kategoriler dahil)
  db[email] = {
    id: 'u_demo_expert_001',
    firstName: 'Demo',
    lastName: 'DedeoÄŸlu',
    email: email,
    passwordHash: btoa(password + '_isbul_salt'),
    createdAt: db[email]?.createdAt || new Date().toISOString(),
    avatar: 'ÃœD',
    color: '#6C63FF',
    role: 'expert',
    isExpert: true,
    expertData: {
      tags:       ['Mobilya MontajÄ±', 'TV MontajÄ±', 'Elektrik'],
      categories: ['montaj', 'tv', 'elektrik'],
      city:       'Ä°stanbul',
      price:      350,
      rating:     5.0,
      reviews:    0,
      experience: '5+ yÄ±l',
      bio:        'Profesyonel mobilya montajÄ±, TV montajÄ± ve elektrik iÅŸleri uzmanÄ±. Ä°stanbul genelinde hizmet veriyorum.',
      verified:   true,
      elite:      true,
      hours:      'Pzt-Cum: 09:00-18:00'
    }
  };
  saveUsersDB(db);

  // EÄŸer oturum aÃ§Ä±ksa ve bu kullanÄ±cÄ±ysa session'Ä± da gÃ¼ncelle
  const session = getSession();
  if (session && session.email === email) {
    session.isExpert  = true;
    session.role      = 'expert';
    session.expertData = db[email].expertData;
    saveSession(session);
  }

  console.log('âœ… Demo uzman hesabÄ± senkronize edildi:', email);
}

/* Oturum yÃ¶netimi */
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

/* KayÄ±t ol â€” API Ã¶ncelikli, localStorage fallback */
function registerUser(firstName, lastName, email, password) {
  const db = getUsersDB();
  if (db[email.toLowerCase()]) {
    return { success: false, error: 'Bu e-posta adresi zaten kayÄ±tlÄ±.' };
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

/* GiriÅŸ yap â€” API Ã¶ncelikli, localStorage fallback */
function loginUser(email, password) {
  const db = getUsersDB();
  const user = db[email.toLowerCase()];
  if (!user) {
    return { success: false, error: 'Bu e-posta adresi ile kayÄ±tlÄ± hesap bulunamadÄ±.' };
  }
  const expectedHash = btoa(password + '_isbul_salt');
  if (user.passwordHash !== expectedHash) {
    return { success: false, error: 'Åifre hatalÄ±. LÃ¼tfen tekrar deneyin.' };
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

/* Ã‡Ä±kÄ±ÅŸ yap */
function logoutUser() {
  // Backend'e logout bildir (token blacklist)
  const token = localStorage.getItem('isbul_jwt');
  if (token && typeof IsbulAPI !== 'undefined') {
    fetch((window.ISBUL_CONFIG?.backendUrl || 'https://isbul-backend.onrender.com') + '/api/v1/auth/logout', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    }).catch(() => {}); // Sessizce baÅŸarÄ±sÄ±z ol
  }
  clearSession();
  if (typeof TokenManager !== 'undefined') TokenManager.clear();
  _updateNavbarGuest();
  showToast('Ã‡Ä±kÄ±ÅŸ yapÄ±ldÄ±. GÃ¶rÃ¼ÅŸmek Ã¼zere!', 'info');
  setTimeout(() => { window.location.href = 'index.html'; }, 800);
}
window.logoutUser = logoutUser;

/* ============================================================
   AUTH GUARD â€” giriÅŸ gerektiren aksiyonlar iÃ§in
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
  msg.innerHTML = `<span>ğŸ”’</span><span>${message || 'Bu iÅŸlem iÃ§in giriÅŸ yapmanÄ±z gerekiyor.'}</span>`;
  const authBody = modal.querySelector('.auth-body');
  if (authBody) authBody.insertAdjacentElement('beforebegin', msg);

  if (typeof openAuthModal === 'function') openAuthModal('login');
  if (typeof callback === 'function') _pendingCallback = callback;
}
window.requireAuth = requireAuth;

/* ============================================================
   NAVBAR â€” oturum durumuna gÃ¶re gÃ¼ncelle
   ============================================================ */
function _updateNavbarLoggedIn(email, name) {
  const session = getSession();
  const displayName = name || (session ? session.firstName + ' ' + session.lastName : email?.split('@')[0]) || 'KullanÄ±cÄ±';
  const initials    = session ? session.avatar : (displayName[0]||'U').toUpperCase();
  const color       = session?.color || '#6C63FF';

  document.querySelectorAll('.navbar__actions').forEach(actions => {
    // Mevcut butonlarÄ± gizle
    actions.querySelectorAll('button:not(.hamburger), a.btn').forEach(b => {
      if (b.textContent.includes('GiriÅŸ') || b.textContent.includes('Kaydol')) {
        b.style.display = 'none';
      }
    });
    // Daha Ã¶nce eklenmiÅŸ kullanÄ±cÄ± butonunu kaldÄ±r
    actions.querySelector('.user-menu-btn')?.remove();

    // KullanÄ±cÄ± menu butonu ekle
    const userBtn = document.createElement('div');
    userBtn.className = 'user-menu-btn';
    userBtn.style.cssText = 'display:flex;align-items:center;gap:8px;padding:7px 14px;border-radius:50px;background:var(--primary-light);color:var(--primary);font-weight:600;font-size:14px;cursor:pointer;position:relative;user-select:none';
    userBtn.innerHTML = `
      <div style="width:28px;height:28px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${initials}</div>
      <span style="max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${displayName.split(' ')[0]}</span>
      <span style="font-size:10px;opacity:.7">â–¼</span>
      <div class="user-dropdown" style="display:none;position:absolute;top:calc(100% + 8px);right:0;background:var(--white);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.12);border:1.5px solid var(--border);min-width:180px;overflow:hidden;z-index:200">
        <div style="padding:14px 16px;border-bottom:1px solid var(--border)">
          <div style="font-size:13px;font-weight:700">${displayName}</div>
          <div style="font-size:11px;color:var(--text-muted)">${session?.email||email||''}</div>
        </div>
        ${session?.role === 'admin' || session?.email === 'umityakupdedeoglu0@gmail.com'
          ? '<a href="admin-panel.html" style="display:flex;align-items:center;gap:10px;padding:12px 16px;font-size:14px;color:#6C63FF;text-decoration:none;transition:.15s;font-weight:700;border-bottom:1px solid var(--border);background:#f5f3ff" onmouseover="this.style.background=\'#ede9ff\'" onmouseout="this.style.background=\'#f5f3ff\'">ğŸ›¡ï¸ Admin GiriÅŸi</a>'
          : ''}
        <a href="profil.html" style="display:flex;align-items:center;gap:10px;padding:12px 16px;font-size:14px;color:var(--text);text-decoration:none;transition:.15s" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''">ğŸ‘¤ Profilim</a>
        <button onclick="logoutUser()" style="display:flex;align-items:center;gap:10px;padding:12px 16px;font-size:14px;color:#ef4444;background:none;border:none;cursor:pointer;width:100%;text-align:left;border-top:1px solid var(--border)" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background=''">ğŸšª Ã‡Ä±kÄ±ÅŸ Yap</button>
      </div>`;
    userBtn.addEventListener('click', e => {
      e.stopPropagation();
      const dd = userBtn.querySelector('.user-dropdown');
      dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
    });

    // DÄ±ÅŸarÄ±ya tÄ±klayÄ±nca kapat â€” tek seferlik global listener (Ã¶ncekini temizle)
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

/* Sayfa yÃ¼klendiÄŸinde oturumu kontrol et ve navbar'Ä± gÃ¼ncelle */
function _initAuthState() {
  // Demo uzman hesabÄ±nÄ± her zaman gÃ¼ncel veriyle kaydet
  seedDemoExpert();
  
  if (isLoggedIn()) {
    _updateNavbarLoggedIn();
  }
  
  // Uzman listesi varsa cache'i sÄ±fÄ±rla ve yeniden yÃ¼kle
  // (seedDemoExpert Ã§alÄ±ÅŸtÄ±ktan sonra gÃ¼ncel listeyi gÃ¶stermek iÃ§in)
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
      
      // EÄŸer uzman-panel.html sayfasÄ±ndaysa aktif stili uygula
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
  _initAuthState(); // Her sayfa yÃ¼klendiÄŸinde oturum durumunu kontrol et
});

// Component loader'dan Ã§aÄŸrÄ±labilmesi iÃ§in global'e expose et
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

/* ---------- 4. ARAMA Ã–NERÄ°LERÄ° + ÅEHÄ°R DROPDOWN ---------- */
(function initSearch() {
  const searchQuery = document.getElementById('searchQuery');
  const cityInput = document.getElementById('cityInput');
  const cityDropdown = document.getElementById('cityDropdown');
  const searchBtn = document.getElementById('searchBtn');

  // Åehir dropdown mantÄ±ÄŸÄ±
  if (cityInput && cityDropdown) {
    const allCities = Array.from(cityDropdown.querySelectorAll('.city-option')).map(opt => ({
      element: opt,
      name: opt.dataset.city,
      text: opt.textContent
    }));

    cityInput.addEventListener('focus', () => {
      cityDropdown.classList.add('active');
      allCities.forEach(city => {
        if (city.element.dataset.city) city.element.style.display = '';
      });
    });

    cityInput.addEventListener('input', () => {
      const searchText = cityInput.value.toLowerCase().trim();
      cityDropdown.classList.add('active');
      
      if (!searchText) {
        allCities.forEach(city => {
          if (city.element.dataset.city) city.element.style.display = '';
        });
      } else {
        allCities.forEach(city => {
          if (city.name) {
            const matches = city.name.toLowerCase().includes(searchText);
            city.element.style.display = matches ? '' : 'none';
          }
        });
      }
    });

    cityDropdown.querySelectorAll('.city-option').forEach(opt => {
      opt.addEventListener('click', () => {
        if (opt.dataset.city) {
          cityInput.value = opt.dataset.city;
        }
        cityDropdown.classList.remove('active');
      });
    });

    document.addEventListener('click', e => {
      if (!cityInput.parentElement.contains(e.target)) {
        cityDropdown.classList.remove('active');
      }
    });
  }

  // Arama butonuna tÄ±klayÄ±nca uzmanlar sayfasÄ±na yÃ¶nlendir
  if (searchBtn && searchQuery && cityInput) {
    searchBtn.addEventListener('click', () => {
      const query = searchQuery.value.trim();
      const city = cityInput.value.trim();
      let url = 'uzmanlar.html';
      const params = [];
      if (query) params.push(`arama=${encodeURIComponent(query)}`);
      if (city) params.push(`sehir=${encodeURIComponent(city)}`);
      if (params.length) url += '?' + params.join('&');
      window.location.href = url;
    });

    // Enter tuÅŸu ile de arama yapÄ±labilsin
    searchQuery.addEventListener('keydown', e => {
      if (e.key === 'Enter') searchBtn.click();
    });
    cityInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') searchBtn.click();
    });
  }
})();

/* ---------- 5. REZERVASYON MODAL (gerÃ§ek veriler) ---------- */
const MOCK_EXPERTS = TÃœM_UZMANLAR; // geriye dÃ¶nÃ¼k uyumluluk

let bookingState = { step:1, expert:null, service:'', city:'', date:'', endDate:'', time:'', endTime:'', durationType:'hours', durationValue:1, notes:'' };

/* â”€â”€ Takvim yardÄ±mcÄ± fonksiyonlarÄ± â”€â”€ */
function getSlotsBetween(startDate, startTime, endDate, endTime) {
  // startDateâ€“endDate arasÄ±ndaki tÃ¼m gÃ¼n+saat kombinasyonlarÄ±nÄ± dÃ¶ndÃ¼rÃ¼r
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
  if (durationType === 'days')  return durationValue + ' gÃ¼n (tÃ¼m gÃ¼n)';
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
  if (durationType === 'days')  return price * 8 * durationValue;  // 8 saat/gÃ¼n
  if (durationType === 'weeks') return price * 8 * 5 * durationValue; // 5 gÃ¼n/hafta
  return price;
}

function openBookingModal(expertIndexOrId, serviceName) {
  // AUTH GUARD â€” giriÅŸ gerekli
  requireAuth(function() {
    const city = document.getElementById('cityInput')?.value || '';
    let expert;

    // Ã–nce getTumUzmanlar'dan ara (gerÃ§ek kullanÄ±cÄ±lar dahil)
    const tumUzmanlar = typeof getTumUzmanlar === 'function' ? getTumUzmanlar() : TÃœM_UZMANLAR;

    if (typeof expertIndexOrId === 'string' && expertIndexOrId.startsWith('e')) {
      // Statik uzman id'si â€” Ã¶nce gerÃ§ek listede ara, sonra statik listede
      expert = tumUzmanlar.find(e => e.id === expertIndexOrId) || TÃœM_UZMANLAR[0];
    } else if (typeof expertIndexOrId === 'string' && expertIndexOrId.startsWith('u_')) {
      // GerÃ§ek kullanÄ±cÄ± id'si
      expert = tumUzmanlar.find(e => e.id === expertIndexOrId);
      if (!expert) {
        // users_db'den direkt oluÅŸtur
        const db = getUsersDB();
        const u = Object.values(db).find(u => u.id === expertIndexOrId && u.isExpert);
        if (u) expert = {
          id: u.id, name: u.firstName + ' ' + u.lastName,
          city: u.expertData?.city || 'Ä°stanbul',
          avatar: u.avatar, color: u.color,
          title: (u.expertData?.tags?.[0] || 'Uzman') + ' UzmanÄ±',
          categories: (u.expertData?.tags || []).map(t => t.toLowerCase()),
          rating: u.expertData?.rating || 5.0, reviews: u.expertData?.reviews || 0,
          price: u.expertData?.price || 300, experience: u.expertData?.experience || '1 yÄ±l',
          elite: false, bio: u.expertData?.bio || '', tags: u.expertData?.tags || [],
          reviewList: [], isRealUser: true
        };
      }
      if (!expert) expert = TÃœM_UZMANLAR[0];
    } else {
      const idx = typeof expertIndexOrId === 'number' ? expertIndexOrId : parseInt(expertIndexOrId) || 0;
      expert = TÃœM_UZMANLAR[idx] || TÃœM_UZMANLAR[0];
    }

    bookingState = { step:1, expert, service: serviceName||'', city, date:'', endDate:'', time:'', endTime:'', durationType:'hours', durationValue:1, notes:'' };
    renderBookingModal();
    const m = document.getElementById('bookingModal');
    if (m) { m.classList.add('active'); document.body.style.overflow='hidden'; }
  }, 'Rezervasyon yapmak iÃ§in Ã¶nce giriÅŸ yapmanÄ±z gerekiyor.');
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
      <div style="width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;background:${bookingState.step===i+1?'var(--primary)':bookingState.step>i+1?'var(--success)':'var(--border)'};color:${bookingState.step>=i+1?'#fff':'var(--text-muted)'}">${bookingState.step>i+1?'âœ“':i+1}</div>
      <span class="modal-step-label">${s}</span>
    </div>
    ${i<2?'<div style="flex:1;height:2px;background:'+(bookingState.step>i+1?'var(--success)':'var(--border)')+'"></div>':''}
  `).join('');

  const reviewsHTML = (e.reviewList||[]).slice(0,2).map(r => {
    const cust = USERS.customers.find(c=>c.id===r.user)||{ name:'MÃ¼ÅŸteri', avatar:'M', color:'#999' };
    const stars = 'â˜…'.repeat(r.rating) + 'â˜†'.repeat(5-r.rating);
    return `<div style="background:var(--bg);border-radius:10px;padding:12px;margin-bottom:8px">
      <div style="color:#f59e0b;font-size:12px;margin-bottom:4px">${stars}</div>
      <p style="font-size:13px;color:var(--text);font-style:italic;margin-bottom:8px">"${r.text}"</p>
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:26px;height:26px;border-radius:50%;background:${cust.color};color:#fff;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center">${cust.avatar}</div>
        <div style="font-size:12px"><strong>${cust.name}</strong> <span style="color:var(--text-muted)">â€¢ ${r.service}</span></div>
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
            ${e.elite?'<span style="background:#fbbf24;color:#78350f;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px">ğŸ† Elite</span>':''}
          </div>
          <div style="font-size:13px;color:var(--text-muted)">${e.title||e.bio?.slice(0,40)} â€¢ ${e.city}</div>
          <div style="font-size:13px;color:#f59e0b">â˜… ${e.rating} <span style="color:var(--text-muted)">(${e.reviews} yorum) â€¢ ${e.experience}</span></div>
        </div>
        <div style="margin-left:auto;text-align:right;flex-shrink:0">
          <strong style="color:var(--primary);font-size:18px">â‚º${e.price}</strong>
          <div style="font-size:11px;color:var(--text-muted)">/saat</div>
        </div>
      </div>
      <div style="background:var(--bg);border-radius:10px;padding:14px;margin-bottom:12px;font-size:14px;color:var(--text);line-height:1.7">${e.bio}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">${(e.tags||[]).map(t=>`<span style="padding:4px 12px;border-radius:20px;background:var(--primary-light);color:var(--primary);font-size:12px;font-weight:500">${t}</span>`).join('')}</div>
      ${reviewsHTML ? `<div style="margin-bottom:14px"><div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Son Yorumlar</div>${reviewsHTML}</div>` : ''}
      <div style="background:#fffbe6;border-radius:10px;padding:12px;font-size:13px;color:#92400e;margin-bottom:16px">âœ… Kimlik DoÄŸrulandÄ± &nbsp;|&nbsp; ğŸ›¡ï¸ SigortalÄ± &nbsp;|&nbsp; ğŸ’³ GÃ¼venli Ã–deme</div>
      <div class="form-group"><label style="font-size:13px;font-weight:600">Hizmet Notu (isteÄŸe baÄŸlÄ±)</label>
        <textarea id="bmNotes" rows="2" placeholder="Uzman iÃ§in notlarÄ±nÄ±z..." style="width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid var(--border);font-family:var(--font);font-size:14px;outline:none;resize:none;margin-top:6px">${bookingState.notes}</textarea>
      </div>
      <button onclick="bookingState.notes=document.getElementById('bmNotes').value;bookingState.step=2;renderBookingModal()" class="btn btn--primary" style="width:100%;justify-content:center;border-radius:50px">Tarih & Saat SeÃ§ â†’</button>`;

  } else if (bookingState.step === 2) {
    const today = new Date();
    const dates = Array.from({length:30},(_,i)=>{ const d=new Date(today); d.setDate(today.getDate()+i); return { label:i===0?'BugÃ¼n':i===1?'YarÄ±n':d.toLocaleDateString('tr-TR',{weekday:'short',day:'numeric',month:'short'}), val:d.toISOString().split('T')[0] }; });
    const times = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];

    // UzmanÄ±n dolu slotlarÄ±nÄ± yÃ¼kle
    const TAKVIM_KEY = 'isbul_takvim_' + bookingState.expert.id;
    let takvim = {};
    try { takvim = JSON.parse(localStorage.getItem(TAKVIM_KEY) || '{}'); } catch(err) {}

    // SÃ¼re seÃ§enekleri
    const durationOptions = {
      hours: [1,2,3,4,5,6,7,8],
      days:  [1,2,3,4,5,6,7],
      weeks: [1,2,3,4]
    };

    body.innerHTML = `
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:20px;flex-wrap:wrap">${stepHTML}</div>

      <!-- Tarih SeÃ§imi -->
      <p style="font-size:13px;font-weight:700;margin-bottom:10px">ğŸ“… BaÅŸlangÄ±Ã§ Tarihi</p>
      <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;margin-bottom:16px" id="dateBtns">
        ${dates.map(d=>`<button onclick="bookingState.date='${d.val}';document.querySelectorAll('.date-btn').forEach(b=>{b.style.background='var(--bg)';b.style.color='var(--text)';b.style.borderColor='var(--border)'});this.style.background='var(--primary)';this.style.color='#fff';this.style.borderColor='var(--primary)';bookingState.time='';updateDurationPreview();renderTimeSlots('${d.val}')" class="date-btn" style="flex-shrink:0;padding:8px 14px;border-radius:10px;border:1.5px solid ${bookingState.date===d.val?'var(--primary)':'var(--border)'};font-size:12px;font-weight:600;cursor:pointer;background:${bookingState.date===d.val?'var(--primary)':'var(--bg)'};color:${bookingState.date===d.val?'#fff':'var(--text)'};transition:.2s">${d.label}</button>`).join('')}
      </div>

      <!-- BaÅŸlangÄ±Ã§ Saati -->
      <p style="font-size:13px;font-weight:700;margin-bottom:10px">ğŸ• BaÅŸlangÄ±Ã§ Saati</p>
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

      <!-- SÃ¼re SeÃ§imi -->
      <div style="background:#f8f9fa;border-radius:12px;padding:16px;margin-bottom:16px;">
        <p style="font-size:13px;font-weight:700;margin-bottom:12px;">â±ï¸ Ä°ÅŸ SÃ¼resi</p>
        <div style="display:flex;gap:8px;margin-bottom:12px;">
          <button onclick="bookingState.durationType='hours';document.querySelectorAll('.dur-type-btn').forEach(b=>b.style.background='#e5e7eb');this.style.background='var(--primary)';this.style.color='#fff';updateDurationSelect();updateDurationPreview()" class="dur-type-btn" style="flex:1;padding:10px;border-radius:8px;border:none;font-size:13px;font-weight:700;cursor:pointer;background:${bookingState.durationType==='hours'?'var(--primary)':'#e5e7eb'};color:${bookingState.durationType==='hours'?'#fff':'#374151'}">â° Saatlik</button>
          <button onclick="bookingState.durationType='days';document.querySelectorAll('.dur-type-btn').forEach(b=>{b.style.background='#e5e7eb';b.style.color='#374151'});this.style.background='var(--primary)';this.style.color='#fff';updateDurationSelect();updateDurationPreview()" class="dur-type-btn" style="flex:1;padding:10px;border-radius:8px;border:none;font-size:13px;font-weight:700;cursor:pointer;background:${bookingState.durationType==='days'?'var(--primary)':'#e5e7eb'};color:${bookingState.durationType==='days'?'#fff':'#374151'}">ğŸ“… GÃ¼nlÃ¼k</button>
          <button onclick="bookingState.durationType='weeks';document.querySelectorAll('.dur-type-btn').forEach(b=>{b.style.background='#e5e7eb';b.style.color='#374151'});this.style.background='var(--primary)';this.style.color='#fff';updateDurationSelect();updateDurationPreview()" class="dur-type-btn" style="flex:1;padding:10px;border-radius:8px;border:none;font-size:13px;font-weight:700;cursor:pointer;background:${bookingState.durationType==='weeks'?'var(--primary)':'#e5e7eb'};color:${bookingState.durationType==='weeks'?'#fff':'#374151'}">ğŸ“† HaftalÄ±k</button>
        </div>
        <select id="durationSelect" onchange="bookingState.durationValue=+this.value;updateDurationPreview()" style="width:100%;padding:10px 14px;border-radius:8px;border:1.5px solid #e5e7eb;font-size:14px;font-weight:600;color:#1a202c;">
          ${(durationOptions[bookingState.durationType]||durationOptions.hours).map(v=>`<option value="${v}" ${bookingState.durationValue===v?'selected':''}>${v} ${bookingState.durationType==='hours'?'saat':bookingState.durationType==='days'?'gÃ¼n':'hafta'}</option>`).join('')}
        </select>
        <!-- Ã–nizleme -->
        <div id="durationPreview" style="margin-top:10px;padding:10px 14px;background:#ede9ff;border-radius:8px;font-size:13px;color:#6C63FF;font-weight:600;">
          ${bookingState.date && bookingState.time ? 'ğŸ“‹ SeÃ§iminizi aÅŸaÄŸÄ±da gÃ¶receksiniz' : 'â¬†ï¸ Ã–nce tarih ve baÅŸlangÄ±Ã§ saati seÃ§in'}
        </div>
      </div>

      <p style="font-size:11px;color:var(--text-muted);margin-bottom:16px">â„¹ï¸ Tarih seÃ§ince dolu saatler gÃ¼ncellenir</p>
      <div style="display:flex;gap:10px">
        <button onclick="bookingState.step=1;renderBookingModal()" class="btn btn--ghost" style="flex:1">â† Geri</button>
        <button onclick="validateAndNextStep()" class="btn btn--primary" style="flex:2;justify-content:center;border-radius:50px">Onaya Git â†’</button>
      </div>`;

    // SÃ¼re select gÃ¼ncelle
    window.updateDurationSelect = function() {
      const sel = document.getElementById('durationSelect');
      if (!sel) return;
      const opts = durationOptions[bookingState.durationType] || durationOptions.hours;
      const label = bookingState.durationType==='hours'?'saat':bookingState.durationType==='days'?'gÃ¼n':'hafta';
      sel.innerHTML = opts.map(v=>`<option value="${v}">${v} ${label}</option>`).join('');
      bookingState.durationValue = opts[0];
      sel.value = opts[0];
      updateDurationPreview();
    };

    // Ã–nizleme gÃ¼ncelle
    window.updateDurationPreview = function() {
      const el = document.getElementById('durationPreview');
      if (!el) return;
      if (!bookingState.date || !bookingState.time) {
        el.textContent = 'â¬†ï¸ Ã–nce tarih ve baÅŸlangÄ±Ã§ saati seÃ§in';
        return;
      }
      const { endDate, endTime } = calcEndDatetime(bookingState.date, bookingState.time, bookingState.durationType, bookingState.durationValue);
      bookingState.endDate = endDate;
      bookingState.endTime = endTime;
      const startStr = new Date(bookingState.date).toLocaleDateString('tr-TR',{weekday:'short',day:'numeric',month:'short'});
      const endStr   = endDate === bookingState.date ? '' : ' â†’ ' + new Date(endDate).toLocaleDateString('tr-TR',{weekday:'short',day:'numeric',month:'short'});
      const totalPrice = calcTotalPrice(bookingState.expert.price, bookingState.durationType, bookingState.durationValue);
      el.innerHTML = `ğŸ“‹ ${startStr} ${bookingState.time}${endStr} ${endDate !== bookingState.date ? endTime : 'â€“ '+endTime} &nbsp;|&nbsp; <strong>${calcDurationLabel(bookingState.durationType, bookingState.durationValue)}</strong> &nbsp;|&nbsp; Toplam: <strong style="color:#6C63FF">â‚º${totalPrice.toLocaleString('tr-TR')}</strong>`;

      // Ã‡akÄ±ÅŸan slot kontrolÃ¼
      const slots = getSlotsBetween(bookingState.date, bookingState.time, endDate, endTime);
      const doluSlot = slots.find(s => takvim[s]);
      if (doluSlot) {
        const [doluDate, doluTime] = doluSlot.split('_');
        el.innerHTML += `<br><span style="color:#ef4444;font-size:12px;">âš ï¸ ${new Date(doluDate).toLocaleDateString('tr-TR',{day:'numeric',month:'short'})} ${doluTime} saati dolu! LÃ¼tfen farklÄ± aralÄ±k seÃ§in.</span>`;
      }
    };

    // Tarih seÃ§ildiÄŸinde saatleri gÃ¼ncelle
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

    // Validation + geÃ§iÅŸ
    window.validateAndNextStep = function() {
      if (!bookingState.date) { showToast('LÃ¼tfen baÅŸlangÄ±Ã§ tarihi seÃ§in.','error'); return; }
      if (!bookingState.time) { showToast('LÃ¼tfen baÅŸlangÄ±Ã§ saati seÃ§in.','error'); return; }
      // Ã–nce Ã¶nizlemeyi gÃ¼ncelle (endDate/endTime hesaplansÄ±n)
      updateDurationPreview();
      // Ã‡akÄ±ÅŸma kontrolÃ¼
      const slots = getSlotsBetween(bookingState.date, bookingState.time, bookingState.endDate, bookingState.endTime);
      const doluSlot = slots.find(s => takvim[s]);
      if (doluSlot) {
        const [doluDate, doluTime] = doluSlot.split('_');
        showToast(`âŒ ${new Date(doluDate).toLocaleDateString('tr-TR',{day:'numeric',month:'short'})} ${doluTime} saati dolu! FarklÄ± aralÄ±k seÃ§in.`,'error');
        return;
      }
      bookingState.step = 3;
      renderBookingModal();
    };

  } else {
    const e2 = bookingState.expert;
    const initials2 = e2.avatar || e2.name.split(' ').map(w=>w[0]).join('').slice(0,2);
    const startStr = bookingState.date ? new Date(bookingState.date).toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long'}) : 'â€”';
    const endStr   = bookingState.endDate && bookingState.endDate !== bookingState.date
      ? new Date(bookingState.endDate).toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long'})
      : null;
    const durationLabel = calcDurationLabel(bookingState.durationType, bookingState.durationValue);
    const totalPrice    = calcTotalPrice(e2.price, bookingState.durationType, bookingState.durationValue);

    body.innerHTML = `
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:20px;flex-wrap:wrap">${stepHTML}</div>
      <h3 style="font-size:17px;font-weight:800;margin-bottom:16px">Rezervasyon Ã–zeti</h3>
      <div style="background:var(--bg);border-radius:12px;padding:18px;margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--border)">
          <div style="width:44px;height:44px;border-radius:50%;background:${e2.color};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px">${initials2}</div>
          <div><strong>${e2.name}</strong><div style="font-size:12px;color:var(--text-muted)">${e2.title||''}</div></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;font-size:14px">
          <div style="display:flex;justify-content:space-between">
            <span style="color:var(--text-muted)">ğŸ“… BaÅŸlangÄ±Ã§</span>
            <strong>${startStr} â€“ ${bookingState.time}</strong>
          </div>
          ${endStr ? `
          <div style="display:flex;justify-content:space-between">
            <span style="color:var(--text-muted)">ğŸ BitiÅŸ</span>
            <strong>${endStr} â€“ ${bookingState.endTime}</strong>
          </div>` : ''}
          <div style="display:flex;justify-content:space-between">
            <span style="color:var(--text-muted)">â±ï¸ SÃ¼re</span>
            <strong>${durationLabel}</strong>
          </div>
          <div style="display:flex;justify-content:space-between">
            <span style="color:var(--text-muted)">ğŸ“ Åehir</span>
            <strong>${bookingState.city||e2.city}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;border-top:1px solid var(--border);padding-top:10px;margin-top:2px">
            <span style="color:var(--text-muted)">ğŸ’° Saatlik Ãœcret</span>
            <span>â‚º${e2.price}/saat</span>
          </div>
          <div style="display:flex;justify-content:space-between;background:#ede9ff;border-radius:8px;padding:10px 14px">
            <span style="font-weight:700;color:#4c1d95">ğŸ’³ Toplam Tahmini Tutar</span>
            <strong style="color:var(--primary);font-size:16px">â‚º${totalPrice.toLocaleString('tr-TR')}</strong>
          </div>
        </div>
      </div>
      ${bookingState.notes?`<div style="background:#f0fdf4;border-radius:10px;padding:12px;font-size:13px;color:#166534;margin-bottom:16px">ğŸ“ Not: ${bookingState.notes}</div>`:''}
      <div style="background:#fffbe6;border-radius:10px;padding:12px;font-size:12px;color:#92400e;margin-bottom:20px">ğŸ”’ Ã–demeniz iÅŸ tamamlanana kadar gÃ¼vende tutulur.</div>
      <div style="display:flex;gap:10px">
        <button onclick="bookingState.step=2;renderBookingModal()" class="btn btn--ghost" style="flex:1">â† Geri</button>
        <button onclick="confirmBooking()" class="btn btn--primary" style="flex:2;justify-content:center;border-radius:50px">âœ… Rezervasyonu Onayla</button>
      </div>`;
  }
}

function confirmBooking() {
  const body = document.getElementById('bookingModalBody');
  const e = bookingState.expert;
  const session = typeof getSession === 'function' ? getSession() : null;
  if (!session) return;

  const startStr = bookingState.date ? new Date(bookingState.date).toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long'}) : 'â€”';
  const endStr   = bookingState.endDate && bookingState.endDate !== bookingState.date
    ? new Date(bookingState.endDate).toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long'})
    : null;
  const durationLabel = calcDurationLabel(bookingState.durationType, bookingState.durationValue);
  const totalPrice    = calcTotalPrice(e.price, bookingState.durationType, bookingState.durationValue);

  // â”€â”€ TÃ¼m aralÄ±k slotlarÄ±nÄ± kontrol et â”€â”€
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
    showToast(`âŒ ${new Date(doluDate).toLocaleDateString('tr-TR',{day:'numeric',month:'short'})} ${doluTime} dolu! FarklÄ± aralÄ±k seÃ§in.`, 'error');
    bookingState.step = 2;
    renderBookingModal();
    return;
  }

  // â”€â”€ Rezervasyonu merkezi DB'ye yaz â”€â”€
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
    slots:          allSlots,  // takvim referansÄ± iÃ§in
    city:           bookingState.city || e.city,
    price:          e.price,
    notes:          bookingState.notes,
    status:         'pending',
    createdAt:      new Date().toISOString()
  };

  bookingDB[rezId] = rezervasyon;
  localStorage.setItem(BOOKING_DB_KEY, JSON.stringify(bookingDB));

  // â”€â”€ TÃ¼m slotlarÄ± takvime iÅŸaretle â”€â”€
  markSlotsInCalendar(e.id, allSlots, rezId);

  // â”€â”€ MÃ¼ÅŸteri listesine de yaz â”€â”€
  const REZ_KEY = 'isbul_rezervasyonlar_' + session.id;
  let rezList = [];
  try { rezList = JSON.parse(localStorage.getItem(REZ_KEY) || '[]'); } catch(err) {}
  rezList.push(rezervasyon);
  localStorage.setItem(REZ_KEY, JSON.stringify(rezList));

  // â”€â”€ API'ye de gÃ¶nder (varsa) â”€â”€
  if (typeof IsbulAPI !== 'undefined') {
    IsbulAPI.bookings.create({
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
    }).catch(err => console.warn('[API] Rezervasyon API kaydÄ± baÅŸarÄ±sÄ±z:', err));
  }

  const timeRange = endStr
    ? `${startStr} ${bookingState.time} â†’ ${endStr} ${bookingState.endTime}`
    : `${startStr} ${bookingState.time}`;

  body.innerHTML = `
    <div style="text-align:center;padding:20px 0">
      <div style="font-size:64px;margin-bottom:16px">ğŸ‰</div>
      <h3 style="font-size:20px;font-weight:900;margin-bottom:8px">Rezervasyon AlÄ±ndÄ±!</h3>
      <p style="font-size:14px;color:var(--text-muted);line-height:1.7;margin-bottom:20px">
        <strong>${e.name}</strong> iÃ§in rezervasyonunuz oluÅŸturuldu.<br>
        <strong>${timeRange}</strong><br>
        SÃ¼re: ${durationLabel} â€” Toplam: <strong style="color:var(--primary)">â‚º${totalPrice.toLocaleString('tr-TR')}</strong>
      </p>
      <div style="background:var(--bg);border-radius:12px;padding:16px;text-align:left;margin-bottom:20px;font-size:13px">
        <div style="font-weight:700;margin-bottom:8px">Sonraki AdÄ±mlar:</div>
        <div style="display:flex;flex-direction:column;gap:6px;color:var(--text-muted)">
          <div>ğŸ“‹ Rezervasyon profilinize kaydedildi</div>
          <div>â³ Uzman onayÄ± bekleniyor</div>
          <div>ğŸ“ OnaylandÄ±ÄŸÄ±nda adresinizi uzmanla paylaÅŸÄ±n</div>
        </div>
      </div>
      <div style="display:flex;gap:10px;justify-content:center">
        <button onclick="closeBookingModal()" class="btn btn--ghost">Kapat</button>
        <a href="profil.html" onclick="closeBookingModal()" class="btn btn--primary">RezervasyonlarÄ±m â†’</a>
      </div>
    </div>`;
  showToast('âœ… Rezervasyonunuz alÄ±ndÄ±! Uzman onayÄ± bekleniyor.', 'success');
}
window.confirmBooking = confirmBooking;


/* ---------- 6. HOMEPAGE SEARCH REDIRECT (Modal Disabled) ---------- */
(function initSearchRedirect() {
  const searchBtn = document.getElementById('searchBtn');
  const searchQueryInput = document.getElementById('searchQuery');
  const cityInput = document.getElementById('cityInput');

  function performSearch() {
    const query = searchQueryInput?.value.trim() || '';
    const city = cityInput?.value.trim() || '';
    
    // Build redirect URL with query parameters
    let redirectUrl = 'uzmanlar.html';
    const params = new URLSearchParams();
    
    if (query) params.append('arama', query);
    if (city) params.append('sehir', city);
    
    if (params.toString()) {
      redirectUrl += '?' + params.toString();
    }
    
    // Redirect to results page
    window.location.href = redirectUrl;
  }

  // Search button click
  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
  }

  // Enter key on search query input
  if (searchQueryInput) {
    searchQueryInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch();
      }
    });
  }

  // Enter key on city input
  if (cityInput) {
    cityInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch();
      }
    });
  }

  // Quick tags redirect
  const quickTags = document.querySelectorAll('.quick-tag');
  quickTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const tagQuery = tag.getAttribute('data-query') || tag.textContent.trim();
      if (searchQueryInput) searchQueryInput.value = tagQuery;
      performSearch();
    });
  });
})();
    /* ---------- 7. YORUMLAR SLÄ°DER ---------- */
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
    // Slider container geniÅŸliÄŸinden kart geniÅŸliÄŸi hesapla
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

/* ---------- 8. SAYAÃ‡ ANÄ°MASYONU ---------- */
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
  // Hizmetler sayfasÄ±ndaki service-card-v2'lere fade-up EKLEME â€” zaten gÃ¶rÃ¼nÃ¼r durumdalar
  const sel = '.category-card,.trust-card,.step,.benefit-item,.service-card,.hiw-step-card';
  document.querySelectorAll(sel).forEach(el => el.classList.add('fade-up'));
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
})();

/* ---------- 10. HÄ°ZMETLER FÄ°LTRE ---------- */
(function initServiceFilter() {
  function applyFilters() {
    const activeLink = document.querySelector('.sidebar-cat-link.active');
    const activeCat = activeLink ? activeLink.dataset.cat : 'all';
    
    // First, regenerate the cards for this category using the data
    if (typeof renderSubCategoryCards === 'function') {
      renderSubCategoryCards(activeCat, 'servicesgrid');
    }

    const maxPrice  = parseInt(document.getElementById('priceRange')?.value || '99999');
    const minRating = parseFloat(document.querySelector('.rating-filter.active')?.dataset.min || '0');
    const cards = document.querySelectorAll('#servicesgrid .service-card-v2');
    let count = 0;

    cards.forEach(card => {
      card.classList.remove('fade-up');
      card.style.opacity = '';
      card.style.transform = '';

      const cardPrice   = parseInt(card.dataset.price || '99999');
      const priceMatch  = cardPrice <= maxPrice;
      const cardRating  = parseFloat(card.dataset.rating || '5');
      const ratingMatch = cardRating >= minRating;
      const show = priceMatch && ratingMatch;

      card.style.display = show ? '' : 'none';
      if (show) count++;
    });

    const rc = document.getElementById('resultCount');
    if (rc) rc.textContent = count;
  }

  // Event Delegation for dynamic sidebar links
  document.addEventListener('click', e => {
    const link = e.target.closest('.sidebar-cat-link');
    if (link) {
      e.preventDefault();
      document.querySelectorAll('.sidebar-cat-link').forEach(t => t.classList.remove('active'));
      link.classList.add('active');
      applyFilters();
      window.scrollTo({ top: document.getElementById('servicesgrid')?.offsetTop - 120 || 0, behavior: 'smooth' });
    }
  });

  // Fiyat aralÄ±ÄŸÄ±
  const priceRange = document.getElementById('priceRange');
  const priceLabel = document.getElementById('priceLabel');
  if (priceRange) {
    priceRange.addEventListener('input', () => {
      if (priceLabel) priceLabel.textContent = `â‚º100 â€“ â‚º${priceRange.value}`;
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

  // SÄ±ralama
  const sortSel = document.getElementById('sortSelect');
  if (sortSel) {
    sortSel.addEventListener('change', () => {
      const grid = document.getElementById('servicesgrid');
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

  // MÃ¼saitlik filtreleri
  document.querySelectorAll('.avail-filter').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      showToast('Bu filtre yakÄ±nda aktif olacak!', 'info');
    });
  });

  // Ä°lk yÃ¼klemede applyFilters'Ä± biraz gecikmeli Ã§alÄ±ÅŸtÄ±r â€” DOM tam render olsun
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      applyFilters();
    });
  });
})();

/* ---------- 11. HÄ°ZMETLER SAYFA ARAMASI ---------- */
(function initServicePageSearch() {
  const inp = document.getElementById('serviceSearch');
  const cards = document.querySelectorAll('.service-card-v2');
  if (!inp || !cards.length) return;
  inp.addEventListener('input', () => {
    const val = inp.value.trim().toLocaleLowerCase('tr-TR');
    let count = 0;
    cards.forEach(card => {
      const h3 = card.querySelector('h3')?.textContent.toLocaleLowerCase('tr-TR') || '';
      const p  = card.querySelector('p')?.textContent.toLocaleLowerCase('tr-TR')  || '';
      const show = !val || h3.includes(val) || p.includes(val);
      card.style.display = show ? '' : 'none';
      if (show) count++;
    });
    const rc = document.getElementById('resultCount');
    if (rc) rc.textContent = count;
  });

  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = inp.value.trim();
      if (q) window.location.href = `uzmanlar.html?arama=${encodeURIComponent(q)}`;
    }
  });
})();

/* ---------- 12. URL KATEGORÄ° PARAMETRESÄ° ---------- */
(function initCategoryParam() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('kategori');
  if (!cat) return;
  const tab = document.querySelector(`.filter-tab[data-cat="${cat}"]`);
  if (tab) setTimeout(() => tab.click(), 100);
})();

/* ---------- 13. TOAST BÄ°LDÄ°RÄ°MÄ° ---------- */
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

/* ---------- 15. AUTH MODAL + OAuth AltyapÄ±sÄ± ---------- */

/* openAuthModal â€” modal henÃ¼z yÃ¼klenmemiÅŸ olsa bile Ã§alÄ±ÅŸÄ±r */
window.openAuthModal = function(tab) {
  const modal = document.getElementById('authModal');
  if (!modal) {
    console.warn('authModal bulunamadÄ±, sayfa yenileniyor...');
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
    // Modal'Ä± kapat
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
    
    // API base URL'i api-client.js'den al (tutarlÄ±lÄ±k iÃ§in)
    const apiBase = window.IsbulAPI?.baseUrl 
      ? window.IsbulAPI.baseUrl.replace('/v1', '')  // /api/v1 â†’ /api
      : 'https://isbul-backend.onrender.com/api';    // Fallback
    
    console.log('ğŸ” Google OAuth baÅŸlatÄ±lÄ±yor...');
    console.log('ğŸ“ Backend URL:', apiBase);
    console.log('ğŸ“ Current URL:', window.location.href);

    // Mevcut sayfayÄ± kaydet â€” hem session hem localStorage'a (domain deÄŸiÅŸimi iÃ§in)
    const currentUrl = window.location.href;
    sessionStorage.setItem('oauth_return_url', currentUrl);
    localStorage.setItem('oauth_return_url', currentUrl);
    console.log('ğŸ’¾ Return URL kaydedildi:', currentUrl);
    
    // Backend'i uyandÄ±r ve kontrol et (Render free tier uyuyabilir)
    showToast('Backend baÄŸlantÄ±sÄ± kontrol ediliyor...', 'info');
    
    const startTime = Date.now();
    
    // Backend health check (30 saniye timeout)
    const checkBackend = () => {
      return fetch(`${apiBase}/health`, { 
        signal: AbortSignal.timeout(30000) 
      })
        .then(res => {
          if (res.ok) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`âœ… Backend eriÅŸilebilir (${elapsed}s)`);
            showToast('Backend hazÄ±r, Google\'a yÃ¶nlendiriliyorsunuz...', 'success');
            
            // 500ms sonra yÃ¶nlendir
            setTimeout(() => {
              window.location.href = `${apiBase}/auth/google`;
            }, 500);
          } else {
            throw new Error(`Backend HTTP ${res.status}`);
          }
        });
    };
    
    // Ä°lk deneme
    checkBackend().catch(err => {
      console.warn('âš ï¸ Ä°lk deneme baÅŸarÄ±sÄ±z, backend uyanÄ±yor olabilir...', err.message);
      showToast('Backend uyandÄ±rÄ±lÄ±yor, lÃ¼tfen bekleyin... (30 saniye)', 'info');
      
      // 5 saniye bekle ve tekrar dene
      setTimeout(() => {
        checkBackend().catch(err => {
          console.error('âŒ Backend hala eriÅŸilemiyor:', err);
          showToast('Backend sunucusuna eriÅŸilemiyor. LÃ¼tfen sistem yÃ¶neticisiyle iletiÅŸime geÃ§in.', 'error');
          
          // Modal'Ä± tekrar aÃ§
          if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
          }
          
          // Hata detayÄ± gÃ¶ster
          const errorDetail = document.createElement('div');
          errorDetail.style.cssText = 'position:fixed;bottom:80px;right:24px;background:#1f2937;color:#fff;padding:12px 16px;border-radius:8px;font-size:12px;max-width:320px;z-index:9999';
          errorDetail.innerHTML = `
            <div style="font-weight:700;margin-bottom:4px">Backend Hata DetayÄ±:</div>
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
  showToast(`${name} ile giriÅŸ yakÄ±nda aktif olacak! ğŸš€`, 'info');
};

/* Auth modal tam baÅŸlatma â€” DOM hazÄ±r olduÄŸunda Ã§alÄ±ÅŸtÄ±r */
function _initAuthModalFull() {
  const modal = document.getElementById('authModal');
  if (!modal) return;

  const closeBtn = document.getElementById('authModalClose');
  closeBtn?.addEventListener('click', window.closeAuthModal);
  modal.addEventListener('click', e => { if (e.target === modal) window.closeAuthModal(); });
  modal.querySelectorAll('.auth-tab').forEach(t =>
    t.addEventListener('click', () => _switchAuthTab(t.dataset.tab))
  );

  /* Email login â€” API Ã¶ncelikli, localStorage fallback */
  const loginForm = document.getElementById('loginForm');
  if (loginForm && !loginForm._bound) {
    loginForm._bound = true;
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const emailEl = e.target.querySelector('[name=email]');
      const passEl  = e.target.querySelector('[name=password]');
      if (!emailEl?.value.trim()) { showToast('E-posta adresini girin.', 'error'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) { showToast('GeÃ§erli bir e-posta girin.', 'error'); return; }
      if (!passEl?.value) { showToast('Åifrenizi girin.', 'error'); return; }

      const btn = e.target.querySelector('button[type=submit]');
      const origText = btn.textContent;
      btn.textContent = 'GiriÅŸ yapÄ±lÄ±yor...'; btn.disabled = true;

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
            // API baÅŸarÄ±lÄ± â€” session'a kaydet
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
        showToast(`âœ… HoÅŸ geldiniz, ${result.user.firstName}!`, 'success');
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

  /* Email register â€” API Ã¶ncelikli, localStorage fallback */
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

      if (!fn) { showToast('Ad alanÄ± zorunludur.', 'error'); return; }
      if (!ln) { showToast('Soyad alanÄ± zorunludur.', 'error'); return; }
      if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { showToast('GeÃ§erli bir e-posta girin.', 'error'); return; }
      if (!p1 || p1.length < 8) { showToast('Åifre en az 8 karakter olmalÄ±dÄ±r.', 'error'); return; }
      if (p1 !== p2) { showToast('Åifreler eÅŸleÅŸmiyor!', 'error'); return; }

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
        showToast(`ğŸ‰ HoÅŸ geldiniz, ${fn}! HesabÄ±nÄ±z oluÅŸturuldu.`, 'success');
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

/* DOM hazÄ±r olduÄŸunda baÅŸlat */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _initAuthModalFull);
} else {
  _initAuthModalFull();
}

/* ---------- 16. APP BUTTONS (kaldÄ±rÄ±ldÄ±) ---------- */

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

console.log('%cÄ°ÅŸBul âš¡', 'color:#6C63FF;font-size:22px;font-weight:900');
console.log('%cv2 â€” TÃ¼m butonlar aktif', 'color:#10b981;font-size:13px');



/* ---------- Ä°LETÄ°ÅÄ°M MODAL (tÃ¼m sayfalarda) ---------- */
(function initContactModal() {
  const modal = document.getElementById('contactModal');
  if (!modal) return;
  // Overlay'e tÄ±klayÄ±nca kapat
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


