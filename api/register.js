// Standalone register function - lightweight, no serverless-http
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// User Schema (inline to avoid import issues)
const userSchema = new mongoose.Schema({
  role: { type: String, enum: ['student', 'teacher', 'parent'], required: true },
  fullName: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, trim: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  studentNumber: { type: String, trim: true },
  grade: { type: String, trim: true },
  teacherNumber: { type: String, trim: true },
  subjects: [{ type: String }],
  parentCode: { type: String },
  linkedParent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  linkedChildren: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  activityPreferences: [{ type: String }],
  points: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

const jwt = require('jsonwebtoken');

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'digital-detox-prod-jwt-secret-x9k2m8v4n6p1q7w3e5r', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

let cachedDb = null;
async function connectDB() {
  if (cachedDb && cachedDb.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000
  });
  cachedDb = mongoose.connection;
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectDB();

    const { role, fullName, dateOfBirth, email, password, phone, school, studentNumber, grade, teacherNumber, subjects, parentCode, activityPreferences } = req.body;

    if (!role || !fullName || !dateOfBirth || !password) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios em falta' });
    }

    if (role === 'student' && !grade) {
      return res.status(400).json({ success: false, message: 'Selecione o ano escolar' });
    }

    // Resolve school: accept code or ObjectId
    let schoolId = school;
    if (school && role !== 'parent') {
      const ObjectId = require('mongoose').Types.ObjectId;
      if (!ObjectId.isValid(school)) {
        // It's a school code, find by code
        const SchoolSchema = new mongoose.Schema({ name: String, code: String }, { strict: false });
        const SchoolModel = mongoose.models.School || mongoose.model('School', SchoolSchema);
        const schoolDoc = await SchoolModel.findOne({ code: school });
        if (schoolDoc) {
          schoolId = schoolDoc._id;
        } else {
          schoolId = null; // School not found, allow registration without school
        }
      }
    }

    const existingUser = await User.findOne({ email: email?.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Este email já está registado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      role,
      fullName,
      dateOfBirth,
      email: email?.toLowerCase(),
      password: hashedPassword,
      phone,
      activityPreferences: activityPreferences || []
    };

    if (role === 'teacher') {
      if (schoolId) userData.school = schoolId;
      userData.teacherNumber = teacherNumber;
      userData.subjects = subjects || [];
    }

    if (role === 'student') {
      if (schoolId) userData.school = schoolId;
      userData.studentNumber = studentNumber;
      userData.grade = grade;

      // Generate parent code ONLY for children 10-13 (under 14 = not autonomous)
      // Students 14+ are autonomous — no parent supervision needed
      const birthDate = new Date(dateOfBirth);
      const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
      if (age >= 10 && age < 14) {
        userData.parentCode = uuidv4().substring(0, 8).toUpperCase();
      }
    }

    if (role === 'parent' && parentCode) {
      const child = await User.findOne({ parentCode, role: 'student' });
      if (!child) {
        return res.status(404).json({ success: false, message: 'Código do filho não encontrado' });
      }
    }

    const user = await User.create(userData);

    if (role === 'parent' && parentCode) {
      const child = await User.findOne({ parentCode, role: 'student' });
      if (child) {
        child.linkedParent = user._id;
        await child.save();
        user.linkedChildren = [child._id];
        await user.save();
      }
    }

    const token = generateToken(user._id);

    const userResponse = await User.findById(user._id).select('-password');

    return res.status(201).json({
      success: true,
      message: 'Registo efetuado com sucesso!',
      data: { token, user: userResponse }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
