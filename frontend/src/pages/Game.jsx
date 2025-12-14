import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, ShieldOff, Handshake, Swords, Wifi } from 'lucide-react';
import { io } from 'socket.io-client';

// Detectar si estamos en producción (Cloudflare Pages) o local
const isProduction = window.location.hostname.includes('pages.dev');
const SOCKET_URL = isProduction 
  ? 'https://prisionero-backend.walterrizzo.workers.dev'
  : `http://${window.location.hostname}:5000`;

// --- Web Audio Sound Manager ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
};

const playTick = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch(e) {}
};

const playUrgent = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 440;
    osc.type = 'square';
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch(e) {}
};

const playWin = () => {
  try {
    const ctx = getAudioContext();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.2);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.2);
    });
  } catch(e) {}
};

const playLose = () => {
  try {
    const ctx = getAudioContext();
    [400, 300, 200].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.2);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.2);
    });
  } catch(e) {}
};

const playClick = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1000;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  } catch(e) {}
};

// ⭐ Sonido de Ronda Dorada
const playGoldenRound = () => {
  try {
    const ctx = getAudioContext();
    // Sonido mágico de ronda dorada
    const notes = [880, 1109, 1319, 1760];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.4);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.4);
    });
  } catch(e) {}
};

// 🔥 Sonido de Combo
const playCombo = () => {
  try {
    const ctx = getAudioContext();
    const notes = [660, 880, 1100];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.06 + 0.2);
      osc.start(ctx.currentTime + i * 0.06);
      osc.stop(ctx.currentTime + i * 0.06 + 0.2);
    });
  } catch(e) {}
};

const playVictory = () => {
  try {
    const ctx = getAudioContext();
    // Fanfarra de victoria épica
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'square';
      gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.3);
    });
  } catch(e) {}
};

const playDefeat = () => {
  try {
    const ctx = getAudioContext();
    // Sonido de derrota triste
    const notes = [400, 350, 300, 250, 200];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.2 + 0.3);
      osc.start(ctx.currentTime + i * 0.2);
      osc.stop(ctx.currentTime + i * 0.2 + 0.3);
    });
  } catch(e) {}
};

const playDraw = () => {
  try {
    const ctx = getAudioContext();
    // Sonido neutral de empate
    [440, 440, 523].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.2 + 0.25);
      osc.start(ctx.currentTime + i * 0.2);
      osc.stop(ctx.currentTime + i * 0.2 + 0.25);
    });
  } catch(e) {}
};

const playReveal = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch(e) {}
};

// Obtener nombres del localStorage
const getPlayerNames = () => {
  const p1Name = localStorage.getItem('player1Name') || 'JUGADOR 1';
  const p2Name = localStorage.getItem('player2Name') || 'IA';
  const gameMode = localStorage.getItem('gameMode') || 'ai';
  return { p1Name, p2Name, gameMode };
};

// Detectar género por nombre para mostrar avatar apropiado
const FEMALE_NAMES = [
  'maria', 'ana', 'laura', 'carmen', 'rosa', 'lucia', 'elena', 'sofia', 'paula', 'marta',
  'isabel', 'andrea', 'sara', 'patricia', 'claudia', 'diana', 'valentina', 'camila', 'daniela',
  'gabriela', 'natalia', 'carolina', 'fernanda', 'alejandra', 'monica', 'julia', 'victoria',
  'emma', 'olivia', 'ava', 'isabella', 'mia', 'emily', 'jessica', 'ashley', 'sarah', 'amanda',
  'nicole', 'samantha', 'katherine', 'jennifer', 'elizabeth', 'michelle', 'stephanie', 'rachel',
  'rebeca', 'adriana', 'alicia', 'beatriz', 'blanca', 'carla', 'celia', 'clara', 'cristina',
  'eva', 'irene', 'lorena', 'lourdes', 'luisa', 'magdalena', 'margarita', 'marina', 'mercedes',
  'noelia', 'nuria', 'pilar', 'raquel', 'rocio', 'silvia', 'susana', 'teresa', 'veronica',
  'yolanda', 'esther', 'fatima', 'gloria', 'ines', 'lidia', 'mariana', 'miriam', 'olga',
  'paola', 'sandra', 'sonia', 'tatiana', 'vanessa', 'xiomara', 'yasmina', 'zaira', 'zoe',
  'abril', 'agustina', 'aileen', 'aitana', 'alba', 'alma', 'amelia', 'ariana', 'aurora',
  'bianca', 'catalina', 'celeste', 'dafne', 'dahlia', 'dalia', 'elisa', 'emilia', 'fabiana',
  'florencia', 'giselle', 'ivana', 'jade', 'jimena', 'josefina', 'karla', 'kiara', 'lara',
  'leia', 'lila', 'liliana', 'luna', 'maite', 'malena', 'manuela', 'marcela', 'melina',
  'micaela', 'milagros', 'miranda', 'morgana', 'nadia', 'naomi', 'nina', 'noa', 'paloma',
  'perla', 'priscila', 'regina', 'renata', 'romina', 'rosario', 'sabrina', 'salome', 'scarlett',
  'selena', 'serena', 'tamara', 'tania', 'valeria', 'vega', 'vera', 'violeta', 'virginia', 'viviana'
];

const getGender = (name) => {
  if (!name) return 'male';
  const normalizedName = name.toLowerCase().trim().split(' ')[0]; // Solo primer nombre
  return FEMALE_NAMES.includes(normalizedName) ? 'female' : 'male';
};

const getAvatar = (name, size = 80) => {
  const gender = getGender(name);
  // Usar DiceBear API para avatares por género
  const seed = encodeURIComponent(name || 'player');
  if (gender === 'female') {
    // Avatar femenino - estilo lorelei con características femeninas
    return `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}&size=${size}&backgroundColor=ffdfbf,ffd5dc,d1d4f9,c0aede&hair=variant01,variant02,variant03,variant04,variant05,variant17,variant18,variant19,variant20`;
  } else {
    // Avatar masculino - estilo lorelei con características masculinas  
    return `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}&size=${size}&backgroundColor=b6e3f4,c0aede,d1d4f9&hair=variant06,variant07,variant08,variant09,variant10,variant11,variant12,variant13`;
  }
};

const TrustIcon = () => <Handshake className="w-8 h-8 text-cyan-400" />;
const BetrayIcon = () => <Swords className="w-8 h-8 text-pink-500" />;

