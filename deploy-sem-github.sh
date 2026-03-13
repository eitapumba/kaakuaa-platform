#!/bin/bash
# ============================================
# KAA KUAA — Deploy sem GitHub
# Roda esse script do Mac e sobe tudo pro ar!
# ============================================

set -e

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║         KAA KUAA — Deploy Automático         ║"
echo "║         Sem precisar de GitHub!               ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ---- Cores ----
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# ---- Passo 1: Verificar Node ----
echo -e "${YELLOW}[1/5] Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js não encontrado! Instale em https://nodejs.org${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ Node $(node -v) instalado${NC}"

# ---- Passo 2: Verificar/Instalar npx ----
echo -e "${YELLOW}[2/5] Verificando ferramentas...${NC}"
if ! command -v npx &> /dev/null; then
    echo -e "${RED}npx não encontrado! Reinstale Node.js de https://nodejs.org${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ npx disponível${NC}"

# ---- Passo 3: Build do Frontend ----
echo ""
echo -e "${YELLOW}[3/5] Fazendo build do frontend...${NC}"
echo "  (isso pode levar 1-2 minutos)"
cd apps/web
npm install --legacy-peer-deps 2>/dev/null
npm run build
echo -e "${GREEN}  ✓ Frontend compilado!${NC}"

# ---- Passo 4: Deploy do Frontend no Vercel ----
echo ""
echo -e "${YELLOW}[4/5] Subindo frontend pro Vercel...${NC}"
echo ""
echo "  Vai abrir uma tela pedindo pra fazer login."
echo "  Cria uma conta grátis no Vercel (pode usar email)."
echo "  Depois segue as perguntas:"
echo "    - Set up and deploy? → Y"
echo "    - Which scope? → (escolhe seu nome)"
echo "    - Link to existing project? → N"
echo "    - Project name? → kaakuaa (ou aperta Enter)"
echo "    - Directory? → ./ (aperta Enter)"
echo "    - Override settings? → N"
echo ""
read -p "Aperta ENTER quando estiver pronto..."

npx vercel --prod

echo -e "${GREEN}  ✓ Frontend no ar!${NC}"

# ---- Passo 5: Instruções Backend ----
echo ""
echo -e "${YELLOW}[5/5] Backend — Próximo passo${NC}"
echo ""
echo "════════════════════════════════════════════════"
echo "  O frontend já tá online!"
echo ""
echo "  Pro backend, você tem 2 opções:"
echo ""
echo "  OPÇÃO A — Railway (mais fácil):"
echo "    1. Vai em https://railway.app"
echo "    2. Cria conta com email"
echo "    3. Clica 'New Project' → 'Empty Project'"
echo "    4. Instala Railway CLI: npm install -g @railway/cli"
echo "    5. No terminal, volta pra pasta do backend:"
echo "       cd ../backend"
echo "       railway login"
echo "       railway init"
echo "       railway up"
echo ""
echo "  OPÇÃO B — Render (alternativa):"
echo "    1. Vai em https://render.com"
echo "    2. Cria conta com email"
echo "    3. Clica 'New' → 'Web Service'"
echo "    4. Escolhe 'Deploy from local'"
echo "    5. Arrasta a pasta apps/backend"
echo ""
echo "════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}Pronto! Seu site Kaa Kuaa tá no ar! 🌿${NC}"
