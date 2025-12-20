/**
 * Servicio para gestionar las Especialidades
 */
import { http } from './http';
import { API_ENDPOINTS } from '../config/api';
import { Especialidad, PaginatedResponse } from '../types'; 

export const especialidadService = {
  
  /**
   * Obtener todas las especialidades
   * (RENOMBRADO a 'getAll' para que coincida con AppointmentManagement)
   */
  getAll: async (): Promise<Especialidad[]> => {
    try {
      // Intentamos usar la ruta de configuración, con fallback a '/especialidades'
      // Verificamos ambas rutas posibles según tu configuración anterior
      const url = API_ENDPOINTS?.MEDICOS?.ESPECIALIDADES || 
                  API_ENDPOINTS?.ESPECIALIDADES?.LIST || 
                  '/especialidades';

      // Pedimos 100 para traer todas si hay paginación
      const response = await http.get<any>(url, { params: { per_page: 100 } });
      
      // LOGICA ROBUSTA:
      // 1. Si Laravel devuelve paginación: { data: [...] }
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      // 2. Si devuelve array directo: [...]
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }

      return [];

    } catch (error) {
      console.error("Error al cargar especialidades:", error);
      return [];
    }
  },
};