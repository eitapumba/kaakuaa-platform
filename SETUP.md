# KAA KUAA — Guia de Setup

## Pré-requisitos

1. **Node.js 20+** — https://nodejs.org
2. **Docker Desktop** — https://docker.com/products/docker-desktop
3. **Git** — https://git-scm.com

## Setup Rápido (5 minutos)

```bash
# 1. Entrar na pasta do projeto
cd kaakuaa-platform

# 2. Instalar dependências
npm install --legacy-peer-deps

# 3. Iniciar TUDO (banco + backend + web)
./start.sh          # Mac/Linux
start.bat            # Windows
```

Pronto! Acesse:
- **Web**: http://localhost:3000
- **API**: http://localhost:4000/api/v1

## Comandos Disponíveis

| Comando | O que faz |
|---------|-----------|
| `./start.sh` | Inicia tudo (DB + Backend + Web) |
| `./start.sh web` | Só o frontend web |
| `./start.sh backend` | Backend + banco |
| `./start.sh db` | Só PostgreSQL + Redis |
| `./start.sh install` | Instala dependências |
| `./start.sh stop` | Para todos os serviços |

## Estrutura do Projeto

```
kaakuaa-platform/
├── apps/
│   ├── backend/     → NestJS API (porta 4000)
│   ├── web/         → Next.js frontend (porta 3000)
│   └── mobile/      → React Native + Expo
├── packages/
│   └── shared/      → Tipos e constantes compartilhados
├── docker-compose.yml
├── start.sh         → Script Mac/Linux
└── start.bat        → Script Windows
```

## Portas

| Serviço | Porta |
|---------|-------|
| Web Frontend | 3000 |
| Backend API | 4000 |
| PostgreSQL | 5432 |
| Redis | 6379 |

## Banco de Dados

Credenciais de desenvolvimento (definidas no docker-compose.yml):
- **User**: kaakuaa
- **Password**: kaakuaa123
- **Database**: kaakuaa

## Troubleshooting

**"Docker not found"** → Instale Docker Desktop e certifique que está rodando

**"Port already in use"** → Algum outro app já usa a porta. Pare ele ou mude a porta no .env

**"npm install falhou"** → Tente `npm install --legacy-peer-deps`

**Backend não conecta no banco** → Verifique se Docker está rodando: `docker ps`
