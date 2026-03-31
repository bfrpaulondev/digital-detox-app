const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Points = require('../models/Points');

// @route   GET /api/users/students
// @desc    Get all students (teacher/parent only)
router.get('/students', protect, authorize('teacher', 'parent'), async (req, res) => {
  try {
    const query = { role: 'student', isActive: true };

    if (req.user.role === 'parent') {
      query.linkedParent = req.user._id;
    }

    if (req.user.role === 'teacher' && req.query.school) {
      query.school = req.query.school;
    }

    const students = await User.find(query)
      .populate('school', 'name code')
      .select('-password')
      .sort({ fullName: 1 });

    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users/profile/:id
// @desc    Get user profile
router.get('/profile/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('school', 'name code')
      .populate('linkedParent', 'fullName')
      .populate('linkedChildren', 'fullName grade')
      .select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilizador não encontrado' });
    }

    // Parents can only view their children
    if (req.user.role === 'parent') {
      const childIds = req.user.linkedChildren.map(c => c.toString());
      if (!childIds.includes(req.params.id) && req.params.id !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Sem permissão' });
      }
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/users/profile/:id
// @desc    Update user profile
router.put('/profile/:id', protect, async (req, res) => {
  try {
    const { fullName, phone, activityPreferences, maxScreenTimeHours, sleepTime, workSchedule } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (activityPreferences) updateData.activityPreferences = activityPreferences;
    if (maxScreenTimeHours) updateData.maxScreenTimeHours = maxScreenTimeHours;
    if (sleepTime) updateData.sleepTime = sleepTime;
    if (workSchedule) updateData.workSchedule = workSchedule;

    // Only allow users to update their own profile (or parent to update child)
    if (req.user.role === 'parent') {
      const childIds = req.user.linkedChildren.map(c => c.toString());
      if (!childIds.includes(req.params.id) && req.params.id !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Sem permissão' });
      }
    } else if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Sem permissão' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, data: user, message: 'Perfil atualizado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users/points/:userId
// @desc    Get user points history
router.get('/points/:userId', protect, async (req, res) => {
  try {
    // Only allow viewing own points, parent viewing child's, or teacher
    if (req.user.role === 'parent') {
      const childIds = req.user.linkedChildren.map(c => c.toString());
      if (!childIds.includes(req.params.userId) && req.params.userId !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Sem permissão' });
      }
    }

    const points = await Points.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const totalPoints = await Points.aggregate([
      { $match: { user: new require('mongoose').Types.ObjectId(req.params.userId) } },
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);

    res.json({
      success: true,
      data: {
        points,
        totalPoints: totalPoints[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/users/link-child
// @desc    Link parent to child via code
router.post('/link-child', protect, authorize('parent'), async (req, res) => {
  try {
    const { parentCode } = req.body;

    if (!parentCode) {
      return res.status(400).json({ success: false, message: 'Código do filho é obrigatório' });
    }

    const child = await User.findOne({ parentCode, role: 'student' });
    if (!child) {
      return res.status(404).json({ success: false, message: 'Código não encontrado ou inválido' });
    }

    // Check if already linked
    if (child.linkedParent && child.linkedParent.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Este filho já está associado à sua conta' });
    }

    child.linkedParent = req.user._id;
    await child.save();

    // Add child to parent's children list
    if (!req.user.linkedChildren.includes(child._id)) {
      req.user.linkedChildren.push(child._id);
      await req.user.save();
    }

    res.json({
      success: true,
      message: 'Filho associado com sucesso',
      data: child
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
