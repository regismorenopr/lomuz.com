
/**
 * BACKEND REFERENCE GUIDE
 *
 * This file contains the requested structure for the Node.js backend and PostgreSQL database.
 * Since this is a browser-based preview, the actual logic is simulated in `services/mockApi.ts`.
 * Use the code below when deploying the real server.
 */

export const POSTGRESQL_SCHEMA = `
-- Database Creation
CREATE DATABASE lomuz_radio_system;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('DIRECTOR', 'CLIENT')) DEFAULT 'CLIENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GENRES TABLE (NEW: Core Entity)
CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(20) DEFAULT '#009B4D',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Radios Table
CREATE TABLE radios (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company_name VARCHAR(150),
    stream_url VARCHAR(255),
    -- Status Enum Updated: ONLINE, OFFLINE, MAINTENANCE, ALERT
    status VARCHAR(20) DEFAULT 'OFFLINE', 
    primary_genre VARCHAR(50), -- Just for display/categorization
    
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL,
    
    link_panel VARCHAR(255),
    bitrate_kbps INTEGER DEFAULT 128,
    active_sessions INTEGER DEFAULT 0,
    session_limit INTEGER DEFAULT 0,
    
    listeners INTEGER DEFAULT 0,
    
    last_connection_at TIMESTAMP, -- NEW: For connection status logic
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Music Library Table
CREATE TABLE songs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    artist VARCHAR(100),
    file_path VARCHAR(255) NOT NULL,
    duration INTEGER,
    format VARCHAR(10) DEFAULT 'aac',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Song Genres Pivot Table (NEW: Many-to-Many)
CREATE TABLE song_genres (
    song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
    genre_id INTEGER REFERENCES genres(id) ON DELETE RESTRICT,
    PRIMARY KEY (song_id, genre_id)
);

-- Playlists Table
CREATE TABLE playlists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Playlist Scopes (Optional: Restrict playlist to genres)
CREATE TABLE playlist_genres (
    playlist_id INTEGER REFERENCES playlists(id) ON DELETE CASCADE,
    genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (playlist_id, genre_id)
);

-- Playlist Songs
CREATE TABLE playlist_songs (
    id SERIAL PRIMARY KEY,
    playlist_id INTEGER REFERENCES playlists(id) ON DELETE CASCADE,
    song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
    order_index INTEGER
);

-- Scheduling Table
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    radio_id INTEGER REFERENCES radios(id),
    media_type VARCHAR(20) CHECK (media_type IN ('PLAYLIST', 'LIVE', 'AD')),
    media_id INTEGER,
    scheduled_time TIMESTAMP NOT NULL,
    title VARCHAR(150)
);

-- Configurations Table
CREATE TABLE configurations (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    description TEXT
);
`;

export const BACKEND_STRUCTURE_GUIDE = `
/backend
  /src
    /config
      db.ts
    /controllers
      authController.ts
      radioController.ts
      musicController.ts
      genreController.ts  <-- NEW
      scheduleController.ts
    /models
      Genre.ts            <-- NEW
      Song.ts
      Playlist.ts
    /services
      RadioStatusService.ts <-- NEW: Logic to auto-update status based on last_connection_at
    /routes
      authRoutes.ts
      radioRoutes.ts
      musicRoutes.ts
      genreRoutes.ts      <-- NEW
`;