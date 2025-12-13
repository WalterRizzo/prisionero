const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('📝 Login intento:', email);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña requeridos' });
    }

    const usuario = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, username, email, password, games_played, total_score, games_won, cooperation_rate FROM users WHERE email = ?',
        [email],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    console.log('🔍 Usuario encontrado:', usuario ? 'Sí' : 'No');

    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const passwordValida = bcrypt.compareSync(password, usuario.password);
    console.log('🔐 Contraseña válida:', passwordValida);

    if (!passwordValida) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, username: usuario.username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    console.log('✅ Login exitoso para:', usuario.username);

    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        stats: {
          gamesPlayed: usuario.games_played || 0,
          totalScore: usuario.total_score || 0,
          wins: usuario.games_won || 0,
          cooperationRate: usuario.cooperation_rate || 0
        }
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ message: 'Error en el login', error: error.message });
  }
});

// Registro
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log('📝 Registro intento:', { username, email });

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    const usuarioExistente = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM users WHERE email = ? OR username = ?',
        [email, username],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (usuarioExistente) {
      return res.status(400).json({ message: 'Usuario o email ya existe' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const result = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword],
        function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID });
        }
      );
    });

    const nuevoUsuario = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, username, email FROM users WHERE id = ?',
        [result.lastID],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    const token = jwt.sign(
      { id: nuevoUsuario.id, username: nuevoUsuario.username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    console.log('✅ Registro exitoso:', username);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: nuevoUsuario.id,
        username: nuevoUsuario.username,
        email: nuevoUsuario.email
      }
    });
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ message: 'Error en el registro', error: error.message });
  }
});

// Obtener usuario actual
router.get('/me', verifyToken, async (req, res) => {
  try {
    const usuario = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, username, email, avatar, games_played, total_score, games_won, cooperation_rate FROM users WHERE id = ?',
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

    res.json({
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      avatar: usuario.avatar,
      stats: {
        gamesPlayed: usuario.games_played || 0,
        totalScore: usuario.total_score || 0,
        wins: usuario.games_won || 0,
        cooperationRate: usuario.cooperation_rate || 0
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo usuario:', error);
    res.status(500).json({ message: 'Error obteniendo usuario', error: error.message });
  }
});

module.exports = router;
