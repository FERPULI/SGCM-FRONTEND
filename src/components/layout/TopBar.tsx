import React from 'react';
import { Search, Bell, ChevronDown, LogOut, User as UserIcon, Settings, Menu } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { User } from "../../types";

// 1. Hook de autenticación
import { useAuth } from '../../hooks/useAuth';

interface TopBarProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  onSidebarOpen?: () => void;
}

export function TopBar({ user: propUser, onLogout, onNavigate, onSidebarOpen }: TopBarProps) {
  
  // 2. Obtener la sesión real
  const { user: authUser } = useAuth();
  const currentUser = authUser || propUser;

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

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      
      {/* IZQUIERDA */}
      <div className="flex items-center gap-4 flex-1">
        <button onClick={onSidebarOpen} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md">
          <Menu className="h-6 w-6" />
        </button>
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Buscar..." className="pl-10 bg-gray-50 border-gray-200 focus:bg-white rounded-full h-9" />
        </div>
      </div>

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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="pl-2 pr-2 sm:pr-4 hover:bg-gray-100 rounded-full h-10 border border-transparent hover:border-gray-200">
              
              <Avatar className="h-8 w-8 border border-gray-200 mr-2">
                <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                    {initials}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-left hidden md:block mr-2">
                
                {/* AQUÍ SE MUESTRA: Dr. Nombre Apellidos */}
                <div className="text-sm font-bold leading-none text-gray-800">
                    {displayName}
                </div>
                
                <div className="text-xs text-blue-600 font-medium mt-0.5 capitalize">
                    {displayRole}
                </div>

              </div>
              
              <ChevronDown className="h-4 w-4 text-gray-400 hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <div className="px-2 py-1.5 text-xs text-gray-500 truncate border-b border-gray-100 mb-1">
               {currentUser?.email}
            </div>
            
            <DropdownMenuItem onClick={() => onNavigate('perfil')} className="cursor-pointer gap-2">
              <UserIcon className="h-4 w-4" /> <span>Ver Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate('configuracion')} className="cursor-pointer gap-2">
              <Settings className="h-4 w-4" /> <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-600 cursor-pointer gap-2 bg-red-50/50 hover:bg-red-100">
              <LogOut className="h-4 w-4" /> <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}