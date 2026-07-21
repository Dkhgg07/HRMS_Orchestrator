const Team = require('../models/Team');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Create a new project
// @route   POST /api/teams/create (projects)
// @access  Private
const createTeam = asyncHandler(async (req, res) => {
  const { name, description, maxMembers } = req.body;

  // Validate input
  if (!name || name.trim().length === 0) {
    res.status(400);
    throw new Error('Team name is required');
  }

  // Generate unique project code
  const teamCode = await Team.generateTeamCode();

  // Create team
  const team = await Team.create({
    name: name.trim(),
    description: description?.trim() || '',
    teamCode,
    creator: req.user.id,
    maxMembers: maxMembers || 10,
  });

  // Update user's projects array
  await User.findByIdAndUpdate(req.user.id, {
    $push: {
      teams: {
        team: team._id,
        role: 'leader',
        joinedAt: new Date()
      }
    }
  });

  // Populate team with creator info
  await team.populate('creator', 'personalInfo.firstName personalInfo.lastName email workInfo.department');
  await team.populate('members.user', 'personalInfo.firstName personalInfo.lastName email workInfo.department');

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: {
      team,
      teamCode
    }
  });
});

// @desc    Join a project using project code
// @route   POST /api/teams/join (projects)
// @access  Private
const joinTeam = asyncHandler(async (req, res) => {
  const { teamCode } = req.body;

  // Validate input
  if (!teamCode || teamCode.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Project code is required'
    });
  }

  // Find team by code
  const team = await Team.findOne({ 
    teamCode: teamCode.trim().toUpperCase(),
    isActive: true 
  });

  if (!team) {
    return res.status(404).json({
      success: false,
      error: 'Invalid project code or project no longer exists'
    });
  }

  // Debug logging
  console.log('Join project attempt:');
  console.log('- Project code:', teamCode.trim().toUpperCase());
  console.log('- Project ID:', team._id);
  console.log('- Project name:', team.name);
  console.log('- Current user ID:', req.user.id);
  console.log('- Project members:', team.members.map(m => ({ userId: m.user.toString(), role: m.role })));

  // Check if user is already a member
  const existingMember = team.members.find(
    member => member.user.toString() === req.user.id
  );

  console.log('- Existing member found:', existingMember ? 'YES' : 'NO');

  if (existingMember) {
    console.log('- User is already a member with role:', existingMember.role);
    return res.status(400).json({
      success: false,
      error: 'You are already a member of this team'
    });
  }

  // Check if team is full
  if (team.members.length >= team.maxMembers) {
    return res.status(400).json({
      success: false,
      error: 'Team is already at maximum capacity'
    });
  }

  try {
    // Add user to team
    team.addMember(req.user.id, 'member');
    await team.save();

    // Update user's projects array
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        teams: {
          team: team._id,
          role: 'member',
          joinedAt: new Date()
        }
      }
    });

    // Populate team data
    await team.populate('creator', 'personalInfo.firstName personalInfo.lastName email workInfo.department');
    await team.populate('members.user', 'personalInfo.firstName personalInfo.lastName email workInfo.department');

    res.status(200).json({
      success: true,
      message: 'Successfully joined the team',
      data: {
        team
      }
    });

  } catch (error) {
    console.error('Error joining team:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to join team'
    });
  }
});

// @desc    Get user's projects
// @route   GET /api/teams/my-teams (my-projects)
// @access  Private
const getMyTeams = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate({
      path: 'teams.team',
      populate: {
        path: 'members.user creator',
        select: 'personalInfo.firstName personalInfo.lastName email workInfo.department'
      }
    });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Filter out inactive projects
  const activeTeams = user.teams.filter(teamRef => 
    teamRef.team && teamRef.team.isActive
  );

  res.status(200).json({
    success: true,
    data: {
      teams: activeTeams
    }
  });
});

// @desc    Get project details
// @route   GET /api/teams/:teamId (project details)
// @access  Private
const getTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.teamId)
    .populate('creator', 'personalInfo.firstName personalInfo.lastName email workInfo.department')
    .populate('members.user', 'personalInfo.firstName personalInfo.lastName email workInfo.department workInfo.skills workInfo.experienceLevel')
    .populate('tasks.assignedTo', 'personalInfo.firstName personalInfo.lastName email workInfo.department')
    .populate('tasks.assignedBy', 'personalInfo.firstName personalInfo.lastName email');

  if (!team) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Check if user is a member of this project
  const isMember = team.members.some(
    member => member.user._id.toString() === req.user.id
  );

  if (!isMember) {
    res.status(403);
    throw new Error('Access denied. You are not a member of this team');
  }

  res.status(200).json({
    success: true,
    data: {
      team
    }
  });
});

