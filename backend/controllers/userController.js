const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
const getUser = asyncHandler(async (req, res) => {
  // A user can only get their own profile, unless they are a manager/admin getting a team member's
  const user = await User.findById(req.params.id).select('-password'); // Don't send password

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if requester is the user, their manager, or an admin
  if (req.user.id !== user._id.toString() && req.user.role === 'employee') {
    res.status(403);
    throw new Error('Not authorized to view this profile');
  }

  res.status(200).json(user);
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Only the user themselves or an admin can update the profile
  if (req.user.id !== user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this profile');
  }

  // Prevent role escalation: an employee cannot make themselves an admin
  if (req.body.role && req.user.role !== 'admin') {
    delete req.body.role;
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // return the updated document
    runValidators: true // run model validators on update
  }).select('-password');

  res.status(200).json(updatedUser);
});

// @desc    Get logged-in user's team (For Managers)
// @route   GET /api/users/team/my-team
// @access  Private/Manager
const getMyTeam = asyncHandler(async (req, res) => {
  // Find all users where the manager field is the logged-in user's ID
  const team = await User.find({ 'workInfo.manager': req.user.id }).select('-password');
  res.status(200).json(team);
});

// @desc    Get all users (For Admin Dashboard)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.status(200).json(users);
});

module.exports = {
  getUser,
  updateUser,
  getMyTeam,
  getUsers
};