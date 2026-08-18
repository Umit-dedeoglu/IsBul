/**
 * İşBul Mobile Navigation
 * Bottom Nav Bar + Drawer Menu
 */
(function () {
  'use strict';

  // Sadece mobilde çalış
  function isMobile() {
    return window.innerWidth <= 768;
  }

  // Hangi sayfadayız?
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // ─── BOTTOM NAVIGATION OLUŞTUR ─────────────────────────
  function createBottomNav() {
    if (document.getElementById('mobile-bottom-nav')) return;

    const isLoggedIn = !!localStorage.getItem('isbul_jwt');
    const authUser   = JSON.parse(localStorage.getItem('isbul_auth') || 'null');

    const nav = document.createElement('nav');
    nav.id = 'mobile-bottom-nav';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Alt navigasyon');

    // Aktif sayfa kontrolü
    function isActive(page) {
      return currentPage === page ? 'active' : '';
    }

    nav.innerHTML = `
      <!-- Ana Sayfa -->
      <a href="/index.html" class="bottom-nav-item ${isActive('index.html')}" aria-label="Ana Sayfa">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="${isActive('index.html') ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9,22 9,12 15,12 15,22"></polyline>
        </svg>
        <span>Ana Sayfa</span>
      </a>

      <!-- Uzmanlar -->
      <a href="/uzmanlar.html" class="bottom-nav-item ${isActive('uzmanlar.html')}" aria-label="Uzmanlar">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="${isActive('uzmanlar.html') ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <span>Uzmanlar</span>
      </a>

      <!-- ORTA - Arama (CTA) -->
      <a href="/uzmanlar.html" class="bottom-nav-item center-btn" aria-label="Uzman Ara">
        <div class="nav-icon-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <span>Ara</span>
      </a>

      <!-- Hizmetler -->
      <a href="/hizmetler.html" class="bottom-nav-item ${isActive('hizmetler.html')}" aria-label="Hizmetler">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="${isActive('hizmetler.html') ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
        <span>Hizmetler</span>
      </a>

      <!-- Profil / Menü -->
      <button class="bottom-nav-item ${isActive('profil.html')}" id="bottom-nav-menu" aria-label="Menü">
        ${isLoggedIn && authUser ? `
          <div style="width:28px;height:28px;border-radius:8px;background:${authUser.color || '#6C63FF'};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:white;">
            ${authUser.avatar || authUser.firstName?.charAt(0) || 'U'}
          </div>
        ` : `
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        `}
        <span>${isLoggedIn ? 'Profil' : 'Menü'}</span>
      </button>
    `;

    document.body.appendChild(nav);

    // Menü butonuna drawer aç
    document.getElementById('bottom-nav-menu')?.addEventListener('click', openDrawer);
  }

  // ─── DRAWER MENU OLUŞTUR ────────────────────────────────
  function createDrawer() {
    if (document.getElementById('mobile-drawer')) return;

    const isLoggedIn = !!localStorage.getItem('isbul_jwt');
    const authUser   = JSON.parse(localStorage.getItem('isbul_auth') || 'null');
    const isExpert   = authUser?.isExpert;

    const drawer = document.createElement('div');
    drawer.id = 'mobile-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', 'Navigasyon menüsü');

    drawer.innerHTML = `
      <div id="mobile-drawer-overlay"></div>
      <div id="mobile-drawer-panel">
        <!-- Header -->
        <div class="drawer-header">
          <a href="/index.html" class="drawer-logo">
            <span style="font-size:20px;">⚡</span>
            <span>İşBul</span>
          </a>
          <button class="drawer-close" id="drawer-close-btn" aria-label="Kapat">✕</button>
        </div>

        <!-- Kullanıcı Bilgisi -->
        ${isLoggedIn && authUser ? `
          <div class="drawer-user">
            <div class="drawer-user-avatar" style="background:${authUser.color || '#6C63FF'}">
              ${authUser.avatar || authUser.firstName?.charAt(0) || 'U'}
            </div>
            <div class="drawer-user-info">
              <strong>${authUser.firstName || ''} ${authUser.lastName || ''}</strong>
              <span>${authUser.email || ''}</span>
            </div>
          </div>
        ` : `
          <div class="drawer-user" style="gap:0;flex-direction:column;align-items:flex-start;">
            <p style="color:rgba(255,255,255,0.6);font-size:13px;margin-bottom:10px;">Giriş yaparak tüm özelliklere erişin</p>
          </div>
        `}

        <!-- Navigasyon -->
        <nav class="drawer-nav">
          <a href="/index.html" class="drawer-nav-item ${currentPage === 'index.html' ? 'active' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
            Ana Sayfa
          </a>
          <a href="/uzmanlar.html" class="drawer-nav-item ${currentPage === 'uzmanlar.html' ? 'active' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Uzmanlar
          </a>
          <a href="/hizmetler.html" class="drawer-nav-item ${currentPage === 'hizmetler.html' ? 'active' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            Hizmetler
          </a>
          <a href="/nasil-calisir.html" class="drawer-nav-item ${currentPage === 'nasil-calisir.html' ? 'active' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Nasıl Çalışır?
          </a>
          <a href="/blog.html" class="drawer-nav-item ${currentPage === 'blog.html' ? 'active' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Blog
          </a>
          <a href="/hakkimizda.html" class="drawer-nav-item ${currentPage === 'hakkimizda.html' ? 'active' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Hakkımızda
          </a>

          <div class="drawer-divider"></div>

          ${isLoggedIn ? `
            <a href="/profil.html" class="drawer-nav-item ${currentPage === 'profil.html' ? 'active' : ''}">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Profilim
            </a>
            ${isExpert ? `
              <a href="/uzman-panel.html" class="drawer-nav-item ${currentPage === 'uzman-panel.html' ? 'active' : ''}">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                Uzman Paneli
              </a>
            ` : `
              <a href="/uzman-ol.html" class="drawer-nav-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Uzman Ol
              </a>
            `}
            <div class="drawer-divider"></div>
            <button class="drawer-nav-item" id="drawer-logout-btn" style="color:#ef4444;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Çıkış Yap
            </button>
          ` : ''}
        </nav>

        <!-- Footer Butonlar (login yoksa) -->
        ${!isLoggedIn ? `
          <div class="drawer-footer">
            <a href="/create-account.html" class="drawer-btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              Ücretsiz Kaydol
            </a>
            <a href="javascript:void(0)" onclick="document.getElementById('loginModal')?.classList.add('active'); document.getElementById('mobile-drawer').classList.remove('open');" class="drawer-btn-secondary">
              Giriş Yap
            </a>
          </div>
        ` : ''}
      </div>
    `;

    document.body.appendChild(drawer);

    // Event listeners
    document.getElementById('mobile-drawer-overlay')?.addEventListener('click', closeDrawer);
    document.getElementById('drawer-close-btn')?.addEventListener('click', closeDrawer);

    document.getElementById('drawer-logout-btn')?.addEventListener('click', () => {
      localStorage.removeItem('isbul_jwt');
      localStorage.removeItem('isbul_auth');
      closeDrawer();
      window.location.href = '/index.html';
    });

    // Swipe to close (sağdan sola swipe)
    let startX = 0;
    const panel = document.getElementById('mobile-drawer-panel');
    panel?.addEventListener('touchstart', e => { startX = e.touches[0].clientX; });
    panel?.addEventListener('touchend', e => {
      const diff = e.changedTouches[0].clientX - startX;
      if (diff > 60) closeDrawer();
    });
  }

  function openDrawer() {
    const drawer = document.getElementById('mobile-drawer');
    if (drawer) {
      drawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    const drawer = document.getElementById('mobile-drawer');
    if (drawer) {
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  // ─── HAMBURGER MENU BUTONU EKLE ─────────────────────────
  function addHamburgerToNavbar() {
    const navbar = document.querySelector('.navbar__inner, .navbar .container');
    if (!navbar) return;
    if (document.querySelector('.navbar__hamburger')) return;

    const hamburger = document.createElement('button');
    hamburger.className = 'navbar__hamburger';
    hamburger.setAttribute('aria-label', 'Menüyü aç');
    hamburger.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    `;
    hamburger.addEventListener('click', openDrawer);
    navbar.appendChild(hamburger);
  }

  // ─── INIT ───────────────────────────────────────────────
  function init() {
    if (!isMobile()) return;

    createBottomNav();
    createDrawer();
    addHamburgerToNavbar();

    // Resize'da tekrar kontrol
    window.addEventListener('resize', () => {
      if (isMobile()) {
        if (!document.getElementById('mobile-bottom-nav')) {
          createBottomNav();
          createDrawer();
          addHamburgerToNavbar();
        }
      }
    });
  }

  // DOM hazır olunca başlat
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Global erişim
  window.IsbulMobileNav = { open: openDrawer, close: closeDrawer };
})();
