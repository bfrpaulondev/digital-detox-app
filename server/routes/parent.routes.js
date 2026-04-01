const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Photo = require('../models/Photo');
const Points = require('../models/Points');
const Notification = require('../models/Notification');

// @route   GET /api/parent/child-settings/:childId
// @desc    Get child's settings (parent only)
router.get('/child-settings/:childId', protect, authorize('parent'), async (req, res) => {
  try {
    // Verify this child belongs to the parent
    const childId = req.params.childId;
    const isChild = req.user.linkedChildren.some(c => c.toString() === childId);
    if (!isChild) {
      return res.status(403).json({ success: false, message: 'Este filho não está vinculado à sua conta.' });
    }

    const child = await User.findById(childId).select(
      'fullName maxScreenTimeHours sleepTime mealTimes familyTimeHours totalPoints currentStreak longestStreak level'
    );

    if (!child) {
      return res.status(404).json({ success: false, message: 'Filho não encontrado.' });
    }

    // Calculate weekly stats
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyPoints = await Points.aggregate([
      { $match: { user: child._id, createdAt: { $gte: oneWeekAgo }, points: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$points' }, count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        maxScreenTimeHours: child.maxScreenTimeHours || 4,
        sleepTime: child.sleepTime || '22:00',
        mealTimes: child.mealTimes || [],
        familyTimeHours: child.familyTimeHours || 2,
        totalPoints: child.totalPoints || 0,
        currentStreak: child.currentStreak || 0,
        longestStreak: child.longestStreak || 0,
        level: child.level || 1,
        completedActivitiesThisWeek: weeklyPoints[0]?.count || 0,
        weeklyPoints: weeklyPoints[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/parent/child-settings/:childId
// @desc    Update child's settings (parent only)
router.put('/child-settings/:childId', protect, authorize('parent'), async (req, res) => {
  try {
    const childId = req.params.childId;
    const isChild = req.user.linkedChildren.some(c => c.toString() === childId);
    if (!isChild) {
      return res.status(403).json({ success: false, message: 'Este filho não está vinculado à sua conta.' });
    }

    const { maxScreenTimeHours, sleepTime, mealTimes, familyTimeHours } = req.body;

    const updateData = {};
    if (maxScreenTimeHours !== undefined) updateData.maxScreenTimeHours = Math.max(1, Math.min(8, Number(maxScreenTimeHours)));
    if (sleepTime !== undefined) updateData.sleepTime = sleepTime;
    if (mealTimes !== undefined) updateData.mealTimes = mealTimes;
    if (familyTimeHours !== undefined) updateData.familyTimeHours = Math.max(1, Math.min(6, Number(familyTimeHours)));

    const child = await User.findByIdAndUpdate(childId, updateData, { new: true, runValidators: true });

    if (!child) {
      return res.status(404).json({ success: false, message: 'Filho não encontrado.' });
    }

    // Notify child that settings were updated
    await Notification.create({
      recipient: childId,
      sender: req.user._id,
      type: 'parent_alert',
      title: 'Definições Atualizadas',
      message: `O teu pai/mãe atualizou as tuas definições: tempo de ecrã ${child.maxScreenTimeHours}h, dormir às ${child.sleepTime}.`,
      relatedId: req.user._id,
      relatedModel: 'User'
    });

    res.json({
      success: true,
      data: {
        maxScreenTimeHours: child.maxScreenTimeHours,
        sleepTime: child.sleepTime,
        mealTimes: child.mealTimes,
        familyTimeHours: child.familyTimeHours
      },
      message: 'Definições atualizadas com sucesso!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/parent/validate-photo/:photoId
// @desc    Parent validates or rejects a child's photo (with notification + punishment)
router.put('/validate-photo/:photoId', protect, authorize('parent'), async (req, res) => {
  try {
    const { approved, rejectionReason } = req.body;
    const photoId = req.params.photoId;

    const photo = await Photo.findById(photoId).populate('uploadedBy', 'fullName linkedParent totalPoints currentStreak');
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Foto não encontrada.' });
    }

    // Verify the photo belongs to one of parent's children
    const uploaderId = photo.uploadedBy._id.toString();
    const isChild = req.user.linkedChildren.some(c => c.toString() === uploaderId);
    if (!isChild) {
      return res.status(403).json({ success: false, message: 'Esta foto não é de um dos seus filhos.' });
    }

    const student = photo.uploadedBy;
    const punishmentPoints = 5; // Points deducted on rejection

    if (approved) {
      // === APPROVE ===
      photo.status = 'approved';
      photo.validatedBy = req.user._id;
      photo.validatedAt = new Date();
      photo.pointsAwarded = 10;

      // Award points
      student.totalPoints += 10;
      student.currentStreak += 1;
      if (student.currentStreak > student.longestStreak) {
        student.longestStreak = student.currentStreak;
      }

      // Level up check
      const newLevel = Math.floor(student.totalPoints / 100) + 1;
      if (newLevel > student.level) {
        student.level = newLevel;
      }

      await student.save();

      // Record points
      await Points.create({
        user: uploaderId,
        source: 'atividade',
        activity: photo.activity,
        section: 'fora_escola',
        points: 10,
        description: `Foto aprovada pelo pai/mãe: ${photo.originalName || 'Atividade fora da escola'}`,
        awardedBy: req.user._id
      });

      // Notify student - APPROVED
      await Notification.create({
        recipient: uploaderId,
        sender: req.user._id,
        type: 'activity_validated',
        title: 'Foto Aprovada! 🎉',
        message: `O teu pai/mãe aprovou a tua foto de atividade! Ganhou 10 pontos! Continua o bom trabalho!`,
        relatedId: photo._id,
        relatedModel: 'Photo'
      });
    } else {
      // === REJECT WITH PUNISHMENT ===
      photo.status = 'rejected';
      photo.validatedBy = req.user._id;
      photo.validatedAt = new Date();
      photo.rejectionReason = rejectionReason || 'Foto rejeitada pelo pai/mãe. A atividade não parece ser legítima.';
      photo.pointsAwarded = 0;

      // Deduct points (punishment) - minimum 0
      const previousPoints = student.totalPoints;
      student.totalPoints = Math.max(0, student.totalPoints - punishmentPoints);

      // Reset streak
      student.currentStreak = 0;

      await student.save();

      // Record point deduction
      const actualDeduction = previousPoints - student.totalPoints;
      if (actualDeduction > 0) {
        await Points.create({
          user: uploaderId,
          source: 'deducao',
          section: 'fora_escola',
          points: actualDeduction,
          description: `Punição: Foto rejeitada pelo pai/mãe. -${actualDeduction} pontos`,
          awardedBy: req.user._id
        });
      }

      // Notify student - REJECTED + PUNISHMENT
      await Notification.create({
        recipient: uploaderId,
        sender: req.user._id,
        type: 'activity_rejected',
        title: 'Foto Rejeitada ⚠️',
        message: `O teu pai/mãe rejeitou a tua foto. Motivo: ${photo.rejectionReason}. Perdeste ${actualDeduction} pontos e o teu streak foi reiniciado a 0. Tenta fazer uma atividade real e enviar uma foto autêntica!`,
        relatedId: photo._id,
        relatedModel: 'Photo'
      });

      // Also create a punishment notification
      await Notification.create({
        recipient: uploaderId,
        sender: req.user._id,
        type: 'punishment',
        title: 'Punição Aplicada 😔',
        message: `Devido à rejeição da foto, perdeste ${actualDeduction} pontos e o teu streak de ${previousPoints > 0 ? 'atividades' : 'dias'} foi reiniciado. Envia fotos reais das tuas atividades para ganhar pontos!`,
        relatedId: photo._id,
        relatedModel: 'Photo'
      });
    }

    await photo.save();

    res.json({
      success: true,
      data: {
        photoId: photo._id,
        status: photo.status,
        pointsAwarded: photo.pointsAwarded,
        rejectionReason: photo.rejectionReason
      },
      message: approved ? 'Foto aprovada com sucesso!' : 'Foto rejeitada. Aluno notificado com punição.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
