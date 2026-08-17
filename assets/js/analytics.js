/**
 * İşBul – Analytics (Hafif Sayfa Takibi)
 * Gerçek bir analitik servisi bağlanana kadar console logları ile çalışır.
 * Hiçbir dış servise veri göndermez, hata da vermez.
 */

(function() {
  'use strict';

  // Sayfa görüntüleme kaydı
  function trackPageView() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const ref  = document.referrer || 'direct';
    console.log('%c[Analytics] Sayfa görüntülendi:', 'color:#6C63FF;font-weight:600', page, '| referrer:', ref);
  }

  // Etkinlik kaydı (buton tıklama vb.)
  function trackEvent(category, action, label) {
    console.log('%c[Analytics] Etkinlik:', 'color:#10b981;font-weight:600', { category, action, label });
  }

  // Global erişim
  window.IsbulAnalytics = { trackPageView, trackEvent };

  // Sayfa yüklenince otomatik çalıştır
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackPageView);
  } else {
    trackPageView();
  }
})();
