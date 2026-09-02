/* ============================================================
   İşBul – Veri Tabanı (data.js)
   ============================================================ */

/* ---------- MERKEZİ KATEGORİ LİSTESİ ----------
 * Sahibinden.com ve benzer platformların kategori yapısından esinlenilerek oluşturuldu
 * cat: URL'de kullanılan slug (uzmanlar.html?kategori=elektrik)
 * label: Görüntülenen isim
 * icon: Emoji ikonu
 * tags: Alt hizmetler (arama ve eşleştirme için)
 * desc: Kategori açıklaması
 */
const KATEGORİLER = [
  {
    cat: 'temizlik',
    label: 'Temizlik',
    icon: '🧹',
    desc: 'Ev, ofis, koltuk ve dış cephe',
    tags: ['Ev Temizliği', 'Ofis Temizliği', 'İnşaat Sonrası Temizlik', 'Koltuk Yıkama', 'Halı Yıkama', 'Dış Cephe Cam Temizliği'],
    subCategories: [
      { id: 'ev-temizligi', label: 'Ev Temizliği', icon: '🏠', desc: 'Haftalık ve aylık rutin ev temizliği. Tüm odalar, mutfak ve banyo dahil.', price: '300', hot: true },
      { id: 'ofis-temizligi', label: 'Ofis Temizliği', icon: '🏢', desc: 'Açık ofis, toplantı odası, mutfak ve tuvaletlerin düzenli olarak temizlenmesi.', price: '400' },
      { id: 'insaat-sonrasi', label: 'İnşaat Sonrası Temizlik', icon: '🏗️', desc: 'Tadilat veya inşaat sonrası boya, harç ve toz kalıntılarının temizlenmesi.', price: '600' },
      { id: 'koltuk-yikama', label: 'Koltuk & Halı Yıkama', icon: '🛋️', desc: 'Makineli yıkama ve buharlı temizleme ile koltuk, halı ve kilimler yenileniyor.', price: '350' },
      { id: 'dis-cephe', label: 'Dış Cephe Cam Temizliği', icon: '🪟', desc: 'Plaza ve yüksek binalar için profesyonel dış cephe cam temizliği.', price: '1000' }
    ]
  },
  {
    cat: 'tadilat',
    label: 'Tadilat & Dekorasyon',
    icon: '🏗️',
    desc: 'Boya, alçı, fayans, yalıtım',
    tags: ['Boya Badana', 'Fayans Seramik', 'Mutfak Banyo Tadilatı', 'Alçıpan', 'Çatı Tamiri', 'Mantolama İzolasyon'],
    subCategories: [
      { id: 'boya-badana', label: 'Boya Badana', icon: '🎨', desc: 'Oda, salon ve tüm iç mekan boya işleri. Alçı düzeltme ve badana dahil.', price: '400', hot: true },
      { id: 'fayans-seramik', label: 'Fayans & Seramik', icon: '🪨', desc: 'Mutfak, banyo ve zemin için seramik döşeme ve parke kaplama hizmetleri.', price: '500' },
      { id: 'mutfak-banyo', label: 'Mutfak & Banyo Tadilatı', icon: '🛁', desc: 'Komple banyo veya mutfak yenileme, dolap, tesisat ve fayans işleri.', price: '2000' },
      { id: 'alcipan', label: 'Alçıpan & Asma Tavan', icon: '🏠', desc: 'Bölme duvar, asma tavan, led spot ve niş uygulamaları.', price: '800' },
      { id: 'izolasyon', label: 'Mantolama & İzolasyon', icon: '🛡️', desc: 'Isı, ses ve su yalıtımı işlemleri. Dış cephe mantolama.', price: '1500' }
    ]
  },
  {
    cat: 'nakliyat',
    label: 'Nakliyat & Taşıma',
    icon: '🚚',
    desc: 'Evden eve, parça eşya, depolama',
    tags: ['Evden Eve Nakliyat', 'Şehirler Arası Nakliyat', 'Parça Eşya Taşıma', 'Nakliye Aracı', 'Depolama'],
    subCategories: [
      { id: 'evden-eve', label: 'Evden Eve Nakliyat', icon: '📦', desc: 'Büyük-küçük ev taşımaları. Ambalajlama, yükleme, taşıma ve yerleştirme dahil.', price: '1000', hot: true },
      { id: 'sehirler-arasi', label: 'Şehirler Arası Nakliye', icon: '🛣️', desc: 'Türkiye geneli güvenli ve sigortalı şehirler arası eşya taşıma.', price: '5000' },
      { id: 'parca-esya', label: 'Parça Eşya Taşıma', icon: '🪑', desc: 'Az miktarda veya tek parça eşya (beyaz eşya, koltuk vb.) taşıma.', price: '400' },
      { id: 'nakliye-araci', label: 'Sadece Nakliye Aracı', icon: '🚛', desc: 'Sadece şoförlü araç kiralama (yükleme dahil değil).', price: '600' }
    ]
  },
  {
    cat: 'tesisat',
    label: 'Tesisat & Bakım',
    icon: '🔧',
    desc: 'Su tesisatı, tıkanıklık, doğalgaz',
    tags: ['Su Tesisatı', 'Tıkanıklık Açma', 'Petek Temizleme', 'Doğalgaz Tesisatı', 'Su Kaçağı Tespiti'],
    subCategories: [
      { id: 'su-tesisati', label: 'Su Tesisatı', icon: '💧', desc: 'Musluk, sifon, duş başlığı değişimi ve genel su tesisatı arızaları.', price: '300' },
      { id: 'tikaniklik', label: 'Tıkanıklık Açma', icon: '🪠', desc: 'Lavabo, tuvalet, mutfak gideri ve ana logar tıkanıklıklarının açılması.', price: '450', hot: true },
      { id: 'petek-temizleme', label: 'Petek Temizleme', icon: '🔥', desc: 'Kalorifer peteklerinin makine ile içinin temizlenip ısınma veriminin artırılması.', price: '350' },
      { id: 'dogalgaz', label: 'Doğalgaz Tesisatı', icon: '🔥', desc: 'Doğalgaz boru çekimi, ocak dönüşümü ve tesisat proje işleri.', price: '500' }
    ]
  },
  {
    cat: 'elektrik',
    label: 'Elektrik & Elektronik',
    icon: '⚡',
    desc: 'Arıza, klima, beyaz eşya, kamera',
    tags: ['Elektrik Arıza', 'Klima Servisi', 'Beyaz Eşya Servisi', 'Güvenlik Sistemleri', 'Uydu Anten'],
    subCategories: [
      { id: 'elektrik-ariza', label: 'Elektrik Arıza & Montaj', icon: '🔌', desc: 'Priz, anahtar, şalter arızaları, aydınlatma ve avize montajı.', price: '250', hot: true },
      { id: 'klima-servisi', label: 'Klima Servisi', icon: '❄️', desc: 'Klima montajı, gaz dolumu, filtre temizliği ve arıza onarımı.', price: '400' },
      { id: 'beyaz-esya', label: 'Beyaz Eşya Servisi', icon: '🧺', desc: 'Çamaşır, bulaşık makinesi ve buzdolabı arızaları.', price: '350' },
      { id: 'kamera', label: 'Kamera & Güvenlik', icon: '📹', desc: 'Ev ve iş yerleri için güvenlik kamerası, alarm sistemleri kurulumu.', price: '700' }
    ]
  },
  {
    cat: 'montaj',
    label: 'Montaj & Tamirat',
    icon: '🪛',
    desc: 'Mobilya, TV, perde, kilit',
    tags: ['Mobilya Montajı', 'TV Montajı', 'Perde Montajı', 'Çilingir', 'Kapı Pencere Tamiri'],
    subCategories: [
      { id: 'mobilya-montaj', label: 'Mobilya Montajı', icon: '🪑', desc: 'IKEA, Koçtaş, Bellona vb. hazır mobilyaların ve dolapların kurulumu.', price: '250', hot: true },
      { id: 'tv-montaji', label: 'TV Montajı', icon: '📺', desc: 'Her boyda televizyonun duvara veya üniteye güvenli montajı.', price: '200' },
      { id: 'perde-montaji', label: 'Perde & Korniş Montajı', icon: '🪟', desc: 'Korniş çekilmesi, stor ve zebra perde montajı.', price: '150' },
      { id: 'cilingir', label: 'Çilingir & Kilit', icon: '🔑', desc: 'Kapı kilit değişimi, kasa açma, oto çilingir hizmetleri.', price: '250' }
    ]
  },
  {
    cat: 'egitim',
    label: 'Özel Ders & Eğitim',
    icon: '📚',
    desc: 'Okul destek, dil, direksiyon',
    tags: ['İngilizce Özel Ders', 'Matematik Özel Ders', 'Direksiyon Dersi', 'Müzik Dersi'],
    subCategories: [
      { id: 'ingilizce', label: 'İngilizce Özel Ders', icon: '🇬🇧', desc: 'Her seviyeye uygun okul destek ve konuşma odaklı İngilizce özel ders.', price: '400' },
      { id: 'matematik', label: 'Matematik Özel Ders', icon: '📐', desc: 'İlkokuldan üniversiteye hazırlık seviyesine kadar matematik dersi.', price: '450', hot: true },
      { id: 'direksiyon', label: 'Direksiyon Dersi', icon: '🚗', desc: 'Manuel ve otomatik vitesli araçlarla, trafikte pratik direksiyon eğitimi.', price: '350' },
      { id: 'muzik', label: 'Müzik & Enstrüman', icon: '🎸', desc: 'Gitar, piyano, keman vb. enstrümanlar için özel ders.', price: '300' }
    ]
  },
  {
    cat: 'diger',
    label: 'Diğer Hizmetler',
    icon: '🛠️',
    desc: 'İlaçlama, bahçe, kurye, ekspertiz',
    tags: ['Böcek İlaçlama', 'Bahçe Bakımı', 'Kurye Hizmeti', 'Oto Ekspertiz', 'Fotoğraf Çekimi'],
    subCategories: [
      { id: 'bocek-ilaclama', label: 'Böcek İlaçlama', icon: '🕷️', desc: 'Ev, işyeri, apartman vb. alanlarda hamamböceği, pire, fare vb. ilaçlama.', price: '350', hot: true },
      { id: 'bahce-bakimi', label: 'Bahçe Bakımı & Peyzaj', icon: '🌳', desc: 'Çim biçme, ağaç budama, peyzaj düzenleme ve otomatik sulama sistemleri.', price: '400' },
      { id: 'kurye', label: 'Moto Kurye', icon: '🛵', desc: 'Acil evrak ve paket teslimatları için şehir içi hızlı moto kurye hizmeti.', price: '150' },
      { id: 'oto-ekspertiz', label: 'Oto Ekspertiz & Çekici', icon: '🚘', desc: 'Mobil oto ekspertiz, araç kurtarma ve oto çekici hizmeti.', price: '750' }
    ]
  }
];

