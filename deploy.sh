#!/bin/bash
# ============================================
# DEPLOY SCRIPT - Digital Detox App na Vercel
# ============================================
# 
# PRÉ-REQUISITOS:
# 1. Ter a Vercel CLI instalada: npm i -g vercel
# 2. Estar logado na Vercel: vercel login
# 3. Ter MongoDB Atlas com URI pronta
# 4. Ter OpenAI API Key
# 5. (Opcional) Ter Cloudinary configurado
#
# ============================================

set -e

echo "🚀 Digital Detox - Deploy na Vercel"
echo "===================================="
echo ""

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 A instalar Vercel CLI..."
    npm install -g vercel
fi

# Check if logged in
echo "🔑 Verificando login na Vercel..."
vercel whoami 2>/dev/null || {
    echo "❌ Não está logado na Vercel. Execute: vercel login"
    exit 1
}

echo "✅ Login verificado"
echo ""

# Deploy to production
echo "🚀 Fazendo deploy para produção..."
vercel --prod --yes

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Acesse https://vercel.com/dashboard"
echo "2. Vá em Settings > Environment Variables"
echo "3. Adicione as seguintes variáveis:"
echo ""
echo "   MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/digital-detox"
echo "   JWT_SECRET = sua_chave_secreta_super_segura_aqui"
echo "   JWT_EXPIRES_IN = 7d"
echo "   OPENAI_API_KEY = sk-sua-openai-api-key"
echo "   NODE_ENV = production"
echo ""
echo "   (Opcional - para upload de fotos):"
echo "   CLOUDINARY_CLOUD_NAME = seu_cloud_name"
echo "   CLOUDINARY_API_KEY = sua_api_key"
echo "   CLOUDINARY_API_SECRET = seu_api_secret"
echo ""
echo "4. Re-deploy: vercel --prod"
echo ""
echo "🌐 MongoDB Atlas (grátis): https://www.mongodb.com/atlas"
echo "☁️  Cloudinary (grátis): https://cloudinary.com/users/register_free"
