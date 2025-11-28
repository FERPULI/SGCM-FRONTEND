/**
 * Servicio para gestionar las Especialidades
 */
import { http } from './http';
import { API_ENDPOINTS } from '../config/api';
import { Especialidad, PaginatedResponse } from '../types'; 

export const especialidadService = {
  
  /**
   * Obtener todas las especialidades
   */
  getAllEspecialidades: async (): Promise<Especialidad[]> => {
    try {
      // (MODIFICADO) Llama a la API y espera una respuesta paginada
      const response = await http.get<PaginatedResponse<Especialidad>>(
        API_ENDPOINTS.ESPECIALIDADES.LIST,
        { params: { per_page: 100 } } // (Pide 100 para traer todas)
      );
      
      // (MODIFICADO) Devuelve solo el array 'data'
      if (!response || !response.data || !response.data.data) {
        return [];
      }
      return response.data.data; // Devuelve el array [ { id: 1, nombre: '...' }, ... ]

    } catch (error) {
      console.error("Error al cargar especialidades:", error);
      return [];
    }
  },
  
  // (Aquí puedes añadir 'create', 'update', 'delete' para especialidades si lo necesitas)
};