// Kolay erişim için map
const KATEGORİ_MAP = Object.fromEntries(KATEGORİLER.map(k => [k.cat, k]));

// Uzman paneli select için tüm tag'ler (tekrarsız, sıralı)
const TÜM_KATEGORİ_TAGLERİ = [...new Set(KATEGORİLER.flatMap(k => k.tags))].sort();

/* ---------- 81 İL VE İLÇELERİ ---------- */
const ILLER = {
  "Adana":        ["Aladağ","Ceyhan","Çukurova","Feke","İmamoğlu","Karaisalı","Karataş","Kozan","Pozantı","Saimbeyli","Sarıçam","Seyhan","Tufanbeyli","Yumurtalık","Yüreğir"],
  "Adıyaman":     ["Adıyaman Merkez","Besni","Çelikhan","Gerger","Gölbaşı","Kahta","Samsat","Sincik","Tut"],
  "Afyonkarahisar":["Afyon Merkez","Başmakçı","Bayat","Bolvadin","Çay","Çobanlar","Dazı","Dazkırı","Dinar","Emirdağ","Evciler","Hocalar","İhsaniye","İscehisar","Kızılören","Sandıklı","Sinanpaşa","Sultandağı","Şuhut"],
  "Ağrı":         ["Ağrı Merkez","Diyadin","Doğubayazıt","Eleşkirt","Hamur","Patnos","Taşlıçay","Tutak"],
  "Amasya":       ["Amasya Merkez","Göynücek","Gümüşhacıköy","Hamamözü","Merzifon","Suluova","Taşova"],
  "Ankara":       ["Altındağ","Ayaş","Bala","Beypazarı","Çamlıdere","Çankaya","Çubuk","Elmadağ","Etimesgut","Evren","Gölbaşı","Güdül","Haymana","Kahramankazan","Kalecik","Keçiören","Kızılcahamam","Mamak","Nallıhan","Polatlı","Pursaklar","Sincan","Şereflikoçhisar","Yenimahalle"],
  "Antalya":      ["Akseki","Aksu","Alanya","Demre","Döşemealtı","Elmalı","Finike","Gazipaşa","Gündoğmuş","İbradı","Kaş","Kemer","Kepez","Konyaaltı","Korkuteli","Kumluca","Manavgat","Muratpaşa","Serik"],
  "Ardahan":      ["Ardahan Merkez","Çıldır","Damal","Göle","Hanak","Posof"],
  "Artvin":       ["Ardanuç","Arhavi","Artvin Merkez","Borçka","Hopa","Kemalpaşa","Murgul","Şavşat","Yusufeli"],
  "Aydın":        ["Bozdoğan","Buharkent","Çine","Didim","Efeler","Germencik","İncirliova","Karacasu","Karpuzlu","Koçarlı","Köşk","Kuşadası","Kuyucak","Nazilli","Söke","Sultanhisar","Yenipazar"],
  "Balıkesir":    ["Altıeylül","Ayvalık","Balya","Bandırma","Bigadiç","Burhaniye","Dursunbey","Edremit","Erdek","Gömeç","Gönen","Havran","İvrindi","Karesi","Kepsut","Manyas","Marmara","Savaştepe","Sındırgı","Susurluk"],
  "Bartın":       ["Arit","Bartın Merkez","Kurucaşile","Ulus"],
  "Batman":       ["Batman Merkez","Beşiri","Gercüş","Hasankeyf","Kozluk","Sason"],
  "Bayburt":      ["Aydıntepe","Bayburt Merkez","Demirözü"],
  "Bilecik":      ["Bilecik Merkez","Bozüyük","Gölpazarı","İnhisar","Osmaneli","Pazaryeri","Söğüt","Yenipazar"],
  "Bingöl":       ["Adaklı","Bingöl Merkez","Genç","Karlıova","Kiğı","Solhan","Yayladere","Yedisu"],
  "Bitlis":       ["Adilcevaz","Ahlat","Bitlis Merkez","Güroymak","Hizan","Mutki","Tatvan"],
  "Bolu":         ["Bolu Merkez","Dörtdivan","Gerede","Göynük","Kıbrıscık","Mengen","Mudurnu","Seben","Yeniçağa"],
  "Burdur":       ["Ağlasun","Altınyayla","Bucak","Burdur Merkez","Çavdır","Çeltikçi","Gölhisar","Karamanlı","Kemer","Tefenni","Yeşilova"],
  "Bursa":        ["Büyükorhan","Gemlik","Gürsu","Harmancık","İnegöl","İznik","Karacabey","Keles","Kestel","Mudanya","Mustafakemalpaşa","Nilüfer","Orhaneli","Orhangazi","Osmangazi","Yıldırım","Yenişehir"],
  "Çanakkale":    ["Ayvacık","Bayramiç","Biga","Bozcaada","Çan","Çanakkale Merkez","Eceabat","Ezine","Gelibolu","Gökçeada","Lapseki","Yenice"],
  "Çankırı":      ["Atkaracalar","Bayramören","Çankırı Merkez","Çerkeş","Eldivan","Ilgaz","Kızılırmak","Korgun","Kurşunlu","Orta","Şabanözü","Yapraklı"],
  "Çorum":        ["Alaca","Bayat","Boğazkale","Dodurga","İskilip","Kargı","Laçin","Mecitözü","Oğuzlar","Ortaköy","Osmancık","Sungurlu","Uğurludağ","Çorum Merkez"],
  "Denizli":      ["Acıpayam","Babadağ","Baklan","Bekilli","Beyağaç","Bozkurt","Buldan","Çal","Çameli","Çardak","Çivril","Güney","Honaz","Kale","Merkezefendi","Pamukkale","Sarayköy","Serinhisar","Tavas"],
  "Diyarbakır":   ["Bağlar","Bismil","Çermik","Çınar","Çüngüş","Dicle","Eğil","Ergani","Hani","Hazro","Kayapınar","Kocaköy","Kulp","Lice","Silvan","Sur","Yenişehir"],
  "Düzce":        ["Akçakoca","Cumayeri","Çilimli","Düzce Merkez","Gölyaka","Gümüşova","Kaynaşlı","Yığılca"],
  "Edirne":       ["Edirne Merkez","Enez","Havsa","İpsala","Keşan","Lalapaşa","Meriç","Süloğlu","Uzunköprü"],
  "Elazığ":       ["Ağın","Alacakaya","Arıcak","Baskil","Elazığ Merkez","Karakoçan","Keban","Kovancılar","Maden","Palu","Sivrice"],
  "Erzincan":     ["Çayırlı","Erzincan Merkez","İliç","Kemah","Kemaliye","Otlukbeli","Refahiye","Tercan","Üzümlü"],
  "Erzurum":      ["Aşkale","Aziziye","Çat","Hınıs","Horasan","İspir","Karaçoban","Karayazı","Köprüköy","Narman","Oltu","Olur","Palandöken","Pasinler","Pazaryolu","Şenkaya","Tekman","Tortum","Uzundere","Yakutiye"],
  "Eskişehir":    ["Alpu","Beylikova","Çifteler","Günyüzü","Han","İnönü","Mahmudiye","Mihalgazi","Mihalıççık","Odunpazarı","Sarıcakaya","Seyitgazi","Sivrihisar","Tepebaşı"],
  "Gaziantep":    ["Araban","İslahiye","Karkamış","Nizip","Nurdağı","Oğuzeli","Şahinbey","Şehitkamil","Yavuzeli"],
  "Giresun":      ["Alucra","Bulancak","Çamoluk","Çanakçı","Dereli","Doğankent","Espiye","Eynesil","Giresun Merkez","Görele","Güce","Keşap","Piraziz","Şebinkarahisar","Tirebolu","Yağlıdere"],
  "Gümüşhane":    ["Gümüşhane Merkez","Kelkit","Köse","Kürtün","Şiran","Torul"],
  "Hakkari":      ["Çukurca","Derecik","Hakkari Merkez","Şemdinli","Yüksekova"],
  "Hatay":        ["Altınözü","Antakya","Arsuz","Belen","Defne","Dörtyol","Erzin","Hassa","İskenderun","Kırıkhan","Kumlu","Payas","Reyhanlı","Samandağ","Serinyol","Yayladağı"],
  "Iğdır":        ["Aralık","Iğdır Merkez","Karakoyunlu","Tuzluca"],
  "Isparta":      ["Aksu","Atabey","Eğirdir","Gelendost","Gönen","Keçiborlu","Şarkikaraağaç","Senirkent","Sütçüler","Uluborlu","Yalvaç","Yenişarbademli","Isparta Merkez"],
  "İstanbul":     ["Adalar","Arnavutköy","Ataşehir","Avcılar","Bağcılar","Bahçelievler","Bakırköy","Başakşehir","Bayrampaşa","Beşiktaş","Beykoz","Beylikdüzü","Beyoğlu","Büyükçekmece","Çatalca","Çekmeköy","Esenler","Esenyurt","Eyüpsultan","Fatih","Gaziosmanpaşa","Güngören","Kadıköy","Kağıthane","Kartal","Küçükçekmece","Maltepe","Pendik","Sancaktepe","Sarıyer","Şile","Silivri","Şişli","Sultanbeyli","Sultangazi","Tuzla","Ümraniye","Üsküdar","Zeytinburnu"],
  "İzmir":        ["Aliağa","Balçova","Bayındır","Bayraklı","Bergama","Beydağ","Bornova","Buca","Çeşme","Çiğli","Dikili","Foça","Gaziemir","Güzelbahçe","Karabağlar","Karaburun","Karşıyaka","Kemalpaşa","Kınık","Kiraz","Konak","Menderes","Menemen","Narlıdere","Ödemiş","Seferihisar","Selçuk","Tire","Torbalı","Urla"],
  "Kahramanmaraş":["Afşin","Andırın","Çağlayancerit","Dulkadiroğlu","Ekinözü","Elbistan","Göksun","Nurhak","Onikişubat","Pazarcık","Türkoğlu"],
  "Karabük":      ["Eflani","Eskipazar","Karabük Merkez","Ovacık","Safranbolu","Yenice"],
  "Karaman":      ["Ayrancı","Başyayla","Ermenek","Karaman Merkez","Kazımkarabekir","Sarıveliler"],
  "Kars":         ["Akyaka","Arpaçay","Digor","Kars Merkez","Kağızman","Sarıkamış","Selim","Susuz"],
  "Kastamonu":    ["Abana","Ağlı","Araç","Azdavay","Bozkurt","Cide","Çatalzeytin","Daday","Devrekani","Doğanyurt","Hanönü","İhsangazi","İnebolu","Kastamonu Merkez","Küre","Pınarbaşı","Seydiler","Şenpazar","Taşköprü","Tosya"],
  "Kayseri":      ["Akkışla","Bünyan","Develi","Felahiye","Hacılar","İncesu","Kocasinan","Melikgazi","Özvatan","Pınarbaşı","Sarıoğlan","Sarız","Talas","Tomarza","Yahyalı","Yeşilhisar"],
  "Kırıkkale":    ["Bahşili","Balışeyh","Çelebi","Delice","Karakeçili","Keskin","Kırıkkale Merkez","Sulakyurt","Yahşihan"],
  "Kırklareli":   ["Babaeski","Demirköy","Kırklareli Merkez","Kofçaz","Lüleburgaz","Pehlivanköy","Pınarhisar","Vize"],
  "Kırşehir":     ["Akçakent","Akpınar","Boztepe","Çiçekdağı","Kaman","Kırşehir Merkez","Mucur"],
  "Kilis":        ["Elbeyli","Kilis Merkez","Musabeyli","Polateli"],
  "Kocaeli":      ["Başiskele","Çayırova","Darıca","Derince","Dilovası","Gebze","Gölcük","İzmit","Kandıra","Karamürsel","Kartepe","Körfez"],
  "Konya":        ["Ahırlı","Akören","Akşehir","Altınekin","Beyşehir","Bozkır","Cihanbeyli","Çeltik","Çumra","Derbent","Derebucak","Doğanhisar","Emirgazi","Ereğli","Güneysınır","Hadim","Halkapınar","Hüyük","Ilgın","Kadınhanı","Karapınar","Karatay","Kulu","Meram","Sarayönü","Selçuklu","Seydişehir","Taşkent","Tuzlukçu","Yalıhüyük","Yunak"],
  "Kütahya":      ["Altıntaş","Aslanapa","Çavdarhisar","Domaniç","Dumlupınar","Emet","Gediz","Hisarcık","Kütahya Merkez","Pazarlar","Şaphane","Simav","Tavşanlı"],
  "Malatya":      ["Akçadağ","Arapgir","Arguvan","Battalgazi","Darende","Doğanşehir","Doğanyol","Hekimhan","Kale","Kuluncak","Pütürge","Yazıhan","Yeşilyurt"],
  "Manisa":       ["Ahmetli","Akhisar","Alaşehir","Demirci","Gölmarmara","Gördes","Kırkağaç","Köprübaşı","Kula","Salihli","Sarıgöl","Saruhanlı","Selendi","Soma","Şehzadeler","Turgutlu","Yunusemre"],
  "Mardin":       ["Artuklu","Dargeçit","Derik","Kızıltepe","Mazıdağı","Midyat","Nusaybin","Ömerli","Savur","Yeşilli"],
  "Mersin":       ["Akdeniz","Anamur","Aydıncık","Bozyazı","Çamlıyayla","Erdemli","Gülnar","Mezitli","Mut","Silifke","Tarsus","Toroslar","Yenişehir"],
  "Muğla":        ["Bodrum","Dalaman","Datça","Fethiye","Kavaklıdere","Köyceğiz","Marmaris","Menteşe","Milas","Ortaca","Seydikemer","Ula","Yatağan"],
  "Muş":          ["Bulanık","Hasköy","Korkut","Malazgirt","Muş Merkez","Varto"],
  "Nevşehir":     ["Acıgöl","Avanos","Derinkuyu","Gülşehir","Hacıbektaş","Kozaklı","Nevşehir Merkez","Ürgüp"],
  "Niğde":        ["Alt unhi sar","Bor","Çamardı","Çiftlik","Niğde Merkez","Ulukışla"],
  "Ordu":         ["Akkuş","Altınordu","Aybastı","Çamaş","Çatalpınar","Çaybaşı","Fatsa","Gölköy","Gülyalı","Gürgentepe","İkizce","Kabadüz","Kabataş","Korgan","Kumru","Mesudiye","Perşembe","Ulubey","Ünye"],
  "Osmaniye":     ["Bahçe","Düziçi","Hasanbeyli","Kadirli","Osmaniye Merkez","Sumbas","Toprakkale"],
  "Rize":         ["Ardeşen","Çamlıhemşin","Çayeli","Derepazarı","Fındıklı","Güneysu","Hemşin","İkizdere","İyidere","Kalkandere","Pazar","Rize Merkez"],
  "Sakarya":      ["Adapazarı","Akyazı","Arifiye","Erenler","Ferizli","Geyve","Hendek","Karapürçek","Karasu","Kaynarca","Kocaali","Mithatpaşa","Pamukova","Sapanca","Serdivan","Söğütlü","Taraklı"],
  "Samsun":       ["Alaçam","Asarcık","Atakum","Ayvacık","Bafra","Canik","Çarşamba","Havza","İlkadım","Kavak","Ladik","Ondokuzmayıs","Salıpazarı","Tekkeköy","Terme","Vezirköprü","Yakakent"],
  "Siirt":        ["Baykan","Eruh","Kurtalan","Pervari","Siirt Merkez","Şirvan","Tillo"],
  "Sinop":        ["Ayancık","Boyabat","Dikmen","Durağan","Erfelek","Gerze","Saraydüzü","Sinop Merkez","Türkeli"],
  "Sivas":        ["Altınyayla","Divriği","Doğanşar","Gemerek","Gölova","Gürun","Hafik","İmranlı","Kangal","Koyulhisar","Şarkışla","Suşehri","Ulaş","Sivas Merkez","Yıldızeli","Zara"],
  "Şanlıurfa":    ["Akçakale","Birecik","Bozova","Ceylanpınar","Eyyübiye","Halfeti","Haliliye","Harran","Hilvan","Karaköprü","Siverek","Suruç","Viranşehir"],
  "Şırnak":       ["Beytüşşebap","Cizre","Güçlükonak","İdil","Silopi","Şırnak Merkez","Uludere"],
  "Tekirdağ":     ["Çerkezköy","Çorlu","Ergene","Hayrabolu","Kapaklı","Malkara","Marmaraereğlisi","Muratlı","Saray","Süleymanpaşa","Şarköy"],
  "Tokat":        ["Almus","Artova","Başçiftlik","Erbaa","Niksar","Pazar","Reşadiye","Sulusaray","Tokat Merkez","Turhal","Yeşilyurt","Zile"],
  "Trabzon":      ["Akçaabat","Araklı","Arsin","Beşikdüzü","Çarşıbaşı","Çaykara","Dernekpazarı","Düzköy","Hayrat","Köprübaşı","Maçka","Of","Ortahisar","Sürmene","Şalpazarı","Tonya","Vakfıkebir","Yomra"],
  "Tunceli":      ["Çemişgezek","Hozat","Mazgirt","Nazımiye","Ovacık","Pertek","Pülümür","Tunceli Merkez"],
  "Uşak":         ["Banaz","Eşme","Karahallı","Sivaslı","Ulubey","Uşak Merkez"],
  "Van":          ["Bahçesaray","Başkale","Çaldıran","Çatak","Edremit","Erciş","Gevaş","Gürpınar","İpekyolu","Muradiye","Özalp","Saray","Tuşba"],
  "Yalova":       ["Altınova","Armutlu","Çınarcık","Çiftlikköy","Termal","Yalova Merkez"],
  "Yozgat":       ["Akdağmadeni","Aydıncık","Boğazlıyan","Çandır","Çayıralan","Çekerek","Kadışehri","Saraykent","Sarıkaya","Şefaatli","Sorgun","Yenifakılı","Yozgat Merkez","Yerköy"],
  "Zonguldak":    ["Alaplı","Çaycuma","Devrek","Ereğli","Gökçebey","Kilimli","Kozlu","Zonguldak Merkez"]
};

