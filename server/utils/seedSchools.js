require('dotenv').config({ path: require('path').join(__dirname, '../../server/.env') });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const schools = [
  // ========== AGRUPAMENTO DE ESCOLAS BARBOSA DU BOCAGE (171359) ==========
  {
    name: "Agrupamento de Escolas Barbosa du Bocage",
    code: "171359",
    address: "Avenida de Angola, 2910-052 Setúbal",
    levels: ["2_ciclo", "3_ciclo"],
    schedule: {
      startTime: "08:15",
      endTime: "15:45",
      breakTime: "10:15",
      lunchStart: "12:15",
      lunchEnd: "13:15"
    },
    mealTimes: [
      { type: "pequeno_almoço", time: "07:45" },
      { type: "almoco", time: "12:15" },
      { type: "lanche", time: "15:45" }
    ],
    isActive: true
  },
  {
    name: "Escola Básica 2,3 Barbosa du Bocage",
    code: "171359-EB23",
    address: "Avenida de Angola, 2910-052 Setúbal",
    levels: ["2_ciclo", "3_ciclo"],
    schedule: {
      startTime: "08:15",
      endTime: "15:45",
      breakTime: "10:15",
      lunchStart: "12:15",
      lunchEnd: "13:15"
    },
    mealTimes: [
      { type: "pequeno_almoço", time: "07:45" },
      { type: "almoco", time: "12:15" },
      { type: "lanche", time: "15:45" }
    ],
    isActive: true
  },
  {
    name: "Escola Básica Nº2 de Setúbal",
    code: "171359-EB2",
    address: "Praceta Vítor Vitorino, 2900-664 Setúbal",
    levels: ["2_ciclo"],
    schedule: {
      startTime: "08:15",
      endTime: "15:30",
      breakTime: "10:15",
      lunchStart: "12:15",
      lunchEnd: "13:00"
    },
    mealTimes: [
      { type: "pequeno_almoço", time: "07:45" },
      { type: "almoco", time: "12:15" },
      { type: "lanche", time: "15:30" }
    ],
    isActive: true
  },

  // ========== AGRUPAMENTO DE ESCOLAS LIMA DE FREITAS (172169) ==========
  {
    name: "Agrupamento de Escolas Lima de Freitas",
    code: "172169",
    address: "Rua Batalha do Viso, 2904-510 Setúbal",
    levels: ["2_ciclo", "3_ciclo"],
    schedule: {
      startTime: "08:15",
      endTime: "15:45",
      breakTime: "10:15",
      lunchStart: "12:15",
      lunchEnd: "13:15"
    },
    mealTimes: [
      { type: "pequeno_almoço", time: "07:45" },
      { type: "almoco", time: "12:15" },
      { type: "lanche", time: "15:45" }
    ],
    isActive: true
  },
  {
    name: "Escola Básica e Secundária Lima de Freitas",
    code: "172169-EBES",
    address: "Rua Batalha do Viso, 2904-510 Setúbal",
    levels: ["2_ciclo", "3_ciclo", "secundario"],
    schedule: {
      startTime: "08:15",
      endTime: "16:00",
      breakTime: "10:15",
      lunchStart: "12:15",
      lunchEnd: "13:15"
    },
    mealTimes: [
      { type: "pequeno_almoço", time: "07:45" },
      { type: "almoco", time: "12:15" },
      { type: "lanche", time: "16:00" }
    ],
    isActive: true
  },
  {
    name: "Escola Básica Nº12 das Amoreiras",
    code: "172169-EB12",
    address: "Rua da Cidade de Beauvais, 2900-303 Setúbal",
    levels: ["2_ciclo", "3_ciclo"],
    schedule: {
      startTime: "08:15",
      endTime: "15:30",
      breakTime: "10:15",
      lunchStart: "12:00",
      lunchEnd: "13:00"
    },
    mealTimes: [
      { type: "pequeno_almoço", time: "07:45" },
      { type: "almoco", time: "12:00" },
      { type: "lanche", time: "15:30" }
    ],
    isActive: true
  },
  {
    name: "Escola Básica Nº3 de Montalvão",
    code: "172169-EB3",
    address: "2900-095 Setúbal",
    levels: ["2_ciclo"],
    schedule: {
      startTime: "08:15",
      endTime: "15:30",
      breakTime: "10:15",
      lunchStart: "12:00",
      lunchEnd: "13:00"
    },
    mealTimes: [
      { type: "pequeno_almoço", time: "07:45" },
      { type: "almoco", time: "12:00" },
      { type: "lanche", time: "15:30" }
    ],
    isActive: true
  },
  {
    name: "Escola Básica Nº9 do Casal das Figueiras",
    code: "172169-EB9",
    address: "Rua José Gomes Ferreira, Bairro Casal das Figueiras, 2900-017 Setúbal",
    levels: ["2_ciclo"],
    schedule: {
      startTime: "08:15",
      endTime: "15:30",
      breakTime: "10:15",
      lunchStart: "12:00",
      lunchEnd: "13:00"
    },
    mealTimes: [
      { type: "pequeno_almoço", time: "07:45" },
      { type: "almoco", time: "12:00" },
      { type: "lanche", time: "15:30" }
    ],
    isActive: true
  },

  // ========== AGRUPAMENTO DE ESCOLAS LUÍSA TODI (171256) ==========
  {
    name: "Agrupamento de Escolas Luísa Todi",
    code: "171256",
    address: "Rua Adriano Correia de Oliveira, 2910-323 Setúbal",
    levels: ["2_ciclo", "3_ciclo"],
    schedule: {
      startTime: "08:15",
      endTime: "15:45",
      breakTime: "10:15",
      lunchStart: "12:15",
      lunchEnd: "13:15"
    },
    mealTimes: [
      { type: "pequeno_almoço", time: "07:45" },
      { type: "almoco", time: "12:15" },
      { type: "lanche", time: "15:45" }
    ],
    isActive: true
  },
  {
    name: "Escola de Hotelaria e Turismo de Setúbal",
    code: "171256-EHT",
    address: "Avenida Luísa Todi, Baluarte do Cais Nº 5, 2900-461 Setúbal",
    levels: ["2_ciclo", "3_ciclo", "secundario"],
    schedule: {
      startTime: "08:00",
      endTime: "16:30",
      breakTime: "10:15",
      lunchStart: "12:15",
      lunchEnd: "13:30"
    },
    mealTimes: [
      { type: "pequeno_almoço", time: "07:30" },
      { type: "almoco", time: "12:15" },
      { type: "lanche", time: "16:30" }
    ],
    isActive: true
  },

  // ========== AGRUPAMENTO DE ESCOLAS SEBASTIÃO DA GAMA (171025) ==========
  {
    name: "Agrupamento de Escolas Sebastião da Gama",
    code: "171025",
    address: "Rua da Escola Técnica, 2900-354 Setúbal",
    levels: ["2_ciclo", "3_ciclo", "secundario"],
    schedule: {
      startTime: "08:15",
      endTime: "16:00",
      breakTime: "10:15",
      lunchStart: "12:15",
      lunchEnd: "13:15"
    },
    mealTimes: [
      { type: "pequeno_almoço", time: "07:45" },
      { type: "almoco", time: "12:15" },
      { type: "lanche", time: "16:00" }
    ],
    isActive: true
  },
  {
    name: "Escola Básica de 2º e 3º Ciclos de Aranguez",
    code: "171025-EB23AR",
    address: "Rua de Badajoz Nº11, 2900-258 Setúbal",
    levels: ["2_ciclo", "3_ciclo"],
    schedule: {
      startTime: "08:15",
      endTime: "15:45",
      breakTime: "10:15",
      lunchStart: "12:15",
      lunchEnd: "13:15"
    },
    mealTimes: [
      { type: "pequeno_almoço", time: "07:45" },
      { type: "almoco", time: "12:15" },
      { type: "lanche", time: "15:45" }
    ],
    isActive: true
  },
  {
    name: "Escola Secundária Sebastião da Gama",
    code: "171025-ESSG",
    address: "Rua da Escola Técnica, 2900-354 Setúbal",
    levels: ["3_ciclo", "secundario"],
    schedule: {
      startTime: "08:15",
      endTime: "16:15",
      breakTime: "10:15",
      lunchStart: "12:30",
      lunchEnd: "13:30"
    },
    mealTimes: [
      { type: "pequeno_almoço", time: "07:45" },
      { type: "almoco", time: "12:30" },
      { type: "lanche", time: "16:15" }
    ],
    isActive: true
  },
  {
    name: "Escola Básica de Montalvão (AESG)",
    code: "171025-EBM",
    address: "Rua Frei António das Chagas, 12, 2900-088 Setúbal",
    levels: ["2_ciclo", "3_ciclo"],
    schedule: {
      startTime: "08:15",
      endTime: "15:30",
      breakTime: "10:15",
      lunchStart: "12:00",
      lunchEnd: "13:00"
    },
    mealTimes: [
      { type: "pequeno_almoço", time: "07:45" },
      { type: "almoco", time: "12:00" },
      { type: "lanche", time: "15:30" }
    ],
    isActive: true
  },

  // ========== AGRUPAMENTO DE ESCOLAS DE AZEITÃO (171049) ==========
  {
    name: "Agrupamento de Escolas de Azeitão",
    code: "171049",
    address: "Rua António Maria de Oliveira Parreira, 2925-557 Azeitão, Setúbal",
    levels: ["2_ciclo", "3_ciclo"],
    schedule: {
      startTime: "08:15",
      endTime: "15:45",
      breakTime: "10:15",
      lunchStart: "12:15",
      lunchEnd: "13:15"
    },
    mealTimes: [
      { type: "pequeno_almoço", time: "07:45" },
      { type: "almoco", time: "12:15" },
      { type: "lanche", time: "15:45" }
    ],
    isActive: true
  },
  {
    name: "Escola Básica de São Gabriel",
    code: "171049-EBSG",
    address: "Rua Gregório Lopes, 2900-050 Setúbal",
    levels: ["2_ciclo", "3_ciclo"],
    schedule: {
      startTime: "08:15",
      endTime: "15:30",
      breakTime: "10:15",
      lunchStart: "12:00",
      lunchEnd: "13:00"
    },
    mealTimes: [
      { type: "pequeno_almoço", time: "07:45" },
      { type: "almoco", time: "12:00" },
      { type: "lanche", time: "15:30" }
    ],
    isActive: true
  },
  {
    name: "Escola Básica do Viso",
    code: "171049-EBV",
    address: "Rua Batalha do Viso, 2900-268 Setúbal",
    levels: ["2_ciclo"],
    schedule: {
      startTime: "08:15",
      endTime: "15:30",
      breakTime: "10:15",
      lunchStart: "12:00",
      lunchEnd: "13:00"
    },
    mealTimes: [
      { type: "pequeno_almoço", time: "07:45" },
      { type: "almoco", time: "12:00" },
      { type: "lanche", time: "15:30" }
    ],
    isActive: true
  },

  // ========== ESCOLAS NÃO AGRUPADAS / OUTRAS ==========
  {
    name: "Escola Secundária du Bocage",
    code: "401018",
    address: "Avenida Dr. António Rodrigues Manito, 2900-058 Setúbal",
    levels: ["3_ciclo", "secundario"],
    schedule: {
      startTime: "08:15",
      endTime: "16:15",
      breakTime: "10:15",
      lunchStart: "12:30",
      lunchEnd: "13:30"
    },
    mealTimes: [
      { type: "pequeno_almoço", time: "07:45" },
      { type: "almoco", time: "12:30" },
      { type: "lanche", time: "16:15" }
    ],
    isActive: true
  },
  {
    name: "Escola Secundária D. João II",
    code: "401316",
    address: "2900-000 Setúbal",
    levels: ["3_ciclo", "secundario"],
    schedule: {
      startTime: "08:15",
      endTime: "16:15",
      breakTime: "10:15",
      lunchStart: "12:30",
      lunchEnd: "13:30"
    },
    mealTimes: [
      { type: "pequeno_almoço", time: "07:45" },
      { type: "almoco", time: "12:30" },
      { type: "lanche", time: "16:15" }
    ],
    isActive: true
  },
  {
    name: "Escola Básica dos Arcos",
    code: "171256-EBARC",
    address: "Rua Joaquim Venâncio, 2900-425 Setúbal",
    levels: ["2_ciclo"],
    schedule: {
      startTime: "08:15",
      endTime: "15:30",
      breakTime: "10:15",
      lunchStart: "12:00",
      lunchEnd: "13:00"
    },
    mealTimes: [
      { type: "pequeno_almoço", time: "07:45" },
      { type: "almoco", time: "12:00" },
      { type: "lanche", time: "15:30" }
    ],
    isActive: true
  }
];

