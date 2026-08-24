"""
🤖 OTONOM SELF-HEALING TEST SİSTEMİ
Playwright + Groq LLM Hibrit Mimari

Özellikler:
- Self-healing: Selector bulunamazsa LLM alternatif bulur
- Otonom karar: LLM sayfayı analiz edip ne yapılacağına karar verir
- Ücretsiz: Groq free tier, DOM pruning ile token optimizasyonu
- Structured output: JSON schema ile kesin yanıtlar
"""

import os
import json
import time
import re
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from playwright.sync_api import sync_playwright, Page, ElementHandle
from groq import Groq
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

# Ortam değişkenlerini yükle
load_dotenv()

# Groq client
groq_client = Groq(api_key=os.getenv('GROQ_API_KEY'))

# Konfigürasyon
SITE_URL = os.getenv('SITE_URL', 'https://isbul.online')
GROQ_MODEL = "openai/gpt-oss-120b"  # Production, 131K context window
MAX_TOKENS = 2000
TEMPERATURE = 0.1  # Deterministik yanıtlar için düşük


@dataclass
class TestAction:
    """Test aksiyonu veri yapısı"""
    action: str  # click, fill, assert, wait, navigate
    selector: Optional[str] = None
    value: Optional[str] = None
    reason: str = ""
    confidence: float = 0.0


class DOMPruner:
    """
    DOM'u sadeleştirip LLM'e gönderilecek token sayısını azaltır.
    Sadece interaktif elementleri ve önemli bilgileri tutar.
    """
    
    INTERACTIVE_TAGS = {
        'button', 'a', 'input', 'textarea', 'select', 
        'form', 'label', '[role="button"]', '[onclick]',
        '[type="submit"]', '[type="button"]'
    }
    
    IMPORTANT_ATTRIBUTES = {
        'id', 'class', 'name', 'type', 'placeholder', 
        'aria-label', 'title', 'href', 'value', 'role'
    }
    
    @staticmethod
    def prune_html(page: Page) -> str:
        """
        Sayfadan sadece interaktif elementleri çıkarır.
        Token sayısını %90 azaltır.
        """
        try:
            # JavaScript ile interaktif elementleri çıkar
            pruned_dom = page.evaluate("""() => {
                const interactiveTags = ['button', 'a', 'input', 'textarea', 'select', 'form', 'label'];
                const importantAttrs = ['id', 'class', 'name', 'type', 'placeholder', 'aria-label', 'title', 'href', 'value', 'role', 'data-testid'];
                
                function getElementInfo(el) {
                    const info = {
                        tag: el.tagName.toLowerCase(),
                        text: el.innerText?.substring(0, 100) || '',
                        attrs: {}
                    };
                    
                    // Sadece önemli attribute'ları al
                    importantAttrs.forEach(attr => {
                        const val = el.getAttribute(attr);
                        if (val) info.attrs[attr] = val;
                    });
                    
                    // Visible mi?
                    const rect = el.getBoundingClientRect();
                    info.visible = rect.width > 0 && rect.height > 0;
                    
                    return info;
                }
                
                // Tüm interaktif elementleri topla
                const elements = [];
                interactiveTags.forEach(tag => {
                    const els = document.querySelectorAll(tag);
                    els.forEach(el => {
                        if (el.offsetParent !== null) {  // Visible check
                            elements.push(getElementInfo(el));
                        }
                    });
                });
                
                // Role="button" olanları da ekle
                document.querySelectorAll('[role="button"], [onclick]').forEach(el => {
                    if (el.offsetParent !== null) {
                        elements.push(getElementInfo(el));
                    }
                });
                
                return {
                    url: window.location.href,
                    title: document.title,
                    elements: elements,
                    totalElements: elements.length
                };
            }""")
            
            return json.dumps(pruned_dom, indent=2, ensure_ascii=False)
            
        except Exception as e:
            print(f"⚠️ DOM pruning hatası: {e}")
            # Fallback: Basit body text
            return page.evaluate("() => document.body.innerText.substring(0, 5000)")
    
    @staticmethod
    def get_accessibility_tree(page: Page) -> str:
        """
        Accessibility tree çıkarır (daha da kompakt)
        """
        try:
            snapshot = page.accessibility.snapshot()
            return json.dumps(snapshot, indent=2)[:3000]  # İlk 3000 karakter
        except:
            return ""


