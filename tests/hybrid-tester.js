import { chromium } from 'playwright';
import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Groq AI client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Test yapılandırması
const CONFIG = {
  siteUrl: process.env.SITE_URL || 'https://isbul.online',
  screenshotDir: path.join(__dirname, 'screenshots'),
  reportDir: path.join(__dirname, 'reports'),
  timeout: 30000,
  viewports: {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 }
  }
};

// Test edilecek sayfalar
const PAGES = [
  { name: 'Ana Sayfa', path: 'index.html', critical: true },
  { name: 'Admin Panel', path: 'admin-panel.html', critical: true },
  { name: 'Uzman Ol', path: 'uzman-ol.html', critical: true },
  { name: 'Uzmanlar', path: 'uzmanlar.html', critical: false },
  { name: 'Uzman Panel', path: 'uzman-panel.html', critical: true },
  { name: 'Profil', path: 'profil.html', critical: false },
  { name: 'Uzman Profil', path: 'uzman-profil.html', critical: false },
  { name: 'Hizmetler', path: 'hizmetler.html', critical: false },
  { name: 'Hakkımızda', path: 'hakkimizda.html', critical: false },
  { name: 'Nasıl Çalışır', path: 'nasil-calisir.html', critical: false },
  { name: 'Blog', path: 'blog.html', critical: false },
  { name: 'Hesap Oluştur', path: 'create-account.html', critical: true },
  { name: 'Şifremi Unuttum', path: 'forgot-password.html', critical: false },
  { name: 'Şifre Sıfırla', path: 'reset-password.html', critical: false },
  { name: 'KVKK', path: 'kvkk.html', critical: false },
  { name: 'Gizlilik', path: 'gizlilik.html', critical: false },
  { name: 'Şartlar', path: 'sartlar.html', critical: false }
];

// Test sonuçları
const results = {
  timestamp: new Date().toISOString(),
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  },
  pages: []
};

