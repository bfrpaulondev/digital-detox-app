const mongoose = require('mongoose');

const screenTimeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  // Time in minutes
  totalMinutes: {
    type: Number,
    default: 0
  },
  targetMinutes: {
    type: Number,
    default: 240 // 4 hours
  },
  // Breakdown
  breakdown: [{
    category: String, // 'redes_sociais', 'jogos', 'videos', 'educacao', 'outro'
    minutes: Number
  }],
  // Rewards
  goalMet: {
    type: Boolean,
    default: false
  },
  pointsEarned: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

screenTimeSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('ScreenTime', screenTimeSchema);