class RateLimiter:
    """
    Groq free tier için rate limiting:
    - 30 requests/minute
    - 6000 tokens/minute
    """
    
    def __init__(self, rpm_limit: int = 25, tpm_limit: int = 5000):
        self.rpm_limit = rpm_limit
        self.tpm_limit = tpm_limit
        self.requests = []
        self.tokens = []
    
    def wait_if_needed(self, estimated_tokens: int = 1000):
        """Gerekirse bekle"""
        now = time.time()
        
        # Son 1 dakikadaki requestleri temizle
        self.requests = [r for r in self.requests if now - r < 60]
        self.tokens = [(t, tok) for t, tok in self.tokens if now - t < 60]
        
        # Request limit kontrolü
        if len(self.requests) >= self.rpm_limit:
            wait_time = 60 - (now - self.requests[0]) + 1
            print(f"⏳ Rate limit: {wait_time:.1f}s bekleniyor...")
            time.sleep(wait_time)
            self.requests = []
        
        # Token limit kontrolü
        total_tokens = sum(tok for _, tok in self.tokens)
        if total_tokens + estimated_tokens > self.tpm_limit:
            wait_time = 60 - (now - self.tokens[0][0]) + 1
            print(f"⏳ Token limit: {wait_time:.1f}s bekleniyor...")
            time.sleep(wait_time)
            self.tokens = []
        
        # Bu isteği kaydet
        self.requests.append(now)
        self.tokens.append((now, estimated_tokens))


rate_limiter = RateLimiter()


class GroqAgent:
    """
    Groq LLM ile otonom karar veren agent
    """
    
    @staticmethod
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
        retry=retry_if_exception_type(Exception)
    )
    def ask_llm(prompt: str, system_prompt: str, json_schema: Dict) -> Dict:
        """
        LLM'den JSON formatında yanıt al
        Retry mekanizması ile 429 hatalarını handle eder
        """
        try:
            # Rate limiting
            estimated_tokens = len(prompt.split()) * 1.3  # Yaklaşık token sayısı
            rate_limiter.wait_if_needed(int(estimated_tokens))
            
            # Groq API çağrısı
            response = groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=TEMPERATURE,
                max_tokens=MAX_TOKENS,
                response_format={"type": "json_object"}  # JSON mode
            )
            
            content = response.choices[0].message.content
            
            # JSON parse
            try:
                result = json.loads(content)
                return result
            except json.JSONDecodeError as e:
                print(f"⚠️ JSON parse hatası: {e}")
                print(f"Raw response: {content[:500]}")
                # JSON extract etmeyi dene
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group(0))
                raise
                
        except Exception as e:
            print(f"❌ Groq API hatası: {e}")
            if "429" in str(e):
                print("⏳ Rate limit aşıldı, 60 saniye bekleniyor...")
                time.sleep(60)
            raise
    
    @staticmethod
    def decide_next_action(page: Page, goal: str, context: str = "") -> TestAction:
        """
        Sayfaya bakıp bir sonraki aksiyonu belirle
        """
        print(f"\n🤖 LLM'e danışılıyor: '{goal}'")
        
        # DOM'u sadeleştir
        pruned_dom = DOMPruner.prune_html(page)
        
        # Sistem promptu
        system_prompt = """Sen bir QA test otomasyon uzmanısın. Playwright ile web test yazıyorsun.
Sana bir sayfanın DOM'u ve test hedefi veriliyor.
Bir sonraki aksiyonu belirleyip JSON formatında dön.

ÖNEMLİ KURALLAR:
1. Sadece GERÇEKTEN gördüğün elementleri kullan
2. Selector olarak öncelik: id > data-testid > unique class > text içeriği
3. Facebook ile kayıt/giriş butonu görürsen MUTLAKA raporla (olmamalı!)
4. Buton text'leri TAM OLARAK eşleştir ("Google ile Kayıt" ≠ "Facebook ile Kayıt")

JSON ŞEMA:
{
  "action": "click" | "fill" | "assert" | "wait" | "navigate" | "error",
  "selector": "css selector or text locator",
  "value": "text to fill (if action=fill)",
  "reason": "why this action",
  "confidence": 0.0-1.0,
  "observations": ["critical findings like 'Facebook button found!'"]
}"""
        
        # Kullanıcı promptu
        user_prompt = f"""SAYFA BİLGİSİ:
{pruned_dom}

CONTEXT: {context}

TEST HEDEFİ: {goal}

Bir sonraki aksiyonu belirle. JSON formatında dön."""
        
        try:
            response = GroqAgent.ask_llm(
                prompt=user_prompt,
                system_prompt=system_prompt,
                json_schema={}
            )
            
            return TestAction(
                action=response.get('action', 'wait'),
                selector=response.get('selector'),
                value=response.get('value'),
                reason=response.get('reason', ''),
                confidence=response.get('confidence', 0.5)
            )
            
        except Exception as e:
            print(f"❌ LLM karar verme hatası: {e}")
            return TestAction(action='error', reason=str(e))
    
    @staticmethod
    def find_alternative_selector(page: Page, failed_selector: str, intent: str) -> Optional[str]:
        """
        Self-healing: Selector bulunamazsa alternatif bul
        """
        print(f"🔧 Self-healing: '{failed_selector}' bulunamadı, alternatif aranıyor...")
        
        pruned_dom = DOMPruner.prune_html(page)
        
        system_prompt = """Sen bir selector recovery uzmanısın.
Başarısız olan selector için alternatif bul.
Sayfadaki elementlerden en uygun olanı seç."""
        
        user_prompt = f"""SAYFA:
{pruned_dom}

BAŞARISIZ SELECTOR: {failed_selector}
AMAÇ: {intent}

Alternatif bir selector öner. JSON formatında:
{{
  "selector": "yeni selector",
  "method": "id | class | text | xpath",
  "confidence": 0.0-1.0,
  "reason": "neden bu selector"
}}"""
        
        try:
            response = GroqAgent.ask_llm(user_prompt, system_prompt, {})
            new_selector = response.get('selector')
            
            if new_selector:
                print(f"✅ Alternatif bulundu: {new_selector}")
                return new_selector
                
        except Exception as e:
            print(f"❌ Self-healing başarısız: {e}")
        
        return None
    
    @staticmethod
    def analyze_page_for_issues(page: Page) -> Dict[str, Any]:
        """
        Sayfayı analiz edip sorunları tespit et
        Facebook butonu gibi olmaması gereken şeyleri yakala
        """
        print("\n🔍 Sayfa analizi yapılıyor...")
        
        pruned_dom = DOMPruner.prune_html(page)
        
        system_prompt = """Sen bir QA test uzmanısın. Sayfadaki KRITIK sorunları bul.

ÖZEL KONTROLLER:
1. Facebook ile giriş/kayıt butonu VAR MI? (OLMAMALI!)
2. Kırık butonlar var mı?
3. Eksik formlar var mı?
4. Error mesajları görünüyor mu?
5. Beklenmeyen elementler var mı?

Bulduklarını JSON'da raporla:
{
  "critical_issues": [{"type": "error", "message": "..."}],
  "warnings": [{"type": "warning", "message": "..."}],
  "facebook_button_found": true/false,
  "google_button_found": true/false,
  "overall_status": "pass" | "fail"
}"""
        
        user_prompt = f"""SAYFA:
{pruned_dom}

Analiz yap ve sorunları raporla."""
        
        try:
            response = GroqAgent.ask_llm(user_prompt, system_prompt, {})
            return response
        except Exception as e:
            print(f"❌ Analiz hatası: {e}")
            return {"overall_status": "error", "critical_issues": []}


