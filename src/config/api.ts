/**
 * Configuración de la API
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  TIMEOUT: 30000,
  API_VERSION: 'v1',
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/profile',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  
  // Citas médicas (CORREGIDO A ESPAÑOL)
  APPOINTMENTS: {
    LIST: '/citas',   // <-- Cambiado de '/appointments' a '/citas'
    CREATE: '/citas', // <-- ¡LA SOLUCIÓN! Cambiado de '/appointments' a '/citas'
    
    GET: (id: string | number) => `/citas/${id}`,
    UPDATE: (id: string | number) => `/citas/${id}`,
    DELETE: (id: string | number) => `/citas/${id}`,
    
    // Estos endpoints dependen de cómo los hayas nombrado en Laravel. 
    // Si también los cambiaste a español, actualízalos aquí.
    // Por ahora asumo que los específicos siguen igual o usan la base '/citas'
    BY_PATIENT: (patientId: string | number) => `/patients/${patientId}/appointments`,
    BY_DOCTOR: (doctorId: string | number) => `/doctors/${doctorId}/appointments`,
    
    CANCEL: (id: string | number) => `/citas/${id}/cancel`,
    CONFIRM: (id: string | number) => `/citas/${id}/confirm`,
    COMPLETE: (id: string | number) => `/citas/${id}/complete`,
    
    // Este ya lo habíamos arreglado antes
    AVAILABLE_SLOTS: '/slots-disponibles', 
  },
  
  // Pacientes
  PATIENTS: {
    LIST: '/patients',
    CREATE: '/patients',
    GET: (id: string | number) => `/patients/${id}`,
    UPDATE: (id: string | number) => `/patients/${id}`,
    DELETE: (id: string | number) => `/patients/${id}`,
    MEDICAL_HISTORY: (id: string | number) => `/patients/${id}/medical-history`,
    PROFILE: '/patients/profile',
  },
  
  // Doctores
  DOCTORS: {
    LIST: '/doctors',
    CREATE: '/doctors',
    GET: (id: string | number) => `/doctors/${id}`,
    UPDATE: (id: string | number) => `/doctors/${id}`,
    DELETE: (id: string | number) => `/doctors/${id}`,
    SCHEDULE: (id: string | number) => `/doctors/${id}/schedule`,
    UPDATE_SCHEDULE: (id: string | number) => `/doctors/${id}/schedule`,
    SPECIALTIES: '/doctors/specialties',
    PROFILE: '/doctors/profile',
  },
  
  // Usuarios
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET: (id: string | number) => `/users/${id}`,
    UPDATE: (id: string | number) => `/users/${id}`,
    DELETE: (id: string | number) => `/users/${id}`,
    CHANGE_PASSWORD: (id: string | number) => `/users/${id}/change-password`,
    TOGGLE_STATUS: (id: string | number) => `/users/${id}/toggle-status`,
    STATS: '/users/counts',
  },

  // Especialidades
  ESPECIALIDADES: {
    LIST: '/especialidades',
  },

  // Médicos (Directorio)
  MEDICOS: {
    LIST: '/medicos-directorio',
  },

  // Módulo Paciente
  PACIENTE: {
    DASHBOARD: '/paciente/dashboard',
    HISTORIAL: '/paciente/historial',
    CITAS: '/citas',
  },
  
  // Reportes
  REPORTS: {
    DASHBOARD_STATS: '/dashboard-stats', 
    APPOINTMENTS_BY_DATE: '/reports/appointments-by-date',
    APPOINTMENTS_BY_STATUS: '/reports/appointments-by-status',
    DOCTORS_PERFORMANCE: '/reports/doctors-performance',
    PATIENTS_STATISTICS: '/reports/patients-statistics',
    REVENUE: '/reports/revenue',
  },
  
  // Notificaciones
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string | number) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id: string | number) => `/notifications/${id}`,
    UNREAD_COUNT: '/notifications/unread-count',
  },
  
  // Configuración
  SETTINGS: {
    GET: '/settings',
    UPDATE: '/settings',
    EMAIL: '/settings/email',
    GENERAL: '/settings/general',
    APPOINTMENTS: '/settings/appointments',
  },
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_DATA: 'user_data',
  USER_ROLE: 'user_role',
};