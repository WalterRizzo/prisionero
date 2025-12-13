import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu } from 'lucide-react';

// Mock data para simular un lobby vivo
const mockGames = [
  { id: 1, p1: 'NINJA', p2: 'GHOST', round: 7, status: 'EN VIVO' },
  { id: 2, p1: 'CYPHER', p2: 'RAZE', round: 3, status: 'EN VIVO' },
  { id: 3, p1: 'ZERO', p2: 'ECHO', round: 9, status: 'EN VIVO' },
  { id: 4, p1: 'APEX', p2: 'NOVA', round: 5, status: 'EN VIVO' },
  { id: 5, p1: 'BLAZE', p2: 'FURY', round: 2, status: 'EN VIVO' },
  { id: 6, p1: 'WRAITH', p2: 'VOID', round: 10, status: 'EN VIVO' },
];

const Lobby = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState(128);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlayers(p => p + Math.floor(Math.random() * 5) - 2);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handlePlayAI = () => {
    const gameId = `ai-${Math.floor(Math.random() * 1000)}`;
    navigate(`/game/${gameId}`);
  };

  return (
    <div className="min-h-screen w-full text-white relative overflow-hidden" style={{ 
      backgroundImage: 'url("/images/evolucion-inteligencia-artificial-robots-ia-generativa_847288-10353.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="absolute inset-0 bg-black/50"></div>
      
      <div className="relative z-10 min-h-screen flex flex-col p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
            <p className="text-2xl font-black text-green-400">{players} ONLINE</p>
          </div>
          <div className="flex items-center gap-3">
            <img src="https://i.pravatar.cc/50?u=user777" alt="avatar" className="w-12 h-12 rounded-full border-2 border-cyan-500" />
            <p className="text-xl font-black">USER_777</p>
          </div>
        </header>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 mb-2">LOBBY</h1>
          <p className="text-gray-400 text-lg">Elige tu batalla</p>
        </div>

        {/* Play Button */}
        <button
          onClick={handlePlayAI}
          className="w-full max-w-lg mx-auto py-6 text-2xl font-black bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:scale-105 transition-transform mb-10 shadow-2xl shadow-green-500/30"
        >
          🎮 JUGAR vs IA
        </button>

        {/* Live Games */}
        <div className="flex-1">
          <h2 className="text-2xl font-black mb-4 text-cyan-300 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            PARTIDAS EN VIVO
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockGames.map(game => (
              <div
                key={game.id}
                onClick={() => navigate(`/game/${game.id}`)}
                className="p-4 bg-black/60 backdrop-blur-sm rounded-xl hover:bg-black/80 cursor-pointer border border-cyan-500/30 hover:border-cyan-500 transition-all hover:scale-105"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-green-400 text-sm font-bold animate-pulse flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    EN VIVO
                  </span>
                  <span className="text-gray-400 text-sm">Ronda {game.round}/10</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={`https://i.pravatar.cc/40?u=${game.p1}`} alt={game.p1} className="w-10 h-10 rounded-full border-2 border-cyan-500" />
                    <span className="text-cyan-400 font-bold text-lg">{game.p1}</span>
                  </div>
                  <span className="text-2xl font-black text-purple-400">VS</span>
                  <div className="flex items-center gap-2">
                    <span className="text-pink-400 font-bold text-lg">{game.p2}</span>
                    <img src={`https://i.pravatar.cc/40?u=${game.p2}`} alt={game.p2} className="w-10 h-10 rounded-full border-2 border-pink-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
