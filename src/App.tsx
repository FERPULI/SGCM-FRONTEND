import { useState, useEffect } from "react";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { MainLayout } from "./components/layout/MainLayout";
import { PatientDashboard } from "./components/patient/PatientDashboard";
import { PatientAppointments } from "./components/patient/PatientAppointments";
import { BookAppointment } from "./components/patient/BookAppointment";
import { PatientCalendar } from "./components/patient/PatientCalendar";
import { MedicalHistory } from "./components/patient/MedicalHistory";
import { PatientProfile } from "./components/patient/PatientProfile";

import { DoctorDashboard } from "./components/doctor/DoctorDashboard"; 
import { DoctorAppointments } from "./components/doctor/DoctorAppointments";
import { DoctorCalendar } from "./components/doctor/DoctorCalendar";
import { PatientDetails } from "./components/doctor/PatientDetails";
import { DoctorProfile } from "./components/doctor/DoctorProfile";

import { AdminDashboard } from "./components/admin/AdminDashboard";
import { UserManagement } from "./components/admin/UserManagement";
import { AppointmentManagement } from "./components/admin/AppointmentManagement"; 
import { Reports } from "./components/admin/Reports"; 
import { Settings } from "./components/admin/Settings"; 
import { DoctorManagement } from "./components/admin/DoctorManagement";
// [NUEVO] Importamos el perfil de administrador
import { UserProfile } from "./components/admin/UserProfile";

import { User } from "./types";
import { Toaster } from "./components/ui/sonner";
import { authService } from "./services/auth.service";
import { storage } from "./utils/storage";

type AuthView = 'login' | 'register';

export default function App() {
  const [authView, setAuthView] = useState<AuthView>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('inicio');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = storage.getAccessToken();
      if (token) {
        try {
          const user = await authService.getCurrentUser();
          setCurrentUser(user);
        } catch (err) { storage.clear(); setCurrentUser(null); }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setError(null); setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      setCurrentUser(response.user); setCurrentPage('inicio');
    } catch (error: any) { setError(error.message || "Error al iniciar sesión"); } finally { setIsLoading(false); }
  };

  const handleLogout = () => { authService.logout(); setCurrentUser(null); setCurrentPage('inicio'); setAuthView('login'); };

  const handleRegister = async (data: any) => {
    setError(null); setIsLoading(true);
    try {
      const response = await authService.register({ ...data, role: 'patient' }); 
      setCurrentUser(response.user); setCurrentPage('inicio');
    } catch (error: any) { setError(error.message || "Error en el registro"); } finally { setIsLoading(false); }
  };

  const handleNavigate = (page: string) => setCurrentPage(page);

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;

  if (!currentUser) {
    return (
      <div>
        {error && <div className="bg-red-50 text-red-600 p-3 text-center border-b border-red-100">{error}</div>}
        {authView === 'login' ? <Login onLogin={handleLogin} onNavigateToRegister={() => { setError(null); setAuthView('register'); }} /> : <Register onRegister={handleRegister} onNavigateToLogin={() => { setError(null); setAuthView('login'); }} />}
        <Toaster />
      </div>
    );
  }

  const renderContent = () => {
    if (!currentUser.rol) return <div className="p-6">Cargando perfil...</div>;

    // --- VISTA PACIENTE ---
    if (currentUser.rol === 'patient' || currentUser.rol === 'paciente') {
      switch (currentPage) {
        case 'inicio': return <PatientDashboard onNavigate={handleNavigate} />;
        case 'citas': return <PatientAppointments onNavigate={handleNavigate} />;
        case 'reservar-cita': return <BookAppointment onNavigate={handleNavigate} user={currentUser} />;
        case 'calendario': return <PatientCalendar />;
        case 'historial': return <MedicalHistory />;
        case 'perfil': return <PatientProfile user={currentUser} />;
        default: return <PatientDashboard onNavigate={handleNavigate} />;
      }
    }

    // --- VISTA MÉDICO ---
    if (currentUser.rol === 'doctor' || currentUser.rol === 'medico') {
      switch (currentPage) {
        case 'inicio': return <DoctorDashboard onNavigate={handleNavigate} user={currentUser} />;
        case 'citas': return <DoctorAppointments />;
        case 'calendario': return <DoctorCalendar />;
        case 'pacientes': return <PatientDetails onNavigate={handleNavigate} />;
        case 'perfil': return <DoctorProfile user={currentUser} />;
        default: return <DoctorDashboard onNavigate={handleNavigate} user={currentUser} />;
      }
    }

    // --- VISTA ADMINISTRADOR ---
    if (currentUser.rol === 'admin') {
      switch (currentPage) {
        case 'inicio': return <AdminDashboard onNavigate={handleNavigate} />;
        case 'usuarios': return <UserManagement />; 
        case 'medicos': return <DoctorManagement />;
        case 'citas': return <AppointmentManagement />; 
        case 'reportes': return <Reports />;
        case 'configuracion': return <Settings />;
        
        // [NUEVO] Aquí conectamos el perfil nuevo
        case 'perfil': return <UserProfile />; 
        
        default: return <AdminDashboard onNavigate={handleNavigate} />;
      }
    }
    return <div className="p-6">Rol desconocido</div>;
  };

  return (
    <>
      <MainLayout currentPage={currentPage} onNavigate={handleNavigate} user={currentUser} onRoleSwitch={() => {}} onLogout={handleLogout}>
        {renderContent()}
      </MainLayout>
      <Toaster />
    </>
  );
}