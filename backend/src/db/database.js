const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Crear directorio de datos (usa /tmp en producción Render/Railway)
const dataDir = process.env.NODE_ENV === 'production' 
  ? '/tmp'
  : path.join(__dirname, '../../data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'prisionero.db');
const db = new sqlite3.Database(dbPath);

// Habilitar foreign keys
db.run("PRAGMA foreign_keys = ON");

// Crear tablas si no existen
const createTables = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        avatar TEXT DEFAULT 'avatar-default',
        games_played INTEGER DEFAULT 0,
        games_won INTEGER DEFAULT 0,
        games_lost INTEGER DEFAULT 0,
        total_score INTEGER DEFAULT 0,
        karma INTEGER DEFAULT 0,
        cooperation_rate REAL DEFAULT 0,
        favorite_strategy TEXT DEFAULT 'balanced',
        win_streak INTEGER DEFAULT 0,
        max_win_streak INTEGER DEFAULT 0,
        xp_total INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        daily_challenge_score INTEGER DEFAULT 0,
        daily_challenge_date TEXT,
        referral_code TEXT UNIQUE,
        invited_by_code TEXT,
        is_premium INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id TEXT UNIQUE NOT NULL,
        round INTEGER DEFAULT 1,
        max_rounds INTEGER DEFAULT 10,
        status TEXT DEFAULT 'waiting',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        finished_at DATETIME
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS game_players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        username TEXT NOT NULL,
        decision TEXT DEFAULT NULL,
        score INTEGER DEFAULT 0,
        FOREIGN KEY (game_id) REFERENCES games(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        achievement_type TEXT NOT NULL,
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, achievement_type)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS referrals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        referrer_id INTEGER NOT NULL,
        referred_id INTEGER,
        referral_code TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (referrer_id) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS daily_challenges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        challenge_date TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        difficulty TEXT DEFAULT 'medium',
        target_score INTEGER DEFAULT 10,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS daily_challenge_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        challenge_date TEXT NOT NULL,
        score INTEGER DEFAULT 0,
        completed INTEGER DEFAULT 0,
        completed_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, challenge_date)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS xp_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        xp_gained INTEGER NOT NULL,
        reason TEXT DEFAULT 'victory',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Crear usuarios de prueba si la tabla está vacía
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
      if (!err && row.count === 0) {
        const testUsers = [
          { username: 'AlexMaster', email: 'alex@test.com', password: 'test123', total_score: 4850, games_played: 23, games_won: 18, cooperation_rate: 85.5, win_streak: 5 },
          { username: 'JuanCoop', email: 'juan@test.com', password: 'test123', total_score: 4320, games_played: 21, games_won: 16, cooperation_rate: 92.3, win_streak: 3 },
          { username: 'MariaStrat', email: 'maria@test.com', password: 'test123', total_score: 3890, games_played: 19, games_won: 14, cooperation_rate: 78.9, win_streak: 2 },
          { username: 'CarlosBeta', email: 'carlos@test.com', password: 'test123', total_score: 3450, games_played: 18, games_won: 12, cooperation_rate: 75.0, win_streak: 1 },
          { username: 'SofiaRising', email: 'sofia@test.com', password: 'test123', total_score: 3120, games_played: 16, games_won: 11, cooperation_rate: 88.1, win_streak: 4 },
          { username: 'LuisGamer', email: 'luis@test.com', password: 'test123', total_score: 2890, games_played: 15, games_won: 9, cooperation_rate: 70.5, win_streak: 0 },
          { username: 'AnaPro', email: 'ana@test.com', password: 'test123', total_score: 2650, games_played: 14, games_won: 8, cooperation_rate: 82.3, win_streak: 2 },
          { username: 'RobertoPro', email: 'roberto@test.com', password: 'test123', total_score: 2420, games_played: 13, games_won: 7, cooperation_rate: 76.8, win_streak: 1 },
          { username: 'CamilaNova', email: 'camila@test.com', password: 'test123', total_score: 2150, games_played: 12, games_won: 6, cooperation_rate: 91.2, win_streak: 3 },
          { username: 'DiegoFire', email: 'diego@test.com', password: 'test123', total_score: 1890, games_played: 11, games_won: 5, cooperation_rate: 68.9, win_streak: 0 }
        ];

        testUsers.forEach(user => {
          db.run(
            `INSERT INTO users (username, email, password, total_score, games_played, games_won, cooperation_rate, win_streak, referral_code) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user.username, user.email, user.password, user.total_score, user.games_played, user.games_won, user.cooperation_rate, user.win_streak, `REF-${user.username.toUpperCase()}`],
            (err) => {
              if (err) console.error('Error creating test user:', err);
            }
          );
        });
        console.log('Test users created successfully');
      }
    });
  });
};

createTables();

// Wrapper para compatibilidad con código existente
const dbWrapper = {
  prepare: (sql) => ({
    get: (...params) => {
      return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    },
    run: (...params) => {
      return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ lastInsertRowid: this.lastID });
        });
      });
    },
    all: (...params) => {
      return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    }
  }),
  exec: (sql) => db.exec(sql)
};

module.exports = db;
module.exports.wrapper = dbWrapper;