const IL_LISTESI = Object.keys(ILLER).sort();

/* ---------- UZMANLIK KATEGORİLERİ ---------- */
const UZMANLIK_KATEGORILERI = [
  'Elektrik',
  'Tesisat',
  'Tamir',
  'Montaj',
  'Temizlik',
  'Boya',
  'Bahçe',
  'Nakliyat',
  'Tadilat',
  'TV Montaj',
  'Klima',
  'Beyaz Eşya',
  'Cam Balkon',
  'Isı Yalıtım',
  'Ses Yalıtım',
  'Asma Tavan',
  'Alçıpan',
  'Seramik',
  'Parke',
  'Laminat',
  'Duvar Kağıdı'
].sort();

/* ---------- GENİŞLETİLMİŞ UZMAN VERİTABANI (her şehirde farklı kişiler) ---------- */
const TÜM_UZMANLAR = [
  // İSTANBUL
  { id:'e1',  name:'Mehmet Arslan',    city:'İstanbul', avatar:'MA', color:'#6C63FF', title:'Mobilya Montaj Uzmanı',      categories:['montaj','tv'],      rating:4.97, reviews:312, price:280, experience:'8 yıl',  elite:true,  bio:'Tüm marka mobilya montajı. Aynı gün hizmet verebiliyorum.',          tags:['Mobilya Montaj','Raf Kurulum','TV Montajı','Gardırop'], reviewList:[{user:'c1',rating:5,text:'Harika iş çıkardı, çok hızlı.',date:'2024-11-12',service:'Mobilya Montaj'},{user:'c6',rating:5,text:'Profesyonel çalışma, teşekkürler.',date:'2024-10-28',service:'Mobilya Montajı'}]},
  { id:'e2',  name:'Ayşe Kaya',        city:'İstanbul', avatar:'AK', color:'#FF6B6B', title:'Ev Temizlik Uzmanı',          categories:['temizlik'],         rating:4.95, reviews:228, price:250, experience:'5 yıl',  elite:true,  bio:'Hijyen sertifikalı temizlik uzmanı.',                               tags:['Derin Temizlik','Ofis','Cam Silme'], reviewList:[{user:'c2',rating:5,text:'Çok temiz ve dikkatli.',date:'2024-11-05',service:'Derin Temizlik'},{user:'c7',rating:5,text:'Haftalık geliyor, harika.',date:'2024-10-20',service:'Ev Temizliği'}]},
  { id:'e5',  name:'Ali Şahin',        city:'İstanbul', avatar:'AŞ', color:'#96CEB4', title:'Lisanslı Elektrikçi',         categories:['elektrik'],         rating:4.94, reviews:274, price:300, experience:'10 yıl', elite:true,  bio:'Lisanslı elektrik teknisyeni.',                                     tags:['Priz Montajı','Aydınlatma','Panel'], reviewList:[{user:'c5',rating:5,text:'Aydınlatmayı tamamen yeniledi.',date:'2024-11-01',service:'Aydınlatma'}]},
  { id:'e9',  name:'Ercan Polat',      city:'İstanbul', avatar:'EP', color:'#06b6d4', title:'Elektrik & Güvenlik',         categories:['elektrik'],         rating:4.86, reviews:112, price:320, experience:'8 yıl',  elite:false, bio:'Kamera, alarm ve akıllı ev sistemleri.',                            tags:['Güvenlik Kamerası','Alarm','Akıllı Ev'], reviewList:[{user:'c1',rating:5,text:'Kamerayı kurdu, çok memnunum.',date:'2024-10-22',service:'Güvenlik'}]},
  { id:'e13', name:'Selin Yılmaz',     city:'İstanbul', avatar:'SY', color:'#f43f5e', title:'Nakliyat Uzmanı',             categories:['nakliyat'],         rating:4.88, reviews:134, price:500, experience:'6 yıl',  elite:false, bio:'Ev ve ofis taşıma, tam sigortalı nakliyat.',                        tags:['Ev Taşıma','Ofis Taşıma','Asansörlü'], reviewList:[{user:'c3',rating:5,text:'Hiçbir hasar olmadı.',date:'2024-11-10',service:'Ev Taşıma'}]},
  { id:'e17', name:'Kemal Yıldız',     city:'İstanbul', avatar:'KY', color:'#8b5cf6', title:'Boyacı & Dekorasyon',         categories:['boya'],             rating:4.91, reviews:98,  price:360, experience:'7 yıl',  elite:false, bio:'İç cephe boya, dekoratif efektler, alçı.',                          tags:['İç Boya','Dekoratif','Alçı'], reviewList:[{user:'c4',rating:5,text:'Duvarlar mükemmel görünüyor.',date:'2024-10-25',service:'İç Boya'}]},

  // ANKARA
  { id:'e3',  name:'Can Hatipoğlu',   city:'Ankara',   avatar:'CH', color:'#4ECDC4', title:'Tesisatçı',                   categories:['tesisat'],          rating:4.92, reviews:189, price:320, experience:'12 yıl', elite:false, bio:'Su tesisatı, doğalgaz, kalorifer tamiri.',                          tags:['Su Tesisatı','Tıkanıklık','Musluk Değişimi'], reviewList:[{user:'c3',rating:5,text:'Aynı gün geldi, sorunu çözdü.',date:'2024-11-08',service:'Banyo Tesisatı'}]},
  { id:'e4',  name:'Fatma Demir',     city:'Ankara',   avatar:'FD', color:'#FFD93D', title:'Boyacı & Dekorasyon',         categories:['boya'],             rating:4.90, reviews:156, price:350, experience:'7 yıl',  elite:false, bio:'İç cephe, dekoratif boya ve duvar kağıdı.',                         tags:['İç Boya','Duvar Kağıdı','Alçı'], reviewList:[{user:'c4',rating:5,text:'Fatma Hanım çok titiz çalıştı.',date:'2024-10-25',service:'İç Cephe'}]},
  { id:'e8',  name:'Semra Avcı',      city:'Ankara',   avatar:'SA', color:'#8b5cf6', title:'Temizlik Uzmanı',             categories:['temizlik'],         rating:4.91, reviews:167, price:260, experience:'4 yıl',  elite:false, bio:'Derin temizlik, taşınma sonrası temizlik.',                         tags:['Derin Temizlik','Taşınma Sonrası','Buzdolabı'], reviewList:[{user:'c9',rating:5,text:'Çok titiz.',date:'2024-11-03',service:'Derin Temizlik'}]},
  { id:'e14', name:'Berk Çelik',      city:'Ankara',   avatar:'BÇ', color:'#10b981', title:'Mobilya Montaj Uzmanı',       categories:['montaj'],           rating:4.89, reviews:145, price:260, experience:'5 yıl',  elite:false, bio:'Tüm marka mobilya montajı, hızlı ve temiz.',                      tags:['Mobilya Montaj','Raf','Dolap'], reviewList:[{user:'c6',rating:5,text:'Çok hızlı ve temiz çalıştı.',date:'2024-11-07',service:'Montaj'}]},
  { id:'e18', name:'Deniz Arslan',    city:'Ankara',   avatar:'DA', color:'#f59e0b', title:'Bahçe Bakım Uzmanı',          categories:['bahce'],            rating:4.86, reviews:77,  price:210, experience:'4 yıl',  elite:false, bio:'Çim biçme, budama, peyzaj tasarımı.',                               tags:['Çim Biçme','Budama','Peyzaj'], reviewList:[{user:'c7',rating:5,text:'Bahçemiz güzel oldu.',date:'2024-10-30',service:'Bahçe Bakımı'}]},

  // İZMİR
  { id:'e6',  name:'Zeynep Yıldız',   city:'İzmir',    avatar:'ZY', color:'#56AB2F', title:'Bahçe & Peyzaj Uzmanı',       categories:['bahce'],            rating:4.88, reviews:97,  price:220, experience:'6 yıl',  elite:false, bio:'Peyzaj tasarımı ve bahçe bakımı.',                                  tags:['Çim Biçme','Budama','Peyzaj'], reviewList:[{user:'c7',rating:5,text:'Bahçemizi güzel düzenledi.',date:'2024-10-30',service:'Bahçe'}]},
  { id:'e7',  name:'Hüseyin Korkmaz', city:'İzmir',    avatar:'HK', color:'#f59e0b', title:'Nakliyat & Taşıma',           categories:['nakliyat'],         rating:4.89, reviews:143, price:450, experience:'9 yıl',  elite:false, bio:'Ev ve ofis taşıma, ambalajlama dahil.',                             tags:['Ev Taşıma','Ofis Taşıma','Ambalajlama'], reviewList:[{user:'c8',rating:5,text:'Hiçbir hasar olmadı.',date:'2024-11-10',service:'Ev Taşıma'}]},
  { id:'e15', name:'Aslı Kaya',       city:'İzmir',    avatar:'AK', color:'#ec4899', title:'Ev Temizlik Uzmanı',          categories:['temizlik'],         rating:4.93, reviews:201, price:270, experience:'6 yıl',  elite:true,  bio:'Haftalık ve derin temizlik uzmanı.',                                tags:['Ev Temizliği','Derin Temizlik','Cam'], reviewList:[{user:'c5',rating:5,text:'Her zaman kusursuz.',date:'2024-11-01',service:'Haftalık Temizlik'}]},
  { id:'e19', name:'Serkan Doğan',    city:'İzmir',    avatar:'SD', color:'#6366f1', title:'Elektrikçi',                  categories:['elektrik'],         rating:4.87, reviews:108, price:290, experience:'7 yıl',  elite:false, bio:'Priz, aydınlatma, panel işleri.',                                   tags:['Priz','Aydınlatma','Panel'], reviewList:[{user:'c10',rating:5,text:'Hızlı ve güvenilir.',date:'2024-10-10',service:'Elektrik'}]},

  // BURSA
  { id:'e10', name:'Mustafa Çetin',   city:'Bursa',    avatar:'MÇ', color:'#ef4444', title:'Genel Tadilat Ustası',        categories:['boya','montaj','diger'], rating:4.85, reviews:89, price:300, experience:'15 yıl', elite:false, bio:'15 yıllık tadilat, boya, montaj.',                               tags:['Tadilat','Seramik','Alçıpan','Boya'], reviewList:[{user:'c6',rating:5,text:'Banyoyu komple yeniledi.',date:'2024-11-07',service:'Banyo Tadilatı'}]},
  { id:'e16', name:'Elif Şahin',      city:'Bursa',    avatar:'EŞ', color:'#a78bfa', title:'Temizlik Uzmanı',             categories:['temizlik'],         rating:4.89, reviews:115, price:240, experience:'5 yıl',  elite:false, bio:'Düzenli ve derin temizlik hizmetleri.',                             tags:['Ev Temizliği','Ofis','Koltuk Yıkama'], reviewList:[{user:'c8',rating:5,text:'Çok düzenli.',date:'2024-10-15',service:'Ev Temizliği'}]},
  { id:'e20', name:'Taner Yılmaz',    city:'Bursa',    avatar:'TY', color:'#0ea5e9', title:'Tesisatçı',                   categories:['tesisat'],          rating:4.90, reviews:132, price:310, experience:'8 yıl',  elite:false, bio:'Su ve doğalgaz tesisatı, arıza tamiri.',                            tags:['Su Tesisatı','Doğalgaz','Kalorifer'], reviewList:[{user:'c3',rating:5,text:'Sorunu hızla çözdü.',date:'2024-09-20',service:'Su Tesisatı'}]},

  // ANTALYA
  { id:'e21', name:'Meral Kaya',      city:'Antalya',  avatar:'MK', color:'#f97316', title:'Ev Temizlik Uzmanı',          categories:['temizlik'],         rating:4.92, reviews:178, price:255, experience:'5 yıl',  elite:false, bio:'Tatil evi ve konut temizliği.',                                     tags:['Ev Temizliği','Tatil Evi','Derin Temizlik'], reviewList:[{user:'c5',rating:5,text:'Harika hizmet.',date:'2024-11-05',service:'Ev Temizliği'}]},
  { id:'e22', name:'Oğuzhan Yıldız',  city:'Antalya',  avatar:'OY', color:'#22c55e', title:'Bahçe Bakım Uzmanı',          categories:['bahce'],            rating:4.87, reviews:89,  price:200, experience:'4 yıl',  elite:false, bio:'Bahçe bakımı ve peyzaj.',                                           tags:['Çim Biçme','Budama','Bahçe Tasarımı'], reviewList:[{user:'c4',rating:5,text:'Çok güzel çalışma.',date:'2024-10-12',service:'Bahçe'}]},
  { id:'e23', name:'Gül Arslan',      city:'Antalya',  avatar:'GA', color:'#e11d48', title:'Tesisatçı',                   categories:['tesisat'],          rating:4.88, reviews:95,  price:305, experience:'6 yıl',  elite:false, bio:'Su tesisatı ve banyo düzenleme.',                                   tags:['Musluk','Banyo','Tıkanıklık'], reviewList:[{user:'c9',rating:5,text:'Hızlı çözüm.',date:'2024-09-28',service:'Banyo'}]},

  // GAZİANTEP
  { id:'e24', name:'Kadir Öztürk',    city:'Gaziantep', avatar:'KÖ', color:'#7c3aed', title:'Mobilya Montaj Uzmanı',      categories:['montaj'],           rating:4.86, reviews:112, price:250, experience:'6 yıl',  elite:false, bio:'Hızlı ve kaliteli mobilya montajı.',                               tags:['Mobilya Montaj','Raf','Dolap'], reviewList:[{user:'c1',rating:5,text:'Çok hızlı.',date:'2024-11-08',service:'Montaj'}]},
  { id:'e25', name:'Leyla Kara',      city:'Gaziantep', avatar:'LK', color:'#0891b2', title:'Temizlik Uzmanı',            categories:['temizlik'],         rating:4.90, reviews:143, price:245, experience:'4 yıl',  elite:false, bio:'Ev ve ofis temizliği.',                                             tags:['Ev Temizliği','Ofis','Derin Temizlik'], reviewList:[{user:'c7',rating:5,text:'Çok temiz.',date:'2024-10-22',service:'Ev Temizliği'}]},

  // KONYA
  { id:'e26', name:'İbrahim Şahin',   city:'Konya',    avatar:'İŞ', color:'#059669', title:'Elektrikçi',                  categories:['elektrik'],         rating:4.89, reviews:107, price:285, experience:'8 yıl',  elite:false, bio:'Tüm elektrik işleri.',                                              tags:['Priz','Panel','Aydınlatma'], reviewList:[{user:'c2',rating:5,text:'Güvenilir.',date:'2024-11-01',service:'Elektrik'}]},
  { id:'e27', name:'Hatice Demir',    city:'Konya',    avatar:'HD', color:'#db2777', title:'Ev Temizlik Uzmanı',          categories:['temizlik'],         rating:4.91, reviews:121, price:240, experience:'5 yıl',  elite:false, bio:'Haftalık ev temizliği.',                                            tags:['Ev Temizliği','Derin Temizlik'], reviewList:[{user:'c6',rating:5,text:'Mükemmel.',date:'2024-10-18',service:'Temizlik'}]},

  // ADANA
  { id:'e28', name:'Tarık Yılmaz',    city:'Adana',    avatar:'TY', color:'#b45309', title:'Boyacı',                      categories:['boya'],             rating:4.87, reviews:98,  price:340, experience:'9 yıl',  elite:false, bio:'İç cephe boya ve dekorasyon.',                                      tags:['İç Boya','Dekoratif','Badana'], reviewList:[{user:'c3',rating:5,text:'Oda çok güzel.',date:'2024-11-02',service:'Boya'}]},
  { id:'e29', name:'Canan Yıldız',    city:'Adana',    avatar:'CY', color:'#0d9488', title:'Temizlik Uzmanı',             categories:['temizlik'],         rating:4.88, reviews:134, price:248, experience:'4 yıl',  elite:false, bio:'Konut ve daire temizliği.',                                         tags:['Ev Temizliği','Derin Temizlik'], reviewList:[{user:'c8',rating:5,text:'Çok memnun kaldık.',date:'2024-10-30',service:'Temizlik'}]},

  // MERSİN
  { id:'e30', name:'Ufuk Arslan',     city:'Mersin',   avatar:'UA', color:'#2563eb', title:'Nakliyat Uzmanı',             categories:['nakliyat'],         rating:4.86, reviews:87,  price:420, experience:'7 yıl',  elite:false, bio:'Ev ve iş yeri taşıma.',                                             tags:['Ev Taşıma','Ambalajlama','Asansörlü'], reviewList:[{user:'c1',rating:5,text:'Sorunsuz taşındık.',date:'2024-11-05',service:'Ev Taşıma'}]},
];

