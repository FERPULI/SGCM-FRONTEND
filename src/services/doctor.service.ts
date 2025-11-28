/**
 * Servicio para gestionar el módulo de Médicos (Admin)
 * (Nombre de archivo: doctor.service.ts)
 */
import { http } from './http';
import { API_ENDPOINTS } from '../config/api';
import { DoctorDirectoryItem, PaginatedResponse, UserFilters } from '../types'; 

// --- Objeto de paginación vacío por defecto ---
const emptyPaginatedResponse: PaginatedResponse<DoctorDirectoryItem> = {
  data: [],
  links: { first: null, last: null, prev: null, next: null },
  meta: {
    current_page: 1,
    from: 0,
    last_page: 1,
    path: "",
    per_page: 10,
    to: 0,
    total: 0,
    stats_generales: { // (Añadimos el default)
      totalMedicos: 0,
      totalEspecialidades: 0,
      totalCitas: 0,
      totalPacientesAtendidos: 0,
    }
  }
};


export const doctorService = {
  
  /**
   * (MODIFICADO) Obtener el directorio Y las stats generales
   */
  getMedicosDirectory: async (filters?: UserFilters): Promise<PaginatedResponse<DoctorDirectoryItem>> => {
    try {
      // Llama a la única ruta que devuelve todo
      const response = await http.get<PaginatedResponse<DoctorDirectoryItem>>(
        API_ENDPOINTS.MEDICOS.LIST, // (Apunta a /medicos-directorio)
        { params: filters } // Pasa los filtros (ej. ?q=... o ?page=...)
      );
      
      if (!response || !response.data) {
        return emptyPaginatedResponse;
      }
      return response.data; // Devuelve el objeto completo { data, links, meta }
    } catch (error) {
      console.error("Error al obtener directorio de médicos:", error);
      return emptyPaginatedResponse;
    }
  },
};