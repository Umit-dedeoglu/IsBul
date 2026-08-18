# 🚀 AWS Free Tier Deployment Rehberi - İşBul

## 📋 AWS Free Tier Kapsamı (12 Ay Ücretsiz)

### Kullanacağımız Servisler:
- ✅ **EC2** (t2.micro): 750 saat/ay - Frontend + Backend
- ✅ **RDS** (db.t2.micro): 750 saat/ay - PostgreSQL/MySQL Database
- ✅ **S3**: 5GB depolama - Dosya yükleme (profil fotoğrafları)
- ✅ **CloudFront**: 50GB transfer - CDN
- ✅ **Route 53**: $0.50/ay - DNS yönetimi
- ✅ **SES**: 62,000 email/ay - Email gönderimi

**Toplam Maliyet:** İlk 12 ay ~$0 (sadece domain $10-15/yıl)

---

## 🎯 DEPLOYMENT PLANI

### Mimari:
```
Internet
    ↓
Route 53 (DNS)
    ↓
CloudFront (CDN)
    ↓
EC2 Instance (t2.micro)
    ├── Nginx (Web Server)
    ├── Node.js (Backend API)
    └── PM2 (Process Manager)
    ↓
RDS (PostgreSQL)
    ↓
S3 (File Storage)
```

---

## 📦 ADIM 1: AWS Hesabı Oluşturma

### 1.1 AWS Hesabı Aç
```
1. https://aws.amazon.com/tr/free/ adresine git
2. "Ücretsiz Hesap Oluşturun" butonuna tıkla
3. Email ve şifre belirle
4. İletişim bilgilerini gir
5. Kredi kartı bilgilerini ekle (ücret kesilmez, doğrulama için)
6. Telefon doğrulaması yap
7. Support Plan: "Temel (Ücretsiz)" seç
```

### 1.2 MFA (Çok Faktörlü Kimlik Doğrulama) Aktif Et
```
1. IAM Dashboard → Root user
2. "Assign MFA" tıkla
3. Google Authenticator kullan
4. QR kodu tara
5. İki kod gir ve aktif et
```

---

## 🖥️ ADIM 2: EC2 Instance Kurulumu

### 2.1 EC2 Instance Oluştur
```
1. AWS Console → EC2
2. "Launch Instance" butonuna tıkla
3. Aşağıdaki ayarları yap:
```

**Instance Ayarları:**
```
Name: isbul-production
AMI: Ubuntu Server 22.04 LTS (Free tier eligible)
Instance type: t2.micro (Free tier eligible)
Key pair: Create new key pair
  - Name: isbul-keypair
  - Type: RSA
  - Format: .pem
  - İndir ve güvenli bir yerde sakla!

Network settings:
  ✅ Allow SSH traffic from: My IP
  ✅ Allow HTTP traffic from the internet
  ✅ Allow HTTPS traffic from the internet

Storage: 30 GB gp2 (Free tier max)
```

**"Launch instance" tıkla ve not al:**
```
Instance ID: i-xxxxxxxxxx
Public IPv4: XX.XXX.XXX.XXX
```

### 2.2 Elastic IP Ata (Sabit IP)
```
1. EC2 → Elastic IPs
2. "Allocate Elastic IP address"
3. Yeni IP'yi seç
4. Actions → Associate Elastic IP address
5. Instance: isbul-production seç
6. Associate

Not al:
Elastic IP: XX.XXX.XXX.XXX
```

### 2.3 Security Group Ayarları
```
EC2 → Security Groups → isbul-production-sg

Inbound Rules:
  Type        Protocol  Port Range  Source
  SSH         TCP       22          My IP
  HTTP        TCP       80          0.0.0.0/0
  HTTPS       TCP       443         0.0.0.0/0
  Custom TCP  TCP       3001        My IP (Backend API - geliştirme için)

Outbound Rules:
  All traffic (varsayılan)
```

---

## 🗄️ ADIM 3: RDS Database Kurulumu

