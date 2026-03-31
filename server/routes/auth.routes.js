const express = require('express');
const router = express.Router();
const { protect, generateToken } = require('../middleware/auth');
const User = require('../models/User');
const School = require('../models/School');
const { v4: uuidv4 } = require('uuid');

// @route   POST /api/auth/register
// @desc    Register a new user (student, teacher, or parent)
router.post('/register', async (req, res) => {
  try {
    const { role, fullName, dateOfBirth, email, password, phone, school, studentNumber, grade, teacherNumber, subjects, parentCode, childCode } = req.body;

    // Check required fields
    if (!role || !fullName || !dateOfBirth || !password) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios em falta' });
    }

    // Resolve school code to ObjectId
    let schoolId = school;
    if (school) {
      const ObjectId = require('mongoose').Types.ObjectId;
      if (!ObjectId.isValid(school)) {
        const schoolDoc = await School.findOne({ code: school });
        schoolId = schoolDoc ? schoolDoc._id : null;
      }
    }

    // Role-specific validation
    if (role === 'teacher') {
      if (!schoolId) return res.status(400).json({ success: false, message: 'Selecione uma escola' });
    }

    if (role === 'student') {
      if (!grade) return res.status(400).json({ success: false, message: 'Selecione o ano escolar' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email?.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Este email já está registado' });
    }

    // Build user object
    const userData = {
      role,
      fullName,
      dateOfBirth,
      email: email?.toLowerCase(),
      password,
      phone
    };

    // Role-specific fields
    if (role === 'teacher') {
      userData.school = schoolId;
      userData.teacherNumber = teacherNumber;
      userData.subjects = subjects || [];
    }

    if (role === 'student') {
      userData.school = schoolId;
      userData.studentNumber = studentNumber;
      userData.grade = grade;

      // Generate parent code for children 10-14
      const birthDate = new Date(dateOfBirth);
      const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
      if (age >= 10 && age <= 14) {
        userData.parentCode = uuidv4().substring(0, 8).toUpperCase();
      }

      // Check if parent is linking via code
      if (childCode) {
        // childCode is actually a parentCode from another student? No, this is wrong.
        // For student registration, parentCode is generated. Parent links via parentCode.
      }
    }

    if (role === 'parent') {
      // Parent can optionally link to a child via parentCode
      if (parentCode) {
        const child = await User.findOne({ parentCode, role: 'student' });
        if (!child) {
          return res.status(404).json({ success: false, message: 'Código do filho não encontrado' });
        }
        userData.linkedChildren = [child._id];
        child.linkedParent = userData._id; // Will set after creation
      }
    }

    const user = await User.create(userData);

    // Link parent to child after creation
    if (role === 'parent' && parentCode) {
      const child = await User.findOne({ parentCode, role: 'student' });
      if (child) {
        child.linkedParent = user._id;
        await child.save();
      }
    }

    const token = generateToken(user._id);

    // Don't send password
    const userResponse = await User.findById(user._id);

    res.status(201).json({
      success: true,
      message: 'Registo efetuado com sucesso',
      data: {
        token,
        user: userResponse
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Conta desativada' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login efetuado com sucesso',
      data: {
        token,
        user
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('school', 'name code')
      .populate('linkedParent', 'fullName email')
      .populate('linkedChildren', 'fullName grade studentNumber');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/auth/preferences
// @desc    Update activity preferences
router.put('/preferences', protect, async (req, res) => {
  try {
    const { activityPreferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { activityPreferences },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: user,
      message: 'Preferências atualizadas com sucesso'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
