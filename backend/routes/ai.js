const express = require('express');
const { protect } = require('../middleware/auth');
const { getAIProfiles, getAIProfileByEmployeeId } = require('../controllers/aiController');

const router = express.Router();

// Protect these routes; adjust if you want them public
router.use(protect);

// List AI-ready profiles with optional filters
router.get('/people', getAIProfiles);
// Single profile by employeeId (EMP003 or emp003)
router.get('/people/:employeeId', getAIProfileByEmployeeId);

module.exports = router;
