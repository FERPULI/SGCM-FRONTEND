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
  onSidebarOpen: () => void; // Recibimos la función aquí
}

export function TopBar({ user, onRoleSwitch, onLogout, onNavigate, onSidebarOpen }: TopBarProps) {
  
  const roleLabel = user.rol === 'admin' ? 'Administrador' : 
                    user.rol === 'doctor' || user.rol === 'medico' ? 'Médico' : 'Paciente';

<<<<<<< Updated upstream
  // 3. LÓGICA CORREGIDA DE NOMBRE Y APELLIDOS
  
  // Buscamos el NOMBRE (name, first_name, nombres o nombre)
  const rawName = (currentUser as any)?.name || 
                  (currentUser as any)?.first_name || 
                  (currentUser as any)?.nombres || 
                  (currentUser as any)?.nombre || 
                  'Usuario';
  
  // Buscamos los APELLIDOS (Prioridad: 'apellidos' como indicaste)
  const rawLastName = (currentUser as any)?.apellidos || 
                      (currentUser as any)?.last_name || 
                      (currentUser as any)?.apellido || 
                      '';

  // Verificamos si es médico para el prefijo "Dr."
  const roleName = ((currentUser as any)?.role || (currentUser as any)?.rol || '').toLowerCase();
  const isDoctor = roleName.includes('doctor') || roleName.includes('medico');
  const prefix = isDoctor && !rawName.startsWith('Dr.') ? 'Dr.' : '';

  // 4. CONSTRUCCIÓN FINAL: "Dr. Nombre Apellidos"
  const displayName = `${prefix} ${rawName} ${rawLastName}`.trim();
  
  // Texto del Rol (Debajo del nombre)
  const displayRole = isDoctor ? 'Médico Especialista' : 'Panel de Control';

  // Iniciales (Primera letra del nombre + Primera del apellido)
  const initials = (rawName.charAt(0) + (rawLastName ? rawLastName.charAt(0) : '')).toUpperCase();
=======
  // Iniciales seguras
  const iniciales = user.nombre && user.apellidos 
    ? `${user.nombre.charAt(0)}${user.apellidos.charAt(0)}`.toUpperCase()
    : 'U';
>>>>>>> Stashed changes

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 lg:px-6 shadow-sm z-30 flex-shrink-0">
      
      {/* BOTÓN DEL MENÚ (IZQUIERDA) */}
      <div className="flex items-center gap-4">
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
                console.log("🔘 Botón presionado en TopBar");
                onSidebarOpen();
            }}
            className="text-gray-600 hover:bg-gray-100"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

<<<<<<< Updated upstream
      {/* DERECHA */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-gray-500 hover:bg-gray-100 rounded-full">
              <Bell className="h-5 w-5" />
              <Badge className="absolute top-1.5 right-1.5 h-2 w-2 p-0 bg-red-500 border border-white rounded-full" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            <div className="p-4 text-sm text-gray-500 text-center">No hay notificaciones nuevas</div>
          </DropdownMenuContent>
        </DropdownMenu>
=======
      {/* DERECHA (PERFIL) */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
        </Button>

        <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>
>>>>>>> Stashed changes

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 focus:outline-none group">
              <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium shadow-sm ring-2 ring-transparent group-hover:ring-blue-100 transition-all">
                {iniciales}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                  {user.nombre} {user.apellidos}
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