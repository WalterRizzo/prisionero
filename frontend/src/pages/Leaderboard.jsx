import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Heart } from 'lucide-react';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('score'); // score, wins, karma
  const SOCKET_URL = window.location.hostname.includes('pages.dev')
    ? 'https://prisionero.onrender.com'
    : `http://${window.location.hostname}:5000`;

  useEffect(() => {
    fetchLeaderboard();
  }, [tab]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      let endpoint = '/api/leaderboard/top100';
      
      if (tab === 'wins') endpoint = '/api/leaderboard/top-wins';
      else if (tab === 'karma') endpoint = '/api/leaderboard/top-karma';
      
      const response = await fetch(`${SOCKET_URL}${endpoint}`);
      const data = await response.json();
      
      setLeaderboard(data.leaderboard || data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              RANKING GLOBAL
            </h1>
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-blue-200">Los mejores jugadores de Trust or Betray</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={() => setTab('score')}
            className={`px-6 py-2 rounded-lg font-bold transition ${
              tab === 'score'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-700 text-blue-200 hover:bg-slate-600'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Puntos
          </button>
          <button
            onClick={() => setTab('wins')}
            className={`px-6 py-2 rounded-lg font-bold transition ${
              tab === 'wins'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-700 text-blue-200 hover:bg-slate-600'
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            Victorias
          </button>
          <button
            onClick={() => setTab('karma')}
            className={`px-6 py-2 rounded-lg font-bold transition ${
              tab === 'karma'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-700 text-blue-200 hover:bg-slate-600'
            }`}
          >
            <Heart className="w-4 h-4 inline mr-2" />
            Cooperación
          </button>
        </div>

        {/* Leaderboard Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-blue-200">Cargando ranking...</p>
          </div>
        ) : (
          <div className="bg-slate-800 border border-blue-500 rounded-lg overflow-hidden shadow-2xl">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                <tr>
                  <th className="px-6 py-3 text-left font-bold">#</th>
                  <th className="px-6 py-3 text-left font-bold">Jugador</th>
                  <th className="px-6 py-3 text-center font-bold">Partidas</th>
                  {tab === 'score' && <th className="px-6 py-3 text-right font-bold">Puntos</th>}
                  {tab === 'wins' && <th className="px-6 py-3 text-right font-bold">Victorias</th>}
                  {tab === 'karma' && <th className="px-6 py-3 text-right font-bold">Cooperación</th>}
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((player, idx) => (
                  <tr
                    key={player.id}
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
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`}
                          alt={player.username}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-white font-semibold">{player.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center text-blue-200">{player.games_played}</td>
                    {tab === 'score' && (
                      <td className="px-6 py-3 text-right text-green-400 font-bold">{player.total_score}</td>
                    )}
                    {tab === 'wins' && (
                      <td className="px-6 py-3 text-right text-purple-400 font-bold">{player.games_won}</td>
                    )}
                    {tab === 'karma' && (
                      <td className="px-6 py-3 text-right text-pink-400 font-bold">{(player.cooperation_rate || 0).toFixed(1)}%</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
