const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["employee", "manager"], // Role-based access control
      default: "employee",
    },
    personalInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      dateOfBirth: { type: Date },
      phoneNumber: { type: String },
      address: String,
      location: { type: String, required: true }, // For AI agent
    },
    workInfo: {
      employeeID: { 
        type: String, 
        required: true, 
        unique: true 
      }, // For AI agent
      title: String,
      department: { type: String, required: true }, // For AI agent
      dateOfJoining: { type: Date },
      manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      salary: Number,
      skills: { 
        type: [String], 
        required: true 
      }, // For AI agent
      experienceLevel: {
        type: String,
        enum: ["junior", "mid", "senior", "lead"],
        required: true
      }, // For AI agent
      currentProject: { type: String }, // Legacy single project (kept for backward compatibility)
      currentProjects: { type: [String], default: [] }, // New: multiple current projects
      capacityHours: { 
        type: Number, 
        default: 40,
        min: 0,
        max: 80
      }, // For AI agent (weekly hours)
    },
    // Team Management
    teams: [{
      team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team"
      },
      role: {
        type: String,
        enum: ["leader", "member"],
        default: "member"
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
); // Adds createdAt and updatedAt automatically

module.exports = mongoose.model("User", UserSchema);
