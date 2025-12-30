const db = require('../db');

const DDL = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS companies (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name text NOT NULL,
    created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    name text,
    role text DEFAULT 'CLIENT',
    company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
    id_publico text UNIQUE,
    active boolean DEFAULT true,
    created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS streams (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
    stream_name text NOT NULL,
    stream_url text,
    status text DEFAULT 'OFFLINE',
    kbps integer DEFAULT 128,
    contracted_accesses integer DEFAULT 100,
    config_version integer DEFAULT 1,
    last_published_at timestamp,
    city text,
    state text,
    segment text,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS radio_settings (
    id uuid PRIMARY KEY REFERENCES streams(id) ON DELETE CASCADE,
    music_volume integer DEFAULT 85,
    media_volume integer DEFAULT 95,
    bitrate integer DEFAULT 48,
    weather_city text,
    volume_normalizer_enabled boolean DEFAULT true,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS genres (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL UNIQUE,
    color text,
    hidden_for_client boolean DEFAULT false,
    system_generated boolean DEFAULT false,
    created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media_files (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
    title text NOT NULL,
    file_path text NOT NULL,
    file_hash text NOT NULL,
    duration_seconds integer DEFAULT 0,
    type text DEFAULT 'MUSIC',
    status text DEFAULT 'READY',
    bitrate integer DEFAULT 128,
    created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS playlists (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS playlist_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id uuid REFERENCES playlists(id) ON DELETE CASCADE,
    media_id uuid REFERENCES media_files(id) ON DELETE CASCADE,
    order_idx integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS schedules (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    stream_id uuid REFERENCES streams(id) ON DELETE CASCADE,
    playlist_id uuid REFERENCES playlists(id) ON DELETE CASCADE,
    title text NOT NULL,
    start_date date NOT NULL,
    end_date date,
    is_indefinite boolean DEFAULT false,
    start_time time NOT NULL,
    end_time time NOT NULL,
    days_of_week jsonb NOT NULL, -- [0,1,2,3,4,5,6]
    active boolean DEFAULT true,
    created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS devices (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    stream_id uuid NOT NULL REFERENCES streams(id) ON DELETE CASCADE,
    device_key text NOT NULL,
    status text DEFAULT 'ONLINE',
    last_seen_at timestamp DEFAULT now(),
    UNIQUE(stream_id, device_key)
);
`;

exports.run = async () => {
    try {
        console.log('🔄 [Lomuz Restore] Restaurando Schema 06:00 AM...');
        await db.query(DDL);
        
        let companyId;
        const companyCheck = await db.query("SELECT id FROM companies LIMIT 1");
        if (companyCheck.rows.length === 0) {
            const newCo = await db.query("INSERT INTO companies (company_name) VALUES ('Lomuz Media Group') RETURNING id");
            companyId = newCo.rows[0].id;
        } else {
            companyId = companyCheck.rows[0].id;
        }

        console.log('✅ [Lomuz Restore] Sistema restaurado com sucesso.');
    } catch (error) {
        console.error('❌ [Lomuz Restore] Erro crítico na restauração:', error);
        throw error;
    }
};