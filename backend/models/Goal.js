// Goal MongoDB schema

const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  weightage: Number,
  dueDate: Date,
  completed: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Goal', GoalSchema);
