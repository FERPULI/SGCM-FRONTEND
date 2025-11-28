/**
 * Servicio de Reportes y Estadísticas (Admin)
 */

import { http, ApiResponse } from './http';
import { API_ENDPOINTS } from '../config/api';
import { 
  AdminDashboardStats, // <-- CORREGIDO: Usa la nueva interfaz
  AppointmentsByDate, 
  AppointmentsByStatus, 
  DoctorPerformance, 
  PatientStatistics, 
  RevenueReport, 
  ReportFilters 
} from '../types';

// --- Objeto de estadísticas vacío por defecto (CORREGIDO) ---
const emptyStats: AdminDashboardStats = {
  totalPacientes: 0,
  totalMedicos: 0,
  citasHoy: 0,
  citasPendientes: 0,
  citasCompletadas: 0,
  tasaCompletacion: 0,
  tasaCancelacion: 0,
  totalCitas: 0,
  citasEsteMes: 0,
  nuevosUsuarios: 0,
  citasRecientes: [],
};

export const reportsService = {
  /**
   * (MODIFICADO) Obtener estadísticas del dashboard
   */
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    try {
      // 1. Llama a la API. NO espera un wrapper.
      const response = await http.get<AdminDashboardStats>(
        API_ENDPOINTS.REPORTS.DASHBOARD_STATS
      );
      
      // 2. Si la respuesta está vacía (204)
      if (!response || !response.data) {
        return emptyStats;
      }

      // 3. Devuelve los datos directos
      return response.data;
      // --- FIN DE LA CORRECCIÓN ---

    } catch (error) {
      console.error("Error al cargar estadísticas del dashboard:", error);
      return emptyStats; // Devuelve estadísticas vacías también en caso de error
    }
  },

  /**
   * Obtener citas por fecha
   */
  getAppointmentsByDate: async (filters?: ReportFilters): Promise<AppointmentsByDate[]> => {
    // (Tu código aquí está bien, asumiendo que esta API SÍ usa el wrapper)
    try {
      const response = await http.get<ApiResponse<AppointmentsByDate[]>>(
        API_ENDPOINTS.REPORTS.APPOINTMENTS_BY_DATE,
        { params: filters }
      );
      return response.data?.data || [];
    } catch (error) {
      console.error("Error al obtener citas por fecha:", error);
      return [];
    }
  },

  /**
   * Obtener citas por estado
   */
  getAppointmentsByStatus: async (filters?: ReportFilters): Promise<AppointmentsByStatus[]> => {
    // (Tu código aquí está bien, asumiendo que esta API SÍ usa el wrapper)
    try {
      const response = await http.get<ApiResponse<AppointmentsByStatus[]>>(
        API_ENDPOINTS.REPORTS.APPOINTMENTS_BY_STATUS,
        { params: filters }
      );
      return response.data?.data || [];
    } catch (error) {
      console.error("Error al obtener citas por estado:", error);
      return [];
    }
  },

  // ... (El resto de tus funciones están bien)
  
  getDoctorsPerformance: async (filters?: ReportFilters): Promise<DoctorPerformance[]> => {
    try {
      const response = await http.get<ApiResponse<DoctorPerformance[]>>(
        API_ENDPOINTS.REPORTS.DOCTORS_PERFORMANCE,
        { params: filters }
      );
      return response.data?.data || [];
    } catch (error) {
      console.error("Error al obtener rendimiento de doctores:", error);
      return [];
    }
  },
  
  getPatientsStatistics: async (filters?: ReportFilters): Promise<PatientStatistics | null> => {
    try {
      const response = await http.get<ApiResponse<PatientStatistics>>(
        API_ENDPOINTS.REPORTS.PATIENTS_STATISTICS,
        { params: filters }
      );
      return response.data?.data || null;
    } catch (error) {
      console.error("Error al obtener estadísticas de pacientes:", error);
      return null;
    }
  },
  
  getRevenueReport: async (filters?: ReportFilters): Promise<RevenueReport[]> => {
    try {
      const response = await http.get<ApiResponse<RevenueReport[]>>(
        API_ENDPOINTS.REPORTS.REVENUE,
        { params: filters }
      );
      return response.data?.data || [];
    } catch (error) {
      console.error("Error al obtener reporte de ingresos:", error);
      return [];
    }
  },
};