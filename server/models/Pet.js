const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  species: {
    type: String,
    enum: ['gato', 'cao', 'passaro', 'tartaruga'],
    required: true
  },
  name: {
    type: String,
    required: [true, 'Nome do animal é obrigatório'],
    trim: true,
    maxlength: 30
  },
  // Evolution system
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 20
  },
  experience: {
    type: Number,
    default: 0
  },
  experienceToNextLevel: {
    type: Number,
    default: 100
  },
  // Stats
  hunger: {
    type: Number,
    default: 80,
    min: 0,
    max: 100
  },
  happiness: {
    type: Number,
    default: 80,
    min: 0,
    max: 100
  },
  energy: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  health: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  // Evolution stages
  evolutionStage: {
    type: Number,
    default: 1,
    min: 1,
    max: 4
  },
  // Customization
  accessories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Accessory'
  }],
  activeEnvironment: {
    type: String,
    enum: ['padrao', 'floresta', 'praia', 'montanha', 'cidade'],
    default: 'padrao'
  },
  unlockedEnvironments: [{
    type: String
  }],
  // Mood
  mood: {
    type: String,
    enum: ['feliz', 'triste', 'sonolento', 'energetico', 'com_fome', 'brincalhao'],
    default: 'feliz'
  },
  // Feeding log
  lastFed: {
    type: Date,
    default: Date.now
  },
  feedCount: {
    type: Number,
    default: 0
  },
  // Points spent on pet
  totalPointsSpent: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for evolution stage name
petSchema.virtual('evolutionStageName').get(function() {
  const stages = ['Ovo', 'Bebé', 'Jovem', 'Adulto'];
  return stages[this.evolutionStage - 1] || 'Ovo';
});

// Virtual for species emoji
petSchema.virtual('speciesIcon').get(function() {
  const icons = {
    'gato': '🐱',
    'cao': '🐶',
    'passaro': '🐦',
    'tartaruga': '🐢'
  };
  return icons[this.species] || '🐾';
});

// Method to feed the pet
petSchema.methods.feed = function(points) {
  this.hunger = Math.min(100, this.hunger + 20);
  this.happiness = Math.min(100, this.happiness + 5);
  this.energy = Math.min(100, this.energy + 10);
  this.lastFed = new Date();
  this.feedCount += 1;
  this.totalPointsSpent += points;
  
  // Add experience
  this.experience += points;
  this.checkLevelUp();
};

// Method to check level up
petSchema.methods.checkLevelUp = function() {
  while (this.experience >= this.experienceToNextLevel && this.level < 20) {
    this.experience -= this.experienceToNextLevel;
    this.level += 1;
    this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.3);
    
    // Evolution stages at certain levels
    if (this.level === 5) this.evolutionStage = 2;
    if (this.level === 10) this.evolutionStage = 3;
    if (this.level === 15) this.evolutionStage = 4;
  }
  
  // Update mood based on stats
  this.updateMood();
};

// Method to update mood
petSchema.methods.updateMood = function() {
  if (this.hunger < 30) {
    this.mood = 'com_fome';
  } else if (this.energy < 20) {
    this.mood = 'sonolento';
  } else if (this.happiness < 30) {
    this.mood = 'triste';
  } else if (this.energy > 80 && this.happiness > 80) {
    this.mood = 'energetico';
  } else if (this.happiness > 60) {
    this.mood = 'brincalhao';
  } else {
    this.mood = 'feliz';
  }
};

// Method to decay stats over time
petSchema.methods.decayStats = function() {
  this.hunger = Math.max(0, this.hunger - 5);
  this.happiness = Math.max(0, this.happiness - 3);
  this.energy = Math.max(0, this.energy - 4);
  this.health = Math.max(0, this.health - (this.hunger < 20 ? 5 : 0));
  this.updateMood();
};

petSchema.index({ owner: 1 });

module.exports = mongoose.model('Pet', petSchema);
