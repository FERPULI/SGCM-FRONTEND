/**
 * src/services/http.ts
 * (CORREGIDO: Incluye 'handleApiError' para que no falle useAuth)
 */
import axios, { AxiosInstance, AxiosError } from 'axios';
import { storage } from '../utils/storage';

// Interfaz básica de respuesta
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// Crear instancia de Axios
const httpClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
  withCredentials: false, // Cambiar a false si tienes problemas de CORS
});

/**
 * Interceptor de Petición (Añade el token)
 */
httpClient.interceptors.request.use(
  (config) => {
    // Debug: ver la URL completa que se está llamando
    console.log('🔵 HTTP Request:', config.method?.toUpperCase(), config.baseURL + config.url);
    
    const token = storage.getAccessToken(); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Interceptor de Respuesta (Maneja errores)
 */
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    
    // Error de red (backend no disponible)
    if (!error.response) {
      console.error('❌ Error de red - Backend no disponible:', error.message);
      toast.error('Error de conexión', {
        description: 'No se puede conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:8000',
      });
      return Promise.reject(error);
    }
    
    // Si el error es 401 (No autorizado)
    if (error.response?.status === 401) {
      console.error('No autorizado. Token inválido o expirado.');
      
      // Evita bucles si el 401 vino del login
      if (!error.config?.url?.includes('/auth/login')) {
        storage.clear();
        toast.error("Tu sesión ha expirado", {
          description: "Por favor, inicia sesión de nuevo.",
        });
        
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    }

    if (error.response?.status === 403) {
      console.error('Acceso denegado (403).');
      toast.error('No tienes permiso para realizar esta acción');
    }

    if (error.response?.status === 422) {
      console.error('Error de validación (422):', error.response.data);
    }

    return Promise.reject(error);
  }
);

/**
 * Helper de Errores
 */
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    // Intentamos sacar el mensaje de error del backend
    const data = error.response?.data as any;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    return error.message;
  }
  return 'Ocurrió un error inesperado.';
};

export const http = httpClient;