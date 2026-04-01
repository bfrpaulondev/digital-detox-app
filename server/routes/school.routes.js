const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const School = require('../models/School');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @route   GET /api/schools
// @desc    Get all schools (public - needed for registration)
router.get('/', async (req, res) => {
  try {
    const { city } = req.query;
    const query = { isActive: true };
    if (city) query.city = new RegExp(city, 'i');
    const schools = await School.find(query).sort({ name: 1 });
    res.json({ success: true, data: schools });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/schools/cities
// @desc    Get list of cities with schools
router.get('/cities', async (req, res) => {
  try {
    const cities = await School.distinct('city', { isActive: true });
    res.json({ success: true, data: cities.sort() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/schools/:id
// @desc    Get school by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ success: false, message: 'Escola não encontrada' });
    }
    // Include teacher count and pending changes
    const teacherCount = await User.countDocuments({ school: req.params.id, role: 'teacher', isActive: true });
    const result = school.toObject();
    result.teacherCount = teacherCount;
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/schools/:id/schedule
// @desc    Get school schedule for a specific class
router.get('/:id/schedule', protect, async (req, res) => {
  try {
    const { grade, className } = req.query;
    const school = await School.findById(req.params.id);

    if (!school) {
      return res.status(404).json({ success: false, message: 'Escola não encontrada' });
    }

    let schedule = school.classSchedule;
    if (grade) schedule = schedule.filter(s => s.grade === grade);
    if (className) schedule = schedule.filter(s => s.className === className);

    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/schools/:id/students
// @desc    Get students in a school
router.get('/:id/students', protect, authorize('teacher'), async (req, res) => {
  try {
    const { grade } = req.query;
    const query = { school: req.params.id, role: 'student', isActive: true };
    if (grade) query.grade = grade;

    const students = await User.find(query)
      .select('fullName studentNumber grade totalPoints')
      .sort({ fullName: 1 });

    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/schools/:id/pending-changes
// @desc    Get pending changes for a school (teachers only)
router.get('/:id/pending-changes', protect, authorize('teacher'), async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ success: false, message: 'Escola não encontrada' });
    }

    if (!school.pendingChanges || !school.pendingChanges.type) {
      return res.json({ success: true, data: null });
    }

    // Get voter details
    const votesWithDetails = await Promise.all(
      (school.pendingChanges.votes || []).map(async (v) => {
        const teacher = await User.findById(v.teacher).select('fullName');
        return {
          teacherId: v.teacher,
          teacherName: teacher?.fullName || 'Professor',
          votedAt: v.votedAt
        };
      })
    );

    res.json({
      success: true,
      data: {
        ...school.pendingChanges.toObject(),
        votes: votesWithDetails,
        neededVotes: 3,
        currentVotes: votesWithDetails.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/schools
// @desc    Create a new school (teacher only)
router.post('/', protect, authorize('teacher'), async (req, res) => {
  try {
    const { name, code, city, address, levels } = req.body;

    if (!name || !code || !city) {
      return res.status(400).json({ success: false, message: 'Nome, código e cidade são obrigatórios.' });
    }

    // Check if code already exists
    const existingSchool = await School.findOne({ code: code.toUpperCase() });
    if (existingSchool) {
      return res.status(400).json({ success: false, message: 'Já existe uma escola com esse código.' });
    }

    const school = await School.create({
      name,
      code: code.toUpperCase(),
      city,
      address: address || '',
      levels: levels || []
    });

    res.status(201).json({ success: true, data: school, message: 'Escola criada com sucesso!' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Já existe uma escola com esse código.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/schools/:id
// @desc    Request edit or vote on edit (teacher only - needs 3 votes)
router.put('/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ success: false, message: 'Escola não encontrada' });
    }

    // Verify teacher belongs to this school
    if (req.user.school?.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Apenas professores desta escola podem editar.' });
    }

    // Check if there's already a pending edit
    if (school.pendingChanges && school.pendingChanges.type === 'edit') {
      // Check if teacher already voted
      const alreadyVoted = school.pendingChanges.votes.some(
        v => v.teacher.toString() === req.user._id.toString()
      );
      if (alreadyVoted) {
        return res.status(400).json({ success: false, message: 'Já votaste nesta alteração.' });
      }

      // Check if the proposed data is the same
      const isSameChange = JSON.stringify(req.body) === JSON.stringify(school.pendingChanges.proposedData);
      if (!isSameChange) {
        return res.status(400).json({
          success: false,
          message: 'Já existe uma alteração pendente diferente. Aguarda que seja resolvida ou vota nela.'
        });
      }

      // Add vote
      school.pendingChanges.votes.push({ teacher: req.user._id });

      // Check if reached 3 votes
      if (school.pendingChanges.votes.length >= 3) {
        // Apply changes
        const changes = school.pendingChanges.proposedData;
        if (changes.name) school.name = changes.name;
        if (changes.city) school.city = changes.city;
        if (changes.address !== undefined) school.address = changes.address;
        if (changes.levels) school.levels = changes.levels;
        school.pendingChanges = undefined;

        await school.save();

        // Notify all teachers of the school
        const teachers = await User.find({ school: school._id, role: 'teacher', isActive: true });
        await Notification.insertMany(
          teachers
            .filter(t => t._id.toString() !== req.user._id.toString())
            .map(t => ({
              recipient: t._id,
              sender: req.user._id,
              type: 'school_alert',
              title: 'Escola Atualizada',
              message: `A escola "${school.name}" foi atualizada com sucesso (3 votos alcançados).`,
              relatedId: school._id,
              relatedModel: 'School'
            }))
        );

        return res.json({ success: true, data: school, message: 'Alteração aprovada com 3 votos! Escola atualizada.' });
      }

      await school.save();
      const remaining = 3 - school.pendingChanges.votes.length;
      return res.json({
        success: true,
        data: school,
        message: `Voto registado! Faltam ${remaining} voto(s) para aprovar a alteração.`,
        votesCount: school.pendingChanges.votes.length
      });
    }

    // No pending edit - create a new proposal
    const { name, city, address, levels } = req.body;
    const proposedData = {};
    if (name) proposedData.name = name;
    if (city) proposedData.city = city;
    if (address !== undefined) proposedData.address = address;
    if (levels) proposedData.levels = levels;

    school.pendingChanges = {
      type: 'edit',
      proposedData,
      votes: [{ teacher: req.user._id }],
      createdAt: new Date()
    };

    await school.save();

    // Notify other teachers
    const teachers = await User.find({ school: school._id, role: 'teacher', isActive: true });
    await Notification.insertMany(
      teachers
        .filter(t => t._id.toString() !== req.user._id.toString())
        .map(t => ({
          recipient: t._id,
          sender: req.user._id,
          type: 'school_alert',
          title: 'Proposta de Alteração na Escola',
          message: `O professor ${req.user.fullName} propôs alterações na escola "${school.name}". Vota na secção Escolas.`,
          relatedId: school._id,
          relatedModel: 'School'
        }))
    );

    res.json({
      success: true,
      data: school,
      message: 'Proposta de alteração criada! Precisa de mais 2 votos de outros professores.',
      votesCount: 1
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/schools/:id/vote-delete
// @desc    Vote to delete a school (teacher only - needs 3 votes)
router.post('/:id/vote-delete', protect, authorize('teacher'), async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ success: false, message: 'Escola não encontrada' });
    }

    if (req.user.school?.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Apenas professores desta escola podem votar.' });
    }

    // Check if there's already a pending delete
    if (school.pendingChanges && school.pendingChanges.type === 'edit') {
      return res.status(400).json({ success: false, message: 'Já existe uma alteração pendente. Resolve-a primeiro.' });
    }

    if (!school.pendingChanges || school.pendingChanges.type !== 'delete') {
      // Create new delete proposal
      school.pendingChanges = {
        type: 'delete',
        proposedData: {},
        votes: [{ teacher: req.user._id }],
        createdAt: new Date()
      };

      await school.save();

      const teachers = await User.find({ school: school._id, role: 'teacher', isActive: true });
      await Notification.insertMany(
        teachers
          .filter(t => t._id.toString() !== req.user._id.toString())
          .map(t => ({
            recipient: t._id,
            sender: req.user._id,
            type: 'school_alert',
            title: 'Proposta de Eliminação da Escola',
            message: `O professor ${req.user.fullName} propôs a eliminação da escola "${school.name}". Vota na secção Escolas.`,
            relatedId: school._id,
            relatedModel: 'School'
          }))
      );

      return res.json({
        success: true,
        data: school,
        message: 'Proposta de eliminação criada! Precisa de mais 2 votos.',
        votesCount: 1
      });
    }

    // Add vote to existing delete proposal
    const alreadyVoted = school.pendingChanges.votes.some(
      v => v.teacher.toString() === req.user._id.toString()
    );
    if (alreadyVoted) {
      return res.status(400).json({ success: false, message: 'Já votaste nesta proposta.' });
    }

    school.pendingChanges.votes.push({ teacher: req.user._id });

    if (school.pendingChanges.votes.length >= 3) {
      // Delete (deactivate) the school
      school.isActive = false;
      school.pendingChanges = undefined;
      await school.save();

      const teachers = await User.find({ school: school._id, role: 'teacher', isActive: true });
      const students = await User.find({ school: school._id, role: 'student', isActive: true });

      const notifications = [
        ...teachers.map(t => ({
          recipient: t._id,
          type: 'school_alert',
          title: 'Escola Eliminada',
          message: `A escola "${school.name}" foi eliminada por votação.`,
          relatedId: school._id,
          relatedModel: 'School'
        })),
        ...students.map(s => ({
          recipient: s._id,
          type: 'school_alert',
          title: 'Escola Eliminada',
          message: `A escola "${school.name}" foi eliminada. Contacta o teu professor.`,
          relatedId: school._id,
          relatedModel: 'School'
        }))
      ];
      await Notification.insertMany(notifications);

      return res.json({ success: true, message: 'Escola eliminada com 3 votos!' });
    }

    await school.save();
    const remaining = 3 - school.pendingChanges.votes.length;
    res.json({
      success: true,
      data: school,
      message: `Voto registado! Faltam ${remaining} voto(s) para eliminar.`,
      votesCount: school.pendingChanges.votes.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/schools/:id/cancel-pending
// @desc    Cancel a pending change proposal
router.post('/:id/cancel-pending', protect, authorize('teacher'), async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ success: false, message: 'Escola não encontrada' });
    }

    if (!school.pendingChanges || !school.pendingChanges.type) {
      return res.status(400).json({ success: false, message: 'Nenhuma alteração pendente.' });
    }

    // Only the proposer or any voter can cancel
    const isProposer = school.pendingChanges.votes[0]?.teacher.toString() === req.user._id.toString();
    const isVoter = school.pendingChanges.votes.some(v => v.teacher.toString() === req.user._id.toString());
    if (!isProposer && !isVoter) {
      return res.status(403).json({ success: false, message: 'Sem permissão para cancelar.' });
    }

    school.pendingChanges = undefined;
    await school.save();

    res.json({ success: true, message: 'Proposta cancelada.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
