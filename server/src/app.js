/**
 * ��Bul API � Ana Uygulama
 *
 * Mimari: Mod�ler Monolith
 * Versiyon: /api/v1
 * Platform: Web + Mobil (React Native / Flutter uyumlu)
 *
 * T�m endpointler standart format d�nd�r�r:
 *   Ba�ar�: { success: true, data: {...}, meta: {...}, timestamp }
 *   Hata:   { success: false, error: { code, message }, timestamp }
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const passport = require('./config/passport');
const { initDb, startAutoSave } = require('./db');
const responseMiddleware = require('./middleware/response');
const { generalLimiter, authLimiter, actionLimiter } = require('./middleware/rateLimiter');
// Test ortam�nda rate limiting devre d���
const noopMiddleware = (req, res, next) => next();
const isTest = process.env.NODE_ENV === 'test';
const _generalLimiter  = isTest ? noopMiddleware : generalLimiter;
const _authLimiter     = isTest ? noopMiddleware : authLimiter;
const _actionLimiter   = isTest ? noopMiddleware : actionLimiter;
const { swaggerUi, swaggerDocument, swaggerOptions } = require('./config/swagger');
const app = express();
// �� G�venlik ��������������������������������������������
app.use(helmet({
  contentSecurityPolicy: false, // Swagger UI i�in kapal�
}));
// �� CORS � Web ve Mobil ��in Geni�letilmi� ��������������
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:4000',
  'http://localhost:3000',     // React dev server
  'http://localhost:8081',     // React Native Metro
  'http://localhost:19006',    // Expo web
  'capacitor://localhost',     // Ionic/Capacitor mobil
  'ionic://localhost',         // Ionic eski format
  // Production domains
  'https://isbul.online',
  'https://www.isbul.online',
  'https://isbul-backend.onrender.com',  // Backend kendi origin'i
];
app.use(cors({
  origin: (origin, callback) => {
    // origin yoksa (Postman, mobil native, curl) izin ver
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Geli�tirmede t�m localhost portlar�na izin ver
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    // onrender.com alt domainlerine izin ver
    if (origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }
    console.log('CORS blocked origin:', origin);
    callback(new Error(`CORS: ${origin} kayna��na izin verilmiyor.`));
  },
  credentials:     true,
  methods:         ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders:  ['Content-Type','Authorization','X-Platform','X-App-Version'],
  exposedHeaders:  ['X-Total-Count','X-Page','X-Pages'],
}));
// �� Logging ���������������������������������������������
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
// �� Body Parser �����������������������������������������
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// �� Passport ���������������������������������������������
app.use(passport.initialize());
// �� Standart Response Middleware �������������������������
app.use(responseMiddleware);
// �� Global Rate Limiter ����������������������������������
app.use('/api/', _generalLimiter);
// �� Swagger Dok�mantasyonu �������������������������������
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
// �� API v1 Routes ����������������������������������������
//   /api/v1/...  � Versiyonlu yeni endpointler (web + mobil)
//   /api/...     � Geriye d�n�k uyumluluk (web)
const v1 = express.Router();
v1.use('/auth',          _authLimiter,   require('./modules/auth/auth.routes'));
v1.use('/users',                         require('./modules/users/users.routes'));
v1.use('/experts',                       require('./modules/experts/experts.routes'));
v1.use('/bookings',      _actionLimiter, require('./modules/bookings/bookings.routes'));
v1.use('/calendar',                      require('./modules/calendar/calendar.routes'));
v1.use('/reviews',       _actionLimiter, require('./modules/reviews/reviews.routes'));
v1.use('/notifications',                 require('./modules/notifications/notifications.routes'));
v1.use('/admin',                         require('./modules/admin/admin.routes'));
v1.use('/chatbot',       _actionLimiter, require('./modules/chatbot/chatbot.routes'));
// v1 router'� iki prefix'e ba�la � geriye d�n�k uyumluluk
app.use('/api/v1', v1);
app.use('/api',    v1);   // eski /api/... URL'leri �al��maya devam eder
// �� Health & Info ����������������������������������������
app.get('/api/health', (req, res) => {
  res.json({
    success:   true,
    data: {
      status:    'ok',
      version:   '1.0.0',
      apiVersion:'v1',
      message:   'İşBul API çalışıyor',
      endpoints: {
        docs:       '/api/docs',
        health:     '/api/health',
        auth:       '/api/v1/auth',
        users:      '/api/v1/users',
        experts:    '/api/v1/experts',
        bookings:   '/api/v1/bookings',
        calendar:   '/api/v1/calendar',
        reviews:    '/api/v1/reviews',
        notifications: '/api/v1/notifications',
        admin:      '/api/v1/admin',
        chatbot:    '/api/v1/chatbot',
      },
      // Mobil geli�tirici bilgisi
      mobile: {
        platforms:     ['iOS', 'Android', 'Web'],
        authentication:'JWT Bearer Token',
        headers: {
          required:  ['Authorization: Bearer <token>'],
          optional:  ['X-Platform: ios|android|web', 'X-App-Version: 1.0.0'],
        },
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// v1 health endpoint (frontend /api/v1/health çağrıyor)
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      version: '1.0.0',
      apiVersion: 'v1',
      message: 'İşBul API çalışıyor',
    },
    timestamp: new Date().toISOString(),
  });
});

// �� 404 Handler ������������������������������������������
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code:    'NOT_FOUND',
      message: `Endpoint bulunamad�: ${req.method} ${req.path}`,
    },
    timestamp: new Date().toISOString(),
  });
});
// �� Global Error Handler ���������������������������������
app.use((err, req, res, next) => {
  // CORS hatas�
  if (err.message?.startsWith('CORS:')) {
    return res.status(403).json({
      success: false,
      error: { code: 'CORS_ERROR', message: err.message },
    });
  }
  console.error('[API Hatas�]', err.message || err);
  res.status(500).json({
    success: false,
    error: {
      code:    'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'Beklenmeyen bir hata olu�tu.'
        : err.message || 'Sunucu hatas�.',
    },
    timestamp: new Date().toISOString(),
  });
});
// �� Ba�lat �����������������������������������������������
async function start() {
  await initDb();
  startAutoSave();
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`\n? ��Bul API v1`);
    console.log(`   URL:    http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   Docs:   http://localhost:${PORT}/api/docs`);
    console.log(`   Mod:    ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Mobil:  iOS/Android/Web ?\n`);
  });
}
if (require.main === module) {
  start().catch(err => { console.error('Ba�latma hatas�:', err); process.exit(1); });
}
module.exports = { app, initDb };
