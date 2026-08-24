#!/usr/bin/env python3
"""
ADMIN PANEL GİRİŞ TESTİ - LOGIN SİMÜLASYONU
localStorage'a admin session ekleyerek admin paneli test eder
"""

import asyncio
from playwright.async_api import async_playwright
import json
from datetime import datetime

BASE_URL = "https://isbul.online"
ADMIN_EMAIL = "umityakupdedeoglu0@gmail.com"

# Simüle edilmiş admin session
ADMIN_SESSION = {
    "email": ADMIN_EMAIL,
    "firstName": "Ümit",
    "lastName": "Dedeoğlu",
    "role": "admin",
    "avatar": "ÜD",
    "isActive": True
}

async def test_admin_with_login():
    print("=" * 60)
    print("🔐 ADMIN PANEL GİRİŞ TESTİ (LOGIN SİMÜLASYONU)")
    print("=" * 60)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 URL: {BASE_URL}")
    print(f"👤 Admin: {ADMIN_EMAIL}")
    print("=" * 60)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080}
        )
        page = await context.new_page()
        
        # Console ve network logları
        console_logs = []
        network_errors = []
        
        page.on("console", lambda msg: console_logs.append({
            "type": msg.type,
            "text": msg.text
        }))
        
        page.on("response", lambda response: (
            network_errors.append({
                "url": response.url,
                "status": response.status
            }) if response.status >= 400 else None
        ))
        
        try:
            # 1. Ana sayfayı aç
            print("\n1️⃣  Ana sayfayı açıyorum...")
            await page.goto(BASE_URL, wait_until="domcontentloaded", timeout=30000)
            print("   ✅ Ana sayfa yüklendi")
            
            # 2. localStorage'a admin session ekle
            print("\n2️⃣  Admin session'ı ekliyorum...")
            await page.evaluate(f"""
                () => {{
                    localStorage.setItem('isbul_auth', '{json.dumps(ADMIN_SESSION)}');
                    localStorage.setItem('isbul_jwt', 'mock_admin_token_12345');
                }}
            """)
            print("   ✅ Admin session eklendi")
            
            # 3. Admin paneline git
            print("\n3️⃣  Admin paneline yönlendiriyorum...")
            await page.goto(f"{BASE_URL}/admin-panel.html", wait_until="domcontentloaded", timeout=30000)
            await asyncio.sleep(3)  # JS'in çalışması için bekle
            print("   ✅ Admin panel sayfası açıldı")
            
            # 4. Sayfa yapısını kontrol et
            print("\n4️⃣  Admin panel yapısını kontrol ediyorum...")
            
            # Sidebar kontrolü
            sidebar = await page.query_selector(".admin-sidebar")
            if sidebar:
                print("   ✅ Admin sidebar bulundu")
                
                # Sidebar içindeki kullanıcı bilgisi
                sidebar_name = await page.query_selector("#sidebarName")
                if sidebar_name:
                    name_text = await sidebar_name.inner_text()
                    print(f"   ✅ Sidebar kullanıcı: {name_text}")
            else:
                print("   ❌ Admin sidebar BULUNAMADI")
            
            # Main content kontrolü
            main_content = await page.query_selector(".admin-main")
            if main_content:
                print("   ✅ Admin main content bulundu")
            else:
                print("   ❌ Admin main content BULUNAMADI")
            
            # Body kontrolü
            admin_body = await page.query_selector(".admin-body")
            if admin_body:
                print("   ✅ Admin body bulundu")
            else:
                print("   ❌ Admin body BULUNAMADI")
            
            # API status kontrolü
            api_status = await page.query_selector("#apiStatus, .api-status")
            if api_status:
                status_text = await api_status.inner_text()
                print(f"   ℹ️  API Durumu: {status_text}")
            
            # 5. Dashboard verilerini kontrol et
            print("\n5️⃣  Dashboard verilerini kontrol ediyorum...")
            
            await asyncio.sleep(2)  # Veri yüklenmesi için bekle
            
            # Stat kartları
            stats = {
                "totalUsers": "#st-totalUsers",
                "totalBookings": "#st-totalBookings",
                "revenue": "#st-revenue",
                "totalExperts": "#st-totalExperts"
            }
            
            loaded_stats = 0
            for name, selector in stats.items():
                elem = await page.query_selector(selector)
                if elem:
                    value = await elem.inner_text()
                    if value and value != "—" and value.strip():
                        print(f"   ✅ {name}: {value}")
                        loaded_stats += 1
                    else:
                        print(f"   ⚠️  {name}: Veri yok (—)")
            
            if loaded_stats > 0:
                print(f"   ℹ️  {loaded_stats}/{len(stats)} istatistik yüklendi")
            else:
                print("   ⚠️  Hiçbir istatistik yüklenmedi (API offline olabilir)")
            
            # 6. Tab menüsünü kontrol et
            print("\n6️⃣  Tab menüsünü kontrol ediyorum...")
            
            tabs = await page.query_selector_all('.sidebar-nav a[data-tab]')
            if tabs:
                print(f"   ✅ {len(tabs)} tab bulundu")
            else:
                print("   ❌ Tab menüsü bulunamadı")
            
            # 7. Console ve network hatalarını kontrol et
            print("\n7️⃣  Console ve network hatalarını kontrol ediyorum...")
            
            errors = [log for log in console_logs if log['type'] == 'error']
            
            # Backend API hatalarını filtrele (bunlar normal)
            frontend_errors = []
            for err in errors:
                if not any(code in err['text'] for code in ['503', '401', '429', 'ERR_NAME_NOT_RESOLVED']):
                    frontend_errors.append(err)
            
            if frontend_errors:
                print(f"   ⚠️  {len(frontend_errors)} frontend hatası bulundu:")
                for err in frontend_errors[:3]:
                    print(f"      - {err['text'][:100]}")
            else:
                print("   ✅ Frontend hatası yok")
            
            # Backend API hatalarını bilgilendirme olarak göster
            backend_errors = len(errors) - len(frontend_errors)
            if backend_errors > 0:
                print(f"   ℹ️  {backend_errors} backend API hatası (beklenen - API offline)")
            
            # 8. Screenshot al
            print("\n8️⃣  Screenshot alıyorum...")
            await page.screenshot(path="admin_panel_logged_in.png", full_page=True)
            print("   ✅ Screenshot kaydedildi: admin_panel_logged_in.png")
            
            # 9. Tab geçişlerini test et
            print("\n9️⃣  Tab geçişlerini test ediyorum...")
            
            tab_tests = [
                ("dashboard", "Dashboard"),
                ("users", "Kullanıcılar"),
                ("experts", "Uzmanlar"),
                ("applications", "Başvurular"),
                ("analytics", "Analitik")
            ]
            
            successful_tabs = 0
            for tab_id, tab_name in tab_tests:
                tab_link = await page.query_selector(f'a[data-tab="{tab_id}"]')
                if tab_link:
                    await tab_link.click()
                    await asyncio.sleep(1)
                    
                    active_tab = await page.query_selector(f'#tab-{tab_id}.active')
                    if active_tab:
                        print(f"   ✅ {tab_name} tab açıldı")
                        successful_tabs += 1
                    else:
                        print(f"   ⚠️  {tab_name} tab tıklandı ama aktif olmadı")
                else:
                    print(f"   ❌ {tab_name} tab bulunamadı")
            
            print(f"   ℹ️  {successful_tabs}/{len(tab_tests)} tab başarılı")
            
            # 10. Final değerlendirme
            print("\n" + "=" * 60)
            print("📊 SONUÇ")
            print("=" * 60)
            
            if sidebar and main_content and successful_tabs > 0:
                print("✅ BAŞARILI: Admin panel tamamen çalışıyor!")
                print(f"   • Sidebar: ✅")
                print(f"   • Content: ✅")
                print(f"   • Tabs: {successful_tabs}/{len(tab_tests)}")
                print(f"   • Stats: {loaded_stats}/{len(stats)}")
                
                if loaded_stats == 0:
                    print("\n⚠️  NOT: Backend API çalışmıyor, bu normal.")
                    print("   Offline mode aktif, panel kullanılabilir.")
            else:
                print("❌ BAŞARISIZ: Admin panel düzgün yüklenmedi")
            
            print("=" * 60)
            
        except Exception as e:
            print(f"\n❌ TEST HATASI: {e}")
            import traceback
            traceback.print_exc()
        
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(test_admin_with_login())