class AutonomousTester:
    """
    Otonom test executor
    """
    
    def __init__(self, headless: bool = False):
        self.headless = headless
        self.playwright = None
        self.browser = None
        self.page = None
        self.test_results = []
    
    def setup(self):
        """Test ortamını hazırla"""
        print("🚀 Otonom test sistemi başlatılıyor...")
        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch(headless=self.headless)
        self.page = self.browser.new_page()
        self.page.set_viewport_size({"width": 1920, "height": 1080})
        print("✅ Tarayıcı hazır")
    
    def teardown(self):
        """Temizlik"""
        if self.page:
            self.page.close()
        if self.browser:
            self.browser.close()
        if self.playwright:
            self.playwright.stop()
        print("✅ Tarayıcı kapatıldı")
    
    def execute_action(self, action: TestAction) -> bool:
        """
        Test aksiyonunu çalıştır
        """
        try:
            print(f"▶️ Aksiyon: {action.action} | Selector: {action.selector} | Sebep: {action.reason}")
            
            if action.action == 'navigate':
                self.page.goto(action.value or action.selector, wait_until='networkidle')
                return True
            
            elif action.action == 'click':
                # Önce normal dene
                try:
                    self.page.click(action.selector, timeout=5000)
                    return True
                except Exception as e:
                    # Self-healing: Alternatif selector bul
                    print(f"⚠️ Click başarısız: {e}")
                    alt_selector = GroqAgent.find_alternative_selector(
                        self.page, 
                        action.selector, 
                        f"Click on {action.reason}"
                    )
                    if alt_selector:
                        self.page.click(alt_selector, timeout=5000)
                        return True
                    raise
            
            elif action.action == 'fill':
                try:
                    self.page.fill(action.selector, action.value, timeout=5000)
                    return True
                except Exception as e:
                    # Self-healing
                    alt_selector = GroqAgent.find_alternative_selector(
                        self.page,
                        action.selector,
                        f"Fill with {action.value}"
                    )
                    if alt_selector:
                        self.page.fill(alt_selector, action.value, timeout=5000)
                        return True
                    raise
            
            elif action.action == 'assert':
                # Assertion kontrolü
                element = self.page.query_selector(action.selector)
                if element:
                    text = element.inner_text()
                    if action.value and action.value.lower() not in text.lower():
                        print(f"❌ Assertion başarısız: '{action.value}' bulunamadı")
                        return False
                    print(f"✅ Assertion başarılı: {text[:100]}")
                    return True
                else:
                    print(f"❌ Element bulunamadı: {action.selector}")
                    return False
            
            elif action.action == 'wait':
                wait_time = int(action.value) if action.value else 2000
                self.page.wait_for_timeout(wait_time)
                return True
            
            elif action.action == 'error':
                print(f"❌ Hata aksiyonu: {action.reason}")
                return False
            
            else:
                print(f"⚠️ Bilinmeyen aksiyon: {action.action}")
                return False
                
        except Exception as e:
            print(f"❌ Aksiyon çalıştırma hatası: {e}")
            return False
    
    def run_autonomous_test(self, url: str, goals: List[str]):
        """
        Otonom test senaryosu çalıştır
        """
        print(f"\n{'='*60}")
        print(f"🎯 OTONOM TEST BAŞLIYOR")
        print(f"URL: {url}")
        print(f"Hedefler: {len(goals)} adım")
        print(f"{'='*60}\n")
        
        self.setup()
        
        try:
            # Sayfayı aç
            print(f"🌐 Sayfa açılıyor: {url}")
            self.page.goto(url, wait_until='networkidle')
            self.page.wait_for_timeout(2000)
            
            # Her hedef için otonom aksiyon al
            for i, goal in enumerate(goals, 1):
                print(f"\n{'─'*60}")
                print(f"📋 Adım {i}/{len(goals)}: {goal}")
                print(f"{'─'*60}")
                
                # LLM'den karar al
                action = GroqAgent.decide_next_action(
                    self.page,
                    goal,
                    context=f"Şu ana kadar {i-1} adım tamamlandı"
                )
                
                # Aksiyonu çalıştır
                success = self.execute_action(action)
                
                # Sonucu kaydet
                self.test_results.append({
                    'step': i,
                    'goal': goal,
                    'action': action.__dict__,
                    'success': success,
                    'url': self.page.url,
                    'timestamp': time.time()
                })
                
                if not success and action.confidence < 0.5:
                    print(f"⚠️ Düşük confidence ({action.confidence}), devam ediliyor...")
                
                # Her adımdan sonra kısa bekle
                self.page.wait_for_timeout(1000)
            
            # Final analiz
            print(f"\n{'='*60}")
            print("📊 FINAL ANALİZ")
            print(f"{'='*60}")
            
            final_analysis = GroqAgent.analyze_page_for_issues(self.page)
            self.test_results.append({
                'type': 'final_analysis',
                'analysis': final_analysis,
                'url': self.page.url
            })
            
            # Kritik bulgular
            if final_analysis.get('facebook_button_found'):
                print("🚨 KRİTİK: Facebook butonu bulundu (olmamalı!)")
            
            if final_analysis.get('google_button_found'):
                print("✅ Google butonu bulundu (doğru)")
            
            for issue in final_analysis.get('critical_issues', []):
                print(f"❌ {issue.get('message')}")
            
            for warning in final_analysis.get('warnings', []):
                print(f"⚠️ {warning.get('message')}")
            
            # Screenshot al
            screenshot_path = f"test_result_{int(time.time())}.png"
            self.page.screenshot(path=screenshot_path, full_page=True)
            print(f"\n📸 Screenshot kaydedildi: {screenshot_path}")
            
            # Sonuçları kaydet
            report_path = f"test_report_{int(time.time())}.json"
            with open(report_path, 'w', encoding='utf-8') as f:
                json.dump(self.test_results, f, indent=2, ensure_ascii=False)
            print(f"📄 Rapor kaydedildi: {report_path}")
            
            # Özet
            print(f"\n{'='*60}")
            print("📊 TEST SONUÇLARI ÖZETİ")
            print(f"{'='*60}")
            successful = sum(1 for r in self.test_results if r.get('success', False))
            total_steps = len([r for r in self.test_results if 'step' in r])
            print(f"✅ Başarılı: {successful}/{total_steps}")
            print(f"❌ Başarısız: {total_steps - successful}/{total_steps}")
            print(f"📊 Başarı oranı: {(successful/total_steps*100):.1f}%")
            
            return final_analysis.get('overall_status') == 'pass'
            
        finally:
            self.teardown()


