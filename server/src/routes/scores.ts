import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

/**
 * POST /api/scores
 * Log a new game completion score
 */
router.post('/', async (req: Request, res: Response) => {
  const { songId, wpm, accuracy, score } = req.body;

  if (!songId || wpm === undefined || accuracy === undefined || score === undefined) {
    return res.status(400).json({ error: 'Missing required score fields: songId, wpm, accuracy, score.' });
  }

  try {
    console.log(`Logging score: WPM=${wpm}, ACC=${accuracy}%, SCORE=${score} for song ID="${songId}"`);
    
    const result = await pool.query(
      `INSERT INTO scores (song_id, wpm, accuracy, score) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [songId, wpm, accuracy, score]
    );

    return res.status(201).json({
      message: 'Score logged successfully!',
      loggedRecord: result.rows[0]
    });
  } catch (error) {
    console.error('Error logging typing score:', error);
    return res.status(500).json({ error: 'Failed to record your typing score.' });
  }
});

/**
 * GET /api/scores/stats
 * Compile aggregated stats and complete game history for the active profile
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // 1. Fetch aggregates
    const aggregateQuery = await pool.query(`
      SELECT 
        COUNT(*)::INT as "totalGames",
        COALESCE(MAX(wpm), 0.0)::FLOAT as "personalBestWPM",
        COALESCE(AVG(accuracy), 0.0)::FLOAT as "averageAccuracy",
        COALESCE(SUM(score), 0)::INT as "totalScore"
      FROM scores
    `);

    const aggregates = aggregateQuery.rows[0];

    // 2. Fetch complete match history with song details
    const historyQuery = await pool.query(`
      SELECT 
        s.id,
        s.song_id as "songId",
        s.wpm,
        s.accuracy,
        s.score,
        s.completed_at as "completedAt",
        songs.title as "songTitle",
        songs.artist as "songArtist",
        songs.cover_art as "coverArt"
      FROM scores s
      LEFT JOIN songs ON s.song_id = songs.id
      ORDER BY s.completed_at DESC
      LIMIT 20
    `);

    // Format output
    return res.json({
      stats: {
        totalGamesPlayed: aggregates.totalGames,
        personalBestWPM: Math.round(aggregates.personalBestWPM * 10) / 10,
        averageAccuracy: Math.round(aggregates.averageAccuracy * 10) / 10,
        totalScore: aggregates.totalScore
      },
      history: historyQuery.rows
    });
  } catch (error) {
    console.error('Error compiling typing stats:', error);
    return res.status(500).json({ error: 'Failed to compile stats and match history.' });
  }
});

/**
 * DELETE /api/scores/:id
 * Delete a specific score entry
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM scores WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Score record not found.' });
    }
    return res.json({ message: 'Score record deleted successfully!' });
  } catch (error) {
    console.error('Error deleting score:', error);
    return res.status(500).json({ error: 'Failed to delete score record.' });
  }
});

/**
 * DELETE /api/scores
 * Clear complete score history
 */
router.delete('/', async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM scores');
    return res.json({ message: 'Entire score history cleared successfully!' });
  } catch (error) {
    console.error('Error clearing score history:', error);
    return res.status(500).json({ error: 'Failed to clear score history.' });
  }
});

export default router;
