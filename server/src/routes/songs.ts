import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { searchiTunes, fetchLyricsFromLRCLib } from '../services/lyricService';

const router = Router();

/**
 * GET /api/songs
 * Fetch all local songs in the PostgreSQL database
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM songs ORDER BY created_at DESC');
    
    // Map database snake_case field names back to the camelCase frontend expects
    const songs = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      artist: row.artist,
      genre: row.genre,
      lyrics: row.lyrics,
      syncedLyrics: row.synced_lyrics,
      duration: row.duration,
      audioUrl: row.audio_url,
      locked: row.locked,
      requiredWPM: row.required_wpm,
      bpm: row.bpm,
      difficulty: row.difficulty,
      coverArt: row.cover_art
    }));

    return res.json(songs);
  } catch (error) {
    console.error('Error fetching local songs:', error);
    return res.status(500).json({ error: 'Failed to retrieve songs from the database.' });
  }
});

/**
 * GET /api/songs/search-external
 * Search songs on iTunes without saving them yet
 */
router.get('/search-external', async (req: Request, res: Response) => {
  const query = req.query.q as string;
  if (!query) {
    return res.status(400).json({ error: 'Search query parameter "q" is required.' });
  }

  try {
    console.log(`Searching online for: "${query}"`);
    const results = await searchiTunes(query);
    return res.json(results);
  } catch (error) {
    console.error('Error searching external songs:', error);
    return res.status(500).json({ error: 'Failed to search songs online.' });
  }
});

/**
 * POST /api/songs/import
 * Import a song from iTunes, fetch its lyrics from LRCLib, and save to Postgres
 */
router.post('/import', async (req: Request, res: Response) => {
  const { title, artist, album, genre, duration, audioUrl, coverArt } = req.body;

  if (!title || !artist || !audioUrl) {
    return res.status(400).json({ error: 'Missing required fields: title, artist, and audioUrl are required.' });
  }

  try {
    // 1. Check if the song has already been imported
    const checkDuplicate = await pool.query(
      'SELECT id FROM songs WHERE title = $1 AND artist = $2',
      [title, artist]
    );

    if (checkDuplicate.rowCount > 0) {
      return res.status(400).json({ error: 'This song has already been imported!' });
    }

    // 2. Fetch lyrics from LRCLib
    console.log(`Importing: "${title}" by "${artist}". Retrieving lyrics...`);
    const lyricsData = await fetchLyricsFromLRCLib(artist, title, album || '', duration || 180);

    if (!lyricsData.plainLyrics) {
      return res.status(404).json({
        error: `Could not retrieve lyrics for "${title}" by "${artist}". Only tracks with valid lyrics can be imported for typing.`
      });
    }

    // 3. Create a unique, URL-safe ID for the song
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const cleanArtist = artist.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const songId = `custom_${cleanArtist}_${cleanTitle}_${Date.now()}`;

    // 4. Generate fun metadata
    const bpm = Math.floor(Math.random() * (150 - 90 + 1)) + 90; // estimate dynamic tempo between 90 and 150
    const difficulty = duration < 120 ? 'beginner' : duration > 240 ? 'advanced' : 'intermediate';

    // 5. Insert into the PostgreSQL database
    console.log(`Inserting imported song "${title}" into PostgreSQL...`);
    await pool.query(`
      INSERT INTO songs (
        id, title, artist, genre, lyrics, synced_lyrics, duration, 
        audio_url, locked, required_wpm, bpm, difficulty, cover_art
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      songId,
      title,
      artist,
      genre || 'Pop',
      lyricsData.plainLyrics,
      lyricsData.syncedLyrics,
      duration || 180,
      audioUrl,
      false, // unlocked by default since user chose to import it
      0,     // no WPM required to unlock
      bpm,
      difficulty,
      coverArt || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'
    ]);

    console.log(`Successfully imported "${title}" by "${artist}"!`);

    return res.status(201).json({
      message: 'Song imported successfully!',
      song: {
        id: songId,
        title,
        artist,
        genre: genre || 'Pop',
        lyrics: lyricsData.plainLyrics,
        syncedLyrics: lyricsData.syncedLyrics,
        duration: duration || 180,
        audioUrl,
        locked: false,
        requiredWPM: 0,
        bpm,
        difficulty,
        coverArt
      }
    });

  } catch (error) {
    console.error('Error importing song:', error);
    return res.status(500).json({ error: 'Failed to import song and retrieve lyrics.' });
  }
});

export default router;