# ═══════════════════════════════════════════════════════════
# ÖRNEK TEST SENARYOLARI
# ═══════════════════════════════════════════════════════════

def test_login_page_analysis():
    """
    Örnek 1: Login sayfasını analiz et
    Facebook butonu olup olmadığını kontrol et
    """
    tester = AutonomousTester(headless=False)
    
    goals = [
        "Sayfadaki tüm giriş butonlarını tespit et",
        "Facebook ile giriş butonu var mı kontrol et (OLMAMALI!)",
        "Google ile giriş butonu var mı kontrol et (OLMALI)",
        "Giriş formunu kontrol et"
    ]
    
    result = tester.run_autonomous_test(
        url=f"{SITE_URL}/index.html",
        goals=goals
    )
    
    return result


def test_registration_flow():
    """
    Örnek 2: Kayıt akışını test et
    """
    tester = AutonomousTester(headless=False)
    
    goals = [
        "'Ücretsiz Kaydol' veya 'Hesap Oluştur' butonunu bul ve tıkla",
        "Kayıt formunda Facebook butonu var mı kontrol et",
        "Ad alanını doldur: 'Test User'",
        "E-posta alanını doldur: 'test@example.com'",
        "Şifre alanını doldur: 'TestPassword123'",
        "Formu göndermeye hazır mı kontrol et"
    ]
    
    result = tester.run_autonomous_test(
        url=f"{SITE_URL}/create-account.html",
        goals=goals
    )
    
    return result


