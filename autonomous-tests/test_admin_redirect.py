#!/usr/bin/env python3
"""
ADMIN PANEL REDIRECT TESTİ
Giriş yapmadan admin panele gitme testi
"""

import asyncio
from playwright.async_api import async_playwright
from datetime import datetime

BASE_URL = "https://isbul.online"

async def test_admin_redirect():
    print("=" * 60)
    print("🔐 ADMIN PANEL REDIRECT TESTİ")
    print("=" * 60)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 URL: {BASE_URL}/admin-panel.html")
    print("=" * 60)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)  # headless=False ile görebilirsiniz
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080}
        )
        page = await context.new_page()
        
        try:
            # 1. localStorage'ı temizle (giriş yapmamış kullanıcı simüle et)
            print("\n1️⃣  localStorage temizleniyor (giriş yapmamış kullanıcı)...")
            await page.goto(BASE_URL, wait_until="domcontentloaded")
            await page.evaluate("""
                () => {
                    localStorage.clear();
                    sessionStorage.clear();
                }
            """)
            print("   ✅ Storage temizlendi")
            
            # 2. Admin panele git
            print("\n2️⃣  Admin panele yönlendiriliyor...")
            await page.goto(f"{BASE_URL}/admin-panel.html", wait_until="domcontentloaded")
            await asyncio.sleep(2)  # JS'in çalışması için bekle
            
            # 3. URL'yi kontrol et
            current_url = page.url
            print(f"   📍 Mevcut URL: {current_url}")
            
            if "admin-panel.html" in current_url:
                print("   ✅ Admin panelde KALDI (redirect olmadı)")
                
                # Login modal var mı?
                login_modal = await page.query_selector("#adminLoginModal")
                if login_modal:
                    print("   ✅ Login modal AÇILDI")
                    
                    # Modal içeriğini kontrol et
                    modal_title = await page.query_selector("#adminLoginModal h2")
                    if modal_title:
                        title_text = await modal_title.inner_text()
                        print(f"   ✅ Modal başlık: {title_text}")
                    
                    # Guest login butonu var mı?
                    guest_btn = await page.query_selector('button:has-text("Misafir Olarak Devam Et")')
                    if guest_btn:
                        print("   ✅ Misafir login butonu VAR")
                    else:
                        print("   ❌ Misafir login butonu YOK")
                    
                    # Screenshot al
                    await page.screenshot(path="admin_login_modal.png")
                    print("   ✅ Screenshot: admin_login_modal.png")
                else:
                    print("   ❌ Login modal AÇILMADI")
            else:
                print(f"   ❌ Redirect oldu: {current_url}")
            
            # 4. Misafir olarak giriş yapmayı test et
            print("\n4️⃣  Misafir girişi test ediliyor...")
            guest_btn = await page.query_selector('button:has-text("Misafir Olarak Devam Et")')
            
            if guest_btn:
                await guest_btn.click()
                await asyncio.sleep(2)
                
                # Modal kapandı mı?
                login_modal = await page.query_selector("#adminLoginModal")
                if not login_modal:
                    print("   ✅ Modal kapandı")
                    
                    # Admin panel görünüyor mu?
                    sidebar = await page.query_selector(".admin-sidebar")
                    if sidebar:
                        print("   ✅ Admin panel görünüyor")
                        
                        # Sidebar'da kullanıcı adı
                        sidebar_name = await page.query_selector("#sidebarName")
                        if sidebar_name:
                            name = await sidebar_name.inner_text()
                            print(f"   ✅ Kullanıcı: {name}")
                    else:
                        print("   ❌ Admin panel görünmüyor")
                else:
                    print("   ❌ Modal kapanmadı")
                
                # Screenshot al
                await page.screenshot(path="admin_guest_mode.png")
                print("   ✅ Screenshot: admin_guest_mode.png")
            else:
                print("   ⚠️  Misafir butonu bulunamadı")
            
            print("\n" + "=" * 60)
            print("✅ TEST TAMAMLANDI")
            print("=" * 60)
            print("\n💡 Sonuç:")
            print("   • Admin panel redirect olmadan açılıyor mu? KONTROL EDİN")
            print("   • Login modal görünüyor mu? KONTROL EDİN")
            print("   • Misafir girişi çalışıyor mu? KONTROL EDİN")
            print("\n📸 Screenshot'ları kontrol edin:")
            print("   • admin_login_modal.png")
            print("   • admin_guest_mode.png")
            
            # 10 saniye bekle ki görebilin
            print("\n⏳ 10 saniye bekleniyor (browser açık kalacak)...")
            await asyncio.sleep(10)
            
        except Exception as e:
            print(f"\n❌ TEST HATASI: {e}")
            import traceback
            traceback.print_exc()
        
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(test_admin_redirect())
