/**
 * Servicio de Usuarios (Compatible con paginación)
 */

import { http } from './http';

// Definimos la interfaz de Usuario
export interface User {
  id: number;
  name?: string;
  nombre?: string;
  apellidos?: string;
  email: string;
  rol?: string;
  role?: string;
  telefono?: string;
  especialidad?: { nombre: string };
  created_at?: string;
}

export const usersService = {
  // Obtener usuarios con filtros y paginación
  getUsers: async (filters?: any) => {
    try {
      const response = await http.get('users', { params: filters });
      
      // Si viene paginada (con meta y data)
      if (response.data?.data && response.data?.meta) {
        return response.data;
      }
      
      // Si viene como array directo, la convertimos a formato paginado
      if (Array.isArray(response.data)) {
        return {
          data: response.data,
          meta: {
            current_page: 1,
            from: 1,
            last_page: 1,
            per_page: response.data.length,
            to: response.data.length,
            total: response.data.length
          },
          links: {
            first: null,
            last: null,
            prev: null,
            next: null
          }
        };
      }
      
      // Respuesta vacía por defecto
      return {
        data: [],
        meta: {
          current_page: 1,
          from: 0,
          last_page: 1,
          per_page: 10,
          to: 0,
          total: 0
        },
        links: {
          first: null,
          last: null,
          prev: null,
          next: null
        }
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Obtener estadísticas de usuarios
  getUserStats: async () => {
    try {
      const response = await http.get('users/counts');
      return response.data;
    } catch (error) {
      console.error("Error fetching user stats:", error);
      // Retornar null si no existe el endpoint
      return null; 
    }
  },

  createUser: async (userData: any) => {
    const response = await http.post('users', userData);
    return response.data;
  },

  updateUser: async (id: number, userData: any) => {
    const response = await http.put(`users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: number) => {
    await http.delete(`users/${id}`);
  }
};