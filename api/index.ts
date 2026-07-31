// Vercel API Handler - api/index.ts
// This file handles all API routes in Vercel serverless functions

import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

// Initialize database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Set search path to golfbuddy schema
pool.on('connect', (client) => {
  client.query('SET search_path TO golfbuddy, public');
});

// Routes
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { pathname } = new URL(req.url || '', `http://${req.headers.host}`);

  try {
    // Health check
    if (pathname === '/api/health') {
      return res.status(200).json({
        status: 'ok',
        app: 'GolfBuddy',
        environment: 'AIRealSolutions',
        timestamp: new Date(),
      });
    }

    // GET /api/courses
    if (req.method === 'GET' && pathname === '/api/courses') {
      const result = await pool.query('SELECT * FROM golfbuddy.courses ORDER BY name');
      return res.status(200).json(result.rows);
    }

    // GET /api/courses/:id
    if (req.method === 'GET' && pathname.match(/^\/api\/courses\/\d+$/)) {
      const id = pathname.split('/')[3];
      const courseResult = await pool.query('SELECT * FROM golfbuddy.courses WHERE id = $1', [id]);

      if (courseResult.rows.length === 0) {
        return res.status(404).json({ error: 'Course not found' });
      }

      const holesResult = await pool.query(
        'SELECT * FROM golfbuddy.holes WHERE course_id = $1 ORDER BY hole_number',
        [id]
      );

      return res.status(200).json({
        ...courseResult.rows[0],
        holes: holesResult.rows,
      });
    }

    // GET /api/players
    if (req.method === 'GET' && pathname === '/api/players') {
      const result = await pool.query('SELECT * FROM golfbuddy.players WHERE is_active = true');
      return res.status(200).json(result.rows);
    }

    // POST /api/players
    if (req.method === 'POST' && pathname === '/api/players') {
      const { name, email, phone, handicap, team } = req.body;
      const result = await pool.query(
        'INSERT INTO golfbuddy.players (name, email, phone, handicap, team) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, email, phone, handicap || null, team || 'white_belt']
      );
      return res.status(201).json(result.rows[0]);
    }

    // GET /api/matches
    if (req.method === 'GET' && pathname === '/api/matches') {
      const result = await pool.query(`
        SELECT m.*, c.name as course_name
        FROM golfbuddy.matches m
        LEFT JOIN golfbuddy.courses c ON m.course_id = c.id
        ORDER BY m.date DESC
      `);
      return res.status(200).json(result.rows);
    }

    // POST /api/matches
    if (req.method === 'POST' && pathname === '/api/matches') {
      const { matchType, courseId, date, name, description, createdBy } = req.body;
      const result = await pool.query(
        `INSERT INTO golfbuddy.matches (match_type, course_id, date, name, description, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [matchType, courseId, date, name, description, createdBy]
      );
      return res.status(201).json(result.rows[0]);
    }

    // POST /api/games
    if (req.method === 'POST' && pathname === '/api/games') {
      const { matchId, gameType, name, description, scoringFormat } = req.body;
      const result = await pool.query(
        `INSERT INTO golfbuddy.games (match_id, game_type, name, description, scoring_format)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [matchId, gameType, name, description, scoringFormat]
      );
      return res.status(201).json(result.rows[0]);
    }

    // GET /api/games/:id
    if (req.method === 'GET' && pathname.match(/^\/api\/games\/\d+$/)) {
      const id = pathname.split('/')[3];
      const gameResult = await pool.query('SELECT * FROM golfbuddy.games WHERE id = $1', [id]);

      if (gameResult.rows.length === 0) {
        return res.status(404).json({ error: 'Game not found' });
      }

      const scoresResult = await pool.query(`
        SELECT s.*, p.name as player_name, h.hole_number, h.par
        FROM golfbuddy.scores s
        LEFT JOIN golfbuddy.players p ON s.player_id = p.id
        LEFT JOIN golfbuddy.holes h ON s.hole_id = h.id
        WHERE s.game_id = $1
        ORDER BY h.hole_number
      `, [id]);

      return res.status(200).json({
        ...gameResult.rows[0],
        scores: scoresResult.rows,
      });
    }

    // POST /api/scores
    if (req.method === 'POST' && pathname === '/api/scores') {
      const { gameId, playerId, holeId, strokes, points, isWolf } = req.body;
      const result = await pool.query(
        `INSERT INTO golfbuddy.scores (game_id, player_id, hole_id, strokes, points, is_wolf)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [gameId, playerId, holeId, strokes, points || 0, isWolf || false]
      );
      return res.status(201).json(result.rows[0]);
    }

    // GET /api/leaderboards/yearly/:year
    if (req.method === 'GET' && pathname.match(/^\/api\/leaderboards\/yearly\/\d+$/)) {
      const year = pathname.split('/')[4];
      const result = await pool.query(
        `SELECT * FROM golfbuddy.yearly_leaderboards WHERE year = $1 ORDER BY total_points DESC`,
        [year]
      );
      return res.status(200).json(result.rows);
    }

    // Not found
    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
