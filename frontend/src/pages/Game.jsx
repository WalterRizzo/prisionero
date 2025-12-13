import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, ShieldOff, Handshake, Swords } from 'lucide-react';

// --- Web Audio Sound Manager ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
};

const playTick = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch(e) {}
};

const playUrgent = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 440;
    osc.type = 'square';
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch(e) {}
};

const playWin = () => {
  try {
    const ctx = getAudioContext();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.2);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.2);
    });
  } catch(e) {}
};

const playLose = () => {
  try {
    const ctx = getAudioContext();
    [400, 300, 200].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.2);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.2);
    });
  } catch(e) {}
};

const playClick = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1000;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  } catch(e) {}
};

const playReveal = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch(e) {}
};

// Mock data for player details
const mockPlayers = {
  '1': { p1: { name: 'USER_777', score: 0 }, p2: { name: 'GHOST', score: 0 } },
  '2': { p1: { name: 'USER_777', score: 0 }, p2: { name: 'RAZE', score: 0 } },
  '3': { p1: { name: 'USER_777', score: 0 }, p2: { name: 'ECHO', score: 0 } },
  // ... add other games if needed
};

const TrustIcon = () => <Handshake className="w-8 h-8 text-cyan-400" />;
const BetrayIcon = () => <Swords className="w-8 h-8 text-pink-500" />;

const ResultDiagram = ({ p1Move, p2Move, resultText }) => {
    const ChoiceButton = ({ move }) => {
        const isTrust = move === 'trust';
        const text = isTrust ? 'CONFIÁ' : 'TRAICIONÁ';
        const style = isTrust 
            ? 'bg-[#00E0FF]/20 text-[#00E0FF] border-[#00E0FF]/50' 
            : 'bg-red-500/20 text-red-400 border-red-500/50';
        return (
            <div className={`px-6 py-1 text-center text-sm font-bold border rounded-lg ${style}`}>
                {text}
            </div>
        );
    };

    return (
        <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-6 rounded-xl border border-purple-500/30 backdrop-blur-sm">
            <h2 className="text-2xl font-black text-purple-400">{resultText}</h2>
            <div className="w-full flex justify-around items-center gap-4">
                <div className="flex flex-col items-center gap-2">
                    <img src="https://i.pravatar.cc/60?u=user777" alt="Tú" className="w-14 h-14 rounded-full border-2 border-slate-600" />
                    <p className="text-xs font-bold text-gray-400">TÚ</p>
                    <ChoiceButton move={p1Move} />
                </div>

                <div className="text-purple-400 font-black text-xl">VS</div>

                <div className="flex flex-col items-center gap-2">
                    <img src="https://i.pravatar.cc/60?u=opponent123" alt="Oponente" className="w-14 h-14 rounded-full border-2 border-slate-600" />
                    <p className="text-xs font-bold text-gray-400">OPONENTE</p>
                    <ChoiceButton move={p2Move} />
                </div>
            </div>
        </div>
    );
};


