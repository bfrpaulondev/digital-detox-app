// Standalone dashboard stats - lightweight, no express overhead
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

let cachedDb = null;
async function connectDB() {
  if (cachedDb && cachedDb.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000
  });
  cachedDb = mongoose.connection;
}

// Minimal user schema (no pre-save hooks)
const userSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectDB();

    // Extract token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ success: false, message: 'Não autorizado' });

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Token inválido' });
    }

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'Utilizador não encontrado' });

    const stats = {};

    if (user.role === 'student') {
      const db = mongoose.connection.db;

      const completedActivities = await db.collection('activities').countDocuments({
        'assignedTo': user._id,
        'completedBy.validatedBy': { $exists: true }
      });

      const pendingActivities = await db.collection('activities').countDocuments({
        'assignedTo': user._id,
        'status': { $in: ['pendente', 'em_progresso'] }
      });

      let petData = null;
      try {
        const pet = await db.collection('pets').findOne({ owner: user._id });
        if (pet) {
          petData = { name: pet.name, level: pet.level, species: pet.species, mood: pet.mood, evolutionStage: pet.evolutionStage };
        }
      } catch (e) { /* pet collection might not exist */ }

      stats = {
        totalPoints: user.totalPoints || 0,
        level: user.level || 1,
        currentStreak: user.currentStreak || 0,
        longestStreak: user.longestStreak || 0,
        completedActivities,
        pendingActivities,
        pet: petData,
        achievementCount: (user.achievements || []).length
      };
    } else if (user.role === 'teacher') {
      const db = mongoose.connection.db;

      const totalStudents = await db.collection('users').countDocuments({
        school: user.school, role: 'student', isActive: true
      });

      const myActivities = await db.collection('activities').countDocuments({
        assignedBy: user._id
      });

      const pendingValidations = await db.collection('activities').countDocuments({
        assignedBy: user._id, status: 'concluida'
      });

      let topStudents = [];
      try {
        topStudents = await db.collection('users').find(
          { school: user.school, role: 'student', isActive: true }
        ).sort({ totalPoints: -1 }).limit(10)
          .project({ fullName: 1, grade: 1, totalPoints: 1, currentStreak: 1 }).toArray();
      } catch (e) { /* ignore */ }

      // Get school name
      let schoolName = '';
      try {
        if (user.school) {
          const school = await db.collection('schools').findOne({ _id: user.school });
          schoolName = school ? school.name : '';
        }
      } catch (e) { /* ignore */ }

      stats = { totalStudents, myActivities, pendingValidations, topStudents, schoolName };
    } else if (user.role === 'parent') {
      const db = mongoose.connection.db;
      const childrenData = [];
      const childIds = (user.linkedChildren || []).map(id => id.toString ? id.toString() : id);

      for (const childId of childIds) {
        try {
          const child = await User.findById(childId);
          if (!child) continue;

          let schoolName = '';
          try {
            if (child.school) {
              const school = await db.collection('schools').findOne({ _id: child.school });
              schoolName = school ? school.name : '';
            }
          } catch (e) { /* ignore */ }

          const completedActivities = await db.collection('activities').countDocuments({
            'assignedTo': childId,
            'completedBy.validatedBy': { $exists: true }
          });

          let pet = null;
          try {
            const petDoc = await db.collection('pets').findOne({ owner: childId });
            if (petDoc) pet = { name: petDoc.name, level: petDoc.level, mood: petDoc.mood };
          } catch (e) { /* ignore */ }

          childrenData.push({
            id: child._id,
            fullName: child.fullName,
            grade: child.grade,
            school: schoolName,
            totalPoints: child.totalPoints || 0,
            level: child.level || 1,
            currentStreak: child.currentStreak || 0,
            completedActivities,
            pet
          });
        } catch (e) { /* skip this child */ }
      }

      stats = { children: childrenData, totalChildren: childrenData.length };
    } else {
      stats = { totalPoints: 0, level: 1, currentStreak: 0 };
    }

    return res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Dashboard stats error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