/* ---------- YARDIMCI FONKSİYONLAR ---------- */

/** Tag'i merkezi KATEGORİLER listesine göre kategori slug'una çevir */
function tagToCategory(tag) {
  if (typeof KATEGORİLER === 'undefined') return 'diger';
  const t = tag.toLowerCase().trim();
  for (const k of KATEGORİLER) {
    if (k.tags.some(kt => kt.toLowerCase() === t || t.includes(kt.toLowerCase()) || kt.toLowerCase().includes(t))) {
      return k.cat;
    }
  }
  return 'diger';
}

/** Uzman tag listesini → benzersiz kategori slug listesine çevir */
function tagsToCategoryList(tags) {
  if (!tags || !tags.length) return ['diger'];
  const cats = [...new Set(tags.map(tagToCategory))];
  return cats;
}

/** localStorage'daki gerçek uzman kullanıcılarını TÜM_UZMANLAR formatına dönüştür */
function getRealExperts() {
  try {
    const db = JSON.parse(localStorage.getItem('isbul_users_db') || '{}');
    return Object.values(db)
      .filter(u => u.isExpert && u.expertData)
      .map(u => ({
        id:         u.id,
        name:       u.firstName + ' ' + u.lastName,
        city:       u.expertData.city || 'İstanbul',
        avatar:     u.avatar || (u.firstName[0] + u.lastName[0]).toUpperCase(),
        color:      u.color || '#6C63FF',
        title:      (u.expertData.tags && u.expertData.tags[0]) ? u.expertData.tags[0] + ' Uzmanı' : 'Uzman',
        categories: tagsToCategoryList(u.expertData.tags),
        rating:     u.expertData.rating || 5.0,
        reviews:    u.expertData.reviews || 0,
        price:      u.expertData.price || 300,
        experience: u.expertData.experience || '1 yıl',
        elite:      u.expertData.verified || false,
        bio:        u.expertData.bio || '',
        tags:       u.expertData.tags || [],
        hours:      u.expertData.hours || '',
        reviewList: [],
        isRealUser: true
      }));
  } catch(e) { return []; }
}

