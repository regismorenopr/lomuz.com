
# Configuração de Produção - LOMUZ

Este guia detalha os passos exatos para conectar o domínio `lomuz.com` via Cloudflare.

## 1. Cloudflare DNS

Acesse o painel do Cloudflare e configure as seguintes entradas DNS:

| Type  | Name | Target (Value) | Proxy Status | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| **CNAME** | `api` | `SEU-BACKEND-HOST.com` | **Proxied (Laranja)** | Aponta `api.lomuz.com` para o servidor Node.js |
| **CNAME** | `@` | `lomuz.pages.dev` | **Proxied (Laranja)** | Aponta a raiz `lomuz.com` para o Cloudflare Pages |
| **CNAME** | `www` | `lomuz.pages.dev` | **Proxied (Laranja)** | Aponta `www.lomuz.com` para o Cloudflare Pages |

*Nota: Substitua `SEU-BACKEND-HOST.com` pelo endereço real do seu servidor (ex: Railway, Render, EC2 Public DNS).*

---

## 2. Cloudflare SSL/TLS

1.  Vá em **SSL/TLS** > **Overview**.
2.  Defina o modo de encriptação para **Full (Strict)**.
    *   Isso exige que seu servidor backend (Backend Host) tenha um certificado SSL válido (mesmo que auto-assinado ou Let's Encrypt).
3.  Vá em **SSL/TLS** > **Edge Certificates**.
4.  Garanta que "Always Use HTTPS" esteja **ON**.

---

## 3. Variáveis de Ambiente (Backend)

No painel de hospedagem do Node.js (ex: Render/Railway), configure:

```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://lomuz.com,https://www.lomuz.com
FRONTEND_URL=https://lomuz.com
# ... demais variáveis de DB e Email
```

---

## 4. Variáveis de Ambiente (Frontend - Cloudflare Pages)

No painel do Cloudflare Pages (Settings > Environment variables > Production):

```env
VITE_API_BASE_URL=https://api.lomuz.com
```

*Importante: Após alterar a variável, é necessário fazer um novo deploy (Retry deployment).*

---

## 5. Checklist de Validação

1.  Acesse `https://lomuz.com`. O site carrega com cadeado seguro?
2.  Acesse `https://api.lomuz.com/api/health/db`. Retorna JSON `{ ok: true }`?
3.  Faça login no painel. O console do navegador (F12) mostra erros de CORS? Se sim, verifique a variável `CORS_ORIGIN` no backend.
4.  Recarregue a página em uma rota interna (ex: `/radios`). Se der erro 404, verifique se o arquivo `_redirects` foi copiado para a pasta `dist` durante o build.
