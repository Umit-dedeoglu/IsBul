/**
 * İyzico Ödeme Sistemi Konfigürasyonu
 * Sandbox (test) modu — gerçek ödeme alınmaz
 * 
 * Production'a geçerken:
 * - IYZICO_API_KEY ve IYZICO_SECRET_KEY env'lerini gerçek değerlerle set et
 * - IYZICO_BASE_URL'i https://api.iyzipay.com olarak değiştir
 */

const Iyzipay = require('iyzipay');

const iyzipay = new Iyzipay({
  apiKey:    process.env.IYZICO_API_KEY    || 'sandbox-aEIjKfGmTbKMpJaUJFmPJbCLEIFmqJIL',
  secretKey: process.env.IYZICO_SECRET_KEY || 'sandbox-wDiMoCNnVxGUJMobcqAGDnfSHVWwGkCb',
  uri:       process.env.IYZICO_BASE_URL   || 'https://sandbox-api.iyzipay.com',
});

const isSandbox = !process.env.IYZICO_API_KEY ||
  process.env.IYZICO_API_KEY.startsWith('sandbox-');

if (isSandbox) {
  console.log('💳 İyzico: Sandbox modu aktif (test ödemeleri)');
}

module.exports = { iyzipay, isSandbox };
