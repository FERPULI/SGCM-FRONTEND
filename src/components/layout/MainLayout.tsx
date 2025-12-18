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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={onNavigate} 
        userRole={user.rol}
        onLogout={onLogout}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300">
        <TopBar 
          user={user} 
          onRoleSwitch={onRoleSwitch as any}
          onLogout={onLogout}
          onNavigate={onNavigate}
          onSidebarOpen={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}