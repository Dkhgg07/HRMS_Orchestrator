const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getLeaves, // Gets leaves for the logged-in user OR their team if manager
  createLeave, // Employee creates a leave request
  updateLeave, // Manager updates the status
} = require('../controllers/leaveController');

const router = express.Router();

// All routes are protected (require login)
router.use(protect);

// @desc    Get all leaves for user or team
// @route   GET /api/leaves
// @access  Private
router.get('/', getLeaves);

// @desc    Create a new leave request
// @route   POST /api/leaves
// @access  Private (Employee, Manager can also create for themselves)
router.post('/', createLeave);

// @desc    Update a leave request (e.g., approve/reject)
// @route   PUT /api/leaves/:id
// @access  Private/Manager (or Admin)
router.put('/:id', authorize('manager', 'admin'), updateLeave);

module.exports = router;