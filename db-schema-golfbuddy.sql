-- GolfBuddy Schema - AIRealSolutions Database
-- Creates isolated golfbuddy schema within AIRealSolutions Supabase project

-- Create dedicated schema for GolfBuddy
CREATE SCHEMA IF NOT EXISTS golfbuddy;

-- Create ENUM types within golfbuddy schema
CREATE TYPE golfbuddy.game_type AS ENUM ('wolf', 'scramble', 'best_ball', 'skins', 'match_play', 'medal');
CREATE TYPE golfbuddy.match_type AS ENUM ('team', 'individual', 'tournament');
CREATE TYPE golfbuddy.player_role AS ENUM ('black_belt', 'white_belt', 'admin');

-- Players table
CREATE TABLE golfbuddy.players (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  handicap NUMERIC(5, 1),
  team golfbuddy.player_role DEFAULT 'white_belt',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE golfbuddy.courses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  location VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  country VARCHAR(100) DEFAULT 'USA',
  course_rating NUMERIC(5, 1),
  slope_rating INT,
  par INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Holes table (18 holes per course)
CREATE TABLE golfbuddy.holes (
  id SERIAL PRIMARY KEY,
  course_id INT NOT NULL REFERENCES golfbuddy.courses(id) ON DELETE CASCADE,
  hole_number INT NOT NULL CHECK (hole_number >= 1 AND hole_number <= 18),
  par INT NOT NULL,
  handicap INT,
  length INT, -- in yards
  yards_white INT,
  yards_blue INT,
  yards_black INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, hole_number)
);

-- Matches table (team or individual matches)
CREATE TABLE golfbuddy.matches (
  id SERIAL PRIMARY KEY,
  match_type golfbuddy.match_type NOT NULL,
  course_id INT NOT NULL REFERENCES golfbuddy.courses(id),
  date TIMESTAMP NOT NULL,
  name VARCHAR(255),
  description TEXT,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed
  created_by INT REFERENCES golfbuddy.players(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Match Players (link players to matches)
CREATE TABLE golfbuddy.match_players (
  id SERIAL PRIMARY KEY,
  match_id INT NOT NULL REFERENCES golfbuddy.matches(id) ON DELETE CASCADE,
  player_id INT NOT NULL REFERENCES golfbuddy.players(id),
  team VARCHAR(50), -- 'black_belt' or 'white_belt' for team matches
  score INT, -- total score
  position INT, -- finishing position
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Games table (define different game types and rules)
CREATE TABLE golfbuddy.games (
  id SERIAL PRIMARY KEY,
  match_id INT NOT NULL REFERENCES golfbuddy.matches(id) ON DELETE CASCADE,
  game_type golfbuddy.game_type NOT NULL,
  name VARCHAR(255),
  description TEXT,
  scoring_format VARCHAR(100), -- 'stroke', 'match_play', 'points', etc
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scores table (hole-by-hole scores)
CREATE TABLE golfbuddy.scores (
  id SERIAL PRIMARY KEY,
  game_id INT NOT NULL REFERENCES golfbuddy.games(id) ON DELETE CASCADE,
  player_id INT NOT NULL REFERENCES golfbuddy.players(id),
  hole_id INT NOT NULL REFERENCES golfbuddy.holes(id),
  strokes INT NOT NULL,
  points INT DEFAULT 0, -- for games with point systems
  is_wolf BOOLEAN DEFAULT false, -- for wolf game
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard (yearly team standings)
CREATE TABLE golfbuddy.yearly_leaderboards (
  id SERIAL PRIMARY KEY,
  year INT NOT NULL,
  team VARCHAR(50) NOT NULL, -- 'black_belt' or 'white_belt'
  total_wins INT DEFAULT 0,
  total_losses INT DEFAULT 0,
  total_ties INT DEFAULT 0,
  total_points INT DEFAULT 0,
  matches_played INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(year, team)
);

-- Game Results (summary of each game)
CREATE TABLE golfbuddy.game_results (
  id SERIAL PRIMARY KEY,
  game_id INT NOT NULL REFERENCES golfbuddy.games(id) ON DELETE CASCADE,
  player_id INT NOT NULL REFERENCES golfbuddy.players(id),
  final_score INT NOT NULL,
  final_points INT DEFAULT 0,
  place INT, -- 1st, 2nd, 3rd, etc
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_golfbuddy_matches_course ON golfbuddy.matches(course_id);
CREATE INDEX idx_golfbuddy_matches_date ON golfbuddy.matches(date);
CREATE INDEX idx_golfbuddy_matches_status ON golfbuddy.matches(status);
CREATE INDEX idx_golfbuddy_match_players_match ON golfbuddy.match_players(match_id);
CREATE INDEX idx_golfbuddy_match_players_player ON golfbuddy.match_players(player_id);
CREATE INDEX idx_golfbuddy_scores_game ON golfbuddy.scores(game_id);
CREATE INDEX idx_golfbuddy_scores_player ON golfbuddy.scores(player_id);
CREATE INDEX idx_golfbuddy_scores_hole ON golfbuddy.scores(hole_id);
CREATE INDEX idx_golfbuddy_holes_course ON golfbuddy.holes(course_id);
CREATE INDEX idx_golfbuddy_yearly_leaderboards_year ON golfbuddy.yearly_leaderboards(year);

-- Insert Glen Dornach Course (South Carolina)
INSERT INTO golfbuddy.courses (name, location, city, state, par, course_rating, slope_rating)
VALUES ('Glen Dornach', 'Glen Dornach', 'Pawleys Island', 'SC', 72, 73.5, 135);

-- Insert Glen Dornach Holes (standard par data)
INSERT INTO golfbuddy.holes (course_id, hole_number, par, handicap, length, yards_white, yards_blue, yards_black)
SELECT
  (SELECT id FROM golfbuddy.courses WHERE name = 'Glen Dornach'),
  hole_num,
  CASE WHEN hole_num IN (3, 7, 12, 15) THEN 4 WHEN hole_num IN (8, 14) THEN 5 ELSE 4 END as par,
  handicap,
  length,
  length,
  length + 20,
  length + 40
FROM (VALUES
  (1, 1, 410),
  (2, 2, 385),
  (3, 3, 520),
  (4, 4, 165),
  (5, 5, 445),
  (6, 6, 380),
  (7, 7, 505),
  (8, 8, 145),
  (9, 9, 395),
  (10, 10, 425),
  (11, 11, 375),
  (12, 12, 510),
  (13, 13, 170),
  (14, 14, 450),
  (15, 15, 520),
  (16, 16, 155),
  (17, 17, 390),
  (18, 18, 470)
) AS hole_data(hole_num, handicap, length);

-- Grant permissions to authenticated users
ALTER DEFAULT PRIVILEGES IN SCHEMA golfbuddy GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA golfbuddy GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

-- Enable Row Level Security (RLS) for production security
ALTER TABLE golfbuddy.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE golfbuddy.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE golfbuddy.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE golfbuddy.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE golfbuddy.scores ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can read public data
CREATE POLICY "Allow public read" ON golfbuddy.players FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON golfbuddy.courses FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON golfbuddy.matches FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON golfbuddy.games FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON golfbuddy.scores FOR SELECT USING (true);
