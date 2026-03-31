const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload, cloudinary } = require('../middleware/upload');
const Photo = require('../models/Photo');
const path = require('path');

// @route   POST /api/photos/upload
// @desc    Upload and save photo to Cloudinary
router.post('/upload', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Nenhuma foto enviada' });
    }

    const { activityId } = req.body;

    // Cloudinary result is in req.file
    const photoUrl = req.file.path; // Cloudinary URL
    const publicId = req.file.filename; // Cloudinary public_id

    // Create photo record
    const photo = await Photo.create({
      uploadedBy: req.user._id,
      activity: activityId || null,
      originalName: req.file.originalname,
      filePath: photoUrl,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      publicId: publicId,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: {
        id: photo._id,
        filePath: photo.filePath,
        status: photo.status,
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
