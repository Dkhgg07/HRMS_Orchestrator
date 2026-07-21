const asyncHandler = require('express-async-handler');
const PerformanceReview = require('../models/PerformanceReview');
const Goal = require('../models/Goal');
const User = require('../models/User'); // needed for manager/team queries

// @desc    Get performance reviews for a user or their team
// @route   GET /api/performance
// @access  Private
const getPerformanceReviews = asyncHandler(async (req, res) => {
  let reviews;
  if (req.user.role === 'employee') {
    reviews = await PerformanceReview.find({ employee: req.user.id })
      .populate('employee', 'personalInfo firstName lastName')
      .populate('reviewer', 'personalInfo firstName lastName');
  } else if (req.user.role === 'manager') {
    // Find reviews for the manager's team
    const teamMembers = await User.find({ 'workInfo.manager': req.user.id }).select('_id');
    const teamMemberIds = teamMembers.map(member => member._id);

    reviews = await PerformanceReview.find({ employee: { $in: teamMemberIds } })
      .populate('employee', 'personalInfo firstName lastName')
      .populate('reviewer', 'personalInfo firstName lastName');
  } else {
    reviews = await PerformanceReview.find()
      .populate('employee', 'personalInfo firstName lastName')
      .populate('reviewer', 'personalInfo firstName lastName');
  }
  res.status(200).json(reviews);
});

// @desc    Create a new performance review
// @route   POST /api/performance
// @access  Private/Manager or Admin
const createPerformanceReview = asyncHandler(async (req, res) => {
  const { employeeId, cycle, goals, feedback } = req.body;

  // Basic validation
  if (!employeeId || !cycle) {
    res.status(400);
    throw new Error('Please include an employee and review cycle');
  }

  // Check if the logged-in user is the employee's manager or an admin
  if (req.user.role === 'manager') {
    const employee = await User.findById(employeeId);
    if (employee.workInfo.manager?.toString() !== req.user.id) {
      res.status(403);
      throw new Error('Not authorized to review this employee');
    }
  }

  const review = await PerformanceReview.create({
    employee: employeeId,
    reviewer: req.user.id, // The manager creating the review
    cycle,
    goals,
    feedback,
    // aiSentiment and predictedAttritionRisk would be calculated by a separate process later
  });

  await review.populate('employee', 'personalInfo firstName lastName');
  await review.populate('reviewer', 'personalInfo firstName lastName');

  res.status(201).json(review);
});

// @desc    Get goals for a user
// @route   GET /api/performance/goals
// @access  Private
const getGoals = asyncHandler(async (req, res) => {
  // An employee sees their goals, a manager sees their team's goals
  const targetUserId = req.query.userId || req.user.id;

  if (req.user.role === 'employee' && targetUserId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to view these goals');
  }

  const goals = await Goal.find({ employee: targetUserId });
  res.status(200).json(goals);
});

// @desc    Create or update a goal
// @route   POST /api/performance/goals
// @access  Private
const setGoal = asyncHandler(async (req, res) => {
  const { title, description, targetDate, progress } = req.body;

  let goal;
  if (req.params.id) {
    // Update existing goal
    goal = await Goal.findById(req.params.id);
    if (!goal) {
      res.status(404);
      throw new Error('Goal not found');
    }
    if (goal.employee.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to update this goal');
    }
    goal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });
  } else {
    // Create new goal
    goal = await Goal.create({
      employee: req.user.id, // Employees create goals for themselves
      title,
      description,
      targetDate,
      progress: progress || 0
    });
  }

  res.status(200).json(goal);
});

module.exports = {
  getPerformanceReviews,
  createPerformanceReview,
  getGoals,
  setGoal
};