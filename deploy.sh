#!/bin/bash
# ============================================
# DEPLOY COMPLETO - Digital Detox App
# ============================================
# Execute este script no terminal do seu computador:
#   bash deploy.sh
# ============================================

set -e

echo ""
echo "============================================"
echo "   Digital Detox - Deploy Automático"
echo "============================================"
echo ""

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
  echo "📦 A instalar Vercel CLI..."
  npm install -g vercel
fi

# Step 1: Login
echo ""
echo "🔐 PASSO 1: Login na Vercel"
echo "   (Abre o browser - faça login com GitHub)"
vercel login

# Step 2: Deploy
echo ""
echo "🚀 PASSO 2: Deploy para produção"
echo "   (Cria o projeto na Vercel)"
vercel --prod --yes

# Step 3: Set environment variables
echo ""
echo "⚙️  PASSO 3: Configurar variáveis de ambiente..."
echo "   (Serão pedidas interativamente)"
echo ""

# MongoDB URI
echo "📌 Definir MONGODB_URI..."
vercel env add MONGODB_URI production

# JWT Secret
echo "📌 Definir JWT_SECRET..."
vercel env add JWT_SECRET production

# JWT Expires
echo "📌 Definir JWT_EXPIRES_IN..."
vercel env add JWT_EXPIRES_IN production <<< "7d"

# OpenAI API Key
echo "📌 Definir OPENAI_API_KEY..."
vercel env add OPENAI_API_KEY production

# Node Environment
echo "📌 Definir NODE_ENV..."
vercel env add NODE_ENV production <<< "production"

# Cloudinary
echo "📌 Definir CLOUDINARY_CLOUD_NAME..."
vercel env add CLOUDINARY_CLOUD_NAME production

echo "📌 Definir CLOUDINARY_API_KEY..."
vercel env add CLOUDINARY_API_KEY production

echo "📌 Definir CLOUDINARY_API_SECRET..."
vercel env add CLOUDINARY_API_SECRET production

# Step 4: Redeploy with env vars
echo ""
echo "🔄 PASSO 4: Re-deploy com variáveis configuradas..."
vercel --prod --yes

echo ""
echo "============================================"
echo "   ✅ DEPLOY COMPLETADO!"
echo "============================================"
echo ""
echo "🌐 A sua app está online!"
echo "   Ver URL no output acima"
echo ""
