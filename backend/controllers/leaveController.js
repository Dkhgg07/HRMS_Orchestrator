const asyncHandler = require('express-async-handler');
const Leave = require('../models/Leave');
const User = require('../models/User');

// @desc    Get all leaves for user or team
// @route   GET /api/leaves
// @access  Private
const getLeaves = asyncHandler(async (req, res) => {
  let leaves;
  if (req.user.role === 'employee') {
    leaves = await Leave.find({ employee: req.user.id }).populate('employee', 'personalInfo firstName lastName email');
  } else if (req.user.role === 'manager') {
    // 1. Find the IDs of all users who report to this manager
    const teamMembers = await User.find({ 'workInfo.manager': req.user.id }).select('_id');
    const teamMemberIds = teamMembers.map(member => member._id);

    // 2. Find leaves for the manager themselves AND their team
    leaves = await Leave.find({
      $or: [
        { employee: req.user.id }, // their own leaves
        { employee: { $in: teamMemberIds } }, // leaves of their team
      ],
    }).populate('employee', 'personalInfo firstName lastName email')
      .populate('reviewedBy', 'personalInfo firstName lastName');
  } else if (req.user.role === 'admin') {
    leaves = await Leave.find()
      .populate('employee', 'personalInfo firstName lastName email')
      .populate('reviewedBy', 'personalInfo firstName lastName');
  }
  res.status(200).json(leaves);
});

// @desc    Create a new leave request
// @route   POST /api/leaves
// @access  Private
const createLeave = asyncHandler(async (req, res) => {
  const { type, startDate, endDate, reason } = req.body;

  if (!type || !startDate || !endDate) {
    res.status(400);
    throw new Error('Please include type, start date, and end date');
  }

  // Ensure an employee can only create a leave for themselves
  const employeeId = req.body.employee || req.user.id;
  if (req.user.role === 'employee' && employeeId !== req.user.id) {
    res.status(403);
    throw new Error('Employee can only create leaves for themselves');
  }

  const leave = await Leave.create({
    employee: employeeId,
    type,
    startDate,
    endDate,
    reason,
    status: 'pending'
  });

  // Populate the employee field when returning the new leave
  await leave.populate('employee', 'personalInfo firstName lastName email');
  res.status(201).json(leave);
});

// @desc    Update a leave request (Approve/Reject)
// @route   PUT /api/leaves/:id
// @access  Private/Manager or Admin
const updateLeave = asyncHandler(async (req, res) => {
  const { status, reviewNote } = req.body;
  let leave = await Leave.findById(req.params.id);

  if (!leave) {
    res.status(404);
    throw new Error('Leave request not found');
  }

  // Check if the user is authorized to update this leave (is it their team member's leave?)
  if (req.user.role === 'manager') {
    // Get the employee who requested the leave
    const employee = await User.findById(leave.employee);
    // Check if the employee's manager is the current user
    if (employee.workInfo.manager?.toString() !== req.user.id) {
      res.status(403);
      throw new Error('Not authorized to update this leave request');
    }
  }

  leave.status = status;
  leave.reviewNote = reviewNote;
  leave.reviewedBy = req.user.id;

  const updatedLeave = await leave.save();

  await updatedLeave.populate('employee', 'personalInfo firstName lastName email');
  await updatedLeave.populate('reviewedBy', 'personalInfo firstName lastName');

  res.status(200).json(updatedLeave);
});

module.exports = {
  getLeaves,
  createLeave,
  updateLeave,
};