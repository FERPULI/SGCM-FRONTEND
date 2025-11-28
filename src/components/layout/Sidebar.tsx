import { 
  Home, 
  Calendar, 
  Clock, 
  Users, 
  Stethoscope, 
  FileText, 
  User, 
  Settings, 
  LogOut,
  BarChart3,
  UserCog
} from "lucide-react";
import { cn } from "../ui/utils";
import { UserRole } from "../../types";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userRole: UserRole;
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

// --- ¡ARRAY CORREGIDO! ---
// (Usa 'medico' y 'admin')
const menuItems: MenuItem[] = [
  { id: 'inicio', label: 'Inicio', icon: Home, roles: ['paciente', 'medico', 'admin'] },
  { id: 'citas', label: 'Citas', icon: Clock, roles: ['paciente', 'medico', 'admin'] },
  { id: 'calendario', label: 'Calendario', icon: Calendar, roles: ['paciente', 'medico'] },
  { id: 'pacientes', label: 'Pacientes', icon: Users, roles: ['medico'] },
  { id: 'medicos', label: 'Médicos', icon: Stethoscope, roles: ['admin'] },
  { id: 'usuarios', label: 'Usuarios', icon: UserCog, roles: ['admin'] },
  { id: 'historial', label: 'Historial Médico', icon: FileText, roles: ['paciente'] },
  { id: 'reportes', label: 'Reportes', icon: BarChart3, roles: ['admin'] },
  { id: 'perfil', label: 'Perfil', icon: User, roles: ['paciente', 'medico', 'admin'] },
  { id: 'configuracion', label: 'Configuración', icon: Settings, roles: ['admin'] },
];

export function Sidebar({ 
  currentPage, 
  onNavigate, 
  userRole, 
  onLogout 
}: SidebarProps) {
  
  // Esta línea ahora filtra correctamente
  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-sm leading-tight">Sistema de Gestión de Citas Médicas</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left",
                isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={onLogout} 
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors text-left"
        >
          <LogOut className="h-5 w-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}