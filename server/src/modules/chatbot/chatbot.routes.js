/**
 * AI Chatbot Routes
 */
const express = require('express');
const router  = express.Router();
const ctrl    = require('./chatbot.controller');
const { optionalAuth } = require('../../middleware/auth');

// Chat endpoint (giriş yapmadan da kullanılabilir)
router.post('/chat',        optionalAuth, ctrl.chat);
router.get('/suggestions',  optionalAuth, ctrl.getSuggestions);

module.exports = router;
