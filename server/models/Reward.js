const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['badge', 'desbloqueio', 'desconto', 'experiencia', 'simbolica']
  },
  pointsCost: {
    type: Number,
    required: true
  },
  icon: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reward', rewardSchema);
