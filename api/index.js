// ============================================================
// PET DECAY SYSTEM
// Stats decrease over time when the student is inactive.
// Called every time the pet is fetched.
// ============================================================
function applyPetDecay(pet) {
  // Decay rates per hour
  const HUNGER_DECAY = 5;    // 20h to empty from 100
  const HAPPINESS_DECAY = 3; // 33h to empty from 100
  const ENERGY_DECAY = 2;    // 50h to empty from 100
  const HEALTH_DECAY = 5;    // Only when hunger or happiness is critically low

  const now = new Date();
  const lastInteraction = new Date(pet.lastFed || pet.updatedAt || pet.createdAt);
  const hoursSince = Math.max(0, (now - lastInteraction) / (1000 * 60 * 60));

  // Only apply decay after 30 minutes of inactivity (avoid instant drops)
  if (hoursSince < 0.5) return pet;

  let hunger = Number(pet.hunger) || 80;
  let happiness = Number(pet.happiness) || 80;
  let energy = Number(pet.energy) || 100;
  let health = Number(pet.health) || 100;

  // Apply time-based decay (capped at 0, floored at 0)
  hunger = Math.max(0, hunger - (HUNGER_DECAY * hoursSince));
  happiness = Math.max(0, happiness - (HAPPINESS_DECAY * hoursSince));
  energy = Math.max(0, energy - (ENERGY_DECAY * hoursSince));

  // Health drops only when other stats are critically low (< 30)
  if (hunger < 30 || happiness < 30) {
    const criticalHours = Math.min(hoursSince, 10); // Cap damage over time
    health = Math.max(0, health - (HEALTH_DECAY * criticalHours));
  }

  // Determine mood based on most critical stat
  let mood = 'feliz';
  if (health < 20) mood = 'doente';
  else if (hunger < 15) mood = 'com_fome';
  else if (hunger < 30) mood = 'com_fome';
  else if (energy < 20) mood = 'sonolento';
  else if (happiness < 20) mood = 'triste';
  else if (energy > 80 && happiness > 80 && hunger > 60) mood = 'energetico';
  else if (happiness > 60) mood = 'brincalhao';

  // Build decayed pet (immutable — caller must persist if needed)
  return {
    ...pet,
    hunger: Math.round(hunger),
    happiness: Math.round(happiness),
    energy: Math.round(energy),
    health: Math.round(health),
    mood
  };
}

