import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL
});

// Agregar token a cada request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (username, email, password) =>
    apiClient.post('/auth/register', { username, email, password }),
  
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  
  getMe: () =>
    apiClient.get('/auth/me')
};

export const gameService = {
  getActiveGames: () =>
    apiClient.get('/game/active'),
  
  createGame: () =>
    apiClient.post('/game/create'),
  
  joinGame: (gameId) =>
    apiClient.post(`/game/join/${gameId}`),
  
  getGame: (gameId) =>
    apiClient.get(`/game/${gameId}`)
};

export const userService = {
  getProfile: (userId) =>
    apiClient.get(`/user/profile/${userId}`),
  
  updateAvatar: (avatar) =>
    apiClient.put('/user/avatar', { avatar })
};

export const leaderboardService = {
  getTopScore: () =>
    apiClient.get('/leaderboard/top-score'),
  
  getTopKarma: () =>
    apiClient.get('/leaderboard/top-karma'),
  
  getTopWins: () =>
    apiClient.get('/leaderboard/top-wins')
};
