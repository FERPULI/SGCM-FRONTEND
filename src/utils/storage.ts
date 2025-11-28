/**
 * Utilidades para manejo de localStorage
 * 
 * Proporciona funciones seguras para almacenar y recuperar datos del navegador
 */

import { STORAGE_KEYS } from '../config/api';

export const storage = {
  /**
   * Guardar token de acceso
   */
  setAccessToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  /**
   * Obtener token de acceso
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Guardar token de refresco
   */
  setRefreshToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  /**
   * Obtener token de refresco
   */
  getRefreshToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Guardar datos del usuario
   */
  setUserData: (userData: any): void => {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  },

  /**
   * Obtener datos del usuario
   */
  getUserData: (): any | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Guardar rol del usuario
   */
  setUserRole: (role: string): void => {
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
  },

  /**
   * Obtener rol del usuario
   */
  getUserRole: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.USER_ROLE);
  },

  /**
   * Limpiar todos los datos almacenados (logout)
   */
  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated: (): boolean => {
    return !!storage.getAccessToken();
  },
};
