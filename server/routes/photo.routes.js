const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { cloudinary } = require('../middleware/upload');
const Photo = require('../models/Photo');

// @route   POST /api/photos/upload
// @desc    Upload photo via base64 to Cloudinary (serverless-compatible)
router.post('/upload', protect, async (req, res) => {
  try {
    const { photo, activityId, originalName } = req.body;

    if (!photo) {
      return res.status(400).json({ success: false, message: 'Nenhuma foto enviada' });
    }

    // Upload base64 to Cloudinary
    const result = await cloudinary.uploader.upload(photo, {
      folder: 'digital-detox/photos',
      transformation: [{ width: 1024, height: 1024, crop: 'limit' }]
    });

    const photoDoc = await Photo.create({
      uploadedBy: req.user._id,
      activity: activityId || null,
      originalName: originalName || 'photo.jpg',
      filePath: result.secure_url,
      fileType: 'image/jpeg',
      fileSize: result.bytes || 0,
      publicId: result.public_id,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: {
        id: photoDoc._id,
        filePath: photoDoc.filePath,
        status: photoDoc.status,
        message: 'Foto enviada com sucesso. Pendente validação.'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/photos
// @desc    Get user's photos
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { uploadedBy: req.user._id };
    if (status) query.status = status;

    const photos = await Photo.find(query)
      .populate('activity', 'title category')
      .populate('validatedBy', 'fullName')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: photos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/photos/child/:childId
// @desc    Get photos of a specific child (parent only)
// NOTE: Must be before /:id to avoid route conflict
router.get('/child/:childId', protect, authorize('parent'), async (req, res) => {
  try {
    const childId = req.params.childId;

    // Verify this child belongs to the parent
    const isChild = req.user.linkedChildren.some(c => c.toString() === childId);
    if (!isChild) {
      return res.status(403).json({ success: false, message: 'Este filho não está vinculado à sua conta.' });
    }

    const { status } = req.query;
    const query = { uploadedBy: childId };
    if (status) query.status = status;

    const photos = await Photo.find(query)
      .populate('activity', 'title category')
      .populate('uploadedBy', 'fullName')
      .populate('validatedBy', 'fullName')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: photos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/photos/:id
// @desc    Get photo by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id)
      .populate('uploadedBy', 'fullName')
      .populate('activity', 'title category')
      .populate('validatedBy', 'fullName');

    if (!photo) {
      return res.status(404).json({ success: false, message: 'Foto não encontrada' });
    }

    res.json({ success: true, data: photo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/photos/:id
// @desc    Delete a photo from Cloudinary
router.delete('/:id', protect, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Foto não encontrada' });
    }

    if (photo.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Sem permissão' });
    }

    // Delete from Cloudinary
    if (photo.publicId) {
      try {
        await cloudinary.uploader.destroy(photo.publicId);
      } catch (e) {
        console.error('Cloudinary delete error:', e);
      }
    }

    await Photo.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Foto removida' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
