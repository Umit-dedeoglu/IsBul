"""
🚀 HİBRİT WEB TEST SİSTEMİ
3 Katmanlı test: Playwright → Visual → AI
Author: Kiro AI
Date: 2026-08-20
"""

import asyncio
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any
from playwright.async_api import async_playwright, Page
import google.generativeai as genai
from PIL import Image
import io

# Renkli çıktı için
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    END = '\033[0m'

class HybridTester:
    def __init__(self, api_key: str = None):
        """Hibrit test sistemini başlat"""
        self.api_key = api_key or os.getenv('GOOGLE_API_KEY')
        if not self.api_key:
            print(f"{Colors.RED}❌ GOOGLE_API_KEY bulunamadı!{Colors.END}")
            print(f"{Colors.YELLOW}💡 .env dosyasına GOOGLE_API_KEY ekleyin{Colors.END}")
            sys.exit(1)
        
        # Gemini yapılandır
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Sonuçlar
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'layer1_results': [],  # Playwright hızlı tarama
            'layer2_results': [],  # Visual check
            'layer3_results': [],  # AI deep analysis
            'summary': {}
        }
        
        # Test edilecek sayfalar
        self.pages = [
            'index.html',
            'uzmanlar.html',
            'uzman-profil.html',
            'uzman-ol.html',
            'uzman-panel.html',
            'profil.html',
            'admin-panel.html',
            'blog.html',
            'hakkimizda.html',
            'hizmetler.html',
            'nasil-calisir.html',
            'gizlilik.html',
            'kvkk.html',
            'sartlar.html',
            'create-account.html',
            'forgot-password.html',
            'reset-password.html'
        ]
        
        # Screenshot klasörü
        self.screenshot_dir = Path('test_screenshots')
        self.screenshot_dir.mkdir(exist_ok=True)
        
    def print_header(self, text: str):
        """Başlık yazdır"""
        print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.CYAN}{text:^60}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.END}\n")
    
    def print_layer(self, layer: int, name: str):
        """Katman başlığı"""
        emoji = ['🔍', '📸', '🤖'][layer - 1]
        print(f"\n{Colors.BOLD}{Colors.MAGENTA}{emoji} KATMAN {layer}: {name}{Colors.END}")
        print(f"{Colors.MAGENTA}{'─'*60}{Colors.END}\n")
    
    async def layer1_fast_scan(self, page: Page, url: str, page_name: str) -> Dict[str, Any]:
        """
        KATMAN 1: HIZLI TARAMA (Playwright)
        - Facebook butonu var mı?
        - Admin panel açılıyor mu?
        - Console errors
        - Temel selector kontrolleri
        """
        result = {
            'page': page_name,
            'url': url,
            'issues': [],
            'status': 'pass'
        }
        
        try:
            # Sayfaya git
            response = await page.goto(url, wait_until='networkidle', timeout=10000)
            
            # HTTP status kontrol
            if response and response.status >= 400:
                result['issues'].append({
                    'type': 'http_error',
                    'severity': 'critical',
                    'message': f'HTTP {response.status} error'
                })
                result['status'] = 'fail'
            
            # Facebook butonu kontrolü (HTML)
            facebook_buttons = await page.locator('button[onclick*="facebook"]').count()
            if facebook_buttons > 0:
                result['issues'].append({
                    'type': 'facebook_button',
                    'severity': 'critical',
                    'message': f'❌ Facebook login butonu bulundu! ({facebook_buttons} adet)',
                    'selector': 'button[onclick*="facebook"]'
                })
                result['status'] = 'fail'
            
            # Facebook butonu kontrolü (Modal içinde)
            modal_facebook = await page.locator('#loginModal button[onclick*="facebook"]').count()
            if modal_facebook > 0:
                result['issues'].append({
                    'type': 'facebook_button_modal',
                    'severity': 'critical',
                    'message': f'❌ Modal içinde Facebook butonu bulundu! ({modal_facebook} adet)',
                    'selector': '#loginModal button[onclick*="facebook"]'
                })
                result['status'] = 'fail'
            
            # Admin panel özel kontrolü
            if page_name == 'admin-panel.html':
                # Admin paneli açılıyor mu?
                panel_exists = await page.locator('.admin-container, #adminPanel, .admin-content').count()
                if panel_exists == 0:
                    result['issues'].append({
                        'type': 'admin_panel',
                        'severity': 'high',
                        'message': '⚠️ Admin panel container bulunamadı'
                    })
                    result['status'] = 'warning'
            
            # Footer kontrolü
            footer = await page.locator('footer, .footer').count()
            if footer == 0:
                result['issues'].append({
                    'type': 'footer_missing',
                    'severity': 'medium',
                    'message': '⚠️ Footer elementi bulunamadı'
                })
                if result['status'] == 'pass':
                    result['status'] = 'warning'
            
            # Console errors
            console_errors = []
            page.on('console', lambda msg: console_errors.append(msg.text) if msg.type == 'error' else None)
            
            await asyncio.sleep(1)  # Console errors için bekle
            
            if console_errors:
                result['issues'].append({
                    'type': 'console_errors',
                    'severity': 'low',
                    'message': f'⚠️ {len(console_errors)} console error',
                    'details': console_errors[:3]  # İlk 3 hata
                })
            
            # Başarılı
            if not result['issues']:
                result['message'] = '✅ Tüm kontroller başarılı'
                
        except Exception as e:
            result['issues'].append({
                'type': 'error',
                'severity': 'critical',
                'message': f'❌ Test hatası: {str(e)}'
            })
            result['status'] = 'error'
        
        return result
    
    async def layer2_visual_check(self, page: Page, page_name: str) -> Dict[str, Any]:
        """
        KATMAN 2: VISUAL CHECK (Screenshot)
        - Screenshot al
        - Baseline ile karşılaştır (opsiyonel)
        - Görsel doğrulama için kaydet
        """
        result = {
            'page': page_name,
            'screenshot': None,
            'status': 'pass'
        }
        
        try:
            # Screenshot al
            screenshot_path = self.screenshot_dir / f"{page_name.replace('.html', '')}.png"
            await page.screenshot(path=str(screenshot_path), full_page=True)
            result['screenshot'] = str(screenshot_path)
            result['message'] = f'✅ Screenshot kaydedildi: {screenshot_path}'
            
        except Exception as e:
            result['status'] = 'error'
            result['message'] = f'❌ Screenshot hatası: {str(e)}'
        
        return result
    
    async def layer3_ai_analysis(self, page: Page, page_name: str, layer1_issues: List[Dict]) -> Dict[str, Any]:
        """
        KATMAN 3: AI DEEP ANALYSIS (Gemini)
        - Sadece sorun bulunduğunda çalışır
        - HTML içeriğini AI'ya gönder
        - Derin analiz yap
        """
        result = {
            'page': page_name,
            'ai_findings': [],
            'status': 'pass'
        }
        
        # Eğer Layer 1'de kritik sorun yoksa AI'yı atlayalım (token tasarrufu)
        critical_issues = [i for i in layer1_issues if i.get('severity') == 'critical']
        if not critical_issues:
            result['message'] = '⏭️ AI analizi atlandı (kritik sorun yok)'
            return result
        
        try:
            print(f"  {Colors.YELLOW}🤖 AI analizi yapılıyor...{Colors.END}")
            
            # HTML içeriğini al
            html_content = await page.content()
            
            # Gemini'ye sor
            prompt = f"""
Sen bir web tester AI'sısın. Bu HTML sayfasını analiz et:

SAYFA: {page_name}

BULUNAN SORUNLAR:
{json.dumps(layer1_issues, indent=2, ensure_ascii=False)}

HTML İÇERİĞİ (İlk 5000 karakter):
{html_content[:5000]}

GÖREVİN:
1. Facebook login butonu gerçekten var mı? Nerede?
2. Bu buton nasıl çalışıyor? (handleOAuth fonksiyonu)
3. Başka beklenmeyen OAuth butonları var mı? (Google, Twitter, vs.)
4. Footer sorunları var mı?
5. Admin panel ile ilgili sorun var mı?

CEVABINI JSON formatında ver:
{{
  "facebook_button_confirmed": true/false,
  "button_location": "açıklama",
  "other_oauth_buttons": ["liste"],
  "additional_issues": ["liste"],
  "recommendation": "öneriniz"
}}
"""
            
            response = self.model.generate_content(prompt)
            ai_response = response.text
            
            # JSON parse et
            try:
                # JSON kısmını bul
                if '```json' in ai_response:
                    json_start = ai_response.find('```json') + 7
                    json_end = ai_response.find('```', json_start)
                    json_str = ai_response[json_start:json_end].strip()
                else:
                    json_str = ai_response.strip()
                
                ai_data = json.loads(json_str)
                result['ai_findings'] = ai_data
                result['message'] = '✅ AI analizi tamamlandı'
                
                # Facebook butonu AI tarafından da doğrulandıysa
                if ai_data.get('facebook_button_confirmed'):
                    result['status'] = 'fail'
                    
            except json.JSONDecodeError:
                result['ai_findings'] = {'raw_response': ai_response}
                result['message'] = '⚠️ AI yanıtı JSON parse edilemedi'
                
        except Exception as e:
            result['status'] = 'error'
            result['message'] = f'❌ AI analiz hatası: {str(e)}'
        
        return result
    
    async def test_single_page(self, page: Page, page_name: str):
        """Tek bir sayfayı 3 katmanlı test et"""
        base_url = 'https://isbul.online'
        url = f'{base_url}/{page_name}'
        
        print(f"{Colors.BOLD}{Colors.WHITE}📄 Test ediliyor: {page_name}{Colors.END}")
        
        # KATMAN 1: Hızlı tarama
        layer1 = await self.layer1_fast_scan(page, url, page_name)
        self.results['layer1_results'].append(layer1)
        
        # Sonucu göster
        status_icon = '✅' if layer1['status'] == 'pass' else '⚠️' if layer1['status'] == 'warning' else '❌'
        print(f"  {status_icon} Layer 1: {layer1.get('message', f"{len(layer1['issues'])} sorun bulundu")}")
        
        for issue in layer1['issues']:
            severity_color = Colors.RED if issue['severity'] == 'critical' else Colors.YELLOW
            print(f"    {severity_color}{issue['message']}{Colors.END}")
        
        # KATMAN 2: Visual check
        layer2 = await self.layer2_visual_check(page, page_name)
        self.results['layer2_results'].append(layer2)
        print(f"  📸 Layer 2: {layer2['message']}")
        
        # KATMAN 3: AI analizi (sadece sorun varsa)
        if layer1['status'] in ['fail', 'error']:
            layer3 = await self.layer3_ai_analysis(page, page_name, layer1['issues'])
            self.results['layer3_results'].append(layer3)
            print(f"  🤖 Layer 3: {layer3['message']}")
            
            if layer3.get('ai_findings'):
                findings = layer3['ai_findings']
                if isinstance(findings, dict):
                    if findings.get('facebook_button_confirmed'):
                        print(f"    {Colors.RED}🔴 AI Doğruladı: Facebook butonu VAR!{Colors.END}")
                        print(f"    {Colors.YELLOW}📍 Konum: {findings.get('button_location', 'Belirsiz')}{Colors.END}")
                    if findings.get('recommendation'):
                        print(f"    {Colors.CYAN}💡 Öneri: {findings['recommendation']}{Colors.END}")
    
    async def run_all_tests(self):
        """Tüm sayfaları test et"""
        self.print_header('🚀 HİBRİT WEB TEST SİSTEMİ')
        
        print(f"{Colors.BOLD}📋 Test Planı:{Colors.END}")
        print(f"  • {len(self.pages)} sayfa test edilecek")
        print(f"  • 3 katmanlı analiz: Playwright → Visual → AI")
        print(f"  • AI: Gemini 2.0 Flash (Experimental)")
        print(f"  • Ücretsiz: ✅")
        
        start_time = datetime.now()
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            )
            page = await context.new_page()
            
            # Her sayfayı test et
            for i, page_name in enumerate(self.pages, 1):
                print(f"\n{Colors.BOLD}[{i}/{len(self.pages)}]{Colors.END}", end=' ')
                await self.test_single_page(page, page_name)
                await asyncio.sleep(0.5)  # Rate limit için
            
            await browser.close()
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        # Özet
        self.generate_summary(duration)
    
    def generate_summary(self, duration: float):
        """Test özetini oluştur ve göster"""
        self.print_header('📊 TEST ÖZETİ')
        
        # Sayaçlar
        total_pages = len(self.pages)
        passed = sum(1 for r in self.results['layer1_results'] if r['status'] == 'pass')
        warnings = sum(1 for r in self.results['layer1_results'] if r['status'] == 'warning')
        failed = sum(1 for r in self.results['layer1_results'] if r['status'] in ['fail', 'error'])
        
        # Facebook butonu bulunan sayfalar
        facebook_pages = [
            r['page'] for r in self.results['layer1_results']
            if any(i['type'] in ['facebook_button', 'facebook_button_modal'] for i in r['issues'])
        ]
        
        print(f"{Colors.BOLD}🎯 Sonuçlar:{Colors.END}")
        print(f"  • Toplam Sayfa: {total_pages}")
        print(f"  • {Colors.GREEN}✅ Başarılı: {passed}{Colors.END}")
        print(f"  • {Colors.YELLOW}⚠️  Uyarı: {warnings}{Colors.END}")
        print(f"  • {Colors.RED}❌ Başarısız: {failed}{Colors.END}")
        print(f"  • ⏱️  Süre: {duration:.1f} saniye")
        
        if facebook_pages:
            print(f"\n{Colors.BOLD}{Colors.RED}🔴 KRİTİK: Facebook Butonu Bulunan Sayfalar:{Colors.END}")
            for page in facebook_pages:
                print(f"  • {Colors.RED}{page}{Colors.END}")
        else:
            print(f"\n{Colors.BOLD}{Colors.GREEN}✅ Facebook butonu hiçbir sayfada bulunamadı!{Colors.END}")
        
        # JSON rapor kaydet
        report_file = f'test_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        self.results['summary'] = {
            'total_pages': total_pages,
            'passed': passed,
            'warnings': warnings,
            'failed': failed,
            'facebook_pages': facebook_pages,
            'duration_seconds': duration
        }
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        print(f"\n{Colors.BOLD}📄 Detaylı Rapor:{Colors.END} {report_file}")
        print(f"{Colors.BOLD}📸 Screenshots:{Colors.END} {self.screenshot_dir}/")
        
        print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.GREEN}✨ Test tamamlandı!{Colors.END}")
        print(f"{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.END}\n")

async def main():
    """Ana fonksiyon"""
    # API key kontrolü
    api_key = os.getenv('GOOGLE_API_KEY')
    if not api_key:
        print(f"{Colors.RED}❌ GOOGLE_API_KEY ortam değişkeni bulunamadı!{Colors.END}\n")
        print(f"{Colors.YELLOW}Lütfen .env dosyasına ekleyin:{Colors.END}")
        print(f"GOOGLE_API_KEY=your_api_key_here\n")
        print(f"{Colors.CYAN}API Key almak için: https://aistudio.google.com/apikey{Colors.END}\n")
        return
    
    # Tester oluştur ve çalıştır
    tester = HybridTester(api_key=api_key)
    await tester.run_all_tests()

if __name__ == '__main__':
    asyncio.run(main())
