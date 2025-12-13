const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const gameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    default: uuidv4,
    unique: true
  },
  players: [{
    userId: mongoose.Schema.Types.ObjectId,
    username: String,
    decision: { type: String, enum: ['cooperate', 'defect', null], default: null },
    score: { type: Number, default: 0 }
  }],
  round: {
    type: Number,
    default: 1
  },
  maxRounds: {
    type: Number,
    default: 10
  },
  status: {
    type: String,
    enum: ['waiting', 'playing', 'finished'],
    default: 'waiting'
  },
  payoffMatrix: {
    cooperateBoth: { type: Number, default: 3 },
    defectBoth: { type: Number, default: 1 },
    cooperateDefect: { type: Number, default: 0 },
    defectCooperate: { type: Number, default: 5 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  finishedAt: Date
});

module.exports = mongoose.model('Game', gameSchema);
