const mongoose = require("mongoose");
const crypto = require("crypto");

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    teamCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      minlength: 6,
      maxlength: 8,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["leader", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    maxMembers: {
      type: Number,
      default: 10,
      min: 2,
      max: 50,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    project: {
      name: String,
      description: String,
      deadline: Date,
      status: {
        type: String,
        enum: ["planning", "in-progress", "completed", "on-hold"],
        default: "planning",
      },
    },
    tasks: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        assignedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        status: {
          type: String,
          enum: ["assigned", "in-progress", "completed"],
          default: "assigned",
        },
        priority: {
          type: String,
          enum: ["low", "medium", "high"],
          default: "medium",
        },
        dueDate: Date,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        completedAt: Date,
      },
    ],
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for member count
TeamSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Static method to generate unique project code
TeamSchema.statics.generateTeamCode = async function() {
  let teamCode;
  let isUnique = false;
  
  while (!isUnique) {
    // Generate an 8-character alphanumeric code
    teamCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    // Check if this code already exists
    const existingTeam = await this.findOne({ teamCode });
    if (!existingTeam) {
      isUnique = true;
    }
  }
  
  return teamCode;
};

// Instance method to add member
TeamSchema.methods.addMember = function(userId, role = 'member') {
  // Check if user is already a member
  const existingMember = this.members.find(
    member => member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    throw new Error('User is already a member of this project');
  }
  
  // Check if project is full
  if (this.members.length >= this.maxMembers) {
    throw new Error('Project is already at maximum capacity');
  }
  
  this.members.push({
    user: userId,
    role: role,
    joinedAt: new Date()
  });
  
  return this;
};

// Instance method to remove member
TeamSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(
    member => member.user.toString() !== userId.toString()
  );
  return this;
};

// Instance method to update member role
TeamSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(
    member => member.user.toString() === userId.toString()
  );
  
  if (!member) {
    throw new Error('User is not a member of this project');
  }
  
  member.role = newRole;
  return this;
};

// Pre-save middleware to ensure creator is added as leader
TeamSchema.pre('save', function(next) {
  if (this.isNew) {
    // Add creator as project leader if not already in members
    const creatorAsMember = this.members.find(
      member => member.user.toString() === this.creator.toString()
    );
    
    if (!creatorAsMember) {
      this.members.push({
        user: this.creator,
        role: 'leader',
        joinedAt: new Date()
      });
    }
  }
  next();
});

// Index for efficient project code lookups
TeamSchema.index({ teamCode: 1 });
TeamSchema.index({ creator: 1 });
TeamSchema.index({ 'members.user': 1 });

module.exports = mongoose.model("Team", TeamSchema);