import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';

// Usar localhost si estás en desarrollo local, Railway en producción
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const SOCKET_URL = isLocalhost 
  ? 'http://localhost:5000'
  : '';

const mockCards = [
  { id: 1, name: 'Espadachín', emoji: '🗡️', mana: 3, damage: 4 },
  { id: 2, name: 'Arquero', emoji: '🏹', mana: 2, damage: 3 },
  { id: 3, name: 'Mago', emoji: '🧙', mana: 4, damage: 5 },
  { id: 4, name: 'Gigante', emoji: '🗿', mana: 6, damage: 6 },
  { id: 5, name: 'Pícaro', emoji: '🔪', mana: 2, damage: 2, effect: 'double_attack' },
  { id: 6, name: 'Muro', emoji: '🧱', mana: 5, damage: 0, health: 10 },
  { id: 7, name: 'Bomba', emoji: '💣', mana: 3, damage: 5 },
  { id: 8, name: 'Rayo', emoji: '⚡', mana: 4, damage: 3, effect: 'direct_damage' },
  { id: 9, name: 'Curandera', emoji: '❤️‍🩹', mana: 4, damage: 0, effect: 'heal', heal: 4 },
];


const ArenaClashBattle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAiMatch = location.state?.isAiMatch || false;

  const [socket, setSocket] = useState(null);
  const [matchData, setMatchData] = useState(null);
  
  const [gameState, setGameState] = useState({
    p1: { name: 'Tú', health: 30, mana: 6, hand: [], field: [null, null, null], playedCard: false },
    p2: { name: 'IA', health: 30, mana: 4, hand: [], field: [null, null, null], playedCard: false },
    timer: 30,
    round: 1
  });
  
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedLane, setSelectedLane] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [result, setResult] = useState(null);

  const drawCard = (deck) => {
    return deck[Math.floor(Math.random() * deck.length)];
  };

  const processRound = useCallback(() => {
    setGameState(prev => {
      let p1Damage = 0;
      let p2Damage = 0;
      const newBattleLog = [...battleLog, `--- Fin Ronda ${prev.round} ---`];

      for (let i = 0; i < 3; i++) {
        const p1Card = prev.p1.field[i];
        const p2Card = prev.p2.field[i];

        if (p1Card && p2Card) {
          const p1Dmg = p1Card.damage || 0;
          const p2Dmg = p2Card.damage || 0;
          if (p1Dmg > p2Dmg) {
            p2Damage += (p1Dmg - p2Dmg);
            newBattleLog.push(`Carril ${i+1}: ${p1Card.emoji} gana a ${p2Card.emoji}. Daño: ${p1Dmg - p2Dmg}`);
          } else if (p2Dmg > p1Dmg) {
            p1Damage += (p2Dmg - p1Dmg);
            newBattleLog.push(`Carril ${i+1}: ${p2Card.emoji} gana a ${p1Card.emoji}. Daño: ${p2Dmg - p1Dmg}`);
          } else {
             newBattleLog.push(`Carril ${i+1}: Empate entre ${p1Card.emoji} y ${p2Card.emoji}.`);
          }
        } else if (p1Card) {
          p2Damage += p1Card.damage || 0;
          newBattleLog.push(`Carril ${i+1}: ${p1Card.emoji} ataca sin oposición. Daño: ${p1Card.damage}`);
        } else if (p2Card) {
          p1Damage += p2Card.damage || 0;
          newBattleLog.push(`Carril ${i+1}: ${p2Card.emoji} ataca sin oposición. Daño: ${p2Card.damage}`);
        }
      }
      
      const newP1Health = prev.p1.health - p1Damage;
      const newP2Health = prev.p2.health - p2Damage;
      
      newBattleLog.push(`Daño total: Tú ${p1Damage}, IA ${p2Damage}`);
      setBattleLog(newBattleLog);

      if (newP1Health <= 0 || newP2Health <= 0) {
        setGameOver(true);
        const p1Wins = newP2Health <= 0;
        setWinner(p1Wins ? 'p1' : 'p2');
        setResult({ winner: p1Wins });
        return prev; // Stop further state changes
      }

      // Siguiente ronda
      return {
        ...prev,
        p1: { ...prev.p1, health: newP1Health, field: [null, null, null], hand: [...prev.p1.hand, drawCard(mockCards)].slice(-5), playedCard: false },
        p2: { ...prev.p2, health: newP2Health, field: [null, null, null], hand: [...prev.p2.hand, drawCard(mockCards)].slice(-5), playedCard: false },
        round: prev.round + 1,
        timer: 30,
      };
    });
  }, [battleLog]);


  const handleAiTurn = useCallback(() => {
    setTimeout(() => {
      setGameState(prev => {
        if (prev.p2.playedCard || gameOver) return prev;

        const availableCards = prev.p2.hand.filter(c => c.mana <= prev.p2.mana);
        if (availableCards.length === 0) {
           setBattleLog(bl => [...bl, "IA no tiene cartas para jugar."]);
           processRound();
           return {...prev, p2: {...prev.p2, playedCard: true}};
        }

        const cardToPlay = availableCards[Math.floor(Math.random() * availableCards.length)];
        const availableLanes = [0, 1, 2].filter(i => prev.p2.field[i] === null);
        
        if (availableLanes.length === 0) {
            processRound();
            return prev;
        }

        const lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];

        const newField = [...prev.p2.field];
        newField[lane] = cardToPlay;
        
        const newHand = prev.p2.hand.filter(c => c.id !== cardToPlay.id);

        setBattleLog(bl => [...bl, `IA juega ${cardToPlay.emoji} en carril ${lane + 1}`]);
        
        const newState = {
          ...prev,
          p2: {
            ...prev.p2,
            field: newField,
            hand: newHand,
            mana: prev.p2.mana - cardToPlay.mana,
            playedCard: true,
          }
        };
        
        // Si ambos jugaron, procesar ronda
        if (newState.p1.playedCard) {
          processRound();
        }

        return newState;
      });
    }, 1500);
  }, [processRound, gameOver]);


  // Conectar al socket o iniciar partida IA
  useEffect(() => {
    if (isAiMatch) {
      // --- LÓGICA PARTIDA VS IA ---
      setMatchData({ opponentName: 'Bot Lvl 1', elo: 800 });
      setGameState({
        p1: { name: 'Tú', health: 30, mana: 6, hand: [drawCard(mockCards), drawCard(mockCards), drawCard(mockCards)], field: [null, null, null], playedCard: false },
        p2: { name: 'IA', health: 30, mana: 4, hand: [drawCard(mockCards), drawCard(mockCards), drawCard(mockCards)], field: [null, null, null], playedCard: false },
        timer: 30,
        round: 1
      });
      setBattleLog(["Partida contra IA iniciada."]);
      return; // No conectar al socket
    }

    // --- LÓGICA MULTIJUGADOR ---
    const storedMatch = localStorage.getItem('currentArenaMatch');
    if (!storedMatch) {
      navigate('/arena');
      return;
    }

    const match = JSON.parse(storedMatch);
    setMatchData(match);

    const newSocket = io(`${SOCKET_URL}/arena`, {
      transports: ['websocket', 'polling'],
      reconnection: true
    });

    newSocket.on('connect', () => {
      console.log('✅ Conectado a batalla');
    });

    // Evento: Round result
    newSocket.on('round-result', (data) => {
      console.log('⚔️ Resultado de ronda:', data);
      
      setBattleLog(prev => [
        ...prev,
        `Ronda ${data.round}:`,
        `Tu daño: ${data.p1Damage}`,
        `Daño rival: ${data.p2Damage}`,
        `Tu salud: ${data.p1Health}`,
        `Salud rival: ${data.p2Health}`
      ]);

      setGameState(prev => ({
        ...prev,
        p1: { ...prev.p1, health: data.p1Health },
        p2: { ...prev.p2, health: data.p2Health },
        round: data.round + 1,
        timer: 45
      }));
    });

    // Evento: Nueva ronda
    newSocket.on('new-round', (data) => {
      console.log('🔄 Nueva ronda:', data);
      setGameState(prev => ({
        ...prev,
        round: data.round,
        timer: data.timer
      }));
      setSelectedCard(null);
      setSelectedLane(null);
    });

    // Evento: Fin de batalla
    newSocket.on('battle-end', (data) => {
      console.log('🏆 BATALLA TERMINADA:', data);
      setGameOver(true);
      setWinner(data.winner ? 'p1' : 'p2');
      setResult({
        winner: data.winner,
        eloChange: data.eloChange,
        newElo: data.newElo,
        reward: data.reward
      });
    });

    newSocket.on('opponent-played', (data) => {
      console.log('👀 Oponente jugó:', data);
      setBattleLog(prev => [...prev, `${data.username} jugó carta en carril ${data.lane}`]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [navigate, isAiMatch]);

  // Timer
  useEffect(() => {
    if (gameOver || !matchData) return;

    const timerInterval = setInterval(() => {
      setGameState(prev => {
        if (prev.timer <= 1) {
          clearInterval(timerInterval);
          if (isAiMatch) {
            processRound();
          } else {
            // Lógica de timeout para multijugador
            if (selectedCard === null) {
              const randomCard = mockCards[Math.floor(Math.random() * mockCards.length)];
              socket?.emit('play-card', {
                matchId: matchData.matchId,
                cardId: randomCard.id,
                lane: Math.floor(Math.random() * 3),
                playerSide: 'p1'
              });
            }
          }
          return prev;
        }
        return { ...prev, timer: prev.timer - 1 };
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [gameOver, selectedCard, socket, matchData, isAiMatch, processRound]);

  const handleCardPlay = (lane) => {
    if (!selectedCard || selectedLane !== null || gameState.p1.playedCard) return;

    if (gameState.p1.mana < selectedCard.mana) {
      setBattleLog(prev => [...prev, "No tienes suficiente maná!"]);
      return;
    }

    if (isAiMatch) {
      // --- JUGADA VS IA ---
      setGameState(prev => {
        const newField = [...prev.p1.field];
        newField[lane] = selectedCard;
        const newHand = prev.p1.hand.filter(c => c.id !== selectedCard.id);
        
        setBattleLog(bl => [...bl, `Juegas ${selectedCard.emoji} en carril ${lane + 1}`]);
        setSelectedCard(null);

        const newState = {
          ...prev,
          p1: {
            ...prev.p1,
            field: newField,
            hand: newHand,
            mana: prev.p1.mana - selectedCard.mana,
            playedCard: true,
          }
        };

        // Si la IA ya jugó, procesar ronda. Si no, es su turno.
        if (newState.p2.playedCard) {
          processRound();
        } else {
          handleAiTurn();
        }
        return newState;
      });
    } else {
      // --- JUGADA MULTIJUGADOR ---
      if (!socket) return;
      socket.emit('play-card', {
        matchId: matchData.matchId,
        cardId: selectedCard.id,
        lane,
        playerSide: 'p1'
      });
      setBattleLog(prev => [
        ...prev,
        `${selectedCard.emoji} ${selectedCard.name} entra en carril ${lane + 1}`
      ]);
      setSelectedCard(null);
    }
  };

  if (gameOver && result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-900 to-slate-950 flex items-center justify-center p-4">
        <div className={`text-center rounded-3xl p-12 max-w-lg border-4 ${
          result.winner 
            ? 'bg-gradient-to-br from-green-900/50 to-slate-900/50 border-green-500'
            : 'bg-gradient-to-br from-red-900/50 to-slate-900/50 border-red-500'
        }`}>
          
          <div className="text-8xl mb-4">
            {result.winner ? '🏆' : '💀'}
          </div>
          
          <h1 className={`text-5xl font-black mb-4 ${
            result.winner ? 'text-green-400' : 'text-red-400'
          }`}>
            {result.winner ? '¡VICTORIA!' : 'DERROTA'}
          </h1>
          
          {!isAiMatch && (
            <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
              <p className="text-cyan-400 text-lg font-bold">
                {result.eloChange >= 0 ? '+' : ''}{result.eloChange} ELO
              </p>
              <p className="text-gray-300">Nuevo ELO: {result.newElo}</p>
            </div>
          )}
          
          <div className="space-y-3 mb-6">
            {result.reward && (
              <p className="text-yellow-400 text-lg font-bold">+{result.reward} monedas 🪙</p>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/arena')}
              className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 font-bold rounded-lg transition"
            >
              🏠 INICIO
            </button>
            {!isAiMatch && (
              <button
                onClick={() => {
                  localStorage.removeItem('currentArenaMatch');
                  navigate('/arena/battle');
                }}
                className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-600 font-bold rounded-lg transition"
              >
                ⚡ SIGUIENTE
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!matchData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-900 to-slate-950 flex items-center justify-center">
        <p className="text-white text-xl">Cargando batalla...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      {/* TOP: Salud y timer */}
      <div className="bg-slate-900/80 p-4 border-b border-purple-500/30">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div className="text-center flex-1">
            <p className="text-gray-400 text-sm">TÚ</p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-32 h-6 bg-slate-700 rounded-full overflow-hidden border border-green-500">
                <div 
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${(gameState.p1.health / 30) * 100}%` }}
                />
              </div>
              <span className="font-bold w-8">{gameState.p1.health}</span>
            </div>
          </div>
          
          <div className="text-center px-4">
            <div className="text-4xl font-black text-cyan-400">{gameState.timer}s</div>
            <p className="text-xs text-gray-400">Ronda {gameState.round}</p>
          </div>
          
          <div className="text-center flex-1">
            <p className="text-gray-400 text-sm">{isAiMatch ? gameState.p2.name : matchData.opponentName}</p>
            <div className="flex items-center justify-center gap-2">
              <span className="font-bold w-8">{gameState.p2.health}</span>
              <div className="w-32 h-6 bg-slate-700 rounded-full overflow-hidden border border-red-500">
                <div 
                  className="h-full bg-red-500 transition-all"
                  style={{ width: `${(gameState.p2.health / 30) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BATALLA - 3 CARRILES */}
      <div className="p-6 max-w-4xl mx-auto">
        <h3 className="text-center text-gray-400 mb-4">⚔️ CAMPO DE BATALLA</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[0, 1, 2].map((laneIdx) => (
            <div
              key={laneIdx}
              onClick={() => selectedCard && handleCardPlay(laneIdx)}
              className={`aspect-video rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                selectedCard && !gameState.p1.field[laneIdx]
                  ? 'border-cyan-500 bg-cyan-500/20 hover:bg-cyan-500/30'
                  : 'border-slate-600 bg-slate-800/30'
              } ${gameState.p1.field[laneIdx] ? 'cursor-not-allowed' : ''}`}
            >
              {gameState.p2.field[laneIdx] && <div className="text-4xl">{gameState.p2.field[laneIdx].emoji}</div>}
              <div className="flex-grow"></div>
              {gameState.p1.field[laneIdx] && <div className="text-4xl">{gameState.p1.field[laneIdx].emoji}</div>}
            </div>
          ))}
        </div>

        {/* CARTAS EN MANO */}
        <div>
          <p className="text-center text-gray-400 mb-2">
            Maná: {gameState.p1.mana}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {gameState.p1.hand.map((card) => (
              <button
                key={card.id}
                onClick={() => setSelectedCard(selectedCard?.id === card.id ? null : card)}
                disabled={gameState.p1.mana < card.mana}
                className={`rounded-lg p-3 text-center transition-all border-2 ${
                  selectedCard?.id === card.id
                    ? 'border-cyan-500 bg-cyan-500/20 scale-110'
                    : 'border-slate-600 bg-slate-800 hover:border-cyan-500'
                } ${gameState.p1.mana < card.mana ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-2xl">{card.emoji}</div>
                <p className="text-xs font-bold mt-1">{card.name}</p>
                <p className="text-[10px] text-gray-400">{card.mana}⚡</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BATTLE LOG */}
      <div className="p-4 max-w-4xl mx-auto bg-slate-900/50 rounded-lg border border-slate-700 max-h-32 overflow-y-auto">
        {battleLog.map((log, i) => (
          <p key={i} className="text-xs text-gray-400">{log}</p>
        ))}
      </div>
    </div>
  );
};

export default ArenaClashBattle;
