#!/usr/bin/env python3
"""
ADMIN PANEL GİRİŞ TESTİ
Production'da admin paneline giriş yapmayı test eder
"""

import asyncio
from playwright.async_api import async_playwright
import json
from datetime import datetime

BASE_URL = "https://isbul.online"
ADMIN_EMAIL = "umityakupdedeoglu0@gmail.com"

async def test_admin_login():
    print("=" * 60)
    print("🔐 ADMIN PANEL GİRİŞ TESTİ")
    print("=" * 60)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 URL: {BASE_URL}")
    print(f"👤 Admin: {ADMIN_EMAIL}")
    print("=" * 60)
    
    results = []
    
    async with async_playwright() as p:
        # Browser başlat (headless=False ile görebilirsiniz)
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
            await page.goto(BASE_URL, wait_until="networkidle", timeout=30000)
            print("   ✅ Ana sayfa yüklendi")
            
            # 2. Admin mode parametresi ile aç
            print("\n2️⃣  Admin paneline yönlendiriyorum...")
            await page.goto(f"{BASE_URL}/admin-panel.html", wait_until="networkidle", timeout=30000)
            print("   ✅ Admin panel sayfası açıldı")
            
            # 3. Sayfa yapısını kontrol et
            print("\n3️⃣  Admin panel yapısını kontrol ediyorum...")
            
            # Sidebar kontrolü
            sidebar = await page.query_selector(".admin-sidebar")
            if sidebar:
                print("   ✅ Admin sidebar bulundu")
            else:
                print("   ❌ Admin sidebar BULUNAMADI")
            
            # Main content kontrolü
            main_content = await page.query_selector(".admin-main")
            if main_content:
                print("   ✅ Admin main content bulundu")
            else:
                print("   ❌ Admin main content BULUNAMADI")
            
            # API status kontrolü
            api_status = await page.query_selector("#apiStatus, .api-status")
            if api_status:
                status_text = await api_status.inner_text()
                print(f"   ℹ️  API Durumu: {status_text}")
            
            # 4. Login modal kontrolü
            print("\n4️⃣  Login mekanizmasını kontrol ediyorum...")
            
            # localStorage'da session var mı?
            local_storage = await page.evaluate("""
                () => {
                    return {
                        jwt: localStorage.getItem('isbul_jwt'),
                        auth: localStorage.getItem('isbul_auth')
                    }
                }
            """)
            
            if local_storage['jwt']:
                print(f"   ✅ JWT token mevcut: {local_storage['jwt'][:20]}...")
            else:
                print("   ⚠️  JWT token yok")
            
            if local_storage['auth']:
                auth_data = json.loads(local_storage['auth'])
                print(f"   ✅ Session mevcut: {auth_data.get('email', 'unknown')}")
                print(f"   ✅ Rol: {auth_data.get('role', 'unknown')}")
            else:
                print("   ⚠️  Session yok")
            
            # 5. Admin panelde veri yükleme kontrolü
            print("\n5️⃣  Dashboard verilerini kontrol ediyorum...")
            
            await asyncio.sleep(2)  # API çağrılarının tamamlanmasını bekle
            
            # Stat kartları
            total_users = await page.query_selector("#st-totalUsers")
            if total_users:
                value = await total_users.inner_text()
                print(f"   📊 Toplam Kullanıcı: {value}")
            
            total_bookings = await page.query_selector("#st-totalBookings")
            if total_bookings:
                value = await total_bookings.inner_text()
                print(f"   📊 Toplam Rezervasyon: {value}")
            
            revenue = await page.query_selector("#st-revenue")
            if revenue:
                value = await revenue.inner_text()
                print(f"   📊 Toplam Gelir: {value}")
            
            # 6. Console ve network hatalarını kontrol et
            print("\n6️⃣  Console ve network hatalarını kontrol ediyorum...")
            
            errors = [log for log in console_logs if log['type'] == 'error']
            if errors:
                print(f"   ⚠️  {len(errors)} console hatası bulundu:")
                for err in errors[:3]:  # İlk 3'ü göster
                    print(f"      - {err['text'][:80]}")
            else:
                print("   ✅ Console hatası yok")
            
            api_errors = [e for e in network_errors if e['status'] >= 400]
            if api_errors:
                print(f"   ⚠️  {len(api_errors)} network hatası bulundu:")
                for err in api_errors[:3]:
                    print(f"      - {err['status']}: {err['url']}")
            else:
                print("   ✅ Network hatası yok")
            
            # 7. Screenshot al
            print("\n7️⃣  Screenshot alıyorum...")
            await page.screenshot(path="admin_panel_test.png", full_page=True)
            print("   ✅ Screenshot kaydedildi: admin_panel_test.png")
            
            # 8. Tab geçişlerini test et
            print("\n8️⃣  Tab geçişlerini test ediyorum...")
            
            tabs = [
                ("dashboard", "Dashboard"),
                ("users", "Kullanıcılar"),
                ("experts", "Uzmanlar"),
                ("applications", "Başvurular"),
                ("analytics", "Analitik")
            ]
            
            for tab_id, tab_name in tabs:
                tab_link = await page.query_selector(f'a[data-tab="{tab_id}"]')
                if tab_link:
                    await tab_link.click()
                    await asyncio.sleep(1)
                    
                    active_tab = await page.query_selector(f'#tab-{tab_id}.active')
                    if active_tab:
                        print(f"   ✅ {tab_name} tab açıldı")
                    else:
                        print(f"   ❌ {tab_name} tab AÇILAMADI")
                else:
                    print(f"   ⚠️  {tab_name} tab bulunamadı")
            
            print("\n" + "=" * 60)
            print("✅ TEST TAMAMLANDI")
            print("=" * 60)
            
        except Exception as e:
            print(f"\n❌ TEST HATASI: {e}")
            import traceback
            traceback.print_exc()
        
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(test_admin_login())
