require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const db = require("./db/database");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket'] // Forzar WebSockets
});

// Middleware
app.use(cors({ origin: '*' })); // Permitir CORS de cualquier origen
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend/dist'))); // Servir archivos estáticos del frontend

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Prisionero API Server is running' });
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/game", require("./routes/game"));
app.use("/api/user", require("./routes/user"));
app.use("/api/leaderboard", require("./routes/leaderboard"));
app.use("/api/challenges", require("./routes/challenges"));
app.use("/api/arena", require("./routes/arenaClash"));

// Socket.IO Events
require("./utils/socketHandler")(io);
const { setupArenaClashEvents } = require("./utils/arenaClashSocket");
setupArenaClashEvents(io);

// Manejar rutas de SPA: redirigir todo lo demás a index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Error interno del servidor" });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Escuchar en todas las interfaces de red

server.listen(PORT, HOST, () => {
  console.log(` Servidor escuchando en ${HOST}:${PORT}`);
  console.log(` Base de datos: SQLite en C:/prisionero/data/prisionero.db`);
  console.log(` Acceso de red habilitado para dispositivos externos`);
});

module.exports = { app, io, server };
