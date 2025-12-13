# Prisionero - MVP (Dilema del Prisionero Multijugador)

## Características Implementadas

### Backend (Node.js + Express)
- ✅ Autenticación JWT (Login/Registro)
- ✅ Base de datos MongoDB
- ✅ WebSockets para multijugador en tiempo real
- ✅ Lógica del juego del Prisionero (Matriz de pagos)
- ✅ Sistema de rankings (Score, Karma, Victorias)
- ✅ Gestión de usuarios y estadísticas

### Frontend (React + Vite + Tailwind)
- ✅ Login/Registro
- ✅ Dashboard con estadísticas personales
- ✅ Lista de partidas disponibles
- ✅ Interfaz de juego en tiempo real
- ✅ Rankings globales
- ✅ Información educativa sobre el Dilema del Prisionero

## Instalación y Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Asegúrate de que MongoDB está corriendo en `localhost:27017`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Accede a `http://localhost:5173`

## Estructura del Proyecto

```
prisionero/
├── backend/
│   ├── src/
│   │   ├── routes/       (auth, game, user, leaderboard)
│   │   ├── models/       (User, Game)
│   │   ├── middleware/   (auth)
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
