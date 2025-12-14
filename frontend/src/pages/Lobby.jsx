import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Users, User, Wifi, WifiOff, Gamepad2 } from 'lucide-react';
import { io } from 'socket.io-client';

// Detectar si estamos en producción (Cloudflare Pages) o local
const isProduction = window.location.hostname.includes('pages.dev');
const SOCKET_URL = isProduction 
  ? 'https://prisionero.onrender.com'
  : `http://${window.location.hostname}:5000`;

const Lobby = () => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [myName, setMyName] = useState(localStorage.getItem('player1Name') || '');
  const [myId, setMyId] = useState(null);
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const [showNameInput, setShowNameInput] = useState(true);
  const [pendingInvite, setPendingInvite] = useState(null);
  const [waitingResponse, setWaitingResponse] = useState(null);

  // Conectar socket
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('✅ Conectado al servidor');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Desconectado del servidor');
      setConnected(false);
    });

    newSocket.on('lobby-joined', (data) => {
      console.log('🎮 Entré al lobby:', data);
      setMyId(data.playerId);
      setMyName(data.playerName);
      localStorage.setItem('player1Name', data.playerName);
      setShowNameInput(false);
    });

    newSocket.on('players-online', (data) => {
      console.log('👥 Jugadores online:', data.players);
      setOnlinePlayers(data.players);
    });

    newSocket.on('game-invite', (data) => {
      console.log('📨 Invitación recibida:', data);
      setPendingInvite(data);
    });

    newSocket.on('invite-sent', (data) => {
      console.log('📤 Invitación enviada a:', data.toName);
      setWaitingResponse(data.toName);
    });

    newSocket.on('invite-rejected', (data) => {
      alert(`😢 ${data.byName} rechazó tu invitación`);
      setWaitingResponse(null);
    });

    newSocket.on('invite-cancelled', (data) => {
      alert(`❌ Invitación cancelada: ${data.reason}`);
      setPendingInvite(null);
    });

    newSocket.on('game-start', (data) => {
      console.log('🎮 ¡Partida iniciada!', data);
      // Guardar datos del juego incluyendo el socket ID actual
      localStorage.setItem('onlineGameId', data.gameId);
      localStorage.setItem('onlinePlayers', JSON.stringify(data.players));
      localStorage.setItem('gameMode', 'online');
      localStorage.setItem('mySocketId', newSocket.id); // Guardar mi socket ID
      
      // Unir este socket al room del juego ANTES de navegar
      newSocket.emit('join-game', {
        gameId: data.gameId,
        playerName: myName
      });
      
      // Pequeño delay para asegurar que el join-game se procese
      setTimeout(() => {
        navigate(`/game/${data.gameId}`);
      }, 100);
    });

    setSocket(newSocket);

    return () => {
      // NO desconectar si estamos en una partida activa
      const activeGame = localStorage.getItem('onlineGameId');
      if (!activeGame) {
        newSocket.disconnect();
      }
    };
  }, [navigate]);

  // Entrar al lobby con nombre
  const joinLobby = () => {
    if (!myName.trim()) {
      alert('¡Ingresa tu nombre!');
      return;
    }
    socket?.emit('join-lobby', { playerName: myName.trim() });
  };

  // Invitar a un jugador
  const invitePlayer = (playerId) => {
    socket?.emit('invite-player', { targetSocketId: playerId });
  };

  // Aceptar invitación
  const acceptInvite = () => {
    socket?.emit('accept-invite', { gameId: pendingInvite.gameId });
    setPendingInvite(null);
  };

  // Rechazar invitación
  const rejectInvite = () => {
    socket?.emit('reject-invite', { gameId: pendingInvite.gameId });
    setPendingInvite(null);
  };

  // Jugar vs IA (modo offline)
  const playVsAI = () => {
    localStorage.setItem('gameMode', 'ai');
    localStorage.setItem('player2Name', 'IA');
    const gameId = `ai-${Date.now()}`;
    navigate(`/game/${gameId}`);
  };

  // Otros jugadores (excluyéndome)
  const otherPlayers = onlinePlayers.filter(p => p.id !== myId);

  return (
    <div className="min-h-screen w-full text-white relative overflow-hidden" style={{ 
      backgroundImage: 'url("/images/evolucion-inteligencia-artificial-robots-ia-generativa_847288-10353.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="absolute inset-0 bg-black/60"></div>
      
      {/* Modal de invitación recibida */}
      {pendingInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-purple-900 to-slate-900 p-8 rounded-2xl border-2 border-purple-500 max-w-md w-full mx-4 animate-pulse">
            <h2 className="text-3xl font-black text-center text-purple-400 mb-4">
              ⚔️ ¡DESAFÍO!
            </h2>
            <p className="text-xl text-center text-white mb-6">
              <span className="text-cyan-400 font-black">{pendingInvite.fromName}</span> 
              <br />quiere jugar contigo
            </p>
            <div className="flex gap-4">
              <button
                onClick={rejectInvite}
                className="flex-1 py-4 bg-red-600 text-white font-bold text-xl rounded-xl hover:bg-red-700 transition-colors"
              >
                ❌ RECHAZAR
              </button>
              <button
                onClick={acceptInvite}
                className="flex-1 py-4 bg-green-600 text-white font-bold text-xl rounded-xl hover:bg-green-700 transition-colors"
              >
                ✅ ACEPTAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal esperando respuesta */}
      {waitingResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl border-2 border-cyan-500/50 max-w-md w-full mx-4">
            <h2 className="text-2xl font-black text-center text-cyan-400 mb-4">
              ⏳ ESPERANDO...
            </h2>
            <p className="text-xl text-center text-white mb-6">
              Esperando que <span className="text-pink-400 font-black">{waitingResponse}</span> acepte
            </p>
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      )}
      
      <div className="relative z-10 min-h-screen flex flex-col p-6">
        {/* Header con estado de conexión */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {connected ? (
              <>
                <Wifi className="w-6 h-6 text-green-500 animate-pulse" />
                <span className="text-green-400 font-bold">CONECTADO</span>
              </>
            ) : (
              <>
                <WifiOff className="w-6 h-6 text-red-500" />
                <span className="text-red-400 font-bold">DESCONECTADO</span>
              </>
            )}
          </div>
          {myName && !showNameInput && (
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xl font-black text-cyan-400">{myName}</span>
            </div>
          )}
        </header>

        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 mb-2">
            TRUST OR BETRAY
          </h1>
          <p className="text-gray-400 text-lg">Multijugador Online</p>
        </div>

        {/* Input de nombre si no está logueado */}
        {showNameInput ? (
          <div className="max-w-md mx-auto w-full mb-10">
            <div className="bg-slate-900/80 p-6 rounded-2xl border border-cyan-500/30">
              <label className="block text-sm font-bold text-gray-400 mb-2">
                <User className="inline w-4 h-4 mr-1" /> TU NOMBRE
              </label>
              <input
                type="text"
                value={myName}
                onChange={(e) => setMyName(e.target.value.toUpperCase())}
                placeholder="Ingresa tu nombre..."
                maxLength={12}
                className="w-full px-4 py-3 bg-slate-800 border-2 border-cyan-500/30 rounded-lg text-white text-xl font-bold focus:border-cyan-500 focus:outline-none uppercase mb-4"
                onKeyPress={(e) => e.key === 'Enter' && joinLobby()}
                autoFocus
              />
              <button
                onClick={joinLobby}
                disabled={!connected}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xl rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {connected ? '🚀 ENTRAR AL LOBBY' : '⏳ CONECTANDO...'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Botón VS IA */}
            <div className="max-w-md mx-auto w-full mb-8">
              <button
                onClick={playVsAI}
                className="w-full py-5 text-xl font-black bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:scale-105 transition-transform shadow-2xl shadow-green-500/30 flex items-center justify-center gap-3"
              >
                <Cpu size={28} /> JUGAR VS IA
              </button>
            </div>

            {/* Lista de jugadores online */}
            <div className="max-w-2xl mx-auto w-full">
              <h2 className="text-2xl font-black mb-4 text-cyan-300 flex items-center gap-2">
                <Users className="w-6 h-6" />
                JUGADORES ONLINE ({otherPlayers.length})
              </h2>

              {otherPlayers.length === 0 ? (
                <div className="text-center py-10 bg-slate-900/50 rounded-xl border border-slate-700">
                  <p className="text-gray-400 text-lg mb-2">😴 No hay otros jugadores online</p>
                  <p className="text-gray-500 text-sm">
                    Comparte este link con alguien para jugar:
                  </p>
                  <p className="text-cyan-400 font-mono text-sm mt-2 bg-slate-800 p-2 rounded">
                    {window.location.origin}/lobby
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {otherPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-4 bg-slate-900/80 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <img 
                          src={`https://i.pravatar.cc/60?u=${player.name}`} 
                          alt={player.name}
                          className="w-12 h-12 rounded-full border-2 border-cyan-500/50"
                        />
                        <div>
                          <p className="text-xl font-black text-white">{player.name}</p>
                          <p className={`text-sm font-bold ${
                            player.status === 'online' ? 'text-green-400' :
                            player.status === 'playing' ? 'text-yellow-400' :
                            'text-gray-400'
                          }`}>
                            {player.status === 'online' ? '🟢 Disponible' :
                             player.status === 'playing' ? '🎮 Jugando' :
                             '⏳ Ocupado'}
                          </p>
                        </div>
                      </div>
                      
                      {player.status === 'online' && (
                        <button
                          onClick={() => invitePlayer(player.id)}
                          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-transform flex items-center gap-2"
                        >
                          <Gamepad2 size={20} /> DESAFIAR
                        </button>
                      )}
                      
                      {player.status === 'playing' && (
                        <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 font-bold rounded-lg text-sm">
                          EN PARTIDA
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        
        {/* Footer con instrucciones */}
        <div className="mt-auto pt-8 text-center">
          <p className="text-gray-500 text-sm">
            💡 Comparte <span className="text-cyan-400">{window.location.origin}/lobby</span> para que otros se conecten
          </p>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
