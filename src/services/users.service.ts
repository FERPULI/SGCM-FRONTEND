import { http } from './http';

// Definimos la interfaz de Usuario (Ampliada para el perfil)
export interface User {
  id: number;
  name: string;
  email: string;
  role: string; // 'admin', 'doctor', 'patient', 'user'
  telefono?: string;
  direccion?: string;  // Agregado
  biografia?: string;  // Agregado
  licencia?: string;   // Agregado
  especialidad?: { nombre: string }; // Para médicos
  created_at?: string;
}

export const usersService = {
  // Obtener todos los usuarios (Para el panel de admin)
  getAll: async () => {
    try {
      const response = await http.get<User[]>('users');
      // Manejo flexible de la respuesta
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

  // --- NUEVO: Obtener un solo usuario por ID (CRUCIAL PARA EL PERFIL) ---
  getUserById: async (id: number) => {
    try {
      const response = await http.get(`users/${id}`);
      // Algunos backends devuelven { data: user } y otros directo user. Manejamos ambos.
      return (response.data as any).data || response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  },

  // Obtener estadísticas
  getStats: async () => {
    return null; 
  },

  createUser: async (userData: any) => {
    const response = await http.post('users', userData);
    return response.data;
  },

  // --- NUEVO/ALIAS: Actualizar perfil ---
  // El componente UserProfile llama a 'updateProfile', así que lo definimos aquí.
  // Puede reutilizar la lógica de un updateUser genérico.
  updateProfile: async (id: number, userData: any) => {
    const response = await http.put(`users/${id}`, userData);
    return response.data;
  },

  // Tu función original de actualizar (la mantenemos por compatibilidad)
  updateUser: async (id: number, userData: any) => {
    const response = await http.put(`users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: number) => {
    await http.delete(`users/${id}`);
  }
};