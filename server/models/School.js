const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome da escola é obrigatório'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Código da escola é obrigatório'],
    unique: true,
    uppercase: true,
    trim: true
  },
  city: {
    type: String,
    trim: true,
    required: [true, 'Cidade é obrigatória']
  },
  address: {
    type: String,
    trim: true
  },
  levels: [{
    type: String,
    enum: ['2_ciclo', '3_ciclo', 'secundario']
  }],
  schedule: {
    // Default school schedule
    startTime: {
      type: String,
      default: '08:00'
    },
    endTime: {
      type: String,
      default: '15:30'
    },
    breakTime: {
      type: String,
      default: '10:30'
    },
    lunchStart: {
      type: String,
      default: '12:00'
    },
    lunchEnd: {
      type: String,
      default: '13:00'
    }
  },
  classSchedule: [{
    className: {
      type: String,
      required: true
    },
    grade: {
      type: String,
      required: true
    },
    timetable: [{
      day: {
        type: String,
        enum: ['segunda', 'terca', 'quarta', 'quinta', 'sexta'],
        required: true
      },
      periods: [{
        order: Number,
        startTime: String,
        endTime: String,
        subject: String,
        teacher: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      }]
    }]
  }],
  mealTimes: [{
    type: {
      type: String,
      enum: ['pequeno_almoço', 'almoco', 'lanche', 'jantar']
    },
    time: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  // Pending changes awaiting teacher votes
  pendingChanges: {
    type: {
      type: String,
      enum: ['edit', 'delete']
    },
    proposedData: mongoose.Schema.Types.Mixed,
    votes: [{
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

schoolSchema.index({ code: 1 });
schoolSchema.index({ city: 1 });

module.exports = mongoose.model('School', schoolSchema);
