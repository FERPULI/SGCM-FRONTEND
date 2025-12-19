/**
 * Cliente HTTP con Axios (Simplificado para Laravel Sanctum)
 * (CORREGIDO: Se exporta la instancia 'httpClient' directamente)
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG, HTTP_STATUS } from '../config/api';
import { storage } from '../utils/storage';
import { toast } from 'sonner'; // (Asegúrate de tener 'sonner' instalado)

// (Tus interfaces ApiResponse, etc.)
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// 1. CREA LA INSTANCIA
const httpClient: AxiosInstance = axios.create({
  baseURL: 'https://anakondita.com/api',
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

/**
 * 2. Interceptor de Petición (Añade el token)
 */
httpClient.interceptors.request.use(
  (config) => {
    const token = storage.getAccessToken(); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/**
 * 3. Interceptor de Respuesta (Maneja 401)
 */
httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    
    // Si el error es 401 (No autorizado / Token inválido)
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      console.error('No autorizado. Token inválido o expirado.');
      
      // Evita bucles si el 401 vino del login
      if (!error.config?.url?.includes('/auth/login')) {
        storage.clear();
        toast.error("Tu sesión ha expirado", {
          description: "Por favor, inicia sesión de nuevo.",
        });
        
        setTimeout(() => {
          window.location.href = '/'; // (Usar '/' es más seguro que '/login')
        }, 1500);
      }
    }

    // (Tu otro manejo de errores 403, 404, 422, 500 está bien)
    if (error.response?.status === HTTP_STATUS.FORBIDDEN) {
      console.error('Acceso denegado (403).');
    }
    if (error.response?.status === HTTP_STATUS.UNPROCESSABLE_ENTITY) {
      console.error('Error de validación (422):', error.response.data);
    }

    return Promise.reject(error);
  }
);

/**
 * 4. Helper de Errores (sin cambios)
 */
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse>;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.response?.data?.errors) {
      const errors = axiosError.response.data.errors;
      const firstError = Object.values(errors)[0];
      return Array.isArray(firstError) ? firstError[0] : 'Error de validación';
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }
  return 'Ocurrió un error inesperado.';
};

// 5. (MODIFICADO) Exporta la instancia 'httpClient' como 'http'
//    para que tus otros servicios ('auth.service.ts', 'users.service.ts')
//    no tengan que cambiar su import.
export const http = httpClient;