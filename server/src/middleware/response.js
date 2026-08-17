/**
 * Standart API Response Middleware
 * Tüm endpointlerde tutarlı format sağlar.
 * Web ve mobil istemciler aynı formatı kullanır.
 *
 * Başarı: { success: true,  data: {...}, meta: {...} }
 * Hata:   { success: false, error: { code, message } }
 */

function responseMiddleware(req, res, next) {
  /** Başarılı yanıt */
  res.ok = (data = {}, meta = {}, status = 200) => {
    return res.status(status).json({
      success:   true,
      data,
      ...(Object.keys(meta).length ? { meta } : {}),
      timestamp: new Date().toISOString(),
    });
  };

  /** Oluşturma yanıtı (201) */
  res.created = (data = {}) => {
    return res.ok(data, {}, 201);
  };

  /** Hata yanıtı */
  res.fail = (message, status = 400, code = null) => {
    return res.status(status).json({
      success: false,
      error: {
        code:    code || `HTTP_${status}`,
        message: message || 'Bir hata oluştu.',
      },
      timestamp: new Date().toISOString(),
    });
  };

  next();
}

module.exports = responseMiddleware;