// @desc    Leave a project
// @route   DELETE /api/teams/:teamId/leave (leave project)
// @access  Private
const leaveTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.teamId);

  if (!team) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Check if user is a member
  const memberIndex = team.members.findIndex(
    member => member.user.toString() === req.user.id
  );

  if (memberIndex === -1) {
    res.status(400);
    throw new Error('You are not a member of this team');
  }

  // Check if user is the creator/leader
  if (team.creator.toString() === req.user.id) {
    // If creator is leaving, transfer leadership or delete team
    if (team.members.length === 1) {
      // Last member, delete the team
      await Team.findByIdAndDelete(team._id);
    } else {
      // Transfer leadership to the next member
      const nextLeader = team.members.find(
        member => member.user.toString() !== req.user.id
      );
      team.creator = nextLeader.user;
      nextLeader.role = 'leader';
      team.removeMember(req.user.id);
      await team.save();
    }
  } else {
    // Regular member leaving
    team.removeMember(req.user.id);
    await team.save();
  }

  // Remove team from user's teams array
  await User.findByIdAndUpdate(req.user.id, {
    $pull: {
      teams: { team: team._id }
    }
  });

  res.status(200).json({
    success: true,
    message: 'Successfully left the team'
  });
});

// @desc    Update project info (only for project leaders)
// @route   PUT /api/teams/:teamId (update project)
// @access  Private
const updateTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.teamId);

  if (!team) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Check if user is the project leader
  const userMember = team.members.find(
    member => member.user.toString() === req.user.id
  );

  if (!userMember || userMember.role !== 'leader') {
    res.status(403);
    throw new Error('Access denied. Only project leaders can update project information');
  }

  const { name, description, maxMembers, project } = req.body;

  // Update fields
  if (name) team.name = name.trim();
  if (description !== undefined) team.description = description.trim();
  if (maxMembers) {
    // Ensure maxMembers is not less than current member count
    if (maxMembers < team.members.length) {
      res.status(400);
      throw new Error(`Cannot set max members below current member count (${team.members.length})`);
    }
    team.maxMembers = maxMembers;
  }
  if (project) {
    team.project = {
      ...team.project,
      ...project
    };
  }

  await team.save();

  // Populate team data
  await team.populate('creator', 'personalInfo.firstName personalInfo.lastName email workInfo.department');
  await team.populate('members.user', 'personalInfo.firstName personalInfo.lastName email workInfo.department');

  res.status(200).json({
    success: true,
    message: 'Team updated successfully',
    data: {
      team
    }
  });
});

// @desc    Assign task to team member
// @route   POST /api/teams/:teamId/assign-task
// @access  Private (Leaders only)
const assignTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, priority, dueDate } = req.body;
  const teamId = req.params.teamId;

  // Validate input
  if (!title || !assignedTo) {
    return res.status(400).json({
      success: false,
      error: 'Task title and assignee are required'
    });
  }

  // Find team
  const team = await Team.findById(teamId);
  if (!team) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }

  // Check if user is leader of this team
  const userMembership = team.members.find(
    member => member.user.toString() === req.user.id
  );

  if (!userMembership || userMembership.role !== 'leader') {
    return res.status(403).json({
      success: false,
      error: 'Only project leaders can assign tasks'
    });
  }

  // Check if assignee is a member of the team
  const assigneeMembership = team.members.find(
    member => member.user.toString() === assignedTo
  );

  if (!assigneeMembership) {
    return res.status(400).json({
      success: false,
      error: 'Cannot assign task to user who is not a team member'
    });
  }

  // Create new task
  const newTask = {
    title: title.trim(),
    description: description?.trim() || '',
    assignedTo,
    assignedBy: req.user.id,
    priority: priority || 'medium',
    dueDate: dueDate ? new Date(dueDate) : null
  };

  team.tasks.push(newTask);
  await team.save();

  // Populate the task data
  await team.populate('tasks.assignedTo', 'personalInfo.firstName personalInfo.lastName email');
  await team.populate('tasks.assignedBy', 'personalInfo.firstName personalInfo.lastName email');

  res.status(201).json({
    success: true,
    message: 'Task assigned successfully',
    data: {
      task: team.tasks[team.tasks.length - 1] // Return the newly created task
    }
  });
});