// ==========================================
// 🧠 SISTEMA DE IA SÚPER INTELIGENTE v2.0
// Machine Learning + Teoría de Juegos Avanzada
// ==========================================
const MasterAI = {
  // === TABLA DE PUNTUACIÓN (la IA la conoce perfectamente) ===
  PAYOFF: {
    // [miMovimiento][suMovimiento] = misPuntos
    trust: { trust: 3, betray: -5 },
    betray: { trust: 5, betray: -2 }
  },
  
  // Calcular puntos esperados para una jugada
  expectedValue: (myMove, predictedOpponentMove, confidence) => {
    const certain = MasterAI.PAYOFF[myMove][predictedOpponentMove];
    const opposite = predictedOpponentMove === 'trust' ? 'betray' : 'trust';
    const uncertain = MasterAI.PAYOFF[myMove][opposite];
    // Valor esperado = confianza * resultado_predicho + (1-confianza) * resultado_opuesto
    return confidence * certain + (1 - confidence) * uncertain;
  },

  // === ANÁLISIS PROFUNDO DEL OPONENTE ===
  deepAnalyze: (history) => {
    if (history.length === 0) {
      return {
        predictedMove: 'trust',
        confidence: 0.5,
        playerType: 'unknown',
        patterns: [],
        responseToBetrayal: null,
        responseToTrust: null,
        streakBehavior: null
      };
    }

    const p1Moves = history.map(h => h.p1);
    const p2Moves = history.map(h => h.p2);
    const n = p1Moves.length;

    // 1. Estadísticas básicas
    const trustCount = p1Moves.filter(m => m === 'trust').length;
    const trustRate = trustCount / n;

    // 2. Análisis de respuestas a mis jugadas
    let responsesToMyTrust = { trust: 0, betray: 0 };
    let responsesToMyBetray = { trust: 0, betray: 0 };
    
    for (let i = 1; i < n; i++) {
      if (p2Moves[i-1] === 'trust') {
        responsesToMyTrust[p1Moves[i]]++;
      } else {
        responsesToMyBetray[p1Moves[i]]++;
      }
    }

    // 3. Detectar si usa TIT-FOR-TAT (imita mi última jugada)
    let titForTatScore = 0;
    for (let i = 1; i < n; i++) {
      if (p1Moves[i] === p2Moves[i-1]) titForTatScore++;
    }
    const isTitForTat = titForTatScore / (n - 1) > 0.7;

    // 4. Detectar patrones de secuencia (n-gramas)
    const patterns = [];
    
    // Patrones de 2 movimientos
    if (n >= 3) {
      const last2 = p1Moves.slice(-2).join('');
      let nextAfterPattern = { trust: 0, betray: 0 };
      for (let i = 2; i < n; i++) {
        const pattern = p1Moves.slice(i-2, i).join('');
        if (pattern === last2) {
          nextAfterPattern[p1Moves[i]]++;
        }
      }
      if (nextAfterPattern.trust + nextAfterPattern.betray > 0) {
        patterns.push({
          type: '2-gram',
          pattern: last2,
          prediction: nextAfterPattern.trust > nextAfterPattern.betray ? 'trust' : 'betray',
          confidence: Math.max(nextAfterPattern.trust, nextAfterPattern.betray) / 
                     (nextAfterPattern.trust + nextAfterPattern.betray)
        });
      }
    }

    // 5. Detectar comportamiento después de ser traicionado
    let afterBetrayal = { trust: 0, betray: 0 };
    for (let i = 1; i < n; i++) {
      if (p2Moves[i-1] === 'betray') {
        afterBetrayal[p1Moves[i]]++;
      }
    }

    // 6. Detectar si el jugador es vengativo
    const isVengeful = afterBetrayal.betray > afterBetrayal.trust * 2;
    const isForgiver = afterBetrayal.trust > afterBetrayal.betray * 1.5;

    // 7. Análisis de rachas
    let currentStreak = { move: p1Moves[n-1], count: 1 };
    for (let i = n - 2; i >= 0; i--) {
      if (p1Moves[i] === currentStreak.move) {
        currentStreak.count++;
      } else break;
    }

    // 8. Detectar si cambia después de rachas
    let changesAfterStreak = 0;
    let streakOpportunities = 0;
    let streak = 1;
    for (let i = 1; i < n; i++) {
      if (p1Moves[i] === p1Moves[i-1]) {
        streak++;
      } else {
        if (streak >= 2) {
          streakOpportunities++;
          changesAfterStreak++;
        }
        streak = 1;
      }
    }

    // 9. Clasificar tipo de jugador
    let playerType = 'unknown';
    if (trustRate > 0.8) playerType = 'cooperator';
    else if (trustRate < 0.2) playerType = 'defector';
    else if (isTitForTat) playerType = 'tit-for-tat';
    else if (isVengeful) playerType = 'vengeful';
    else if (isForgiver) playerType = 'forgiver';
    else if (Math.abs(trustRate - 0.5) < 0.15) playerType = 'random';
    else playerType = 'mixed';

    // 10. PREDICCIÓN FINAL
    let predictedMove = 'trust';
    let confidence = 0.5;

    // Prioridad 1: Si usa TIT-FOR-TAT, sé exactamente qué hará
    if (isTitForTat && n > 0) {
      predictedMove = p2Moves[n - 1]; // Imitará mi última jugada
      confidence = 0.9;
    }
    // Prioridad 2: Patrones de secuencia
    else if (patterns.length > 0 && patterns[0].confidence > 0.6) {
      predictedMove = patterns[0].prediction;
      confidence = patterns[0].confidence * 0.85;
    }
    // Prioridad 3: Respuesta esperada a mi última jugada
    else if (n > 0) {
      const myLastMove = p2Moves[n - 1];
      const responses = myLastMove === 'trust' ? responsesToMyTrust : responsesToMyBetray;
      const total = responses.trust + responses.betray;
      if (total > 0) {
        predictedMove = responses.trust > responses.betray ? 'trust' : 'betray';
        confidence = Math.max(responses.trust, responses.betray) / total;
      }
    }
    // Prioridad 4: Tendencia general
    else {
      predictedMove = trustRate > 0.5 ? 'trust' : 'betray';
      confidence = Math.abs(trustRate - 0.5) * 2;
    }

    // Si hay racha larga, es probable que cambie
    if (currentStreak.count >= 3 && changesAfterStreak / Math.max(1, streakOpportunities) > 0.5) {
      predictedMove = currentStreak.move === 'trust' ? 'betray' : 'trust';
      confidence = Math.min(confidence + 0.1, 0.95);
    }

    return {
      predictedMove,
      confidence,
      playerType,
      patterns,
      trustRate,
      isVengeful,
      isForgiver,
      isTitForTat,
      currentStreak,
      responsesToMyTrust,
      responsesToMyBetray
    };
  },

  // === SIMULACIÓN DE ESCENARIOS FUTUROS ===
  simulateFuture: (history, myMove, opponentPrediction, round, totalRounds, myScore, oppScore, myBetrayalStreak, comboCount, isGolden) => {
    // Simular qué pasaría si hago este movimiento
    const oppMove = opponentPrediction.predictedMove;
    
    let points = MasterAI.PAYOFF[myMove][oppMove];
    
    // Aplicar regla anti-traidor
    if (myMove === 'betray' && oppMove === 'trust') {
      if (myBetrayalStreak >= 2) points = 1; // Solo +1 si ya tengo racha
    }
    
    // Aplicar combo si ambos cooperan
    if (myMove === 'trust' && oppMove === 'trust') {
      const newCombo = comboCount + 1;
      if (newCombo >= 4) points = 9; // 6 + 3 bonus
      else if (newCombo === 3) points = 5;
      else if (newCombo === 2) points = 4;
    }
    
    // Duplicar si es ronda dorada
    if (isGolden) points *= 2;
    
    // Penalizar si rompo combo alto
    if (comboCount >= 2 && myMove === 'betray') {
      points -= comboCount; // Costo de oportunidad
    }
    
    // Considerar el futuro: si traiciono, él puede vengarse
    const roundsLeft = totalRounds - round;
    if (myMove === 'betray' && roundsLeft > 1) {
      if (opponentPrediction.isVengeful) {
        // Él se vengará, perderé puntos futuros
        points -= 3 * Math.min(roundsLeft - 1, 3);
      }
      if (opponentPrediction.isTitForTat) {
        // Me imitará, traicionando también
        points -= 2 * Math.min(roundsLeft - 1, 2);
      }
    }
    
    // Bonus por mantener buena relación si el jugador es cooperador
    if (myMove === 'trust' && opponentPrediction.playerType === 'cooperator') {
      points += roundsLeft * 0.5; // Futuras cooperaciones
    }
    
    return points;
  },

  // === FUNCIÓN PRINCIPAL: DECISIÓN ÓPTIMA ===
  getMove: (history, myScore, oppScore, myBetrayalStreak, round, totalRounds, comboCount, isGoldenRound, goldenRounds) => {
    const analysis = MasterAI.deepAnalyze(history);
    
    // Simular ambas opciones
    const trustValue = MasterAI.simulateFuture(
      history, 'trust', analysis, round, totalRounds, myScore, oppScore, myBetrayalStreak, comboCount, isGoldenRound
    );
    const betrayValue = MasterAI.simulateFuture(
      history, 'betray', analysis, round, totalRounds, myScore, oppScore, myBetrayalStreak, comboCount, isGoldenRound
    );

    // Ajustar por confianza en la predicción
    const adjustedTrust = trustValue * analysis.confidence + 
      MasterAI.expectedValue('trust', analysis.predictedMove === 'trust' ? 'betray' : 'trust', 0.5) * (1 - analysis.confidence);
    const adjustedBetray = betrayValue * analysis.confidence + 
      MasterAI.expectedValue('betray', analysis.predictedMove === 'trust' ? 'betray' : 'trust', 0.5) * (1 - analysis.confidence);

    // === REGLAS ESTRATÉGICAS ESPECIALES ===
    
    // 1. ÚLTIMA RONDA: Siempre traicionar si no hay consecuencias
    if (round === totalRounds) {
      // Solo cooperar si el oponente es vengativo Y vamos empatados
      if (analysis.isVengeful && Math.abs(myScore - oppScore) <= 3) {
        return 'trust'; // Evitar venganza en empate
      }
      return 'betray'; // Maximizar última ronda
    }
    
    // 2. RONDA DORADA: Maximizar puntos
    if (isGoldenRound) {
      // Si predigo que cooperará con alta confianza, traicionar para +10
      if (analysis.predictedMove === 'trust' && analysis.confidence > 0.7) {
        if (myBetrayalStreak < 2) { // Solo si no activo anti-traidor
          return 'betray';
        }
      }
      // Si predigo traición, traicionar también para evitar -10
      if (analysis.predictedMove === 'betray' && analysis.confidence > 0.6) {
        return 'betray';
      }
    }
    
    // 3. Proteger combo alto
    if (comboCount >= 3 && analysis.predictedMove === 'trust' && analysis.confidence > 0.6) {
      return 'trust'; // Mantener el combo
    }
    
    // 4. Resetear mi racha de traición si es necesario
    if (myBetrayalStreak >= 2) {
      return 'trust'; // Cooperar para resetear y poder traicionar después
    }
    
    // 5. Explotar jugadores predecibles
    if (analysis.playerType === 'cooperator' && analysis.confidence > 0.8) {
      // Traicionar cada 3-4 rondas para maximizar
      const shouldBetray = (round % 4 === 0) && myBetrayalStreak === 0;
      if (shouldBetray) return 'betray';
    }
    
    // 6. Contra TIT-FOR-TAT: cooperar para mantener cooperación mutua
    if (analysis.isTitForTat) {
      // Solo traicionar en última ronda o si voy perdiendo mucho
      if (myScore < oppScore - 8 && round < totalRounds - 1) {
        return Math.random() < 0.3 ? 'betray' : 'trust'; // Arriesgar un poco
      }
      return 'trust';
    }
    
    // 7. Si voy perdiendo mucho, ser más agresivo
    if (myScore < oppScore - 10 && round < totalRounds - 2) {
      if (analysis.predictedMove === 'trust') {
        return 'betray'; // Intentar recuperar
      }
    }
    
    // 8. Si voy ganando por mucho, ser más conservador
    if (myScore > oppScore + 10) {
      return analysis.predictedMove === 'betray' ? 'betray' : 'trust';
    }
    
    // 9. Decisión basada en valor esperado
    if (adjustedBetray > adjustedTrust + 1) {
      return 'betray';
    } else if (adjustedTrust > adjustedBetray + 1) {
      return 'trust';
    }
    
    // 10. En caso de empate, usar estrategia TIT-FOR-TAT mejorada
    if (history.length > 0) {
      const lastOppMove = history[history.length - 1].p1;
      // Perdonar 15% de las veces para no caer en ciclos de venganza
      if (lastOppMove === 'betray' && Math.random() < 0.15) {
        return 'trust';
      }
      return lastOppMove;
    }
    
    // Primera ronda: cooperar para probar
    return 'trust';
  }
};

