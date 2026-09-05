"""
🤖 Basit LLM Test - DOM Analizi
"""

import os
from playwright.sync_api import sync_playwright
from autonomous_tester import DOMPruner, GroqAgent
from dotenv import load_dotenv

load_dotenv()
SITE_URL = os.getenv('SITE_URL', 'https://isbul.online')

def simple_llm_analysis():
    """Basit LLM analizi - sadece sayfa analizi"""
    
    print("\n" + "="*60)
    print("🤖 BASIT LLM ANALİZİ - DOM + AI")
    print("="*60 + "\n")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        url = f"{SITE_URL}/uzmanlar.html"
        print(f"🌐 Sayfa yükleniyor: {url}")
        page.goto(url, wait_until='networkidle')
        page.wait_for_timeout(2000)
        print("✅ Sayfa yüklendi\n")
        
        # Modal'ı aç
        try:
            print("🔓 'Ücretsiz Kaydol' butonuna tıklanıyor...")
            page.click('text=Ücretsiz Kaydol', timeout=5000)
            page.wait_for_timeout(2000)
            print("✅ Modal açıldı\n")
        except:
            print("⚠️ Modal açılamadı, devam ediliyor...\n")
        
        # LLM ile analiz
        print("🧠 LLM ile sayfa analiz ediliyor...")
        print("(Bu 30-45 saniye sürebilir...)\n")
        
        try:
            analysis = GroqAgent.analyze_page_for_issues(page)
            
            print("="*60)
            print("📊 LLM ANALİZ SONUÇLARI")
            print("="*60 + "\n")
            
            # Facebook butonu
            if analysis.get('facebook_button_found'):
                print("🚨 KRİTİK: Facebook butonu BULUNDU!")
                print("   ❌ Bu buton kaldırılmalı!\n")
            else:
                print("✅ Facebook butonu bulunamadı (iyi)\n")
            
            # Google butonu
            if analysis.get('google_button_found'):
                print("✅ Google butonu bulundu (doğru)\n")
            else:
                print("⚠️ Google butonu bulunamadı\n")
            
            # Kritik sorunlar
            if analysis.get('critical_issues'):
                print("❌ KRİTİK SORUNLAR:")
                for issue in analysis['critical_issues']:
                    print(f"   • {issue.get('message')}")
                print()
            
            # Uyarılar
            if analysis.get('warnings'):
                print("⚠️ UYARILAR:")
                for warning in analysis['warnings']:
                    print(f"   • {warning.get('message')}")
                print()
            
            # Genel durum
            status = analysis.get('overall_status', 'unknown')
            if status == 'pass':
                print("✅ GENEL DURUM: BAŞARILI")
            elif status == 'fail':
                print("❌ GENEL DURUM: BAŞARISIZ")
            else:
                print(f"⚠️ GENEL DURUM: {status}")
            
        except Exception as e:
            print(f"❌ LLM analizi başarısız: {e}")
        
        # Screenshot
        screenshot_path = "llm_analysis_result.png"
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"\n📸 Screenshot: {screenshot_path}")
        
        print("\n⏰ Tarayıcı 5 saniye açık kalacak...")
        page.wait_for_timeout(5000)
        
        browser.close()
        print("\n✅ Test tamamlandı!")

if __name__ == "__main__":
    simple_llm_analysis()
