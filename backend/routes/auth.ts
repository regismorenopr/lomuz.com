import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { db } from '../db';
import { compare } from 'bcryptjs';

export const auth = new Hono();

auth.post('/login', async (c) => {
  const { email, password } = await c.req.json();
  const secret = process.env.JWT_SECRET || 'lomuz-ultra-secret';

  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  if (rows.length === 0) return c.json({ error: 'Credenciais inválidas' }, 401);

  const user = rows[0];
  const isValid = await compare(password, user.password_hash);
  if (!isValid) return c.json({ error: 'Credenciais inválidas' }, 401);

  const token = await sign({
    id: user.id,
    orgId: user.company_id,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24h
  }, secret);

  return c.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company_id: user.company_id
    }
  });
});