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
    callbackURL:  process.env.GOOGLE_CALLBACK_URL  || 'http://localhost:3001/api/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const googleId  = profile.id;
      const email     = profile.emails?.[0]?.value?.toLowerCase();
      const firstName = profile.name?.givenName   || profile.displayName.split(' ')[0];
      const lastName  = profile.name?.familyName  || profile.displayName.split(' ')[1] || '';

      // Mevcut kullanıcıyı bul
      let user = dbGet('SELECT * FROM users WHERE google_id = ?', googleId);

      if (!user && email) {
        user = dbGet('SELECT * FROM users WHERE email = ?', email);
        if (user) {
          dbRun('UPDATE users SET google_id = ? WHERE id = ?', googleId, user.id);
        }
      }

      if (!user) {
        const id = genId();
        dbRun(
          `INSERT INTO users (id, first_name, last_name, email, avatar, color, role, google_id)
           VALUES (?, ?, ?, ?, ?, ?, 'customer', ?)`,
          id, firstName, lastName, email,
          getInitials(firstName, lastName), randomColor(), googleId
        );
        user = dbGet('SELECT * FROM users WHERE id = ?', id);
      }

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
      return done(err, null);
    }
  }
));

module.exports = passport;
