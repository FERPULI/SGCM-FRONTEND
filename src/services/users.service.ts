import { http } from './http';

// Definimos la interfaz de Usuario
export interface User {
  id: number;
  name: string;
  email: string;
  role: string; // 'admin', 'doctor', 'patient', 'user'
  telefono?: string;
  especialidad?: { nombre: string }; // Para médicos
  created_at?: string;
}

export const usersService = {
  // Obtener todos los usuarios
  getAll: async () => {
    try {
      // Intentamos obtener usuarios. Ajusta la ruta si es diferente (ej: 'users' o 'usuarios')
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

  // Obtener estadísticas (Si no tienes endpoint, las calcularemos en el frontend)
  getStats: async () => {
    // Retornamos null para indicar que el frontend debe calcularlo
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