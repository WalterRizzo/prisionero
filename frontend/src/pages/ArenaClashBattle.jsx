import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ArenaClashBattle = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState({
    p1: { health: 30, mana: 6, cardsInHand: [], field: [null, null, null] },
    p2: { health: 30, mana: 4, cardsInHand: [], field: [null, null, null] },
    timer: 45,
    round: 1
  });
  
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedLane, setSelectedLane] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  // Simular batalla
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timer <= 1) {
          clearInterval(timer);
          // Fin de la batalla simulada
          const p1Wins = gameState.p1.health > gameState.p2.health;
          setWinner(p1Wins ? 'p1' : 'p2');
          setGameOver(true);
          return prev;
        }
        return { ...prev, timer: prev.timer - 1 };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleCardPlay = (lane) => {
    if (!selectedCard || selectedLane !== null) return;
    
    setSelectedLane(lane);
    
    // Simular daño
    setBattleLog(prev => [
      ...prev,
      `${selectedCard.emoji} ${selectedCard.name} entra en carril ${lane + 1}`,
      `⚔️ Ataque: ${selectedCard.damage} daño`
    ]);
    
    setSelectedCard(null);
    setSelectedLane(null);
  };

  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-900 to-slate-950 flex items-center justify-center p-4">
        <div className={`text-center rounded-3xl p-12 max-w-lg border-4 ${
          winner === 'p1' 
            ? 'bg-gradient-to-br from-green-900/50 to-slate-900/50 border-green-500'
            : 'bg-gradient-to-br from-red-900/50 to-slate-900/50 border-red-500'
        }`}>
          
          <div className="text-8xl mb-4">
            {winner === 'p1' ? '🏆' : '💀'}
          </div>
          
          <h1 className={`text-5xl font-black mb-4 ${
            winner === 'p1' ? 'text-green-400' : 'text-red-400'
          }`}>
            {winner === 'p1' ? '¡VICTORIA!' : 'DERROTA'}
          </h1>
          
          <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
            <p className="text-gray-300">Tu salud: {gameState.p1.health}</p>
            <p className="text-gray-300">Salud rival: {gameState.p2.health}</p>
          </div>
          
          <div className="space-y-3">
            {winner === 'p1' ? (
              <>
                <p className="text-cyan-400 text-lg font-bold">+50 ELO (2450 → 2500)</p>
                <p className="text-green-400">+500 monedas 🪙</p>
              </>
            ) : (
              <>
                <p className="text-red-400 text-lg font-bold">-25 ELO (2450 → 2425)</p>
                <p className="text-yellow-400">+100 monedas 🪙</p>
              </>
            )}
          </div>
          
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => navigate('/arena')}
              className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 font-bold rounded-lg transition"
            >
              🏠 INICIO
            </button>
            <button
              onClick={() => navigate('/arena/battle')}
              className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-600 font-bold rounded-lg transition"
            >
              ⚡ SIGUIENTE
            </button>
          </div>
        </div>
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
          </div>
          
          <div className="text-center flex-1">
            <p className="text-gray-400 text-sm">RIVAL</p>
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
              className={`aspect-square rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all ${
                selectedLane === laneIdx
                  ? 'border-cyan-500 bg-cyan-500/20'
                  : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'
              }`}
            >
              {gameState.p1.field[laneIdx] ? (
                <div className="text-center">
                  <div className="text-4xl mb-2">{gameState.p1.field[laneIdx].emoji}</div>
                  <p className="text-xs font-bold">{gameState.p1.field[laneIdx].name}</p>
                </div>
              ) : (
                <p className="text-gray-500 text-center">Carril {laneIdx + 1}</p>
              )}
            </div>
          ))}
        </div>

        {/* CARTAS EN MANO */}
        <div>
          <p className="text-center text-gray-400 mb-2">
            Maná: ●●●●●● {gameState.p1.mana}/6
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {/* Simular cartas en mano */}
            {[
              { id: 1, name: 'Espadachín', emoji: '🗡️', mana: 3, damage: 4 },
              { id: 3, name: 'Mago', emoji: '🧙', mana: 4, damage: 5 },
              { id: 6, name: 'Muro', emoji: '🏰', mana: 5, damage: 0 },
              { id: 8, name: 'Dinamita', emoji: '💣', mana: 3, damage: 5 },
              { id: 9, name: 'Rayo', emoji: '⚡', mana: 4, damage: 6 }
            ].map((card) => (
              <button
                key={card.id}
                onClick={() => setSelectedCard(selectedCard?.id === card.id ? null : card)}
                className={`rounded-lg p-3 text-center transition-all border-2 ${
                  selectedCard?.id === card.id
                    ? 'border-cyan-500 bg-cyan-500/20 scale-110'
                    : 'border-slate-600 bg-slate-800 hover:border-cyan-500'
                }`}
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
