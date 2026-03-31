// Main API - standalone Vercel function
const mongoose = require('mongoose');

let cachedDb = null;
async function connectDB() {
  if (cachedDb && cachedDb.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000
  });
  cachedDb = mongoose.connection;
}

// Standalone Vercel handler - uses raw mongoose for reliability
module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
      .end();
  }

  try {
    await connectDB();
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Erro ao ligar à base de dados' });
  }

  const url = req.url || '';
  const method = req.method;
  const path = url.split('?')[0];

  // Parse body helper
  let body = {};
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    body = req.body;
  }

  try {
    // Route: GET /api/schools (public - no auth needed)
    if (path === '/api/schools' && method === 'GET') {
      const schools = await mongoose.connection.db.collection('schools')
        .find({ isActive: true }).sort({ name: 1 }).limit(100).toArray();
      return res.json({ success: true, data: schools });
    }

    // Route: GET /api/schools/:id
    if (path.match(/^\/api\/schools\/[\w]+$/) && method === 'GET') {
      const id = path.split('/').pop();
      const { ObjectId } = mongoose.Types;
      const school = await mongoose.connection.db.collection('schools').findOne({ _id: new ObjectId(id) });
      if (!school) return res.status(404).json({ success: false, message: 'Escola não encontrada' });
      return res.json({ success: true, data: school });
    }

    // Auth helpers
    const getToken = () => {
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        return req.headers.authorization.split(' ')[1];
      }
      return null;
    };

    const verifyToken = (token) => {
      return new Promise((resolve, reject) => {
        require('jsonwebtoken').verify(token, process.env.JWT_SECRET, (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded);
        });
      });
    };

    const authError = () => res.status(401).json({ success: false, message: 'Não autorizado' });

    // Route: GET /api/dashboard/stats
    if (path === '/api/dashboard/stats' && method === 'GET') {
      const token = getToken();
      if (!token) return authError();
      const decoded = await verifyToken(token);
      const user = await mongoose.connection.db.collection('users').findOne({ _id: decoded.id });
      if (!user) return authError();

      let stats;
      if (user.role === 'student') {
        const db = mongoose.connection.db;
        const completedActivities = await db.collection('activities').countDocuments({
          'assignedTo': user._id, 'completedBy.validatedBy': { $exists: true }
        });
        const pendingActivities = await db.collection('activities').countDocuments({
          'assignedTo': user._id, status: { $in: ['pendente', 'em_progresso'] }
        });
        let petData = null;
        try {
          const pet = await db.collection('pets').findOne({ owner: user._id });
          if (pet) petData = { name: pet.name, level: pet.level, species: pet.species, mood: pet.mood, evolutionStage: pet.evolutionStage };
        } catch (e) {}
        stats = {
          totalPoints: user.totalPoints || 0, level: user.level || 1,
          currentStreak: user.currentStreak || 0, longestStreak: user.longestStreak || 0,
          completedActivities, pendingActivities, pet: petData,
          achievementCount: (user.achievements || []).length
        };
      } else if (user.role === 'teacher') {
        const db = mongoose.connection.db;
        const totalStudents = await db.collection('users').countDocuments({ school: user.school, role: 'student', isActive: true });
        const myActivities = await db.collection('activities').countDocuments({ assignedBy: user._id });
        const pendingValidations = await db.collection('activities').countDocuments({ assignedBy: user._id, status: 'concluida' });
        let topStudents = [];
        try {
          topStudents = await db.collection('users').find({ school: user.school, role: 'student', isActive: true })
            .sort({ totalPoints: -1 }).limit(10).project({ fullName: 1, grade: 1, totalPoints: 1, currentStreak: 1 }).toArray();
        } catch (e) {}
        let schoolName = '';
        try {
          if (user.school) { const s = await db.collection('schools').findOne({ _id: user.school }); schoolName = s?.name || ''; }
        } catch (e) {}
        stats = { totalStudents, myActivities, pendingValidations, topStudents, schoolName };
      } else {
        stats = { totalPoints: 0, level: 1, currentStreak: 0 };
      }
      return res.json({ success: true, data: stats });
    }

    // Route: GET /api/activities
    if (path === '/api/activities' && method === 'GET') {
      const token = getToken();
      if (!token) return authError();
      const decoded = await verifyToken(token);
      const user = await mongoose.connection.db.collection('users').findOne({ _id: decoded.id });
      if (!user) return authError();

      const { section, status } = req.query;
      const query = { isActive: true };

      if (user.role === 'student') query.assignedTo = user._id;
      else if (user.role === 'teacher') query.assignedBy = user._id;
      else if (user.role === 'parent') {
        query.assignedTo = { $in: (user.linkedChildren || []).map(c => c.toString ? c.toString() : c) };
      }
      if (section) query.section = section;
      if (status) query.status = status;

      const activities = await mongoose.connection.db.collection('activities')
        .find(query).sort({ createdAt: -1 }).limit(50).toArray();
      return res.json({ success: true, data: activities });
    }

    // Route: POST /api/activities
    if (path === '/api/activities' && method === 'POST') {
      const token = getToken();
      if (!token) return authError();
      const decoded = await verifyToken(token);
      const user = await mongoose.connection.db.collection('users').findOne({ _id: decoded.id });
      if (!user) return authError();

      const { title, description, category, section, classGroup, subject, scheduledDate, scheduledTime, pointsValue, isMission, requiresPhoto, assignedTo } = body;
      const db = mongoose.connection.db;

      const activityData = {
        title, description,
        category: category || 'escola', section: section || 'fora_escola',
        pointsValue: pointsValue || 10, requiresPhoto: requiresPhoto || false,
        isMission: isMission || false, status: 'pendente', isActive: true,
        createdAt: new Date(), updatedAt: new Date()
      };

      if (user.role === 'teacher') {
        activityData.school = user.school;
        activityData.assignedBy = user._id;
        activityData.section = 'escola';
        activityData.subject = subject;
        if (classGroup) {
          const students = await db.collection('users').find(
            { school: user.school, grade: classGroup, role: 'student', isActive: true }
          ).project({ _id: 1 }).toArray();
          activityData.assignedTo = students.map(s => s._id);
        }
      } else {
        activityData.section = 'fora_escola';
        activityData.assignedTo = [user._id];
      }

      const result = await db.collection('activities').insertOne(activityData);
      return res.status(201).json({ success: true, data: { _id: result.insertedId, ...activityData }, message: 'Atividade criada!' });
    }

    // Route: PUT /api/activities/:id/complete
    if (path.match(/^\/api\/activities\/[\w]+\/complete$/) && method === 'PUT') {
      const token = getToken();
      if (!token) return authError();
      const decoded = await verifyToken(token);
      const { ObjectId } = mongoose.Types;
      const activityId = path.split('/')[3];
      const db = mongoose.connection.db;

      const activity = await db.collection('activities').findOne({ _id: new ObjectId(activityId) });
      if (!activity) return res.status(404).json({ success: false, message: 'Atividade não encontrada' });

      const already = (activity.completedBy || []).find(c =>
        (c.user?.toString && c.user.toString() === decoded.id) || c.user === decoded.id
      );
      if (already) return res.status(400).json({ success: false, message: 'Já completou esta atividade' });

      await db.collection('activities').updateOne(
        { _id: new ObjectId(activityId) },
        { $push: { completedBy: { user: new ObjectId(decoded.id), completedAt: new Date() } }, $set: { status: 'concluida', updatedAt: new Date() } }
      );
      return res.json({ success: true, message: 'Atividade concluída!' });
    }

    // Route: PUT /api/activities/:id/validate
    if (path.match(/^\/api\/activities\/[\w]+\/validate$/) && method === 'PUT') {
      const token = getToken();
      if (!token) return authError();
      const decoded = await verifyToken(token);
      const { ObjectId } = mongoose.Types;
      const activityId = path.split('/')[3];
      const { studentId, approved } = body;
      const db = mongoose.connection.db;

      const activity = await db.collection('activities').findOne({ _id: new ObjectId(activityId) });
      if (!activity) return res.status(404).json({ success: false, message: 'Atividade não encontrada' });

      if (approved) {
        await db.collection('activities').updateOne(
          { _id: new ObjectId(activityId), 'completedBy.user': new ObjectId(studentId) },
          { $set: { 'completedBy.$.validatedBy': decoded.id, 'completedBy.$.validatedAt': new Date(), 'completedBy.$.pointsEarned': activity.pointsValue || 10 }, status: 'validada' } }
        );
        // Award points
        await db.collection('users').updateOne(
          { _id: new ObjectId(studentId) },
          { $inc: { totalPoints: activity.pointsValue || 10, currentStreak: 1 } }
        );
      } else {
        await db.collection('activities').updateOne(
          { _id: new ObjectId(activityId), 'completedBy.user': new ObjectId(studentId) },
          { $set: { 'completedBy.$.pointsEarned': 0 }, status: 'rejeitada' } }
        );
      }
      return res.json({ success: true, message: approved ? 'Atividade validada!' : 'Atividade rejeitada!' });
    }

    // Route: GET /api/pets/my
    if (path === '/api/pets/my' && method === 'GET') {
      const token = getToken();
      if (!token) return authError();
      const decoded = await verifyToken(token);
      const user = await mongoose.connection.db.collection('users').findOne({ _id: decoded.id });
      if (!user) return authError();

      const pet = await mongoose.connection.db.collection('pets').findOne({ owner: user._id });
      if (!pet) return res.status(404).json({ success: false, message: 'Nenhum animal encontrado' });
      return res.json({ success: true, data: pet });
    }

    // Route: POST /api/pets
    if (path === '/api/pets' && method === 'POST') {
      const token = getToken();
      if (!token) return authError();
      const decoded = await verifyToken(token);
      const user = await mongoose.connection.db.collection('users').findOne({ _id: decoded.id });
      if (!user) return authError();

      const { species, name } = body;
      if (!species || !name) return res.status(400).json({ success: false, message: 'Espécie e nome são obrigatórios' });

      const existing = await mongoose.connection.db.collection('pets').findOne({ owner: user._id });
      if (existing) return res.status(400).json({ success: false, message: 'Já tem um animal virtual' });

      const petData = {
        owner: user._id, species, name, level: 1, experience: 0, experienceToNextLevel: 100,
        hunger: 80, happiness: 80, energy: 100, health: 100,
        evolutionStage: 1, mood: 'feliz', feedCount: 0, totalPointsSpent: 0,
        lastFed: new Date(), createdAt: new Date(), updatedAt: new Date()
      };
      await mongoose.connection.db.collection('pets').insertOne(petData);
      return res.status(201).json({ success: true, data: petData, message: 'Animal adotado!' });
    }

    // Route: PUT /api/pets/feed
    if (path === '/api/pets/feed' && method === 'PUT') {
      const token = getToken();
      if (!token) return authError();
      const decoded = await verifyToken(token);
      const user = await mongoose.connection.db.collection('users').findOne({ _id: decoded.id });
      if (!user) return authError();

      const { points } = body;
      if (!points || points <= 0) return res.status(400).json({ success: false, message: 'Pontos inválidos' });
      if (points > (user.totalPoints || 0)) return res.status(400).json({ success: false, message: 'Pontos insuficientes' });

      const db = mongoose.connection.db;
      const pet = await db.collection('pets').findOne({ owner: user._id });
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

      await db.collection('pets').updateOne(
        { owner: user._id },
        { $set: { hunger: newHunger, happiness: newHappiness, energy: newEnergy, experience: newExperience, level: newLevel, experienceToNextLevel: newExpToNext, evolutionStage: newEvoStage, mood: newMood, feedCount: newFeedCount, totalPointsSpent: (pet.totalPointsSpent || 0) + points, lastFed: new Date(), updatedAt: new Date() } }
      );
      await db.collection('users').updateOne({ _id: user._id }, { $inc: { totalPoints: -points } });

      const updatedPet = await db.collection('pets').findOne({ owner: user._id });
      return res.json({ success: true, data: updatedPet, message: `${pet.name} foi alimentado!` });
    }

    // Route: POST /api/photos/upload
    if (path === '/api/photos/upload' && method === 'POST') {
      const token = getToken();
      if (!token) return authError();
      const decoded = await verifyToken(token);

      const { photo, activityId, originalName } = body;
      if (!photo) return res.status(400).json({ success: false, message: 'Nenhuma foto' });

      const { cloudinary } = require('../server/middleware/upload');
      const result = await cloudinary.uploader.upload(photo, {
        folder: 'digital-detox/photos',
        transformation: [{ width: 1024, height: 1024, crop: 'limit' }]
      });

      const photoDoc = {
        uploadedBy: decoded.id, activity: activityId || null,
        originalName: originalName || 'photo.jpg', filePath: result.secure_url,
        fileType: 'image/jpeg', fileSize: result.bytes || 0, publicId: result.public_id,
        status: 'pending', createdAt: new Date(), updatedAt: new Date()
      };
      await mongoose.connection.db.collection('photos').insertOne(photoDoc);
      return res.status(201).json({
        success: true,
        data: { id: photoDoc._id, filePath: photoDoc.filePath, status: photoDoc.status, message: 'Foto enviada!' }
      });
    }

    // Route: GET /api/photos
    if (path === '/api/photos' && method === 'GET') {
      const token = getToken();
      if (!token) return authError();
      const decoded = await verifyToken(token);
      const photos = await mongoose.connection.db.collection('photos')
        .find({ uploadedBy: decoded.id }).sort({ createdAt: -1 }).limit(50).toArray();
      return res.json({ success: true, data: photos });
    }

    // Route: GET /api/auth/me
    if (path === '/api/auth/me' && method === 'GET') {
      const token = getToken();
      if (!token) return authError();
      const decoded = await verifyToken(token);
      const user = await mongoose.connection.db.collection('users').findOne(
        { _id: decoded.id },
        { projection: { password: 0 } }
      );
      if (!user) return authError();
      return res.json({ success: true, data: user });
    }

    // Route: POST /api/auth/login
    if (path === '/api/auth/login' && method === 'POST') {
      const { email, password } = body;
      if (!email || !password) return res.status(400).json({ success: false, message: 'Email e senha obrigatórios' });

      const db = mongoose.connection.db;
      const user = await db.collection('users').findOne({ email: email.toLowerCase() });
      if (!user) return res.status(401).json({ success: false, message: 'Credenciais inválidas' });

      // Check password with bcrypt
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ success: false, message: 'Credenciais inválidas' });

      // Update last login
      await db.collection('users').updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });

      const token = require('jsonwebtoken').sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      });

      const { password: _, ...userResponse } = user;
      return res.json({ success: true, data: { token, user: userResponse } });
    }

    // Route: GET /api/dashboard/ranking
    if (path === '/api/dashboard/ranking' && method === 'GET') {
      const token = getToken();
      if (!token) return authError();
      const decoded = await verifyToken(token);
      const user = await mongoose.connection.db.collection('users').findOne({ _id: decoded.id });
      if (!user) return authError();
      if (user.role === 'parent') return res.status(403).json({ success: false, message: 'Sem permissão' });

      const schoolId = user.school;
      if (!schoolId) return res.json({ success: true, data: [] });

      const ranking = await mongoose.connection.db.collection('users').find(
        { school: schoolId, role: 'student', isActive: true }
      ).sort({ totalPoints: -1 }).limit(20)
        .project({ fullName: 1, grade: 1, totalPoints: 1, currentStreak: 1, level: 1 }).toArray();

      const rankedList = ranking.map((u, i) => ({
        ...u, position: i + 1,
        isCurrentUser: u._id.toString() === decoded.id
      }));
      return res.json({ success: true, data: rankedList });
    }

    // Route: GET /api/dashboard/notifications
    if (path === '/api/dashboard/notifications' && method === 'GET') {
      const token = getToken();
      if (!token) return authError();
      const decoded = await verifyToken(token);
      const notifications = await mongoose.connection.db.collection('notifications')
        .find({ recipient: decoded.id }).sort({ createdAt: -1 }).limit(20).toArray();
      const total = await mongoose.connection.db.collection('notifications').countDocuments({ recipient: decoded.id });
      const unreadCount = await mongoose.connection.db.collection('notifications').countDocuments({ recipient: decoded.id, isRead: false });
      return res.json({ success: true, data: { notifications, total, unreadCount, pages: Math.ceil(total / 20) } });
    }

    // Route: PUT /api/auth/preferences
    if (path === '/api/auth/preferences' && method === 'PUT') {
      const token = getToken();
      if (!token) return authError();
      const decoded = await verifyToken(token);
      await mongoose.connection.db.collection('users').updateOne(
        { _id: decoded.id },
        { $set: { activityPreferences: body.activityPreferences || [], updatedAt: new Date() } }
      );
      const user = await mongoose.connection.db.collection('users').findOne({ _id: decoded.id }, { projection: { password: 0 } });
      return res.json({ success: true, data: user, message: 'Preferências atualizadas!' });
    }

    // Route: GET /api/users/students
    if (path === '/api/users/students' && method === 'GET') {
      const token = getToken();
      if (!token) return authError();
      const decoded = await verifyToken(token);
      const user = await mongoose.connection.db.collection('users').findOne({ _id: decoded.id });
      if (!user) return authError();

      const { grade } = req.query;
      const query = { role: 'student', isActive: true };
      if (user.school) query.school = user.school;
      if (grade) query.grade = grade;

      const students = await mongoose.connection.db.collection('users').find(query)
        .project({ fullName: 1, grade: 1, studentNumber: 1 }).sort({ fullName: 1 }).limit(100).toArray();
      return res.json({ success: true, data: students });
    }

    // Route: GET /api/users/profile/:id
    if (path.match(/^\/api\/users\/profile\/[\w]+$/) && method === 'GET') {
      const token = getToken();
      if (!token) return authError();
      const decoded = await verifyToken(token);
      const userId = path.split('/').pop();
      const user = await mongoose.connection.db.collection('users').findOne({ _id: require('mongoose').Types.ObjectId(userId) }, { projection: { password: 0 } });
      if (!user) return res.status(404).json({ success: false, message: 'Utilizador não encontrado' });
      return res.json({ success: true, data: user });
    }

    // Route: POST /api/ai/suggestions
    if (path === '/api/ai/suggestions' && method === 'POST') {
      const token = getToken();
      if (!token) return authError();
      const decoded = await verifyToken(token);
      const user = await mongoose.connection.db.collection('users').findOne({ _id: decoded.id });
      const preferences = body.preferences || user?.activityPreferences || [];

      if (preferences.length === 0) {
        return res.status(400).json({ success: false, message: 'Defina preferências primeiro' });
      }

      // Return fallback suggestions (AI can be slow/unreliable in serverless)
      const suggestions = [
        { title: 'Passeio ao ar livre', description: 'Faça um passeio de 30 minutos pelo bairro', category: 'natureza', estimatedMinutes: 30, pointsValue: 15, requiresPhoto: true },
        { title: 'Leitura', description: 'Leia um livro ou revista por 20 minutos', category: 'leitura', estimatedMinutes: 20, pointsValue: 10, requiresPhoto: true },
        { title: 'Desenho', description: 'Desenhe algo que veja à sua volta', category: 'arte', estimatedMinutes: 25, pointsValue: 12, requiresPhoto: true },
        { title: 'Arrumar o quarto', description: 'Organize e arrume o seu quarto', category: 'domestica', estimatedMinutes: 30, pointsValue: 15, requiresPhoto: true },
        { title: 'Jogar à bola', description: 'Jogue futebol ou outro desporto', category: 'desporto', estimatedMinutes: 45, pointsValue: 20, requiresPhoto: true }
      ];
      return res.json({ success: true, data: { suggestions } });
    }

    // Fallback: 404
    return res.status(404).json({ success: false, message: 'Endpoint não encontrado' });
  } catch (error) {
    console.error(`API Error [${method} ${path}]:`, error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
