/**
 * Component Loader
 * 
 * HTML component'lerini fetch ederek sayfaya yükler.
 * Endpoint yaklaşımı: Tek kaynak, tüm sayfalar aynı component'i kullanır.
 */

/**
 * Auth modal component'ini yükle
 * Tüm sayfalar bu fonksiyonu çağırır
 */
async function loadAuthModal() {
  try {
    // Component'i fetch et
    const response = await fetch('/components/auth-modal.html');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Modal container oluştur veya kullan
    let container = document.getElementById('modal-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'modal-container';
      document.body.appendChild(container);
    }
    
    // Modal HTML'ini ekle
    container.innerHTML = html;
    
    console.log('✅ Auth modal loaded from component');
    
    // Modal event listener'ları başlat
    initAuthModalEvents();
    
  } catch (error) {
    console.error('❌ Auth modal loading failed:', error);
    
    // Fallback: Hata durumunda basit bir mesaj göster
    showToast('Modal yüklenemedi. Lütfen sayfayı yenileyin.', 'error');
  }
}

/**
 * Modal event listener'ları başlat
 */
function initAuthModalEvents() {
  // Close button
  const closeBtn = document.getElementById('authModalClose');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.closeAuthModal();
    });
  }
  
  // Overlay click (modal dışı)
  const overlay = document.getElementById('authModal');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        window.closeAuthModal();
      }
    });
  }
  
  // Tab switching
  const tabs = document.querySelectorAll('.auth-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      if (tabName) {
        window._switchAuthTab(tabName);
      }
    });
  });
  
  console.log('✅ Auth modal events initialized');
}

/**
 * Sayfa yüklendiğinde modal'ı otomatik yükle
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAuthModal);
} else {
  loadAuthModal();
}
