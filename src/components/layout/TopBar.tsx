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

interface TopBarProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  onSidebarOpen?: () => void;
  onRoleSwitch?: (role: any) => void;
}

export function TopBar({ user, onLogout, onNavigate, onSidebarOpen }: TopBarProps) {
  
  const getInitials = (name?: string) => {
    if (!name) return 'US';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <button onClick={onSidebarOpen} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md">
          <Menu className="h-6 w-6" />
        </button>
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Buscar..." className="pl-10 bg-gray-50 border-gray-200 focus:bg-white rounded-full h-9" />
        </div>
      </div>

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
                <AvatarFallback className="bg-blue-600 text-white text-xs">{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block mr-2">
                <div className="text-sm font-semibold leading-none text-gray-700">{user?.name || 'Usuario'}</div>
                <div className="text-xs text-gray-500 capitalize mt-0.5">{user?.rol || 'Rol'}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onNavigate('perfil')} className="cursor-pointer gap-2">
              <UserIcon className="h-4 w-4" /> <span>Ver Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate('configuracion')} className="cursor-pointer gap-2">
              <Settings className="h-4 w-4" /> <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-600 cursor-pointer gap-2 bg-red-50/50">
              <LogOut className="h-4 w-4" /> <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}