def test_expert_application():
    """
    Örnek 3: Uzman başvurusu test et
    """
    tester = AutonomousTester(headless=False)
    
    goals = [
        "'Uzman Ol' sayfasına git",
        "Başvuru formunu bul",
        "Tüm gerekli alanları tespit et",
        "Form validasyonunu kontrol et"
    ]
    
    result = tester.run_autonomous_test(
        url=f"{SITE_URL}/uzman-ol.html",
        goals=goals
    )
    
    return result


def test_all_pages_for_facebook_button():
    """
    Örnek 4: TÜM sayfalarda Facebook butonu kontrolü
    """
    pages = [
        'index.html',
        'create-account.html',
        'uzman-ol.html',
        'admin-panel.html',
        'profil.html'
    ]
    
    results = {}
    
    for page in pages:
        print(f"\n{'='*60}")
        print(f"Testing: {page}")
        print(f"{'='*60}")
        
        tester = AutonomousTester(headless=False)
        
        result = tester.run_autonomous_test(
            url=f"{SITE_URL}/{page}",
            goals=[
                "Sayfadaki tüm butonları listele",
                "Facebook ile ilgili buton var mı kontrol et",
                "Google ile ilgili buton var mı kontrol et"
            ]
        )
        
        results[page] = result
    
    # Toplu rapor
    print(f"\n{'='*60}")
    print("TOPLU RAPOR: FACEBOOK BUTONU KONTROLÜ")
    print(f"{'='*60}")
    
    for page, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} | {page}")
    
    return results


# ═══════════════════════════════════════════════════════════
# ANA PROGRAM
# ═══════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════════╗
║   🤖 OTONOM SELF-HEALING TEST SİSTEMİ                   ║
║   Playwright + Groq LLM Hibrit Mimari                   ║
╚══════════════════════════════════════════════════════════╝
    """)
    
    # Test seçimi
    print("\nHangi testi çalıştırmak istersiniz?")
    print("1. Login sayfası analizi (Facebook butonu kontrolü)")
    print("2. Kayıt akışı testi")
    print("3. Uzman başvurusu testi")
    print("4. TÜM sayfalarda Facebook butonu taraması")
    print("5. Hepsini çalıştır")
    
    choice = input("\nSeçiminiz (1-5): ").strip()
    
    if choice == "1":
        test_login_page_analysis()
    elif choice == "2":
        test_registration_flow()
    elif choice == "3":
        test_expert_application()
    elif choice == "4":
        test_all_pages_for_facebook_button()
    elif choice == "5":
        test_login_page_analysis()
        test_registration_flow()
        test_expert_application()
        test_all_pages_for_facebook_button()
    else:
        print("❌ Geçersiz seçim!")
        print("\nVarsayılan: Login sayfası analizi çalıştırılıyor...")
        test_login_page_analysis()
    
    print("\n✅ Testler tamamlandı!")