### 3.1 RDS Instance Oluştur
```
1. AWS Console → RDS
2. "Create database"
3. Ayarlar:
```

**Database Ayarları:**
```
Engine: PostgreSQL (veya MySQL)
Version: PostgreSQL 15.3
Templates: Free tier

DB instance identifier: isbul-db
Master username: isbul_admin
Master password: [GÜVENLİ ŞİFRE - NOT AL!]
Confirm password: [AYNI ŞİFRE]

Instance configuration: db.t2.micro
Storage: 20 GB (Free tier max)
Storage autoscaling: Disable

Connectivity:
  VPC: Default VPC
  Public access: Yes (geliştirme için)
  VPC security group: Create new
  New security group name: isbul-db-sg

Additional configuration:
  Initial database name: isbul_production
  Backup retention: 7 days
  Encryption: Enable (önerilen)

"Create database" tıkla (5-10 dakika sürer)
```

**Database bilgilerini not al:**
```
Endpoint: isbul-db.xxxxxxxxxx.eu-central-1.rds.amazonaws.com
Port: 5432
Database: isbul_production
Username: isbul_admin
Password: [ŞİFREN]
```

### 3.2 RDS Security Group Düzenle
```
RDS → Databases → isbul-db → VPC security groups

Inbound Rules ekle:
  Type: PostgreSQL
  Protocol: TCP
  Port: 5432
  Source: EC2 Security Group (isbul-production-sg)
```

---

## 📁 ADIM 4: S3 Bucket Oluşturma

### 4.1 S3 Bucket Oluştur
```
1. AWS Console → S3
2. "Create bucket"

Bucket name: isbul-uploads-[RASTGELE-SAYI]
  (örnek: isbul-uploads-2026)
  
AWS Region: EU (Frankfurt) eu-central-1

Object Ownership: ACLs disabled
Block Public Access: Uncheck ALL (dosyalara erişim için)
  ⚠️ Checkbox'u işaretle: "I acknowledge..."
  
Bucket Versioning: Disable
Encryption: Enable

"Create bucket" tıkla
```

