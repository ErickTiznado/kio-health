import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

// Create a configured axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken'); // Or use store state if preferred, but localStorage is safe for init
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Trigger logout action from store
      // Note: Using store outside component might need direct state access or just clearing storage
      // Ideally, the store's logout action handles cleanup.
      
      const { logout } = useAuthStore.getState();
      logout();
      
      // Optionally redirect to login, but the App router should handle this reactively based on auth state
      // window.location.href = '/login'; // Hard redirect if router doesn't catch it immediately
    }
    return Promise.reject(error);
  }
);
