const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// Protect the chat endpoint by default (requires Authorization: Bearer <token>)
router.post('/', protect, chat);

module.exports = router;
