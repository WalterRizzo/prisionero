# Trust or Betray - Prisoner's Dilemma Game

Un juego online de estrategia basado en el dilema del prisionero con sistema anti-traidor avanzado.

## Características Implementadas

### Backend (Express + Socket.IO)
- ✅ Multijugador online en tiempo real
- ✅ Base de datos SQLite
- ✅ WebSockets para comunicación instantánea
- ✅ Sistema de puntuación avanzado
- ✅ Anti-traidor severo (penalizaciones múltiples)
- ✅ Sistema de honor y reputación

### Frontend (React + Vite + Tailwind)
- ✅ Interfaz de juego elegante
- ✅ Modo Local vs IA (MasterAI v2.0)
- ✅ Modo Multijugador Online
- ✅ Avatares dinámicos (DiceBear API)
- ✅ Combo System y Ronda Dorada
- ✅ Sonidos con Web Audio API
- ✅ Responsive Mobile-First

## Deploy en Cloudflare

### Requisitos
- Cuenta en [Cloudflare](https://dash.cloudflare.com)
- GitHub con este repositorio
- Node.js 18+

### Pasos Rápidos

1. **Crear repositorio en GitHub** (privado o público)
2. **Push del código**
```bash
git remote add origin https://github.com/TU_USUARIO/prisionero.git
git branch -M main
git push -u origin main
```

3. **En Cloudflare Dashboard:**
   - Ir a Workers & Pages
   - Conectar GitHub
   - Seleccionar repo `prisionero`
   - Build command: `npm install && npm run build --workspace=frontend`
   - Build output: `frontend/dist`

## URLs de Deploy
- **Frontend**: `https://prisionero.pages.dev`
- **Backend**: Via Socket.IO en Workers (auto-configurado)

## Instalación Local

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
│   │   ├── utils/        (socketHandler)
│   │   └── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/        (Login, Register, Dashboard, Game, Leaderboard)
│   │   ├── stores/       (authStore)
│   │   ├── services/     (api)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
```

## Próximos Pasos (Fase 2)

- [ ] Modo educativo con teorías explicadas
- [ ] Sistema de monetización (ads, premium)
- [ ] Skins y avatares temáticos
- [ ] Pases para torneos
- [ ] Sistema de chat durante partidas
- [ ] Historial detallado de partidas
- [ ] Mobile app (React Native)
- [ ] Mejorar gráficos y animaciones

## Tecnologías Usadas

- **Backend**: Node.js, Express, Socket.IO, MongoDB, JWT, Bcrypt
- **Frontend**: React, Vite, Tailwind CSS, Axios, Zustand, Socket.IO Client
- **Base de datos**: MongoDB
- **Autenticación**: JWT
- **Comunicación**: WebSockets (Socket.IO)

## Notas

- El MVP está diseñado para validar la mecánica del juego
- Soporta 1v1 en tiempo real
- Automatización completa de puntuación y rankings
- Ready para escalar a múltiples salas y torneos
