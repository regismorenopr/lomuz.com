import { Pool } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('DATABASE_URL não configurada. Usando mock ou falhando.');
}

export const pool = new Pool({ connectionString });

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
};