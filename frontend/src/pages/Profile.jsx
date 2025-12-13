import React from 'react';
import { BarChart, Users, Shield, ShieldOff, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data - en una app real, esto vendría del estado global o una API
const userStats = {
  name: 'USER_777',
  level: 12,
  reputation: 'A+',
  style: 'Calculador Oportunista',
  matches: 158,
  wins: 92,
  coopPercent: 65, // Cooperó el 65% de las veces
  betrayPercent: 35, // Traicionó el 35% de las veces
  history: [
    { type: 'win', opponent: 'GHOST', result: '+25 Rep' },
    { type: 'loss', opponent: 'CYPHER', result: '-10 Rep' },
    { type: 'win', opponent: 'RAZE', result: '+20 Rep' },
    { type: 'win', opponent: 'ZERO', result: '+30 Rep' },
    { type: 'loss', opponent: 'ECHO', result: '-5 Rep' },
  ]
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-slate-900/80 p-4 rounded-lg flex items-center gap-4 border border-slate-800">
    <div className={`p-2 rounded-md ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const Profile = () => {
  const winRate = Math.round((userStats.wins / userStats.matches) * 100);

  return (
    <div className="min-h-screen w-full text-white p-4 md:p-8 relative" style={{ backgroundImage: 'url("/images/planetas-universo-ia-generativa_28914-6375.avif")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header del Perfil */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-black text-4xl">
              U
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase">{userStats.name}</h1>
              <p className="text-purple-400 font-bold text-lg">{userStats.style}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Reputación</p>
            <p className="text-5xl font-black text-green-400">{userStats.reputation}</p>
          </div>
        </header>

        {/* Grid de Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Users size={24} />} label="Partidas" value={userStats.matches} color="bg-blue-500/20 text-blue-300" />
          <StatCard icon={<BarChart size={24} />} label="Victorias" value={`${winRate}%`} color="bg-green-500/20 text-green-300" />
          <StatCard icon={<Shield size={24} />} label="Cooperación" value={`${userStats.coopPercent}%`} color="bg-cyan-500/20 text-cyan-300" />
          <StatCard icon={<ShieldOff size={24} />} label="Traición" value={`${userStats.betrayPercent}%`} color="bg-pink-500/20 text-pink-300" />
        </div>

        {/* Historial de Partidas */}
        <div>
          <h2 className="text-2xl font-black mb-4 text-purple-300">Historial Reciente</h2>
          <div className="space-y-2">
            {userStats.history.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-slate-900/70 border border-slate-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${item.type === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                    {item.type === 'win' ? 'VICTORIA' : 'DERROTA'}
                  </span>
                  <span className="text-gray-500">vs</span>
                  <span className="font-semibold">{item.opponent}</span>
                </div>
                <div className={`font-semibold ${item.result.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {item.result}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
            <Link to="/stats" className="text-purple-400 hover:text-purple-300 font-semibold">
                Ver estadísticas globales &rarr;
            </Link>
        </div>
         <div className="mt-4 text-center">
            <Link to="/" className="text-gray-400 hover:text-white font-semibold">
                &larr; Volver al Inicio
            </Link>
        </div>

      </div>
    </div>
  );
};

export default Profile;
