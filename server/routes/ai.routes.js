const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validatePhoto, generateActivitySuggestions, validateActivity } = require('../services/aiService');
const Photo = require('../models/Photo');
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
