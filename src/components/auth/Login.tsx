import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Stethoscope } from "lucide-react";
import { UserRole } from "../../types";

interface LoginProps {
  onLogin: (email: string, password: string) => void;
  onNavigateToRegister: () => void;
}

export function Login({ onLogin, onNavigateToRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  // Quick login buttons for demo
  const quickLogin = (role: UserRole) => {
    const emails = {
      paciente: 'maria@email.com',
      medico: 'carlos@hospital.com',
      administrador: 'admin@hospital.com'
    };
    onLogin(emails[role], 'password');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
            <Stethoscope className="h-10 w-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription className="mt-2">
              Sistema de Gestión de Citas Médicas
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="ejemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Ingresar
            </Button>
          </form>

        

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={onNavigateToRegister}
              className="text-blue-600"
            >
              ¿No tienes cuenta? Regístrate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
