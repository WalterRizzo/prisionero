import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const isLocalhost = window.location.hostname.includes('localhost');
      const BASE_URL = isLocalhost ? 'http://localhost:5000' : '';
      const response = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const user = await response.json();
        set({ user, token });
      } else {
        localStorage.removeItem('token');
        set({ token: null, user: null });
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
    }
  }
}));
