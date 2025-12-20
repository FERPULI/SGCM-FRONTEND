/**
 * src/utils/storage.ts
 * (BLINDADO: Evita el auto-logout accidental)
 */

const KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  ROLE: 'auth_role'
};

// Variable en memoria para proteger el login reciente
let lastLoginTimestamp = 0;

export const storage = {
  // --- SET TOKEN (Protegido) ---
  setAccessToken: (token: string) => {
    if (!token) return;
    localStorage.setItem(KEYS.TOKEN, token);
    localStorage.setItem('access_token', token);
    
    // Marcamos la hora exacta del login
    lastLoginTimestamp = Date.now();
    console.log("✅ Token guardado. Sistema blindado por 5 segundos.");
  },

  /**
   * Obtener token de acceso
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem(KEYS.TOKEN) || 
           localStorage.getItem('access_token') || 
           localStorage.getItem('token');
  },

  /**
   * Guardar token de refresco (legacy compatibility)
   */
  setRefreshToken: (token: string): void => {
    if (token) localStorage.setItem('refresh_token', token);
  },

  /**
   * Obtener token de refresco
   */
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refresh_token');
  },

  /**
   * Guardar datos del usuario
   */
  setUserData: (userData: any): void => {
    if (!userData) return;
    localStorage.setItem(KEYS.USER, JSON.stringify(userData));
  },

  /**
   * Obtener datos del usuario
   */
  getUserData: (): any | null => {
    const data = localStorage.getItem(KEYS.USER);
    if (!data) {
      // Fallback: intentar con key legacy
      const legacyData = localStorage.getItem('user_data');
      return legacyData ? JSON.parse(legacyData) : null;
    }
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  /**
   * Guardar rol del usuario
   */
  setUserRole: (role: string): void => {
    if (role) localStorage.setItem(KEYS.ROLE, role);
  },

  /**
   * Obtener rol del usuario
   */
  getUserRole: (): string | null => {
    return localStorage.getItem(KEYS.ROLE) || localStorage.getItem('user_role');
  },

  /**
   * Limpiar todos los datos almacenados (logout) - PROTEGIDO
   */
  clear: (): void => {
    // Si han pasado menos de 5 segundos desde el login, IGNORAMOS la orden de borrar
    if (Date.now() - lastLoginTimestamp < 5000) {
      console.warn("🛡️ BLINDAJE ACTIVADO: Se intentó borrar la sesión justo después del login. BLOQUEADO.");
      console.trace("¿Quién llamó a clear()?"); 
      return; 
    }

    localStorage.clear();
    console.log("🧹 Storage limpio y sesión cerrada (Acción legítima).");
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated: (): boolean => {
    return !!storage.getAccessToken();
  },
};
