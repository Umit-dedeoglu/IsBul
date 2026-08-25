"""
🚀 HIZLI TEST - AI olmadan Layer 1 + 2
Facebook butonlarını bulur, screenshot alır
"""

import asyncio
from datetime import datetime
from pathlib import Path
from playwright.async_api import async_playwright
import json

class QuickTester:
    def __init__(self):
        self.results = []
        self.screenshot_dir = Path('quick_test_screenshots')
        self.screenshot_dir.mkdir(exist_ok=True)
        
        self.pages = [
            'index.html', 'uzmanlar.html', 'uzman-profil.html', 
            'uzman-ol.html', 'uzman-panel.html', 'profil.html',
            'admin-panel.html', 'blog.html', 'hakkimizda.html',
            'hizmetler.html', 'nasil-calisir.html', 'gizlilik.html',
            'kvkk.html', 'sartlar.html', 'create-account.html',
            'forgot-password.html', 'reset-password.html'
        ]
    
    async def test_page(self, page, page_name):
        """Tek sayfa testi"""
        url = f'https://isbul.online/{page_name}'
        result = {
            'page': page_name,
            'url': url,
            'facebook_button': False,
            'facebook_modal': False,
            'admin_panel_ok': True,
            'footer_ok': True,
            'http_status': None,
            'issues': []
        }
        
        try:
            # Sayfaya git
            response = await page.goto(url, wait_until='networkidle', timeout=15000)
            result['http_status'] = response.status if response else None
            
            # HTTP error
            if response and response.status >= 400:
                result['issues'].append(f'❌ HTTP {response.status} error')
            
            # Facebook butonu (HTML)
            fb_count = await page.locator('button[onclick*="facebook"], button[onclick*="Facebook"]').count()
            if fb_count > 0:
                result['facebook_button'] = True
                result['issues'].append(f'❌ {fb_count} Facebook butonu bulundu!')
                
                # Butonun HTML'ini al
                buttons = await page.locator('button[onclick*="facebook"], button[onclick*="Facebook"]').all()
                for i, btn in enumerate(buttons[:2]):  # İlk 2 buton
                    html = await btn.inner_html()
                    result['issues'].append(f'   → Buton {i+1}: {html[:100]}')
            
            # Modal içinde Facebook
            modal_fb = await page.locator('#loginModal button[onclick*="facebook"], #loginModal button[onclick*="Facebook"]').count()
            if modal_fb > 0:
                result['facebook_modal'] = True
                result['issues'].append(f'❌ Modal içinde {modal_fb} Facebook butonu!')
            
            # Admin panel
            if page_name == 'admin-panel.html':
                admin = await page.locator('.admin-container, #adminPanel, .admin-content, .admin-panel').count()
                if admin == 0:
                    result['admin_panel_ok'] = False
                    result['issues'].append('⚠️ Admin panel container bulunamadı')
            
            # Footer
            footer = await page.locator('footer, .footer').count()
            if footer == 0:
                result['footer_ok'] = False
                result['issues'].append('⚠️ Footer bulunamadı')
            
            # Screenshot
            screenshot_path = self.screenshot_dir / f"{page_name.replace('.html', '')}.png"
            await page.screenshot(path=str(screenshot_path), full_page=True)
            result['screenshot'] = str(screenshot_path)
            
            # Başarı mesajı
            if not result['issues']:
                result['issues'].append('✅ Tüm kontroller başarılı')
                
        except Exception as e:
            result['issues'].append(f'❌ Hata: {str(e)}')
        
        return result
    
    async def run(self):
        """Tüm testleri çalıştır"""
        print("\n" + "="*70)
        print(" 🚀 HIZLI TEST SİSTEMİ (Layer 1 + 2)".center(70))
        print("="*70 + "\n")
        
        print(f"📋 {len(self.pages)} sayfa test edilecek...")
        print(f"🎯 Facebook butonu aranıyor...")
        print(f"📸 Screenshot'lar alınıyor...\n")
        
        start_time = datetime.now()
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                bypass_csp=True,
                ignore_https_errors=True
            )
            page = await context.new_page()
            
            # Cache'i temizle
            await context.clear_cookies()
            
            for i, page_name in enumerate(self.pages, 1):
                print(f"[{i:2}/{len(self.pages)}] {page_name:30}", end=' ')
                
                result = await self.test_page(page, page_name)
                self.results.append(result)
                
                # Sonucu göster
                if result['facebook_button'] or result['facebook_modal']:
                    print("🔴 FACEBOOK BULUNDU!")
                elif result['issues'] and '❌' in str(result['issues']):
                    print("⚠️  Sorun var")
                else:
                    print("✅ OK")
                
                # Detayları göster
                for issue in result['issues']:
                    if '❌' in issue or '⚠️' in issue:
                        print(f"     {issue}")
                
                await asyncio.sleep(0.3)  # Rate limit
            
            await browser.close()
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        # Özet
        self.print_summary(duration)
    
    def print_summary(self, duration):
        """Özet rapor"""
        print("\n" + "="*70)
        print(" 📊 TEST ÖZETİ".center(70))
        print("="*70 + "\n")
        
        facebook_pages = [
            r['page'] for r in self.results 
            if r['facebook_button'] or r['facebook_modal']
        ]
        
        error_pages = [
            r['page'] for r in self.results
            if any('❌' in str(i) for i in r['issues'])
        ]
        
        warning_pages = [
            r['page'] for r in self.results
            if any('⚠️' in str(i) for i in r['issues']) and r['page'] not in error_pages
        ]
        
        passed = len(self.results) - len(error_pages) - len(warning_pages)
        
        print(f"📊 Sonuçlar:")
        print(f"   • Toplam Sayfa:     {len(self.results)}")
        print(f"   • ✅ Başarılı:      {passed}")
        print(f"   • ⚠️  Uyarı:         {len(warning_pages)}")
        print(f"   • ❌ Hatalı:        {len(error_pages)}")
        print(f"   • ⏱️  Süre:          {duration:.1f} saniye")
        
        if facebook_pages:
            print(f"\n🔴 KRİTİK: Facebook Butonu Bulunan Sayfalar:")
            for page in facebook_pages:
                print(f"   • {page}")
                # Detayları göster
                page_result = next(r for r in self.results if r['page'] == page)
                for issue in page_result['issues']:
                    if 'Facebook' in issue or 'facebook' in issue:
                        print(f"     {issue}")
        else:
            print(f"\n✅ Facebook butonu HİÇBİR sayfada bulunamadı!")
        
        if error_pages and not facebook_pages:
            print(f"\n⚠️  Diğer Sorunlar:")
            for page in error_pages:
                print(f"   • {page}")
        
        # JSON kaydet
        report_file = f'quick_test_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'duration': duration,
                'total_pages': len(self.results),
                'facebook_pages': facebook_pages,
                'results': self.results
            }, f, indent=2, ensure_ascii=False)
        
        print(f"\n📄 Detaylı Rapor: {report_file}")
        print(f"📸 Screenshots:   {self.screenshot_dir}/")
        
        print("\n" + "="*70)
        print(" ✨ TEST TAMAMLANDI!".center(70))
        print("="*70 + "\n")

async def main():
    tester = QuickTester()
    await tester.run()

if __name__ == '__main__':
    asyncio.run(main())
