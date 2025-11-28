/**
 * Servicio de Usuarios (Admin)
 * (CORREGIDO para pasar 'params' correctamente)
 */

import { http, ApiResponse } from './http';
import { API_ENDPOINTS } from '../config/api';
// (MODIFICADO) Importa los tipos actualizados
import { 
  User, 
  PaginatedResponse,
  CreateUserData,
  UpdateUserData,
  ChangePasswordData,
  UserFilters,
  UserStats 
} from '../types';

// --- Objeto de paginación vacío por defecto ---
const emptyPaginatedResponse: PaginatedResponse<User> = {
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
  }
};

// --- Objeto de estadísticas vacío por defecto (NUEVO) ---
const emptyStats: UserStats = {
  total_usuarios: 0,
  pacientes: 0,
  medicos: 0,
  administradores: 0,
};

export const usersService = {
  
  /**
   * (NUEVO) Obtener estadísticas de usuarios
   */
  getUserStats: async (): Promise<UserStats> => {
    try {
      const response = await http.get<UserStats>(
        API_ENDPOINTS.USERS.STATS 
      );
      if (!response || !response.data) {
        return emptyStats;
      }
      return response.data; 
    } catch (error) {
      console.error("Error al obtener estadísticas de usuarios:", error);
      return emptyStats;
    }
  },

  /**
   * Obtener lista de usuarios
   */
  getUsers: async (filters?: UserFilters): Promise<PaginatedResponse<User>> => {
    try {
      // --- ¡LA CORRECCIÓN CRÍTICA! ---
      // Los filtros (filters) deben pasarse dentro de un objeto 'params'
      const response = await http.get<PaginatedResponse<User>>(
        API_ENDPOINTS.USERS.LIST,
        { params: filters } // <-- ASÍ
      );
      // --- FIN DE LA CORRECCIÓN ---

      if (!response || !response.data) {
        return emptyPaginatedResponse;
      }
      return response.data;
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      return emptyPaginatedResponse;
    }
  },

  /**
   * Obtener un usuario por ID
   */
  getUserById: async (id: number): Promise<User | null> => {
    try {
      const response = await http.get<ApiResponse<User>>(
        API_ENDPOINTS.USERS.GET(id)
      );
      return response.data?.data || null;
    } catch (error) {
      console.error(`Error al obtener usuario ${id}:`, error);
      return null;
    }
  },

  /**
   * Crear nuevo usuario
   */
  createUser: async (data: CreateUserData): Promise<User> => {
    const response = await http.post<ApiResponse<User>>(
      API_ENDPOINTS.USERS.CREATE,
      data
    );
    if (!response.data?.data) {
      throw new Error("La API no devolvió el usuario creado.");
    }
    return response.data.data;
  },

  /**
   * Actualizar usuario
   */
  updateUser: async (id: number, data: UpdateUserData): Promise<User> => {
    const response = await http.put<ApiResponse<User>>(
      API_ENDPOINTS.USERS.UPDATE(id),
      data
    );
    if (!response.data?.data) {
      throw new Error("La API no devolvió el usuario actualizado.");
    }
    return response.data.data;
  },

  /**
   * Eliminar usuario
   */
  deleteUser: async (id: number): Promise<void> => {
    await http.delete<ApiResponse<null>>(API_ENDPOINTS.USERS.DELETE(id));
  },

  /**
   * Cambiar contraseña de un usuario
   */
  changePassword: async (id: number, data: ChangePasswordData): Promise<void> => {
    await http.post<ApiResponse<null>>(API_ENDPOINTS.USERS.CHANGE_PASSWORD(id), data);
  },

  /**
   * Activar/Desactivar usuario
   */
  toggleUserStatus: async (id: number): Promise<User> => {
    const response = await http.post<ApiResponse<User>>(
      API_ENDPOINTS.USERS.TOGGLE_STATUS(id)
    );
    if (!response.data?.data) {
      throw new Error("La API no devolvió el usuario actualizado.");
    }
    return response.data.data;
  },
};