const express = require('express');
const {
  createTeam,
  joinTeam,
  getMyTeams,
  getTeam,
  leaveTeam,
  updateTeam,
  assignTask,
  updateTaskStatus,
  getUserTasks,
  removeMember,
  deleteTeam
} = require('../controllers/teamController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Project management routes (using team endpoints for compatibility)
router.post('/create', createTeam);          // Create new project
router.post('/join', joinTeam);              // Join project with code  
router.get('/my-teams', getMyTeams);         // Get user's projects
router.get('/:teamId', getTeam);             // Get project details
router.put('/:teamId', updateTeam);          // Update project info
router.delete('/:teamId/leave', leaveTeam);  // Leave project
router.delete('/:teamId', deleteTeam);       // Delete entire project (leaders only)

// Member management routes
router.delete('/:teamId/members/:userId', removeMember); // Remove member (leaders only)

// Task management routes
router.post('/:teamId/assign-task', assignTask);        // Assign task to team member
router.put('/:teamId/tasks/:taskId', updateTaskStatus); // Update task status
router.get('/:teamId/my-tasks', getUserTasks);          // Get user's tasks in project

module.exports = router;