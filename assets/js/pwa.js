/**
 * İşBul PWA Manager
 * Service Worker kaydı, install prompt, offline bildirimleri
 */

(function() {
  'use strict';

  // ─── SERVICE WORKER KAYIT ─────────────────────────────────
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        console.log('[PWA] Service Worker kayıtlı:', reg.scope);

        // Güncelleme kontrolü
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateBanner();
            }
          });
        });
      } catch (err) {
        console.warn('[PWA] Service Worker kayıt hatası:', err);
      }
    });
  }

  // ─── INSTALL PROMPT ───────────────────────────────────────
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // 3 saniye sonra install banner göster
    setTimeout(() => showInstallBanner(), 3000);
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] Uygulama yüklendi!');
    deferredPrompt = null;
    hideInstallBanner();
    
    // Kurulum analitik
    if (window.IsbulAnalytics) {
      window.IsbulAnalytics.track('pwa_installed');
    }
  });

  // ─── INSTALL BANNER ───────────────────────────────────────
  function showInstallBanner() {
    // Zaten kuruluysa gösterme
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (localStorage.getItem('pwa_install_dismissed')) return;
    if (!deferredPrompt) return;

    const existing = document.getElementById('pwa-install-banner');
    if (existing) return;

    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML = `
      <div class="pwa-banner-content">
        <div class="pwa-banner-icon">
          <img src="/assets/img/icon.svg" alt="İşBul" width="40" height="40">
        </div>
        <div class="pwa-banner-text">
          <strong>İşBul'u Yükle</strong>
          <span>Ana ekrana ekle, daha hızlı aç</span>
        </div>
        <button class="pwa-banner-install" id="pwa-install-btn">Yükle</button>
        <button class="pwa-banner-close" id="pwa-dismiss-btn">✕</button>
      </div>
    `;

    Object.assign(banner.style, {
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      color: 'white',
      padding: '12px 16px',
      zIndex: '99999',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
      borderTop: '1px solid rgba(108,99,255,0.3)',
      fontFamily: 'Inter, sans-serif',
      animation: 'slideUp 0.3s ease'
    });

    // CSS ekle
    if (!document.getElementById('pwa-styles')) {
      const style = document.createElement('style');
      style.id = 'pwa-styles';
      style.textContent = `
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slideDown { from { transform: translateY(0); } to { transform: translateY(100%); } }
        .pwa-banner-content { display: flex; align-items: center; gap: 12px; max-width: 600px; margin: 0 auto; }
        .pwa-banner-icon { flex-shrink: 0; }
        .pwa-banner-icon img { border-radius: 10px; }
        .pwa-banner-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .pwa-banner-text strong { font-size: 14px; font-weight: 700; }
        .pwa-banner-text span { font-size: 12px; opacity: 0.8; }
        .pwa-banner-install { 
          background: #6C63FF; color: white; border: none; 
          padding: 8px 16px; border-radius: 20px; font-size: 13px; 
          font-weight: 600; cursor: pointer; white-space: nowrap;
          transition: all 0.2s;
        }
        .pwa-banner-install:hover { background: #5a52e0; transform: scale(1.05); }
        .pwa-banner-close { 
          background: none; border: none; color: rgba(255,255,255,0.6); 
          font-size: 18px; cursor: pointer; padding: 4px; line-height: 1;
        }
        .pwa-banner-close:hover { color: white; }
        
        /* Offline indicator */
        #pwa-offline-bar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 99999;
          background: #dc2626; color: white; text-align: center;
          padding: 8px; font-size: 13px; font-weight: 600;
          transform: translateY(-100%); transition: transform 0.3s;
        }
        #pwa-offline-bar.visible { transform: translateY(0); }
        
        /* Update banner */
        #pwa-update-banner {
          position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
          background: #1e293b; color: white; padding: 12px 20px;
          border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.4);
          z-index: 99998; display: flex; gap: 12px; align-items: center;
          font-size: 13px; font-family: Inter, sans-serif;
        }
        #pwa-update-banner button { 
          background: #6C63FF; color: white; border: none;
          padding: 6px 12px; border-radius: 8px; cursor: pointer;
          font-weight: 600; font-size: 12px;
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(banner);

    document.getElementById('pwa-install-btn').addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA] Install outcome:', outcome);
      deferredPrompt = null;
      hideInstallBanner();
    });

    document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
      localStorage.setItem('pwa_install_dismissed', '1');
      hideInstallBanner();
    });
  }

  function hideInstallBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.style.animation = 'slideDown 0.3s ease forwards';
      setTimeout(() => banner.remove(), 300);
    }
  }

  // ─── UPDATE BANNER ────────────────────────────────────────
  function showUpdateBanner() {
    const banner = document.createElement('div');
    banner.id = 'pwa-update-banner';
    banner.innerHTML = `
      <span>🔄 Yeni sürüm mevcut!</span>
      <button onclick="window.location.reload()">Güncelle</button>
    `;
    document.body.appendChild(banner);
  }

  // ─── OFFLINE / ONLINE GÖSTERGESI ─────────────────────────
  function showOfflineBar() {
    let bar = document.getElementById('pwa-offline-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'pwa-offline-bar';
      bar.textContent = '📡 İnternet bağlantısı yok - Çevrimdışı mod';
      document.body.prepend(bar);
    }
    setTimeout(() => bar.classList.add('visible'), 10);
    document.body.style.paddingTop = '38px';
  }

  function hideOfflineBar() {
    const bar = document.getElementById('pwa-offline-bar');
    if (bar) {
      bar.classList.remove('visible');
      document.body.style.paddingTop = '';
      setTimeout(() => bar.remove(), 300);
    }
  }

  window.addEventListener('offline', showOfflineBar);
  window.addEventListener('online', () => {
    hideOfflineBar();
    // Sayfayı yenilemeden içeriği güncelle
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SYNC' });
    }
  });

  // Sayfa yüklendiğinde offline mu kontrol et
  if (!navigator.onLine) showOfflineBar();

  // ─── iOS PWA DESTEĞI ──────────────────────────────────────
  // iOS'ta 'beforeinstallprompt' yok, ayrı banner göster
  const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  if (isIos && !isStandalone && !localStorage.getItem('ios_install_dismissed')) {
    setTimeout(() => {
      const iosBanner = document.createElement('div');
      iosBanner.id = 'pwa-ios-banner';
      Object.assign(iosBanner.style, {
        position: 'fixed', bottom: '0', left: '0', right: '0',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        color: 'white', padding: '16px', zIndex: '99999',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
        fontFamily: 'Inter, sans-serif', fontSize: '13px',
        borderTop: '1px solid rgba(108,99,255,0.3)'
      });
      iosBanner.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
          <strong style="font-size:14px;">📱 İşBul'u Ana Ekrana Ekle</strong>
          <button onclick="this.closest('#pwa-ios-banner').remove(); localStorage.setItem('ios_install_dismissed','1')" 
                  style="background:none;border:none;color:rgba(255,255,255,0.7);font-size:18px;cursor:pointer;padding:0;">✕</button>
        </div>
        <p style="margin:0;opacity:0.85;line-height:1.5;">
          Safari'de <strong>Paylaş <span style="font-size:16px;">⬆</span></strong> butonuna, 
          sonra <strong>"Ana Ekrana Ekle"</strong> seçeneğine dokun.
        </p>
        <div style="margin-top:10px;border-top:1px solid rgba(255,255,255,0.15);padding-top:10px;text-align:center;opacity:0.6;font-size:11px;">
          Uygulama gibi tam ekran deneyim yaşa!
        </div>
      `;
      document.body.appendChild(iosBanner);
    }, 4000);
  }

  console.log('[PWA] İşBul PWA Manager yüklendi');
})();