/** Statik + gerçek uzmanları birleştir (gerçek kullanıcılar önce gelir) */
function getTumUzmanlar() {
  const realExperts = getRealExperts();
  // Statik listeden gerçek kullanıcılarla çakışanları çıkar (aynı id varsa)
  const realIds = new Set(realExperts.map(e => e.id));
  const staticExperts = TÜM_UZMANLAR.filter(e => !realIds.has(e.id));
  return [...realExperts, ...staticExperts];
}

/** Şehre göre uzmanları getir */
function getExpertsByCity(city) {
  const all = getTumUzmanlar();
  if (!city) return all;
  return all.filter(e => e.city === city);
}

/** Şehir + kategoriye göre uzmanları getir */
function getExpertsByCityAndCat(city, cat) {
  const all = getTumUzmanlar();
  let list = city ? all.filter(e => e.city === city) : all;
  if (cat && cat !== 'all') list = list.filter(e => e.categories.includes(cat));
  return list;
}

/** ID ile uzman bul (gerçek + statik) */
function getExpertById(id) {
  const all = getTumUzmanlar();
  return all.find(e => e.id === id) || TÜM_UZMANLAR[0];
}

/** Index ile uzman bul */
function getExpertByIndex(idx) {
  return TÜM_UZMANLAR[idx] || TÜM_UZMANLAR[0];
}

