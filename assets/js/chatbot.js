/**
 * İşBul – AI Chatbot Widget
 * - Canlı ortamda backend API (Groq/Llama) kullanır
 * - API erişilemezse yerel akıllı yanıt motoruna düşer
 */

/* ─────────────────────────────────────────────────────────
   YEREL YANIT MOTORU (API yoksa devreye girer)
───────────────────────────────────────────────────────── */
const LocalChatEngine = {
  // Şehir tespiti
  _sehirTespit(msg) {
    if (typeof ILLER === 'undefined') return null;
    const lower = msg.toLowerCase();
    return Object.keys(ILLER).find(il => lower.includes(il.toLowerCase())) || null;
  },

  // Kategori tespiti
  _kategoriTespit(msg) {
    const lower = msg.toLowerCase();
    const haritasi = {
      'elektrik':  ['elektrik','elektrikçi','sigorta','priz','aydınlatma','kablo','electrician','electrical','electric','wiring','outlet','lighting'],
      'tesisat':   ['tesisat','tesisatçı','su','musluk','tıkanıklık','boru','doğalgaz','kalorifer','plumber','plumbing','pipe','faucet','drain','gas','boiler'],
      'temizlik':  ['temizlik','temizlikçi','ev temizliği','derin temizlik','cleaning','cleaner','clean','maid','housekeeping'],
      'montaj':    ['montaj','mobilya','raf','gardırop','ikea','dolap','tv montaj','assembly','furniture','shelf','wardrobe','installation','mount','tv mount'],
      'boya':      ['boya','boyacı','badana','dekorasyon','duvar kağıdı','painting','painter','paint','wallpaper','decoration'],
      'nakliyat':  ['nakliyat','nakliye','taşıma','ev taşıma','taşınma','moving','mover','relocation','transport'],
      'bahce':     ['bahçe','çim','budama','peyzaj','garden','gardening','lawn','landscaping','pruning'],
      'tadilat':   ['tadilat','seramik','fayans','alçıpan','asma tavan','parke','renovation','remodel','tile','flooring','ceiling'],
      'klima':     ['klima','havalandırma','soğutma','air conditioning','ac','hvac','cooling'],
    };
    for (const [kat, kelimeler] of Object.entries(haritasi)) {
      if (kelimeler.some(k => lower.includes(k))) return kat;
    }
    return null;
  },

  // Uzmana yönlendirme cevabı
  _uzmanOner(sehir, kategori, dil = 'tr') {
    if (typeof TÜM_UZMANLAR === 'undefined') return null;
    let liste = TÜM_UZMANLAR;
    if (sehir)    liste = liste.filter(u => u.city.toLowerCase() === sehir.toLowerCase());
    if (kategori) liste = liste.filter(u => (u.categories||[]).includes(kategori));
    if (!liste.length && sehir)    liste = TÜM_UZMANLAR.filter(u => u.city.toLowerCase() === sehir.toLowerCase());
    if (!liste.length && kategori) liste = TÜM_UZMANLAR.filter(u => (u.categories||[]).includes(kategori));
    if (!liste.length) return null;

    liste = [...liste].sort((a,b) => b.rating - a.rating).slice(0,3);

    if (dil === 'en') {
      const cityStr    = sehir    ? ` in ${sehir}` : '';
      const catStr     = kategori ? ` ${kategori}` : '';
      let reply = `Here are ${liste.length} expert${liste.length > 1 ? 's' : ''}${cityStr} for${catStr}:\n\n`;
      liste.forEach((u,i) => {
        reply += `${i+1}. **${u.name}** — ⭐ ${u.rating} (${u.reviews} reviews)\n`;
        reply += `   💰 ₺${u.price}/hr • ${u.experience} experience\n`;
        reply += `   📍 ${u.city}\n\n`;
      });
      reply += `Visit our [Experts page](uzmanlar.html) to make a reservation.`;
      return reply;
    }

    // Türkçe (varsayılan)
    const sehirStr    = sehir    ? ` ${sehir}'da` : '';
    const kategoriStr = kategori ? ` ${kategori}` : '';
    let cevap = `${sehirStr}${kategoriStr} için size ${liste.length} uzman önerebilirim:\n\n`;
    liste.forEach((u,i) => {
      cevap += `${i+1}. **${u.name}** — ⭐ ${u.rating} (${u.reviews} yorum)\n`;
      cevap += `   💰 ₺${u.price}/saat • ${u.experience} deneyim\n`;
      cevap += `   📍 ${u.city}\n\n`;
    });
    cevap += `Rezervasyon yapmak için [Uzmanlar sayfasına](uzmanlar.html) gidebilirsiniz.`;
    return cevap;
  },

  // Uzman adı tespiti (çekim eklerine dayanıklı)
  _uzmanBul(msg) {
    if (typeof TÜM_UZMANLAR === 'undefined') return null;
    const lower = msg.toLowerCase();
    return TÜM_UZMANLAR.find(u => {
      const parts = u.name.toLowerCase().split(' ');
      return parts.some(part => {
        // "şahin" → "şahine", "şahinin", "şahini", "şahinde" vb. hepsini yakala
        const regex = new RegExp(part + '[a-züçşığöı]{0,4}\\b', 'i');
        return regex.test(lower);
      });
    }) || null;
  },
  _dilTespit(msg) {
    const lower = msg.toLowerCase();
    // Arapça unicode bloğu
    if (/[\u0600-\u06FF]/.test(msg)) return 'ar';
    // Rusça / Kiril
    if (/[\u0400-\u04FF]/.test(msg)) return 'ru';
    // İngilizce — yaygın kelimeler
    const enWords = ['the','is','are','how','what','where','can','do','does','i','you','we','please','need','want','find','help','book','service','price','cost','electrician','plumber','cleaning','furniture','moving','paint','expert','reservation','appointment'];
    if (enWords.some(w => lower.split(/\s+/).includes(w))) return 'en';
    // Almanca
    const deWords = ['ich','sie','wie','was','wo','bitte','brauche','kann','suche','hilfe','preis','experte'];
    if (deWords.some(w => lower.split(/\s+/).includes(w))) return 'de';
    // Fransızca
    const frWords = ['je','vous','comment','quoi','où','puis','besoin','cherche','aide','prix','expert','réservation'];
    if (frWords.some(w => lower.split(/\s+/).includes(w))) return 'fr';
    return 'tr';
  },

  // Ana yanıt üretici
  yanıtla(msg) {
    const lower = msg.toLowerCase().trim();
    const dil   = this._dilTespit(msg);

    // ── Yabancı dil tespiti ──
    if (dil === 'en') return this._yanıtlaEN(msg);
    if (dil === 'de') return 'Hallo! 👋 Ich bin der İşBul-Assistent. Ich helfe Ihnen gerne auf Türkisch oder Englisch. Bitte schreiben Sie auf Englisch, damit ich Ihnen besser helfen kann!';
    if (dil === 'fr') return 'Bonjour! 👋 Je suis l\'assistant İşBul. Je peux vous aider en turc ou en anglais. Veuillez écrire en anglais pour que je puisse mieux vous aider!';
    if (dil === 'ar') return 'مرحباً! 👋 أنا مساعد إشبول. يمكنني مساعدتك باللغة التركية أو الإنجليزية. يرجى الكتابة بالإنجليزية حتى أتمكن من مساعدتك بشكل أفضل!';
    if (dil === 'ru') return 'Привет! 👋 Я ассистент İşBul. Могу помочь вам на турецком или английском языке. Пожалуйста, пишите по-английски!';

    const sehir    = this._sehirTespit(msg);
    const kategori = this._kategoriTespit(msg);

    // ── Önce uzman adı geçiyor mu? (en yüksek öncelik) ──
    const adGecenUzman = this._uzmanBul(msg);
    if (adGecenUzman) {
      if (/(rezervasyon|randevu|rezerve|ayırt|book)/.test(lower)) {
        return `**${adGecenUzman.name}** ile rezervasyon yapmak için:\n\n[${adGecenUzman.name} Profiline Git](uzman-profil.html?id=${adGecenUzman.id})\n\n⭐ ${adGecenUzman.rating} puan • ₺${adGecenUzman.price}/saat • ${adGecenUzman.city}\n\nProfil sayfasında **Rezervasyon Yap** butonuna tıklayarak tarih ve saat seçebilirsiniz.`;
      }
      if (/(müsait|dolu|boş|hangi gün|uygun|takvim|saat|tarih)/.test(lower)) {
        return `**${adGecenUzman.name}**'ın müsait günlerini görmek için:\n\n1. [${adGecenUzman.name} Profiline Git](uzman-profil.html?id=${adGecenUzman.id})\n2. **Rezervasyon Yap** butonuna tıklayın\n3. Takvimde dolu günler kırmızı, müsait günler seçilebilir olarak görünür.`;
      }
      if (/(fiyat|ücret|ne kadar|kaç lira|para)/.test(lower)) {
        return `**${adGecenUzman.name}** için saatlik ücret: **₺${adGecenUzman.price}/saat**\n\n⭐ ${adGecenUzman.rating} puan • ${adGecenUzman.experience} deneyim • ${adGecenUzman.city}\n\n[Profili İncele](uzman-profil.html?id=${adGecenUzman.id})`;
      }
      return `**${adGecenUzman.name}** profiline buradan ulaşabilirsiniz:\n\n[${adGecenUzman.name} Profilini Görüntüle](uzman-profil.html?id=${adGecenUzman.id})\n\n⭐ ${adGecenUzman.rating} puan • ₺${adGecenUzman.price}/saat • ${adGecenUzman.city}`;
    }

    // ── Selamlama ──
    if (/^(merhaba|selam|hey|günaydın|iyi günler)/.test(lower)) {
      return 'Merhaba! 👋 Ben İşBul asistanıyım. Size en uygun uzmanı bulmak, rezervasyon yapmak veya platform hakkında bilgi vermek için buradayım. Nasıl yardımcı olabilirim?';
    }

    // ── Hal hatır ──
    if (/^(nasılsın|nasıl gidiyor|iyi misin|ne haber|naber|keyifler nasıl)/.test(lower)) {
      return 'İyiyim, teşekkür ederim! 😊 Siz nasılsınız? Size nasıl yardımcı olabilirim?';
    }

    // ── Teşekkür ──
    if (/(teşekkür|sağ ol|eyvallah|tamam harika|süper|çok iyi)/.test(lower)) {
      return 'Rica ederim! 😊 Başka bir sorunuz olursa buradayım.';
    }

    // ── Fiyat sorgusu ──
    if (/(fiyat|ücret|ne kadar|kaç lira|para|indirim|kampanya)/.test(lower)) {
      if (kategori) {
        const ornekler = TÜM_UZMANLAR?.filter(u=>(u.categories||[]).includes(kategori)) || [];
        if (ornekler.length) {
          const min = Math.min(...ornekler.map(u=>u.price));
          const max = Math.max(...ornekler.map(u=>u.price));
          return `${kategori.charAt(0).toUpperCase()+kategori.slice(1)} hizmetlerimizde fiyatlar uzman deneyimine göre **₺${min} – ₺${max}/saat** arasında değişmektedir.\n\nFiyatlar; işin kapsamı, şehir ve süreye göre farklılık gösterebilir. Kesin fiyat için uzmanı profil sayfasından inceleyebilir veya mesaj atabilirsiniz.`;
        }
      }
      return 'Fiyatlar hizmet türüne, şehre ve uzmanın deneyimine göre değişmektedir. Genel olarak saatlik ücretler ₺200 – ₺600 arasında seyretmektedir.\n\nBelirli bir hizmet için fiyat öğrenmek ister misiniz?';
    }

    // ── Uzman + Şehir + Kategori ──
    if (sehir || kategori) {
      const uzmanCevap = this._uzmanOner(sehir, kategori);
      if (uzmanCevap) return uzmanCevap;
      const eksik = !sehir ? 'Hangi şehirde hizmet istediğinizi belirtir misiniz?' : 'Hangi hizmet türünü arıyorsunuz?';
      return `${sehir||''}${kategori?' '+kategori:''} için henüz uzman bulunamadı. ${eksik}`;
    }

    // ── Uzman profil linki ──
    if (/(profil|profili|sayfası|sayfasını|profil aç|profilini aç)/.test(lower)) {
      const uzmanAdi = this._uzmanBul(msg);
      if (uzmanAdi) {
        return `**${uzmanAdi.name}** profiline buradan ulaşabilirsiniz:\n\n[${uzmanAdi.name} Profilini Görüntüle](uzman-profil.html?id=${uzmanAdi.id})\n\n⭐ ${uzmanAdi.rating} puan • ₺${uzmanAdi.price}/saat • ${uzmanAdi.city}`;
      }
      return 'Hangi uzmanın profilini görmek istediğinizi belirtir misiniz? [Tüm uzmanları](uzmanlar.html) listeden de inceleyebilirsiniz.';
    }

    // ── Uzman müsaitliği / takvim sorusu ──
    if (/(hangi gün|müsait|dolu|boş|uygun gün|ne zaman|tarih|saat|takvim)/.test(lower)) {
      const uzmanAdi = this._uzmanBul(msg);
      if (uzmanAdi) {
        return `**${uzmanAdi.name}**'ın müsait günlerini görmek için:\n\n1. [Uzmanlar sayfasına](uzmanlar.html) gidin\n2. **${uzmanAdi.name}** profilini açın\n3. **Rezervasyon Yap** butonuna tıklayın — takvimde dolu günler kırmızı, müsait günler seçilebilir olarak gösterilir.\n\nYa da doğrudan rezervasyon yaparken tarih seçim ekranında dolu saatler otomatik olarak işaretlidir.`;
      }
      return 'Uzmanın müsait günlerini görmek için [Uzmanlar sayfasına](uzmanlar.html) gidin, ilgili uzmanın profilini açın ve **Rezervasyon Yap** butonuna tıklayın. Takvimde dolu ve boş günler görünecektir.';
    }
    if (/(rezervasyon|randevu|nasıl yap|iptal|onay|ödeme)/.test(lower)) {
      if (/iptal/.test(lower)) {
        return 'Rezervasyonunuzu iptal etmek için:\n1. **Profilim** sayfasına gidin\n2. **Rezervasyonlarım** sekmesini açın\n3. İlgili rezervasyonun yanındaki **İptal Et** butonuna tıklayın\n\nİptal işlemi rezervasyon tarihinden 24 saat öncesine kadar ücretsizdir.';
      }
      // Uzman adı geçiyor mu?
      const hedefUzman = this._uzmanBul(msg);
      if (hedefUzman) {
        return `**${hedefUzman.name}** ile rezervasyon yapmak için:\n\n[${hedefUzman.name} Profiline Git](uzman-profil.html?id=${hedefUzman.id})\n\n⭐ ${hedefUzman.rating} puan • ₺${hedefUzman.price}/saat • ${hedefUzman.city}\n\nProfil sayfasında **Rezervasyon Yap** butonuna tıklayarak tarih ve saat seçebilirsiniz.`;
      }
      return 'Rezervasyon yapmak çok kolay! 🗓️\n\n1. [Uzmanlar sayfasından](uzmanlar.html) size uygun uzmanı seçin\n2. **Rezervasyon Yap** butonuna tıklayın\n3. Tarih ve saat seçin\n4. Onaylayın — uzman size geri dönsün!\n\nRezervasyon geçmişinizi Profilim → Rezervasyonlarım bölümünden takip edebilirsiniz.';
    }

    // ── Giriş / Kayıt ──
    if (/(giriş|kayıt|hesap|şifre|üye|üyelik|login|register)/.test(lower)) {
      if (/(şifre.*unut|unut.*şifre|şifremi unut)/.test(lower)) {
        return 'Şifrenizi unuttuysanız [Şifremi Unuttum](forgot-password.html) sayfasına gidebilirsiniz. E-posta adresinize sıfırlama bağlantısı gönderilecektir.';
      }
      return 'Hesabınız yoksa [Ücretsiz Kayıt](create-account.html) sayfasından kolayca oluşturabilirsiniz.\n\nZaten hesabınız varsa sağ üstteki **Giriş Yap** butonunu kullanabilirsiniz.';
    }

    // ── Uzman Olmak ──
    if (/(uzman ol|uzman olm|kazanç|para kazan|hizmet ver|müşteri bul|uzman başvur)/.test(lower)) {
      return 'İşBul\'da uzman olmak çok kolay! 🚀\n\n1. [Uzman Ol](uzman-ol.html) sayfasına gidin\n2. Profilinizi oluşturun — hizmetlerinizi, fiyatınızı ve şehrinizi belirtin\n3. Kimlik doğrulamasını tamamlayın\n4. Müşterilerden gelen rezervasyonları onaylayın\n\nOrtalama uzmanlarımız ayda ₺5.000 – ₺15.000 kazanmaktadır.';
    }

    // ── Nasıl çalışır ──
    if (/(nasıl çalış|nasıl işl|ne işe yar|ne yapıyor|platform|hakkında|nedir)/.test(lower)) {
      return 'İşBul, ihtiyaç sahiplerini doğrulanmış profesyonel uzmanlarla buluşturan bir platformdur. 🔧\n\n**Müşteriler için:**\n• Şehrinizde hizmet veren uzmanları bulun\n• Puanlara ve yorumlara göre karşılaştırın\n• Online rezervasyon yapın, güvenli ödeme yapın\n\n**Uzmanlar için:**\n• Profilinizi oluşturun\n• Gelen rezervasyonları yönetin\n• Güvenli ödeme alın\n\nDaha fazla bilgi için [Nasıl Çalışır?](nasil-calisir.html) sayfasını inceleyebilirsiniz.';
    }

    // ── Şehir listesi ──
    if (/(şehir|hangi şehir|nerede hizmet|il|bölge)/.test(lower)) {
      return 'Türkiye\'nin 81 ilinde hizmet veriyoruz! 🗺️\n\nEn çok uzmanımızın bulunduğu şehirler: **İstanbul, Ankara, İzmir, Bursa, Antalya, Gaziantep, Konya, Adana**\n\n[Tüm şehirlerdeki uzmanları görmek](uzmanlar.html) için uzmanlar sayfamızı ziyaret edebilirsiniz.';
    }

    // ── İletişim / Destek ──
    if (/(iletişim|destek|yardım|sorun|şikayet|telefon|e-posta|mail)/.test(lower)) {
      return 'Size yardımcı olmaktan memnuniyet duyarız! 📞\n\nBize ulaşmak için:\n• **E-posta:** destek@isbul.com\n• **Canlı Destek:** Bu chat penceresi\n• **[İletişim Sayfası](hakkimizda.html)**\n\nSorununuzu buradan da anlatabilirsiniz, elimden geleni yapayım.';
    }

    // ── Kapsam dışı ──
    return 'Üzgünüm, bunu cevaplayamam. 😊 Ben yalnızca İşBul platformuyla ilgili konularda yardımcı olabilirim — uzman bulmak, rezervasyon, fiyatlar gibi. Bunlarla ilgili bir sorunuz var mı?';
  },

  // ── İNGİLİZCE YANIT MOTORU ──
  _yanıtlaEN(msg) {
    const lower = msg.toLowerCase().trim();
    const sehir    = this._sehirTespit(msg);
    const kategori = this._kategoriTespit(msg);

    // Dil sorusu
    if (/(speak english|do you speak|english|language|in english)/.test(lower)) {
      return 'Yes, I can help you in English! 😊 I\'m the İşBul assistant. I can help you find experts, make bookings, or answer questions about our platform. How can I assist you?';
    }

    // Selamlama
    if (/^(hi|hello|hey|good morning|good afternoon|good evening|greetings)/.test(lower)) {
      return 'Hello! 👋 I\'m the İşBul assistant. I\'m here to help you find the right expert, make a reservation, or answer any questions about our platform. How can I help you?';
    }

    // Hal hatır
    if (/(how are you|how do you do|you okay|are you fine)/.test(lower)) {
      return 'I\'m doing great, thank you! 😊 How can I help you today?';
    }

    // Teşekkür
    if (/(thank you|thanks|thank u|thx|cheers)/.test(lower)) {
      return 'You\'re welcome! 😊 Feel free to ask if you need anything else.';
    }

    // Fiyat
    if (/(price|cost|how much|fee|charge|rate|discount)/.test(lower)) {
      if (kategori) {
        const ornekler = TÜM_UZMANLAR?.filter(u=>(u.categories||[]).includes(kategori)) || [];
        if (ornekler.length) {
          const min = Math.min(...ornekler.map(u=>u.price));
          const max = Math.max(...ornekler.map(u=>u.price));
          return `Prices for **${kategori}** services range from **₺${min} – ₺${max}/hour** depending on the expert's experience.\n\nFor an exact quote, please check the expert's profile page.`;
        }
      }
      return 'Prices vary based on service type, city, and the expert\'s experience. Hourly rates generally range from **₺200 – ₺600**.\n\nWould you like to know the price for a specific service?';
    }

    // Uzman arama
    if (sehir || kategori || /(expert|specialist|professional|find|need|looking for|electrician|plumber|cleaner|painter|mover)/.test(lower)) {
      const uzmanCevap = this._uzmanOner(sehir, kategori, 'en');
      if (uzmanCevap) return uzmanCevap;
      return 'I couldn\'t find an expert for that criteria. Could you specify the **city** and **service type** you need?';
    }

    // Uzman profil linki
    if (/(profile|page|open profile|show profile|view profile)/.test(lower)) {
      const uzmanAdi = (typeof TÜM_UZMANLAR !== 'undefined')
        ? TÜM_UZMANLAR.find(u =>
            lower.includes(u.name.toLowerCase()) ||
            lower.includes(u.name.toLowerCase().split(' ')[0]) ||
            lower.includes(u.name.toLowerCase().split(' ')[1] || ''))
        : null;
      if (uzmanAdi) {
        return `Here is **${uzmanAdi.name}**'s profile:\n\n[View ${uzmanAdi.name}'s Profile](uzman-profil.html?id=${uzmanAdi.id})\n\n⭐ ${uzmanAdi.rating} rating • ₺${uzmanAdi.price}/hr • ${uzmanAdi.city}`;
      }
      return 'Which expert\'s profile would you like to see? You can browse all experts on the [Experts page](uzmanlar.html).';
    }

    // Uzman müsaitliği
    if (/(available|availability|schedule|when|which days|days free|busy|free slot|calendar)/.test(lower)) {
      const uzmanAdi = (typeof TÜM_UZMANLAR !== 'undefined')
        ? TÜM_UZMANLAR.find(u => lower.includes(u.name.toLowerCase().split(' ')[0].toLowerCase()) || lower.includes(u.name.toLowerCase()))
        : null;
      if (uzmanAdi) {
        return `To see **${uzmanAdi.name}**'s available dates:\n\n1. Go to the [Experts page](uzmanlar.html)\n2. Open **${uzmanAdi.name}**'s profile\n3. Click **Book Now** — the calendar shows available and busy slots automatically.`;
      }
      return 'To check an expert\'s availability, go to the [Experts page](uzmanlar.html), open the expert\'s profile, and click **Book Now**. The calendar will show available and unavailable time slots.';
    }

    // Rezervasyon
    if (/(book|booking|reservation|appointment|cancel)/.test(lower)) {
      if (/cancel/.test(lower)) {
        return 'To cancel a reservation:\n1. Go to your **Profile** page\n2. Open the **My Reservations** tab\n3. Click **Cancel** next to the reservation\n\nCancellations are free up to 24 hours before the scheduled time.';
      }
      return 'Booking is easy! 🗓️\n\n1. Browse experts on the [Experts page](uzmanlar.html)\n2. Click **Book Now**\n3. Select your date and time\n4. Confirm — the expert will get back to you!\n\nYou can track your bookings under Profile → My Reservations.';
    }

    // Kayıt / Giriş
    if (/(sign up|register|login|account|password|forgot|forgot password)/.test(lower)) {
      if (/forgot/.test(lower)) {
        return 'You can reset your password on the [Forgot Password](forgot-password.html) page. A reset link will be sent to your email.';
      }
      return 'You can create a free account on the [Register](create-account.html) page.\n\nAlready have an account? Click **Login** in the top right corner.';
    }

    // Uzman olmak
    if (/(become an expert|join as expert|earn money|offer service|be an expert)/.test(lower)) {
      return 'Becoming an expert on İşBul is simple! 🚀\n\n1. Visit the [Become an Expert](uzman-ol.html) page\n2. Create your profile — list your services, price, and city\n3. Complete identity verification\n4. Accept bookings from customers!\n\nOur experts earn an average of ₺5,000 – ₺15,000 per month.';
    }

    // Nasıl çalışır
    if (/(how does it work|what is isbul|about|platform|service)/.test(lower)) {
      return 'İşBul connects people with verified professional experts across Turkey. 🔧\n\n**For customers:**\n• Find experts in your city\n• Compare by ratings and reviews\n• Book online and pay securely\n\n**For experts:**\n• Create your profile\n• Manage incoming bookings\n• Receive secure payments\n\nLearn more on our [How It Works](nasil-calisir.html) page.';
    }

    // Şehir
    if (/(city|cities|where|location|istanbul|ankara|izmir)/.test(lower)) {
      return 'We operate in all 81 provinces of Turkey! 🗺️\n\nTop cities: **Istanbul, Ankara, Izmir, Bursa, Antalya, Gaziantep, Konya, Adana**\n\nVisit the [Experts page](uzmanlar.html) to find experts near you.';
    }

    // Kapsam dışı
    return 'I\'m sorry, I can only help with İşBul-related questions — finding experts, bookings, prices, and platform info. 😊 Is there anything like that I can help you with?';
  },
};

