# KAA KUAA — Deploy na Nuvem (Gratuito)

## Resultado Final
Seu primo (ou qualquer pessoa) abre um link tipo `kaakuaa.vercel.app` no celular ou PC e já pode criar conta e jogar. Sem instalar nada.

---

## Passo 1: Banco de Dados — Neon (grátis)

1. Vai em https://neon.tech e cria conta (pode usar Google)
2. Cria um novo projeto: "kaakuaa"
3. Copia a **connection string** que aparece (tipo `postgresql://neondb_owner:abc123@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`)
4. Guarda essa string — vai usar no passo 2

## Passo 2: Backend API — Railway (grátis)

1. Vai em https://railway.app e cria conta (usa GitHub)
2. Clica "New Project" → "Deploy from GitHub repo"
3. Conecta o repo do kaakuaa-platform
4. Configura:
   - **Root directory**: `apps/backend`
   - **Build command**: `npm install --legacy-peer-deps && npm run build`
   - **Start command**: `node dist/main.js`
5. Vai em "Variables" e adiciona:
   ```
   DATABASE_URL = (cola a string do Neon aqui)
   JWT_SECRET = kaakuaa-prod-secret-2026
   NODE_ENV = production
   FRONTEND_URL = https://kaakuaa.vercel.app
   ```
6. Clica "Deploy" — em 2-3 min tá rodando
7. Copia a URL que o Railway gera (tipo `kaakuaa-backend.up.railway.app`)

## Passo 3: Frontend Web — Vercel (grátis)

1. Vai em https://vercel.com e cria conta (usa GitHub)
2. Clica "New Project" → importa o repo kaakuaa-platform
3. Configura:
   - **Root directory**: `apps/web`
   - **Framework Preset**: Next.js
4. Vai em "Environment Variables" e adiciona:
   ```
   NEXT_PUBLIC_API_URL = https://kaakuaa-backend.up.railway.app/api/v1
   NEXT_PUBLIC_WS_URL = https://kaakuaa-backend.up.railway.app
   ```
5. Clica "Deploy" — em 1-2 min tá no ar!

## Pronto!

Acessa `https://kaakuaa.vercel.app` e tá funcionando.

Para testar com 2 jogadores:
1. Você cria uma conta no site
2. Seu primo abre o mesmo link no celular dele e cria outra conta
3. Os dois escolhem a mesma categoria + stake parecido
4. O sistema faz o match automático e as câmeras ligam!

## Domínio Próprio (opcional)

Depois pode configurar `kaakuaa.com` no Vercel:
1. Compra o domínio (Namecheap, GoDaddy, etc)
2. No Vercel: Settings → Domains → Add Domain
3. Configura o DNS conforme instruções do Vercel
