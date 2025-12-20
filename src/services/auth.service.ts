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
   * Registrar nuevo paciente
   * El backend debe:
   * 1. Crear el registro en la tabla 'users' con estos datos
   * 2. Crear automáticamente un registro en la tabla 'pacientes' con el mismo ID
   * 3. Devolver el token de autenticación y los datos completos del usuario
   */
  register: async (data: RegisterData): Promise<SanctumAuthResponse> => {
    
    // 1. Preparamos los datos para crear Usuario y Paciente
    const registerData = {
      nombre: data.nombre,
      apellidos: data.apellidos,
      email: data.email,
      password: data.password,
      password_confirmation: data.password_confirmation,
      rol: data.rol || 'paciente', // Por defecto paciente
      activo: true,
      device_name: 'web-browser',
      // Datos opcionales del paciente
      ...(data.telefono && { telefono: data.telefono }),
      ...(data.fecha_nacimiento && { fecha_nacimiento: data.fecha_nacimiento }),
      ...(data.direccion && { direccion: data.direccion }),
      ...(data.tipo_sangre && { tipo_sangre: data.tipo_sangre }),
      ...(data.alergias && { alergias: data.alergias }),
    };

    try {
      // 2. Llamamos al endpoint de registro (/api/auth/register)
      //    El backend debe crear el User y el Paciente con el mismo ID
      const response = await http.post<SanctumAuthResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        registerData
      );
      
      const { token, user } = response.data;
      
      // 3. Si el registro es exitoso, guardamos la sesión
      storage.setAccessToken(token);
      storage.setUserData(user);
      storage.setUserRole(user.rol);
      
      // 4. Verificar que se creó el registro de paciente
      if (!user.paciente) {
        console.warn('ADVERTENCIA: El usuario se creó pero no tiene registro de paciente asociado');
      }
      
      return response.data;

    } catch (error: any) {
      // Manejo de errores: email duplicado, validación, etc.
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