/**
 * Sentry Error Tracking (Opsiyonel)
 * Production'da aktif olur
 */

// Sentry DSN varsa aktif et
const SENTRY_DSN = process.env.SENTRY_DSN;

function initSentry(app) {
  if (!SENTRY_DSN || process.env.NODE_ENV !== 'production') {
    console.log('⚠️  Sentry devre dışı (development mode veya DSN yok)');
    return;
  }

  try {
    const Sentry = require('@sentry/node');
    
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: process.env.NODE_ENV || 'production',
      tracesSampleRate: 0.1, // %10 performans izleme
    });

    // Request handler (ilk middleware)
    app.use(Sentry.Handlers.requestHandler());

    console.log('✅ Sentry aktif');
    return Sentry;
  } catch (err) {
    console.warn('⚠️  Sentry yüklenemedi:', err.message);
    return null;
  }
}

function sentryErrorHandler() {
  try {
    const Sentry = require('@sentry/node');
    return Sentry.Handlers.errorHandler();
  } catch {
    return (err, req, res, next) => next(err);
  }
}

module.exports = { initSentry, sentryErrorHandler };
