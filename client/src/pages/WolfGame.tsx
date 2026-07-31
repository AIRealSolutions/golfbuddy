import React, { useState, useEffect } from 'react';
import './WolfGame.css';

interface Player {
  id: string;
  name: string;
}

interface Hole {
  holeNumber: number;
  par: number;
  handicap: number;
  length: number;
  yardsWhite: number;
  yardsBlue: number;
  yardsBlack: number;
}

interface HoleScore {
  holeNumber: number;
  par: number;
  scores: Record<string, number>;
  wolfPlayerId: string;
}

type GamePhase = 'setup' | 'course-select' | 'playing' | 'complete';

export default function WolfGame() {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: '' },
    { id: '2', name: '' },
    { id: '3', name: '' },
  ]);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [courseHoles, setCourseHoles] = useState<Hole[]>([]);
  const [holes, setHoles] = useState<HoleScore[]>([]);
  const [currentHole, setCurrentHole] = useState(0);
  const [holesSetup, setHolesSetup] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);

  // Fetch courses
  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error('Failed to fetch courses:', err));
  }, []);

  const handlePlayerNameChange = (id: string, name: string) => {
    setPlayers(players.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const handleStartGame = () => {
    if (!players.every((p) => p.name.trim())) {
      alert('Please enter all player names');
      return;
    }
    setPhase('course-select');
  };

  const handleSelectCourse = async (id: string) => {
    setCourseId(id);
    try {
      const res = await fetch(`/api/courses/${id}`);
      const data = await res.json();
      setCourseHoles(data.holes);
      setHolesSetup(true);
    } catch (error) {
      alert('Failed to load course details');
    }
  };

  const handleStartPlaying = () => {
    const newHoles = courseHoles.map((hole, idx) => ({
      holeNumber: hole.holeNumber,
      par: hole.par,
      scores: {} as Record<string, number>,
      wolfPlayerId: players[idx % 3].id,
    }));
    setHoles(newHoles);
    setCurrentHole(0);
    setPhase('playing');
  };

  const handleScoreChange = (playerId: string, score: number) => {
    const hole = holes[currentHole];
    const newScores = { ...hole.scores, [playerId]: score };
    const newHoles = [...holes];
    newHoles[currentHole] = { ...hole, scores: newScores };
    setHoles(newHoles);
  };

  const handleNextHole = () => {
    const hole = holes[currentHole];
    if (!players.every((p) => hole.scores[p.id] !== undefined)) {
      alert('Please enter scores for all players');
      return;
    }
    if (currentHole < holes.length - 1) {
      setCurrentHole(currentHole + 1);
    } else {
      setPhase('complete');
    }
  };

  const calculateHolePoints = (holeIndex: number) => {
    const hole = holes[holeIndex];
    const scores = hole.scores;
    const wolfId = hole.wolfPlayerId;
    const otherPlayers = players.filter((p) => p.id !== wolfId);

    const points: Record<string, number> = {};
    players.forEach((p) => (points[p.id] = 0));

    const wolfScore = scores[wolfId];
    otherPlayers.forEach((player) => {
      const playerScore = scores[player.id];
      if (playerScore < wolfScore) {
        points[player.id] += 1;
        points[wolfId] -= 1;
      } else if (playerScore > wolfScore) {
        points[wolfId] += 1;
        points[player.id] -= 1;
      }
    });

    return points;
  };

  const calculateTotalScores = () => {
    const totals: Record<string, number> = {};
    players.forEach((p) => (totals[p.id] = 0));

    holes.forEach((_, index) => {
      const points = calculateHolePoints(index);
      players.forEach((p) => {
        totals[p.id] += points[p.id];
      });
    });

    return totals;
  };

  // SETUP PHASE
  if (phase === 'setup') {
    return (
      <div className="wolf-container">
        <div className="wolf-card">
          <h1 className="wolf-title">🏌️ Wolf Game</h1>
          <p className="wolf-subtitle">Glen Dornach, SC</p>
          <div className="player-inputs">
            {players.map((player) => (
              <input
                key={player.id}
                type="text"
                placeholder={`Player ${player.id}`}
                value={player.name}
                onChange={(e) => handlePlayerNameChange(player.id, e.target.value)}
                className="player-input"
              />
            ))}
          </div>
          <button className="wolf-button" onClick={handleStartGame}>Next</button>
        </div>
      </div>
    );
  }

  // COURSE SELECT PHASE
  if (phase === 'course-select' && !holesSetup) {
    return (
      <div className="wolf-container">
        <div className="wolf-card">
          <h2 className="wolf-title">Select Course</h2>
          <div className="course-list">
            {courses.map((course) => (
              <button
                key={course.id}
                className="course-button"
                onClick={() => handleSelectCourse(course.id)}
              >
                <div className="course-name">{course.name}</div>
                <div className="course-info">{course.city}, {course.state} • Par {course.par}</div>
              </button>
            ))}
          </div>
          <button className="wolf-button-secondary" onClick={() => setPhase('setup')}>Back</button>
        </div>
      </div>
    );
  }

  // PLAYING PHASE
  if (phase === 'playing') {
    const hole = holes[currentHole];
    const courseHole = courseHoles[currentHole];
    const wolfName = players.find((p) => p.id === hole.wolfPlayerId)?.name;

    return (
      <div className="wolf-container">
        <div className="wolf-card wolf-card-wide">
          <div className="wolf-header">
            <div>
              <h2 className="wolf-hole-title">Hole {hole.holeNumber} of {holes.length}</h2>
              <p className="wolf-description">🐺 {wolfName} is the WOLF</p>
            </div>
            <div className="wolf-badge">{currentHole + 1} / {holes.length}</div>
          </div>
        </div>

        <div className="wolf-card wolf-card-wide">
          <div className="hole-details">
            <div className="hole-detail-item">
              <span className="detail-label">Par</span>
              <span className="detail-value">{courseHole.par}</span>
            </div>
            <div className="hole-detail-item">
              <span className="detail-label">Handicap</span>
              <span className="detail-value">{courseHole.handicap}</span>
            </div>
            <div className="hole-detail-item">
              <span className="detail-label">Length</span>
              <span className="detail-value">{courseHole.length} yds</span>
            </div>
            <div className="hole-detail-item">
              <span className="detail-label">Yellow</span>
              <span className="detail-value">{courseHole.yardsWhite}</span>
            </div>
            <div className="hole-detail-item">
              <span className="detail-label">Blue</span>
              <span className="detail-value">{courseHole.yardsBlue}</span>
            </div>
            <div className="hole-detail-item">
              <span className="detail-label">Black</span>
              <span className="detail-value">{courseHole.yardsBlack}</span>
            </div>
          </div>
        </div>

        <div className="wolf-card wolf-card-wide">
          <h3 className="wolf-subtitle">Enter Scores</h3>
          <div className="score-inputs">
            {players.map((player) => (
              <div key={player.id} className="score-row">
                <label className="score-label">{player.name}</label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  placeholder="Score"
                  value={hole.scores[player.id] ?? ''}
                  onChange={(e) => handleScoreChange(player.id, parseInt(e.target.value) || 0)}
                  className="score-input"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="wolf-card wolf-card-wide">
          <h3 className="wolf-subtitle">Running Scores</h3>
          <div className="leaderboard">
            {players.map((player) => {
              const total = Object.keys(holes)
                .slice(0, currentHole + 1)
                .reduce((sum, i) => {
                  const holeIdx = parseInt(i);
                  const holePoints = calculateHolePoints(holeIdx);
                  return sum + (holePoints[player.id] || 0);
                }, 0);

              return (
                <div key={player.id} className="leaderboard-item">
                  <span>{player.name}</span>
                  <span className={`score ${total > 0 ? 'positive' : total < 0 ? 'negative' : ''}`}>
                    {total > 0 ? '+' : ''}{total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <button className="wolf-button wolf-button-full" onClick={handleNextHole}>
          {currentHole === holes.length - 1 ? 'Finish Game' : 'Next Hole'}
        </button>
      </div>
    );
  }

  // COMPLETE PHASE
  if (phase === 'complete') {
    const totals = calculateTotalScores();
    const sorted = players.sort((a, b) => (totals[b.id] || 0) - (totals[a.id] || 0));

    return (
      <div className="wolf-container">
        <div className="wolf-card wolf-card-wide wolf-card-success">
          <h1 className="wolf-title" style={{ textAlign: 'center' }}>🏆 Game Complete!</h1>
        </div>

        <div className="wolf-card wolf-card-wide">
          <h2 className="wolf-subtitle">Final Leaderboard</h2>
          <div className="final-leaderboard">
            {sorted.map((player, idx) => (
              <div key={player.id} className={`final-rank rank-${idx + 1}`}>
                <div className="rank-number">#{idx + 1}</div>
                <div className="rank-info">{player.name}</div>
                <div className="rank-score">{totals[player.id] > 0 ? '+' : ''}{totals[player.id]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="wolf-card wolf-card-wide">
          <h2 className="wolf-subtitle">Hole Summary</h2>
          <div className="hole-summary-grid">
            {holes.map((hole, idx) => {
              const points = calculateHolePoints(idx);
              const wolf = players.find((p) => p.id === hole.wolfPlayerId);
              return (
                <div key={idx} className="hole-summary-item">
                  <div className="summary-hole">Hole {hole.holeNumber}</div>
                  <div className="summary-wolf">🐺 {wolf?.name}</div>
                  <div className="summary-scores">
                    {players.map(p => (
                      <div key={p.id} className="summary-score-row">
                        <span>{p.name}: {hole.scores[p.id]}</span>
                        <span className={points[p.id] > 0 ? 'positive' : points[p.id] < 0 ? 'negative' : ''}>
                          {points[p.id] > 0 ? '+' : ''}{points[p.id]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button className="wolf-button wolf-button-full" onClick={() => location.reload()}>
          Play Again
        </button>
      </div>
    );
  }

  return null;
}
