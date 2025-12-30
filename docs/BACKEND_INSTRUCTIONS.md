
# Instruções para o Backend Lomuz

Os arquivos do backend estão na pasta `/backend`.

## 1. Pré-requisitos
*   Node.js instalado.
*   PostgreSQL instalado e rodando.

## 2. Instalação Automática
Como o arquivo `package.json` já foi criado com as dependências (`pg`, `dotenv`, etc), basta executar:

1.  Abra o terminal na pasta `backend`.
2.  Execute:
    ```bash
    npm install
    ```
    *Isso baixará e instalará todas as bibliotecas necessárias.*

## 3. Configuração do Banco de Dados (.env)
Certifique-se de que o arquivo `.env` na pasta `backend` está com seus dados corretos:

```env
PORT=3001
JWT_SECRET=lomuz_jwt_secret_key_v2

# Configuração do PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=lomuz
DB_PASSWORD=rmix2006
DB_NAME=lomuz_db
DB_DIALECT=postgres

# E-mail (Opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=senha_de_app_gmail
SMTP_FROM="Lomuz System <noreply@lomuz.com>"

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173
```

## 4. Rodando o Servidor
Execute: 
```bash
npm start
```

O servidor rodará na porta 3001 e criará as tabelas do banco automaticamente.
