// Sistema ELO para Arena Clash
const K_FACTOR = 32; // Factor de cambio de ELO (estándar en ajedrez)

// Calcular cambio de ELO
const calculateEloChange = (winnerElo, loserElo) => {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

  const winnerChange = Math.round(K_FACTOR * (1 - expectedWinner));
  const loserChange = Math.round(K_FACTOR * (0 - expectedLoser));

  return { winnerChange, loserChange };
};

// Calcular daño en batalla
const calculateDamage = (attacker, defender, cardData) => {
  let baseDamage = attacker.damage || 0;
  
  // Modificadores
  let multiplier = 1.0;
  
  // Si el defensor está congelado, toma 1.5x daño
  if (defender.isFrozen) {
    multiplier *= 1.5;
  }
  
  // Ventaja de tipo
  const typeAdvantages = {
    soldado: { criatura: 1.2 },
    mago: { soldado: 1.2 },
    criatura: { mago: 1.2 },
    defensa: { hechizo: 0.8 }
  };
  
  if (typeAdvantages[attacker.type] && typeAdvantages[attacker.type][defender.type]) {
    multiplier *= typeAdvantages[attacker.type][defender.type];
  }
  
  const finalDamage = Math.max(1, Math.floor(baseDamage * multiplier));
  
  return finalDamage;
};

// Procesar efectos especiales de cartas
const processCardEffect = (card, target) => {
  const effects = [];
  
  if (card.effect === 'freeze') {
    target.isFrozen = true;
    effects.push('❄️ Congelado');
  }
  
  if (card.effect === 'heal') {
    target.health = Math.min(target.maxHealth, target.health + 5);
    effects.push('❤️ Curado');
  }
  
  if (card.effect === 'drain') {
    target.health -= 2;
    effects.push('🧛 Drenado');
  }
  
  if (card.effect === 'revive') {
    target.canRevive = true;
    effects.push('🔥 Puede resucitar');
  }
  
  return effects;
};

// Determinar ganador
const determineWinner = (p1Health, p2Health) => {
  if (p1Health > p2Health) return 'p1';
  if (p2Health > p1Health) return 'p2';
  return 'draw';
};

// Generar ID de partida único
const generateMatchId = () => {
  return `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Rating sistem para emparejamiento
const shouldMatch = (player1Elo, player2Elo, maxDifference = 150) => {
  const difference = Math.abs(player1Elo - player2Elo);
  return difference <= maxDifference;
};

module.exports = {
  calculateEloChange,
  calculateDamage,
  processCardEffect,
  determineWinner,
  generateMatchId,
  shouldMatch
};
