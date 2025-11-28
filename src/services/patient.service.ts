/**
 * Servicio para el módulo de Pacientes
 * (CORREGIDO: Envía paciente_id para evitar errores de backend)
 */
import { http } from './http';
import { API_ENDPOINTS, STORAGE_KEYS } from '../config/api';
import { PatientDashboardStats, Appointment } from '../types';

const emptyDashboard: PatientDashboardStats = {
  resumen: { citas_programadas: 0, historial_completado: 0 },
  proxima_cita: null,
};

export const patientService = {
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
      // 1. Intentamos recuperar el paciente_id del localStorage para ayudar al backend
      let pacienteId: number | undefined;
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      if (userData) {
        const user = JSON.parse(userData);
        // Intentamos sacar el ID del objeto anidado o del usuario como fallback
        pacienteId = user.paciente?.id || user.id; 
      }

      console.log("Solicitando citas para paciente_id:", pacienteId);

      // 2. Hacemos la petición enviando el ID como parámetro
      const response = await http.get<any>(API_ENDPOINTS.PACIENTE.CITAS, {
        params: {
          paciente_id: pacienteId // <-- Esto ayuda si el backend no infiere el usuario
        }
      });
      
      // 3. Manejo robusto de la respuesta (Array directo vs Paginado)
      if (Array.isArray(response.data)) {
        return response.data; 
      } 
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data; 
      }
      
      return [];
    } catch (error) {
      console.error("Error obteniendo citas:", error);
      throw error; // Lanzamos el error para que el componente muestre el Toast
    }
  },
/**
   * Obtener Historial Médico (Consultas Finalizadas)
   */
  getMedicalHistory: async (): Promise<MedicalRecord[]> => {
    try {
      // Recuperamos el ID del paciente (igual que en citas)
      let pacienteId: number | undefined;
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (userData) {
        const user = JSON.parse(userData);
        pacienteId = user.paciente?.id || user.id;
      }

      const response = await http.get<any>(API_ENDPOINTS.PACIENTE.HISTORIAL, {
        params: { paciente_id: pacienteId }
      });
      
      // Adaptador robusto
      if (Array.isArray(response.data)) return response.data;
      if (response.data && Array.isArray(response.data.data)) return response.data.data;
      
      return [];
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
      // Opción A: Leer del usuario actual en localStorage (más rápido)
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (userData) {
        const user = JSON.parse(userData);
        const paciente = user.paciente;

        if (paciente) {
          // Calcular edad aproximada
          let edad = 0;
          if (paciente.fecha_nacimiento) {
            const hoy = new Date();
            const cumpleanos = new Date(paciente.fecha_nacimiento);
            edad = hoy.getFullYear() - cumpleanos.getFullYear();
          }

          return {
            tipo_sangre: paciente.tipo_sangre || '-',
            altura: '-', // Si no tienes este campo en BD, pon '-'
            peso: '-',   // Si no tienes este campo en BD, pon '-'
            alergias: paciente.alergias || 'Ninguna conocida',
            condiciones_cronicas: '-',
            edad: edad
          };
        }
      }
    // Opción B: Si necesitas pedirlo a la API (si hay endpoint)
      // const response = await http.get<PatientClinicalProfile>(API_ENDPOINTS.PACIENTE.PROFILE);
      // return response.data;

      return { tipo_sangre: '-', altura: '-', peso: '-', alergias: '-', condiciones_cronicas: '-', edad: 0 };
    } catch (error) {
      return { tipo_sangre: '-', altura: '-', peso: '-', alergias: '-', condiciones_cronicas: '-', edad: 0 };
    }
    
    }

};