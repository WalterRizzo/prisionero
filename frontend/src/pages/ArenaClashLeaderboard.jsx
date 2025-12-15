import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';

const ArenaClashLeaderboard = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all'); // 'week', 'today', 'all'

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const isLocalhost = window.location.hostname.includes('localhost');
      const BASE_URL = isLocalhost ? 'http://localhost:5000' : '';
      const response = await fetch(
        `${BASE_URL}/api/arena/leaderboard?period=${period}&limit=100`
      );
      const data = await response.json();
      setLeaderboard(data);
    } catch (err) {
      console.error('Error cargando leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getManaColor = (elo) => {
    if (elo >= 4000) return 'from-red-600 to-orange-600';
    if (elo >= 3000) return 'from-yellow-600 to-orange-500';
    if (elo >= 2000) return 'from-blue-600 to-cyan-600';
    return 'from-slate-600 to-slate-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-900 to-slate-950 text-white p-4">
      <div className="max-w-2xl mx-auto">
        
        {/* HEADER */}
        <header className="text-center mb-8">
          <button
            onClick={() => navigate('/arena')}
            className="text-gray-400 hover:text-white mb-4"
          >
            ← Atrás
          </button>
          <h1 className="text-5xl font-black mb-2 text-yellow-400">
            🏆 RANKING GLOBAL
          </h1>
          <p className="text-gray-400">Top 100 mejores jugadores</p>
        </header>

        {/* TABS */}
        <div className="flex gap-2 mb-8 justify-center">
          {[
            { key: 'all', label: 'Todo el tiempo' },
            { key: 'week', label: 'Esta semana' },
            { key: 'today', label: 'Hoy' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPeriod(tab.key)}
              className={`px-4 py-2 rounded-lg font-bold transition ${
                period === tab.key
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* LEADERBOARD */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando ranking...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((player, idx) => (
              <div
                key={idx}
                className={`rounded-xl p-4 flex items-center justify-between border-2 transition-all hover:border-cyan-500 ${
                  idx < 3
                    ? `bg-gradient-to-r ${getManaColor(player.elo)} border-yellow-500/50`
                    : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                {/* RANK */}
                <div className="w-12 text-center">
                  <span className="text-2xl font-black">{getRankMedal(idx + 1)}</span>
                </div>

                {/* USERNAME */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{player.username}</h3>
                  <p className="text-sm text-gray-400">
                    {player.wins}W - {player.losses}L ({player.winrate}%)
                  </p>
                </div>

                {/* ELO */}
                <div className="text-right">
                  <div className="text-3xl font-black text-cyan-400">
                    {player.elo}
                  </div>
                  <p className="text-xs text-gray-400">ELO</p>
                </div>

                {/* TREND */}
                {idx < 3 && (
                  <div className="ml-4 text-2xl">
                    {idx === 0 ? '🔥' : idx === 1 ? '⚡' : '✨'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TIPS */}
        <div className="mt-12 bg-slate-900/50 rounded-lg p-6 border border-slate-700">
          <h3 className="font-bold text-lg mb-3">📊 Cómo sube el ELO</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>✅ Victoria vs rival más débil: +10 ELO</li>
            <li>✅ Victoria vs rival más fuerte: +50 ELO</li>
            <li>❌ Derrota vs rival más débil: -30 ELO</li>
            <li>❌ Derrota vs rival más fuerte: -10 ELO</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ArenaClashLeaderboard;