// Geriye dönük uyumluluk
const USERS = {
  experts: TÜM_UZMANLAR,
  customers: [
    { id:'c1',  name:'Zeynep Yılmaz',   city:'İstanbul', avatar:'ZY', color:'#6C63FF' },
    { id:'c2',  name:'Burak Kılıç',     city:'Ankara',   avatar:'BK', color:'#FF6B6B' },
    { id:'c3',  name:'Selin Arslan',    city:'İzmir',    avatar:'SA', color:'#4ECDC4' },
    { id:'c4',  name:'Murat Öztürk',    city:'Bursa',    avatar:'MÖ', color:'#FFD93D' },
    { id:'c5',  name:'Elif Çelik',      city:'Antalya',  avatar:'EÇ', color:'#96CEB4' },
    { id:'c6',  name:'Ahmet Demir',     city:'İstanbul', avatar:'AD', color:'#FF8B94' },
    { id:'c7',  name:'Fatma Güneş',     city:'Konya',    avatar:'FG', color:'#56AB2F' },
    { id:'c8',  name:'Kemal Aydın',     city:'İzmir',    avatar:'KA', color:'#f59e0b' },
    { id:'c9',  name:'Neslihan Şahin',  city:'Ankara',   avatar:'NŞ', color:'#8b5cf6' },
    { id:'c10', name:'Tolga Erdoğan',   city:'İstanbul', avatar:'TE', color:'#06b6d4' },
  ]
};


