import React, { useState } from 'react';
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { User } from "../../types";

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  user: User;
  onRoleSwitch?: (role: string) => void;
  onLogout: () => void;
}

export function MainLayout({ children, currentPage, onNavigate, user, onRoleSwitch, onLogout }: MainLayoutProps) {
  // Estado para controlar la visibilidad (true = abierto por defecto)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Función interruptor
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* CONTENEDOR DINÁMICO DEL SIDEBAR */}
      <aside 
        className={`
          transition-all duration-300 ease-in-out bg-white border-r h-full flex-shrink-0
          ${isSidebarOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden'}
        `}
      >
        {/* Forzamos el ancho interno para evitar que el contenido se deforme al cerrar */}
        <div className="w-64 h-full">
          <Sidebar 
            currentPage={currentPage} 
            onNavigate={onNavigate} 
            userRole={user.rol}
            onLogout={onLogout}
          />
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <TopBar 
          user={user} 
          onRoleSwitch={onRoleSwitch as any}
          onLogout={onLogout}
          onNavigate={onNavigate}
          // Pasamos la función de toggle
          onSidebarOpen={toggleSidebar} 
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}