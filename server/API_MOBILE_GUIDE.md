# İşBul API — Mobil Geliştirici Rehberi

## Genel Bakış

İşBul API v1, web ve mobil (iOS/Android) uygulamalar için **tek doğruluk kaynağı**dır. React Native, Flutter, Swift, Kotlin gibi tüm platformlardan kullanılabilir.

---

## 📍 Base URL

- **Geliştirme:** `http://localhost:3001/api/v1`
- **Üretim:** `https://api.isbul.com/v1` *(yakında)*

---

## 🔐 Kimlik Doğrulama

### JWT Bearer Token

Tüm korumalı endpointler için Authorization header gereklidir:

```
Authorization: Bearer <token>
```

### Token Alma

**1. Kayıt:**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "firstName": "Ahmet",
  "lastName": "Yılmaz",
  "email": "ahmet@example.com",
  "password": "Test1234!",
  "role": "customer"  // veya "pending_expert"
}
```

**2. Giriş:**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "ahmet@example.com",
  "password": "Test1234!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "u_1234567890_abc",
      "firstName": "Ahmet",
      "lastName": "Yılmaz",
      "email": "ahmet@example.com",
      "role": "customer",
      "isExpert": false
    }
  },
  "timestamp": "2026-08-15T12:00:00.000Z"
}
```

**3. Mevcut Kullanıcı:**
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

---

## 📱 Mobil-Özel Header'lar (Opsiyonel)

Analitikte kullanmak için:

```
X-Platform: ios | android | web
X-App-Version: 1.0.0
```

---

## 🌐 CORS

Mobil uygulamalar için CORS devre dışı (native). Web tabanlı uygulamalar için izin verilen origin'ler:

- `http://localhost:*` (geliştirme)
- `capacitor://localhost` (Ionic/Capacitor)
- `ionic://localhost`

---

## 📊 Response Formatı

**Başarılı:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "total": 50 },  // opsiyonel
  "timestamp": "2026-08-15T12:00:00.000Z"
}
```

**Hata:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "E-posta adresi geçersiz."
  },
  "timestamp": "2026-08-15T12:00:00.000Z"
}
```

---

## 🔗 Endpoint'ler

### 1. Uzmanlar

**Liste:**
```http
GET /api/v1/experts?city=Istanbul&category=elektrik&sort=rating
```

**Detay:**
```http
GET /api/v1/experts/{expertId}
```

---

### 2. Rezervasyonlar

**Oluştur:**
```http
POST /api/v1/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "expertId": "u_xyz",
  "service": "Elektrik Tamiri",
  "date": "2026-09-01",
  "time": "10:00",
  "durationType": "hours",
  "durationValue": 2,
  "slots": ["2026-09-01_10:00", "2026-09-01_11:00"],
  "city": "Istanbul",
  "notes": "Açıklama"
}
```

**Müşteri Rezervasyonları:**
```http
GET /api/v1/bookings/my
Authorization: Bearer <token>
```

**Uzman Rezervasyonları:**
```http
GET /api/v1/bookings/expert
Authorization: Bearer <token>
```

**Durum Güncelle:**
```http
PATCH /api/v1/bookings/{bookingId}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed"  // confirmed, rejected, cancelled, completed
}
```

---

### 3. Takvim

**Dolu Slotlar:**
```http
GET /api/v1/calendar/{expertId}/slots?date=2026-09-01
```

**Müsaitlik Kontrolü:**
```http
POST /api/v1/calendar/{expertId}/check
Content-Type: application/json

{
  "slots": ["2026-09-01_10:00", "2026-09-01_11:00"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "available": false,
    "conflictSlot": "2026-09-01_10:00"
  }
}
```

---

### 4. Yorumlar

**Liste:**
```http
GET /api/v1/reviews/{expertId}
```

**Ekle:**
```http
POST /api/v1/reviews/{expertId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "text": "Harika bir hizmet aldım. Kesinlikle tavsiye ederim!",
  "service": "Elektrik Tamiri"
}
```

---

### 5. Bildirimler