// Get pet with decay applied and persist changes to DB
async function getAndDecayPet(mongoDb, ownerId) {
  const pet = await mongoDb.collection('pets').findOne({ owner: ownerId });
  if (!pet) return null;

  const decayed = applyPetDecay(pet);

  // Persist decayed values if any stat changed
  const statsChanged =
    (decayed.hunger !== Number(pet.hunger)) ||
    (decayed.happiness !== Number(pet.happiness)) ||
    (decayed.energy !== Number(pet.energy)) ||
    (decayed.health !== Number(pet.health)) ||
    (decayed.mood !== pet.mood);

  if (statsChanged) {
    await mongoDb.collection('pets').updateOne(
      { owner: ownerId },
      {
        $set: {
          hunger: decayed.hunger,
          happiness: decayed.happiness,
          energy: decayed.energy,
          health: decayed.health,
          mood: decayed.mood,
          updatedAt: new Date()
        }
      }
    );
  }

  return decayed;
}

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
      const { city } = req.query || {};
      const query = { isActive: true };
      if (city) query.city = new RegExp(city, 'i');
      const schools = await mongoDb.collection('schools')
        .find(query).sort({ name: 1 }).limit(100).toArray();
      return res.json({ success: true, data: schools });
    }

    // GET /api/schools/cities (MUST be before /:id)
    if (path === '/api/schools/cities' && method === 'GET') {
      const cities = await mongoDb.collection('schools').distinct('city', { isActive: true });
      return res.json({ success: true, data: cities.sort() });
    }

    // POST /api/schools (teacher only - create school)
    if (path === '/api/schools' && method === 'POST') {
      if (!currentUser) return authError(res);
      if (currentUser.role !== 'teacher') return res.status(403).json({ success: false, message: 'Apenas professores podem criar escolas.' });
      const { name, code, city, address, levels } = body;
      if (!name || !code || !city) return res.status(400).json({ success: false, message: 'Nome, código e cidade são obrigatórios.' });
      const existing = await mongoDb.collection('schools').findOne({ code: code.toUpperCase() });
      if (existing) return res.status(400).json({ success: false, message: 'Já existe uma escola com esse código.' });
      const schoolData = { name, code: code.toUpperCase(), city, address: address || '', levels: levels || [], isActive: true, createdAt: new Date(), updatedAt: new Date() };
      const result = await mongoDb.collection('schools').insertOne(schoolData);
      return res.status(201).json({ success: true, data: { _id: result.insertedId, ...schoolData }, message: 'Escola criada com sucesso!' });
    }

    // GET /api/schools/:id (only non-sub-routes like schedule/students/pending-changes)
    if (path.match(/^\/api\/schools\/[\w-]+$/) && method === 'GET' && !path.includes('/schedule') && !path.includes('/students') && !path.includes('/pending-changes')) {
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
          const pet = await getAndDecayPet(mongoDb, currentUser._id);
          if (pet) petData = {
            name: pet.name, level: pet.level, species: pet.species,
            mood: pet.mood, evolutionStage: pet.evolutionStage,
            hunger: pet.hunger, happiness: pet.happiness, energy: pet.energy, health: pet.health
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
                maxScreenTimeHours: child.maxScreenTimeHours || 4,
                sleepTime: child.sleepTime || '22:00',
                mealTimes: child.mealTimes || [],
                familyTimeHours: child.familyTimeHours || 2,
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
          query.assignedTo = { $in: childIds.map(id => new mongoose.Types.ObjectId(id)) };
        } else {
          query.assignedTo = { $in: ['__none__'] }; // Return empty
        }
      }
      if (section) query.section = section;
      if (status) query.status = status;

      const activities = await mongoDb.collection('activities')
        .find(query).sort({ createdAt: -1 }).limit(50).toArray();

      // Populate student names in completedBy for teacher view
      if (currentUser.role === 'teacher' && activities.length > 0) {
        const allUserIds = [];
        activities.forEach(a => {
          (a.completedBy || []).forEach(c => {
            const uid = c.user?.toString?.() || c.user;
            if (uid && uid.length === 24) allUserIds.push(new mongoose.Types.ObjectId(uid));
          });
        });
        if (allUserIds.length > 0) {
          const usersMap = {};
          const users = await mongoDb.collection('users')
            .find({ _id: { $in: allUserIds } })
            .project({ fullName: 1, grade: 1 }).toArray();
          users.forEach(u => { usersMap[u._id.toString()] = { fullName: u.fullName, grade: u.grade }; });

          activities.forEach(a => {
            if (a.completedBy) {
              a.completedBy = a.completedBy.map(c => {
                const uid = (typeof c.user === 'object' && c.user.toString) ? c.user.toString() : (typeof c.user === 'string' ? c.user : '');
                const userInfo = usersMap[uid];
                return {
                  ...c,
                  user: uid, // Keep original userId as string for API calls
                  userName: userInfo?.fullName || 'Aluno',
                  userGrade: userInfo?.grade || ''
                };
              });
            }
          });
        }
      }

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
      const pet = await getAndDecayPet(mongoDb, currentUser._id);
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

      try {
        // Force numeric types to prevent string concatenation bugs
        const rawPoints = Number(body.points);
        if (!rawPoints || rawPoints <= 0 || !Number.isFinite(rawPoints)) {
          return res.status(400).json({ success: false, message: 'Pontos inválidos' });
        }
        const points = Math.floor(rawPoints); // Ensure integer

        const userTotalPoints = Number(currentUser.totalPoints) || 0;
        if (points > userTotalPoints) {
          return res.status(400).json({ success: false, message: 'Pontos insuficientes' });
        }

        const pet = await mongoDb.collection('pets').findOne({ owner: currentUser._id });
        if (!pet) return res.status(404).json({ success: false, message: 'Animal não encontrado' });

        // Force all pet values to numbers (fix corrupted data from previous bugs)
        const currentExp = Number(pet.experience) || 0;
        const currentLevel = Number(pet.level) || 1;
        const currentExpToNext = Number(pet.experienceToNextLevel) || 100;
        const currentEvoStage = Number(pet.evolutionStage) || 1;
        const currentFeedCount = Number(pet.feedCount) || 0;
        const currentPointsSpent = Number(pet.totalPointsSpent) || 0;

        const newHunger = Math.min(100, Math.max(0, (Number(pet.hunger) || 0) + 20));
        const newHappiness = Math.min(100, Math.max(0, (Number(pet.happiness) || 0) + 5));
        const newEnergy = Math.min(100, Math.max(0, (Number(pet.energy) || 0) + 10));
        let newExperience = currentExp + points;
        let newLevel = currentLevel;
        let newExpToNext = currentExpToNext;
        let newEvoStage = currentEvoStage;
        let newMood = 'feliz';
        const leveledUp = newLevel !== currentLevel;

        // Level-up loop
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

        console.log(`[FEED] pet=${pet.name} exp:${currentExp}->${newExperience} lvl:${currentLevel}->${newLevel} pts:${points}`);

        await mongoDb.collection('pets').updateOne(
          { owner: currentUser._id },
          {
            $set: {
              hunger: newHunger,
              happiness: newHappiness,
              energy: newEnergy,
              experience: newExperience,
              level: newLevel,
              experienceToNextLevel: newExpToNext,
              evolutionStage: newEvoStage,
              mood: newMood,
              feedCount: currentFeedCount + 1,
              totalPointsSpent: currentPointsSpent + points,
              lastFed: new Date(),
              updatedAt: new Date()
            }
          }
        );
        await mongoDb.collection('users').updateOne(
          { _id: currentUser._id },
          { $inc: { totalPoints: -points } }
        );

        const updatedPet = await mongoDb.collection('pets').findOne({ owner: currentUser._id });

        let message = `${pet.name} foi alimentado! +${points} XP`;
        if (newLevel > currentLevel) {
          message = `${pet.name} subiu para o nível ${newLevel}! 🎉`;
        }

        return res.json({ success: true, data: updatedPet, message });
      } catch (feedErr) {
        console.error('[FEED ERROR]', feedErr.message, feedErr.stack);
        return res.status(500).json({ success: false, message: 'Erro ao alimentar: ' + feedErr.message });
      }
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
    // PARENT CHILD SETTINGS ROUTES
    // ============================================================

    // PUT /api/parent/child-settings/:childId
    if (path.match(/^\/api\/parent\/child-settings\/[\w-]+$/) && method === 'PUT') {
      if (!currentUser) return authError(res);
      if (currentUser.role !== 'parent') {
        return res.status(403).json({ success: false, message: 'Apenas pais podem alterar definições' });
      }
      const childId = path.split('/').pop();

      // Verify child is linked
      const linkedChildIds = (currentUser.linkedChildren || []).map(c =>
        typeof c === 'object' ? c.toString() : c
      );
      if (!linkedChildIds.includes(childId)) {
        return res.status(403).json({ success: false, message: 'Filho não vinculado' });
      }

      const { maxScreenTimeHours, sleepTime, mealTimes, familyTimeHours } = body;

      try {
        const updateFields = { updatedAt: new Date() };
        if (maxScreenTimeHours !== undefined) updateFields.maxScreenTimeHours = Number(maxScreenTimeHours);
        if (sleepTime !== undefined) updateFields.sleepTime = sleepTime;
        if (mealTimes !== undefined) updateFields.mealTimes = mealTimes;
        if (familyTimeHours !== undefined) updateFields.familyTimeHours = Number(familyTimeHours);

        await mongoDb.collection('users').updateOne(
          { _id: new mongoose.Types.ObjectId(childId) },
          { $set: updateFields }
        );

        const updatedChild = await mongoDb.collection('users').findOne(
          { _id: new mongoose.Types.ObjectId(childId) },
          { projection: { password: 0 } }
        );

        return res.json({
          success: true,
          data: {
            maxScreenTimeHours: updatedChild.maxScreenTimeHours || 4,
            sleepTime: updatedChild.sleepTime || '22:00',
            mealTimes: updatedChild.mealTimes || [],
            familyTimeHours: updatedChild.familyTimeHours || 2
          },
          message: 'Definições atualizadas!'
        });
      } catch (e) {
        return res.status(500).json({ success: false, message: 'Erro ao atualizar definições: ' + e.message });
      }
    }

    // GET /api/parent/child-settings/:childId
    if (path.match(/^\/api\/parent\/child-settings\/[\w-]+$/) && method === 'GET') {
      if (!currentUser) return authError(res);
      if (currentUser.role !== 'parent') {
        return res.status(403).json({ success: false, message: 'Apenas pais podem ver definições' });
      }
      const childId = path.split('/').pop();

      // Verify child is linked
      const linkedChildIds = (currentUser.linkedChildren || []).map(c =>
        typeof c === 'object' ? c.toString() : c
      );
      if (!linkedChildIds.includes(childId)) {
        return res.status(403).json({ success: false, message: 'Filho não vinculado' });
      }

      try {
        const child = await mongoDb.collection('users').findOne(
          { _id: new mongoose.Types.ObjectId(childId) },
          { projection: { password: 0 } }
        );
        if (!child) return res.status(404).json({ success: false, message: 'Filho não encontrado' });

        // Get weekly completed activities
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const completedThisWeek = await mongoDb.collection('activities').countDocuments({
          assignedTo: child._id,
          'completedBy.validatedBy': { $exists: true },
          'completedBy.completedAt': { $gte: oneWeekAgo }
        });

        return res.json({
          success: true,
          data: {
            maxScreenTimeHours: child.maxScreenTimeHours || 4,
            sleepTime: child.sleepTime || '22:00',
            mealTimes: child.mealTimes || [],
            familyTimeHours: child.familyTimeHours || 2,
            totalPoints: child.totalPoints || 0,
            currentStreak: child.currentStreak || 0,
            completedActivitiesThisWeek: completedThisWeek
          }
        });
      } catch (e) {
        return res.status(500).json({ success: false, message: 'Erro ao obter definições: ' + e.message });
      }
    }

    // PUT /api/parent/validate-photo/:photoId
    if (path.match(/^\/api\/parent\/validate-photo\/[\w-]+$/) && method === 'PUT') {
      if (!currentUser) return authError(res);
      if (currentUser.role !== 'parent') {
        return res.status(403).json({ success: false, message: 'Apenas pais podem validar fotos' });
      }
      const photoId = path.split('/').pop();
      const { approved } = body;

      if (approved === undefined) {
        return res.status(400).json({ success: false, message: 'approved obrigatório' });
      }

      try {
        const photo = await mongoDb.collection('photos').findOne({ _id: new mongoose.Types.ObjectId(photoId) });
        if (!photo) return res.status(404).json({ success: false, message: 'Foto não encontrada' });

        // Verify photo belongs to a linked child
        const linkedChildIds = (currentUser.linkedChildren || []).map(c =>
          typeof c === 'object' ? c.toString() : c
        );
        const uploaderId = photo.uploadedBy?.toString() || '';
        if (!linkedChildIds.includes(uploaderId)) {
          return res.status(403).json({ success: false, message: 'Foto não pertence a um filho vinculado' });
        }

        if (approved) {
          // Mark photo as approved
          await mongoDb.collection('photos').updateOne(
            { _id: new mongoose.Types.ObjectId(photoId) },
            { $set: { status: 'approved', aiAnalysis: { ...(photo.aiAnalysis || {}), status: 'approved', validatedByParent: true }, updatedAt: new Date() } }
          );

          // Complete the associated activity and award points
          if (photo.activity) {
            const activity = await mongoDb.collection('activities').findOne({ _id: photo.activity });
            if (activity) {
              // Check if already completed
              const already = (activity.completedBy || []).find(c =>
                (c.user?.toString && c.user.toString() === uploaderId) ||
                c.user === photo.uploadedBy ||
                c.user?.toString() === uploaderId
              );

              if (!already) {
                const pointsVal = activity.pointsValue || 10;
                await mongoDb.collection('activities').updateOne(
                  { _id: activity._id },
                  {
                    $push: { completedBy: { user: photo.uploadedBy, completedAt: new Date(), validatedBy: currentUser._id, pointsEarned: pointsVal } },
                    $set: { status: 'concluida', updatedAt: new Date() }
                  }
                );
                await mongoDb.collection('users').updateOne(
                  { _id: photo.uploadedBy },
                  { $inc: { totalPoints: pointsVal, currentStreak: 1 } }
                );
              }
            }
          }

          // Notify child
          try {
            await mongoDb.collection('notifications').insertOne({
              recipient: photo.uploadedBy,
              sender: currentUser._id,
              type: 'photo_approved',
              title: 'Foto Aprovada!',
              message: 'O teu pai/mãe aprovou a tua foto. +pontos!',
              relatedId: new mongoose.Types.ObjectId(photoId),
              isRead: false,
              createdAt: new Date()
            });
          } catch (e) {}

          return res.json({ success: true, message: 'Foto aprovada e pontos atribuídos!' });
        } else {
          // Mark photo as rejected
          await mongoDb.collection('photos').updateOne(
            { _id: new mongoose.Types.ObjectId(photoId) },
            { $set: { status: 'rejected', aiAnalysis: { ...(photo.aiAnalysis || {}), status: 'rejected', validatedByParent: true }, updatedAt: new Date() } }
          );

          // PUNISHMENT: deduct points and reset streak
          const uploaderId = photo.uploadedBy;
          try {
            await mongoDb.collection('users').updateOne(
              { _id: uploaderId },
              {
                $inc: { totalPoints: -10, currentStreak: -1 },
                $set: { updatedAt: new Date() }
              }
            );
          } catch (punishErr) {
            console.error('[PARENT REJECT PUNISHMENT ERROR]', punishErr.message);
          }

          // Notify child with details about which photo was rejected
          try {
            const actTitle = photo.activityId ? ((await mongoDb.collection('activities').findOne({ _id: photo.activityId }))?.title) : 'atividade';
            await mongoDb.collection('notifications').insertOne({
              recipient: uploaderId,
              sender: currentUser._id,
              type: 'photo_rejected',
              title: 'Foto Rejeitada pelo Pai',
              message: `O teu pai/mãe rejeitou a foto da atividade "${actTitle}". -10 pontos (penalização). Tenta tirar uma foto real da tua atividade!`,
              relatedId: new mongoose.Types.ObjectId(photoId),
              isRead: false,
              createdAt: new Date()
            });
          } catch (e) {}

          return res.json({ success: true, message: 'Foto rejeitada. -10 pontos ao aluno.' });
        }
      } catch (e) {
        return res.status(500).json({ success: false, message: 'Erro ao validar foto: ' + e.message });
      }
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

    // GET /api/photos/child/:childId
    if (path.match(/^\/api\/photos\/child\/[\w-]+$/) && method === 'GET') {
      if (!currentUser) return authError(res);
      if (currentUser.role !== 'parent') {
        return res.status(403).json({ success: false, message: 'Apenas pais podem ver fotos dos filhos' });
      }
      const childId = path.split('/').pop();

      const linkedChildIds = (currentUser.linkedChildren || []).map(c =>
        typeof c === 'object' ? c.toString() : c
      );
      if (!linkedChildIds.includes(childId)) {
        return res.status(403).json({ success: false, message: 'Filho não vinculado' });
      }

      const photos = await mongoDb.collection('photos')
        .find({ uploadedBy: new mongoose.Types.ObjectId(childId) })
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

        let analysis = {
          isOutdoor: false,
          isActivityRelated: false,
          isScreenCapture: false,
          appearsReal: true,
          description: '',
          confidence: 0,
          status: 'pending_review',
          flaggedIssues: []
        };

        try {
          // Fetch image as base64 from Cloudinary URL
          const axios = require('axios');
          const imageResponse = await axios.get(photo.filePath, { responseType: 'arraybuffer', timeout: 15000 });
          const base64Image = Buffer.from(imageResponse.data).toString('base64');
          const mimeType = photo.filePath.includes('.png') ? 'image/png' : 'image/jpeg';

          // Use OpenAI GPT-4o Vision to analyze the photo
          let openai = null;
          try {
            const OpenAI = require('openai');
            openai = new OpenAI.default({ apiKey: process.env.OPENAI_API_KEY });
          } catch (e1) {
            try {
              const OpenAI = require('openai').default;
              openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            } catch (e2) {
              throw new Error('Failed to load OpenAI SDK: ' + (e1.message || e2.message));
            }
          }

          const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            max_tokens: 500,
            messages: [
              {
                role: 'system',
                content: 'You are a photo verification assistant for a children\'s digital detox app called "Digital Detox". You analyze photos sent by children (ages 10-14) to prove they did offline activities (sports, reading, nature, art, cooking, board games, etc). Respond ONLY with valid JSON, no markdown, no extra text. JSON fields: { "isOutdoor": boolean, "isActivityRelated": boolean, "isScreenCapture": boolean, "appearsReal": boolean, "description": "short description in Portuguese (max 80 chars)", "confidence": number 0-100, "status": "approved" or "rejected" or "pending_review", "flaggedIssues": ["array of strings"] }. Rules: (1) isScreenCapture=true ONLY if the image clearly shows a phone/tablet/computer screen, screenshot, TV, or game interface. (2) appearsReal=false if the photo looks like a stock photo, downloaded image, or is obviously AI-generated. (3) status="rejected" if isScreenCapture=true OR appearsReal=false. (4) status="approved" if isActivityRelated=true AND appearsReal=true AND confidence>=60. (5) Otherwise status="pending_review". (6) flaggedIssues should list specific problems found. Be fair - children take photos with phones so slight blur or imperfect framing is OK.'
              },
              {
                role: 'user',
                content: [
                  {
                    type: 'image_url',
                    image_url: { url: `data:${mimeType};base64,${base64Image}` }
                  },
                  {
                    type: 'text',
                    text: 'Analyze this photo from a child doing a "digital detox" activity. Determine: 1) Does it show a real offline activity (sports, reading, nature, art, cooking, board games, family time, etc)? 2) Does it contain any screen captures (phone, TV, computer, game)? 3) Does it look like a real photo taken by the child (not from internet/AI)? Respond in JSON only.'
                  }
                ]
              }
            ]
          });

          const responseText = completion.choices[0]?.message?.content || '';
          // Parse JSON from response (strip markdown if present)
          const cleanText = responseText.replace(/```json?\n?/g, '').trim();
          const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            // Validate required fields
            analysis = {
              isOutdoor: Boolean(parsed.isOutdoor),
              isActivityRelated: Boolean(parsed.isActivityRelated),
              isScreenCapture: Boolean(parsed.isScreenCapture),
              appearsReal: Boolean(parsed.appearsReal),
              description: String(parsed.description || '').substring(0, 120),
              confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 0)),
              status: ['approved', 'rejected', 'pending_review'].includes(parsed.status) ? parsed.status : 'pending_review',
              flaggedIssues: Array.isArray(parsed.flaggedIssues) ? parsed.flaggedIssues : []
            };
          }
          console.log('[AI ANALYSIS]', JSON.stringify(analysis));
        } catch (aiError) {
          console.error('[AI ANALYSIS ERROR]', aiError.message, aiError.stack);
          analysis.status = 'pending_review';
          analysis.description = 'Análise AI indisponível. Aguardando validação do pai.';
          analysis.flaggedIssues = ['AI indisponível: ' + (aiError.message || 'unknown')];
        }

        // Update photo with analysis
        await mongoDb.collection('photos').updateOne(
          { _id: new mongoose.Types.ObjectId(photoId) },
          { $set: { aiAnalysis: analysis, status: analysis.status, updatedAt: new Date() } }
        );

        // If approved, auto-complete the associated activity
        if (analysis.status === 'approved' && photo.activity) {
          try {
            const activity = await mongoDb.collection('activities').findOne({ _id: photo.activity });
            if (activity) {
              const uploaderId = photo.uploadedBy;
              const already = (activity.completedBy || []).find(c =>
                (c.user?.toString && c.user.toString() === uploaderId.toString()) ||
                c.user === uploaderId ||
                c.user?.toString() === uploaderId.toString()
              );
              if (!already) {
                const pointsVal = activity.pointsValue || 10;
                await mongoDb.collection('activities').updateOne(
                  { _id: activity._id },
                  {
                    $push: { completedBy: { user: uploaderId, completedAt: new Date(), validatedBy: currentUser._id, pointsEarned: pointsVal } },
                    $set: { status: 'concluida', updatedAt: new Date() }
                  }
                );
                await mongoDb.collection('users').updateOne(
                  { _id: uploaderId },
                  { $inc: { totalPoints: pointsVal, currentStreak: 1 } }
                );
                try {
                  await mongoDb.collection('points').insertOne({
                    user: uploaderId,
                    activity: activity._id,
                    section: activity.section || 'fora_escola',
                    points: pointsVal,
                    awardedBy: currentUser._id,
                    isStreakBonus: false,
                    createdAt: new Date()
                  });
                } catch (ptErr) {}
                try {
                  await mongoDb.collection('notifications').insertOne({
                    recipient: uploaderId,
                    sender: currentUser._id,
                    type: 'photo_approved',
                    title: 'Foto Aprovada pela IA!',
                    message: `A IA aprovou a tua foto da atividade "${activity.title}". +${pointsVal} pontos!`,
                    relatedId: new mongoose.Types.ObjectId(photoId),
                    isRead: false,
                    createdAt: new Date()
                  });
                } catch (nErr) {}
              }
            }
          } catch (completeErr) {
            console.error('[AUTO COMPLETE ERROR]', completeErr.message);
          }
        }

        return res.json({
          success: true,
          data: { photoId, analysis },
          message: analysis.status === 'approved' ? 'Foto aprovada pela IA!' : analysis.status === 'rejected' ? 'Foto rejeitada pela IA.' : 'Foto enviada para validação do pai.'
        });
      } catch (e) {
        console.error('[ANALYZE PHOTO ERROR]', e.message);
        return res.status(500).json({ success: false, message: 'Erro ao analisar foto: ' + e.message });
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
    // SEED TEST PETS (no auth — public, for demo/testing only)
    // ============================================================

    // POST /api/seed-test-pets
    if (path === '/api/seed-test-pets' && method === 'POST') {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('teste123', 12);

      const testAccounts = [
        { species: 'tartaruga', stage: 1, email: 'tartaruga.ovo@teste.pt', petName: 'Tartaruguita', fullName: 'Tartaruga Ovo', level: 1 },
        { species: 'tartaruga', stage: 2, email: 'tartaruga.bebe@teste.pt', petName: 'TartarugaBaby', fullName: 'Tartaruga Bebé', level: 5 },
        { species: 'tartaruga', stage: 3, email: 'tartaruga.jovem@teste.pt', petName: 'TartarugaTeen', fullName: 'Tartaruga Jovem', level: 10 },
        { species: 'gato', stage: 1, email: 'gato.ovo@teste.pt', petName: 'Gatito', fullName: 'Gato Ovo', level: 1 },
        { species: 'gato', stage: 2, email: 'gato.bebe@teste.pt', petName: 'GatoBaby', fullName: 'Gato Bebé', level: 5 },
        { species: 'gato', stage: 3, email: 'gato.jovem@teste.pt', petName: 'GatoTeen', fullName: 'Gato Jovem', level: 10 },
        { species: 'cao', stage: 1, email: 'cao.ovo@teste.pt', petName: 'Caozinho', fullName: 'Cão Ovo', level: 1 },
        { species: 'cao', stage: 2, email: 'cao.bebe@teste.pt', petName: 'CaoBaby', fullName: 'Cão Bebé', level: 5 },
        { species: 'cao', stage: 3, email: 'cao.jovem@teste.pt', petName: 'CaoTeen', fullName: 'Cão Jovem', level: 10 },
        { species: 'passaro', stage: 1, email: 'passaro.ovo@teste.pt', petName: 'Passarito', fullName: 'Pássaro Ovo', level: 1 },
        { species: 'passaro', stage: 2, email: 'passaro.bebe@teste.pt', petName: 'PassaroBaby', fullName: 'Pássaro Bebé', level: 5 },
        { species: 'passaro', stage: 3, email: 'passaro.jovem@teste.pt', petName: 'PassaroTeen', fullName: 'Pássaro Jovem', level: 10 },
      ];

      const results = [];

      for (const account of testAccounts) {
        // Check if user already exists
        const existing = await mongoDb.collection('users').findOne({ email: account.email });
        if (existing) {
          results.push({ email: account.email, status: 'skipped', reason: 'already exists' });
          continue;
        }

        // Create user
        const userId = new mongoose.Types.ObjectId();
        await mongoDb.collection('users').insertOne({
          _id: userId,
          email: account.email,
          password: hashedPassword,
          role: 'student',
          fullName: account.fullName,
          dateOfBirth: '2012-01-01',
          totalPoints: 500,
          grade: '7',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Create pet
        // Calculate experience based on level (matching the feed route's progression)
        let experience = 0;
        let expToNext = 100;
        for (let i = 1; i < account.level; i++) {
          experience += expToNext;
          expToNext = Math.floor(expToNext * 1.3);
        }

        await mongoDb.collection('pets').insertOne({
          _id: new mongoose.Types.ObjectId(),
          owner: userId,
          species: account.species,
          name: account.petName,
          level: account.level,
          experience: experience,
          experienceToNextLevel: expToNext,
          hunger: 80,
          happiness: 80,
          energy: 100,
          health: 100,
          evolutionStage: account.stage,
          mood: 'feliz',
          feedCount: 0,
          totalPointsSpent: 0,
          lastFed: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        results.push({
          email: account.email,
          password: 'teste123',
          species: account.species,
          petName: account.petName,
          level: account.level,
          evolutionStage: account.stage,
          status: 'created',
        });
      }

      return res.json({
        success: true,
        message: `Seed completed. ${results.filter(r => r.status === 'created').length} created, ${results.filter(r => r.status === 'skipped').length} skipped.`,
        data: results,
      });
    }

    // ============================================================
    // SCHOOL MANAGEMENT ROUTES (teacher)
    // ============================================================

    // GET /api/schools/:id/pending-changes
    if (path.match(/\/pending-changes$/) && method === 'GET') {
      if (!currentUser) return authError(res);
      if (currentUser.role !== 'teacher') return res.status(403).json({ success: false, message: 'Apenas professores.' });
      const schoolId = path.match(/\/api\/schools\/([\w-]+)\//)?.[1];
      const school = await mongoDb.collection('schools').findOne({ _id: new mongoose.Types.ObjectId(schoolId) });
      if (!school) return res.status(404).json({ success: false, message: 'Escola não encontrada.' });
      if (!school.pendingChanges || !school.pendingChanges.type) return res.json({ success: true, data: null });
      const pending = school.pendingChanges;
      const votesWithNames = [];
      for (const v of (pending.votes || [])) {
        const t = await mongoDb.collection('users').findOne({ _id: v.teacher }, { projection: { fullName: 1 } });
        votesWithNames.push({ teacherId: v.teacher, teacherName: t?.fullName || 'Professor', votedAt: v.votedAt });
      }
      return res.json({ success: true, data: { ...pending, votes: votesWithNames, neededVotes: 3, currentVotes: votesWithNames.length } });
    }

    // PUT /api/schools/:id (edit with 3-vote system)
    if (path.match(/^\/api\/schools\/[\w-]+$/) && method === 'PUT' && !path.includes('/vote') && !path.includes('/cancel')) {
      if (!currentUser) return authError(res);
      if (currentUser.role !== 'teacher') return res.status(403).json({ success: false, message: 'Apenas professores.' });
      const schoolId = path.split('/')[3];
      const school = await mongoDb.collection('schools').findOne({ _id: new mongoose.Types.ObjectId(schoolId) });
      if (!school) return res.status(404).json({ success: false, message: 'Escola não encontrada.' });
      const { name, city: newCity, address } = body;
      const proposedData = {};
      if (name) proposedData.name = name;
      if (newCity) proposedData.city = newCity;
      if (address !== undefined) proposedData.address = address;

      if (school.pendingChanges && school.pendingChanges.type === 'edit') {
        const alreadyVoted = (school.pendingChanges.votes || []).some(v => v.teacher?.toString() === currentUser._id.toString());
        if (alreadyVoted) return res.status(400).json({ success: false, message: 'Já votaste.' });
        if (JSON.stringify(proposedData) !== JSON.stringify(school.pendingChanges.proposedData))
          return res.status(400).json({ success: false, message: 'Já existe uma proposta diferente.' });
        school.pendingChanges.votes.push({ teacher: currentUser._id, votedAt: new Date() });
        if (school.pendingChanges.votes.length >= 3) {
          const updateFields = {}; if (proposedData.name) updateFields.name = proposedData.name;
          if (proposedData.city) updateFields.city = proposedData.city; if (proposedData.address !== undefined) updateFields.address = proposedData.address;
          await mongoDb.collection('schools').updateOne({ _id: new mongoose.Types.ObjectId(schoolId) }, { $set: { ...updateFields, pendingChanges: null, updatedAt: new Date() } });
          return res.json({ success: true, message: 'Alteração aprovada com 3 votos!' });
        }
        await mongoDb.collection('schools').updateOne({ _id: new mongoose.Types.ObjectId(schoolId) }, { $set: { pendingChanges: school.pendingChanges, updatedAt: new Date() } });
        return res.json({ success: true, message: `Voto registado! Faltam ${3 - school.pendingChanges.votes.length} voto(s).` });
      }
      school.pendingChanges = { type: 'edit', proposedData, votes: [{ teacher: currentUser._id, votedAt: new Date() }], createdAt: new Date() };
      await mongoDb.collection('schools').updateOne({ _id: new mongoose.Types.ObjectId(schoolId) }, { $set: { pendingChanges: school.pendingChanges, updatedAt: new Date() } });
      // Notify other teachers
      const teachers = await mongoDb.collection('users').find({ school: new mongoose.Types.ObjectId(schoolId), role: 'teacher', isActive: true }).toArray();
      const notifs = teachers.filter(t => t._id.toString() !== currentUser._id.toString()).map(t => ({
        recipient: t._id, sender: currentUser._id, type: 'school_alert',
        title: 'Proposta de Alteração', message: `${currentUser.fullName} propôs alterações na escola "${school.name}".`, isRead: false, createdAt: new Date()
      }));
      if (notifs.length > 0) await mongoDb.collection('notifications').insertMany(notifs);
      return res.json({ success: true, message: 'Proposta criada! Precisa de mais 2 votos.' });
    }

    // POST /api/schools/:id/vote-delete
    if (path.match(/\/vote-delete$/) && method === 'POST') {
      if (!currentUser) return authError(res);
      if (currentUser.role !== 'teacher') return res.status(403).json({ success: false, message: 'Apenas professores.' });
      const schoolId = path.match(/\/api\/schools\/([\w-]+)\//)?.[1];
      const school = await mongoDb.collection('schools').findOne({ _id: new mongoose.Types.ObjectId(schoolId) });
      if (!school) return res.status(404).json({ success: false, message: 'Escola não encontrada.' });
      if (school.pendingChanges && school.pendingChanges.type === 'edit')
        return res.status(400).json({ success: false, message: 'Resolve a alteração pendente primeiro.' });
      if (!school.pendingChanges || school.pendingChanges.type !== 'delete') {
        school.pendingChanges = { type: 'delete', proposedData: {}, votes: [{ teacher: currentUser._id, votedAt: new Date() }], createdAt: new Date() };
        await mongoDb.collection('schools').updateOne({ _id: new mongoose.Types.ObjectId(schoolId) }, { $set: { pendingChanges: school.pendingChanges, updatedAt: new Date() } });
        const teachers = await mongoDb.collection('users').find({ school: new mongoose.Types.ObjectId(schoolId), role: 'teacher', isActive: true }).toArray();
        const notifs = teachers.filter(t => t._id.toString() !== currentUser._id.toString()).map(t => ({
          recipient: t._id, sender: currentUser._id, type: 'school_alert',
          title: 'Proposta de Eliminação', message: `${currentUser.fullName} propôs eliminar "${school.name}".`, isRead: false, createdAt: new Date()
        }));
        if (notifs.length > 0) await mongoDb.collection('notifications').insertMany(notifs);
        return res.json({ success: true, message: 'Proposta de eliminação criada! Precisa de 2 mais votos.' });
      }
      const alreadyVoted = (school.pendingChanges.votes || []).some(v => v.teacher?.toString() === currentUser._id.toString());
      if (alreadyVoted) return res.status(400).json({ success: false, message: 'Já votaste.' });
      school.pendingChanges.votes.push({ teacher: currentUser._id, votedAt: new Date() });
      if (school.pendingChanges.votes.length >= 3) {
        await mongoDb.collection('schools').updateOne({ _id: new mongoose.Types.ObjectId(schoolId) }, { $set: { isActive: false, pendingChanges: null, updatedAt: new Date() } });
        return res.json({ success: true, message: 'Escola eliminada com 3 votos!' });
      }
      await mongoDb.collection('schools').updateOne({ _id: new mongoose.Types.ObjectId(schoolId) }, { $set: { pendingChanges: school.pendingChanges, updatedAt: new Date() } });
      return res.json({ success: true, message: `Voto registado! Faltam ${3 - school.pendingChanges.votes.length} voto(s).` });
    }

    // POST /api/schools/:id/cancel-pending
    if (path.match(/\/cancel-pending$/) && method === 'POST') {
      if (!currentUser) return authError(res);
      const schoolId = path.match(/\/api\/schools\/([\w-]+)\//)?.[1];
      await mongoDb.collection('schools').updateOne({ _id: new mongoose.Types.ObjectId(schoolId) }, { $set: { pendingChanges: null, updatedAt: new Date() } });
      return res.json({ success: true, message: 'Proposta cancelada.' });
    }

    // ============================================================
    // CALENDAR ROUTES
    // ============================================================

    // GET /api/calendar
    if (path === '/api/calendar' && method === 'GET') {
      if (!currentUser) return authError(res);
      const { month, year } = req.query || {};
      const events = [];
      if (currentUser.role === 'teacher') {
        const mQuery = { assignedBy: currentUser._id, scheduledDate: { $exists: true }, isActive: true };
        if (month && year) {
          const start = new Date(Number(year), Number(month) - 1, 1);
          const end = new Date(Number(year), Number(month), 0, 23, 59, 59);
          mQuery.scheduledDate = { $gte: start, $lte: end };
        }
        const acts = await mongoDb.collection('activities').find(mQuery).sort({ scheduledDate: -1 }).limit(50).toArray();
        for (const a of acts) {
          const cc = (a.completedBy || []).length || 0;
          const ta = (a.assignedTo || []).length || 0;
          events.push({ type: a.isMission ? 'mission' : 'activity', id: a._id, title: a.title, description: a.description, date: a.scheduledDate, scheduledTime: a.scheduledTime, classGroup: a.classGroup, pointsValue: a.pointsValue, isMission: a.isMission, completionCount: cc, totalAssigned: ta });
        }
      } else if (currentUser.role === 'student') {
        const acts = await mongoDb.collection('activities').find({ assignedTo: currentUser._id, scheduledDate: { $exists: true }, isActive: true }).sort({ scheduledDate: -1 }).limit(50).toArray();
        for (const a of acts) {
          const done = (a.completedBy || []).some(c => (c.user?.toString?.() || c.user) === currentUser._id.toString());
          events.push({ type: a.isMission ? 'mission' : 'activity', id: a._id, title: a.title, description: a.description, date: a.scheduledDate, pointsValue: a.pointsValue, isMission: a.isMission, isCompleted: done, requiresPhoto: a.requiresPhoto });
        }
      }
      return res.json({ success: true, data: events });
    }

    // POST /api/calendar/mission (teacher creates daily mission)
    if (path === '/api/calendar/mission' && method === 'POST') {
      if (!currentUser) return authError(res);
      if (currentUser.role !== 'teacher') return res.status(403).json({ success: false, message: 'Apenas professores.' });
      if (!currentUser.school) return res.status(400).json({ success: false, message: 'Professor sem escola associada.' });
      const { title, description, category, classGroup, scheduledDate, scheduledTime, pointsValue, requiresPhoto } = body;
      if (!title || !scheduledDate) return res.status(400).json({ success: false, message: 'Título e data são obrigatórios.' });
      const sQuery = { school: currentUser.school, role: 'student', isActive: true };
      if (classGroup) sQuery.grade = classGroup;
      const students = await mongoDb.collection('users').find(sQuery).project({ _id: 1 }).toArray();
      if (students.length === 0) return res.status(400).json({ success: false, message: 'Nenhum aluno encontrado.' });
      const missionData = { title, description: description || '', category: category || 'escola', section: 'escola', school: currentUser.school, classGroup: classGroup || '', assignedBy: currentUser._id, scheduledDate: new Date(scheduledDate), scheduledTime: scheduledTime || null, pointsValue: pointsValue || 15, isMission: true, missionType: 'diaria', requiresPhoto: requiresPhoto !== false, assignedTo: students.map(s => s._id), status: 'pendente', isActive: true, createdAt: new Date(), updatedAt: new Date() };
      const result = await mongoDb.collection('activities').insertOne(missionData);
      const notifs = students.map(s => ({ recipient: s._id, sender: currentUser._id, type: 'school_alert', title: 'Nova Missão Diária! 🎯', message: `${title} — ${pointsValue || 15} pontos. Data: ${new Date(scheduledDate).toLocaleDateString('pt-PT')}.`, isRead: false, createdAt: new Date() }));
      await mongoDb.collection('notifications').insertMany(notifs);
      return res.status(201).json({ success: true, data: { _id: result.insertedId, ...missionData }, message: `Missão criada para ${students.length} aluno(s)!` });
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
