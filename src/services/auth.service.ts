/**
 * Servicio de Autenticación (Adaptado para Laravel Sanctum)
 */
import { http, ApiResponse, handleApiError } from './http';
import { API_ENDPOINTS } from '../config/api';
import { storage } from '../utils/storage';
// Asegúrate de que 'RegisterData' esté definido en 'types.ts'
// type RegisterData = { nombre: string; apellidos: string; email: string; password: string; password_confirmation: string; };
import { User, LoginCredentials, RegisterData } from '../types'; 

// Esta es la respuesta que SÍ devuelve tu API de login
interface SanctumAuthResponse {
  token: string;
  token_type: string;
  user: User;
}

export const authService = {

  /**
   * Iniciar sesión
   */
  login: async (credentials: LoginCredentials): Promise<SanctumAuthResponse> => {
    
    // Sanctum necesita el 'device_name'
    const loginData = {
      ...credentials,
      device_name: 'web-browser'
    };

    try {
      // Tu API de login NO devuelve el wrapper 'ApiResponse', sino la data directa.
      const response = await http.post<SanctumAuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        loginData
      );
      
      const { token, user } = response.data;
      
      // Guardar el token y el usuario
      storage.setAccessToken(token);
      storage.setUserData(user);
      storage.setUserRole(user.role);
      
      return response.data;

    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Registrar nuevo usuario (¡FUNCIÓN AÑADIDA!)
   */
  register: async (data: RegisterData): Promise<SanctumAuthResponse> => {
    
    // 1. Preparamos los datos EXACTOS que tu API/SQL espera
    const registerData = {
      ...data, // nombre, apellidos, email, password, password_confirmation
      rol: 'paciente',
      activo: true,
      device_name: 'web-browser'
    };

    try {
      // 2. Llamamos al endpoint de registro
      const response = await http.post<SanctumAuthResponse>(
        API_ENDPOINTS.AUTH.REGISTER, // Asegúrate que esta ruta exista en config/api.ts
        registerData
      );
      
      const { token, user } = response.data;
      
      // 3. Si el registro funciona, logueamos al usuario
      storage.setAccessToken(token);
      storage.setUserData(user);
      storage.setUserRole(user.role);
      
      return response.data;

    } catch (error: any) {
      // 4. 'handleApiError' mostrará si "el email ya existe", etc.
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Cerrar sesión
   */
  logout: async (): Promise<void> => {
    try {
      await http.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error("Error al cerrar sesión en API, limpiando localmente.");
    } finally {
      storage.clear();
      // Forzamos la recarga de la página
      window.location.reload(); 
    }
  },
  
  /**
   * Obtener usuario autenticado (¡CORREGIDO!)
   */
  getCurrentUser: async (): Promise<User> => {
    try {
      // 1. Llama a la API. La respuesta (response.data) será {"user": {...}}
      //    (Usamos <{ user: User }> para decirle a TypeScript cómo se ve la respuesta)
      const response = await http.get<{ user: User }>(API_ENDPOINTS.AUTH.ME);
      
      // 2. Desenvuelve el objeto y devuelve SOLO el usuario
      const user = response.data.user;

      // 3. (Opcional pero recomendado) Actualiza el storage por si acaso
      storage.setUserData(user);
      storage.setUserRole(user.rol);
      
      return user; // <-- Devuelve el objeto User, no la envoltura

    } catch (error: any) {
      // (El interceptor de http.ts manejará el 401 si falla)
      throw new Error(handleApiError(error));
    }
  },
  
  // (El resto de tus funciones: forgotPassword, etc. deben ser eliminadas
  //  si no existen en los API_ENDPOINTS. Tu api.ts no las tenía)
};