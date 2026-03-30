# 🛡️ Digital Detox - App de Combate ao Vício Digital

Uma Progressive Web App (PWA) desenvolvida para incentivar crianças e adolescentes (10-18 anos) a reduzir o tempo de ecrã e socializar mais offline, com sistema de gamificação baseado em animal virtual, validação por IA (ChatGPT) e painel para professores e pais.

## 🚀 Stack Tecnológica

- **Frontend**: React 18 + Material UI (MUI v5) + React Router v6
- **Backend**: Express.js + MongoDB (Mongoose) + JWT Authentication
- **IA**: OpenAI GPT-4o (validação de fotos) + GPT-4o-mini (sugestões)
- **PWA**: Service Worker + Web App Manifest
- **Deploy**: Monorepo pronto para deploy em qualquer plataforma

## 📁 Estrutura do Projeto

```
digital-detox-app/
├── client/                    # React Frontend (PWA)
│   ├── public/
│   │   ├── icons/            # PWA icons
│   │   ├── manifest.json     # PWA manifest
│   │   ├── sw.js             # Service Worker
│   │   └── index.html
│   └── src/
│       ├── components/       # Componentes reutilizáveis
│       │   ├── common/       # LoadingSpinner, PointsDisplay, PetAvatar
│       │   └── layout/       # AppHeader, BottomNav
│       ├── context/          # AuthContext (JWT state)
│       ├── pages/            # Páginas da aplicação
│       │   ├── Auth/         # Login, Register (3 perfis)
│       │   ├── Dashboard/    # Dashboard, Notifications, Ranking
│       │   ├── School/       # Secção Escola
│       │   ├── Pet/          # Animal Virtual
│       │   ├── Outside/      # Fora da Escola
│       │   └── Profile/      # Perfil do Utilizador
│       ├── services/         # API service (Axios)
│       └── theme/            # Material UI theme
├── server/                    # Express Backend
│   ├── src/index.js          # Entry point
│   ├── config/               # DB config
│   ├── middleware/            # Auth, Upload, ErrorHandler
│   ├── models/               # MongoDB Models (11 models)
│   ├── routes/               # API Routes (9 route files)
│   ├── services/             # OpenAI integration
│   └── utils/                # Seed script
├── package.json              # Root scripts
└── .gitignore
```

## 👥 3 Perfis de Utilizador

| Perfil | Funcionalidades |
|--------|----------------|
| **Aluno(a)** (10-18 anos) | Dashboard, atividades, ranking, animal virtual, upload de fotos, sugestões IA |
| **Professor(a)** | Criar/validar atividades, presenças, notas, ranking da turma |
| **Pai/Mãe** | Dashboard dos filhos, definir horários, limites de ecrã, tempo em família |

## 🔧 Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- MongoDB 6+
- Conta OpenAI (para validação por IA)

### 1. Clonar o repositório
```bash
git clone https://github.com/bfrpaulondev/digital-detox-app.git
cd digital-detox-app
```

### 2. Instalar dependências
```bash
npm run install-all
```

### 3. Configurar variáveis de ambiente
```bash
# Editar server/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/digital-detox
JWT_SECRET=sua_chave_secreta_aqui
OPENAI_API_KEY=sk-sua-api-key-aqui
```

### 4. Popular a base de dados
```bash
npm run seed
```

### 5. Iniciar em modo desenvolvimento
```bash
npm run dev
```

O frontend abre em `http://localhost:3000` e o backend em `http://localhost:5000`.

## 🎮 Credenciais de Demo (após seed)

| Perfil | Email | Senha |
|--------|-------|-------|
| Professor(a) | maria.silva@escola.pt | teacher123 |
| Aluno(a) | joao.santos@email.com | student123 |
| Pai/Mãe | ana.santos@email.com | parent123 |

## 📱 Secções da Aplicação

### Escola
- **Professor**: Criar atividades, validar participações, ver ranking
- **Aluno**: Ver atividades pendentes, concluir, ver progresso

### Animal Virtual
- Escolher entre 4 espécies (Gato, Cão, Pássaro, Tartaruga)
- Alimentar com pontos ganhos
- Acompanhar evolução (4 estágios, 20 níveis)
- Sistema de humor baseado nos stats

### Fora da Escola
- **Alunos**: Atividades offline, sugestões IA, prova por foto
- **Pais**: Dashboard dos filhos, horários, limites de ecrã

## 🤖 Integração com ChatGPT

- **Validação de Fotos**: GPT-4o analisa fotos para detetar rostos/selfies e validar provas de atividades
- **Sugestões Personalizadas**: GPT-4o-mini gera sugestões de atividades baseadas nas preferências do utilizador
- **Validação de Atividades**: Verifica se atividades propostas são adequadas

## 📱 PWA Features

- Instalável no telemóvel/tablet
- Funciona offline (service worker)
- Mobile-first design
- Safe area support (notch)
- Add to Home Screen

## 🏗️ MongoDB Models

11 modelos: User, School, Activity, Pet, Photo, Points, Achievement, Attendance, ScreenTime, Reward, Notification

## 📄 Licença

Este projeto foi desenvolvido para fins académicos.
