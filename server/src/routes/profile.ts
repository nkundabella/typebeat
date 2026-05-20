import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

/**
 * GET /api/profile
 * Retrieve profile information for the single active user
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT username, avatar_seed as "avatarSeed" FROM profiles WHERE id = 1');
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

/**
 * PUT /api/profile
 * Update profile information (username and avatar seed)
 */
router.put('/', async (req: Request, res: Response) => {
  const { username, avatarSeed } = req.body;

  if (!username || !avatarSeed) {
    return res.status(400).json({ error: 'Missing required profile fields: username, avatarSeed.' });
  }

  try {
    const result = await pool.query(
      `UPDATE profiles 
       SET username = $1, avatar_seed = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = 1 
       RETURNING username, avatar_seed as "avatarSeed"`,
      [username, avatarSeed]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Profile to update was not found.' });
    }

    return res.json({
      message: 'Profile updated successfully!',
      profile: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Failed to update user profile.' });
  }
});

export default router;