// Klasörleri oluştur
function setupDirectories() {
  [CONFIG.screenshotDir, CONFIG.reportDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Groq AI ile görsel analiz (timeout ile)
async function analyzeWithGroq(screenshotPath, pageName, pageUrl) {
  const AI_TIMEOUT = 45000; // 45 saniye timeout
  
  try {
    console.log(`🧠 Groq AI analizi yapılıyor: ${pageName}...`);
    
    const imageBuffer = fs.readFileSync(screenshotPath);
    const base64Image = imageBuffer.toString('base64');
    
    // Timeout ile Promise.race kullan
    const analysisPromise = groq.chat.completions.create({
      model: "qwen/qwen3.6-27b",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Sen çok deneyimli bir QA Test Uzmanısın. Bu web sayfasının ekran görüntüsünü pixel pixel inceleyip DETAYLI analiz yapacaksın.

📄 SAYFA: ${pageName}
🔗 URL: ${pageUrl}

🔍 KRİTİK KONTROLLER (ÇOK ÖNEMLİ):
${pageName.includes('Admin') ? '⚠️ BU ADMIN PANELİ - Açılıp açılmadığını kontrol et!' : ''}
${pageName.includes('Uzman') ? '⚠️ BU UZMAN SAYFASI - Uzman özellikleri tam mı?' : ''}

🚨 HATALAR (ERROR):
1. ❌ Admin Panel açılmıyor mu? (boş sayfa, hata mesajı var mı?)
2. ❌ Facebook login butonu VAR MI? (OLMAMALI! Sadece Google olmalı)
3. ❌ Butonlar eksik, kırık veya çalışmaz görünüyor mu?
4. ❌ Sayfada "404", "Error", "Undefined" gibi hata mesajları var mı?
5. ❌ Layout tamamen bozuk mu? (elementler üst üste, dışarı taşmış)
6. ❌ Footer linkleri yanlış sayfaya mı gidiyor?
7. ❌ Resimlerde kırık icon var mı? (placeholder, alt text görünüyor)
8. ❌ Form alanları bozuk mu? (input, textarea düzgün görünmüyor)
9. ❌ Modal/popup açılmamış mı? (açık kalması gereken)
10. ❌ Menü çalışmıyor mu? (hamburger menü, dropdown)

⚠️ UYARILAR (WARNING):
1. ⚠️ Renk kontrastı düşük mü? (okumak zor)
2. ⚠️ Yazım hataları var mı? (Türkçe karakter, dilbilgisi)
3. ⚠️ Butonlar çok küçük mü? (mobilde tıklanamaz)
4. ⚠️ Boşluklar tutarsız mı? (padding, margin sorunları)
5. ⚠️ Hizalama problemleri var mı? (text align, flex bozuk)
6. ⚠️ İkonlar eksik veya yanlış mı?
7. ⚠️ Loading indicator sonsuz dönüyor mu?
8. ⚠️ Görsel kalitesi düşük mü? (pixelated, bulanık)
9. ⚠️ Responsive problemi var mı? (mobilde kırık)
10. ⚠️ Tooltip/hover efektleri görünüyor mu?

✅ OLUMLU GÖZLEMLER:
1. ✅ Sayfanın en iyi 3 özelliğini belirt
2. ✅ İyi çalışan tasarım elementleri
3. ✅ Kullanıcı dostu özellikler

📊 DETAYLI ANALİZ:
- Sayfadaki BÜTÜN butonları say ve listele (hangi butonlar var?)
- Footer'daki linkleri oku ve listele
- Renk paletiİ tutarlı mı?
- Typography (font boyutları) uygun mu?
- Görsel hiyerarşi doğru mu?

🎯 JSON FORMATINDA DÖNDÜR:
{
  "status": "success" | "warning" | "error",
  "criticalIssues": [
    {"type": "error", "severity": "critical", "message": "Detaylı açıklama", "location": "Sayfanın neresi"}
  ],
  "warnings": [
    {"type": "warning", "severity": "medium", "message": "Detaylı açıklama", "location": "Sayfanın neresi"}
  ],
  "positive": ["Olumlu gözlem 1", "Olumlu gözlem 2", ...],
  "buttons": ["Buton 1", "Buton 2", ...],
  "footerLinks": ["Link 1", "Link 2", ...],
  "colorContrast": "iyi" | "orta" | "kötü",
  "mobileResponsive": "iyi" | "sorunlu" | "bozuk",
  "overall": "3-4 cümle detaylı genel değerlendirme"
}

⚡ ÖNEMLİ: Gördüğün HER HATAYA dikkat et! Küçük detayları kaçırma!`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI timeout')), AI_TIMEOUT)
    );

    const completion = await Promise.race([analysisPromise, timeoutPromise]);

    const response = completion.choices[0]?.message?.content || '{}';
    
    // JSON'u parse et
    let analysis;
    try {
      // JSON kısmını çıkar (eğer markdown içinde ise)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch (e) {
      console.warn('⚠️ JSON parse hatası, ham yanıt kullanılıyor');
      analysis = {
        status: 'warning',
        issues: [],
        positive: [],
        overall: response
      };
    }
    
    return analysis;
  } catch (error) {
    console.error(`❌ Groq AI hatası:`, error.message);
    return {
      status: 'error',
      issues: [{ type: 'error', message: `AI analizi yapılamadı: ${error.message}` }],
      positive: [],
      overall: 'AI analizi başarısız'
    };
  }
}

// Playwright ile teknik test
async function testPageTechnical(page, pageInfo) {
  const url = `${CONFIG.siteUrl}/${pageInfo.path}`;
  const testResult = {
    name: pageInfo.name,
    path: pageInfo.path,
    url: url,
    critical: pageInfo.critical,
    timestamp: new Date().toISOString(),
    technical: {
      loadTime: 0,
      status: 'unknown',
      consoleErrors: [],
      networkErrors: [],
      accessibility: [],
      buttons: [],
      links: []
    },
    ai: null,
    screenshots: {},
    overall: 'pending'
  };

  try {
    console.log(`\n📄 Test ediliyor: ${pageInfo.name} (${url})`);
    
    // Console hatalarını yakala
    page.on('console', msg => {
      if (msg.type() === 'error') {
        testResult.technical.consoleErrors.push(msg.text());
      }
    });

    // Network hatalarını yakala
    page.on('response', response => {
      if (response.status() >= 400) {
        testResult.technical.networkErrors.push({
          url: response.url(),
          status: response.status()
        });
      }
    });

    // Sayfayı aç ve zamanla
    const startTime = Date.now();
    const response = await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: CONFIG.timeout 
    });
    testResult.technical.loadTime = Date.now() - startTime;
    testResult.technical.status = response?.status() || 0;

    console.log(`  ⏱️ Yükleme süresi: ${testResult.technical.loadTime}ms`);
    console.log(`  📊 HTTP Status: ${testResult.technical.status}`);

    // Screenshot al (Desktop)
    await page.setViewportSize(CONFIG.viewports.desktop);
    await page.waitForTimeout(2000); // Sayfanın render olmasını bekle
    
    const desktopScreenshot = path.join(
      CONFIG.screenshotDir,
      `${pageInfo.path.replace('.html', '')}-desktop.png`
    );
    await page.screenshot({ path: desktopScreenshot, fullPage: true });
    testResult.screenshots.desktop = desktopScreenshot;
    console.log(`  📸 Desktop screenshot alındı`);

    // Mobile screenshot
    await page.setViewportSize(CONFIG.viewports.mobile);
    await page.waitForTimeout(1000);
    const mobileScreenshot = path.join(
      CONFIG.screenshotDir,
      `${pageInfo.path.replace('.html', '')}-mobile.png`
    );
    await page.screenshot({ path: mobileScreenshot, fullPage: true });
    testResult.screenshots.mobile = mobileScreenshot;
    console.log(`  📱 Mobile screenshot alındı`);

    // Desktop'a geri dön
    await page.setViewportSize(CONFIG.viewports.desktop);
    await page.waitForTimeout(1000);

    // Butonları test et
    try {
      const buttons = await page.locator('button, .btn, [role="button"]').all();
      console.log(`  🔘 ${buttons.length} buton bulundu`);
      
      for (const button of buttons.slice(0, 10)) { // İlk 10 buton
        try {
          const text = await button.textContent();
          const isVisible = await button.isVisible();
          const isEnabled = await button.isEnabled();
          
          testResult.technical.buttons.push({
            text: text?.trim() || 'Boş',
            visible: isVisible,
            enabled: isEnabled
          });
        } catch (e) {
          // Buton kontrolü başarısız
        }
      }
    } catch (e) {
      console.log(`  ⚠️ Buton testi yapılamadı`);
    }

    // Linkleri kontrol et
    try {
      const links = await page.locator('a[href]').all();
      console.log(`  🔗 ${links.length} link bulundu`);
      
      for (const link of links.slice(0, 20)) { // İlk 20 link
        try {
          const href = await link.getAttribute('href');
          const text = await link.textContent();
          
          if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
            testResult.technical.links.push({
              href,
              text: text?.trim() || 'Boş'
            });
          }
        } catch (e) {
          // Link kontrolü başarısız
        }
      }
    } catch (e) {
      console.log(`  ⚠️ Link testi yapılamadı`);
    }

    // GELİŞMİŞ Accessibility & UX kontrolleri
    try {
      const accessibilityIssues = [];
      
      // Alt text eksik resimler
      const imgsWithoutAlt = await page.locator('img:not([alt])').count();
      if (imgsWithoutAlt > 0) {
        accessibilityIssues.push(`${imgsWithoutAlt} resimde alt text eksik`);
      }

      // Form label kontrolü
      const inputsWithoutLabel = await page.locator('input:not([aria-label]):not([aria-labelledby])').count();
      if (inputsWithoutLabel > 0) {
        accessibilityIssues.push(`${inputsWithoutLabel} input'ta label eksik`);
      }

      // Heading hiyerarşisi kontrolü
      const h1Count = await page.locator('h1').count();
      if (h1Count === 0) {
        accessibilityIssues.push('H1 başlığı yok (SEO sorunu)');
      } else if (h1Count > 1) {
        accessibilityIssues.push(`${h1Count} tane H1 var (sadece 1 olmalı)`);
      }

      // Kırık resimler kontrolü
      const brokenImages = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.filter(img => !img.complete || img.naturalHeight === 0).length;
      });
      if (brokenImages > 0) {
        accessibilityIssues.push(`${brokenImages} kırık resim bulundu`);
      }

      // Çok küçük butonlar (mobilde tıklanamaz)
      const smallButtons = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, .btn, [role="button"]'));
        return buttons.filter(btn => {
          const rect = btn.getBoundingClientRect();
          return rect.width < 44 || rect.height < 44; // Apple minimum 44x44px
        }).length;
      });
      if (smallButtons > 0) {
        accessibilityIssues.push(`${smallButtons} buton çok küçük (< 44x44px)`);
      }

      // Link contrast kontrolü
      const lowContrastLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        return links.filter(link => {
          const style = window.getComputedStyle(link);
          return style.textDecoration === 'none' && style.color === style.backgroundColor;
        }).length;
      });
      if (lowContrastLinks > 0) {
        accessibilityIssues.push(`${lowContrastLinks} link'te kontrast sorunu`);
      }

      // Empty links
      const emptyLinks = await page.locator('a:not([aria-label])').filter({ hasText: /^\s*$/ }).count();
      if (emptyLinks > 0) {
        accessibilityIssues.push(`${emptyLinks} boş link bulundu`);
      }

      testResult.technical.accessibility = accessibilityIssues;
      
      if (accessibilityIssues.length > 0) {
        console.log(`  ♿ Accessibility sorunları: ${accessibilityIssues.length}`);
      }
    } catch (e) {
      console.log(`  ⚠️ Accessibility testi yapılamadı: ${e.message}`);
    }

    // SPESİFİK SAYFA TESTLERİ
    try {
      console.log(`  🔍 Spesifik testler yapılıyor...`);
      
      // Admin Panel özel testi
      if (pageInfo.path.includes('admin-panel')) {
        const hasAdminContent = await page.evaluate(() => {
          const bodyText = document.body.textContent || '';
          return bodyText.includes('Admin') || bodyText.includes('Panel') || 
                 bodyText.includes('Yönetim') || bodyText.includes('Dashboard');
        });
        if (!hasAdminContent) {
          testResult.technical.consoleErrors.push('⚠️ UYARI: Admin panel içeriği bulunamadı');
        }
      }

      // Facebook login butonu kontrolü (olmamalı)
      const facebookLoginExists = await page.locator('button, a').filter({ hasText: /facebook/i }).count();
      if (facebookLoginExists > 0) {
        testResult.technical.consoleErrors.push(`❌ KRİTİK: ${facebookLoginExists} adet Facebook login butonu bulundu (olmamalı!)`);
      }

      // Google login kontrolü
      const googleLoginExists = await page.locator('button, a').filter({ hasText: /google/i }).count();
      console.log(`  🔐 Google login: ${googleLoginExists > 0 ? '✅ Var' : '❌ Yok'}`);

      // Error mesajları sayfada var mı?
      const errorTextExists = await page.evaluate(() => {
        const bodyText = document.body.textContent || '';
        const errorKeywords = ['404', '500', 'Error', 'Undefined', 'null', 'NaN', 'Cannot read'];
        return errorKeywords.filter(keyword => bodyText.includes(keyword));
      });
      if (errorTextExists.length > 0) {
        testResult.technical.consoleErrors.push(`⚠️ Sayfada hata mesajları görünüyor: ${errorTextExists.join(', ')}`);
      }

      // Loading spinner sonsuz dönüyor mu?
      const loadingSpinner = await page.locator('.loading, .spinner, [role="progressbar"]').count();
      if (loadingSpinner > 0) {
        await page.waitForTimeout(2000);
        const stillLoading = await page.locator('.loading, .spinner, [role="progressbar"]').count();
        if (stillLoading > 0) {
          testResult.technical.consoleErrors.push('⚠️ Loading indicator hala görünüyor (sonsuz yükleme?)');
        }
      }

    } catch (e) {
      console.log(`  ⚠️ Spesifik testler yapılamadı: ${e.message}`);
    }

    console.log(`  ✅ Teknik testler tamamlandı`);

    // Groq AI ile analiz yap (Desktop screenshot kullan)
    testResult.ai = await analyzeWithGroq(
      desktopScreenshot,
      pageInfo.name,
      url
    );

    // Genel durum belirle
    if (testResult.technical.status >= 400 || testResult.technical.consoleErrors.length > 3) {
      testResult.overall = 'error';
    } else if (
      testResult.ai.status === 'error' ||
      testResult.technical.networkErrors.length > 0 ||
      testResult.technical.consoleErrors.length > 0
    ) {
      testResult.overall = 'warning';
    } else {
      testResult.overall = 'success';
    }

  } catch (error) {
    console.error(`  ❌ Hata: ${error.message}`);
    testResult.overall = 'error';
    testResult.technical.consoleErrors.push(`Test hatası: ${error.message}`);
  }

  return testResult;
}

