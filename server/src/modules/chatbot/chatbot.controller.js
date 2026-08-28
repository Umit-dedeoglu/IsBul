/**
 * AI Chatbot - TeknoCANE Benzeri Asistan
 * Groq (Llama 3.1 70B) - Ücretsiz ve hızlı
 */
const Groq = require('groq-sdk');
const { dbAll, dbGet } = require('../../db');

// Lazy init — key yoksa crash etme, istekte hata döndür
let groq = null;
function getGroq() {
  if (!groq && process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

/** POST /api/v1/chatbot/chat */
async function chat(req, res) {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Mesaj gerekli.' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({ 
        success: false, 
        error: 'AI servisi şu an kullanılamıyor. GROQ_API_KEY eksik.' 
      });
    }

    // Kullanıcı bilgisini al (giriş yapmışsa)
    const user = req.user ? dbGet('SELECT * FROM users WHERE id = ?', req.user.id) : null;
    const userContext = user ? {
      name: `${user.first_name} ${user.last_name}`,
      role: user.role,
      isExpert: user.role === 'expert' || user.role === 'admin',
    } : { name: 'Misafir', role: 'customer', isExpert: false };

    // Sistem prompt'u - İşBul asistanı
    const systemPrompt = `Sen İşBul platformunun AI asistanısın. Adın "İşBul Asistan". Türkçe konuşuyorsun.

**İşBul Hakkında:**
- Hizmet platformu: Elektrikçi, tesisatçı, temizlikçi, nakliyat gibi uzmanlar
- Müşteriler uzman bulup rezervasyon yapabilir
- Uzmanlar profil oluşturup iş alabilir
- Admin paneli ile yönetim

**Kullanıcı Bilgisi:**
- İsim: ${userContext.name}
- Rol: ${userContext.role === 'customer' ? 'Müşteri' : userContext.role === 'expert' ? 'Uzman' : userContext.role === 'admin' ? 'Admin' : 'Misafir'}
${userContext.isExpert ? '- Uzman olarak aktif' : ''}

**Yapabileceklerin:**
1. Uzman arama yardımı ("İstanbul'da elektrikçi lazım")
2. Rezervasyon durumu sorgulama
3. Platform kullanımı hakkında bilgi
4. Uzman başvurusu nasıl yapılır
5. Genel sorular

**Ton:** Samimi, yardımsever, profesyonel. Kısa ve net yanıtlar ver. Emoji kullanabilirsin.`;

    // Konuşma geçmişini hazırla
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    // Groq API çağrısı
    const client = getGroq();
    if (!client) {
      return res.status(503).json({ success: false, error: 'Chatbot servisi şu an kullanılamıyor.' });
    }
    const completion = await client.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 500,
      top_p: 0.9,
    });

    const reply = completion.choices[0]?.message?.content || 'Üzgünüm, bir hata oluştu.';

    return res.json({
      success: true,
      data: {
        reply,
        conversationId: req.user?.id || 'guest_' + Date.now(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[chatbot]', err.message);
    
    // Groq API hatalarını ayıkla
    if (err.message?.includes('API key')) {
      return res.status(503).json({ 
        success: false, 
        error: 'AI servisi yapılandırılmamış.' 
      });
    }

    return res.status(500).json({ 
      success: false, 
      error: 'Chatbot yanıt veremiyor. Lütfen tekrar deneyin.' 
    });
  }
}

/** GET /api/v1/chatbot/suggestions */
function getSuggestions(req, res) {
  const user = req.user;
  const isExpert = user && (user.role === 'expert' || user.role === 'admin');

  const customerSuggestions = [
    '💡 İstanbul\'da elektrikçi lazım',
    '📅 Rezervasyonumu iptal etmek istiyorum',
    '❓ Uzmanları nasıl değerlendirebilirim?',
    '🏠 Evime temizlik hizmeti nasıl bulabilirim?',
  ];

  const expertSuggestions = [
    '📊 Bugün kaç rezervasyonum var?',
    '⭐ Puanımı nasıl yükseltebilirim?',
    '💰 Ücretimi nasıl güncellerim?',
    '📱 Profil fotoğrafımı nasıl değiştiririm?',
  ];

  return res.json({
    success: true,
    data: {
      suggestions: isExpert ? expertSuggestions : customerSuggestions,
    },
  });
}

module.exports = { chat, getSuggestions };
