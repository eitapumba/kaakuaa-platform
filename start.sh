#!/bin/bash
# ============================================
# KAA KUAA — Script de Inicialização
# ============================================
# Uso:
#   ./start.sh          → Inicia TUDO (DB + Backend + Web)
#   ./start.sh web      → Só o frontend web
#   ./start.sh backend  → Só o backend
#   ./start.sh db       → Só o banco de dados
#   ./start.sh install  → Instala todas as dependências
#   ./start.sh stop     → Para tudo
# ============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'

DIR="$(cd "$(dirname "$0")" && pwd)"

log() { echo -e "${GREEN}[KAA KUAA]${NC} $1"; }
warn() { echo -e "${YELLOW}[AVISO]${NC} $1"; }
err() { echo -e "${RED}[ERRO]${NC} $1"; }

banner() {
  echo ""
  echo -e "${GREEN}${BOLD}"
  echo "  ╔═══════════════════════════════════════╗"
  echo "  ║        🌿  KAA KUAA PLATFORM  🌿      ║"
  echo "  ║     Desafie-se. Regenere o Planeta.    ║"
  echo "  ╚═══════════════════════════════════════╝"
  echo -e "${NC}"
}

check_deps() {
  local missing=0
  for cmd in node npm docker; do
    if ! command -v $cmd &> /dev/null; then
      err "$cmd não encontrado. Instale antes de continuar."
      missing=1
    fi
  done

  if [ $missing -eq 1 ]; then
    echo ""
    echo "Instale as dependências:"
    echo "  - Node.js 20+: https://nodejs.org"
    echo "  - Docker Desktop: https://docker.com/products/docker-desktop"
    exit 1
  fi

  log "Node $(node -v) | npm $(npm -v) | Docker ✓"
}

start_db() {
  log "Iniciando PostgreSQL + Redis..."
  cd "$DIR"
  docker compose up -d

  log "Aguardando banco ficar pronto..."
  sleep 3

  # Wait for postgres
  for i in {1..30}; do
    if docker exec kaakuaa-db pg_isready -U kaakuaa &>/dev/null; then
      log "PostgreSQL pronto!"
      return 0
    fi
    sleep 1
  done
  err "PostgreSQL não iniciou em 30s"
  exit 1
}

install_deps() {
  log "Instalando dependências..."
  cd "$DIR"
  npm install --legacy-peer-deps
  log "Dependências instaladas!"
}

start_backend() {
  log "Iniciando Backend (porta 4000)..."
  cd "$DIR/apps/backend"

  if [ ! -f .env ]; then
    warn "Arquivo .env não encontrado, usando padrões..."
  fi

  npm run dev &
  BACKEND_PID=$!
  echo $BACKEND_PID > "$DIR/.backend.pid"
  log "Backend iniciado (PID: $BACKEND_PID)"
  log "API: http://localhost:4000/api/v1"
}

start_web() {
  log "Iniciando Frontend Web (porta 3000)..."
  cd "$DIR/apps/web"
  npm run dev &
  WEB_PID=$!
  echo $WEB_PID > "$DIR/.web.pid"
  log "Frontend Web iniciado (PID: $WEB_PID)"
  log "Web: http://localhost:3000"
}

stop_all() {
  log "Parando todos os serviços..."

  if [ -f "$DIR/.backend.pid" ]; then
    kill $(cat "$DIR/.backend.pid") 2>/dev/null || true
    rm "$DIR/.backend.pid"
    log "Backend parado"
  fi

  if [ -f "$DIR/.web.pid" ]; then
    kill $(cat "$DIR/.web.pid") 2>/dev/null || true
    rm "$DIR/.web.pid"
    log "Web parado"
  fi

  cd "$DIR"
  docker compose down 2>/dev/null || true
  log "Banco de dados parado"

  log "Tudo parado!"
}

# ============================================
# MAIN
# ============================================
banner
check_deps

case "${1:-all}" in
  all)
    start_db
    start_backend
    sleep 2
    start_web
    echo ""
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "Tudo rodando!"
    log ""
    log "  🌐 Web:     http://localhost:3000"
    log "  🔧 API:     http://localhost:4000/api/v1"
    log "  🐘 Postgres: localhost:5432"
    log "  📦 Redis:    localhost:6379"
    log ""
    log "Para parar: ./start.sh stop"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    wait
    ;;
  web)
    start_web
    log "Web: http://localhost:3000"
    wait
    ;;
  backend)
    start_db
    start_backend
    log "API: http://localhost:4000/api/v1"
    wait
    ;;
  db)
    start_db
    log "Banco de dados rodando!"
    ;;
  install)
    install_deps
    ;;
  stop)
    stop_all
    ;;
  *)
    echo "Uso: ./start.sh [all|web|backend|db|install|stop]"
    exit 1
    ;;
esac
