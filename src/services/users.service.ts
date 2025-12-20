/**
 * Servicio de Usuarios (Simplificado)
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
  // Obtener todos los usuarios
  getAll: async () => {
    try {
      const response = await http.get<User[]>('users');
      
      // Manejo flexible de la respuesta (por si viene paginada o directa)
      if ((response.data as any).data && Array.isArray((response.data as any).data)) {
         return (response.data as any).data;
      } else if (Array.isArray(response.data)) {
         return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },

  // Obtener usuarios con filtros (legacy compatibility)
  getUsers: async (filters?: any) => {
    return usersService.getAll();
  },

  // Obtener estadísticas (Si no tienes endpoint, retorna null)
  getUserStats: async () => {
    return null; 
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