const Game = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [round, setRound] = useState(1);
  const [timer, setTimer] = useState(3);
  const [players, setPlayers] = useState(mockPlayers[id] || mockPlayers['1']);
  const [history, setHistory] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState({ p1: '', p2: '', text: '', p1ScoreChange: 0 });
  const [playerHasChosen, setPlayerHasChosen] = useState(false);
  const [scoreChanged, setScoreChanged] = useState({ p1: null, p2: null }); // 'win', 'lose', 'draw'
  
  // Game mechanics - Nuevas reglas
  const [p1Reputation, setP1Reputation] = useState(50);
  const [p2Reputation, setP2Reputation] = useState(50);
  const [p1BetrayalStreak, setP1BetrayalStreak] = useState(0);
  const [p2BetrayalStreak, setP2BetrayalStreak] = useState(0);
  const [p1CooperationStreak, setP1CooperationStreak] = useState(0);
  const [p2CooperationStreak, setP2CooperationStreak] = useState(0);

  const processRound = useCallback((playerMove) => {
    if (playerHasChosen) return;

    playClick();
    setPlayerHasChosen(true);
    
    const isTimeout = playerMove === null;
    const p1Move = isTimeout ? 'betray' : playerMove;
    const p2Move = Math.random() > 0.4 ? 'trust' : 'betray';

    let baseP1ScoreChange = 0;
    let baseP2ScoreChange = 0;
    let resultText = '';
    let p1Multiplier = 1;
    let p2Multiplier = 1;

    // Si es TIMEOUT: -1 punto fijo, no importa qué pase
    if (isTimeout) {
      baseP1ScoreChange = -1;
      resultText = '⏱️ TIMEOUT! -1 PUNTO';
      playLose();
      setScoreChanged({ p1: 'lose', p2: null });
      
      // Resetear rachas por no jugar
      setP1CooperationStreak(0);
      setP1BetrayalStreak(p1BetrayalStreak + 1);
      
      // Reputación baja por no decidir
      setP1Reputation(Math.max(0, p1Reputation - 5));
      
    } else {
      // Lógica normal del juego (sin timeout)
      if (p1Move === 'trust' && p2Move === 'trust') {
        baseP1ScoreChange = 2;
        baseP2ScoreChange = 2;
        resultText = '🤝 AMBOS CONFIARON';
        playWin();
        setScoreChanged({ p1: 'win', p2: 'win' });
        
        // Bonus por cooperación
        setP1CooperationStreak(prev => prev + 1);
        setP2CooperationStreak(prev => prev + 1);
        setP1BetrayalStreak(0);
        setP2BetrayalStreak(0);
        p1Multiplier = 1 + (p1CooperationStreak * 0.1);
        p2Multiplier = 1 + (p2CooperationStreak * 0.1);
        
        // Reputación sube
        setP1Reputation(Math.min(100, p1Reputation + 5));
        setP2Reputation(Math.min(100, p2Reputation + 5));
        
      } else if (p1Move === 'trust' && p2Move === 'betray') {
        baseP1ScoreChange = -1;
        baseP2ScoreChange = 3;
        resultText = `🗡️ ${players.p2.name} TE TRAICIONÓ`;
        playLose();
        setScoreChanged({ p1: 'lose', p2: 'win' });
        
        // Rachas
        setP2BetrayalStreak(prev => prev + 1);
        setP2CooperationStreak(0);
        setP1CooperationStreak(0);
        if (p2BetrayalStreak >= 2) baseP2ScoreChange -= 1;
        
        // Reputación
        setP1Reputation(Math.min(100, p1Reputation + 5));
        setP2Reputation(Math.max(0, p2Reputation - 10));
        
      } else if (p1Move === 'betray' && p2Move === 'trust') {
        baseP1ScoreChange = 3;
        baseP2ScoreChange = -1;
        resultText = `⚔️ LO TRAICIONASTE`;
        playWin();
        setScoreChanged({ p1: 'win', p2: 'lose' });
        
        // Penalidad por traición propia
        setP1BetrayalStreak(prev => prev + 1);
        setP1CooperationStreak(0);
        setP2CooperationStreak(0);
        if (p1BetrayalStreak >= 2) baseP1ScoreChange -= 1;
        
        // Reputación
        setP1Reputation(Math.max(0, p1Reputation - 10));
        setP2Reputation(Math.min(100, p2Reputation + 5));
        
      } else {
        // Ambos traicionan
        baseP1ScoreChange = 0;
        baseP2ScoreChange = 0;
        resultText = '💀 TRAICIÓN MUTUA';
        playUrgent();
        setScoreChanged({ p1: 'draw', p2: 'draw' });
        
        setP1BetrayalStreak(prev => prev + 1);
        setP2BetrayalStreak(prev => prev + 1);
        setP1CooperationStreak(0);
        setP2CooperationStreak(0);
        if (p1BetrayalStreak >= 2) baseP1ScoreChange -= 1;
        if (p2BetrayalStreak >= 2) baseP2ScoreChange -= 1;
        
        // Reputación baja para ambos
        setP1Reputation(Math.max(0, p1Reputation - 10));
        setP2Reputation(Math.max(0, p2Reputation - 10));
      }
    }

    // Aplicar multiplicadores SOLO a puntos positivos
    let finalP1ScoreChange = baseP1ScoreChange;
    let finalP2ScoreChange = baseP2ScoreChange;
    
    if (baseP1ScoreChange > 0) {
      finalP1ScoreChange = Math.round(baseP1ScoreChange * p1Multiplier);
    }
    if (baseP2ScoreChange > 0) {
      finalP2ScoreChange = Math.round(baseP2ScoreChange * p2Multiplier);
    }
    
    setShowResult(true);
    playReveal();

    setTimeout(() => {
        setPlayers(prev => ({
          p1: { ...prev.p1, score: prev.p1.score + finalP1ScoreChange },
          p2: { ...prev.p2, score: prev.p2.score + finalP2ScoreChange },
        }));
        setHistory(prev => [...prev, { p1: p1Move, p2: p2Move }]);
        setLastResult({ p1: p1Move, p2: p2Move, text: resultText, p1ScoreChange: finalP1ScoreChange });
    }, 500);


    setTimeout(() => {
      if (round < 10) {
        setRound(r => r + 1);
        setTimer(3);
        setShowResult(false);
        setPlayerHasChosen(false);
        setScoreChanged({ p1: null, p2: null });
      } else {
        setTimeout(() => navigate('/profile'), 3000);
      }
    }, 4000);
  }, [round, players, navigate, playerHasChosen, p1CooperationStreak, p2CooperationStreak, p1BetrayalStreak, p2BetrayalStreak, p1Reputation, p2Reputation]);

  // Temporizador del juego
  useEffect(() => {
    if (playerHasChosen || showResult) {
        return;
    };

    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer(t => {
            playTick(); // SONIDO EN CADA SEGUNDO
            if (t <= 2) playUrgent(); // SONIDO URGENTE cuando queda poco
            return t - 1;
        });
      }, 1000);
      return () => clearInterval(countdown);
    } else if (!playerHasChosen) {
      processRound(null); // Timeout - Default to betray
    }
  }, [timer, playerHasChosen, showResult, processRound]);

  const getScoreClass = (status) => {
    if (status === 'win') return 'text-green-400 scale-125';
    if (status === 'lose') return 'text-red-400 scale-125';
    return '';
  };

  const PlayerHUD = ({ name, score, alignment = 'left', avatar, scoreStatus, reputation }) => (
    <div className={`flex items-center gap-4 ${alignment === 'right' ? 'flex-row-reverse' : ''}`}>
        <div>
          <img src={avatar} alt={name} className="w-16 h-16 rounded-full border-4 border-slate-700 bg-slate-800" />
          {/* Reputation bar */}
          <div className="w-16 h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
            <div className={`h-full transition-all ${reputation > 60 ? 'bg-green-500' : reputation > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${reputation}%`}}></div>
          </div>
        </div>
        <div className={`flex flex-col ${alignment === 'left' ? 'items-start' : 'items-end'}`}>
            <p className="text-3xl font-black uppercase tracking-widest">{name}</p>
            <p className={`text-5xl font-bold text-purple-400 transition-all duration-300 ${getScoreClass(scoreStatus)}`}>{score}</p>
            <p className={`text-xs font-bold ${reputation > 60 ? 'text-green-400' : reputation > 40 ? 'text-yellow-400' : 'text-red-400'}`}>REP: {reputation}</p>
        </div>
    </div>
  );

  const HistoryIcon = ({ move }) => (
    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${move === 'trust' ? 'bg-cyan-500/20' : 'bg-pink-500/20'}`}>
      {move === 'trust' ? <Handshake size={16} className="text-cyan-300" /> : <Swords size={16} className="text-pink-400" />}
    </div>
  );

  return (
    <div className="min-h-screen w-full text-white flex flex-col p-4 md:p-6 font-sans justify-center items-center relative" style={{ backgroundImage: 'url("/images/imagenes-generadas-ia-cielo_843290-173.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60 pointer-events-none"></div>
      <div className="w-full max-w-4xl relative z-10">
        {/* Top HUD: Players Info & Round */}
        <header className="flex justify-between items-center w-full mb-10">
            <PlayerHUD name={players.p1.name} score={players.p1.score} avatar="https://i.pravatar.cc/80?u=user777" scoreStatus={scoreChanged.p1} reputation={p1Reputation} />
            <div className="text-center">
                <p className="text-xl font-bold text-gray-400">RONDA</p>
                <p className="text-5xl font-black">{round}<span className="text-3xl text-gray-500">/10</span></p>
            </div>
            <PlayerHUD name={players.p2.name} score={players.p2.score} alignment="right" avatar={`https://i.pravatar.cc/80?u=${players.p2.name}`} scoreStatus={scoreChanged.p2} reputation={p2Reputation} />
        </header>

        {/* Main Display: Timer or Result */}
        <main className="flex-1 flex items-center justify-center w-full min-h-[300px]">
          {showResult ? (
            <ResultDiagram p1Move={lastResult.p1} p2Move={lastResult.p2} resultText={lastResult.text} />
          ) : (
            <div className="text-center">
              <p className={`text-9xl font-black tabular-nums transition-colors duration-300 ${timer <= 3 ? 'text-red-500 animate-pulse' : ''}`}>{timer}</p>
            </div>
          )}
        </main>

        {/* Bottom HUD: History & Actions */}
        <footer className="w-full max-w-2xl mx-auto mt-10">
          {/* History Bar */}
          <div className="flex justify-center items-center gap-4 mb-6 h-16">
            <p className="font-bold text-gray-500">HISTORIAL:</p>
            <div className="flex gap-2">
              {history.map((h, i) => (
                <div key={i} className="flex flex-col gap-1 p-1 bg-slate-800/50 rounded">
                  <HistoryIcon move={h.p1} />
                  <HistoryIcon move={h.p2} />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => processRound('trust')}
              disabled={playerHasChosen}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black text-3xl py-8 rounded-lg shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
              <Shield size={40} /> CONFIAR
            </button>
            <button 
              onClick={() => processRound('betray')}
              disabled={playerHasChosen}
              className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-black text-3xl py-8 rounded-lg shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
              <ShieldOff size={40} /> TRAICIONAR
            </button>
          </div>
          
          {/* Exit Button */}
          <button 
            onClick={() => {
              if (window.confirm('⚠️ ABANDONAR PARTIDA?\n\nPenalidad: -10 puntos y -20 reputación\n\n¿Estás seguro?')) {
                playLose();
                // Aplicar penalidad por abandono
                alert('❌ ABANDONASTE\n-10 puntos\n-20 reputación');
                navigate('/lobby');
              }
            }}
            className="w-full mt-4 py-3 text-sm font-bold bg-slate-800/50 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 hover:border-red-500 transition-all"
          >
            🚪 ABANDONAR PARTIDA (-10 pts)
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Game;
