/**
 * src/services/auth.service.ts
 * (CORREGIDO: Captura robusta de tokens y usa el nuevo storage)
 */
import { http } from './http';
import { LoginCredentials, RegisterData, User, AuthResponse } from '../types';
import { storage } from '../utils/storage';

export const authService = {
  // --- LOGIN ---
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    console.log("🔵 Intentando Login...");
    const response = await http.post<any>('auth/login', credentials);
    
    // CAPTURA INTELIGENTE:
    // A veces Laravel devuelve 'access_token', a veces 'token'. Capturamos ambos.
    const token = response.data.access_token || response.data.token;
    const user = response.data.user || response.data.data;

    if (token) {
      // Usamos el método unificado 'setToken' del nuevo storage
      storage.setToken(token);
      if (user) storage.setUser(user);
      console.log("✅ Login exitoso. Token guardado.");
      
      return { access_token: token, user: user };
    } else {
      console.error("⚠️ El backend respondió pero NO devolvió token:", response.data);
      throw new Error("Credenciales correctas pero no se recibió token.");
    }
  },

  // --- REGISTER ---
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await http.post<any>('auth/register', data);
    const token = response.data.access_token || response.data.token;
    
    if (token) {
      storage.setToken(token);
      storage.setUser(response.data.user);
    }
    return { access_token: token, user: response.data.user };
  },

  // --- LOGOUT ---
  logout: async (): Promise<void> => {
    try { await http.post('auth/logout'); } catch (e) { console.warn("Logout falló en servidor, limpiando localmente..."); } 
    finally { 
      storage.clear(); 
      window.location.href = '/login'; 
    }
  },

  // --- PERFIL ---
  getProfile: async (): Promise<User | null> => {
    try { 
      const res = await http.get<User>('auth/profile'); 
      return res.data; 
    } catch { return null; }
  },

  // --- VERIFICACIÓN ---
  checkAuth: async (): Promise<boolean> => {
    return !!storage.getAccessToken();
  }
};