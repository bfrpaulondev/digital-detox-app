const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Activity = require('../models/Activity');
const Points = require('../models/Points');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Achievement = require('../models/Achievement');

// @route   POST /api/activities
// @desc    Create a new activity (teacher or auto-generated)
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, section, classGroup, subject, scheduledDate, scheduledTime, pointsValue, isMission, missionType, requiresPhoto, assignedTo } = req.body;

    const activityData = {
      title,
      description,
      category,
      section: section || 'fora_escola',
      pointsValue: pointsValue || 10,
      requiresPhoto: requiresPhoto || false,
      isMission: isMission || false
    };

    if (req.user.role === 'teacher') {
      activityData.school = req.user.school;
      activityData.assignedBy = req.user._id;
      activityData.section = 'escola';
      activityData.subject = subject;
      activityData.classGroup = classGroup;
      activityData.scheduledDate = scheduledDate;
      activityData.scheduledTime = scheduledTime;

      if (isMission) activityData.missionType = missionType || 'diaria';

      // Assign to students of the class if not specified
      if (!assignedTo && classGroup) {
        const students = await User.find({ school: req.user.school, grade: classGroup, role: 'student', isActive: true });
        activityData.assignedTo = students.map(s => s._id);
      } else if (assignedTo) {
        activityData.assignedTo = assignedTo;
      }
    } else {
      activityData.section = 'fora_escola';
      activityData.assignedTo = [req.user._id];
    }

    const activity = await Activity.create(activityData);

    // Notify assigned students
    if (activity.assignedTo.length > 0) {
      const notifications = activity.assignedTo.map(userId => ({
        recipient: userId,
        type: 'school_alert',
        title: 'Nova Atividade',
        message: `Nova atividade atribuída: ${activity.title}`,
        relatedId: activity._id,
        relatedModel: 'Activity'
      }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/activities
// @desc    Get activities based on user role
router.get('/', protect, async (req, res) => {
  try {
    const { section, status, missionType } = req.query;
    const query = { isActive: true };

    if (req.user.role === 'student') {
      query.assignedTo = req.user._id;
      if (section) query.section = section;
      if (status) query.status = status;
    } else if (req.user.role === 'teacher') {
      query.assignedBy = req.user._id;
      if (section) query.section = section;
    } else if (req.user.role === 'parent') {
      const childIds = req.user.linkedChildren.map(c => c.toString());
      query.assignedTo = { $in: childIds };
      if (section) query.section = section;
    }

    if (missionType) query.isMission = true;

    const activities = await Activity.find(query)
      .populate('assignedBy', 'fullName')
      .populate('assignedTo', 'fullName')
      .populate('completedBy.user', 'fullName')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/activities/:id/complete
// @desc    Mark activity as completed by student
router.put('/:id/complete', protect, authorize('student'), async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Atividade não encontrada' });
    }

    // Check if student is assigned
    if (!activity.assignedTo.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Não está atribuído a esta atividade' });
    }

    // Check if already completed
    const alreadyCompleted = activity.completedBy.find(c => c.user.toString() === req.user._id.toString());
    if (alreadyCompleted) {
      return res.status(400).json({ success: false, message: 'Já completou esta atividade' });
    }

    activity.completedBy.push({
      user: req.user._id,
      completedAt: new Date()
    });
    activity.status = 'concluida';

    await activity.save();

    res.json({ success: true, data: activity, message: 'Atividade marcada como concluída' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/activities/:id/validate
// @desc    Teacher validates student's activity
router.put('/:id/validate', protect, authorize('teacher'), async (req, res) => {
  try {
    const { studentId, approved, pointsOverride } = req.body;

    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Atividade não encontrada' });
    }

    const completionIndex = activity.completedBy.findIndex(c => c.user.toString() === studentId);
    if (completionIndex === -1) {
      return res.status(400).json({ success: false, message: 'O aluno não completou esta atividade' });
    }

    if (approved) {
      activity.completedBy[completionIndex].validatedBy = req.user._id;
      activity.completedBy[completionIndex].validatedAt = new Date();
      activity.completedBy[completionIndex].pointsEarned = pointsOverride || activity.pointsValue;

      // Award points to student
      const pointsRecord = await Points.create({
        user: studentId,
        source: 'atividade',
        activity: activity._id,
        section: activity.section,
        points: pointsOverride || activity.pointsValue,
        description: `Atividade validada: ${activity.title}`,
        awardedBy: req.user._id
      });

      // Update user total points and streak
      const student = await User.findById(studentId);
      student.totalPoints += pointsRecord.points;
      student.currentStreak += 1;
      if (student.currentStreak > student.longestStreak) {
        student.longestStreak = student.currentStreak;
      }

      // Level up check (every 100 points)
      const newLevel = Math.floor(student.totalPoints / 100) + 1;
      if (newLevel > student.level) {
        student.level = newLevel;
      }

      await student.save();

      // Check achievements
      await checkAchievements(studentId);

      // Notify student
      await Notification.create({
        recipient: studentId,
        sender: req.user._id,
        type: 'activity_validated',
        title: 'Atividade Validada!',
        message: `A atividade "${activity.title}" foi validada. Ganhou ${pointsRecord.points} pontos!`,
        relatedId: activity._id,
        relatedModel: 'Activity'
      });
    } else {
      activity.completedBy[completionIndex].pointsEarned = 0;
      activity.status = 'rejeitada';
    }

    await activity.save();
    res.json({ success: true, data: activity, message: approved ? 'Atividade validada' : 'Atividade rejeitada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/activities/:id
// @desc    Delete activity
router.delete('/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Atividade não encontrada' });
    }

    activity.isActive = false;
    await activity.save();

    res.json({ success: true, message: 'Atividade removida' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper: Check and award achievements
async function checkAchievements(userId) {
  const user = await User.findById(userId);
  if (!user) return;

  const achievements = await Achievement.find({});
  const newlyEarned = [];

  for (const achievement of achievements) {
    // Skip if already earned
    if (user.achievements.includes(achievement._id)) continue;

    let earned = false;
    switch (achievement.criteria.type) {
      case 'total_points':
        earned = user.totalPoints >= achievement.criteria.value;
        break;
      case 'streak_days':
        earned = user.currentStreak >= achievement.criteria.value;
        break;
      case 'activities_completed':
        const completedCount = await Activity.countDocuments({
          'completedBy.user': userId,
          'completedBy.validatedBy': { $exists: true }
        });
        earned = completedCount >= achievement.criteria.value;
        break;
      case 'pet_level':
        const Pet = require('../models/Pet');
        const pet = await Pet.findOne({ owner: userId });
        earned = pet && pet.level >= achievement.criteria.value;
        break;
    }

    if (earned) {
      user.achievements.push(achievement._id);
      newlyEarned.push(achievement);

      // Award bonus points
      user.totalPoints += achievement.pointsReward;
      await Points.create({
        user: userId,
        source: 'ranking',
        points: achievement.pointsReward,
        description: `Conquista desbloqueada: ${achievement.name}`
      });

      await Notification.create({
        recipient: userId,
        type: 'achievement',
        title: 'Nova Conquista!',
        message: `${achievement.name}: ${achievement.description}`,
        relatedId: achievement._id,
        relatedModel: 'Achievement'
      });
    }
  }

  if (newlyEarned.length > 0) {
    await user.save();
  }
}

module.exports = router;
