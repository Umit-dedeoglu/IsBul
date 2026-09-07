const fs = require('fs');
const path = require('path');

const dbFilePath = path.join(__dirname, 'src', 'db', 'database.js');
let content = fs.readFileSync(dbFilePath, 'utf8');

// Find the bookings table and add counter_offer_price column after total_price
const oldBookings =       total_price      INTEGER,
      slots            TEXT DEFAULT '[]',;

const newBookings =       total_price           INTEGER,
      counter_offer_price   INTEGER,
      slots                 TEXT DEFAULT '[]',;

content = content.replace(oldBookings, newBookings);

fs.writeFileSync(dbFilePath, content, 'utf8');
console.log('✅ Added counter_offer_price column to database schema');
