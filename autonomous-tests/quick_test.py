"""
🧪 HIZLI TEST - Facebook Butonu Tespiti
Tek sayfada Facebook butonunu test et
"""

import os
import sys
from playwright.sync_api import sync_playwright
from dotenv import load_dotenv

load_dotenv()
SITE_URL = os.getenv('SITE_URL', 'https://isbul.online')

def quick_facebook_test(page_name="uzmanlar.html"):
    """Basit manuel test - Facebook butonunu sayfa kaynak kodunda ara"""
    
    print(f"\n{'='*60}")
    print(f"🧪 HIZLI TEST: {page_name}")
    print(f"{'='*60}\n")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        url = f"{SITE_URL}/{page_name}"
        print(f"🌐 Sayfa açılıyor: {url}")
        
        try:
            page.goto(url, wait_until='networkidle', timeout=30000)
            page.wait_for_timeout(2000)
            
            print("✅ Sayfa yüklendi")
            
            # 1. Sayfanın HTML içeriğini al
            html_content = page.content()
            
            # 2. Facebook kelimesini ara
            facebook_count = html_content.lower().count('facebook')
            print(f"\n📊 'facebook' kelimesi sayısı: {facebook_count}")
            
            # 3. Facebook ile Kayıt butonunu ara (farklı formatlar)
            facebook_button_variants = [
                'Facebook ile Kayıt',
                'facebook ile kayıt',
                '✓ Facebook',
                '📘 Facebook',
                'Facebook ile Giriş',
                'facebook ile giriş'
            ]
            
            found_variants = []
            for variant in facebook_button_variants:
                if variant.lower() in html_content.lower():
                    count = html_content.lower().count(variant.lower())
                    found_variants.append((variant, count))
                    print(f"   ✅ '{variant}' bulundu ({count} adet)")
            
            # 4. DOM'da buton elementini bul
            print(f"\n🔍 DOM'da Facebook butonları aranıyor...")
            
            try:
                # Tüm butonları listele
                buttons = page.query_selector_all('button')
                facebook_buttons = []
                
                for btn in buttons:
                    text = btn.inner_text()
                    if 'facebook' in text.lower():
                        facebook_buttons.append(text)
                        print(f"   🔴 Buton bulundu: '{text}'")
                
                if facebook_buttons:
                    print(f"\n🚨 SONUÇ: {len(facebook_buttons)} ADET FACEBOOK BUTONU BULUNDU!")
                    print("   ❌ Bu butonlar OLMAMALI!")
                else:
                    print("\n✅ SONUÇ: Facebook butonu BULUNAMADI (iyi)")
                    
            except Exception as e:
                print(f"   ⚠️ DOM tarama hatası: {e}")
            
            # 5. Screenshot al
            screenshot_path = f"quick_test_{page_name.replace('.html', '')}.png"
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"\n📸 Screenshot kaydedildi: {screenshot_path}")
            
            # 6. Modal'ı aç (eğer Facebook butonu modal içindeyse)
            print(f"\n🔓 Modal açılmaya çalışılıyor...")
            try:
                # "Ücretsiz Kaydol" veya "Kayıt Ol" butonunu bul
                signup_buttons = [
                    'Ücretsiz Kaydol',
                    'Kayıt Ol',
                    'Ücretsiz Kayıt',
                    'Register'
                ]
                
                for btn_text in signup_buttons:
                    try:
                        page.click(f'text={btn_text}', timeout=3000)
                        print(f"   ✅ '{btn_text}' butonuna tıklandı")
                        page.wait_for_timeout(2000)
                        break
                    except:
                        continue
                
                # Şimdi tekrar Facebook ara
                buttons_after = page.query_selector_all('button')
                facebook_in_modal = []
                
                for btn in buttons_after:
                    text = btn.inner_text()
                    if 'facebook' in text.lower() and btn.is_visible():
                        facebook_in_modal.append(text)
                        print(f"   🔴 Modal'da buton: '{text}'")
                
                if facebook_in_modal:
                    print(f"\n🚨 MODAL SONUCU: {len(facebook_in_modal)} ADET FACEBOOK BUTONU GÖRÜNÜR!")
                    
                    # Modal screenshot
                    modal_screenshot = f"quick_test_{page_name.replace('.html', '')}_modal.png"
                    page.screenshot(path=modal_screenshot, full_page=True)
                    print(f"📸 Modal screenshot: {modal_screenshot}")
                
            except Exception as e:
                print(f"   ⚠️ Modal açma hatası: {e}")
            
            # Final sonuç
            print(f"\n{'='*60}")
            print("📊 FINAL SONUÇ")
            print(f"{'='*60}")
            
            if facebook_buttons or (facebook_in_modal if 'facebook_in_modal' in locals() else False):
                print("❌ TEST BAŞARISIZ!")
                print(f"   Facebook butonu bulundu: {len(facebook_buttons) + len(facebook_in_modal if 'facebook_in_modal' in locals() else [])} adet")
                print("   Bu butonlar kaldırılmalı!")
            else:
                print("✅ TEST BAŞARILI!")
                print("   Facebook butonu bulunamadı")
            
            print(f"\n⏰ Tarayıcı 5 saniye açık kalacak, inceleyebilirsin...")
            page.wait_for_timeout(5000)
            
        except Exception as e:
            print(f"❌ Test hatası: {e}")
        finally:
            browser.close()
            print("\n✅ Test tamamlandı!")


if __name__ == "__main__":
    # Komut satırından sayfa adı al
    page = sys.argv[1] if len(sys.argv) > 1 else "uzmanlar.html"
    quick_facebook_test(page)
