// Vercel serverless API entry point
require('dotenv').config({ path: require('path').join(__dirname, '../server/.env') });

const serverless = require('serverless-http');
const mongoose = require('mongoose');
const express = require('express');

// Create Express app (same as server/src/index.js but without listen)
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: ['https://digital-detox-app.vercel.app', 'https://*.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Import routes
const authRoutes = require('../server/routes/auth.routes');
const userRoutes = require('../server/routes/user.routes');
const schoolRoutes = require('../server/routes/school.routes');
const activityRoutes = require('../server/routes/activity.routes');
const petRoutes = require('../server/routes/pet.routes');
const dashboardRoutes = require('../server/routes/dashboard.routes');
const photoRoutes = require('../server/routes/photo.routes');
const calendarRoutes = require('../server/routes/calendar.routes');
const aiRoutes = require('../server/routes/ai.routes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor'
  });
});

// Connect to MongoDB (cached connection for serverless)
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  const db = await mongoose.connect(process.env.MONGODB_URI);
  cachedDb = db;
  return db;
}

// Middleware to ensure DB connection before handling requests
app.use(async (req, res, next) => {
  if (!cachedDb) {
    await connectToDatabase();
  }
  next();
});

// Export as serverless function
module.exports = serverless(app);