async function seedSchools() {
  console.log('Conectando ao MongoDB...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    const db = mongoose.connection.db;

    // Drop existing schools
    const existingCount = await db.collection('schools').countDocuments();
    if (existingCount > 0) {
      await db.collection('schools').deleteMany({});
      console.log(`🗑️ Removidas ${existingCount} escolas existentes`);
    }

    // Insert new schools
    const result = await db.collection('schools').insertMany(schools);
    console.log(`✅ Inseridas ${result.insertedCount} escolas com sucesso!`);

    // List all schools
    const inserted = await db.collection('schools').find({}).sort({ name: 1 }).toArray();
    console.log('\n📚 ESCOLAS DE SETÚBAL COM 2º E 3º CICLO:');
    console.log('==========================================');
    inserted.forEach((school, i) => {
      const levels = school.levels.map(l => {
        switch(l) {
          case '2_ciclo': return '2º Ciclo';
          case '3_ciclo': return '3º Ciclo';
          case 'secundario': return 'Secundário';
          default: return l;
        }
      }).join(' + ');
      console.log(`${i + 1}. ${school.name}`);
      console.log(`   Código: ${school.code}`);
      console.log(`   Níveis: ${levels}`);
      console.log(`   Morada: ${school.address}`);
      console.log(`   Horário: ${school.schedule.startTime} - ${school.schedule.endTime}`);
      console.log('');
    });

    console.log(`Total: ${inserted.length} escolas inseridas no banco de dados.`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nConexão ao MongoDB fechada.');
  }
}

seedSchools();
