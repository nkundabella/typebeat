import { Pool, Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const baseDatabaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

// Helper to replace the database name in a connection string
const getDbUrlForDatabase = (url: string, dbName: string) => {
  try {
    const parsed = new URL(url);
    parsed.pathname = `/${dbName}`;
    return parsed.toString();
  } catch (error) {
    // Fallback simple replacement if URL parsing fails
    const lastSlash = url.lastIndexOf('/');
    return url.substring(0, lastSlash) + '/' + dbName;
  }
};

export let pool: Pool;

// Preloaded songs to seed the database if it is empty
const SAMPLE_SONGS_SEED = [
  {
    id: 'song_1',
    title: 'Ethereal Dreams',
    artist: 'Cosmic Echo',
    genre: 'Synthwave',
    lyrics: `In the neon glow of the midnight sky\nWhere the stars dance and the dreams fly high\nI find myself lost in your eyes\nAs the world around us slowly dies`,
    duration: 180,
    audio_url: '/audio/ethereal-dreams.mp3',
    locked: false,
    required_wpm: 0,
    bpm: 120,
    difficulty: 'beginner',
    cover_art: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop'
  },
  {
    id: 'song_2',
    title: 'Digital Heart',
    artist: 'Synth Wave',
    genre: 'Electronic',
    lyrics: `Circuits pulsing with electric dreams\nNothing is ever what it seems\nBinary heartbeat in the code\nFollowing the digital road`,
    duration: 200,
    audio_url: '/audio/digital-heart.mp3',
    locked: false,
    required_wpm: 40,
    bpm: 140,
    difficulty: 'intermediate',
    cover_art: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop'
  },
  {
    id: 'song_3',
    title: 'Neon Knights',
    artist: 'Night Runner',
    genre: 'Synthwave',
    lyrics: `Riding through the city streets so bright\nNeon knights of the endless night\nChasing shadows and the morning light\nWe are the legends of the fight`,
    duration: 220,
    audio_url: '/audio/neon-knights.mp3',
    locked: true,
    required_wpm: 60,
    bpm: 165,
    difficulty: 'advanced',
    cover_art: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop'
  },
  {
    id: 'song_4',
    title: 'Quantum Leap',
    artist: 'Future Pulse',
    genre: 'Electronic',
    lyrics: `Jumping through dimensions of time and space\nRunning at the quantum pace\nEvery moment is a brand new place\nWhere we find our saving grace`,
    duration: 190,
    audio_url: '/audio/quantum-leap.mp3',
    locked: true,
    required_wpm: 50,
    bpm: 155,
    difficulty: 'intermediate',
    cover_art: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'
  }
];

export async function initializeDatabase() {
  const isCloudDb = baseDatabaseUrl.includes('neon.tech') || 
                    baseDatabaseUrl.includes('supabase') || 
                    baseDatabaseUrl.includes('render.com') || 
                    baseDatabaseUrl.includes('elephantsql') ||
                    baseDatabaseUrl.includes('aiven.io');

  const sslOption = isCloudDb ? { rejectUnauthorized: false } : undefined;

  console.log(`Database profile detected: ${isCloudDb ? 'Cloud-hosted Postgres' : 'Local Postgres'}`);

  if (!isCloudDb) {
    console.log('Running auto-creation check for local database...');
    // Step 1: Connect to initial database (e.g. postgres) to verify if 'typebeat' database exists
    const client = new Client({ connectionString: baseDatabaseUrl });
    try {
      await client.connect();
      
      // Check if 'typebeat' db exists
      const dbCheck = await client.query("SELECT 1 FROM pg_database WHERE datname = 'typebeat'");
      if (dbCheck.rowCount === 0) {
        console.log("Database 'typebeat' does not exist. Creating it now...");
        await client.query("CREATE DATABASE typebeat");
        console.log("Database 'typebeat' created successfully!");
      } else {
        console.log("Database 'typebeat' already exists.");
      }
    } catch (error) {
      console.error('Failed during database check/creation:', error);
      throw error;
    } finally {
      await client.end();
    }
  }

  // Step 2: Establish the main Connection Pool directly to the database URL
  // If it's local, we target 'typebeat'. If it's a cloud database (like Neon), we target their pre-defined database name
  const targetDbUrl = isCloudDb ? baseDatabaseUrl : getDbUrlForDatabase(baseDatabaseUrl, 'typebeat');
  console.log(`Establishing Connection Pool...`);
  
  pool = new Pool({ 
    connectionString: targetDbUrl,
    ssl: sslOption
  });

  // Test the pool connection
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Successfully connected to target database at:', res.rows[0].now);
  } catch (err) {
    console.error('Error connecting to database pool:', err);
    throw err;
  }

  // Step 3: Initialize Database Schema (Tables)
  try {
    console.log('Initializing database tables...');
    
    // Songs Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS songs (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255) NOT NULL,
        genre VARCHAR(100) NOT NULL,
        lyrics TEXT NOT NULL,
        synced_lyrics TEXT,
        duration INT NOT NULL,
        audio_url VARCHAR(512) NOT NULL,
        locked BOOLEAN DEFAULT FALSE,
        required_wpm INT DEFAULT 0,
        bpm INT NOT NULL,
        difficulty VARCHAR(50) NOT NULL,
        cover_art VARCHAR(512),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Scores Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scores (
        id SERIAL PRIMARY KEY,
        song_id VARCHAR(100) NOT NULL,
        wpm DOUBLE PRECISION NOT NULL,
        accuracy DOUBLE PRECISION NOT NULL,
        score INT NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Profiles Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        username VARCHAR(100) DEFAULT 'William_Prime',
        avatar_seed VARCHAR(100) DEFAULT 'Felix',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default profile if table is empty
    const profileCountRes = await pool.query('SELECT COUNT(*) FROM profiles');
    if (parseInt(profileCountRes.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO profiles (id, username, avatar_seed) 
        VALUES (1, 'William_Prime', 'Felix')
      `);
      console.log('Default profile successfully seeded!');
    }

    console.log('Database tables verified/created successfully.');

    // Step 4: Seed Sample Songs if the songs table is empty
    const songCountRes = await pool.query('SELECT COUNT(*) FROM songs');
    const songCount = parseInt(songCountRes.rows[0].count, 10);
    
    if (songCount === 0) {
      console.log('Songs table is empty. Seeding initial songs...');
      for (const song of SAMPLE_SONGS_SEED) {
        await pool.query(`
          INSERT INTO songs (id, title, artist, genre, lyrics, duration, audio_url, locked, required_wpm, bpm, difficulty, cover_art)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          song.id,
          song.title,
          song.artist,
          song.genre,
          song.lyrics,
          song.duration,
          song.audio_url,
          song.locked,
          song.required_wpm,
          song.bpm,
          song.difficulty,
          song.cover_art
        ]);
      }
      console.log('Starter songs successfully seeded!');
    } else {
      console.log(`Songs table already populated with ${songCount} songs.`);
    }

  } catch (error) {
    console.error('Failed during schema initialization or seeding:', error);
    throw error;
  }
}
