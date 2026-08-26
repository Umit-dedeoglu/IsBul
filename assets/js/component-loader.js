/**
 * Component Loader
 * 
 * HTML component'lerini fetch ederek sayfaya yükler.
 * Endpoint yaklaşımı: Tek kaynak, tüm sayfalar aynı component'i kullanır.
 * 
 * Yüklenen component'ler:
 *  - /components/auth-modal.html  → body sonuna eklenir
 *  - /components/navbar.html      → id="navbar" elementinin yerine geçer
 *  - /components/footer.html      → id="footer-container" elementine eklenir
 */

(function () {
  'use strict';

  // ─── AUTH MODAL ──────────────────────────────────────────────────────────────

  async function loadAuthModal() {
    try {
      const response = await fetch('/components/auth-modal.html');
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const html = await response.text();

      let container = document.getElementById('modal-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'modal-container';
        document.body.appendChild(container);
      }

      container.innerHTML = html;
      initAuthModalEvents();
      console.log('✅ Auth modal loaded');
    } catch (err) {
      console.error('❌ Auth modal load failed:', err);
    }
  }

  function initAuthModalEvents() {
    const closeBtn = document.getElementById('authModalClose');
    if (closeBtn) closeBtn.addEventListener('click', function () { window.closeAuthModal && window.closeAuthModal(); });

    const overlay = document.getElementById('authModal');
    if (overlay) overlay.addEventListener('click', function (e) {
      if (e.target === overlay) { window.closeAuthModal && window.closeAuthModal(); }
    });

    document.querySelectorAll('.auth-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        if (tab.dataset.tab && window._switchAuthTab) window._switchAuthTab(tab.dataset.tab);
      });
    });
  }

  // ─── NAVBAR ──────────────────────────────────────────────────────────────────

  async function loadNavbar() {
    // Sayfada zaten navbar var mı kontrol et — varsa component yükleme
    if (document.getElementById('navbar')) return;

    // Placeholder container ara
    const placeholder = document.getElementById('navbar-container');
    if (!placeholder) return;

    try {
      const response = await fetch('/components/navbar.html');
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const html = await response.text();

      placeholder.outerHTML = html;
      setActiveNavLink();
      updateExpertNavLink();
      // Navbar DOM'a eklendikten sonra app.js'deki auth state'i yeniden tetikle
      // Bu sayede giriş yapılmışsa navbar butonları güncellenir
      if (typeof window._initAuthState === 'function') {
        window._initAuthState();
      }
      // Feather icons'ı yeniden render et (navbar ikonları için)
      if (typeof feather !== 'undefined') {
        feather.replace();
      }
      console.log('✅ Navbar loaded');
    } catch (err) {
      console.error('❌ Navbar load failed:', err);
    }
  }

  /**
   * Mevcut sayfanın URL'ine göre navbar linkini aktif işaretle.
   * Her sayfada inline style yerine bu fonksiyon halleder.
   */
  function setActiveNavLink() {
    var page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('#navLinks [data-nav]').forEach(function (link) {
      if (page.indexOf(link.dataset.nav) !== -1) {
        link.style.color = '#6C63FF';
        link.style.fontWeight = '700';
      } else {
        link.style.color = 'rgba(255,255,255,0.85)';
        link.style.fontWeight = '500';
      }
    });
  }

  /**
   * Session'a göre 3. navbar linkini güncelle:
   * - Uzman veya admin ise → "Uzman Panelim" → uzman-panel.html
   * - Değilse → "Uzman Ol" → uzman-ol.html (varsayılan, değişmez)
   * 
   * app.js'deki getSession() yüklendikten sonra çalışması için
   * kısa bir gecikmeyle çağrılır.
   */
  function updateExpertNavLink() {
    var link = document.getElementById('navExpertLink');
    if (!link) return;

    // getSession app.js'de tanımlı, yüklenmiş olması lazım
    if (typeof getSession !== 'function') {
      // app.js henüz yüklenmediyse biraz bekle
      setTimeout(updateExpertNavLink, 100);
      return;
    }

    var session = getSession();
    if (session && (session.isExpert || session.role === 'admin')) {
      link.textContent = 'Uzman Panelim';
      link.href = 'uzman-panel.html';
      link.dataset.nav = 'uzman-panel';
    }
    // Uzman değilse zaten "Uzman Ol" olarak kalır
  }

  // ─── FOOTER ──────────────────────────────────────────────────────────────────

  async function loadFooter() {
    // Sayfada zaten footer var mı kontrol et — varsa component yükleme
    if (document.querySelector('footer.footer')) return;

    const placeholder = document.getElementById('footer-container');
    if (!placeholder) return;

    try {
      const response = await fetch('/components/footer.html');
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const html = await response.text();

      placeholder.outerHTML = html;
      console.log('✅ Footer loaded');
    } catch (err) {
      console.error('❌ Footer load failed:', err);
    }
  }

  // ─── BAŞLAT ──────────────────────────────────────────────────────────────────

  function init() {
    loadAuthModal();
    loadNavbar();
    loadFooter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
