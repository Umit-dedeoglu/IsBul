/* ============================================================
   COMPONENT LOADER — Merkezi component'leri yükler
   ============================================================ */

(function() {
  'use strict';

  /**
   * HTML component'ini yükler ve belirtilen container'a ekler
   * @param {string} componentPath - Component dosya yolu (örn: 'components/auth-modal.html')
   * @param {string} containerId - İçeriğin ekleneceği element ID (boşsa body'ye ekler)
   */
  async function loadComponent(componentPath, containerId = null) {
    try {
      const response = await fetch(componentPath);
      if (!response.ok) {
        throw new Error(`Component yüklenemedi: ${componentPath} (${response.status})`);
      }
      
      const html = await response.text();
      
      if (containerId) {
        const container = document.getElementById(containerId);
        if (container) {
          container.innerHTML = html;
        } else {
          console.warn(`Container bulunamadı: #${containerId}, body'ye ekleniyor`);
          document.body.insertAdjacentHTML('beforeend', html);
        }
      } else {
        document.body.insertAdjacentHTML('beforeend', html);
      }
      
      console.log(`✅ Component yüklendi: ${componentPath}`);
      return true;
    } catch (error) {
      console.error(`❌ Component yükleme hatası:`, error);
      return false;
    }
  }

  /**
   * Tüm gerekli component'leri yükler
   */
  async function loadAllComponents() {
    const components = [
      { path: 'components/auth-modal.html', container: null }
    ];

    const promises = components.map(comp => 
      loadComponent(comp.path, comp.container)
    );

    await Promise.all(promises);
    
    // Component'ler yüklendikten sonra event dispatch et
    document.dispatchEvent(new CustomEvent('componentsLoaded'));
    console.log('✅ Tüm component\'ler yüklendi');
  }

  // Sayfa yüklendiğinde component'leri yükle
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAllComponents);
  } else {
    loadAllComponents();
  }

  // Global olarak expose et
  window.loadComponent = loadComponent;
  window.loadAllComponents = loadAllComponents;
})();
