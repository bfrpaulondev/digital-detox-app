// Main API - standalone Vercel function (no serverless-http)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const app = express();

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

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/ai', aiRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor'
  });
});

// Cache DB connection
let cachedDb = null;
async function connectDB() {
  if (cachedDb && cachedDb.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000
  });
  cachedDb = mongoose.connection;
}

// Standalone Vercel handler
module.exports = async function handler(req, res) {
  // Connect DB before handling
  await connectDB();
  
  // Use express to handle the request
  return app(req, res);
};