**Liste:**
```http
GET /api/v1/notifications
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "type": "booking_confirmed",
        "title": "✅ Rezervasyonunuz Onaylandı",
        "message": "Ali Veli rezervasyonunuzu onayladı...",
        "bookingId": "bk_123",
        "read": false,
        "createdAt": "2026-08-15T10:00:00.000Z"
      }
    ],
    "unreadCount": 3
  }
}
```

---

### 6. Kullanıcı İstatistikleri

```http
GET /api/v1/notifications/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customer": {
      "totalBookings": 12,
      "completedBookings": 10,
      "pendingBookings": 2,
      "totalSpent": 3200,
      "reviewsGiven": 8
    },
    "expert": {
      "earnedTotal": 15600,
      "jobsCompleted": 52,
      "jobsPending": 3,
      "avgRating": 4.9,
      "reviewsReceived": 124
    }
  }
}
```

---

## ⚡ Rate Limiting

- **Genel:** 200 istek / 15 dakika
- **Auth:** 20 istek / 15 dakika
- **Rezervasyon/Yorum:** 10 istek / dakika

**Rate limit aşıldığında:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Çok fazla istek gönderildi..."
  }
}
```

---

## 📖 Swagger Dokümantasyonu

Tarayıcıda şu URL'i açarak tüm endpointleri interaktif test edebilirsiniz:

```
http://localhost:3001/api/docs
```

---

## 🛠️ Error Kodları

| Kod | Anlamı |
|-----|--------|
| `HTTP_400` | Geçersiz istek |
| `HTTP_401` | Yetki yok (token eksik/geçersiz) |
| `HTTP_403` | Erişim yasak |
| `HTTP_404` | Bulunamadı |
| `HTTP_409` | Çakışma (örn: slot dolu) |
| `HTTP_500` | Sunucu hatası |
| `VALIDATION_ERROR` | Veri doğrulama hatası |
| `RATE_LIMIT_EXCEEDED` | İstek limiti aşıldı |
| `AUTH_RATE_LIMIT` | Giriş limiti aşıldı |
| `ACTION_RATE_LIMIT` | İşlem limiti aşıldı |

---

## 🔄 Offline Mode

Mobil uygulamalarda offline desteği için:

1. **Token'ı cihazda sakla** (Keychain/Keystore)
2. **API başarısız olduğunda yerel cache kullan**
3. **Ağ tekrar aktif olduğunda senkronize et**

Örnek (React Native):
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

async function fetchBookings() {
  try {
    const res = await fetch('http://api.isbul.com/v1/bookings/my', {
      headers: {
        'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
        'X-Platform': 'ios',
      },
    });
    const data = await res.json();
    
    if (data.success) {
      // Cache'e kaydet
      await AsyncStorage.setItem('bookings_cache', JSON.stringify(data.data));
      return data.data;
    }
  } catch (error) {
    // Offline — cache'den oku
    const cached = await AsyncStorage.getItem('bookings_cache');
    return cached ? JSON.parse(cached) : [];
  }
}
```

---

## 🚀 Örnek: Flutter

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class IsbulAPI {
  static const String baseUrl = 'http://localhost:3001/api/v1';
  String? token;

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    
    final data = jsonDecode(response.body);
    if (data['success']) {
      token = data['data']['token'];
    }
    return data;
  }

  Future<List> getExperts({String? city, String? category}) async {
    final params = {
      if (city != null) 'city': city,
      if (category != null) 'category': category,
    };
    
    final uri = Uri.parse('$baseUrl/experts').replace(queryParameters: params);
    final response = await http.get(uri);
    
    final data = jsonDecode(response.body);
    return data['success'] ? data['data']['experts'] : [];
  }

  Future<Map<String, dynamic>> createBooking(Map<String, dynamic> booking) async {
    final response = await http.post(
      Uri.parse('$baseUrl/bookings'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
        'X-Platform': 'android',
      },
      body: jsonEncode(booking),
    );
    
    return jsonDecode(response.body);
  }
}
```

---

## 📞 Destek

- **API Dokümantasyonu:** http://localhost:3001/api/docs
- **Health Check:** http://localhost:3001/api/health
- **E-posta:** umityakupdedeoglu0@gmail.com

---

**Son Güncelleme:** 15 Ağustos 2026  
**API Versiyonu:** v1.0.0
