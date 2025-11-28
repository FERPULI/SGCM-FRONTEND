// components/layout/MainLayout.tsx

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { User, UserRole } from "../../types";

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  user: User;
  onRoleSwitch?: (role: 'paciente' | 'medico' | 'administrador') => void;
  onLogout: () => void; // <-- ¡PASO 2: Acepta la prop aquí!
}

export function MainLayout({ 
  children, 
  currentPage, 
  onNavigate, 
  user, 
  onRoleSwitch, 
  onLogout // <-- Recíbela aquí
}: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={onNavigate} 
        userRole={user.rol}
        onLogout={onLogout} // <-- ¡PASO 3: Pásala al Sidebar!
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={user} onRoleSwitch={onRoleSwitch} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}