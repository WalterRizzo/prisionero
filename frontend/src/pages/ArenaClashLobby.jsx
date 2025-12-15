import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Trophy, Users } from 'lucide-react';

const ArenaClashLobby = () => {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar perfil del usuario
    const username = localStorage.getItem('player1Name') || 'Player';
    fetchUserProfile(username);
  }, []);

  const fetchUserProfile = async (username) => {
    try {
      const response = await fetch(`https://prisionero.onrender.com/api/arena/profile/${username}`);
      
      if (response.status === 404) {
        // Crear nuevo usuario Arena Clash
        const userId = localStorage.getItem('userId') || 'guest_' + Date.now();
        await fetch('https://prisionero.onrender.com/api/arena/user/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, username })
        });
        
        // Cargar nuevamente
        const retryResponse = await fetch(`https://prisionero.onrender.com/api/arena/profile/${username}`);
        const data = await retryResponse.json();
        setUserProfile(data);
      } else {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Error cargando perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickMatch = () => {
    setIsSearching(true);
    
    // Simular búsqueda de rival (en prod sería Socket.IO)
    const timeout = setTimeout(() => {
      setIsSearching(false);
      // Navegar a la batalla
      navigate('/arena/battle');
    }, 3000 + Math.random() * 3000); // 3-6 segundos de espera
    
    setSearchTimeout(timeout);
  };

  const handleCancelSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout);
    setIsSearching(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl font-bold">Cargando Arena...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-900 to-slate-950 text-white p-4">
      <div className="max-w-2xl mx-auto">
        
        {/* HEADER */}
        <header className="text-center mb-8">
          <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            ⚔️ ARENA CLASH
          </h1>
          <p className="text-gray-400 text-lg">Duelos ultrarrápidos | 30 segundos</p>
        </header>

        {/* PERFIL DEL USUARIO */}
        {userProfile && (
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 mb-8 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">{userProfile.username}</h2>
                <p className="text-gray-400">Arena Clash Player</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-cyan-400">{userProfile.elo}</div>
                <p className="text-gray-400 text-sm">ELO Rating</p>
              </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-black text-green-400">{userProfile.wins}</p>
                <p className="text-gray-400 text-sm">Victorias</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-black text-red-400">{userProfile.losses}</p>
                <p className="text-gray-400 text-sm">Derrotas</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-black text-yellow-400">{userProfile.winrate}%</p>
                <p className="text-gray-400 text-sm">Win Rate</p>
              </div>
            </div>
          </div>
        )}

        {/* QUICK MATCH SECTION */}
        <div className="bg-gradient-to-b from-purple-900/50 to-slate-900/50 rounded-xl p-8 border border-cyan-500/30 mb-8">
          <div className="text-center">
            <Zap className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black mb-2">⚡ QUICK MATCH</h3>
            <p className="text-gray-300 mb-6">Encuentra un rival y comienza en segundos</p>

            {!isSearching ? (
              <button
                onClick={handleQuickMatch}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xl rounded-xl hover:scale-105 transition-transform"
              >
                🎮 BUSCAR RIVAL
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-cyan-400 font-bold animate-pulse">Buscando rival...</p>
                <button
                  onClick={handleCancelSearch}
                  className="w-full py-3 bg-red-500/50 text-white font-bold rounded-lg hover:bg-red-600/50 transition"
                >
                  ❌ CANCELAR
                </button>
              </div>
            )}
          </div>
        </div>

        {/* OTROS BOTONES */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/arena/leaderboard')}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 p-4 rounded-xl font-bold transition-transform hover:scale-105"
          >
            <Trophy className="w-6 h-6 mx-auto mb-2" />
            🏆 RANKING
          </button>
          <button
            onClick={() => navigate('/arena/deck')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-4 rounded-xl font-bold transition-transform hover:scale-105"
          >
            <Users className="w-6 h-6 mx-auto mb-2" />
            🃏 DECKS
          </button>
        </div>

        {/* TIPS */}
        <div className="mt-8 bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          <p className="text-gray-400 text-sm">
            💡 <strong>TIP:</strong> Domina tu deck. Cada carta cuenta en 30 segundos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArenaClashLobby;
