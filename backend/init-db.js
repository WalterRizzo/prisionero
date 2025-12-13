const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const db = new Database("C:/prisionero/data/prisionero.db");

// Crear tablas
const createTablesSQL = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT DEFAULT "avatar1",
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    stats_gamesPlayed INTEGER DEFAULT 0,
    stats_totalScore INTEGER DEFAULT 0,
    stats_wins INTEGER DEFAULT 0,
    stats_cooperationRate REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    status TEXT DEFAULT "waiting",
    round INTEGER DEFAULT 1,
    max_rounds INTEGER DEFAULT 10,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS game_players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gameId TEXT NOT NULL,
    userId INTEGER NOT NULL,
    score INTEGER DEFAULT 0,
    decision TEXT,
    FOREIGN KEY(gameId) REFERENCES games(id),
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`;

db.exec(createTablesSQL);

// Crear usuario de prueba
const hashedPassword = bcrypt.hashSync("test123", 10);
try {
  db.prepare(`
    INSERT INTO users (username, email, password)
    VALUES (?, ?, ?)
  `).run("user1", "user1@test.com", hashedPassword);
  console.log(" Usuario user1@test.com creado");
} catch (e) {
  console.log("? Usuario ya existe");
}

const users = db.prepare("SELECT id, username, email FROM users").all();
console.log("Usuarios:", users);
db.close();
