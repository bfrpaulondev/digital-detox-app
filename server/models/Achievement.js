const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['consistencia', 'participacao', 'evolucao', 'social', 'especial'],
    required: true
  },
  criteria: {
    type: {
      type: String,
      enum: ['total_points', 'streak_days', 'activities_completed', 'pet_level', 'school_ranking']
    },
    value: {
      type: Number,
      required: true
    }
  },
  rarity: {
    type: String,
    enum: ['comum', 'raro', 'epico', 'lendario'],
    default: 'comum'
  },
  pointsReward: {
    type: Number,
    default: 50
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Achievement', achievementSchema);
