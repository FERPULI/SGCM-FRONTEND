/**
 * src/hooks/useAuth.ts
 * (CORREGIDO: Nombre de funciones correctos y sin auto-logout agresivo)
 */

import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services';
import { storage } from '../utils/storage';
import { User, LoginCredentials, RegisterData } from '../types';
import { handleApiError } from '../services/http';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar si hay un usuario autenticado al cargar
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Intentamos recuperar lo que hay en memoria primero (Carga Instantánea)
        const savedUser = storage.getUser(); // Usamos el método unificado
        const token = storage.getAccessToken();
        
        if (token && savedUser) {
          setUser(savedUser); // Mostramos el usuario inmediatamente
        }

        // 2. Verificamos con el servidor en segundo plano
        if (token) {
          // CORRECCIÓN CLAVE: Usamos 'getProfile', que es el nombre real en tu servicio
          const currentUser = await authService.getProfile();
          
          if (currentUser) {
            setUser(currentUser);
            // Actualizamos el storage con la info fresca
            storage.setUser(currentUser); 
          }
        }
      } catch (err) {
        console.warn("No se pudo refrescar la sesión en segundo plano (pero no borramos nada).", err);
        // CORRECCIÓN IMPORTANTE:
        // NO llamamos a storage.clear() aquí. 
        // Si el token es inválido (401), el interceptor http.ts ya se encargará.
        // Si fue un error de red, dejamos al usuario trabajar con lo que tiene en caché.
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.login(credentials);
      setUser(response.user);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.register(data);
      setUser(response.user);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      // Aquí sí limpiamos porque el usuario lo pidió
      storage.clear(); 
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      // CORRECCIÓN: Usamos getProfile
      const currentUser = await authService.getProfile();
      if (currentUser) {
        setUser(currentUser);
        storage.setUser(currentUser);
      }
    } catch (err) {
      console.error('Error al refrescar usuario:', err);
      // Aquí tampoco borramos nada agresivamente
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
    clearError,
  };
};