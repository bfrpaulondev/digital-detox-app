const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Pet = require('../models/Pet');
const Points = require('../models/Points');
const Attendance = require('../models/Attendance');
const ScreenTime = require('../models/ScreenTime');
const Notification = require('../models/Notification');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = {};

    if (req.user.role === 'student') {
      const completedActivities = await Activity.countDocuments({
        'completedBy.user': req.user._id,
        'completedBy.validatedBy': { $exists: true }
      });

      const pendingActivities = await Activity.countDocuments({
        assignedTo: req.user._id,
        status: { $in: ['pendente', 'em_progresso'] }
      });

      const pet = await Pet.findOne({ owner: req.user._id });

      stats = {
        totalPoints: req.user.totalPoints,
        level: req.user.level,
        currentStreak: req.user.currentStreak,
        longestStreak: req.user.longestStreak,
        completedActivities,
        pendingActivities,
        pet: pet ? { name: pet.name, level: pet.level, species: pet.species, mood: pet.mood, evolutionStage: pet.evolutionStage } : null,
        achievementCount: req.user.achievements?.length || 0
      };
    } else if (req.user.role === 'teacher') {
      const totalStudents = await User.countDocuments({ school: req.user.school, role: 'student', isActive: true });
      const myActivities = await Activity.countDocuments({ assignedBy: req.user._id });
      const pendingValidations = await Activity.countDocuments({
        assignedBy: req.user._id,
        status: 'concluida'
      });

      // Get school ranking (top students)
      const topStudents = await User.find({ school: req.user.school, role: 'student', isActive: true })
        .sort({ totalPoints: -1 })
        .limit(10)
        .select('fullName grade totalPoints currentStreak');

      stats = {
        totalStudents,
        myActivities,
        pendingValidations,
        topStudents,
        schoolName: req.user.school?.name
      };
    } else if (req.user.role === 'parent') {
      const childrenData = [];
      for (const childId of req.user.linkedChildren) {
        const child = await User.findById(childId).populate('school', 'name');
        const completedActivities = await Activity.countDocuments({
          'completedBy.user': childId,
          'completedBy.validatedBy': { $exists: true }
        });
        const pet = await Pet.findOne({ owner: childId });
        const recentPoints = await Points.find({ user: childId }).sort({ createdAt: -1 }).limit(5);

        childrenData.push({
          id: child._id,
          fullName: child.fullName,
          grade: child.grade,
          school: child.school?.name,
          totalPoints: child.totalPoints,
          level: child.level,
          currentStreak: child.currentStreak,
          completedActivities,
          pet: pet ? { name: pet.name, level: pet.level, mood: pet.mood } : null,
          recentPoints
        });
      }

      stats = {
        children: childrenData,
        totalChildren: childrenData.length
      };
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/dashboard/ranking
// @desc    Get school ranking
router.get('/ranking', protect, async (req, res) => {
  try {
    let schoolId;
    if (req.user.role === 'student') {
      schoolId = req.user.school;
    } else if (req.user.role === 'teacher') {
      schoolId = req.user.school;
    } else {
      return res.status(403).json({ success: false, message: 'Sem permissão' });
    }

    const { grade, period } = req.query;
    const query = { school: schoolId, role: 'student', isActive: true };
    if (grade) query.grade = grade;

    const ranking = await User.find(query)
      .sort({ totalPoints: -1 })
      .select('fullName grade totalPoints currentStreak level')
      .limit(20);

    // Add rank position
    const rankedList = ranking.map((user, index) => ({
      ...user.toObject(),
      position: index + 1,
      isCurrentUser: user._id.toString() === req.user._id.toString()
    }));

    res.json({ success: true, data: rankedList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/dashboard/notifications
// @desc    Get user notifications
router.get('/notifications', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, unread = false } = req.query;
    const query = { recipient: req.user._id };
    if (unread === 'true') query.isRead = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

    res.json({
      success: true,
      data: {
        notifications,
        total,
        unreadCount,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/dashboard/notifications/read-all
// @desc    Mark all notifications as read
router.put('/notifications/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: 'Notificações marcadas como lidas' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
