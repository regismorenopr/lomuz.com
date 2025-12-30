
// Script isolado para teste de conexão (npm run db:ping)
require('dotenv').config();
const db = require('../db');

console.log('🔄 Tentando conectar ao PostgreSQL...');

(async () => {
  try {
    const start = Date.now();
    await db.query('SELECT 1');
    const duration = Date.now() - start;
    
    console.log(`✅ DB OK (${duration}ms)`);
    process.exit(0);
  } catch (err) {
    console.error('❌ DB FAIL:', err.message);
    if (err.code) console.error('   Code:', err.code);
    process.exit(1);
  }
})();
