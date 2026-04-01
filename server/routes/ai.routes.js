const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validatePhoto, generateActivitySuggestions, validateActivity } = require('../services/aiService');
const Photo = require('../models/Photo');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Points = require('../models/Points');
const axios = require('axios');

// @route   POST /api/ai/analyze-photo
// @desc    Analyze a photo with AI (face detection, activity validation)
router.post('/analyze-photo', protect, async (req, res) => {
  try {
    const { photoId } = req.body;

    if (!photoId) {
      return res.status(400).json({ success: false, message: 'ID da foto é obrigatório' });
    }

    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Foto não encontrada' });
    }

    // Get image from Cloudinary URL
    let base64Image;
    try {
      // Download image from Cloudinary and convert to base64
      const imageResponse = await axios.get(photo.filePath, {
        responseType: 'arraybuffer',
        timeout: 10000
      });
      base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Não foi possível carregar a imagem' });
    }

    // Analyze with AI
    const analysis = await validatePhoto(base64Image);

    // Update photo record
    photo.aiAnalysis = {
      hasFace: analysis.hasFace,
      isSelfie: analysis.isSelfie,
      description: analysis.description,
      confidence: analysis.confidence,
      isValidActivityProof: analysis.isValidActivityProof,
      feedback: analysis.feedback,
      analyzedAt: new Date()
    };

    // Auto-approve or flag for manual review
    if (!analysis.hasFace && analysis.isValidActivityProof) {
      photo.status = 'approved';
      photo.pointsAwarded = 10;

      // Award points to student
      const student = await User.findById(photo.uploadedBy);
      if (student) {
        student.totalPoints += 10;
        student.currentStreak += 1;
        if (student.currentStreak > student.longestStreak) {
          student.longestStreak = student.currentStreak;
        }
        const newLevel = Math.floor(student.totalPoints / 100) + 1;
        if (newLevel > student.level) {
          student.level = newLevel;
        }
        await student.save();

        await Points.create({
          user: photo.uploadedBy,
          source: 'atividade',
          activity: photo.activity,
          section: 'fora_escola',
          points: 10,
          description: 'Foto aprovada pela IA automaticamente'
        });
      }

      // Notify student - auto approved
      await Notification.create({
        recipient: photo.uploadedBy,
        type: 'activity_validated',
        title: 'Foto Aprovada pela IA! 🎉',
        message: `A IA validou a tua foto de atividade automaticamente. Ganhou 10 pontos!`,
        relatedId: photo._id,
        relatedModel: 'Photo'
      });

    } else if (analysis.hasFace) {
      photo.status = 'manual_review';
      photo.rejectionReason = 'Foto contém rosto. Confirmação manual necessária.';

      // Notify student - sent for parent review
      await Notification.create({
        recipient: photo.uploadedBy,
        type: 'parent_alert',
        title: 'Foto em Revisão 👀',
        message: 'A tua foto foi enviada para revisão do pai/mãe porque contém um rosto. Aguarda a validação!',
        relatedId: photo._id,
        relatedModel: 'Photo'
      });

    } else if (!analysis.isValidActivityProof) {
      photo.status = 'rejected';
      photo.rejectionReason = analysis.feedback || 'A IA determinou que esta foto não é uma prova válida de atividade.';

      // Notify student - AI rejected
      await Notification.create({
        recipient: photo.uploadedBy,
        type: 'activity_rejected',
        title: 'Foto Rejeitada pela IA ⚠️',
        message: `A IA rejeitou a tua foto. Motivo: ${analysis.feedback}. Tenta enviar uma foto que mostre uma atividade real ao ar livre!`,
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
        analysis: photo.aiAnalysis,
        rejectionReason: photo.rejectionReason,
        pointsAwarded: photo.pointsAwarded
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/ai/suggestions
// @desc    Get AI-generated activity suggestions
router.post('/suggestions', protect, async (req, res) => {
  try {
    const { preferences, context } = req.body;

    const userPreferences = preferences || req.user.activityPreferences || [];
    const userContext = {
      age: req.user.age,
      ...context
    };

    if (userPreferences.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Defina as suas preferências de atividades primeiro' 
      });
    }

    const suggestions = await generateActivitySuggestions(userPreferences, userContext);

    res.json({ success: true, data: suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/ai/validate-activity
// @desc    Validate an activity with AI
router.post('/validate-activity', protect, async (req, res) => {
  try {
    const validation = await validateActivity(req.body);

    res.json({ success: true, data: validation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
