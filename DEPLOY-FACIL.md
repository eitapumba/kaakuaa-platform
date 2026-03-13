# KAA KUAA — Deploy Fácil (Sem GitHub!)

## Você NÃO precisa de GitHub!
Dá pra subir tudo direto do seu Mac usando o terminal.

---

## Passo 1: Banco de Dados — Neon (grátis, 2 min)

1. Abre https://neon.tech no navegador
2. Clica "Sign Up" — pode usar seu email do Google
3. Cria um projeto chamado "kaakuaa"
4. Vai aparecer uma **connection string** tipo:
   ```
   postgresql://neondb_owner:abc123@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. **Copia e guarda** essa string (cola num bloco de notas)

---

## Passo 2: Backend — Railway (grátis, 5 min)

### 2.1 Instalar Railway CLI
Abre o Terminal do Mac e roda:
```bash
npm install -g @railway/cli
```

### 2.2 Fazer login
```bash
railway login
```
(Abre o navegador pra criar conta — pode usar email)

### 2.3 Deploy do backend
```bash
cd ~/Desktop/kaakuaa-platform/apps/backend
railway init
```
Quando perguntar o nome, digita: `kaakuaa-backend`

### 2.4 Configurar variáveis
```bash
railway variables set DATABASE_URL="COLA_A_STRING_DO_NEON_AQUI"
railway variables set JWT_SECRET="kaakuaa-prod-secret-2026"
railway variables set NODE_ENV="production"
railway variables set FRONTEND_URL="https://kaakuaa.vercel.app"
```

### 2.5 Subir!
```bash
railway up
```
Espera 2-3 minutos. No final mostra a URL tipo:
`https://kaakuaa-backend.up.railway.app`

**Guarda essa URL!**

---

## Passo 3: Frontend — Vercel (grátis, 3 min)

### 3.1 Ir pra pasta do frontend
```bash
cd ~/Desktop/kaakuaa-platform/apps/web
```

### 3.2 Deploy!
```bash
npx vercel --prod
```

Vai fazer umas perguntas:
- **Set up and deploy?** → digita `Y`
- **Which scope?** → aperta Enter
- **Link to existing project?** → digita `N`
- **Project name?** → digita `kaakuaa` e Enter
- **In which directory is your code?** → aperta Enter (usa `./`)
- **Want to override?** → digita `N`

Pronto! Em 1-2 minutos sai a URL tipo `kaakuaa.vercel.app`

### 3.3 Configurar URL do backend
Depois do primeiro deploy, configura a URL do backend:
```bash
npx vercel env add NEXT_PUBLIC_API_URL production
```
(Cola: `https://kaakuaa-backend.up.railway.app/api/v1`)

```bash
npx vercel env add NEXT_PUBLIC_WS_URL production
```
(Cola: `https://kaakuaa-backend.up.railway.app`)

Agora faz redeploy:
```bash
npx vercel --prod
```

---

## Pronto! Tá no ar!

Abre `https://kaakuaa.vercel.app` no celular ou PC.

### Testar com 2 jogadores:
1. Você cria conta no site
2. Seu primo abre o mesmo link no celular dele
3. Ele cria outra conta
4. Os dois entram na mesma categoria
5. O sistema faz o match e as câmeras ligam!

---

## Resumo dos serviços (todos grátis):
| Serviço | O que faz | Limite grátis |
|---------|-----------|---------------|
| Neon | Banco de dados | 512 MB |
| Railway | Backend API | 500 horas/mês |
| Vercel | Site/Frontend | Ilimitado |

---

## Se precisar de ajuda:
- O site não carrega? Verifica se o backend tá rodando: `railway logs`
- Erro no banco? Verifica a connection string do Neon
- Quer domínio próprio? Configura no Vercel: Settings → Domains
