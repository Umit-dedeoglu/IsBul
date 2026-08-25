const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { dbGet, dbRun } = require('../db');

function getInitials(first, last) {
  return ((first[0] || '') + (last[0] || '')).toUpperCase();
}
const COLORS = ['#6C63FF','#FF6B6B','#4ECDC4','#FFD93D','#96CEB4','#56AB2F'];
function randomColor() { return COLORS[Math.floor(Math.random() * COLORS.length)]; }
function genId()       { return `u_${Date.now()}_${Math.random().toString(36).slice(2,7)}`; }

passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID     || 'placeholder',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
    callbackURL:  process.env.GOOGLE_CALLBACK_URL  || 'https://isbul-backend.onrender.com/api/v1/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('🔵 Google OAuth Strategy triggered');
      console.log('Profile ID:', profile.id);
      console.log('Profile email:', profile.emails?.[0]?.value);
      
      const googleId  = profile.id;
      const email     = profile.emails?.[0]?.value?.toLowerCase();
      
      // Güvenli ad/soyad çıkarımı
      const displayParts = (profile.displayName || '').trim().split(/\s+/);
      const firstName = profile.name?.givenName || displayParts[0] || email?.split('@')[0] || 'User';
      const lastName  = profile.name?.familyName || displayParts.slice(1).join(' ') || 'User';

      console.log('firstName:', firstName, 'lastName:', lastName);
      console.log('Checking existing user with google_id:', googleId);
      
      // Mevcut kullanıcıyı bul
      let user = await dbGet('SELECT * FROM users WHERE google_id = ?', googleId);
      console.log('User found by google_id:', !!user);

      if (!user && email) {
        console.log('Checking user by email:', email);
        user = await dbGet('SELECT * FROM users WHERE email = ?', email);
        console.log('User found by email:', !!user);
        if (user) {
          console.log('Linking google_id to existing user');
          await dbRun('UPDATE users SET google_id = ? WHERE id = ?', googleId, user.id);
        }
      }

      if (!user) {
        console.log('Creating new user with firstName:', firstName, 'lastName:', lastName);
        const id = genId();
        const avatar = getInitials(firstName, lastName);
        const color = randomColor();
        await dbRun(
          `INSERT INTO users (id, first_name, last_name, email, avatar, color, role, google_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          id, firstName, lastName, email, avatar, color, 'customer', googleId
        );
        console.log('New user created with id:', id);
        user = await dbGet('SELECT * FROM users WHERE id = ?', id);
      }

      console.log('✅ OAuth successful for user:', user.id);
      return done(null, {
        id:        user.id,
        email:     user.email,
        role:      user.role,
        firstName: user.first_name,
        lastName:  user.last_name,
        avatar:    user.avatar,
        color:     user.color,
      });
    } catch (err) {
      console.error('❌ Google OAuth error:', err);
      console.error('Error stack:', err.stack);
      return done(err, null);
    }
  }
));

module.exports = passport;
