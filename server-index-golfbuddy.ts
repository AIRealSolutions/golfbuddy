import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup with golfbuddy schema
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Set search path to golfbuddy schema
pool.on('connect', (client) => {
  client.query('SET search_path TO golfbuddy, public');
});

const db = drizzle(pool);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'GolfBuddy',
    environment: 'AIRealSolutions',
    timestamp: new Date()
  });
});

// Players API
app.get('/api/players', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM golfbuddy.players WHERE is_active = true');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

app.post('/api/players', async (req, res) => {
  const { name, email, phone, handicap, team } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO golfbuddy.players (name, email, phone, handicap, team) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, phone, handicap || null, team || 'white_belt']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create player' });
  }
});

app.get('/api/players/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM golfbuddy.players WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

// Courses API
app.get('/api/courses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM golfbuddy.courses ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const courseResult = await pool.query('SELECT * FROM golfbuddy.courses WHERE id = $1', [req.params.id]);
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const holesResult = await pool.query('SELECT * FROM golfbuddy.holes WHERE course_id = $1 ORDER BY hole_number', [req.params.id]);

    res.json({
      ...courseResult.rows[0],
      holes: holesResult.rows,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

app.post('/api/courses', async (req, res) => {
  const { name, location, city, state, country, par, course_rating, slope_rating } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO golfbuddy.courses (name, location, city, state, country, par, course_rating, slope_rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, location, city, state, country || 'USA', par, course_rating, slope_rating]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Matches API
app.get('/api/matches', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, c.name as course_name
      FROM golfbuddy.matches m
      LEFT JOIN golfbuddy.courses c ON m.course_id = c.id
      ORDER BY m.date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

app.post('/api/matches', async (req, res) => {
  const { matchType, courseId, date, name, description, createdBy } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO golfbuddy.matches (match_type, course_id, date, name, description, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [matchType, courseId, date, name, description, createdBy]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create match' });
  }
});

// Games API
app.post('/api/games', async (req, res) => {
  const { matchId, gameType, name, description, scoringFormat } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO golfbuddy.games (match_id, game_type, name, description, scoring_format)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [matchId, gameType, name, description, scoringFormat]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create game' });
  }
});

app.get('/api/games/:id', async (req, res) => {
  try {
    const gameResult = await pool.query('SELECT * FROM golfbuddy.games WHERE id = $1', [req.params.id]);
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
    `, [req.params.id]);

    res.json({
      ...gameResult.rows[0],
      scores: scoresResult.rows,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game' });
  }
});

// Scores API
app.post('/api/scores', async (req, res) => {
  const { gameId, playerId, holeId, strokes, points, isWolf } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO golfbuddy.scores (game_id, player_id, hole_id, strokes, points, is_wolf)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [gameId, playerId, holeId, strokes, points || 0, isWolf || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save score' });
  }
});

app.get('/api/scores/:gameId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, p.name as player_name, h.hole_number, h.par
       FROM golfbuddy.scores s
       LEFT JOIN golfbuddy.players p ON s.player_id = p.id
       LEFT JOIN golfbuddy.holes h ON s.hole_id = h.id
       WHERE s.game_id = $1
       ORDER BY h.hole_number`,
      [req.params.gameId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

// Leaderboard API
app.get('/api/leaderboards/yearly/:year', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM golfbuddy.yearly_leaderboards WHERE year = $1 ORDER BY total_points DESC`,
      [req.params.year]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.get('/api/leaderboards/player-stats/:playerId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id, p.name, p.handicap, p.team,
        COUNT(DISTINCT m.id) as matches_played,
        COUNT(DISTINCT g.id) as games_played,
        COALESCE(SUM(CASE WHEN mp.position = 1 THEN 1 ELSE 0 END), 0) as wins
      FROM golfbuddy.players p
      LEFT JOIN golfbuddy.match_players mp ON p.id = mp.player_id
      LEFT JOIN golfbuddy.matches m ON mp.match_id = m.id
      LEFT JOIN golfbuddy.games g ON m.id = g.match_id
      WHERE p.id = $1
      GROUP BY p.id, p.name, p.handicap, p.team
    `, [req.params.playerId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player stats' });
  }
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🏌️ GolfBuddy server running on port ${PORT}`);
  console.log(`📦 Database: AIRealSolutions (golfbuddy schema)`);
  console.log(`🌍 Environment: Production`);
});
