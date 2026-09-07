-- Migration: Add counter_offer_price to bookings
-- Date: 2026-09-07
-- Purpose: Support Counter-Offer Booking Engine with Smart Guard

ALTER TABLE bookings ADD COLUMN counter_offer_price INTEGER;
