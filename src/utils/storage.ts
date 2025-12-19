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
  setToken: (token: string) => {
    if (!token) return;
    localStorage.setItem(KEYS.TOKEN, token);
    localStorage.setItem('access_token', token);
    
    // Marcamos la hora exacta del login
    lastLoginTimestamp = Date.now();
    console.log("✅ Token guardado. Sistema blindado por 5 segundos.");
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem(KEYS.TOKEN) || 
           localStorage.getItem('access_token') || 
           localStorage.getItem('token');
  },

  // --- SET USER ---
  setUser: (user: any) => {
    if (!user) return;
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  getUser: () => {
    const data = localStorage.getItem(KEYS.USER);
    try { return data ? JSON.parse(data) : null; } catch { return null; }
  },

  // --- LIMPIEZA (AQUÍ ESTÁ EL TRUCO) ---
  clear: () => {
    // Si han pasado menos de 5 segundos desde el login, IGNORAMOS la orden de borrar.
    if (Date.now() - lastLoginTimestamp < 5000) {
      console.warn("🛡️ BLINDAJE ACTIVADO: Se intentó borrar la sesión justo después del login. BLOQUEADO.");
      // Imprimimos quién intentó borrarlo para que lo sepas (opcional)
      console.trace("¿Quién llamó a clear()?"); 
      return; 
    }

    localStorage.clear();
    console.log("🧹 Storage limpio y sesión cerrada (Acción legítima).");
  }
};