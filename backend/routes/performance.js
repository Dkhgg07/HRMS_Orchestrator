// Performance API routes

const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getPerformanceReviews,
  createPerformanceReview,
  getGoals
} = require('../controllers/performanceController');

const router = express.Router();

router.use(protect);

// Get performance reviews
router.get('/', getPerformanceReviews);
// Create performance review
router.post('/', createPerformanceReview);
// Get goals for a user
router.get('/goals', getGoals);

module.exports = router;
