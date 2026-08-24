/**
 * İşBul – Analytics (Google Analytics 4 + Fallback)
 * - Google Analytics 4 (GA4) entegrasyonu
 * - Environment variable ile tracking ID kontrolü
 * - Fallback: console logları (tracking ID yoksa)
 */

(function() {
  'use strict';

  // Google Analytics 4 Measurement ID (production'da environment variable'dan gelecek)
  // Şimdilik placeholder - backend'den veya config'den çekilecek
  const GA_MEASUREMENT_ID = window.GA_MEASUREMENT_ID || null; // Örn: 'G-XXXXXXXXXX'

  // Google Analytics yüklü mü?
  let gaLoaded = false;

  // Google Analytics 4 yükle
  function loadGA4() {
    if (!GA_MEASUREMENT_ID) {
      console.log('%c[Analytics] Google Analytics ID bulunamadı. Fallback mode.', 'color:#f59e0b;font-weight:600');
      return;
    }

    // gtag.js script'i ekle
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // gtag fonksiyonunu tanımla
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      page_path: window.location.pathname,
      send_page_view: true
    });

    gaLoaded = true;
    console.log('%c[Analytics] Google Analytics 4 yüklendi:', 'color:#10b981;font-weight:600', GA_MEASUREMENT_ID);
  }

  // Sayfa görüntüleme kaydı
  function trackPageView() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const ref  = document.referrer || 'direct';

    if (gaLoaded && window.gtag) {
      // Google Analytics'e gönder
      gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
      });
      console.log('%c[Analytics] GA4 Page View:', 'color:#6C63FF;font-weight:600', page);
    } else {
      // Fallback: console log
      console.log('%c[Analytics] Sayfa görüntülendi:', 'color:#6C63FF;font-weight:600', page, '| referrer:', ref);
    }
  }

  // Etkinlik kaydı (buton tıklama, form submit vb.)
  function trackEvent(category, action, label, value) {
    if (gaLoaded && window.gtag) {
      // Google Analytics'e gönder
      gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
      console.log('%c[Analytics] GA4 Event:', 'color:#10b981;font-weight:600', { category, action, label, value });
    } else {
      // Fallback: console log
      console.log('%c[Analytics] Etkinlik:', 'color:#10b981;font-weight:600', { category, action, label, value });
    }
  }

  // Conversion tracking (rezervasyon tamamlandı vb.)
  function trackConversion(conversionName, value, currency = 'TRY') {
    if (gaLoaded && window.gtag) {
      gtag('event', 'conversion', {
        send_to: `${GA_MEASUREMENT_ID}/${conversionName}`,
        value: value,
        currency: currency
      });
      console.log('%c[Analytics] Conversion:', 'color:#ef4444;font-weight:600', conversionName, value, currency);
    } else {
      console.log('%c[Analytics] Conversion:', 'color:#ef4444;font-weight:600', { conversionName, value, currency });
    }
  }

  // Global erişim
  window.IsbulAnalytics = { 
    trackPageView, 
    trackEvent,
    trackConversion,
    setUserId: (userId) => {
      if (gaLoaded && window.gtag) {
        gtag('set', 'user_id', userId);
        console.log('%c[Analytics] User ID set:', 'color:#8b5cf6;font-weight:600', userId);
      }
    }
  };

  // Google Analytics'i yükle
  loadGA4();

  // Sayfa yüklenince otomatik çalıştır
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackPageView);
  } else {
    trackPageView();
  }

  // SPA (Single Page App) için history değişikliklerini izle
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function() {
    originalPushState.apply(this, arguments);
    trackPageView();
  };

  history.replaceState = function() {
    originalReplaceState.apply(this, arguments);
    trackPageView();
  };

  window.addEventListener('popstate', trackPageView);
})();
