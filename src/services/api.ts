import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a cada petición
apiClient.interceptors.request.use(
  (config) => {
    // Obtenemos el store DENTRO del interceptor para asegurar que esté inicializado
    const authStore = useAuthStore();
    const token = authStore.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default apiClient;