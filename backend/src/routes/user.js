const express = require('express');
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Obtener perfil del usuario
router.get('/profile/:userId', async (req, res) => {
  try {
    const usuario = await User.findById(req.params.userId);
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      id: usuario._id,
      username: usuario.username,
      avatar: usuario.avatar,
      stats: usuario.stats,
      isPremium: usuario.isPremium,
      createdAt: usuario.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo perfil' });
  }
});

// Actualizar avatar
router.put('/avatar', verifyToken, async (req, res) => {
  try {
    const { avatar } = req.body;
    
    const usuario = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
      { new: true }
    );

    res.json({ message: 'Avatar actualizado', usuario });
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando avatar' });
  }
});

module.exports = router;
