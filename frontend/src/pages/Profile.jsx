import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Trophy, Heart, Zap, Share2 } from 'lucide-react';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [xpStats, setXpStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const SOCKET_URL = window.location.hostname.includes('pages.dev')
    ? 'https://prisionero.onrender.com'
    : `http://${window.location.hostname}:5000`;

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }
    fetchProfile();
    fetchAchievements();
    fetchXPStats();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${SOCKET_URL}/api/user/profile/${username}`);
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await fetch(`${SOCKET_URL}/api/user/achievements/${username}`);
      const data = await response.json();
      if (data.success) {
        setAchievements(data.achievements);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchXPStats = async () => {
    try {
      const response = await fetch(`${SOCKET_URL}/api/challenges/stats/${username}`);
      const data = await response.json();
      if (data.success) {
        setXpStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching XP stats:', error);
    }
  };

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareProfile = () => {
    const text = `🎮 ¡Mira mi perfil en PRISIONERO! Mi código de referral: ${profile?.referral_code}`;
    if (navigator.share) {
      navigator.share({ text, title: `Perfil de ${username}` });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <p className="text-blue-200 text-lg">Cargando perfil...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-blue-200 text-lg mb-4">Perfil no encontrado</p>
          <button
            onClick={() => navigate('/leaderboard')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Volver al Ranking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/leaderboard')}
          className="mb-6 text-blue-400 hover:text-blue-300 transition"
        >
          ← Volver al Ranking
        </button>

        {/* Profile Card */}
        <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-8 shadow-2xl mb-6">
          {/* Avatar y nombre */}
          <div className="text-center mb-6">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
              alt={profile.username}
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-400"
            />
            <h1 className="text-4xl font-bold text-white mb-2">{profile.username}</h1>
            {xpStats && (
              <div className="space-y-2">
                <p className="text-purple-300 font-bold text-2xl">{xpStats.rank}</p>
                <p className="text-blue-300">Nivel <span className="text-yellow-400 font-bold">{xpStats.level}</span></p>
                <div className="w-full bg-slate-700 rounded-full h-4 mt-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full"
                    style={{ width: `${xpStats.progress_percent}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400">{xpStats.xp_in_level}/{xpStats.xp_needed + xpStats.xp_in_level} XP</p>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-700 rounded-lg p-4 text-center border border-blue-500">
              <p className="text-blue-300 text-sm">Partidas</p>
              <p className="text-2xl font-bold text-white">{profile.games_played}</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 text-center border border-green-500">
              <p className="text-green-300 text-sm">Victorias</p>
              <p className="text-2xl font-bold text-green-400">{profile.games_won}</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 text-center border border-purple-500">
              <p className="text-purple-300 text-sm">Puntos</p>
              <p className="text-2xl font-bold text-purple-400">{profile.total_score}</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 text-center border border-pink-500">
              <p className="text-pink-300 text-sm">Cooperación</p>
              <p className="text-2xl font-bold text-pink-400">{profile.cooperation_rate?.toFixed(1)}%</p>
            </div>
          </div>

          {/* Win Rate */}
          <div className="mb-6 p-4 bg-slate-700 rounded-lg border border-yellow-500">
            <p className="text-yellow-300 text-sm mb-2">Tasa de Victoria</p>
            <div className="w-full bg-slate-600 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-4 rounded-full"
                style={{ width: `${profile.winRate || 0}%` }}
              ></div>
            </div>
            <p className="text-yellow-400 font-bold mt-2">{profile.winRate || 0}%</p>
          </div>

          {/* Racha Actual */}
          {profile.win_streak > 0 && (
            <div className="mb-6 p-4 bg-slate-700 rounded-lg border-2 border-red-500">
              <p className="text-red-300 text-sm">🔥 Racha de Victorias Actual</p>
              <p className="text-3xl font-bold text-red-400">{profile.win_streak}</p>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-8 shadow-2xl mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Logros ({achievements.length}/5)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.length > 0 ? (
              achievements.map((ach) => (
                <div
                  key={ach.type}
                  className="bg-slate-700 rounded-lg p-4 border-2 border-yellow-500"
                >
                  <p className="text-2xl mb-2">{ach.icon}</p>
                  <p className="text-white font-bold">{ach.name}</p>
                  <p className="text-yellow-300 text-sm">{ach.description}</p>
                </div>
              ))
            ) : (
              <p className="text-blue-300 col-span-2">
                Sin logros desbloqueados aún. ¡Sigue jugando!
              </p>
            )}
          </div>
        </div>

        {/* Referral Code */}
        <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <Zap className="w-6 h-6 text-blue-400" />
            Tu Código de Referral
          </h2>
          <p className="text-blue-300 text-sm mb-4">
            Invita amigos y gana puntos bonus
          </p>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={profile.referral_code || ''}
              readOnly
              className="flex-1 bg-slate-700 border border-blue-500 text-white px-4 py-2 rounded-lg font-mono font-bold"
            />
            <button
              onClick={copyReferralCode}
              className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          <button
            onClick={shareProfile}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Compartir Código
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
