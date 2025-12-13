const express = require('express');
const { verifyToken } = require('../middleware/auth');
const db = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Obtener todas las partidas activas
router.get('/active', verifyToken, async (req, res) => {
  try {
    const juegos = await new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM games WHERE status IN ('waiting', 'playing') ORDER BY created_at DESC",
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
    res.json(juegos);
  } catch (error) {
    console.error('Error en /active:', error);
    res.status(500).json({ message: 'Error obteniendo juegos' });
  }
});

// Crear nueva partida
router.post('/create', verifyToken, async (req, res) => {
  try {
    const usuario = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, username FROM users WHERE id = ?',
        [req.user.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const gameId = uuidv4();
    
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO games (game_id, status) VALUES (?, ?)',
        [gameId, 'waiting'],
        function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID });
        }
      );
    });

    const nuevoJuego = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM games WHERE game_id = ?',
        [gameId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO game_players (game_id, user_id, username) VALUES (?, ?, ?)',
        [nuevoJuego.id, usuario.id, usuario.username],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.status(201).json(nuevoJuego);
  } catch (error) {
    console.error('Error en /create:', error);
    res.status(500).json({ message: 'Error creando juego', error: error.message });
  }
});

// Unirse a una partida
router.post('/join/:gameId', verifyToken, async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const usuario = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, username FROM users WHERE id = ?',
        [req.user.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    const juego = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM games WHERE id = ?',
        [gameId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (!juego) {
      return res.status(404).json({ message: 'Juego no encontrado' });
    }

    const jugadores = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM game_players WHERE game_id = ?',
        [gameId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    if (jugadores.length >= 2) {
      return res.status(400).json({ message: 'Juego lleno' });
    }

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO game_players (game_id, user_id, username) VALUES (?, ?, ?)',
        [juego.id, usuario.id, usuario.username],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    if (jugadores.length === 1) {
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE games SET status = ? WHERE id = ?',
          ['playing', juego.id],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    const juegoActualizado = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM games WHERE id = ?',
        [juego.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    res.json(juegoActualizado);
  } catch (error) {
    console.error('Error en /join:', error);
    res.status(500).json({ message: 'Error uniéndose al juego', error: error.message });
  }
});

// Obtener detalles de una partida
router.get('/:gameId', verifyToken, async (req, res) => {
  try {
    const juego = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM games WHERE id = ?',
        [req.params.gameId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (!juego) {
      return res.status(404).json({ message: 'Juego no encontrado' });
    }

    res.json(juego);
  } catch (error) {
    console.error('Error en /:gameId:', error);
    res.status(500).json({ message: 'Error obteniendo juego', error: error.message });
  }
});

module.exports = router;
