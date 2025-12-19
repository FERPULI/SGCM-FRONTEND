/**
 * Configuración de la API
 * (VERSIÓN CORREGIDA: Rutas en Español para Citas)
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api', 
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  },
  APPOINTMENTS: {
    LIST: '/citas',
    CREATE: '/citas',
    // Función para generar URL con ID:
    GET: (id: number) => `/citas/${id}`,
    UPDATE: (id: number) => `/citas/${id}`,
    DELETE: (id: number) => `/citas/${id}`,
    
    // Endpoints personalizados
    AVAILABLE_SLOTS: '/slots-disponibles',
    
    // Como tu backend usa Resource Controller, estas acciones 
    // suelen ser PUT a la ruta update con un estado diferente,
    // o rutas específicas si las definiste en api.php.
    // Asumiré rutas específicas por limpieza:
    CONFIRM: (id: number) => `/citas/${id}/confirmar`, // Ajusta según tu api.php
    COMPLETE: (id: number) => `/citas/${id}/completar`, // Ajusta según tu api.php
    
    // Filtros rápidos
    BY_PATIENT: (id: number) => `/citas?paciente_id=${id}`,
    BY_DOCTOR: (id: number) => `/citas?medico_id=${id}`,
  },
  MEDICOS: {
    LIST: '/medicos-directorio',
    ESPECIALIDADES: '/especialidades',
  },
  PACIENTES: {
    DASHBOARD: '/paciente/dashboard',
  }
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  SERVER_ERROR: 500,
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user',
  USER_ROLE: 'role',
};