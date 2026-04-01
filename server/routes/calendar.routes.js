const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Activity = require('../models/Activity');
const School = require('../models/School');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Points = require('../models/Points');

// @route   GET /api/calendar
// @desc    Get user's calendar events
router.get('/', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    const events = [];

    if (req.user.role === 'student') {
      // School schedule
      if (req.user.school) {
        const school = await School.findById(req.user.school);
        if (school && school.classSchedule) {
          const classSchedule = school.classSchedule.find(s => s.grade === req.user.grade);
          if (classSchedule) {
            classSchedule.timetable.forEach(period => {
              const dayMap = { segunda: 1, terca: 2, quarta: 3, quinta: 4, sexta: 5 };
              const dayOfWeek = dayMap[period.day];
              if (dayOfWeek) {
                events.push({
                  type: 'school',
                  title: `${period.subject} (${period.startTime}-${period.endTime})`,
                  dayOfWeek,
                  startTime: period.startTime,
                  endTime: period.endTime,
                  recurring: true
                });
              }
            });
          }
        }
      }

      // Daily missions assigned to student (school activities)
      const missionQuery = {
        assignedTo: req.user._id,
        scheduledDate: { $exists: true },
        isActive: true
      };

      const activities = await Activity.find(missionQuery)
        .populate('assignedBy', 'fullName');

      activities.forEach(activity => {
        const isCompleted = activity.completedBy?.some(c => c.user.toString() === req.user._id.toString());
        events.push({
          type: activity.isMission ? 'mission' : 'activity',
          id: activity._id,
          title: activity.title,
          description: activity.description,
          date: activity.scheduledDate,
          startTime: activity.scheduledTime,
          category: activity.category,
          section: activity.section,
          status: activity.status,
          pointsValue: activity.pointsValue,
          isMission: activity.isMission,
          isCompleted,
          requiresPhoto: activity.requiresPhoto
        });
      });
    } else if (req.user.role === 'teacher') {
      // Teacher's created missions/activities
      const missionQuery = {
        assignedBy: req.user._id,
        scheduledDate: { $exists: true },
        isActive: true
      };

      if (month && year) {
        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
        missionQuery.scheduledDate = { $gte: startDate, $lte: endDate };
      }

      const activities = await Activity.find(missionQuery)
        .populate('assignedTo', 'fullName')
        .populate('completedBy.user', 'fullName');

      activities.forEach(activity => {
        const completionCount = activity.completedBy?.length || 0;
        const totalAssigned = activity.assignedTo?.length || 0;
        events.push({
          type: activity.isMission ? 'mission' : 'activity',
          id: activity._id,
          title: activity.title,
          description: activity.description,
          date: activity.scheduledDate,
          startTime: activity.scheduledTime,
          subject: activity.subject,
          classGroup: activity.classGroup,
          status: activity.status,
          pointsValue: activity.pointsValue,
          isMission: activity.isMission,
          completionCount,
          totalAssigned,
          completedBy: activity.completedBy
        });
      });
    } else if (req.user.role === 'parent') {
      // Parent can see children's missions
      for (const childId of req.user.linkedChildren) {
        const child = await User.findById(childId);
        if (!child) continue;

        const missionQuery = {
          assignedTo: childId,
          scheduledDate: { $exists: true },
          isActive: true
        };

        const activities = await Activity.find(missionQuery)
          .populate('assignedBy', 'fullName');

        activities.forEach(activity => {
          const isCompleted = activity.completedBy?.some(c => c.user.toString() === childId.toString());
          events.push({
            type: activity.isMission ? 'mission' : 'activity',
            id: activity._id,
            title: activity.title,
            description: activity.description,
            date: activity.scheduledDate,
            startTime: activity.scheduledTime,
            childName: child.fullName,
            childId: child._id,
            status: activity.status,
            pointsValue: activity.pointsValue,
            isMission: activity.isMission,
            isCompleted
          });
        });
      }
    }

    res.json({ success: true, data: events, _debug: { role: req.user.role, userId: req.user._id?.toString() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/calendar/mission
// @desc    Create a daily mission on the calendar (teacher only)
router.post('/mission', protect, authorize('teacher'), async (req, res) => {
  try {
    const { title, description, category, classGroup, scheduledDate, scheduledTime, pointsValue, requiresPhoto } = req.body;

    if (!title || !scheduledDate) {
      return res.status(400).json({ success: false, message: 'Título e data são obrigatórios.' });
    }

    if (!req.user.school) {
      return res.status(400).json({ success: false, message: 'Professor não está associado a uma escola.' });
    }

    // Find students of the specified grade (or all grades if not specified)
    const studentQuery = { school: req.user.school, role: 'student', isActive: true };
    if (classGroup) studentQuery.grade = classGroup;

    const students = await User.find(studentQuery);
    if (students.length === 0) {
      return res.status(400).json({ success: false, message: 'Nenhum aluno encontrado para esta turma/escola.' });
    }

    const activity = await Activity.create({
      title,
      description: description || '',
      category: category || 'escola',
      section: 'escola',
      school: req.user.school,
      classGroup: classGroup || '',
      assignedBy: req.user._id,
      scheduledDate: new Date(scheduledDate),
      scheduledTime: scheduledTime || null,
      pointsValue: pointsValue || 15,
      isMission: true,
      missionType: 'diaria',
      requiresPhoto: requiresPhoto || true,
      assignedTo: students.map(s => s._id)
    });

    // Notify all assigned students
    await Notification.insertMany(
      students.map(student => ({
        recipient: student._id,
        sender: req.user._id,
        type: 'school_alert',
        title: 'Nova Missão Diária! 🎯',
        message: `${title} — ${pointsValue || 15} pontos. Data: ${new Date(scheduledDate).toLocaleDateString('pt-PT')}.`,
        relatedId: activity._id,
        relatedModel: 'Activity'
      }))
    );

    res.status(201).json({
      success: true,
      data: activity,
      message: `Missão criada para ${students.length} aluno(s)!`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/calendar/mission/:id/complete
// @desc    Student completes a mission with optional photo proof
router.put('/mission/:id/complete', protect, authorize('student'), async (req, res) => {
  try {
    const { photoId } = req.body;
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Missão não encontrada.' });
    }

    if (!activity.assignedTo.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Não estás atribuído a esta missão.' });
    }

    const alreadyCompleted = activity.completedBy.find(c => c.user.toString() === req.user._id.toString());
    if (alreadyCompleted) {
      return res.status(400).json({ success: false, message: 'Já completaste esta missão.' });
    }

    activity.completedBy.push({
      user: req.user._id,
      completedAt: new Date(),
      photoProof: photoId || null
    });

    await activity.save();

    res.json({ success: true, data: activity, message: 'Missão marcada como concluída! Aguarda validação do professor.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
