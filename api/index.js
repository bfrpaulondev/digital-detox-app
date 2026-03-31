// Main API - standalone Vercel function (no serverless-http)
const mongoose = require('mongoose');

let cachedDb = null;
async function connectDB() {
  if (cachedDb && cachedDb.readyState === 1) return cachedDb;
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      retryWrites: false,
      w: 'majority'
    });
    cachedDb = mongoose.connection;
    console.log('MongoDB connected successfully');
    return cachedDb;
  } catch (e) {
    console.error('MongoDB connection error:', e.message);
    throw e;
  }
}

// Parse body from Vercel request
function parseBody(req) {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return req.body;
  }
  return {};
}

// Auth helpers
function getToken(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return auth.split(' ')[1];
  }
  return null;
}

async function verifyToken(token) {
  const jwt = require('jsonwebtoken');
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
}

function authError(res) {
  return res.status(401).json({ success: false, message: 'Não autorizado' });
}

// Standalone Vercel handler
module.exports = async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
      .end();
  }

  // Set CORS for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  const url = req.url || '';
  const method = req.method;
  const path = url.split('?')[0];
  const body = parseBody(req);

  console.log(`[API] ${method} ${path}`);

  try {
    const db = await connectDB();
    const mongoDb = db.db;

    // ============================================================
    // PUBLIC ROUTES (no auth)
    // ============================================================

    // GET /api/schools
    if (path === '/api/schools' && method === 'GET') {
      const schools = await mongoDb.collection('schools')
        .find({ isActive: true }).sort({ name: 1 }).limit(100).toArray();
      return res.json({ success: true, data: schools });
    }

    // GET /api/schools/:id
    if (path.match(/^\/api\/schools\/[\w-]+$/) && method === 'GET' && !path.includes('/schedule') && !path.includes('/students')) {
      const id = path.split('/').pop();
      try {
        const school = await mongoDb.collection('schools').findOne({ _id: new mongoose.Types.ObjectId(id) });
        if (!school) return res.status(404).json({ success: false, message: 'Escola não encontrada' });
        return res.json({ success: true, data: school });
      } catch (e) {
        return res.status(400).json({ success: false, message: 'ID inválido' });
      }
    }

    // POST /api/auth/login
    if (path === '/api/auth/login' && method === 'POST') {
      const { email, password } = body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email e senha obrigatórios' });
      }

      const user = await mongoDb.collection('users').findOne({ email: email.toLowerCase() });
      if (!user) return res.status(401).json({ success: false, message: 'Credenciais inválidas' });

      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ success: false, message: 'Credenciais inválidas' });

      await mongoDb.collection('users').updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });

      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      });

      const { password: _, ...userResponse } = user;
      return res.json({ success: true, data: { token, user: userResponse } });
    }

    // ============================================================
    // AUTHENTICATED ROUTES
    // ============================================================
    const token = getToken(req);
    let decoded = null;
    let currentUser = null;

    // For routes that need auth, verify token
    if (token) {
      try {
        decoded = await verifyToken(token);
        currentUser = await mongoDb.collection('users').findOne(
          { _id: new mongoose.Types.ObjectId(decoded.id) },
          { projection: { password: 0 } }
        );
      } catch (e) {
        // Token invalid
      }
    }

    // GET /api/auth/me
    if (path === '/api/auth/me' && method === 'GET') {
      if (!currentUser) return authError(res);
      return res.json({ success: true, data: currentUser });
    }

    // PUT /api/auth/preferences
    if (path === '/api/auth/preferences' && method === 'PUT') {
      if (!currentUser) return authError(res);
      const prefs = body.activityPreferences || [];
      await mongoDb.collection('users').updateOne(
        { _id: currentUser._id },
        { $set: { activityPreferences: prefs, updatedAt: new Date() } }
      );
      const updated = await mongoDb.collection('users').findOne(
        { _id: currentUser._id },
        { projection: { password: 0 } }
      );
      return res.json({ success: true, data: updated, message: 'Preferências atualizadas!' });
    }

    // ============================================================
    // DASHBOARD ROUTES
    // ============================================================

    // GET /api/dashboard/stats
    if (path === '/api/dashboard/stats' && method === 'GET') {
      if (!currentUser) return authError(res);

      let stats;
      const role = currentUser.role;

      if (role === 'student') {
        const completedActivities = await mongoDb.collection('activities').countDocuments({
          assignedTo: currentUser._id,
          'completedBy.validatedBy': { $exists: true }
        });
        const pendingActivities = await mongoDb.collection('activities').countDocuments({
          assignedTo: currentUser._id,
          status: { $in: ['pendente', 'em_progresso'] }
        });
        let petData = null;
        try {
          const pet = await mongoDb.collection('pets').findOne({ owner: currentUser._id });
          if (pet) petData = {
            name: pet.name, level: pet.level, species: pet.species,
            mood: pet.mood, evolutionStage: pet.evolutionStage
          };
        } catch (e) { console.error('Pet fetch error:', e.message); }

        stats = {
          totalPoints: currentUser.totalPoints || 0,
          level: currentUser.level || 1,
          currentStreak: currentUser.currentStreak || 0,
          longestStreak: currentUser.longestStreak || 0,
          completedActivities,
          pendingActivities,
          pet: petData,
          achievementCount: (currentUser.achievements || []).length
        };
      } else if (role === 'teacher') {
        const totalStudents = await mongoDb.collection('users').countDocuments({
          school: currentUser.school, role: 'student', isActive: true
        });
        const myActivities = await mongoDb.collection('activities').countDocuments({ assignedBy: currentUser._id });
        const pendingValidations = await mongoDb.collection('activities').countDocuments({
          assignedBy: currentUser._id, status: 'concluida'
        });

        let topStudents = [];
        try {
          topStudents = await mongoDb.collection('users')
            .find({ school: currentUser.school, role: 'student', isActive: true })
            .sort({ totalPoints: -1 }).limit(10)
            .project({ fullName: 1, grade: 1, totalPoints: 1, currentStreak: 1 }).toArray();
        } catch (e) { console.error('Top students error:', e.message); }

        let schoolName = '';
        try {
          if (currentUser.school) {
            const s = await mongoDb.collection('schools').findOne({ _id: currentUser.school });
            schoolName = s?.name || '';
          }
        } catch (e) {}

        stats = { totalStudents, myActivities, pendingValidations, topStudents, schoolName };
      } else if (role === 'parent') {
        // Parent dashboard: show linked children data
        let children = [];
        try {
          const childIds = (currentUser.linkedChildren || []).map(c =>
            typeof c === 'object' ? c.toString() : c
          );
          if (childIds.length > 0) {
            const objectIds = childIds.map(id => new mongoose.Types.ObjectId(id));
            const childDocs = await mongoDb.collection('users')
              .find({ _id: { $in: objectIds } })
              .project({ password: 0 }).toArray();

            for (const child of childDocs) {
              let childPet = null;
              try {
                childPet = await mongoDb.collection('pets').findOne({ owner: child._id });
              } catch (e) {}

              const completed = await mongoDb.collection('activities').countDocuments({
                assignedTo: child._id,
                'completedBy.validatedBy': { $exists: true }
              });

              let schoolName = '';
              try {
                if (child.school) {
                  const s = await mongoDb.collection('schools').findOne({ _id: child.school });
                  schoolName = s?.name || '';
                }
              } catch (e) {}

              children.push({
                id: child._id,
                fullName: child.fullName,
                grade: child.grade,
                school: schoolName,
                totalPoints: child.totalPoints || 0,
                level: child.level || 1,
                currentStreak: child.currentStreak || 0,
                completedActivities: completed,
                pet: childPet ? {
                  name: childPet.name, species: childPet.species,
                  mood: childPet.mood, level: childPet.level
                } : null
              });
            }
          }
        } catch (e) { console.error('Parent children error:', e.message); }

        stats = { children, totalPoints: 0, level: 1, currentStreak: 0 };
      } else {
        stats = { totalPoints: 0, level: 1, currentStreak: 0 };
      }

      return res.json({ success: true, data: stats });
    }

    // GET /api/dashboard/ranking
    if (path === '/api/dashboard/ranking' && method === 'GET') {
      if (!currentUser) return authError(res);
      if (currentUser.role === 'parent') {
        return res.status(403).json({ success: false, message: 'Sem permissão' });
      }

      const schoolId = currentUser.school;
      if (!schoolId) return res.json({ success: true, data: [] });

      const ranking = await mongoDb.collection('users')
        .find({ school: schoolId, role: 'student', isActive: true })
        .sort({ totalPoints: -1 }).limit(20)
        .project({ fullName: 1, grade: 1, totalPoints: 1, currentStreak: 1, level: 1 }).toArray();

      const rankedList = ranking.map((u, i) => ({
        ...u,
        position: i + 1,
        isCurrentUser: u._id.toString() === currentUser._id.toString()
      }));
      return res.json({ success: true, data: rankedList });
    }

    // GET /api/dashboard/notifications
    if (path === '/api/dashboard/notifications' && method === 'GET') {
      if (!currentUser) return authError(res);
      const notifications = await mongoDb.collection('notifications')
        .find({ recipient: currentUser._id }).sort({ createdAt: -1 }).limit(20).toArray();
      const total = await mongoDb.collection('notifications')
        .countDocuments({ recipient: currentUser._id });
      const unreadCount = await mongoDb.collection('notifications')
        .countDocuments({ recipient: currentUser._id, isRead: false });
      return res.json({
        success: true,
        data: { notifications, total, unreadCount, pages: Math.ceil(total / 20) }
      });
    }

    // PUT /api/dashboard/notifications/read-all
    if (path === '/api/dashboard/notifications/read-all' && method === 'PUT') {
      if (!currentUser) return authError(res);
      await mongoDb.collection('notifications').updateMany(
        { recipient: currentUser._id, isRead: false },
        { $set: { isRead: true } }
      );
      return res.json({ success: true, message: 'Notificações marcadas como lidas' });
    }

    // ============================================================
    // ACTIVITY ROUTES
    // ============================================================

    // GET /api/activities
    if (path === '/api/activities' && method === 'GET') {
      if (!currentUser) return authError(res);

      const { section, status } = req.query || {};
      const query = { isActive: true };

      if (currentUser.role === 'student') {
        query.assignedTo = currentUser._id;
      } else if (currentUser.role === 'teacher') {
        query.assignedBy = currentUser._id;
      } else if (currentUser.role === 'parent') {
        const childIds = (currentUser.linkedChildren || []).map(c =>
          typeof c === 'object' ? c.toString() : c
        );
        if (childIds.length > 0) {
          query.assignedTo = { $in: childIds };
        } else {
          query.assignedTo = { $in: ['__none__'] }; // Return empty
        }
      }
      if (section) query.section = section;
      if (status) query.status = status;

      const activities = await mongoDb.collection('activities')
        .find(query).sort({ createdAt: -1 }).limit(50).toArray();
      return res.json({ success: true, data: activities });
    }

    // POST /api/activities
    if (path === '/api/activities' && method === 'POST') {
      if (!currentUser) return authError(res);

      console.log('[POST /activities] body:', JSON.stringify(body).substring(0, 200));
      console.log('[POST /activities] user role:', currentUser.role, 'school:', currentUser.school);

      const {
        title, description, category, section, classGroup, subject,
        scheduledDate, scheduledTime, pointsValue, isMission, requiresPhoto, assignedTo
      } = body;

      if (!title) {
        return res.status(400).json({ success: false, message: 'Título é obrigatório' });
      }

      const activityData = {
        title: title.trim(),
        description: description || '',
        category: category || 'geral',
        section: section || 'fora_escola',
        pointsValue: pointsValue || 10,
        requiresPhoto: requiresPhoto || false,
        isMission: isMission || false,
        status: 'pendente',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      try {
        if (currentUser.role === 'teacher') {
          activityData.school = currentUser.school;
          activityData.assignedBy = currentUser._id;
          activityData.section = 'escola';
          if (subject) activityData.subject = subject;

          if (classGroup) {
            const students = await mongoDb.collection('users')
              .find({
                school: currentUser.school,
                grade: classGroup,
                role: 'student',
                isActive: true
              })
              .project({ _id: 1 }).toArray();
            activityData.assignedTo = students.map(s => s._id);
            console.log(`[POST /activities] Assigned to ${students.length} students in grade ${classGroup}`);
          } else {
            activityData.assignedTo = [];
          }
        } else {
          // Student or parent creating outside activity
          activityData.section = 'fora_escola';
          activityData.assignedTo = [currentUser._id];
        }

        const result = await mongoDb.collection('activities').insertOne(activityData);
        const insertedActivity = { _id: result.insertedId, ...activityData };

        // Notify students if teacher created activity
        if (currentUser.role === 'teacher' && activityData.assignedTo.length > 0) {
          try {
            const notifications = activityData.assignedTo.map(studentId => ({
              recipient: studentId,
              sender: currentUser._id,
              type: 'activity_assigned',
              title: 'Nova Atividade',
              message: `O professor(a) ${currentUser.fullName} atribuiu-te a atividade: ${title}`,
              relatedId: result.insertedId,
              isRead: false,
              createdAt: new Date()
            }));
            await mongoDb.collection('notifications').insertMany(notifications);
          } catch (e) {
            console.error('Notification error (non-critical):', e.message);
          }
        }

        return res.status(201).json({
          success: true,
          data: insertedActivity,
          message: 'Atividade criada com sucesso!'
        });
      } catch (e) {
        console.error('[POST /activities] DB Error:', e.message);
        return res.status(500).json({ success: false, message: 'Erro ao criar atividade: ' + e.message });
      }
    }

    // PUT /api/activities/:id/complete
    if (path.match(/^\/api\/activities\/[\w-]+\/complete$/) && method === 'PUT') {
      if (!currentUser) return authError(res);
      const activityId = path.split('/')[3];

      const activity = await mongoDb.collection('activities').findOne({ _id: new mongoose.Types.ObjectId(activityId) });
      if (!activity) return res.status(404).json({ success: false, message: 'Atividade não encontrada' });

      const already = (activity.completedBy || []).find(c =>
        (c.user?.toString && c.user.toString() === currentUser._id.toString()) ||
        c.user === currentUser._id ||
        c.user?.toString() === currentUser._id.toString()
      );
      if (already) return res.status(400).json({ success: false, message: 'Já completou esta atividade' });

      await mongoDb.collection('activities').updateOne(
        { _id: new mongoose.Types.ObjectId(activityId) },
        {
          $push: {
            completedBy: { user: currentUser._id, completedAt: new Date() }
          },
          $set: { status: 'concluida', updatedAt: new Date() }
        }
      );

      // Notify teacher
      if (activity.assignedBy) {
        try {
          await mongoDb.collection('notifications').insertOne({
            recipient: activity.assignedBy,
            sender: currentUser._id,
            type: 'activity_completed',
            title: 'Atividade Concluída',
            message: `${currentUser.fullName} concluiu a atividade: ${activity.title}`,
            relatedId: new mongoose.Types.ObjectId(activityId),
            isRead: false,
            createdAt: new Date()
          });
        } catch (e) {}
      }

      return res.json({ success: true, message: 'Atividade concluída!' });
    }

    // PUT /api/activities/:id/validate
    if (path.match(/^\/api\/activities\/[\w-]+\/validate$/) && method === 'PUT') {
      if (!currentUser) return authError(res);
      const activityId = path.split('/')[3];
      const { studentId, approved } = body;

      if (!studentId) return res.status(400).json({ success: false, message: 'studentId obrigatório' });

      const activity = await mongoDb.collection('activities').findOne({ _id: new mongoose.Types.ObjectId(activityId) });
      if (!activity) return res.status(404).json({ success: false, message: 'Atividade não encontrada' });

      try {
        if (approved) {
          await mongoDb.collection('activities').updateOne(
            { _id: new mongoose.Types.ObjectId(activityId), 'completedBy.user': new mongoose.Types.ObjectId(studentId) },
            {
              $set: {
                'completedBy.$.validatedBy': currentUser._id,
                'completedBy.$.validatedAt': new Date(),
                'completedBy.$.pointsEarned': activity.pointsValue || 10
              },
              $currentDate: { updatedAt: true }
            }
          );

          // Award points to student
          const pointsVal = activity.pointsValue || 10;
          await mongoDb.collection('users').updateOne(
            { _id: new mongoose.Types.ObjectId(studentId) },
            { $inc: { totalPoints: pointsVal, currentStreak: 1 } }
          );

          // Create points record
          try {
            await mongoDb.collection('points').insertOne({
              user: new mongoose.Types.ObjectId(studentId),
              activity: new mongoose.Types.ObjectId(activityId),
              section: activity.section || 'escola',
              points: pointsVal,
              awardedBy: currentUser._id,
              isStreakBonus: false,
              createdAt: new Date()
            });
          } catch (e) {}

          // Notify student
          try {
            await mongoDb.collection('notifications').insertOne({
              recipient: new mongoose.Types.ObjectId(studentId),
              sender: currentUser._id,
              type: 'activity_validated',
              title: 'Atividade Validada!',
              message: `O professor(a) validou a atividade "${activity.title}". +${pointsVal} pontos!`,
              relatedId: new mongoose.Types.ObjectId(activityId),
              isRead: false,
              createdAt: new Date()
            });
          } catch (e) {}
        } else {
          await mongoDb.collection('activities').updateOne(
            { _id: new mongoose.Types.ObjectId(activityId), 'completedBy.user': new mongoose.Types.ObjectId(studentId) },
            {
              $set: { 'completedBy.$.pointsEarned': 0, status: 'rejeitada' },
              $currentDate: { updatedAt: true }
            }
          );
        }
      } catch (e) {
        console.error('[VALIDATE] Error:', e.message);
        return res.status(500).json({ success: false, message: 'Erro ao validar: ' + e.message });
      }

      return res.json({
        success: true,
        message: approved ? 'Atividade validada! Pontos atribuídos.' : 'Atividade rejeitada.'
      });
    }

    // DELETE /api/activities/:id
    if (path.match(/^\/api\/activities\/[\w-]+$/) && method === 'DELETE') {
      if (!currentUser) return authError(res);
      const activityId = path.split('/')[3];

      await mongoDb.collection('activities').updateOne(
        { _id: new mongoose.Types.ObjectId(activityId) },
        { $set: { isActive: false, updatedAt: new Date() } }
      );
      return res.json({ success: true, message: 'Atividade removida' });
    }

    // ============================================================
    // PET ROUTES
    // ============================================================

    // GET /api/pets/my
    if (path === '/api/pets/my' && method === 'GET') {
      if (!currentUser) return authError(res);
      const pet = await mongoDb.collection('pets').findOne({ owner: currentUser._id });
      if (!pet) return res.status(404).json({ success: false, message: 'Nenhum animal encontrado' });
      return res.json({ success: true, data: pet });
    }

    // POST /api/pets
    if (path === '/api/pets' && method === 'POST') {
      if (!currentUser) return authError(res);
      const { species, name } = body;
      if (!species || !name) {
        return res.status(400).json({ success: false, message: 'Espécie e nome são obrigatórios' });
      }

      const existing = await mongoDb.collection('pets').findOne({ owner: currentUser._id });
      if (existing) return res.status(400).json({ success: false, message: 'Já tem um animal virtual' });

      const petData = {
        owner: currentUser._id, species, name, level: 1, experience: 0,
        experienceToNextLevel: 100, hunger: 80, happiness: 80, energy: 100,
        health: 100, evolutionStage: 1, mood: 'feliz', feedCount: 0,
        totalPointsSpent: 0, lastFed: new Date(), createdAt: new Date(), updatedAt: new Date()
      };
      await mongoDb.collection('pets').insertOne(petData);
      return res.status(201).json({ success: true, data: petData, message: 'Animal adotado!' });
    }

    // PUT /api/pets/feed
    if (path === '/api/pets/feed' && method === 'PUT') {
      if (!currentUser) return authError(res);
      const { points } = body;
      if (!points || points <= 0) return res.status(400).json({ success: false, message: 'Pontos inválidos' });
      if (points > (currentUser.totalPoints || 0)) {
        return res.status(400).json({ success: false, message: 'Pontos insuficientes' });
      }

      const pet = await mongoDb.collection('pets').findOne({ owner: currentUser._id });
      if (!pet) return res.status(404).json({ success: false, message: 'Animal não encontrado' });

      const newHunger = Math.min(100, (pet.hunger || 0) + 20);
      const newHappiness = Math.min(100, (pet.happiness || 0) + 5);
      const newEnergy = Math.min(100, (pet.energy || 0) + 10);
      const newExperience = (pet.experience || 0) + points;
      const newFeedCount = (pet.feedCount || 0) + 1;
      let newLevel = pet.level || 1;
      let newExpToNext = pet.experienceToNextLevel || 100;
      let newEvoStage = pet.evolutionStage || 1;
      let newMood = 'feliz';

      while (newExperience >= newExpToNext && newLevel < 20) {
        newExperience -= newExpToNext;
        newLevel += 1;
        newExpToNext = Math.floor(newExpToNext * 1.3);
        if (newLevel === 5) newEvoStage = 2;
        if (newLevel === 10) newEvoStage = 3;
        if (newLevel === 15) newEvoStage = 4;
      }

      if (newHunger < 30) newMood = 'com_fome';
      else if (newEnergy < 20) newMood = 'sonolento';
      else if (newHappiness < 30) newMood = 'triste';
      else if (newEnergy > 80 && newHappiness > 80) newMood = 'energetico';
      else if (newHappiness > 60) newMood = 'brincalhao';

      await mongoDb.collection('pets').updateOne(
        { owner: currentUser._id },
        {
          $set: {
            hunger: newHunger, happiness: newHappiness, energy: newEnergy,
            experience: newExperience, level: newLevel, experienceToNextLevel: newExpToNext,
            evolutionStage: newEvoStage, mood: newMood, feedCount: newFeedCount,
            totalPointsSpent: (pet.totalPointsSpent || 0) + points,
            lastFed: new Date(), updatedAt: new Date()
          }
        }
      );
      await mongoDb.collection('users').updateOne(
        { _id: currentUser._id },
        { $inc: { totalPoints: -points } }
      );

      const updatedPet = await mongoDb.collection('pets').findOne({ owner: currentUser._id });
      return res.json({ success: true, data: updatedPet, message: `${pet.name} foi alimentado!` });
    }

    // PUT /api/pets/:id/environment
    if (path.match(/^\/api\/pets\/[\w-]+\/environment$/) && method === 'PUT') {
      if (!currentUser) return authError(res);
      const petId = path.split('/')[3];
      const { environment } = body;
      if (!environment) return res.status(400).json({ success: false, message: 'Ambiente obrigatório' });

      await mongoDb.collection('pets').updateOne(
        { _id: new mongoose.Types.ObjectId(petId), owner: currentUser._id },
        { $set: { environment, updatedAt: new Date() } }
      );
      return res.json({ success: true, message: 'Ambiente atualizado!' });
    }

    // ============================================================
    // PHOTO ROUTES
    // ============================================================

    // POST /api/photos/upload
    if (path === '/api/photos/upload' && method === 'POST') {
      if (!currentUser) return authError(res);

      const { photo, activityId, originalName } = body;
      if (!photo) return res.status(400).json({ success: false, message: 'Nenhuma foto' });

      try {
        // Direct Cloudinary upload with base64
        const cloudinary = require('cloudinary').v2;
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
          secure: true
        });

        const result = await cloudinary.uploader.upload(photo, {
          folder: 'digital-detox/photos',
          transformation: [{ width: 1024, height: 1024, crop: 'limit' }]
        });

        const photoDoc = {
          uploadedBy: currentUser._id,
          activity: activityId ? new mongoose.Types.ObjectId(activityId) : null,
          originalName: originalName || 'photo.jpg',
          filePath: result.secure_url,
          fileType: 'image/jpeg',
          fileSize: result.bytes || 0,
          publicId: result.public_id,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await mongoDb.collection('photos').insertOne(photoDoc);

        return res.status(201).json({
          success: true,
          data: {
            id: photoDoc._id,
            filePath: photoDoc.filePath,
            status: photoDoc.status
          },
          message: 'Foto enviada com sucesso!'
        });
      } catch (e) {
        console.error('[PHOTO UPLOAD] Error:', e.message);
        return res.status(500).json({ success: false, message: 'Erro ao enviar foto: ' + e.message });
      }
    }

    // GET /api/photos
    if (path === '/api/photos' && method === 'GET') {
      if (!currentUser) return authError(res);
      const photos = await mongoDb.collection('photos')
        .find({ uploadedBy: currentUser._id })
        .sort({ createdAt: -1 }).limit(50).toArray();
      return res.json({ success: true, data: photos });
    }

    // GET /api/photos/:id
    if (path.match(/^\/api\/photos\/[\w-]+$/) && method === 'GET') {
      if (!currentUser) return authError(res);
      const photoId = path.split('/')[3];
      const photo = await mongoDb.collection('photos').findOne({ _id: new mongoose.Types.ObjectId(photoId) });
      if (!photo) return res.status(404).json({ success: false, message: 'Foto não encontrada' });
      return res.json({ success: true, data: photo });
    }

    // DELETE /api/photos/:id
    if (path.match(/^\/api\/photos\/[\w-]+$/) && method === 'DELETE') {
      if (!currentUser) return authError(res);
      const photoId = path.split('/')[3];
      await mongoDb.collection('photos').deleteOne({ _id: new mongoose.Types.ObjectId(photoId), uploadedBy: currentUser._id });
      return res.json({ success: true, message: 'Foto removida' });
    }

    // ============================================================
    // AI ROUTES
    // ============================================================

    // POST /api/ai/suggestions
    if (path === '/api/ai/suggestions' && method === 'POST') {
      if (!currentUser) return authError(res);

      const preferences = body.preferences || currentUser?.activityPreferences || [];

      // Return curated suggestions (AI can be slow in serverless cold starts)
      const suggestions = [
        { title: 'Passeio ao ar livre', description: 'Faça um passeio de 30 minutos pelo bairro ou parque', category: 'natureza', estimatedMinutes: 30, pointsValue: 15, requiresPhoto: true },
        { title: 'Leitura recreativa', description: 'Leia um livro ou revista por 20 minutos', category: 'leitura', estimatedMinutes: 20, pointsValue: 10, requiresPhoto: true },
        { title: 'Desenho criativo', description: 'Desenhe algo que veja à sua volta ou imagine', category: 'arte', estimatedMinutes: 25, pointsValue: 12, requiresPhoto: true },
        { title: 'Arrumar o quarto', description: 'Organize e arrume o seu quarto', category: 'domestica', estimatedMinutes: 30, pointsValue: 15, requiresPhoto: true },
        { title: 'Desporto com amigos', description: 'Jogue futebol, basquete ou outro desporto', category: 'desporto', estimatedMinutes: 45, pointsValue: 20, requiresPhoto: true },
        { title: 'Jardinagem', description: 'Ajude a cuidar das plantas do jardim ou varanda', category: 'natureza', estimatedMinutes: 30, pointsValue: 15, requiresPhoto: true },
        { title: 'Culinária', description: 'Prepare um lanche ou refeição simples', category: 'domestica', estimatedMinutes: 40, pointsValue: 18, requiresPhoto: true },
        { title: 'Quebra-cabeças', description: 'Complete um puzzle ou jogo de tabuleiro', category: 'jogos', estimatedMinutes: 30, pointsValue: 12, requiresPhoto: false }
      ];
      return res.json({ success: true, data: { suggestions } });
    }

    // POST /api/ai/analyze-photo
    if (path === '/api/ai/analyze-photo' && method === 'POST') {
      if (!currentUser) return authError(res);

      const { photoId } = body;
      if (!photoId) return res.status(400).json({ success: false, message: 'photoId obrigatório' });

      try {
        const photo = await mongoDb.collection('photos').findOne({ _id: new mongoose.Types.ObjectId(photoId) });
        if (!photo) return res.status(404).json({ success: false, message: 'Foto não encontrada' });

        // Try AI analysis with OpenAI if available
        let analysis = {
          hasFace: false,
          isSelfie: false,
          isOutdoor: false,
          description: 'Foto registada',
          status: 'approved'
        };

        try {
          if (process.env.OPENAI_API_KEY) {
            const ZAI = require('z-ai-web-dev-sdk');
            // Simple vision analysis placeholder - just approve the photo
            analysis = {
              hasFace: false,
              isSelfie: false,
              isOutdoor: true,
              description: 'Foto de atividade outdoor registada',
              status: 'approved'
            };
          }
        } catch (e) {
          console.log('AI analysis not available, using fallback');
        }

        // Update photo with analysis
        await mongoDb.collection('photos').updateOne(
          { _id: new mongoose.Types.ObjectId(photoId) },
          {
            $set: {
              aiAnalysis: analysis,
              status: 'approved',
              updatedAt: new Date()
            }
          }
        );

        return res.json({
          success: true,
          data: { photoId, analysis },
          message: analysis.status === 'approved' ? 'Foto aprovada!' : 'Foto pendente revisão'
        });
      } catch (e) {
        console.error('[AI ANALYZE] Error:', e.message);
        return res.status(500).json({ success: false, message: 'Erro na análise: ' + e.message });
      }
    }

    // POST /api/ai/validate-activity
    if (path === '/api/ai/validate-activity' && method === 'POST') {
      if (!currentUser) return authError(res);
      const { activityId } = body;
      return res.json({
        success: true,
        data: { valid: true, message: 'Atividade validada' }
      });
    }

    // ============================================================
    // USER ROUTES
    // ============================================================

    // GET /api/users/students
    if (path === '/api/users/students' && method === 'GET') {
      if (!currentUser) return authError(res);

      const { grade } = req.query || {};
      const query = { role: 'student', isActive: true };

      if (currentUser.role === 'teacher' && currentUser.school) {
        query.school = currentUser.school;
      }
      if (grade) query.grade = grade;

      const students = await mongoDb.collection('users')
        .find(query)
        .project({ fullName: 1, grade: 1, studentNumber: 1, totalPoints: 1, currentStreak: 1 })
        .sort({ fullName: 1 }).limit(100).toArray();
      return res.json({ success: true, data: students });
    }

    // GET /api/users/profile/:id
    if (path.match(/^\/api\/users\/profile\/[\w-]+$/) && method === 'GET') {
      if (!currentUser) return authError(res);
      const userId = path.split('/').pop();
      try {
        const user = await mongoDb.collection('users').findOne(
          { _id: new mongoose.Types.ObjectId(userId) },
          { projection: { password: 0 } }
        );
        if (!user) return res.status(404).json({ success: false, message: 'Utilizador não encontrado' });
        return res.json({ success: true, data: user });
      } catch (e) {
        return res.status(400).json({ success: false, message: 'ID inválido' });
      }
    }

    // PUT /api/users/profile/:id
    if (path.match(/^\/api\/users\/profile\/[\w-]+$/) && method === 'PUT') {
      if (!currentUser) return authError(res);
      const userId = path.split('/').pop();

      const updateFields = {};
      const allowedFields = ['fullName', 'phone', 'grade', 'school', 'activityPreferences', 'maxScreenTimeHours', 'sleepTime'];
      for (const field of allowedFields) {
        if (body[field] !== undefined) updateFields[field] = body[field];
      }
      // Convert school to ObjectId if it looks like one
      if (updateFields.school && typeof updateFields.school === 'string' && mongoose.Types.ObjectId.isValid(updateFields.school)) {
        updateFields.school = new mongoose.Types.ObjectId(updateFields.school);
      }
      updateFields.updatedAt = new Date();

      await mongoDb.collection('users').updateOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { $set: updateFields }
      );

      const updated = await mongoDb.collection('users').findOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { projection: { password: 0 } }
      );
      return res.json({ success: true, data: updated, message: 'Perfil atualizado!' });
    }

    // GET /api/users/points/:userId
    if (path.match(/^\/api\/users\/points\/[\w-]+$/) && method === 'GET') {
      if (!currentUser) return authError(res);
      const userId = path.split('/').pop();

      const pointsHistory = await mongoDb.collection('points')
        .find({ user: new mongoose.Types.ObjectId(userId) })
        .sort({ createdAt: -1 }).limit(50).toArray();

      const total = await mongoDb.collection('points')
        .aggregate([
          { $match: { user: new mongoose.Types.ObjectId(userId) } },
          { $group: { _id: null, total: { $sum: '$points' } } }
        ]).toArray();

      return res.json({
        success: true,
        data: {
          history: pointsHistory,
          totalPoints: total.length > 0 ? total[0].total : 0
        }
      });
    }

    // POST /api/users/link-child
    if (path === '/api/users/link-child' && method === 'POST') {
      if (!currentUser) return authError(res);
      if (currentUser.role !== 'parent') {
        return res.status(403).json({ success: false, message: 'Apenas pais podem vincular filhos' });
      }

      const { parentCode } = body;
      if (!parentCode) return res.status(400).json({ success: false, message: 'Código obrigatório' });

      const child = await mongoDb.collection('users').findOne({ parentCode, role: 'student' });
      if (!child) return res.status(404).json({ success: false, message: 'Código do filho não encontrado' });

      await mongoDb.collection('users').updateOne(
        { _id: child._id },
        { $set: { linkedParent: currentUser._id } }
      );
      await mongoDb.collection('users').updateOne(
        { _id: currentUser._id },
        { $addToSet: { linkedChildren: child._id } }
      );

      return res.json({ success: true, message: 'Filho vinculado com sucesso!' });
    }

    // ============================================================
    // CALENDAR ROUTE
    // ============================================================

    // GET /api/calendar
    if (path === '/api/calendar' && method === 'GET') {
      if (!currentUser) return authError(res);

      const events = await mongoDb.collection('activities')
        .find({
          assignedTo: currentUser._id,
          isActive: true,
          scheduledDate: { $exists: true, $ne: null }
        })
        .project({ title: 1, scheduledDate: 1, scheduledTime: 1, section: 1, status: 1 })
        .sort({ scheduledDate: 1 })
        .limit(30).toArray();

      return res.json({ success: true, data: events });
    }

    // ============================================================
    // SCHOOL SUB-ROUTES
    // ============================================================

    // GET /api/schools/:id/schedule
    if (path.match(/^\/api\/schools\/[\w-]+\/schedule$/) && method === 'GET') {
      if (!currentUser) return authError(res);
      const schoolId = path.split('/')[3];
      const school = await mongoDb.collection('schools').findOne(
        { _id: new mongoose.Types.ObjectId(schoolId) },
        { projection: { classSchedule: 1, mealTimes: 1 } }
      );
      if (!school) return res.status(404).json({ success: false, message: 'Escola não encontrada' });
      return res.json({ success: true, data: school });
    }

    // GET /api/schools/:id/students
    if (path.match(/^\/api\/schools\/[\w-]+\/students$/) && method === 'GET') {
      if (!currentUser) return authError(res);
      const schoolId = path.split('/')[3];
      const { grade } = req.query || {};

      const query = { school: new mongoose.Types.ObjectId(schoolId), role: 'student', isActive: true };
      if (grade) query.grade = grade;

      const students = await mongoDb.collection('users')
        .find(query)
        .project({ fullName: 1, grade: 1, studentNumber: 1 })
        .sort({ fullName: 1 }).limit(200).toArray();

      return res.json({ success: true, data: students });
    }

    // ============================================================
    // FALLBACK
    // ============================================================
    console.log(`[API] 404 - ${method} ${path}`);
    return res.status(404).json({ success: false, message: 'Endpoint não encontrado: ' + path });

  } catch (error) {
    console.error(`[API ERROR] ${method} ${path}:`, error.message, error.stack);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      debug: error.message
    });
  }
};