/* ─────────────────────────────────────────────────────────
   CHATBOT WIDGET
───────────────────────────────────────────────────────── */
class ChatbotWidget {
  constructor() {
    this.isOpen = false;
    this.conversationHistory = [];

    // Ortama göre otomatik API URL tespiti — api-client.js ile aynı mantık
    const h = window.location.hostname;
    const backendBase = (h === 'localhost' || h === '127.0.0.1')
      ? 'http://localhost:3001'
      : `https://api.${h}`;
    this.apiUrl = `${backendBase}/api/v1/chatbot`;

    this.init();
  }

  // Token — api-client.js ile aynı key (isbul_jwt)
  _getToken() {
    return localStorage.getItem('isbul_jwt') || null;
  }

  _authHeaders() {
    const token = this._getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  init() {
    this.createWidget();
    this.loadSuggestions();
  }

  createWidget() {
    const chatContainer = document.createElement('div');
    chatContainer.id = 'chatbot-widget';
    chatContainer.className = 'chatbot-widget';
    chatContainer.innerHTML = `
      <div class="chatbot-popup" id="chatbot-popup" style="display: none;">
        <div class="chatbot-header">
          <div class="chatbot-header-left">
            <div class="chatbot-avatar">🤖</div>
            <div>
              <div class="chatbot-title">İşBul Asistan</div>
              <div class="chatbot-status">Çevrimiçi</div>
            </div>
          </div>
          <button class="chatbot-close" id="chatbot-close">✕</button>
        </div>

        <div class="chatbot-messages" id="chatbot-messages">
          <div class="chatbot-message bot">
            <div class="chatbot-message-avatar">🤖</div>
            <div class="chatbot-message-content">
              <div class="chatbot-message-text">Merhaba! 👋 İşBul asistanıyım. Size nasıl yardımcı olabilirim?</div>
            </div>
          </div>
          <div class="chatbot-suggestions" id="chatbot-suggestions"></div>
        </div>

        <div class="chatbot-input-container">
          <input
            type="text"
            class="chatbot-input"
            id="chatbot-input"
            placeholder="Mesajınızı yazın..."
            autocomplete="off"
          />
          <button class="chatbot-send" id="chatbot-send">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>

      <button class="chatbot-button" id="chatbot-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="chatbot-badge" id="chatbot-badge">AI</span>
      </button>
    `;

    document.body.appendChild(chatContainer);

    document.getElementById('chatbot-button').addEventListener('click', () => this.toggle());
    document.getElementById('chatbot-close').addEventListener('click', () => this.close());
    document.getElementById('chatbot-send').addEventListener('click', () => this.sendMessage());
    document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    document.getElementById('chatbot-popup').style.display = this.isOpen ? 'flex' : 'none';
    if (this.isOpen) document.getElementById('chatbot-input').focus();
  }

  close() {
    this.isOpen = false;
    document.getElementById('chatbot-popup').style.display = 'none';
  }

  async loadSuggestions() {
    try {
      const response = await fetch(`${this.apiUrl}/suggestions`, {
        headers: this._authHeaders(),
        signal: AbortSignal.timeout(3000),
      });
      const data = await response.json();
      if (data.success && data.data?.suggestions) {
        this.renderSuggestions(data.data.suggestions);
        return;
      }
    } catch {
      // API yoksa yerel öneriler
    }
    // Varsayılan öneriler
    this.renderSuggestions([
      'İstanbul\'da elektrikçi arıyorum',
      'Ev temizliği fiyatları ne kadar?',
      'Nasıl rezervasyon yapabilirim?',
      'Uzman olmak istiyorum',
    ]);
  }

  renderSuggestions(suggestions) {
    const container = document.getElementById('chatbot-suggestions');
    container.innerHTML = suggestions.map(s =>
      `<button class="chatbot-suggestion" onclick="chatbot.sendSuggestion('${s.replace(/'/g, "\\'")}')">${s}</button>`
    ).join('');
  }

  sendSuggestion(text) {
    document.getElementById('chatbot-input').value = text;
    this.sendMessage();
  }

  async sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    input.disabled = true;

    this.addMessage(message, 'user');
    this.addTypingIndicator();

    let replied = false;

    // ── 1. Backend API'yi dene ──
    try {
      const response = await fetch(`${this.apiUrl}/chat`, {
        method: 'POST',
        headers: this._authHeaders(),
        body: JSON.stringify({
          message,
          conversationHistory: this.conversationHistory,
        }),
        signal: AbortSignal.timeout(8000),
      });

      const data = await response.json();
      this.removeTypingIndicator();

      if (data.success && data.data?.reply) {
        this.addMessage(data.data.reply, 'bot');
        this.conversationHistory.push({ role: 'user', content: message });
        this.conversationHistory.push({ role: 'assistant', content: data.data.reply });
        if (this.conversationHistory.length > 20) {
          this.conversationHistory = this.conversationHistory.slice(-20);
        }
        replied = true;
      }
    } catch {
      // API erişilemedi — yerel motora düşeceğiz
    }

    // ── 2. API başarısız olduysa yerel motor ──
    if (!replied) {
      this.removeTypingIndicator();
      // Kısa gecikme — doğal his
      await new Promise(r => setTimeout(r, 400));
      const localReply = LocalChatEngine.yanıtla(message);
      this.addMessage(localReply, 'bot');
      this.conversationHistory.push({ role: 'user', content: message });
      this.conversationHistory.push({ role: 'assistant', content: localReply });
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }
    }

