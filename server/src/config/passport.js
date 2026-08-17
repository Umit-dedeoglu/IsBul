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
    callbackURL:  process.env.GOOGLE_CALLBACK_URL  || 'http://localhost:3001/api/v1/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const googleId  = profile.id;
      const email     = profile.emails?.[0]?.value?.toLowerCase();
      const firstName = profile.name?.givenName   || profile.displayName.split(' ')[0];
      const lastName  = profile.name?.familyName  || profile.displayName.split(' ')[1] || '';

      // Mevcut kullanıcıyı bul
      let user = await dbGet('SELECT * FROM users WHERE google_id = $1', [googleId]);

      if (!user && email) {
        user = await dbGet('SELECT * FROM users WHERE email = $1', [email]);
        if (user) {
          await dbRun('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, user.id]);
        }
      }

      if (!user) {
        const id = genId();
        const avatar = getInitials(firstName, lastName);
        const color = randomColor();
        await dbRun(
          `INSERT INTO users (id, first_name, last_name, email, avatar, color, role, google_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [id, firstName, lastName, email, avatar, color, 'customer', googleId]
        );
        user = await dbGet('SELECT * FROM users WHERE id = $1', [id]);
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
      console.error('Google OAuth error:', err);
      return done(err, null);
    }
  }
));

module.exports = passport;
