const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  classGroup: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  subject: {
    type: String,
    trim: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  records: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['presente', 'ausente', 'justificado', 'atrasado'],
      default: 'presente'
    },
    notes: {
      type: String,
      trim: true
    }
  }]
}, {
  timestamps: true
});

attendanceSchema.index({ school: 1, date: 1, classGroup: 1 });
attendanceSchema.index({ teacher: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
