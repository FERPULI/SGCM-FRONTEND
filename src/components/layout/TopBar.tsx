import { Menu, Bell, ChevronDown, User, LogOut, Settings } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface TopBarProps {
  user: any;
  onRoleSwitch: (role: string) => void;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  onSidebarOpen: () => void;
}

export function TopBar({ user, onRoleSwitch, onLogout, onNavigate, onSidebarOpen }: TopBarProps) {
  
  // 1. Lógica segura para mostrar el Rol
  const roleLabel = user.rol === 'admin' ? 'Administrador' : 
                    user.rol === 'doctor' || user.rol === 'medico' ? 'Médico' : 'Paciente';

  // 2. Lógica segura para Nombre e Iniciales (Resuelve el conflicto que tenías)
  const nombreMostrar = user.nombre || user.name || 'Usuario';
  const apellidoMostrar = user.apellidos || user.last_name || '';

  const iniciales = nombreMostrar && apellidoMostrar
    ? `${nombreMostrar.charAt(0)}${apellidoMostrar.charAt(0)}`.toUpperCase()
    : nombreMostrar.charAt(0).toUpperCase();

  // Verificar si es paciente para mostrar botón "Reservar Cita"
  const isPatient = roleName.includes('paciente') || roleName.includes('patient');

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 lg:px-6 shadow-sm z-30 flex-shrink-0">
      
      {/* IZQUIERDA: Botón visual (aunque no lo uses, se mantiene para el diseño) */}
      <div className="flex items-center gap-4">
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={onSidebarOpen}
            className="text-gray-600 hover:bg-gray-100"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* DERECHA: Notificaciones y Perfil */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
        </Button>

        <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 focus:outline-none group">
              <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium shadow-sm ring-2 ring-transparent group-hover:ring-blue-100 transition-all">
                {iniciales}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                  {nombreMostrar} {apellidoMostrar}
                </p>
                <p className="text-xs text-blue-600 font-medium capitalize">
                   {roleLabel}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
            </button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onNavigate('perfil')} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" /> Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate('configuracion')} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" /> Configuración
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-600 cursor-pointer focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}