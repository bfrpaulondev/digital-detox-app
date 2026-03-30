require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const School = require('../models/School');
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const Reward = require('../models/Reward');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await School.deleteMany({});
    await User.deleteMany({});
    await Achievement.deleteMany({});
    await Reward.deleteMany({});

    // Create schools
    const schools = await School.create([
      {
        name: 'Escola Básica e Secundária de Exemplo',
        code: 'EBSEX',
        address: 'Rua da Educação, 123, Lisboa',
        levels: ['2_ciclo', '3_ciclo', 'secundario'],
        schedule: {
          startTime: '08:00',
          endTime: '15:30',
          breakTime: '10:30',
          lunchStart: '12:00',
          lunchEnd: '13:00'
        }
      }
    ]);
    console.log(`Created ${schools.length} schools`);

    // Create demo users
    const teacherPassword = await bcrypt.hash('teacher123', 12);
    const parentPassword = await bcrypt.hash('parent123', 12);
    const studentPassword = await bcrypt.hash('student123', 12);

    const teacher = await User.create({
      role: 'teacher',
      fullName: 'Maria Silva',
      dateOfBirth: new Date('1985-03-15'),
      email: 'maria.silva@escola.pt',
      password: teacherPassword,
      school: schools[0]._id,
      teacherNumber: 'T001',
      subjects: ['Matemática', 'Ciências']
    });

    const student = await User.create({
      role: 'student',
      fullName: 'João Santos',
      dateOfBirth: new Date('2012-07-20'),
      email: 'joao.santos@email.com',
      password: studentPassword,
      school: schools[0]._id,
      studentNumber: 'A001',
      grade: '7',
      parentCode: uuidv4().substring(0, 8).toUpperCase(),
      activityPreferences: ['desporto', 'jogos_ar_livre', 'leitura']
    });

    const parent = await User.create({
      role: 'parent',
      fullName: 'Ana Santos',
      dateOfBirth: new Date('1980-11-05'),
      email: 'ana.santos@email.com',
      password: parentPassword,
      linkedChildren: [student._id]
    });

    // Link parent and child
    student.linkedParent = parent._id;
    await student.save();

    console.log(`Created demo users: teacher, student (code: ${student.parentCode}), parent`);

    // Create achievements
    const achievements = await Achievement.create([
      { name: 'Primeira Atividade', description: 'Completou a sua primeira atividade', icon: '⭐', category: 'participacao', criteria: { type: 'activities_completed', value: 1 }, rarity: 'comum', pointsReward: 10 },
      { name: 'Estrela em Ascensão', description: 'Completou 10 atividades', icon: '🌟', category: 'participacao', criteria: { type: 'activities_completed', value: 10 }, rarity: 'raro', pointsReward: 50 },
      { name: 'Consistência Incrível', description: '3 dias seguidos de atividades', icon: '🔥', category: 'consistencia', criteria: { type: 'streak_days', value: 3 }, rarity: 'comum', pointsReward: 30 },
      { name: 'Mestre da Consistência', description: '7 dias seguidos de atividades', icon: '💪', category: 'consistencia', criteria: { type: 'streak_days', value: 7 }, rarity: 'raro', pointsReward: 100 },
      { name: 'Centurião', description: 'Acumulou 100 pontos', icon: '💯', category: 'evolucao', criteria: { type: 'total_points', value: 100 }, rarity: 'comum', pointsReward: 20 },
      { name: 'Amigo do Pet', description: 'Pet chegou ao nível 5', icon: '🐾', category: 'evolucao', criteria: { type: 'pet_level', value: 5 }, rarity: 'epico', pointsReward: 75 },
      { name: 'Lenda do Bairro', description: 'Top 3 no ranking da escola', icon: '🏆', category: 'social', criteria: { type: 'school_ranking', value: 3 }, rarity: 'lendario', pointsReward: 200 },
      { name: 'Social Butterfly', description: 'Completou 25 atividades', icon: '🦋', category: 'social', criteria: { type: 'activities_completed', value: 25 }, rarity: 'epico', pointsReward: 150 }
    ]);
    console.log(`Created ${achievements.length} achievements`);

    // Create rewards
    const rewards = await Reward.create([
      { name: 'Novo Acessório', description: 'Desbloqueie um acessório para o seu pet', type: 'desbloqueio', pointsCost: 50, icon: '🎀' },
      { name: 'Ambiente Floresta', description: 'Mude o ambiente do seu pet para a floresta', type: 'desbloqueio', pointsCost: 100, icon: '🌲' },
      { name: 'Badge Social', description: 'Mostre que é socialmente ativo', type: 'badge', pointsCost: 75, icon: '🎖️' },
      { name: 'Surpresa', description: 'Uma recompensa surpresa!', type: 'simbolica', pointsCost: 30, icon: '🎁' }
    ]);
    console.log(`Created ${rewards.length} rewards`);

    console.log('\nSeed completed successfully!');
    console.log('\nDemo credentials:');
    console.log('Teacher: maria.silva@escola.pt / teacher123');
    console.log('Student: joao.santos@email.com / student123');
    console.log('Parent: ana.santos@email.com / parent123');
    console.log(`Student parent code: ${student.parentCode}`);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
