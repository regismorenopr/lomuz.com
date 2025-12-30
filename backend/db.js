
require('dotenv').config();
const { Pool } = require('pg');

// Validação de ambiente
if (!process.env.DATABASE_URL && (!process.env.DB_HOST || !process.env.DB_USER)) {
  console.warn('⚠️ [DB] DATABASE_URL ou credenciais DB_* ausentes. Verifique o arquivo .env');
}

const dbConfig = process.env.DATABASE_URL
  ? { 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };

const pool = new Pool(dbConfig);

// Hooks de conexão para Debug
pool.on('connect', () => {
  // Opcional: console.log('✅ [DB] Cliente conectado ao Pool');
});

pool.on('error', (err) => {
  console.error('❌ [DB] Erro inesperado no cliente do pool', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