/* ---------- DEMO KULLANICILAR (localStorage'a otomatik yüklenecek) ---------- */
function seedDemoUsers() {
  // Sadece ilk çalıştırmada yükle
  if (localStorage.getItem('isbul_demo_seeded')) return;
  
  const db = {};
  const demoUsers = [
    { firstName: 'Ümit', lastName: 'Dedeoğlu', email: 'umityakupdedeoglu0@gmail.com', password: 'Umit311234', role: 'admin', isExpert: true, expertData: { tags: ['Mobilya Montajı', 'TV Montajı', 'Elektrik'], categories: ['montaj', 'tv', 'elektrik'], city: 'İstanbul', price: 350, rating: 5.0, reviews: 0, experience: '5+ yıl', bio: 'Profesyonel mobilya montajı, TV montajı ve elektrik işleri uzmanı. İstanbul genelinde hizmet veriyorum.', verified: true, elite: true, hours: 'Pzt-Cum: 09:00-18:00' }},
    { firstName: 'Ayşe', lastName: 'Yılmaz', email: 'ayse.yilmaz@example.com', password: 'demo123', role: 'customer' },
    { firstName: 'Mehmet', lastName: 'Kaya', email: 'mehmet.kaya@example.com', password: 'demo123', role: 'customer' },
    { firstName: 'Fatma', lastName: 'Demir', email: 'fatma.demir@example.com', password: 'demo123', role: 'expert', isExpert: true, expertData: { tags: ['İç Boya', 'Duvar Kağıdı', 'Alçı'], categories: ['boya'], city: 'Ankara', price: 350, rating: 4.90, reviews: 156, experience: '7 yıl', bio: 'İç cephe, dekoratif boya ve duvar kağıdı.', verified: true, elite: false }},
    { firstName: 'Ahmet', lastName: 'Öztürk', email: 'ahmet.ozturk@example.com', password: 'demo123', role: 'customer' },
    { firstName: 'Zeynep', lastName: 'Şahin', email: 'zeynep.sahin@example.com', password: 'demo123', role: 'expert', isExpert: true, expertData: { tags: ['Ev Temizliği', 'Derin Temizlik', 'Cam'], categories: ['temizlik'], city: 'İzmir', price: 270, rating: 4.93, reviews: 201, experience: '6 yıl', bio: 'Haftalık ve derin temizlik uzmanı.', verified: true, elite: true }},
    { firstName: 'Can', lastName: 'Arslan', email: 'can.arslan@example.com', password: 'demo123', role: 'customer' },
    { firstName: 'Elif', lastName: 'Polat', email: 'elif.polat@example.com', password: 'demo123', role: 'expert', isExpert: true, expertData: { tags: ['Su Tesisatı', 'Tıkanıklık', 'Musluk Değişimi'], categories: ['tesisat'], city: 'Bursa', price: 320, rating: 4.92, reviews: 189, experience: '12 yıl', bio: 'Su tesisatı, doğalgaz, kalorifer tamiri.', verified: true, elite: false }},
    { firstName: 'Burak', lastName: 'Çelik', email: 'burak.celik@example.com', password: 'demo123', role: 'customer' },
    { firstName: 'Selin', lastName: 'Yıldız', email: 'selin.yildiz@example.com', password: 'demo123', role: 'customer' }
  ];
  
  demoUsers.forEach(u => {
    const email = u.email.toLowerCase();
    db[email] = {
      id: 'u_demo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      firstName: u.firstName,
      lastName: u.lastName,
      email: email,
      passwordHash: btoa((u.password || 'demo123') + '_isbul_salt'),
      createdAt: new Date().toISOString(),
      avatar: (u.firstName[0] + u.lastName[0]).toUpperCase(),
      color: ['#6C63FF','#FF6B6B','#4ECDC4','#FFD93D','#96CEB4','#56AB2F'][Math.floor(Math.random()*6)],
      role: u.role || 'customer',
      isExpert: u.isExpert || false,
      expertData: u.expertData || null
    };
  });
  
  localStorage.setItem('isbul_users_db', JSON.stringify(db));
  localStorage.setItem('isbul_demo_seeded', 'true');
  console.log('✅ Demo kullanıcılar yüklendi');
}

// Sayfa yüklendiğinde demo kullanıcıları yükle
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    seedDemoUsers();
  });
}
