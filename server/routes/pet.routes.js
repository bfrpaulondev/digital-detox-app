const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Pet = require('../models/Pet');
const Points = require('../models/Points');

// @route   POST /api/pets
// @desc    Create a new pet
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { species, name } = req.body;

    if (!species || !name) {
      return res.status(400).json({ success: false, message: 'Espécie e nome são obrigatórios' });
    }

    // Check if user already has a pet
    const existingPet = await Pet.findOne({ owner: req.user._id });
    if (existingPet) {
      return res.status(400).json({ success: false, message: 'Já tem um animal virtual' });
    }

    const pet = await Pet.create({
      owner: req.user._id,
      species,
      name
    });

    res.status(201).json({ success: true, data: pet, message: 'Animal virtual adotado!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/pets/my
// @desc    Get user's pet
router.get('/my', protect, authorize('student', 'parent'), async (req, res) => {
  try {
    let pet;
    if (req.user.role === 'student') {
      pet = await Pet.findOne({ owner: req.user._id });
    } else {
      // Parent can view children's pets
      const childId = req.query.childId;
      if (childId && req.user.linkedChildren.includes(childId)) {
        pet = await Pet.findOne({ owner: childId });
      }
    }

    if (!pet) {
      return res.status(404).json({ success: false, message: 'Nenhum animal virtual encontrado' });
    }

    res.json({ success: true, data: pet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/pets/feed
// @desc    Feed the pet using points
router.put('/feed', protect, authorize('student'), async (req, res) => {
  try {
    const { points } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({ success: false, message: 'Pontos inválidos' });
    }

    if (points > req.user.totalPoints) {
      return res.status(400).json({ success: false, message: 'Pontos insuficientes' });
    }

    const pet = await Pet.findOne({ owner: req.user._id });
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Animal não encontrado' });
    }

    // Feed the pet
    pet.feed(points);

    // Deduct points from user
    req.user.totalPoints -= points;
    await req.user.save();

    // Record points spent
    await Points.create({
      user: req.user._id,
      source: 'alimentacao_pet',
      section: 'pet',
      points: 0, // Already deducted
      description: `Alimentou ${pet.name} com ${points} pontos`
    });

    await pet.save();

    res.json({ success: true, data: pet, message: `${pet.name} foi alimentado!` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/pets/:id/environment
// @desc    Change pet environment
router.put('/:id/environment', protect, authorize('student'), async (req, res) => {
  try {
    const { environment } = req.body;
    const validEnvironments = ['padrao', 'floresta', 'praia', 'montanha', 'cidade'];

    if (!validEnvironments.includes(environment)) {
      return res.status(400).json({ success: false, message: 'Ambiente inválido' });
    }

    const pet = await Pet.findOne({ owner: req.user._id, _id: req.params.id });
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Animal não encontrado' });
    }

    // Check if environment is unlocked
    if (environment !== 'padrao' && !pet.unlockedEnvironments.includes(environment)) {
      return res.status(403).json({ success: false, message: 'Ambiente ainda não desbloqueado' });
    }

    pet.activeEnvironment = environment;
    await pet.save();

    res.json({ success: true, data: pet, message: 'Ambiente alterado!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
