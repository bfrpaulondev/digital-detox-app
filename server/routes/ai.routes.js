const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validatePhoto, generateActivitySuggestions, validateActivity } = require('../services/aiService');
const Photo = require('../models/Photo');
const fs = require('fs');
const path = require('path');

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

    // Read photo file
    const fullPath = path.join(__dirname, '..', photo.filePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, message: 'Ficheiro da foto não encontrado' });
    }

    const fileBuffer = fs.readFileSync(fullPath);
    const base64Image = fileBuffer.toString('base64');

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
      photo.pointsAwarded = 10; // Default points for valid proof
    } else if (analysis.hasFace) {
      photo.status = 'manual_review';
      photo.rejectionReason = 'Foto contém rosto. Confirmação manual necessária.';
    } else if (!analysis.isValidActivityProof) {
      photo.status = 'rejected';
      photo.rejectionReason = analysis.feedback;
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
