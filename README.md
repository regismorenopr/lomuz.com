
# Lomuz Streaming System (v2.0)

Sistema completo para gestão de rádio indoor, streaming e mídia corporativa.

## 🏗 Arquitetura

- **Backend:** Node.js (Express), PostgreSQL, Sequelize.
- **Frontend:** React (Vite), TailwindCSS.
- **Storage:** Local (default) ou S3/R2.
- **Segurança:** Helmet, Rate Limit, CORS restrito, Validação de Tenant.

## 🚀 Instalação (Local)

1. **Backend**
   ```bash
   cd backend
   cp .env.example .env
   # Configure o .env com suas credenciais de banco de dados
   npm install
   npm run db:migrate:up
   npm start
   ```

2. **Frontend**
   ```bash
   # Na raiz
   npm install
   npm run dev
   ```

## 📦 Deploy em Produção

1. **Variáveis de Ambiente (Backend)**
   - `NODE_ENV=production`
   - `DB_HOST`, `DB_USER`, `DB_PASS`
   - `CORS_ORIGIN=https://seu-dominio.com`
   - `BILLING_ENABLED=true`

2. **Database**
   - Execute `npm run db:migrate:up` no pipeline de deploy.

3. **Frontend**
   - Execute `npm run build`.
   - Sirva a pasta `dist` via Nginx/CloudFront.

## ✅ Verificações de Sistema

- **Health Check:** `GET /api/health/full`
- **Smoke Test:** `cd backend && npm run smoke:test`

## 🛡 Segurança

- Headers de segurança ativos (Helmet).
- Rate Limiting global aplicado.
- Tratamento de erro centralizado (não expõe stack trace em prod).
