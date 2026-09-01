/**
 * İşBul – API Client
 * Backend API ile haberleşen merkezi modül.
 * localStorage ile paralel çalışır — API başarısız olursa localStorage fallback devreye girer.
 */

// Ortama göre otomatik base URL tespiti
// config.js'den al
const BACKEND_URL = window.ISBUL_CONFIG 
  ? window.ISBUL_CONFIG.backendUrl
  : (() => {
      const h = window.location.hostname;
      if (h === 'localhost' || h === '127.0.0.1') {
        return 'http://localhost:3001';
      }
      if (h === 'isbul.online' || h === 'www.isbul.online') {
        return 'https://isbul-backend.onrender.com';
      }
      return `https://api.${h}`;
    })();

const API_BASE = `${BACKEND_URL}/api/v1`;

/* ─────────────────────────────────────────────────────────
   TOKEN YÖNETİMİ
───────────────────────────────────────────────────────── */
const TokenManager = {
  get()       { return localStorage.getItem('isbul_jwt'); },
  set(token)  { localStorage.setItem('isbul_jwt', token); },
  clear()     { localStorage.removeItem('isbul_jwt'); },
  headers()   {
    const t = this.get();
    return t
      ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t}` }
      : { 'Content-Type': 'application/json' };
  }
};

/* ─────────────────────────────────────────────────────────
   TEMEL FETCH WRAPPER
───────────────────────────────────────────────────────── */
async function apiFetch(path, options = {}) {
  try {
    const hasBody = !!options.body;
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...TokenManager.headers(),
      },
      ...options,
      body: hasBody ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.warn(`[API] ${path} erişilemedi:`, err.message);
    return { ok: false, status: 0, data: null, offline: true };
  }
}

/* ─────────────────────────────────────────────────────────
   API DURUMU KONTROLÜ
───────────────────────────────────────────────────────── */
let _apiAvailable = null; // null = henüz kontrol edilmedi

async function checkApiAvailability() {
  if (_apiAvailable !== null) return _apiAvailable;
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(8000) });
    _apiAvailable = res.ok;
  } catch {
    _apiAvailable = false;
  }
  console.log(_apiAvailable ? '✅ API bağlantısı aktif' : '⚠️ API erişilemiyor, localStorage modu');
  return _apiAvailable;
}

// Sayfa yüklenince kontrol et + bildirim sayısı yükle
if (typeof window !== 'undefined') {
  checkApiAvailability().then(available => {
    if (!available) return;
    const token = TokenManager.get();
    if (!token) return;
    // Bildirim sayısını navbar'a ekle
    NotificationsAPI.getAll().then(data => {
      if (!data || !data.unreadCount) return;
      const userBtn = document.querySelector('.user-menu-btn');
      if (!userBtn || document.querySelector('.notif-badge')) return;
      const b = document.createElement('span');
      b.className = 'notif-badge';
      b.style.cssText = 'position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;font-size:10px;font-weight:700;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;';
      b.textContent = data.unreadCount > 9 ? '9+' : data.unreadCount;
      userBtn.style.position = 'relative';
      userBtn.appendChild(b);
    }).catch(() => {});
  });
}

/* ─────────────────────────────────────────────────────────
   AUTH API
───────────────────────────────────────────────────────── */
const AuthAPI = {
  /**
   * Kayıt ol
   * @returns { success, token, user, error }
   */
  async register(firstName, lastName, email, password, role = 'customer') {
    const { ok, data, offline } = await apiFetch('/auth/register', {
      method: 'POST',
      body: { firstName, lastName, email, password, role }
    });
    if (offline) {
      return { success: false, error: 'Sunucuya bağlanılamıyor. Lütfen tekrar deneyin.' };
    }
    if (ok && data.token) {
      TokenManager.set(data.token);
      return { success: true, user: data.user, token: data.token };
    }
    return { success: false, error: data?.error || 'Kayıt başarısız.' };
  },

  /**
   * Giriş yap
   * @returns { success, token, user, error }
   */
  async login(email, password) {
    const { ok, data, offline } = await apiFetch('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    if (offline) {
      // API'ye ulaşılamadı, hata göster
      return { success: false, error: 'Sunucuya bağlanılamıyor. Lütfen tekrar deneyin.' };
    }
    if (ok && data.token) {
      TokenManager.set(data.token);
      return { success: true, user: data.user, token: data.token };
    }
    return { success: false, error: data?.error || 'Giriş başarısız.' };
  },

  /** Token ile mevcut kullanıcıyı doğrula */
  async me() {
    if (!TokenManager.get()) return null;
    const { ok, data, offline } = await apiFetch('/auth/me');
    if (offline || !ok) return null;
    return data.user || null;
  },

  /** Çıkış yap */
  logout() {
    TokenManager.clear();
  },

  /** Google OAuth URL */
  googleLoginUrl() {
    return `${API_BASE}/auth/google`;
  }
};

/* ─────────────────────────────────────────────────────────
   USERS API
───────────────────────────────────────────────────────── */
const UsersAPI = {
  async getProfile() {
    const { ok, data, offline } = await apiFetch('/users/profile');
    if (offline || !ok) return null;
    return data.user;
  },

  async updateProfile(updates) {
    const { ok, data, offline } = await apiFetch('/users/profile', {
      method: 'PATCH', body: updates
    });
    if (offline || !ok) return null;
    return data.user;
  },

  async changePassword(currentPassword, newPassword) {
    const { ok, data, offline } = await apiFetch('/users/change-password', {
      method: 'POST', body: { currentPassword, newPassword }
    });
    if (offline) return null;
    return { success: ok, error: data?.error };
  },

  async deleteAccount(password) {
    const { ok, data, offline } = await apiFetch('/users/account', {
      method: 'DELETE', body: { password }
    });
    if (offline) return null;
    return { success: ok, error: data?.error };
  }
};

/* ─────────────────────────────────────────────────────────
   EXPERTS API
───────────────────────────────────────────────────────── */
const ExpertsAPI = {
  async list({ city, category, search, sort } = {}) {
    const params = new URLSearchParams();
    if (city)     params.set('city', city);
    if (category) params.set('category', category);
    if (search)   params.set('search', search);
    if (sort)     params.set('sort', sort);
    const { ok, data, offline } = await apiFetch(`/experts?${params}`);
    if (offline || !ok) return null;
    return data.experts;
  },

  async get(id) {
    const { ok, data, offline } = await apiFetch(`/experts/${id}`);
    if (offline || !ok) return null;
    return data.expert;
  },

  async updateProfile(updates) {
    const { ok, data, offline } = await apiFetch('/experts/profile', {
      method: 'PATCH', body: updates
    });
    if (offline || !ok) return null;
    return data.expert;
  }
};

/* ─────────────────────────────────────────────────────────
   BOOKINGS API
───────────────────────────────────────────────────────── */
const BookingsAPI = {
  async create(bookingData) {
    const { ok, data, offline } = await apiFetch('/bookings', {
      method: 'POST', body: bookingData
    });
    if (offline) return null;
    if (ok) return { success: true, booking: data.booking };
    return { success: false, error: data?.error };
  },

  async getMyBookings() {
    const { ok, data, offline } = await apiFetch('/bookings/my');
    if (offline || !ok) return null;
    return data.bookings;
  },

  async getExpertBookings() {
    const { ok, data, offline } = await apiFetch('/bookings/expert');
    if (offline || !ok) return null;
    return data.bookings;
  },

  async updateStatus(bookingId, status) {
    const { ok, data, offline } = await apiFetch(`/bookings/${bookingId}/status`, {
      method: 'PATCH', body: { status }
    });
    if (offline) return null;
    if (ok) return { success: true, booking: data.booking };
    return { success: false, error: data?.error };
  }
};

/* ─────────────────────────────────────────────────────────
   CALENDAR API
───────────────────────────────────────────────────────── */
const CalendarAPI = {
  async getSlots(expertId, date) {
    const params = date ? `?date=${date}` : '';
    const { ok, data, offline } = await apiFetch(`/calendar/${expertId}/slots${params}`);
    if (offline || !ok) return null;
    return data.slots; // { 'YYYY-MM-DD_HH:MM': true }
  },

  async checkSlots(expertId, slots) {
    const { ok, data, offline } = await apiFetch(`/calendar/${expertId}/check`, {
      method: 'POST', body: { slots }
    });
    if (offline || !ok) return null;
    return data; // { available: bool, conflictSlot? }
  }
};

/* ─────────────────────────────────────────────────────────
   NOTIFICATIONS API
───────────────────────────────────────────────────────── */
const NotificationsAPI = {
  async getAll() {
    const { ok, data, offline } = await apiFetch('/notifications');
    if (offline || !ok) return null;
    return data.data || data;
  },

  async getStats() {
    const { ok, data, offline } = await apiFetch('/notifications/stats');
    if (offline || !ok) return null;
    return data.data || data;
  }
};

/* ─────────────────────────────────────────────────────────
   REVIEWS API
───────────────────────────────────────────────────────── */
const ReviewsAPI = {
  async getReviews(expertId) {
    const { ok, data, offline } = await apiFetch(`/reviews/${expertId}`);
    if (offline || !ok) return null;
    return data.reviews;
  },

  async addReview(expertId, { rating, text, service }) {
    const { ok, data, offline } = await apiFetch(`/reviews/${expertId}`, {
      method: 'POST',
      body: { rating, text, service }
    });
    if (offline) return null;
    if (ok) return { success: true, review: data.review };
    return { success: false, error: data?.error };
  }
};

/* ─────────────────────────────────────────────────────────
   GLOBAL EXPORT
───────────────────────────────────────────────────────── */
window.IsbulAPI = {
  auth:          AuthAPI,
  users:         UsersAPI,
  experts:       ExpertsAPI,
  bookings:      BookingsAPI,
  calendar:      CalendarAPI,
  reviews:       ReviewsAPI,
  notifications: NotificationsAPI,
  token:         TokenManager,
  isAvailable:   checkApiAvailability,
  // Versiyon bilgisi — mobil için
  version:       'v1',
  baseUrl:       API_BASE,
};

console.log('%cİşBul API Client yüklendi', 'color:#6C63FF;font-weight:700');