// HTML rapor oluştur
function generateHTMLReport(results) {
  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>İsBul Test Raporu - ${new Date().toLocaleDateString('tr-TR')}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 { font-size: 32px; margin-bottom: 10px; }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        .summary-card h3 { color: #666; font-size: 14px; margin-bottom: 10px; }
        .summary-card .number { font-size: 48px; font-weight: bold; }
        .summary-card.success .number { color: #10b981; }
        .summary-card.error .number { color: #ef4444; }
        .summary-card.warning .number { color: #f59e0b; }
        .page-result {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f0f0f0;
        }
        .page-title { font-size: 24px; font-weight: bold; }
        .badge {
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .badge.success { background: #d1fae5; color: #065f46; }
        .badge.error { background: #fee2e2; color: #991b1b; }
        .badge.warning { background: #fef3c7; color: #92400e; }
        .section {
            margin: 20px 0;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
        }
        .section h3 {
            font-size: 16px;
            margin-bottom: 15px;
            color: #374151;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .screenshots {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 15px;
        }
        .screenshot-item img {
            width: 100%;
            border-radius: 8px;
            border: 2px solid #e5e7eb;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .screenshot-item p {
            margin-top: 8px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
        }
        .issue-list { list-style: none; }
        .issue-item {
            padding: 10px;
            margin: 8px 0;
            border-radius: 6px;
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }
        .issue-item.error { background: #fee2e2; color: #991b1b; }
        .issue-item.warning { background: #fef3c7; color: #92400e; }
        .issue-item.success { background: #d1fae5; color: #065f46; }
        .icon { font-size: 18px; }
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
        }
        .metric {
            padding: 15px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        .metric-label { font-size: 12px; color: #6b7280; margin-bottom: 5px; }
        .metric-value { font-size: 20px; font-weight: bold; color: #111827; }
        .footer {
            text-align: center;
            padding: 30px;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🤖 İsBul Hibrit Test Raporu</h1>
            <p>Playwright + Groq AI Vision Analizi</p>
            <p style="opacity: 0.9; margin-top: 10px;">📅 ${new Date(results.timestamp).toLocaleString('tr-TR')}</p>
        </header>

        <div class="summary">
            <div class="summary-card">
                <h3>Toplam Test</h3>
                <div class="number">${results.summary.total}</div>
            </div>
            <div class="summary-card success">
                <h3>Başarılı</h3>
                <div class="number">${results.summary.passed}</div>
            </div>
            <div class="summary-card error">
                <h3>Hatalı</h3>
                <div class="number">${results.summary.failed}</div>
            </div>
            <div class="summary-card warning">
                <h3>Uyarı</h3>
                <div class="number">${results.summary.warnings}</div>
            </div>
        </div>

        ${results.pages.map(page => `
            <div class="page-result">
                <div class="page-header">
                    <div>
                        <div class="page-title">${page.name}</div>
                        <a href="${page.url}" target="_blank" style="color: #667eea; font-size: 14px;">${page.url}</a>
                    </div>
                    <span class="badge ${page.overall}">${page.overall.toUpperCase()}</span>
                </div>

                <div class="section">
                    <h3>📊 Teknik Metrikler</h3>
                    <div class="metrics">
                        <div class="metric">
                            <div class="metric-label">Yükleme Süresi</div>
                            <div class="metric-value">${page.technical.loadTime}ms</div>
                        </div>
                        <div class="metric">
                            <div class="metric-label">HTTP Status</div>
                            <div class="metric-value">${page.technical.status}</div>
                        </div>
                        <div class="metric">
                            <div class="metric-label">Console Hatası</div>
                            <div class="metric-value" style="color: ${page.technical.consoleErrors.length > 0 ? '#ef4444' : '#10b981'}">${page.technical.consoleErrors.length}</div>
                        </div>
                        <div class="metric">
                            <div class="metric-label">Network Hatası</div>
                            <div class="metric-value" style="color: ${page.technical.networkErrors.length > 0 ? '#ef4444' : '#10b981'}">${page.technical.networkErrors.length}</div>
                        </div>
                    </div>
                </div>

                ${page.technical.consoleErrors.length > 0 ? `
                <div class="section">
                    <h3>❌ Console Hataları</h3>
                    <ul class="issue-list">
                        ${page.technical.consoleErrors.map(err => `
                            <li class="issue-item error">
                                <span class="icon">🔴</span>
                                <span>${err}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                ` : ''}

                ${page.technical.networkErrors.length > 0 ? `
                <div class="section">
                    <h3>🌐 Network Hataları</h3>
                    <ul class="issue-list">
                        ${page.technical.networkErrors.map(err => `
                            <li class="issue-item error">
                                <span class="icon">🔴</span>
                                <span><strong>${err.status}</strong>: ${err.url}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                ` : ''}

                ${page.technical.accessibility.length > 0 ? `
                <div class="section">
                    <h3>♿ Accessibility Sorunları</h3>
                    <ul class="issue-list">
                        ${page.technical.accessibility.map(issue => `
                            <li class="issue-item warning">
                                <span class="icon">⚠️</span>
                                <span>${issue}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                ` : ''}

                ${page.ai ? `
                <div class="section">
                    <h3>🧠 Groq AI Analizi</h3>
                    <p style="margin-bottom: 15px; color: #4b5563;">${page.ai.overall}</p>
                    
                    ${page.ai.issues && page.ai.issues.length > 0 ? `
                    <ul class="issue-list">
                        ${page.ai.issues.map(issue => `
                            <li class="issue-item ${issue.type}">
                                <span class="icon">${issue.type === 'error' ? '🔴' : '⚠️'}</span>
                                <span>${issue.message}</span>
                            </li>
                        `).join('')}
                    </ul>
                    ` : ''}

                    ${page.ai.positive && page.ai.positive.length > 0 ? `
                    <h4 style="margin-top: 15px; margin-bottom: 10px; color: #059669;">✅ Olumlu Gözlemler:</h4>
                    <ul class="issue-list">
                        ${page.ai.positive.map(item => `
                            <li class="issue-item success">
                                <span class="icon">✅</span>
                                <span>${item}</span>
                            </li>
                        `).join('')}
                    </ul>
                    ` : ''}
                </div>
                ` : ''}

                <div class="section">
                    <h3>📸 Ekran Görüntüleri</h3>
                    <div class="screenshots">
                        ${page.screenshots.desktop ? `
                        <div class="screenshot-item">
                            <a href="${path.relative(CONFIG.reportDir, page.screenshots.desktop)}" target="_blank">
                                <img src="${path.relative(CONFIG.reportDir, page.screenshots.desktop)}" alt="${page.name} Desktop">
                            </a>
                            <p>🖥️ Desktop</p>
                        </div>
                        ` : ''}
                        ${page.screenshots.mobile ? `
                        <div class="screenshot-item">
                            <a href="${path.relative(CONFIG.reportDir, page.screenshots.mobile)}" target="_blank">
                                <img src="${path.relative(CONFIG.reportDir, page.screenshots.mobile)}" alt="${page.name} Mobile">
                            </a>
                            <p>📱 Mobile</p>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('')}

        <div class="footer">
            <p>🤖 İsBul Hibrit Test Sistemi - Playwright + Groq AI Vision</p>
            <p style="margin-top: 5px;">Test Tarihi: ${new Date().toLocaleString('tr-TR')}</p>
        </div>
    </div>
</body>
</html>`;

  const reportPath = path.join(CONFIG.reportDir, `test-report-${Date.now()}.html`);
  fs.writeFileSync(reportPath, html);
  return reportPath;
}

// Ana test fonksiyonu
async function runTests() {
  console.log('🚀 İsBul Hibrit Test Sistemi Başlatılıyor...\n');
  console.log('🤖 Playwright + Groq AI Vision\n');
  
  setupDirectories();

  const browser = await chromium.launch({ 
    headless: true,
    args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
  });
  
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();

  // Her sayfayı test et
  for (const pageInfo of PAGES) {
    const result = await testPageTechnical(page, pageInfo);
    results.pages.push(result);
    results.summary.total++;
    
    if (result.overall === 'success') results.summary.passed++;
    else if (result.overall === 'error') results.summary.failed++;
    else if (result.overall === 'warning') results.summary.warnings++;
  }

  await browser.close();

  // Raporları oluştur
  console.log('\n📊 Raporlar oluşturuluyor...');
  
  // JSON rapor
  const jsonReportPath = path.join(CONFIG.reportDir, `test-report-${Date.now()}.json`);
  fs.writeFileSync(jsonReportPath, JSON.stringify(results, null, 2));
  console.log(`✅ JSON rapor: ${jsonReportPath}`);

  // HTML rapor
  const htmlReportPath = generateHTMLReport(results);
  console.log(`✅ HTML rapor: ${htmlReportPath}`);

  // Özet
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SONUÇLARI ÖZET');
  console.log('='.repeat(60));
  console.log(`✅ Başarılı: ${results.summary.passed}/${results.summary.total}`);
  console.log(`⚠️  Uyarı: ${results.summary.warnings}/${results.summary.total}`);
  console.log(`❌ Hatalı: ${results.summary.failed}/${results.summary.total}`);
  console.log('='.repeat(60));
  console.log(`\n🎉 Test tamamlandı! HTML raporunu aç: ${htmlReportPath}\n`);

  return results;
}

// Çalıştır
runTests().catch(console.error);
