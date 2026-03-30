const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  },
  // File info
  originalName: {
    type: String
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String
  },
  fileSize: {
    type: Number
  },
  // AI Analysis
  aiAnalysis: {
    hasFace: {
      type: Boolean,
      default: false
    },
    isSelfie: {
      type: Boolean,
      default: false
    },
    description: {
      type: String
    },
    confidence: {
      type: Number
    },
    isValidActivityProof: {
      type: Boolean,
      default: false
    },
    feedback: {
      type: String
    },
    analyzedAt: Date
  },
  // Validation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'manual_review'],
    default: 'pending'
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  validatedAt: Date,
  rejectionReason: {
    type: String
  },
  // Points awarded
  pointsAwarded: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

photoSchema.index({ uploadedBy: 1, status: 1 });

module.exports = mongoose.model('Photo', photoSchema);
