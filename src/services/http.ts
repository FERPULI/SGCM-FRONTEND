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

// Configuración de Axios
const httpClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api', // URL directa para evitar problemas
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000,
});

// 1. Interceptor de Solicitud (Agrega el Token)
httpClient.interceptors.request.use(
  (config) => {
    const token = storage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Interceptor de Respuesta (Protección Anti-Logout)
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Si es 401, solo avisamos en consola pero NO expulsamos agresivamente
    if (error.response?.status === 401) {
      console.warn("Sesión no válida o expirada (401).");
      // Opcional: Podrías limpiar storage aquí si quisieras ser estricto, 
      // pero por ahora lo dejamos así para que puedas depurar.
    }
    return Promise.reject(error);
  }
);

// --- 3. LA FUNCIÓN QUE FALTABA (handleApiError) ---
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

// Exportamos la instancia
export const http = httpClient;