    input.disabled = false;
    input.focus();
  }

  addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${sender}`;

    if (sender === 'bot') {
      messageDiv.innerHTML = `
        <div class="chatbot-message-avatar">🤖</div>
        <div class="chatbot-message-content">
          <div class="chatbot-message-text">${this.formatText(text)}</div>
        </div>
      `;
    } else {
      messageDiv.innerHTML = `
        <div class="chatbot-message-content">
          <div class="chatbot-message-text">${this.escapeHtml(text)}</div>
        </div>
      `;
    }

    const suggestions = document.getElementById('chatbot-suggestions');
    messagesContainer.insertBefore(messageDiv, suggestions);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  addTypingIndicator() {
    const messagesContainer = document.getElementById('chatbot-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatbot-message bot';
    typingDiv.id = 'chatbot-typing';
    typingDiv.innerHTML = `
      <div class="chatbot-message-avatar">🤖</div>
      <div class="chatbot-message-content">
        <div class="chatbot-typing"><span></span><span></span><span></span></div>
      </div>
    `;
    const suggestions = document.getElementById('chatbot-suggestions');
    messagesContainer.insertBefore(typingDiv, suggestions);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  removeTypingIndicator() {
    const typing = document.getElementById('chatbot-typing');
    if (typing) typing.remove();
  }

  // Güvenli HTML — sadece bot mesajlarında bold/link dönüşümü yapılır
  formatText(text) {
    const escaped = this.escapeHtml(text);
    return escaped
      // **bold** → <strong>
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // [metin](url) → <a href>
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--primary);text-decoration:underline">$1</a>');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  }
}

// Global instance
let chatbot;
document.addEventListener('DOMContentLoaded', () => {
  chatbot = new ChatbotWidget();
});
