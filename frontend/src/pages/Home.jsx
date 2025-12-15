import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Mock data for live games and avatars
const liveGames = [
  { id: 1, p1: 'Jugador_87', p2: 'KobraX', avatar1: 'https://i.pravatar.cc/40?u=jugador87', avatar2: 'https://i.pravatar.cc/40?u=kobrax', round: 4, time: '00:06' },
  { id: 2, p1: 'J1', p2: 'J2', avatar1: 'https://i.pravatar.cc/40?u=j1', avatar2: 'https://i.pravatar.cc/40?u=j2', round: 3, time: '00:09' },
];

const Home = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState(128);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlayers(p => p + Math.floor(Math.random() * 3) - 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden" style={{
      backgroundImage: 'url("/images/ai-generated-ai-generative-ilustracion-tomada-galaxia-espacial-planeta-tierra-luces-nocturnas_95211-5540.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="w-full max-w-2xl mx-auto relative z-10">
        
        {/* Main Call to Action */}
        <div className="text-center mb-10">
          <h1 className="text-7xl md:text-8xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">TRUST<br/>OR<br/>BETRAY</h1>
          <p className="text-gray-300 text-xl md:text-2xl mb-8">The ultimate game of deception.<br/>Every choice has consequences.</p>
          <Link
            to="/lobby"
            className="w-full max-w-md mx-auto block text-center py-5 text-2xl font-black bg-gradient-to-r from-cyan-500 to-cyan-400 text-black rounded-xl shadow-[0_0_30px_rgba(0,224,255,0.6)] hover:scale-105 transition-all duration-300"
          >
            🎮 JUGAR AHORA
          </Link>
          <p className="text-gray-400 text-lg mt-4">+{players} jugadores conectados ahora</p>
        </div>

        {/* Live Games List */}
        <div className="bg-black/60 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 space-y-5 mb-8">
          <h3 className="text-xl font-black text-cyan-400 mb-4">🔴 PARTIDAS EN VIVO</h3>
          {liveGames.map(game => (
            <div key={game.id} className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer" onClick={() => navigate(`/game/${game.id}`)}>
              <div className="flex items-center">
                <img src={game.avatar1} alt={game.p1} className="w-12 h-12 rounded-full border-2 border-cyan-500" />
                <div className="ml-4">
                  <div className="flex items-center text-sm mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-green-400 font-bold">EN VIVO</span>
                  </div>
                  <p className="font-black text-xl">{game.p1}</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Ronda {game.round}・{game.time} restantes</p>
                <p className="font-black text-2xl text-purple-400">vs</p>
              </div>
              <div className="flex items-center">
                 <div className="mr-4 text-right">
                    <p className="font-black text-xl">{game.p2}</p>
                 </div>
                <img src={game.avatar2} alt={game.p2} className="w-12 h-12 rounded-full border-2 border-pink-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Buttons */}
        <div className="grid grid-cols-2 gap-6">
          <button 
            onClick={() => navigate('/lobby')}
            className="w-full py-4 text-lg font-bold bg-slate-800/80 border border-slate-600 rounded-xl hover:bg-slate-700 hover:border-cyan-500 transition-all"
          >
            ENTRAR A PARTIDA
          </button>
          <button 
            onClick={() => navigate('/arena')}
            className="w-full py-4 text-lg font-bold bg-gradient-to-r from-purple-600 to-cyan-600 border border-cyan-500 rounded-xl hover:from-purple-500 hover:to-cyan-500 transition-all"
          >
            ⚔️ ARENA CLASH
          </button>
          <button 
            onClick={() => navigate('/daily')}
            className="w-full py-4 text-lg font-bold bg-gradient-to-r from-yellow-600 to-orange-600 border border-yellow-500 rounded-xl hover:from-yellow-500 hover:to-orange-500 transition-all"
          >
            ⚡ DESAFÍO DIARIO
          </button>
          <button 
            onClick={() => navigate('/leaderboard')}
            className="w-full py-4 text-lg font-bold bg-slate-800/80 border border-slate-600 rounded-xl hover:bg-slate-700 hover:border-yellow-500 transition-all"
          >
            🏆 RANKING
          </button>
        </div>

      </div>
    </div>
  );
};

export default Home;
