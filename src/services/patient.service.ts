/**
 * Servicio para el módulo de Pacientes
 * (CORREGIDO: Envía paciente_id para evitar errores de backend)
 */
import { http } from './http';
import { API_ENDPOINTS, STORAGE_KEYS } from '../config/api';
import { PatientDashboardStats, Appointment, MedicalRecord, PatientClinicalProfile } from '../types';

const emptyDashboard: PatientDashboardStats = {
  resumen: { citas_programadas: 0, historial_completado: 0 },
  proxima_cita: null,
};

export const patientService = {
    /**
     * Actualizar datos del paciente
     */
    updateProfile: async (pacienteId: number, data: any) => {
      try {
        // Usar la ruta /users/{id} (corregido)
        const response = await http.put(`/users/${pacienteId}`, data);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  /**
   * Obtener datos del dashboard
   */
  getDashboard: async (): Promise<PatientDashboardStats> => {
    try {
      const response = await http.get<PatientDashboardStats>(API_ENDPOINTS.PACIENTE.DASHBOARD);
      return response.data || emptyDashboard;
    } catch (error) {
      console.error("Error dashboard:", error);
      return emptyDashboard;
    }
  },

  /**
   * (MEJORADO) Obtener mis citas con paciente_id explícito
   */
  getMyAppointments: async (): Promise<Appointment[]> => {
    try {
      // Recuperamos el ID del paciente
      let pacienteId: number | undefined;
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      if (userData) {
        const user = JSON.parse(userData);
        pacienteId = user.paciente?.id || user.id; 
      }

      const response = await http.get<any>(API_ENDPOINTS.PACIENTE.CITAS, {
        params: { paciente_id: pacienteId }
      });
      
      if (Array.isArray(response.data)) return response.data; 
      if (response.data && Array.isArray(response.data.data)) return response.data.data;
      
      return [];
    } catch (error) {
      console.error("Error obteniendo citas:", error);
      return [];
    }
  },
/**
   * Obtener Historial Médico (Consultas Finalizadas)
   */
  getMedicalHistory: async (): Promise<MedicalRecord[]> => {
    try {
      // Recuperamos ID
      let pacienteId: number | undefined;
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (userData) {
        const user = JSON.parse(userData);
        pacienteId = user.paciente?.id || user.id;
      }

      const response = await http.get<any>(API_ENDPOINTS.PACIENTE.HISTORIAL, {
        params: { paciente_id: pacienteId }
      });

      // Adaptador robusto para diferentes respuestas de API
      const data = Array.isArray(response.data) 
        ? response.data 
        : response.data?.data || [];

      return data;
    } catch (error) {
      console.error("Error historial:", error);
      return [];
    }
  },
  /**
   * Obtener Perfil Clínico (Datos biológicos)
   * Extrae datos del objeto 'paciente' guardado en localStorage o pide al backend
   */
  getClinicalProfile: async (): Promise<PatientClinicalProfile> => {
    try {
      // Estrategia Mixta: 
      // 1. Intentamos leer del localStorage (lo más rápido) para datos básicos
      // 2. Calculamos la edad
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      let profile: PatientClinicalProfile = {
        tipo_sangre: '-',
        edad: 0,
        alergias: 'Ninguna conocida',
        condiciones_cronicas: 'Ninguna',
        altura: '-',
        peso: '-'
      };

      if (userData) {
        const user = JSON.parse(userData);
        const paciente = user.paciente;

        if (paciente) {
          // Calcular edad
          let edad = 0;
          if (paciente.fecha_nacimiento) {
            const hoy = new Date();
            const nac = new Date(paciente.fecha_nacimiento);
            edad = hoy.getFullYear() - nac.getFullYear();
          }

          profile = {
            ...profile,
            tipo_sangre: paciente.tipo_sangre || '-',
            alergias: paciente.alergias || 'Ninguna',
            edad: edad,
          };
        }
      }
      
      // Si tuvieras un endpoint específico para datos biométricos (peso/altura), lo llamarías aquí.
      // const response = await http.get(...) 
      
      return profile;

    } catch (error) {
      return { tipo_sangre: '-', edad: 0, alergias: '-', condiciones_cronicas: '-' };
    }
  }
};