const ResultDiagram = ({ p1Move, p2Move, resultText, p1Name, p2Name }) => {
    const ChoiceButton = ({ move }) => {
        const isTrust = move === 'trust';
        const text = isTrust ? 'CONFIÁ' : 'TRAICIONÁ';
        const style = isTrust 
            ? 'bg-[#00E0FF]/20 text-[#00E0FF] border-[#00E0FF]/50' 
            : 'bg-red-500/20 text-red-400 border-red-500/50';
        return (
            <div className={`px-3 sm:px-6 py-1 text-center text-xs sm:text-sm font-bold border rounded-lg ${style}`}>
                {text}
            </div>
        );
    };

    return (
        <div className="w-full max-w-md mx-auto flex flex-col items-center gap-2 sm:gap-4 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-3 sm:p-6 rounded-xl border border-purple-500/30 backdrop-blur-sm">
            <h2 className="text-base sm:text-2xl font-black text-purple-400 text-center">{resultText}</h2>
            <div className="w-full flex justify-around items-center gap-2 sm:gap-4">
                <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <img src={getAvatar(p1Name, 60)} alt="Tú" className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 border-slate-600 bg-slate-800" />
                    <p className="text-[10px] sm:text-xs font-bold text-gray-400">TÚ</p>
                    <ChoiceButton move={p1Move} />
                </div>

                <div className="text-purple-400 font-black text-lg sm:text-xl">VS</div>

                <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <img src={getAvatar(p2Name, 60)} alt="Oponente" className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 border-slate-600 bg-slate-800" />
                    <p className="text-[10px] sm:text-xs font-bold text-gray-400">OPONENTE</p>
                    <ChoiceButton move={p2Move} />
                </div>
            </div>
        </div>
    );
};


