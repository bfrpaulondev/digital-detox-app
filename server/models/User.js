const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['student', 'teacher', 'parent'],
    required: true
  },
  fullName: {
    type: String,
    required: [true, 'Nome completo é obrigatório'],
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Data de nascimento é obrigatória']
  },
  email: {
    type: String,
    sparse: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    trim: true
  },
  // Student specific
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  },
  studentNumber: {
    type: String,
    trim: true
  },
  grade: {
    type: String,
    enum: ['5', '6', '7', '8', '9', '10', '11', '12']
  },
  parentCode: {
    type: String,
    unique: true,
    sparse: true
  },
  linkedParent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  linkedChildren: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Teacher specific
  teacherNumber: {
    type: String,
    trim: true
  },
  subjects: [{
    type: String,
    trim: true
  }],
  // Parent specific
  workSchedule: {
    type: String
  },
  // Activity preferences (for personalized suggestions)
  activityPreferences: [{
    type: String,
    enum: ['desporto', 'arte', 'leitura', 'jogos_ar_livre', 'musica', 'culinaria', 'jardinagem', 'natureza', 'tabuleiros', 'tecnologia_criativa']
  }],
  // Screen time settings
  maxScreenTimeHours: {
    type: Number,
    default: 4
  },
  sleepTime: {
    type: String,
    default: '22:00'
  },
  mealTimes: [{
    type: { type: String, enum: ['Pequeno-almoço', 'Almoço', 'Lanche', 'Jantar'] },
    time: { type: String }
  }],
  familyTimeHours: {
    type: Number,
    default: 2
  },
  // Points and stats
  totalPoints: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  achievements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for age
userSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for age group
userSchema.virtual('ageGroup').get(function() {
  const age = this.age;
  if (age >= 10 && age <= 14) return 'child';
  if (age >= 15 && age <= 18) return 'teen';
  return 'adult';
});

// Index
userSchema.index({ role: 1, school: 1 });
userSchema.index({ parentCode: 1 });
userSchema.index({ linkedParent: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
