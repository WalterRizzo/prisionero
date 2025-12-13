import React from 'react';
import { Globe, Zap, TrendingUp, Users, Shield, ShieldOff } from 'lucide-react';

// Mock data para las estadísticas globales
const globalStats = {
  activeGames: 64,
  totalPlayers: 128,
  totalRounds: 10520,
  avgRounds: 7.8,
  trustRate: 58, // 58% de las decisiones son 'confiar'
  betrayalRate: 42, // 42% de las decisiones son 'traicionar'
  mostPopularStyle: 'Jugador Equilibrado',
};

const StatBox = ({ icon, value, label, colorClass }) => (
  <div className={`p-6 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center text-center`}>
    <div className={`mb-3 text-4xl ${colorClass}`}>
      {icon}
    </div>
    <p className="text-4xl md:text-5xl font-black">{value}</p>
    <p className="text-sm md:text-base text-gray-400 uppercase tracking-wider">{label}</p>
  </div>
);

const Stats = () => {
  return (
    <div className="min-h-screen w-full text-white p-4 md:p-8 relative" style={{ backgroundImage: 'url("/images/ai-generated-ai-generative-ilustracion-tomada-galaxia-espacial-planeta-tierra-luces-nocturnas_95211-5540.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-5xl md:text-7xl font-black uppercase">
            Estadísticas Globales
          </h1>
          <p className="text-lg md:text-xl text-purple-400 mt-2">
            El pulso del dilema en tiempo real.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Fila 1 */}
          <StatBox
            icon={<Zap />}
            value={globalStats.activeGames}
            label="Partidas Activas"
            colorClass="text-green-400"
          />
          <StatBox
            icon={<Users />}
            value={globalStats.totalPlayers}
            label="Jugadores Hoy"
            colorClass="text-blue-400"
          />
          <StatBox
            icon={<Globe />}
            value={globalStats.totalRounds.toLocaleString()}
            label="Rondas Jugadas"
            colorClass="text-yellow-400"
          />

          {/* Fila 2 */}
          <div className="md:col-span-2 lg:col-span-1">
             <StatBox
                icon={<TrendingUp />}
                value={globalStats.avgRounds.toFixed(1)}
                label="Duración Media (Rondas)"
                colorClass="text-indigo-400"
            />
          </div>

          <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-center col-span-1 md:col-span-2 lg:col-span-2">
            <p className="text-center text-sm text-gray-400 uppercase tracking-wider mb-3">Tasa de Decisión Global</p>
            <div className="flex items-center justify-center w-full gap-4">
                <div className="text-center">
                    <p className="text-4xl font-black text-cyan-400">{globalStats.trustRate}%</p>
                    <div className="flex items-center gap-2 justify-center text-cyan-400">
                        <Shield size={18}/>
                        <span>Confiar</span>
                    </div>
                </div>
                <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-pink-500" style={{ width: `${globalStats.trustRate}%` }}></div>
                </div>
                 <div className="text-center">
                    <p className="text-4xl font-black text-pink-400">{globalStats.betrayalRate}%</p>
                    <div className="flex items-center gap-2 justify-center text-pink-400">
                        <ShieldOff size={18}/>
                        <span>Traicionar</span>
                    </div>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Stats;
