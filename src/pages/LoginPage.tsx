// pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service'; // Ajusta la ruta si es necesario
import { Login } from '../components/auth/Login'; // Ajusta la ruta a TU componente
import { handleApiError } from '../services/http'; // Ajusta la ruta

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Esta es la LÓGICA
  const handleLogin = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      // 2. Llama al servicio (el que adaptamos para Sanctum)
      await authService.login({ email, password });
      
      // 3. Si tiene éxito, redirige
      navigate('/dashboard'); // O '/admin'

    } catch (error: any) {
      // 4. Si falla, muestra el error
      console.error(error);
      setError(error.message); // El error ya viene procesado por handleApiError
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = () => {
    navigate('/register');
  };

  return (
    <div>
      {/* (Opcional) Muestra el error de la API aquí */}
      {error && (
        <div style={{ color: 'red', padding: '10px', background: '#ffeeee' }}>
          Error: {error}
        </div>
      )}
      
      {/* 5. Renderiza el componente "tonto" y le pasa la LÓGICA */}
      <Login 
        onLogin={handleLogin} 
        onNavigateToRegister={handleNavigate}
      />
      
      {/* ... (puedes añadir tu overlay de 'isLoading' aquí) ... */}
    </div>
  );
}