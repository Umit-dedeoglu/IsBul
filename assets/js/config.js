/**
 * İşBul - Global Configuration
 * Tüm backend URL'leri, API endpoint'leri ve sabitler burada tanımlı
 */

(function() {
  'use strict';

  const hostname = window.location.hostname;
  
  // Backend URL belirleme - production/development otomatik algıla
  function getBackendUrl() {
    // Localhost/development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    
    // Production domain
    if (hostname === 'isbul.online' || hostname === 'www.isbul.online') {
      return 'https://isbul-backend.onrender.com';
    }
    
    // Fallback: api subdomain
    return `https://api.${hostname}`;
  }

  // Global config objesi
  window.ISBUL_CONFIG = {
    // Backend
    backendUrl: getBackendUrl(),
    apiVersion: 'v1',
    
    // Google Analytics
    googleAnalyticsId: 'G-S3MDEB0WGP',
    
    // Frontend
    frontendUrl: window.location.origin,
    
    // API Endpoints (convenience)
    endpoints: {
      health: '/api/health',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      experts: '/api/v1/experts',
      bookings: '/api/v1/bookings',
      calendar: '/api/v1/calendar',
      reviews: '/api/v1/reviews',
      notifications: '/api/v1/notifications',
      admin: '/api/v1/admin',
      chatbot: '/api/v1/chatbot',
    },
    
    // OAuth
    oauth: {
      google: {
        returnUrlKey: 'oauth_return_url',
      },
    },
    
    // Storage Keys
    storageKeys: {
      auth: 'isbul_auth',
      jwt: 'isbul_jwt',
      usersDb: 'isbul_users_db',
      bookingsDb: 'isbul_bookings_db',
      zoom: 'isbul_zoom_level',
    },
    
    // App Settings
    settings: {
      isDevelopment: hostname === 'localhost' || hostname === '127.0.0.1',
      isProduction: hostname === 'isbul.online' || hostname === 'www.isbul.online',
    },
  };

  // Convenience getter
  window.ISBUL_CONFIG.getApiUrl = function(endpoint) {
    return this.backendUrl + (endpoint || '/api/v1');
  };

  // Keep-alive: production'da backend'i arka planda uyandır
  // Render free tier 15 dakika boşta kalınca uyuyor, bu ping cold start'ı önler
  if (window.ISBUL_CONFIG.settings.isProduction) {
    function pingBackend() {
      fetch(window.ISBUL_CONFIG.backendUrl + '/api/health', {
        method: 'GET',
        cache: 'no-store',
      }).catch(function() {}); // Sessizce başarısız ol
    }

    // Sayfa yüklenince hemen bir kez pingla (arka planda, kullanıcıyı bloke etme)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', pingBackend);
    } else {
      pingBackend();
    }

    // Her 14 dakikada bir tekrarla (Render 15 dakikada uyutuyor)
    setInterval(pingBackend, 14 * 60 * 1000);
  }

  console.log('%cİşBul Config Loaded', 'color:#6C63FF;font-weight:700', {
    backend: window.ISBUL_CONFIG.backendUrl,
    mode: window.ISBUL_CONFIG.settings.isDevelopment ? 'development' : 'production',
  });
})();
