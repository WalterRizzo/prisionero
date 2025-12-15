import React, { useState, useEffect } from 'react';
import { Zap, Trophy, TrendingUp } from 'lucide-react';

const DailyChallenge = () => {
  const [challenge, setChallenge] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userScore, setUserScore] = useState(0);
  
  const isLocalhost = window.location.hostname.includes('localhost');
  const SOCKET_URL = isLocalhost
    ? 'http://localhost:5000'
    : 'https://prisionero-backend-production.up.railway.app';

  useEffect(() => {
    fetchChallenge();
    fetchLeaderboard();
  }, []);

  const fetchChallenge = async () => {
    try {
      const response = await fetch(`${SOCKET_URL}/api/challenges/daily`);
      const data = await response.json();
      if (data.success) {
        setChallenge(data.challenge);
      }
    } catch (error) {
      console.error('Error fetching challenge:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${SOCKET_URL}/api/challenges/leaderboard`);
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              DESAFÍO DIARIO
            </h1>
            <Zap className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-blue-200">Un nuevo desafío cada día - ¡Sube al ranking!</p>
        </div>

        {/* Desafío actual */}
        {challenge && (
          <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border-2 border-yellow-500 rounded-lg p-8 mb-8 shadow-2xl">
            <div className="text-center">
              <p className="text-yellow-300 font-bold mb-2">Desafío de hoy:</p>
              <p className="text-3xl font-bold text-white mb-4">{challenge.description}</p>
              <div className="flex gap-4 justify-center">
                <div className="px-4 py-2 bg-slate-800 rounded-lg">
                  <p className="text-yellow-400 font-bold text-2xl">{challenge.difficulty.toUpperCase()}</p>
                </div>
                <div className="px-4 py-2 bg-slate-800 rounded-lg">
                  <p className="text-yellow-400 font-bold text-2xl">+{challenge.target_score} XP</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-slate-800 border border-blue-500 rounded-lg overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              TOP 10 HOY
            </h2>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-blue-200">Cargando ranking...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold text-gray-300">#</th>
                    <th className="px-6 py-3 text-left font-bold text-gray-300">Jugador</th>
                    <th className="px-6 py-3 text-center font-bold text-gray-300">Nivel</th>
                    <th className="px-6 py-3 text-right font-bold text-gray-300">Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.length > 0 ? (
                    leaderboard.map((player, idx) => (
                      <tr
                        key={player.username}
                        className={`border-t border-slate-700 hover:bg-slate-700 transition ${
                          idx < 3 ? 'bg-slate-700' : ''
                        }`}
                      >
                        <td className="px-6 py-3">
                          <span className={`text-lg font-bold ${
                            idx === 0 ? 'text-yellow-400' :
                            idx === 1 ? 'text-gray-300' :
                            idx === 2 ? 'text-orange-400' :
                            'text-blue-300'
                          }`}>
                            {idx + 1}
                            {idx < 3 && ['🥇', '🥈', '🥉'][idx]}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-white font-semibold">{player.username}</td>
                        <td className="px-6 py-3 text-center">
                          <span className="px-3 py-1 bg-purple-500/20 rounded-full text-purple-300 font-bold">
                            Lvl {player.level}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right text-yellow-400 font-bold">{player.score} pts</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-blue-300">
                        Todavía no hay puntuaciones. ¡Sé el primero!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyChallenge;
