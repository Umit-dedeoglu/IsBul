/**
 * İşBul API — OpenAPI/Swagger Dokümantasyonu
 * Web ve mobil geliştiriciler için tam API referansı
 */

const swaggerUi   = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title:       'İşBul API',
    version:     '1.0.0',
    description: 'İşBul — Hizmet platformu REST API. Web ve mobil istemciler bu API\'yi kullanır.',
    contact: {
      name:  'İşBul Geliştirici',
      email: 'umityakupdedeoglu0@gmail.com',
    },
  },
  servers: [
    { url: 'https://isbul-backend.onrender.com/api/v1', description: 'Production' },
    { url: 'http://localhost:3001/api/v1',               description: 'Development' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type:         'http',
        scheme:       'bearer',
        bearerFormat: 'JWT',
        description:  'Login/register ile alınan JWT token',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id:         { type: 'string', example: 'u_1234567890_abc' },
          firstName:  { type: 'string', example: 'Ümit' },
          lastName:   { type: 'string', example: 'Dedeoğlu' },
          email:      { type: 'string', example: 'umit@example.com' },
          avatar:     { type: 'string', example: 'ÜD' },
          color:      { type: 'string', example: '#6C63FF' },
          role:       { type: 'string', enum: ['customer','expert','admin','pending_expert'] },
          isExpert:   { type: 'boolean' },
          expertData: { $ref: '#/components/schemas/ExpertData' },
        },
      },
      ExpertData: {
        type: 'object',
        properties: {
          price:      { type: 'integer', example: 300 },
          bio:        { type: 'string' },
          city:       { type: 'string', example: 'İstanbul' },
          tags:       { type: 'array', items: { type: 'string' } },
          hours:      { type: 'string', example: 'Pzt-Cum: 09:00-18:00' },
          rating:     { type: 'number', example: 4.9 },
          reviews:    { type: 'integer', example: 124 },
        },
      },
      Booking: {
        type: 'object',
        properties: {
          id:            { type: 'string' },
          customerId:    { type: 'string' },
          expertId:      { type: 'string' },
          service:       { type: 'string' },
          date:          { type: 'string', format: 'date', example: '2026-09-01' },
          time:          { type: 'string', example: '10:00' },
          durationType:  { type: 'string', enum: ['hours','days','weeks'] },
          durationValue: { type: 'integer', example: 2 },
          totalPrice:    { type: 'integer', example: 600 },
          status:        { type: 'string', enum: ['pending','confirmed','rejected','cancelled','completed'] },
          createdAt:     { type: 'string', format: 'date-time' },
        },
      },
      Review: {
        type: 'object',
        properties: {
          id:         { type: 'string' },
          expertId:   { type: 'string' },
          customerId: { type: 'string' },
          userName:   { type: 'string' },
          rating:     { type: 'integer', minimum: 1, maximum: 5 },
          text:       { type: 'string', minLength: 10 },
          service:    { type: 'string' },
          date:       { type: 'string' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success:   { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code:    { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'E-posta adresi geçersiz.' },
            },
          },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  security: [{ BearerAuth: [] }],
  tags: [
    { name: 'Auth',     description: 'Kimlik doğrulama — kayıt, giriş, Google OAuth' },
    { name: 'Users',    description: 'Kullanıcı profili yönetimi' },
    { name: 'Experts',  description: 'Uzman listesi ve profil işlemleri' },
    { name: 'Bookings', description: 'Rezervasyon oluşturma ve yönetimi' },
    { name: 'Calendar', description: 'Uzman takvimi ve müsaitlik kontrolü' },
    { name: 'Reviews',  description: 'Uzman değerlendirmeleri' },
    { name: 'Admin',    description: 'Yönetici işlemleri (admin rolü gerektirir)' },
  ],
  paths: {
    // ── AUTH ──────────────────────────────────────────────
    '/auth/register': {
      post: {
        tags: ['Auth'], summary: 'Yeni hesap oluştur',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object',
            required: ['firstName','lastName','email','password'],
            properties: {
              firstName: { type: 'string' },
              lastName:  { type: 'string' },
              email:     { type: 'string', format: 'email' },
              password:  { type: 'string', minLength: 8 },
              role:      { type: 'string', enum: ['customer','pending_expert'], default: 'customer' },
            },
          }}},
        },
        responses: {
          201: { description: 'Başarılı kayıt', content: { 'application/json': { schema: { properties: { success: { type: 'boolean' }, data: { properties: { token: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } } } } } } },
          409: { description: 'E-posta zaten kayıtlı', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'], summary: 'Giriş yap',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object',
            required: ['email','password'],
            properties: {
              email:    { type: 'string', format: 'email' },
              password: { type: 'string' },
            },
          }}},
        },
        responses: {
          200: { description: 'Başarılı giriş' },
          401: { description: 'Hatalı kimlik bilgileri', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'], summary: 'Mevcut kullanıcı bilgisini al',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Kullanıcı bilgisi' },
          401: { description: 'Yetki yok' },
        },
      },
    },
    '/auth/google': {
      get: {
        tags: ['Auth'], summary: 'Google OAuth ile giriş',
        security: [],
        responses: { 302: { description: 'Google giriş sayfasına yönlendir' } },
      },
    },
    // ── USERS ─────────────────────────────────────────────
    '/users/profile': {
      get:   { tags: ['Users'], summary: 'Profil bilgisi al', security: [{ BearerAuth: [] }], responses: { 200: { description: 'Kullanıcı profili' } } },
      patch: {
        tags: ['Users'], summary: 'Profil güncelle',
        security: [{ BearerAuth: [] }],
        requestBody: { content: { 'application/json': { schema: { properties: { firstName: { type: 'string' }, lastName: { type: 'string' } } } } } },
        responses: { 200: { description: 'Güncellenmiş profil' } },
      },
    },
    '/users/change-password': {
      post: {
        tags: ['Users'], summary: 'Şifre değiştir',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { required: ['currentPassword','newPassword'], properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string', minLength: 8 } } } } } },
        responses: { 200: { description: 'Şifre güncellendi' }, 401: { description: 'Mevcut şifre hatalı' } },
      },
    },
    '/users/account': {
      delete: {
        tags: ['Users'], summary: 'Hesabı sil',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Hesap silindi' } },
      },
    },
    // ── EXPERTS ───────────────────────────────────────────
    '/experts': {
      get: {
        tags: ['Experts'], summary: 'Uzman listesi',
        security: [],
        parameters: [
          { name: 'city',     in: 'query', schema: { type: 'string' }, description: 'Şehir filtresi' },
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Kategori (elektrik, tesisat vb.)' },
          { name: 'search',   in: 'query', schema: { type: 'string' }, description: 'İsim veya etiket araması' },
          { name: 'sort',     in: 'query', schema: { type: 'string', enum: ['rating','price-asc','price-desc','reviews'] }, description: 'Sıralama' },
        ],
        responses: { 200: { description: 'Uzman listesi' } },
      },
    },
    '/experts/{id}': {
      get: {
        tags: ['Experts'], summary: 'Uzman detayı',
        security: [],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Uzman bilgisi ve yorumlar' }, 404: { description: 'Uzman bulunamadı' } },
      },
    },
    '/experts/profile': {
      patch: {
        tags: ['Experts'], summary: 'Uzman profili güncelle',
        security: [{ BearerAuth: [] }],
        requestBody: { content: { 'application/json': { schema: { properties: { price: { type: 'integer' }, bio: { type: 'string' }, city: { type: 'string' }, tags: { type: 'array', items: { type: 'string' } }, hours: { type: 'string' }, experience: { type: 'string' } } } } } },
        responses: { 200: { description: 'Güncellenmiş uzman profili' } },
      },
    },
    // ── BOOKINGS ──────────────────────────────────────────
    '/bookings': {
      post: {
        tags: ['Bookings'], summary: 'Rezervasyon oluştur',
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { required: ['expertId','service','date','time'], properties: { expertId: { type: 'string' }, service: { type: 'string' }, date: { type: 'string', format: 'date' }, time: { type: 'string', example: '10:00' }, durationType: { type: 'string', enum: ['hours','days','weeks'] }, durationValue: { type: 'integer' }, slots: { type: 'array', items: { type: 'string' } }, city: { type: 'string' }, notes: { type: 'string' } } } } } },
        responses: { 201: { description: 'Rezervasyon oluşturuldu' }, 409: { description: 'Saat dolu' } },
      },
    },
    '/bookings/my': {
      get: { tags: ['Bookings'], summary: 'Kendi rezervasyonlarım', security: [{ BearerAuth: [] }], responses: { 200: { description: 'Rezervasyon listesi' } } },
    },
    '/bookings/expert': {
      get: { tags: ['Bookings'], summary: 'Uzmana gelen rezervasyonlar', security: [{ BearerAuth: [] }], responses: { 200: { description: 'Rezervasyon listesi' } } },
    },
    '/bookings/{id}/status': {
      patch: {
        tags: ['Bookings'], summary: 'Rezervasyon durumunu güncelle',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { required: ['status'], properties: { status: { type: 'string', enum: ['confirmed','rejected','cancelled','completed'] } } } } } },
        responses: { 200: { description: 'Durum güncellendi' }, 403: { description: 'Yetkisiz' } },
      },
    },
    // ── CALENDAR ──────────────────────────────────────────
    '/calendar/{expertId}/slots': {
      get: {
        tags: ['Calendar'], summary: 'Uzmanın dolu slotları',
        security: [],
        parameters: [
          { name: 'expertId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'date',     in: 'query', schema: { type: 'string', format: 'date' }, description: 'Belirli gün (opsiyonel)' },
        ],
        responses: { 200: { description: 'Dolu slotlar objesi { "2026-09-01_10:00": true }' } },
      },
    },
    '/calendar/{expertId}/check': {
      post: {
        tags: ['Calendar'], summary: 'Slot müsaitlik kontrolü',
        security: [],
        parameters: [{ name: 'expertId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { required: ['slots'], properties: { slots: { type: 'array', items: { type: 'string' }, example: ['2026-09-01_10:00','2026-09-01_11:00'] } } } } } },
        responses: { 200: { description: '{ available: bool, conflictSlot?: string }' } },
      },
    },
    // ── REVIEWS ───────────────────────────────────────────
    '/reviews/{expertId}': {
      get: {
        tags: ['Reviews'], summary: 'Uzman yorumları',
        security: [],
        parameters: [{ name: 'expertId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Yorum listesi' } },
      },
      post: {
        tags: ['Reviews'], summary: 'Yorum ekle',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'expertId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { required: ['rating','text'], properties: { rating: { type: 'integer', minimum: 1, maximum: 5 }, text: { type: 'string', minLength: 10 }, service: { type: 'string' } } } } } },
        responses: { 201: { description: 'Yorum eklendi' }, 400: { description: 'Geçersiz veri' } },
      },
    },
    // ── ADMIN ─────────────────────────────────────────────
    '/admin/stats': {
      get: { tags: ['Admin'], summary: 'Genel istatistikler', security: [{ BearerAuth: [] }], responses: { 200: { description: 'Dashboard istatistikleri' } } },
    },
    '/admin/users': {
      get: {
        tags: ['Admin'], summary: 'Kullanıcı listesi',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'role',   in: 'query', schema: { type: 'string', enum: ['customer','expert','admin','pending_expert'] } },
          { name: 'page',   in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit',  in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Sayfalı kullanıcı listesi' } },
      },
    },
    '/admin/applications': {
      get: { tags: ['Admin'], summary: 'Uzman başvuruları', security: [{ BearerAuth: [] }], responses: { 200: { description: 'Bekleyen ve son onaylanan başvurular' } } },
    },
    '/admin/applications/{id}/approve': {
      patch: { tags: ['Admin'], summary: 'Başvuruyu onayla', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Başvuru onaylandı' } } },
    },
    '/admin/applications/{id}/reject': {
      patch: { tags: ['Admin'], summary: 'Başvuruyu reddet', security: [{ BearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Başvuru reddedildi' } } },
    },
  },
};

const swaggerOptions = {
  customCss: '.swagger-ui .topbar { background: linear-gradient(135deg, #6C63FF, #764ba2); }',
  customSiteTitle: 'İşBul API Docs',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
  },
};

module.exports = { swaggerUi, swaggerDocument, swaggerOptions };
