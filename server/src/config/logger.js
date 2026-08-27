/**
 * Winston Logger
 * Production-grade structured logging
 * 
 * Log seviyeleri: error > warn > info > http > debug
 * Production: sadece warn ve üzeri
 * Development: tüm seviyeler
 */

const winston = require('winston');

const isProduction = process.env.NODE_ENV === 'production';

// JSON format (production) veya renkli format (development)
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} [${level}] ${message} ${metaStr}`;
  })
);

const logger = winston.createLogger({
  level: isProduction ? 'warn' : 'debug',
  format: isProduction ? productionFormat : developmentFormat,
  transports: [
    new winston.transports.Console(),
  ],
  // Unhandled exception ve rejection'ları da yakala
  exceptionHandlers: [new winston.transports.Console()],
  rejectionHandlers: [new winston.transports.Console()],
});

module.exports = logger;
