
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { compare } from 'bcryptjs'

// --- CONFIG ---
neonConfig.fetchConnectionCache = true

type Bindings = {
  DATABASE_URL: string
  JWT_SECRET: string
}

type Variables = {
  user: {
    id: string
    orgId: string
    role: 'DIRECTOR' | 'CLIENT'
  }
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// --- MIDDLEWARE ---

// 1. CORS
app.use('/api/*', cors({
  origin: (origin) => {
    return origin.includes('localhost') || origin.includes('lomuz.com') ? origin : 'https://lomuz.com'
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// 2. AUTHENTICATION (JWT)
app.use('/api/*', async (c, next) => {
  // Public routes
  if (c.req.path.endsWith('/login') || c.req.path === '/api/health') {
    return next()
  }

  const jwtMiddleware = jwt({ secret: c.env.JWT_SECRET })
  return jwtMiddleware(c, next)
})

// 3. RLS DATABASE HELPER
async function dbQuery(c: any, sql: string, params: any[] = []) {
  const payload = c.get('jwtPayload')
  const orgId = payload?.orgId

  if (!orgId && !c.req.path.includes('/login')) {
    throw new Error('Security Error: No Organization Context')
  }

  const pool = new Pool({ connectionString: c.env.DATABASE_URL })
  
  try {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      
      // --- CRITICAL: ENFORCE RLS ---
      // This sets the session variable that your Postgres Policies use
      if (orgId) {
        await client.query("SELECT set_config('app.current_org', $1, true)", [orgId])
      }
      
      const res = await client.query(sql, params)
      
      await client.query('COMMIT')
      return res.rows
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
  } catch (e: any) {
    console.error('DB Error:', e)
    throw new Error(e.message)
  }
}

// --- ENDPOINTS ---

// Health
app.get('/api/health', (c) => c.json({ status: 'ok', worker: true }))

// Auth: Login
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  const pool = new Pool({ connectionString: c.env.DATABASE_URL })
  
  // Note: Login bypasses RLS wrapper because user is not identified yet
  // We query users table directly. Ensure 'users' table has proper policies or this query finds by email unique.
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email])
  
  if (rows.length === 0) return c.json({ error: 'Invalid credentials' }, 401)
  
  const user = rows[0]
  const valid = await compare(password, user.password_hash)
  
  if (!valid) return c.json({ error: 'Invalid credentials' }, 401)

  // Generate Token
  const token = await import('hono/jwt').then(m => m.sign({
    id: user.id,
    orgId: user.company_id, // Mapping database 'company_id' to logic 'orgId'
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (12 * 60 * 60) // 12h
  }, c.env.JWT_SECRET))

  return c.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company_id // sending ID as company for now
    }
  })
})

// Auth: Me
app.get('/api/me', async (c) => {
  const payload = c.get('jwtPayload')
  return c.json(payload)
})

// --- RADIOS (CRUD) ---

// List Radios
app.get('/api/radios', async (c) => {
  try {
    const payload = c.get('jwtPayload')
    // Explicitly filter by company_id to fix missing RLS policy issues
    const rows = await dbQuery(c, 
      'SELECT * FROM streams WHERE company_id = $1 ORDER BY created_at DESC', 
      [payload.orgId]
    )
    return c.json(rows)
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// Create Radio (Director Only)
app.post('/api/radios', async (c) => {
  const payload = c.get('jwtPayload')
  if (payload.role !== 'DIRECTOR') return c.json({ error: 'Forbidden' }, 403)

  const { name } = await c.req.json()
  
  try {
    // Assuming 'streams' table structure based on migrations provided previously
    // company_id is inserted automatically via RLS if using default or we pass it explicitly
    // Here we pass payload.orgId to be explicit in the insert if RLS policy allows input
    const rows = await dbQuery(c, 
      `INSERT INTO streams (stream_name, company_id, status) 
       VALUES ($1, $2, 'OFFLINE') RETURNING *`, 
      [name, payload.orgId]
    )
    return c.json(rows[0], 201)
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// Update Radio (Director Only)
app.put('/api/radios/:id', async (c) => {
  const payload = c.get('jwtPayload')
  if (payload.role !== 'DIRECTOR') return c.json({ error: 'Forbidden' }, 403)

  const id = c.req.param('id')
  const body = await c.req.json()
  
  // Dynamic update builder
  const updates: string[] = []
  const values: any[] = []
  let idx = 1

  if (body.name) { updates.push(`stream_name = $${idx++}`); values.push(body.name) }
  if (body.streamUrl) { updates.push(`stream_url = $${idx++}`); values.push(body.streamUrl) }
  if (body.city) { updates.push(`city = $${idx++}`); values.push(body.city) }
  
  if (updates.length === 0) return c.json({ error: 'No fields' }, 400)

  values.push(id) // ID is last param

  try {
    const rows = await dbQuery(c, 
      `UPDATE streams SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )
    return c.json(rows[0])
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// --- PLAYER CONFIG ---

app.get('/api/radios/:id/player-config', async (c) => {
  const id = c.req.param('id')
  
  try {
    // Join streams with settings to get full config
    // We select specific fields needed for the player
    const sql = `
      SELECT 
        s.stream_url,
        COALESCE(rs.music_volume, 80) as music_volume,
        COALESCE(rs.media_volume, 100) as media_volume,
        COALESCE(rs.bitrate, 128) as bitrate,
        COALESCE(rs.weather_city, 'São Paulo') as weather_city
      FROM streams s
      LEFT JOIN radio_settings rs ON s.id = rs.id
      WHERE s.id = $1
    `
    const rows = await dbQuery(c, sql, [id])
    
    if (rows.length === 0) return c.json({ error: 'Radio not found' }, 404)
    
    return c.json(rows[0])
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// Settings (Get/Set)
app.get('/api/radios/:id/settings', async (c) => {
  const id = c.req.param('id')
  const rows = await dbQuery(c, 'SELECT * FROM radio_settings WHERE id = $1', [id])
  return c.json(rows[0] || {})
})

app.put('/api/radios/:id/settings', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  
  // Upsert Logic for Settings
  const sql = `
    INSERT INTO radio_settings (id, music_volume, media_volume, weather_city)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (id) DO UPDATE SET
      music_volume = EXCLUDED.music_volume,
      media_volume = EXCLUDED.media_volume,
      weather_city = EXCLUDED.weather_city,
      updated_at = NOW()
    RETURNING *
  `
  
  try {
    const rows = await dbQuery(c, sql, [
      id, 
      body.musicVolume || 80, 
      body.mediaVolume || 100, 
      body.weatherCity
    ])
    return c.json(rows[0])
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

export default app
