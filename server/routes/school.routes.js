const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const School = require('../models/School');

// @route   GET /api/schools
// @desc    Get all schools (public - needed for registration)
router.get('/', async (req, res) => {
  try {
    const schools = await School.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: schools });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/schools/:id
// @desc    Get school by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ success: false, message: 'Escola não encontrada' });
    }
    res.json({ success: true, data: school });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/schools/:id/schedule
// @desc    Get school schedule for a specific class
router.get('/:id/schedule', protect, async (req, res) => {
  try {
    const { grade, className } = req.query;
    const school = await School.findById(req.params.id);

    if (!school) {
      return res.status(404).json({ success: false, message: 'Escola não encontrada' });
    }

    let schedule = school.classSchedule;
    if (grade) {
      schedule = schedule.filter(s => s.grade === grade);
    }
    if (className) {
      schedule = schedule.filter(s => s.className === className);
    }

    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/schools/:id/students
// @desc    Get students in a school
router.get('/:id/students', protect, authorize('teacher'), async (req, res) => {
  try {
    const User = require('../models/User');
    const { grade } = req.query;

    const query = { school: req.params.id, role: 'student', isActive: true };
    if (grade) query.grade = grade;

    const students = await User.find(query)
      .select('fullName studentNumber grade')
      .sort({ fullName: 1 });

    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
