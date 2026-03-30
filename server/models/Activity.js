const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: [
      'escola', 'desporto', 'arte', 'leitura', 'jogos_ar_livre',
      'domestica', 'social', 'estudo', 'musica', 'culinaria',
      'jardinagem', 'natureza', 'tabuleiros', 'tecnologia_criativa'
    ],
    required: true
  },
  section: {
    type: String,
    enum: ['escola', 'fora_escola'],
    required: true
  },
  // For school activities
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  },
  classGroup: {
    type: String,
    trim: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Teacher who assigned
  },
  subject: {
    type: String,
    trim: true
  },
  scheduledDate: {
    type: Date
  },
  scheduledTime: {
    type: String
  },
  // Points
  pointsValue: {
    type: Number,
    default: 10
  },
  // Is it a mission/challenge?
  isMission: {
    type: Boolean,
    default: false
  },
  missionType: {
    type: String,
    enum: ['diaria', 'semanal', 'especial']
  },
  missionFrequency: {
    type: Number,
    default: 1 // times per period
  },
  // Status
  status: {
    type: String,
    enum: ['pendente', 'em_progresso', 'concluida', 'validada', 'rejeitada'],
    default: 'pendente'
  },
  // Participants
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  completedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: Date,
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    validatedAt: Date,
    pointsEarned: Number
  }],
  // Photo proof
  requiresPhoto: {
    type: Boolean,
    default: false
  },
  // Validation
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  validatedAt: Date,
  // AI validation
  aiValidation: {
    isValid: Boolean,
    confidence: Number,
    feedback: String,
    validatedAt: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

activitySchema.index({ section: 1, status: 1 });
activitySchema.index({ assignedTo: 1, status: 1 });
activitySchema.index({ assignedBy: 1 });

module.exports = mongoose.model('Activity', activitySchema);
