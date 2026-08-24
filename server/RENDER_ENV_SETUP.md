# RENDER ENVIRONMENT VARIABLES SETUP

## ⚠️ ÖNEMLİ: Bu değişkenler Render Dashboard'da ayarlanmalı!

Render Dashboard → isbul-backend servisi → Environment → Add Environment Variable

## Gerekli Environment Variables:

### 1. Frontend URL (ÇOK ÖNEMLİ!)
```
FRONTEND_URL=https://isbul.online
```

### 2. Google OAuth Credentials
```
GOOGLE_CLIENT_ID=<Google Cloud Console'dan alın>
GOOGLE_CLIENT_SECRET=<Google Cloud Console'dan alın>
GOOGLE_CALLBACK_URL=https://isbul-backend.onrender.com/api/v1/auth/google/callback
```

### 3. JWT Secret
```
JWT_SECRET=<güvenli bir random string>
JWT_EXPIRES_IN=7d
```

### 4. Port (Render otomatik ayarlar ama yine de ekleyin)
```
PORT=3001
NODE_ENV=production
```

### 5. Database URL (eğer PostgreSQL kullanıyorsanız)
```
DATABASE_URL=<Supabase veya başka DB URL'i>
```

## Google Cloud Console Ayarları

https://console.cloud.google.com/apis/credentials

1. OAuth 2.0 Client ID'nize tıklayın
2. **Authorized redirect URIs** bölümüne ekleyin:
   ```
   https://isbul-backend.onrender.com/api/v1/auth/google/callback
   ```

## Test Adımları

1. Environment variables'ları Render'da ayarlayın
2. Servisi manuel deploy edin veya kodu push edin
3. Logs'u kontrol edin: Render Dashboard → isbul-backend → Logs
4. Test URL: https://isbul-backend.onrender.com/api/v1/auth/google
5. Google hesabı seçin
6. https://isbul.online/oauth-callback.html?token=... URL'ine düşmeli

## Hata Durumunda Kontrol Listesi

✅ FRONTEND_URL değişkeni `https://isbul.online` olarak ayarlandı mı?
✅ GOOGLE_CLIENT_ID ve GOOGLE_CLIENT_SECRET doğru mu?
✅ GOOGLE_CALLBACK_URL `https://isbul-backend.onrender.com/api/v1/auth/google/callback` mu?
✅ Google Console'da Authorized redirect URI eklenmiş mi?
✅ Backend'de en son kod deploy edilmiş mi?

## Logs'da Göreceğiniz Mesajlar

Başarılı OAuth:
```
🔵 Google OAuth Strategy triggered
Profile ID: 1234567890
Profile email: user@example.com
✅ OAuth successful for user: u_1234567890_abc12
✅ OAuth başarılı, token oluşturuldu
🚀 Yönlendirme URL: https://isbul.online/oauth-callback.html?token=...
```

Hata durumu:
```
❌ Google OAuth error: ...
```
