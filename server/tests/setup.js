// Jest setup — tüm testlerden ÖNCE çalışır, modül yüklenmeden önce
process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:';
process.env.ADMIN_SETUP_KEY = 'test_setup_key_123';
// Test sırasında production DB'ye yazma
delete process.env.DATABASE_URL;