const Game = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [round, setRound] = useState(1);
  // Timer: 15 segundos para online, 3 para otros modos
  const initialTimer = localStorage.getItem('gameMode') === 'online' ? 15 : 5;
  const [timer, setTimer] = useState(initialTimer);
  
  // Obtener nombres y modo de juego del localStorage
  const { p1Name, p2Name, gameMode } = getPlayerNames();
  const isLocalMultiplayer = gameMode === 'local';
  const isOnlineMultiplayer = gameMode === 'online';
  
  // Socket para modo online
  const [socket, setSocket] = useState(null);
  const [opponentMoved, setOpponentMoved] = useState(false);
  const [mySocketId, setMySocketId] = useState(null);
  
  const [players, setPlayers] = useState({
    p1: { name: p1Name, score: 0 },
    p2: { name: p2Name, score: 0 }
  });
  const [history, setHistory] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState({ p1: '', p2: '', text: '', p1ScoreChange: 0 });
  const [playerHasChosen, setPlayerHasChosen] = useState(false);
  const [scoreChanged, setScoreChanged] = useState({ p1: null, p2: null }); // 'win', 'lose', 'draw'
  const [gameOver, setGameOver] = useState(false);
  const [finalResult, setFinalResult] = useState(null); // 'win', 'lose', 'draw'
  
  // Estados para modo 2 jugadores
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1 o 2
  const [p1Choice, setP1Choice] = useState(null);
  const [p2Choice, setP2Choice] = useState(null);
  const [waitingForP2, setWaitingForP2] = useState(false);
  
  // Game mechanics - Nuevas reglas
  const [p1Reputation, setP1Reputation] = useState(50);
  const [p2Reputation, setP2Reputation] = useState(50);
  const [p1BetrayalStreak, setP1BetrayalStreak] = useState(0);
  const [p2BetrayalStreak, setP2BetrayalStreak] = useState(0);
  const [p1CooperationStreak, setP1CooperationStreak] = useState(0);
  const [p2CooperationStreak, setP2CooperationStreak] = useState(0);
  
  // 🔴 CONTADOR DE TRAICIONES TOTALES (acumuladas en toda la partida)
  const [p1TotalBetrayals, setP1TotalBetrayals] = useState(0);
  const [p2TotalBetrayals, setP2TotalBetrayals] = useState(0);
  
  // Sistema de Honor
  const [p1Honor, setP1Honor] = useState(0);
  const [p2Honor, setP2Honor] = useState(0);
  const [lastP2Move, setLastP2Move] = useState(null); // Para bonus de honor
  
  // 🔥 COMBO SYSTEM + RONDA DORADA
  const [comboCount, setComboCount] = useState(0); // Rachas de cooperación mutua
  const [goldenRound, setGoldenRound] = useState(() => {
    // Elegir 1-2 rondas doradas aleatorias entre ronda 4 y 9
    const golden1 = Math.floor(Math.random() * 6) + 4; // 4-9
    const golden2 = Math.random() > 0.5 ? Math.floor(Math.random() * 6) + 4 : null;
    return [golden1, golden2].filter(Boolean);
  });
  const [isGoldenRound, setIsGoldenRound] = useState(false);

  // ==========================================
  // SOCKET.IO PARA MODO ONLINE
  // ==========================================
  useEffect(() => {
    // Leer directamente del localStorage dentro del useEffect
    const currentGameMode = localStorage.getItem('gameMode');
    const onlineGameId = localStorage.getItem('onlineGameId');
    const myName = localStorage.getItem('player1Name') || 'PLAYER';
    const onlinePlayersData = JSON.parse(localStorage.getItem('onlinePlayers') || '[]');
    
    console.log('🔍 Game.jsx useEffect - gameMode:', currentGameMode, 'onlineGameId:', onlineGameId, 'myName:', myName);
    
    if (currentGameMode !== 'online') {
      console.log('🔍 No es modo online, saliendo del useEffect');
      return;
    }
    
    console.log('🔍 Datos para join-game:', { onlineGameId, myName, onlinePlayersData });
    
    if (onlinePlayersData.length >= 2) {
      setPlayers({
        p1: { name: onlinePlayersData[0].name, score: 0 },
        p2: { name: onlinePlayersData[1].name, score: 0 }
      });
    }
    
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('🎮 Conectado al juego online, uniéndome a partida:', onlineGameId);
      setMySocketId(newSocket.id);
      
      // IMPORTANTE: Unirse al juego con el nuevo socket
      if (onlineGameId && myName) {
        console.log('📤 Enviando join-game...');
        newSocket.emit('join-game', {
          gameId: onlineGameId,
          playerName: myName
        });
      } else {
        console.log('❌ Faltan datos para join-game');
      }
    });

    newSocket.on('game-joined', (data) => {
      console.log('✅ Unido al juego:', data);
      // Actualizar scores si el juego ya empezó
      if (data.players && data.players.length >= 2) {
        setPlayers({
          p1: { name: data.players[0].name, score: data.players[0].score },
          p2: { name: data.players[1].name, score: data.players[1].score }
        });
      }
      setRound(data.round || 1);
    });

    newSocket.on('game-ready', (data) => {
      console.log('🎮 Partida lista!', data);
      // Actualizar jugadores cuando ambos están conectados
      if (data.players && data.players.length >= 2) {
        setPlayers({
          p1: { name: data.players[0].name, score: 0 },
          p2: { name: data.players[1].name, score: 0 }
        });
      }
      setRound(1);
      setTimer(15);
    });

    newSocket.on('opponent-moved', (data) => {
      console.log('👀 Oponente eligió');
      setOpponentMoved(true);
    });

    newSocket.on('round-result', (data) => {
      console.log('📊 Resultado de ronda:', data);
      playReveal();
      
      // Determinar quién soy yo
      const amP1 = data.players[0].id === newSocket.id;
      const myData = amP1 ? data.players[0] : data.players[1];
      const oppData = amP1 ? data.players[1] : data.players[0];
      
      // Generar texto de resultado
      let resultText = '';
      const myTimeout = myData.timeout;
      const oppTimeout = oppData.timeout;
      
      if (myTimeout && oppTimeout) {
        resultText = '⏱️ AMBOS SIN RESPONDER (-1 cada uno)';
        playUrgent();
        setScoreChanged({ p1: 'lose', p2: 'lose' });
      } else if (myTimeout) {
        resultText = '⏱️ ¡NO ELEGISTE A TIEMPO! (-1)';
        playLose();
        setScoreChanged(amP1 ? { p1: 'lose', p2: 'win' } : { p1: 'win', p2: 'lose' });
      } else if (oppTimeout) {
        resultText = `⏱️ ${oppData.name} NO ELIGIÓ A TIEMPO`;
        playWin();
        setScoreChanged(amP1 ? { p1: 'win', p2: 'lose' } : { p1: 'lose', p2: 'win' });
      } else if (data.resultType === 'both-trust') {
        resultText = '🤝 AMBOS CONFIARON';
        playWin();
        setScoreChanged({ p1: 'win', p2: 'win' });
      } else if (data.resultType === 'both-betray') {
        resultText = '💀 TRAICIÓN MUTUA';
        playUrgent();
        setScoreChanged({ p1: 'draw', p2: 'draw' });
      } else if ((amP1 && data.resultType === 'p1-betrayed') || (!amP1 && data.resultType === 'p2-betrayed')) {
        resultText = `🗡️ ${oppData.name} TE TRAICIONÓ`;
        playLose();
        setScoreChanged(amP1 ? { p1: 'lose', p2: 'win' } : { p1: 'win', p2: 'lose' });
      } else {
        resultText = `⚔️ TRAICIONASTE A ${oppData.name}`;
        playWin();
        setScoreChanged(amP1 ? { p1: 'win', p2: 'lose' } : { p1: 'lose', p2: 'win' });
      }
      
      setShowResult(true);
      setLastResult({
        p1: amP1 ? myData.move : oppData.move,
        p2: amP1 ? oppData.move : myData.move,
        text: resultText,
        p1ScoreChange: amP1 ? myData.scoreChange : oppData.scoreChange
      });
      
      // Actualizar scores
      setPlayers({
        p1: { name: amP1 ? myData.name : oppData.name, score: amP1 ? myData.totalScore : oppData.totalScore },
        p2: { name: amP1 ? oppData.name : myData.name, score: amP1 ? oppData.totalScore : myData.totalScore }
      });
      
      setHistory(prev => [...prev, {
        p1: amP1 ? myData.move : oppData.move,
        p2: amP1 ? oppData.move : myData.move
      }]);
    });

    newSocket.on('new-round', (data) => {
      console.log('🔄 Nueva ronda:', data.round);
      setRound(data.round);
      setTimer(15);
      setShowResult(false);
      setPlayerHasChosen(false);
      setOpponentMoved(false);
      setScoreChanged({ p1: null, p2: null });
    });

    newSocket.on('round-timeout', (data) => {
      console.log('⏱️ Timeout recibido');
      playUrgent();
    });

    newSocket.on('game-over', (data) => {
      console.log('🏆 Fin del juego:', data);
      setGameOver(true);
      
      const amWinner = data.winner?.id === newSocket.id;
      if (data.isDraw) {
        setFinalResult('draw');
        playDraw();
      } else if (amWinner) {
        setFinalResult('win');
        playVictory();
      } else {
        setFinalResult('lose');
        playDefeat();
      }
    });

    newSocket.on('opponent-disconnected', (data) => {
      alert(`😢 ${data.opponentName} se desconectó. ¡Ganaste!`);
      setGameOver(true);
      setFinalResult('win');
      playVictory();
    });

    newSocket.on('opponent-abandoned', (data) => {
      alert(`🏆 ${data.abandonerName} abandonó. ¡Ganaste!`);
      setGameOver(true);
      setFinalResult('win');
      playVictory();
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []); // Sin dependencias - se ejecuta solo una vez al montar

  const processRound = useCallback((playerMove, isPlayer2 = false) => {
    // ==========================================
    // MODO ONLINE
    // ==========================================
    if (isOnlineMultiplayer && socket) {
      if (playerHasChosen) return;
      
      playClick();
      setPlayerHasChosen(true);
      
      const onlineGameId = localStorage.getItem('onlineGameId');
      socket.emit('make-move', {
        gameId: onlineGameId,
        move: playerMove
      });
      
      return;
    }
    
    // MODO 2 JUGADORES LOCAL
    if (isLocalMultiplayer) {
      playClick();
      
      if (!isPlayer2) {
        // Jugador 1 elige
        setP1Choice(playerMove);
        setWaitingForP2(true);
        setCurrentPlayer(2);
        setTimer(5);
        return;
      } else {
        // Jugador 2 elige - procesar ronda
        setP2Choice(playerMove);
        setWaitingForP2(false);
        setPlayerHasChosen(true);
        
        const p1Move = p1Choice || 'betray';
        const p2Move = playerMove || 'betray';
        
        let baseP1ScoreChange = 0;
        let baseP2ScoreChange = 0;
        let resultText = '';
        let honorGained = { p1: 0, p2: 0 };
        
        // ==========================================
        // NUEVA MATRIZ DE PUNTOS BALANCEADA
        // Cooperar/Cooperar: +3/+3
        // 3-4 traiciones: 0 pts (víctima -2)
        // 5+ traiciones: -3 pts (víctima -1)
        // Traicionar/Traicionar: -2/-2
        // ==========================================
        
        if (p1Move === 'trust' && p2Move === 'trust') {
          baseP1ScoreChange = 3;
          baseP2ScoreChange = 3;
          resultText = '🤝 AMBOS CONFIARON (+3 cada uno)';
          playWin();
          setScoreChanged({ p1: 'win', p2: 'win' });
          // Resetear rachas de traición
          setP1BetrayalStreak(0);
          setP2BetrayalStreak(0);
        } else if (p1Move === 'trust' && p2Move === 'betray') {
          // ⚠️ SISTEMA ANTI-TRAIDOR SEVERO para P2
          const newP2Streak = p2BetrayalStreak + 1;
          const newP2Total = p2TotalBetrayals + 1;
          setP2TotalBetrayals(newP2Total);
          
          // Penalización por traiciones totales
          let totalPenalty = 0;
          if (newP2Total >= 7) totalPenalty = -3;
          else if (newP2Total >= 4) totalPenalty = -2;
          
          if (newP2Streak >= 5) {
            baseP1ScoreChange = -1;
            baseP2ScoreChange = -3 + totalPenalty;
            resultText = `💀 ${players.p2.name} TRAIDOR SERIAL (${newP2Streak}x) ${baseP2ScoreChange} pts!`;
          } else if (newP2Streak >= 3) {
            baseP1ScoreChange = -2;
            baseP2ScoreChange = 0 + totalPenalty;
            resultText = `⚠️ ${players.p2.name} TRAICIÓN (${newP2Streak}x) ${baseP2ScoreChange} pts!`;
          } else if (currentRound <= 2) {
            baseP1ScoreChange = -3;
            baseP2ScoreChange = 2 + totalPenalty;
            resultText = `🚫 ${players.p2.name} TRAICIÓN TEMPRANA R${currentRound} (${baseP2ScoreChange > 0 ? '+' : ''}${baseP2ScoreChange})`;
          } else {
            baseP1ScoreChange = -5;
            baseP2ScoreChange = 5 + totalPenalty;
            resultText = `🗡️ ${players.p2.name} TRAICIONÓ (+${baseP2ScoreChange})`;
          }
          playLose();
          setScoreChanged({ p1: 'lose', p2: newP2Streak >= 3 ? 'draw' : 'win' });
          setP2BetrayalStreak(newP2Streak);
          setP1BetrayalStreak(0);
        } else if (p1Move === 'betray' && p2Move === 'trust') {
          // ⚠️ SISTEMA ANTI-TRAIDOR SEVERO para P1
          const newP1Streak = p1BetrayalStreak + 1;
          const newP1Total = p1TotalBetrayals + 1;
          setP1TotalBetrayals(newP1Total);
          
          // Penalización por traiciones totales
          let totalPenalty = 0;
          if (newP1Total >= 7) totalPenalty = -3;
          else if (newP1Total >= 4) totalPenalty = -2;
          
          if (newP1Streak >= 5) {
            baseP2ScoreChange = -1;
            baseP1ScoreChange = -3 + totalPenalty;
            resultText = `💀 ${players.p1.name} TRAIDOR SERIAL (${newP1Streak}x) ${baseP1ScoreChange} pts!`;
          } else if (newP1Streak >= 3) {
            baseP2ScoreChange = -2;
            baseP1ScoreChange = 0 + totalPenalty;
            resultText = `⚠️ ${players.p1.name} TRAICIÓN (${newP1Streak}x) ${baseP1ScoreChange} pts!`;
          } else if (currentRound <= 2) {
            baseP2ScoreChange = -3;
            baseP1ScoreChange = 2 + totalPenalty;
            resultText = `🚫 ${players.p1.name} TRAICIÓN TEMPRANA R${currentRound} (${baseP1ScoreChange > 0 ? '+' : ''}${baseP1ScoreChange})`;
          } else {
            baseP2ScoreChange = -5;
            baseP1ScoreChange = 5 + totalPenalty;
            resultText = `⚔️ ${players.p1.name} TRAICIONÓ (+${baseP1ScoreChange})`;
          }
          playWin();
          setScoreChanged({ p1: newP1Streak >= 3 ? 'draw' : 'win', p2: 'lose' });
          setP1BetrayalStreak(newP1Streak);
          setP2BetrayalStreak(0);
        } else {
          // ⚠️ TRAICIÓN MUTUA con penalización para traidores seriales y totales
          const newP1Streak = p1BetrayalStreak + 1;
          const newP2Streak = p2BetrayalStreak + 1;
          const newP1Total = p1TotalBetrayals + 1;
          const newP2Total = p2TotalBetrayals + 1;
          setP1TotalBetrayals(newP1Total);
          setP2TotalBetrayals(newP2Total);
          
          // Penalizaciones por totales
          let p1TotalPen = 0, p2TotalPen = 0;
          if (newP1Total >= 7) p1TotalPen = -2;
          else if (newP1Total >= 4) p1TotalPen = -1;
          if (newP2Total >= 7) p2TotalPen = -2;
          else if (newP2Total >= 4) p2TotalPen = -1;
          
          baseP1ScoreChange = -2;
          baseP2ScoreChange = -2;
          
          // Penalizar más al traidor serial
          if (newP1Streak >= 5) baseP1ScoreChange = -5;
          else if (newP1Streak >= 3) baseP1ScoreChange = -4;
          
          if (newP2Streak >= 5) baseP2ScoreChange = -5;
          else if (newP2Streak >= 3) baseP2ScoreChange = -4;
          
          // Añadir penalización por traiciones totales
          baseP1ScoreChange += p1TotalPen;
          baseP2ScoreChange += p2TotalPen;
          
          if (newP1Streak >= 3 || newP2Streak >= 3 || p1TotalPen < 0 || p2TotalPen < 0) {
            resultText = `💀 TRAICIÓN MUTUA (${players.p1.name}: ${baseP1ScoreChange}, ${players.p2.name}: ${baseP2ScoreChange})`;
          } else {
            resultText = '💀 TRAICIÓN MUTUA (-2 cada uno)';
          }
          playUrgent();
          setScoreChanged({ p1: 'draw', p2: 'draw' });
          setP1BetrayalStreak(newP1Streak);
          setP2BetrayalStreak(newP2Streak);
        }
        
        setShowResult(true);
        playReveal();
        
        setTimeout(() => {
          setPlayers(prev => ({
            p1: { ...prev.p1, score: prev.p1.score + baseP1ScoreChange },
            p2: { ...prev.p2, score: prev.p2.score + baseP2ScoreChange },
          }));
          setHistory(prev => [...prev, { p1: p1Move, p2: p2Move }]);
          setLastResult({ p1: p1Move, p2: p2Move, text: resultText, p1ScoreChange: baseP1ScoreChange });
        }, 500);
        
        setTimeout(() => {
          if (round < 10) {
            setRound(r => r + 1);
            setTimer(5);
            setShowResult(false);
            setPlayerHasChosen(false);
            setCurrentPlayer(1);
            setP1Choice(null);
            setP2Choice(null);
            setScoreChanged({ p1: null, p2: null });
          } else {
            setGameOver(true);
            const p1Final = players.p1.score + baseP1ScoreChange;
            const p2Final = players.p2.score + baseP2ScoreChange;
            if (p1Final > p2Final) {
              setFinalResult('win');
              playVictory();
            } else if (p1Final < p2Final) {
              setFinalResult('lose');
              playDefeat();
            } else {
              setFinalResult('draw');
              playDraw();
            }
          }
        }, 4000);
        return;
      }
    }
    
    // MODO VS IA (código original)
    if (playerHasChosen) return;

    playClick();
    setPlayerHasChosen(true);
    
    const isTimeout = playerMove === null;
    const p1Move = isTimeout ? 'betray' : playerMove;
    
    // 🧠 IA SÚPER INTELIGENTE v2.0: Predice, simula y optimiza cada jugada
    const p2Move = MasterAI.getMove(
      history, 
      players.p2.score,     // Puntuación de la IA
      players.p1.score,     // Puntuación del jugador
      p2BetrayalStreak,     // Racha de traición de la IA
      round,
      10,                   // Total de rondas
      comboCount,           // Combo actual
      isGoldenRound,        // ¿Es ronda dorada?
      goldenRound           // Array de rondas doradas
    );

    let baseP1ScoreChange = 0;
    let baseP2ScoreChange = 0;
    let resultText = '';

    // Si es TIMEOUT: -3 puntos fijo, no importa qué pase
    if (isTimeout) {
      baseP1ScoreChange = -3;
      resultText = '⏱️ TIMEOUT! -3 PUNTOS';
      playLose();
      setScoreChanged({ p1: 'lose', p2: null });
      
      // Resetear rachas por no jugar
      setP1CooperationStreak(0);
      setP1BetrayalStreak(p1BetrayalStreak + 1);
      
      // Reputación baja por no decidir
      setP1Reputation(Math.max(0, p1Reputation - 5));
      
    } else {
      // Lógica normal del juego (sin timeout)
      // ==========================================
      // SISTEMA ANTI-TRAIDOR SEVERO
      // 3-4 traiciones seguidas: 0 pts (víctima -2)
      // 5+ traiciones seguidas: -3 pts (víctima -1)
      // Traicionar/Traicionar: -2/-2
      // ==========================================
      
      // BONUS DE HONOR: Si cooperas después de que te traicionaron
      let honorGained = 0;
      if (p1Move === 'trust' && lastP2Move === 'betray') {
        honorGained = 1;
        setP1Honor(prev => prev + 1);
      }
      
      if (p1Move === 'trust' && p2Move === 'trust') {
        // 🔥 COMBO SYSTEM - Cooperación mutua consecutiva
        const newCombo = comboCount + 1;
        setComboCount(newCombo);
        
        // Calcular puntos base según combo
        if (newCombo >= 4) {
          baseP1ScoreChange = 6;
          baseP2ScoreChange = 6;
          resultText = `🔥🔥🔥 COMBO x${newCombo}! (+6 +3 BONUS!)`;
          // Bonus extra por combo x4+
          baseP1ScoreChange += 3;
          baseP2ScoreChange += 3;
          playCombo(); // 🔥 Sonido combo
        } else if (newCombo === 3) {
          baseP1ScoreChange = 5;
          baseP2ScoreChange = 5;
          resultText = `🔥🔥 COMBO x3! (+5)`;
          playCombo(); // 🔥 Sonido combo
        } else if (newCombo === 2) {
          baseP1ScoreChange = 4;
          baseP2ScoreChange = 4;
          resultText = `🔥 COMBO x2! (+4)`;
          playCombo(); // 🔥 Sonido combo
        } else {
          baseP1ScoreChange = 3;
          baseP2ScoreChange = 3;
          resultText = '🤝 AMBOS CONFIARON (+3)';
        }
        
        if (honorGained > 0) resultText += ` ✨+${honorGained} HONOR`;
        playWin();
        setScoreChanged({ p1: 'win', p2: 'win' });
        
        // Bonus por cooperación consecutiva
        setP1CooperationStreak(prev => prev + 1);
        setP2CooperationStreak(prev => prev + 1);
        setP1BetrayalStreak(0);
        setP2BetrayalStreak(0);
        
        // Reputación sube
        setP1Reputation(Math.min(100, p1Reputation + 5));
        setP2Reputation(Math.min(100, p2Reputation + 5));
        
      } else if (p1Move === 'trust' && p2Move === 'betray') {
        // Romper combo
        setComboCount(0);
        
        // ⚠️ SISTEMA ANTI-TRAIDOR SEVERO
        const newP2BetrayalStreak = p2BetrayalStreak + 1;
        const newP2TotalBetrayals = p2TotalBetrayals + 1;
        setP2TotalBetrayals(newP2TotalBetrayals);
        
        // 🔴 PENALIZACIÓN POR TRAICIONES TOTALES ACUMULADAS
        let totalBetrayalPenalty = 0;
        if (newP2TotalBetrayals >= 7) {
          totalBetrayalPenalty = -3; // 7+ traiciones totales: -3 adicional
        } else if (newP2TotalBetrayals >= 4) {
          totalBetrayalPenalty = -2; // 4-6 traiciones totales: -2 adicional
        }
        
        if (newP2BetrayalStreak >= 5) {
          baseP1ScoreChange = -1;
          baseP2ScoreChange = -3 + totalBetrayalPenalty;
          resultText = `💀 ${players.p2.name} TRAIDOR SERIAL (${newP2BetrayalStreak}x) ¡${baseP2ScoreChange} pts!`;
        } else if (newP2BetrayalStreak >= 3) {
          baseP1ScoreChange = -2;
          baseP2ScoreChange = 0 + totalBetrayalPenalty;
          resultText = `⚠️ ${players.p2.name} TRAIDOR (${newP2BetrayalStreak}x) ¡${baseP2ScoreChange} pts!`;
        } else if (currentRound <= 2) {
          baseP1ScoreChange = -3;
          baseP2ScoreChange = 2 + totalBetrayalPenalty;
          resultText = `🚫 ${players.p2.name} TRAICIÓN TEMPRANA R${currentRound} (${baseP2ScoreChange > 0 ? '+' : ''}${baseP2ScoreChange})`;
        } else {
          baseP1ScoreChange = -5;
          baseP2ScoreChange = 5 + totalBetrayalPenalty;
          if (totalBetrayalPenalty < 0) {
            resultText = `🗡️ ${players.p2.name} TE TRAICIONÓ (+${baseP2ScoreChange}) [${newP2TotalBetrayals} totales]`;
          } else {
            resultText = `🗡️ ${players.p2.name} TE TRAICIONÓ (-5)`;
          }
        }
        if (honorGained > 0) resultText += ` ✨+${honorGained} HONOR`;
        playLose();
        setScoreChanged({ p1: 'lose', p2: newP2BetrayalStreak >= 3 ? 'draw' : 'win' });
        
        setP2BetrayalStreak(newP2BetrayalStreak);
        setP2CooperationStreak(0);
        setP1CooperationStreak(0);
        setP1BetrayalStreak(0);
        
        // Reputación
        setP1Reputation(Math.min(100, p1Reputation + 5));
        setP2Reputation(Math.max(0, p2Reputation - 10));
        
      } else if (p1Move === 'betray' && p2Move === 'trust') {
        // Romper combo
        setComboCount(0);
        
        // ⚠️ SISTEMA ANTI-TRAIDOR SEVERO PARA JUGADOR
        const newP1BetrayalStreak = p1BetrayalStreak + 1;
        const newP1TotalBetrayals = p1TotalBetrayals + 1;
        setP1TotalBetrayals(newP1TotalBetrayals);
        
        // 🔴 PENALIZACIÓN POR TRAICIONES TOTALES ACUMULADAS
        let totalBetrayalPenalty = 0;
        if (newP1TotalBetrayals >= 7) {
          totalBetrayalPenalty = -3; // 7+ traiciones totales: -3 adicional
        } else if (newP1TotalBetrayals >= 4) {
          totalBetrayalPenalty = -2; // 4-6 traiciones totales: -2 adicional
        }
        
        if (newP1BetrayalStreak >= 5) {
          baseP2ScoreChange = -1;
          baseP1ScoreChange = -3 + totalBetrayalPenalty;
          resultText = `💀 ¡TRAIDOR SERIAL! (${newP1BetrayalStreak}x) ${baseP1ScoreChange} pts`;
          playLose();
          setScoreChanged({ p1: 'lose', p2: 'draw' });
        } else if (newP1BetrayalStreak >= 3) {
          baseP2ScoreChange = -2;
          baseP1ScoreChange = 0 + totalBetrayalPenalty;
          resultText = `⚠️ TRAICIÓN FALLIDA (${newP1BetrayalStreak}x) ¡${baseP1ScoreChange} pts!`;
          playUrgent();
          setScoreChanged({ p1: 'draw', p2: 'lose' });
        } else if (currentRound <= 2) {
          baseP2ScoreChange = -3;
          baseP1ScoreChange = 2 + totalBetrayalPenalty;
          resultText = `🚫 TRAICIÓN TEMPRANA R${currentRound} (${baseP1ScoreChange > 0 ? '+' : ''}${baseP1ScoreChange})`;
          playUrgent();
          setScoreChanged({ p1: 'draw', p2: 'lose' });
        } else {
          baseP2ScoreChange = -5;
          baseP1ScoreChange = 5 + totalBetrayalPenalty;
          if (totalBetrayalPenalty < 0) {
            resultText = `⚔️ LO TRAICIONASTE (+${baseP1ScoreChange}) [${newP1TotalBetrayals} totales]`;
          } else {
            resultText = `⚔️ LO TRAICIONASTE (+5)`;
          }
          playWin();
          setScoreChanged({ p1: 'win', p2: 'lose' });
        }
        
        setP1BetrayalStreak(newP1BetrayalStreak);
        setP1CooperationStreak(0);
        setP2CooperationStreak(0);
        setP2BetrayalStreak(0);
        
        // Reputación
        setP1Reputation(Math.max(0, p1Reputation - 10));
        setP2Reputation(Math.min(100, p2Reputation + 5));
        
      } else {
        // Ambos traicionan - Romper combo
        setComboCount(0);
        
        // ⚠️ PENALIZACIÓN EN TRAICIÓN MUTUA PARA TRAIDORES SERIALES
        const newP1Streak = p1BetrayalStreak + 1;
        const newP2Streak = p2BetrayalStreak + 1;
        const newP1TotalBetrayals = p1TotalBetrayals + 1;
        const newP2TotalBetrayals = p2TotalBetrayals + 1;
        setP1TotalBetrayals(newP1TotalBetrayals);
        setP2TotalBetrayals(newP2TotalBetrayals);
        
        // 🔴 PENALIZACIONES POR TRAICIONES TOTALES
        let p1TotalPenalty = 0;
        let p2TotalPenalty = 0;
        if (newP1TotalBetrayals >= 7) p1TotalPenalty = -2;
        else if (newP1TotalBetrayals >= 4) p1TotalPenalty = -1;
        if (newP2TotalBetrayals >= 7) p2TotalPenalty = -2;
        else if (newP2TotalBetrayals >= 4) p2TotalPenalty = -1;
        
        // Base: -2 para ambos
        baseP1ScoreChange = -2;
        baseP2ScoreChange = -2;
        
        // Si P1 tiene racha de traidor, penalizar MÁS
        if (newP1Streak >= 5) {
          baseP1ScoreChange = -5;
        } else if (newP1Streak >= 3) {
          baseP1ScoreChange = -4;
        }
        
        // Si P2 tiene racha de traidor, penalizar MÁS
        if (newP2Streak >= 5) {
          baseP2ScoreChange = -5;
        } else if (newP2Streak >= 3) {
          baseP2ScoreChange = -4;
        }
        
        // Aplicar penalización por traiciones totales
        baseP1ScoreChange += p1TotalPenalty;
        baseP2ScoreChange += p2TotalPenalty;
        
        // Mensaje según la situación
        if (newP1Streak >= 3 || newP2Streak >= 3 || p1TotalPenalty < 0 || p2TotalPenalty < 0) {
          resultText = `💀 TRAICIÓN MUTUA (Tú: ${baseP1ScoreChange}, IA: ${baseP2ScoreChange})`;
        } else {
          resultText = '💀 TRAICIÓN MUTUA (-2)';
        }
        
        playUrgent();
        setScoreChanged({ p1: 'draw', p2: 'draw' });
        
        setP1BetrayalStreak(newP1Streak);
        setP2BetrayalStreak(newP2Streak);
        setP1CooperationStreak(0);
        setP2CooperationStreak(0);
        
        // Reputación baja para ambos
        setP1Reputation(Math.max(0, p1Reputation - 5));
        setP2Reputation(Math.max(0, p2Reputation - 5));
      }
      
      // Guardar el último movimiento del oponente para bonus de honor
      setLastP2Move(p2Move);
    }

    // ⭐ RONDA DORADA - Duplicar puntos
    let finalP1ScoreChange = baseP1ScoreChange;
    let finalP2ScoreChange = baseP2ScoreChange;
    
    if (isGoldenRound) {
      finalP1ScoreChange = baseP1ScoreChange * 2;
      finalP2ScoreChange = baseP2ScoreChange * 2;
      // Añadir indicador de ronda dorada al resultado
      if (lastResult.text) {
        resultText = `⭐ RONDA DORADA x2! ⭐ ${resultText}`;
      }
    }
    
    setShowResult(true);
    playReveal();

    setTimeout(() => {
        setPlayers(prev => ({
          p1: { ...prev.p1, score: prev.p1.score + finalP1ScoreChange },
          p2: { ...prev.p2, score: prev.p2.score + finalP2ScoreChange },
        }));
        setHistory(prev => [...prev, { p1: p1Move, p2: p2Move }]);
        setLastResult({ p1: p1Move, p2: p2Move, text: resultText, p1ScoreChange: finalP1ScoreChange });
    }, 500);


    setTimeout(() => {
      if (round < 10) {
        setRound(r => r + 1);
        setTimer(5);
        setShowResult(false);
        setPlayerHasChosen(false);
        setScoreChanged({ p1: null, p2: null });
      } else {
        // FIN DE PARTIDA - Determinar ganador
        setGameOver(true);
        const p1Final = players.p1.score + finalP1ScoreChange;
        const p2Final = players.p2.score + finalP2ScoreChange;
        
        if (p1Final > p2Final) {
          setFinalResult('win');
          playVictory();
        } else if (p1Final < p2Final) {
          setFinalResult('lose');
          playDefeat();
        } else {
          setFinalResult('draw');
          playDraw();
        }
      }
    }, 4000);
  }, [round, players, navigate, playerHasChosen, p1CooperationStreak, p2CooperationStreak, p1BetrayalStreak, p2BetrayalStreak, p1Reputation, p2Reputation, isLocalMultiplayer, p1Choice, waitingForP2, lastP2Move, comboCount, isGoldenRound]);

  // Temporizador del juego
  useEffect(() => {
    if (playerHasChosen || showResult || gameOver) {
        return;
    };
    
    // En modo ONLINE, solo mostramos el timer visual - el servidor maneja el timeout
    if (isOnlineMultiplayer) {
      if (timer > 0) {
        const countdown = setInterval(() => {
          setTimer(t => {
            if (t > 1) playTick();
            if (t <= 4 && t > 1) playUrgent();
            return t - 1;
          });
        }, 1000);
        return () => clearInterval(countdown);
      }
      // No hacemos nada cuando llega a 0 - el servidor forzará el timeout
      return;
    }
    
    // En modo 2 jugadores, si estamos esperando al P2, no hacer timeout automático
    if (isLocalMultiplayer && waitingForP2) {
      if (timer > 0) {
        const countdown = setInterval(() => {
          setTimer(t => {
            playTick();
            if (t <= 2) playUrgent();
            return t - 1;
          });
        }, 1000);
        return () => clearInterval(countdown);
      } else {
        // Timeout para P2
        processRound('betray', true);
      }
      return;
    }

    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer(t => {
            playTick(); // SONIDO EN CADA SEGUNDO
            if (t <= 2) playUrgent(); // SONIDO URGENTE cuando queda poco
            return t - 1;
        });
      }, 1000);
      return () => clearInterval(countdown);
    } else if (!playerHasChosen) {
      processRound(null); // Timeout - Default to betray
    }
  }, [timer, playerHasChosen, showResult, processRound, isOnlineMultiplayer, gameOver]);

  const getScoreClass = (status) => {
    if (status === 'win') return 'text-green-400 scale-125';
    if (status === 'lose') return 'text-red-400 scale-125';
    return '';
  };

  const PlayerHUD = ({ name, score, alignment = 'left', avatar, scoreStatus, reputation, honor, betrayalStreak }) => (
    <div className={`flex items-center gap-1 sm:gap-4 ${alignment === 'right' ? 'flex-row-reverse' : ''}`}>
        <div className="flex-shrink-0">
          <img src={avatar} alt={name} className="w-10 h-10 sm:w-16 sm:h-16 rounded-full border-2 sm:border-4 border-slate-700 bg-slate-800" />
          {/* Reputation bar */}
          <div className="w-10 sm:w-16 h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
            <div className={`h-full transition-all ${reputation > 60 ? 'bg-green-500' : reputation > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${reputation}%`}}></div>
          </div>
          {/* Indicador de racha de traición */}
          {betrayalStreak >= 3 && (
            <div className="text-[8px] sm:text-[10px] text-red-400 text-center mt-0.5 animate-pulse">
              ⚠️ TRAIDOR
            </div>
          )}
        </div>
        <div className={`flex flex-col ${alignment === 'left' ? 'items-start' : 'items-end'}`}>
            <p className="text-sm sm:text-3xl font-black uppercase tracking-wider sm:tracking-widest truncate max-w-[80px] sm:max-w-none">{name}</p>
            <p className={`text-2xl sm:text-5xl font-bold text-purple-400 transition-all duration-300 ${getScoreClass(scoreStatus)}`}>{score}</p>
            <div className={`flex gap-2 ${alignment === 'right' ? 'flex-row-reverse' : ''}`}>
              <p className={`text-[10px] sm:text-xs font-bold ${reputation > 60 ? 'text-green-400' : reputation > 40 ? 'text-yellow-400' : 'text-red-400'}`}>REP: {reputation}</p>
              {honor > 0 && <p className="text-[10px] sm:text-xs font-bold text-amber-400">✨{honor}</p>}
            </div>
        </div>
    </div>
  );

  const HistoryIcon = ({ move }) => (
    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${move === 'trust' ? 'bg-cyan-500/20' : 'bg-pink-500/20'}`}>
      {move === 'trust' ? <Handshake size={12} className="text-cyan-300 sm:w-4 sm:h-4" /> : <Swords size={12} className="text-pink-400 sm:w-4 sm:h-4" />}
    </div>
  );

  // Verificar si es ronda dorada al cambiar de ronda
  useEffect(() => {
    const isGolden = goldenRound.includes(round);
    setIsGoldenRound(isGolden);
    if (isGolden) {
      playGoldenRound(); // ⭐ Sonido épico!
    }
  }, [round, goldenRound]);

  return (
    <div className="min-h-screen w-full text-white flex flex-col p-2 sm:p-4 md:p-6 font-sans justify-start sm:justify-center items-center relative overflow-x-hidden" style={{ backgroundImage: 'url("/images/imagenes-generadas-ia-cielo_843290-173.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70 pointer-events-none"></div>
      
      {/* Layout principal: Centrado en PC */}
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 relative z-10">
        
        {/* ÁREA DEL JUEGO - Centrada */}
        <div className="w-full">
      
      {/* PANTALLA DE FIN DE PARTIDA */}
      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className={`text-center p-4 sm:p-10 rounded-2xl sm:rounded-3xl border-2 sm:border-4 max-w-[95vw] ${
            finalResult === 'win' ? 'bg-gradient-to-br from-yellow-900/50 to-green-900/50 border-yellow-500' :
            finalResult === 'lose' ? 'bg-gradient-to-br from-red-900/50 to-slate-900/50 border-red-500' :
            'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-500'
          } animate-pulse`}>
            
            {/* Emoji y Título */}
            <div className="text-5xl sm:text-8xl mb-2 sm:mb-4">
              {finalResult === 'win' ? '🏆' : finalResult === 'lose' ? '💀' : '🤝'}
            </div>
            
            <h1 className={`text-3xl sm:text-6xl font-black mb-2 sm:mb-4 ${
              finalResult === 'win' ? 'text-yellow-400' :
              finalResult === 'lose' ? 'text-red-400' :
              'text-slate-300'
            }`}>
              {finalResult === 'win' ? '¡VICTORIA!' : finalResult === 'lose' ? 'DERROTA' : 'EMPATE'}
            </h1>
            
            {/* Scores finales */}
            <div className="flex justify-center items-center gap-3 sm:gap-8 my-4 sm:my-8">
              <div className={`text-center p-2 sm:p-4 rounded-xl ${finalResult === 'win' ? 'bg-green-500/20 border-2 border-green-500' : 'bg-slate-800/50'}`}>
                <img src={getAvatar(players.p1.name, 80)} alt="Tú" className="w-12 h-12 sm:w-20 sm:h-20 rounded-full mx-auto mb-1 sm:mb-2 border-2 sm:border-4 border-slate-600 bg-slate-800" />
                <p className="text-sm sm:text-xl font-bold text-gray-300 truncate max-w-[80px] sm:max-w-none">{players.p1.name}</p>
                <p className={`text-3xl sm:text-5xl font-black ${finalResult === 'win' ? 'text-green-400' : finalResult === 'lose' ? 'text-red-400' : 'text-white'}`}>
                  {players.p1.score}
                </p>
                <p className="text-xs sm:text-sm text-gray-400">puntos</p>
              </div>
              
              <div className="text-2xl sm:text-4xl font-black text-gray-500">VS</div>
              
              <div className={`text-center p-2 sm:p-4 rounded-xl ${finalResult === 'lose' ? 'bg-green-500/20 border-2 border-green-500' : 'bg-slate-800/50'}`}>
                <img src={getAvatar(players.p2.name, 80)} alt="Oponente" className="w-12 h-12 sm:w-20 sm:h-20 rounded-full mx-auto mb-1 sm:mb-2 border-2 sm:border-4 border-slate-600 bg-slate-800" />
                <p className="text-sm sm:text-xl font-bold text-gray-300 truncate max-w-[80px] sm:max-w-none">{players.p2.name}</p>
                <p className={`text-3xl sm:text-5xl font-black ${finalResult === 'lose' ? 'text-green-400' : finalResult === 'win' ? 'text-red-400' : 'text-white'}`}>
                  {players.p2.score}
                </p>
                <p className="text-xs sm:text-sm text-gray-400">puntos</p>
              </div>
            </div>
            
            {/* Estadísticas */}
            <div className="text-gray-400 mb-3 sm:mb-6 text-sm sm:text-base space-y-1">
              <p>Reputación final: <span className={`font-bold ${p1Reputation > 50 ? 'text-green-400' : 'text-red-400'}`}>{p1Reputation}</span></p>
              {p1Honor > 0 && <p>Honor ganado: <span className="font-bold text-amber-400">✨ {p1Honor}</span></p>}
              {p1BetrayalStreak >= 3 && <p className="text-red-400">⚠️ Jugador poco confiable</p>}
            </div>
            
            {/* Botones */}
            <div className="flex gap-2 sm:gap-4 justify-center">
              <button 
                onClick={() => {
                  setGameOver(false);
                  setRound(1);
                  setTimer(5);
                  setHistory([]);
                  setShowResult(false);
                  setPlayerHasChosen(false);
                  setPlayers({
                    p1: { name: p1Name, score: 0 },
                    p2: { name: p2Name, score: 0 }
                  });
                  setP1Reputation(50);
                  setP2Reputation(50);
                  setP1BetrayalStreak(0);
                  setP2BetrayalStreak(0);
                  setP1CooperationStreak(0);
                  setP2CooperationStreak(0);
                  setP1Honor(0);
                  setP2Honor(0);
                  setLastP2Move(null);
                  setCurrentPlayer(1);
                  setP1Choice(null);
                  setP2Choice(null);
                  setWaitingForP2(false);
                }}
                className="px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm sm:text-xl rounded-xl hover:scale-105 transition-transform"
              >
                🔄 REVANCHA
              </button>
              <button 
                onClick={() => navigate('/lobby')}
                className="px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-bold text-sm sm:text-xl rounded-xl hover:scale-105 transition-transform"
              >
                🚪 SALIR
              </button>
            </div>
          </div>
        </div>
      )}
      
        {/* Top HUD: Players Info & Round */}
        <header className="flex justify-between items-center w-full mb-4 sm:mb-6">
            <PlayerHUD name={players.p1.name} score={players.p1.score} avatar={getAvatar(players.p1.name, 80)} scoreStatus={scoreChanged.p1} reputation={p1Reputation} honor={p1Honor} betrayalStreak={p1BetrayalStreak} />
            <div className="text-center flex-shrink-0 px-1">
                <p className="text-xs sm:text-lg font-bold text-gray-400">RONDA</p>
                <p className={`text-2xl sm:text-4xl font-black ${isGoldenRound ? 'text-yellow-400 animate-pulse' : ''}`}>
                  {isGoldenRound && '⭐ '}{round}<span className="text-lg sm:text-2xl text-gray-500">/10</span>
                </p>
                {/* Indicador de Ronda Dorada */}
                {isGoldenRound && (
                  <p className="text-[10px] sm:text-xs font-bold text-yellow-400 animate-bounce">¡RONDA DORADA x2!</p>
                )}
                {/* Indicador de Combo */}
                {comboCount >= 2 && (
                  <p className="text-[10px] sm:text-xs font-bold text-amber-400">🔥 COMBO x{comboCount}</p>
                )}
            </div>
            <PlayerHUD name={players.p2.name} score={players.p2.score} alignment="right" avatar={getAvatar(players.p2.name, 80)} scoreStatus={scoreChanged.p2} reputation={p2Reputation} honor={p2Honor} betrayalStreak={p2BetrayalStreak} />
        </header>

        {/* Main Display: Timer or Result */}
        <main className="flex-1 flex items-center justify-center w-full min-h-[120px] sm:min-h-[200px]">
          {showResult ? (
            <ResultDiagram p1Move={lastResult.p1} p2Move={lastResult.p2} resultText={lastResult.text} p1Name={players.p1.name} p2Name={players.p2.name} />
          ) : (
            <div className="text-center">
              <p className={`text-6xl sm:text-8xl font-black tabular-nums transition-colors duration-300 ${timer <= 3 ? 'text-red-500 animate-pulse' : ''}`}>{timer}</p>
            </div>
          )}
        </main>

        {/* Bottom HUD: History & Actions */}
        <footer className="w-full max-w-2xl mx-auto mt-4 sm:mt-6">
          {/* History Bar */}
          <div className="flex justify-center items-center gap-2 sm:gap-4 mb-3 sm:mb-4 h-10 sm:h-12">
            <p className="font-bold text-gray-500 text-xs sm:text-sm">HISTORIAL:</p>
            <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
              {history.map((h, i) => (
                <div key={i} className="flex flex-col gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-slate-800/50 rounded">
                  <HistoryIcon move={h.p1} />
                  <HistoryIcon move={h.p2} />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {/* Modo Online - Indicadores */}
          {isOnlineMultiplayer && (
            <div className="text-center mb-2 sm:mb-4">
              {playerHasChosen ? (
                <div className="p-2 sm:p-3 bg-green-500/20 border border-green-500 rounded-xl">
                  <p className="text-sm sm:text-xl font-black text-green-400">
                    ✅ YA ELEGISTE - {opponentMoved ? '¡Oponente también eligió!' : 'Esperando...'}
                  </p>
                  {!opponentMoved && (
                    <div className="mt-2 flex justify-center">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              ) : opponentMoved ? (
                <div className="p-2 sm:p-3 bg-yellow-500/20 border border-yellow-500 rounded-xl animate-pulse">
                  <p className="text-sm sm:text-xl font-black text-yellow-400">
                    ⚡ ¡{players.p2.name} YA ELIGIÓ! - ¡RÁPIDO!
                  </p>
                </div>
              ) : (
                <div className="p-2 sm:p-3 bg-cyan-500/20 border border-cyan-500 rounded-xl">
                  <p className="text-sm sm:text-xl font-black text-cyan-400">
                    🎮 ELIGE TU JUGADA
                  </p>
                </div>
              )}
            </div>
          )}
          
          {isLocalMultiplayer && waitingForP2 && (
            <div className="text-center mb-2 sm:mb-4 p-2 sm:p-3 bg-pink-500/20 border border-pink-500 rounded-xl animate-pulse">
              <p className="text-lg sm:text-2xl font-black text-pink-400">
                🎮 TURNO DE {players.p2.name}
              </p>
              <p className="text-xs sm:text-sm text-gray-400">({players.p1.name} ya eligió)</p>
            </div>
          )}
          
          {isLocalMultiplayer && !waitingForP2 && !playerHasChosen && (
            <div className="text-center mb-2 sm:mb-4 p-2 sm:p-3 bg-cyan-500/20 border border-cyan-500 rounded-xl">
              <p className="text-lg sm:text-2xl font-black text-cyan-400">
                🎮 TURNO DE {players.p1.name}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button 
              onClick={() => isLocalMultiplayer && waitingForP2 ? processRound('trust', true) : processRound('trust')}
              disabled={playerHasChosen}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black text-lg sm:text-2xl py-4 sm:py-6 rounded-lg shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8" /> CONFIAR
            </button>
            <button 
              onClick={() => isLocalMultiplayer && waitingForP2 ? processRound('betray', true) : processRound('betray')}
              disabled={playerHasChosen}
              className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-black text-lg sm:text-2xl py-4 sm:py-6 rounded-lg shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
              <ShieldOff className="w-6 h-6 sm:w-8 sm:h-8" /> TRAICIONAR
            </button>
          </div>
          
          {/* Exit Button */}
          <button 
            onClick={() => {
              if (window.confirm('⚠️ ABANDONAR PARTIDA?\n\nPenalidad: -10 puntos y -20 reputación\n\n¿Estás seguro?')) {
                playLose();
                alert('❌ ABANDONASTE\n-10 puntos\n-20 reputación');
                navigate('/lobby');
              }
            }}
            className="w-full mt-3 sm:mt-4 py-2 sm:py-3 text-xs sm:text-sm font-bold bg-slate-800/50 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 hover:border-red-500 transition-all"
          >
            🚪 ABANDONAR (-10 pts)
          </button>
          
          {/* TABLA DE PUNTUACIÓN - Versión móvil (debajo de abandonar) */}
          <div className="lg:hidden mt-3 bg-slate-900/80 backdrop-blur-sm rounded-lg border border-purple-500/20 p-2">
            <div className="flex flex-col gap-1 text-[9px]">
              <div className="flex items-center justify-between gap-1">
                <span className="text-purple-400 font-bold">📊</span>
                <span className="text-gray-400">🤝🤝<span className="text-green-400 font-bold">+3</span></span>
                <span className="text-gray-400">🤝⚔️<span className="text-red-400 font-bold">-5</span></span>
                <span className="text-gray-400">⚔️🤝<span className="text-green-400 font-bold">+5</span></span>
                <span className="text-gray-400">⚔️⚔️<span className="text-orange-400 font-bold">-2</span></span>
              </div>
              <div className="flex items-center justify-between gap-1 border-t border-slate-700/50 pt-1">
                <span className="text-amber-400">🔥 COMBO: x2=+4 x3=+5 x4+=+6+BONUS</span>
                <span className="text-yellow-400">⭐ RONDA DORADA=x2</span>
              </div>
            </div>
          </div>
        </footer>
        </div>
        
        {/* TABLA DE PUNTUACIÓN - Versión desktop, posicionada abajo izquierda */}
        <aside className="hidden lg:block fixed bottom-4 left-4 w-64 z-20">
          <div className="bg-slate-900/95 backdrop-blur-sm rounded-lg border border-purple-500/30 p-3">
            <h3 className="text-sm font-black text-purple-400 mb-2 text-center">📊 SISTEMA DE PUNTOS</h3>
            
            {/* Tabla de resultados */}
            <table className="w-full text-[10px] mb-2">
              <thead>
                <tr className="text-gray-400">
                  <th className="py-0.5 text-left">TÚ</th>
                  <th className="py-0.5 text-left">RIVAL</th>
                  <th className="py-0.5 text-right">PTS</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-t border-slate-700">
                  <td className="py-1">🤝 Confiar</td>
                  <td className="py-1">🤝 Confiar</td>
                  <td className="py-1 text-right text-green-400 font-bold">+3</td>
                </tr>
                <tr className="border-t border-slate-700">
                  <td className="py-1">🤝 Confiar</td>
                  <td className="py-1">⚔️ Traicionar</td>
                  <td className="py-1 text-right text-red-400 font-bold">-5</td>
                </tr>
                <tr className="border-t border-slate-700">
                  <td className="py-1">⚔️ Traicionar</td>
                  <td className="py-1">🤝 Confiar</td>
                  <td className="py-1 text-right text-green-400 font-bold">+5</td>
                </tr>
                <tr className="border-t border-slate-700">
                  <td className="py-1">⚔️ Traicionar</td>
                  <td className="py-1">⚔️ Traicionar</td>
                  <td className="py-1 text-right text-orange-400 font-bold">-2</td>
                </tr>
              </tbody>
            </table>
            
            {/* 🔥 COMBO SYSTEM */}
            <div className="text-[9px] border-t border-amber-500/30 pt-2 mb-2">
              <p className="text-amber-400 font-bold mb-1">🔥 COMBO (cooperación mutua seguida)</p>
              <div className="text-gray-300 grid grid-cols-2 gap-x-2">
                <span>x2 seguidas: <span className="text-green-400">+4</span></span>
                <span>x3 seguidas: <span className="text-green-400">+5</span></span>
                <span>x4+ seguidas: <span className="text-green-400">+6</span></span>
                <span className="text-yellow-400">+3 BONUS!</span>
              </div>
            </div>
            
            {/* ⭐ RONDA DORADA */}
            <div className="text-[9px] border-t border-yellow-500/30 pt-2 mb-2">
              <p className="text-yellow-400 font-bold">⭐ RONDA DORADA (aleatoria)</p>
              <p className="text-gray-300">¡Todos los puntos x2! 1-2 por partida</p>
            </div>
            
            {/* Reglas especiales */}
            <div className="text-[9px] text-gray-400 border-t border-slate-700 pt-2 space-y-1">
              <p><span className="text-orange-400">🚫</span> Traición R1-R2 = solo +2 pts</p>
              <p><span className="text-red-400">💀</span> 3-4 seguidas = 0 pts / mutua -4</p>
              <p><span className="text-red-600">☠️</span> 5+ seguidas = -3 pts / mutua -5</p>
              <p><span className="text-purple-400">📊</span> 4-6 totales = -2 extra</p>
              <p><span className="text-purple-600">📊</span> 7+ totales = -3 extra</p>
              <p><span className="text-gray-500">⏱️</span> Timeout = -3 pts</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Game;