### 4.2 Bucket Policy Ekle
```
S3 → Buckets → isbul-uploads-xxx → Permissions → Bucket policy

Aşağıdaki policy'yi ekle:
```

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::isbul-uploads-2026/*"
    }
  ]
}
```

### 4.3 CORS Configuration
```
S3 → Buckets → isbul-uploads-xxx → Permissions → CORS
```

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

---

## 🔐 ADIM 5: IAM User Oluşturma

### 5.1 IAM User (Backend için)
```
1. AWS Console → IAM → Users
2. "Create user"

User name: isbul-backend
Access type: Programmatic access

Permissions: Attach existing policies
  ✅ AmazonS3FullAccess
  ✅ AmazonSESFullAccess

"Create user"

⚠️ KAYDET!
Access Key ID: AKIAxxxxxxxxxx
Secret Access Key: xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🌐 ADIM 6: EC2'ye Bağlanma ve Kurulum

### 6.1 SSH ile Bağlan (Windows)
```powershell
# PowerShell'de:
cd ~\Downloads
ssh -i isbul-keypair.pem ubuntu@[ELASTIC-IP]

# İlk bağlantıda "yes" yaz
```

### 6.2 Server Güncelleme
```bash
# Root yetkisi al
sudo su

# Sistem güncellemesi
apt update && apt upgrade -y

# Gerekli paketler
apt install -y nginx nodejs npm git postgresql-client
npm install -g pm2 n
n lts
```

### 6.3 Nginx Kurulumu
```bash
# Nginx yapılandırması
nano /etc/nginx/sites-available/isbul

# Aşağıdaki konfigürasyonu yapıştır:
```

```nginx
server {
    listen 80;
    server_name [ELASTIC-IP] isbul.com www.isbul.com;

    # Frontend (Static Files)
    root /var/www/isbul;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

```bash
# Nginx'i aktif et
ln -s /etc/nginx/sites-available/isbul /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx
```

### 6.4 Frontend Dosyalarını Yükle
```bash
# Frontend dizini oluştur
mkdir -p /var/www/isbul
cd /var/www/isbul

# Git ile projeyi çek
git clone https://github.com/Umit-dedeoglu/IsBul.git .

# Gereksiz dosyaları sil
rm -rf .git .gitignore PRODUCTION-README.md AWS-DEPLOYMENT-GUIDE.md

# İzinleri ayarla
chown -R www-data:www-data /var/www/isbul
chmod -R 755 /var/www/isbul
```

### 6.5 Backend API Kurulumu
```bash
# Backend dizini oluştur
mkdir -p /var/www/isbul-backend
cd /var/www/isbul-backend

# Backend projesini başlat
npm init -y

# Gerekli paketleri yükle
npm install express cors dotenv pg bcrypt jsonwebtoken multer aws-sdk nodemailer helmet express-rate-limit

# Server dosyası oluştur
nano server.js
```

**server.js içeriği:**
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Routes (eklenecek)
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/bookings', require('./routes/bookings'));
// app.use('/api/admin', require('./routes/admin'));

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
```

### 6.6 Environment Variables
```bash
nano .env
```

**.env içeriği:**
```env
# Server
NODE_ENV=production
PORT=3001

# Database
DB_HOST=isbul-db.xxxxxxxxxx.eu-central-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=isbul_production
DB_USER=isbul_admin
DB_PASSWORD=[RDS-ŞİFREN]

# JWT
JWT_SECRET=[RASTGELE-UZUN-STRING-OLUŞTUR]
JWT_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=[IAM-ACCESS-KEY]
AWS_SECRET_ACCESS_KEY=[IAM-SECRET-KEY]
AWS_REGION=eu-central-1
AWS_BUCKET=isbul-uploads-2026

# Email (AWS SES)
AWS_SES_REGION=eu-central-1
EMAIL_FROM=noreply@isbul.com

# Frontend URL
FRONTEND_URL=http://[ELASTIC-IP]
```

### 6.7 PM2 ile Backend'i Başlat
```bash
cd /var/www/isbul-backend

# PM2 ile başlat
pm2 start server.js --name isbul-api

# Otomatik başlatma
pm2 startup
pm2 save

# Logları izle
pm2 logs isbul-api
```

---

## 🔒 ADIM 7: SSL Sertifikası (Let's Encrypt)

### 7.1 Certbot Kurulumu
```bash
apt install -y certbot python3-certbot-nginx

# SSL sertifikası al (domain bağlandıktan sonra)
certbot --nginx -d isbul.com -d www.isbul.com

# Email: [EMAİLİN]
# Terms: A (Agree)
# Share email: N (No)
# Redirect HTTP to HTTPS: 2 (Yes)

# Otomatik yenileme
systemctl enable certbot.timer
systemctl start certbot.timer
```

---

## 🌍 ADIM 8: Domain Bağlama (Route 53)

### 8.1 Domain Al
```
Önerilen: Namecheap, GoDaddy, HostGator
Domain: isbul.com veya isbul.com.tr
```

### 8.2 Route 53 Hosted Zone
```
1. AWS Console → Route 53
2. "Create hosted zone"
   - Domain name: isbul.com
   - Type: Public hosted zone
   - Create

3. Record oluştur:
   A Record:
   - Record name: (boş bırak - root domain)
   - Value: [ELASTIC-IP]
   - TTL: 300

   A Record (www):
   - Record name: www
   - Value: [ELASTIC-IP]
   - TTL: 300
```

### 8.3 Domain Nameservers Güncelle
```
Route 53'ten Name Server'ları kopyala:
  ns-xxx.awsdns-xx.com
  ns-xxx.awsdns-xx.co.uk
  ns-xxx.awsdns-xx.org
  ns-xxx.awsdns-xx.net

Domain sağlayıcında (Namecheap, GoDaddy):
  Nameservers → Custom DNS
  Yukarıdaki 4 nameserver'ı yapıştır
  
⏰ Propagasyon: 24-48 saat sürebilir
```

---

## 📊 ADIM 9: Monitoring & Logs

### 9.1 CloudWatch Alarms
```
EC2 → Monitoring → Create alarm:
  - CPU > 80%
  - Network Out > 1GB
  - Disk Usage > 80%
  
Email bildirimi al
```

### 9.2 Log Takibi
```bash
# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# PM2 logs
pm2 logs isbul-api

# System logs
journalctl -f
```

---

## ✅ ADIM 10: Test & Doğrulama

### 10.1 Frontend Test
```
http://[ELASTIC-IP]
- Ana sayfa açılıyor mu?
- Tüm sayfalar çalışıyor mu?
- CSS/JS yükleniyor mu?
```

### 10.2 Backend Test
```bash
curl http://[ELASTIC-IP]/api/health

Beklenen çıktı:
{"status":"ok","message":"API is running"}
```

### 10.3 Database Test
```bash
# EC2'de
psql -h [RDS-ENDPOINT] -U isbul_admin -d isbul_production

# Bağlantı başarılı mı?
\l  # Database listesi
\q  # Çıkış
```

---

## 💰 Maliyet Takibi

### Free Tier Limitleri İzle
```
AWS Console → Billing Dashboard → Free Tier

Uyarılar:
- EC2: 750 saat/ay (1 instance 7/24)
- RDS: 750 saat/ay (1 instance 7/24)
- S3: 5GB storage
- Data Transfer: 15GB/ay
```

### Billing Alarms Kur
```
Billing → Budgets → Create budget:
  Budget name: isbul-monthly
  Amount: $5
  Alert threshold: $3
```

---

## 🚀 DEPLOYMENT TAMAMLANDI!

### Erişim URL'leri:
```
Frontend: http://[ELASTIC-IP]
Backend API: http://[ELASTIC-IP]/api
Admin Panel: http://[ELASTIC-IP]/admin-panel.html
```

### Domain bağlandıktan sonra:
```
Frontend: https://isbul.com
Backend API: https://isbul.com/api
Admin Panel: https://isbul.com/admin-panel.html
```

---

## 📝 Sonraki Adımlar

### Backend Geliştirme
1. ✅ Database şeması oluştur
2. ✅ API endpoints yaz
3. ✅ Authentication implementasyonu
4. ✅ File upload (S3)
5. ✅ Email service (SES)
6. ✅ Payment gateway (iyzico)

### Production Optimizasyonları
1. ✅ CloudFront CDN ekle
2. ✅ Auto Scaling yapılandır
3. ✅ Load Balancer ekle (birden fazla instance)
4. ✅ Database replica oluştur
5. ✅ Backup stratejisi

---

## 🆘 Sorun Giderme

### Site Açılmıyor
```bash
# Nginx durumunu kontrol et
systemctl status nginx

# Nginx restart
systemctl restart nginx

# Logları kontrol et
tail -f /var/log/nginx/error.log
```

### API Çalışmıyor
```bash
# PM2 durumu
pm2 status

# PM2 restart
pm2 restart isbul-api

# Logları kontrol et
pm2 logs isbul-api
```

### Database Bağlantı Hatası
```bash
# Security Group kontrol et
# RDS endpoint doğru mu?
# Şifre doğru mu?

# Test et
psql -h [RDS-ENDPOINT] -U isbul_admin -d isbul_production
```

---

## 📞 Yardım

### AWS Dokümantasyon
- EC2: https://docs.aws.amazon.com/ec2/
- RDS: https://docs.aws.amazon.com/rds/
- S3: https://docs.aws.amazon.com/s3/

### AWS Support
- Free Tier: Community Forums
- Developer: $29/ay
- Business: $100/ay

---

**Hazırlayan:** Kiro AI
**Tarih:** 18 Ağustos 2026
**Versiyon:** 1.0.0
**Status:** 🟢 DEPLOYMENT READY
