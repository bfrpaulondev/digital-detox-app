const mongoose = require('mongoose');

const pointsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Source
  source: {
    type: String,
    enum: ['atividade', 'missao', 'presenca', 'ranking', 'bonus_streak', 'alimentacao_pet', 'recompensa', 'deducao'],
    required: true
  },
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  },
  section: {
    type: String,
    enum: ['escola', 'fora_escola', 'pet']
  },
  // Points
  points: {
    type: Number,
    required: true,
    min: 0
  },
  // Context
  description: {
    type: String
  },
  awardedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Streak bonus
  isStreakBonus: {
    type: Boolean,
    default: false
  },
  streakDays: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

pointsSchema.index({ user: 1, createdAt: -1 });
pointsSchema.index({ user: 1, section: 1 });

module.exports = mongoose.model('Points', pointsSchema);
