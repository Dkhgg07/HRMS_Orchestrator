const mongoose = require('mongoose');

const PerformanceReviewSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Typically the manager
    required: true,
  },
  cycle: String, // e.g., "Q2 2023", "Annual 2023"
  goals: [{
    description: String,
    weightage: Number, // e.g., 30%
    selfRating: Number,
    managerRating: Number,
    comments: String,
  }],
  overallScore: Number,
  feedback: String, // Manager's overall feedback
  // AI-Generated Insights (These can be populated by our AI_helpers)
  aiSentiment: {
    // Result of analyzing the feedback text
    score: Number, // -1 to 1
    keywords: [String],
  },
  predictedAttritionRisk: {
    risk: Number, // 0 to 1
    factors: [String], // e.g., "stagnant goals", "market trends"
  },
}, { timestamps: true });

module.exports = mongoose.model('PerformanceReview', PerformanceReviewSchema);