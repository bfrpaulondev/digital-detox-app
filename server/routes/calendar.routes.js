const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Activity = require('../models/Activity');
const Attendance = require('../models/Attendance');
const School = require('../models/School');
const User = require('../models/User');

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

        // Add meal times from school
        if (school && school.mealTimes) {
          school.mealTimes.forEach(meal => {
            const typeLabel = {
              'pequeno_almoço': 'Pequeno-Almoço',
              'almoco': 'Almoço',
              'lanche': 'Lanche',
              'jantar': 'Jantar'
            };
            events.push({
              type: 'meal',
              title: typeLabel[meal.type] || meal.type,
              startTime: meal.time,
              recurring: true
            });
          });
        }
      }

      // Activities assigned to student
      const activities = await Activity.find({
        assignedTo: req.user._id,
        scheduledDate: { $exists: true }
      }).populate('assignedBy', 'fullName');

      activities.forEach(activity => {
        events.push({
          type: 'activity',
          id: activity._id,
          title: activity.title,
          description: activity.description,
          date: activity.scheduledDate,
          startTime: activity.scheduledTime,
          category: activity.category,
          section: activity.section,
          status: activity.status
        });
      });

      // Family time (set by parent) - from parent's preferences
      if (req.user.linkedParent) {
        const parent = await User.findById(req.user.linkedParent);
        if (parent) {
          events.push({
            type: 'family_time',
            title: 'Tempo em Família',
            recurring: true
          });
          // Parent-defined sleep time and meal times
          if (parent.sleepTime) {
            events.push({
              type: 'sleep',
              title: 'Hora de Dormir',
              startTime: parent.sleepTime,
              recurring: true
            });
          }
        }
      }
    } else if (req.user.role === 'teacher') {
      // Teacher's activities
      const activities = await Activity.find({
        assignedBy: req.user._id,
        scheduledDate: { $exists: true }
      });

      activities.forEach(activity => {
        events.push({
          type: 'activity',
          id: activity._id,
          title: activity.title,
          date: activity.scheduledDate,
          startTime: activity.scheduledTime,
          subject: activity.subject,
          classGroup: activity.classGroup,
          status: activity.status
        });
      });

      // Evaluation dates
      events.push({
        type: 'info',
        title: 'Consulte as suas avaliações na secção Escola'
      });
    } else if (req.user.role === 'parent') {
      // Parent can see children's calendar
      for (const childId of req.user.linkedChildren) {
        const child = await User.findById(childId).populate('school');
        if (child && child.school) {
          const school = await School.findById(child.school);
          if (school) {
            events.push({
              type: 'school',
              title: `Escola de ${child.fullName}`,
              childId: child._id,
              childName: child.fullName
            });
          }
        }
      }
    }

    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