// @desc    Update task status
// @route   PUT /api/teams/:teamId/tasks/:taskId
// @access  Private (Assignee or Leader)
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { teamId, taskId } = req.params;

  // Find team
  const team = await Team.findById(teamId);
  if (!team) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }

  // Check if user is member of this team
  const userMembership = team.members.find(
    member => member.user.toString() === req.user.id
  );

  if (!userMembership) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. You are not a member of this project'
    });
  }

  // Find task
  const task = team.tasks.id(taskId);
  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  // Check if user can update this task (assignee or leader)
  const canUpdate = task.assignedTo.toString() === req.user.id || userMembership.role === 'leader';
  if (!canUpdate) {
    return res.status(403).json({
      success: false,
      error: 'You can only update tasks assigned to you or if you are a project leader'
    });
  }

  // Update task status
  task.status = status;
  if (status === 'completed') {
    task.completedAt = new Date();
  }

  await team.save();

  res.status(200).json({
    success: true,
    message: 'Task status updated successfully',
    data: {
      task
    }
  });
});

// @desc    Get user's tasks in a project
// @route   GET /api/teams/:teamId/my-tasks
// @access  Private
const getUserTasks = asyncHandler(async (req, res) => {
  const teamId = req.params.teamId;

  // Find team and populate tasks
  const team = await Team.findById(teamId)
    .populate('tasks.assignedTo', 'personalInfo.firstName personalInfo.lastName email')
    .populate('tasks.assignedBy', 'personalInfo.firstName personalInfo.lastName email');

  if (!team) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }

  // Check if user is member of this team
  const userMembership = team.members.find(
    member => member.user.toString() === req.user.id
  );

  if (!userMembership) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. You are not a member of this project'
    });
  }

  // Filter tasks assigned to the user
  const userTasks = team.tasks.filter(
    task => task.assignedTo._id.toString() === req.user.id
  );

  res.status(200).json({
    success: true,
    data: {
      tasks: userTasks
    }
  });
});

// @desc    Remove member from team (Leaders only)
// @route   DELETE /api/teams/:teamId/members/:userId
// @access  Private (Leaders only)
const removeMember = asyncHandler(async (req, res) => {
  const { teamId, userId } = req.params;

  // Find team
  const team = await Team.findById(teamId);
  if (!team) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }

  // Check if user is leader of this team
  const userMembership = team.members.find(
    member => member.user.toString() === req.user.id
  );

  if (!userMembership || userMembership.role !== 'leader') {
    return res.status(403).json({
      success: false,
      error: 'Only project leaders can remove members'
    });
  }

  // Check if target user is a member
  const targetMember = team.members.find(
    member => member.user.toString() === userId
  );

  if (!targetMember) {
    return res.status(404).json({
      success: false,
      error: 'User is not a member of this project'
    });
  }

  // Prevent leader from removing themselves
  if (userId === req.user.id) {
    return res.status(400).json({
      success: false,
      error: 'Leaders cannot remove themselves. Transfer leadership or delete the project instead.'
    });
  }

  // Remove member from team
  team.removeMember(userId);
  await team.save();

  // Remove team from user's teams array
  await User.findByIdAndUpdate(userId, {
    $pull: {
      teams: { team: team._id }
    }
  });

  res.status(200).json({
    success: true,
    message: 'Member removed from project successfully'
  });
});

// @desc    Delete entire project (Leaders only)
// @route   DELETE /api/teams/:teamId
// @access  Private (Leaders only)
const deleteTeam = asyncHandler(async (req, res) => {
  const teamId = req.params.teamId;

  // Find team
  const team = await Team.findById(teamId);
  if (!team) {
    return res.status(404).json({
      success: false,
      error: 'Project not found'
    });
  }

  // Check if user is leader of this team
  const userMembership = team.members.find(
    member => member.user.toString() === req.user.id
  );

  if (!userMembership || userMembership.role !== 'leader') {
    return res.status(403).json({
      success: false,
      error: 'Only project leaders can delete the project'
    });
  }

  // Remove team from all members' teams arrays
  const memberIds = team.members.map(member => member.user);
  await User.updateMany(
    { _id: { $in: memberIds } },
    { $pull: { teams: { team: team._id } } }
  );

  // Delete the team
  await Team.findByIdAndDelete(teamId);

  res.status(200).json({
    success: true,
    message: 'Project deleted successfully'
  });
});

module.exports = {
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
};