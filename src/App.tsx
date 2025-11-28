// --- (Todos tus imports de antes) ---
import { useState, useEffect } from "react";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { MainLayout } from "./components/layout/MainLayout";
// ... (imports de dashboards)
import { PatientDashboard } from "./components/patient/PatientDashboard";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { UserManagement } from "./components/admin/UserManagement";
import { AppointmentManagement } from "./components/admin/AppointmentManagement"; 
import { Reports } from "./components/admin/Reports"; 
import { Settings } from "./components/admin/Settings"; 
import { DoctorDashboard } from "./components/doctor/DoctorDashboard"; 
import { DoctorManagement } from "./components/admin/DoctorManagement"; // <-- ¡NUEVO!
// ... (imports de Paciente y Médico) ...
import { PatientAppointments } from "./components/patient/PatientAppointments";
import { BookAppointment } from "./components/patient/BookAppointment";
import { PatientCalendar } from "./components/patient/PatientCalendar";
import { MedicalHistory } from "./components/patient/MedicalHistory";
import { PatientProfile } from "./components/patient/PatientProfile";
import { DoctorAppointments } from "./components/doctor/DoctorAppointments";
import { DoctorCalendar } from "./components/doctor/DoctorCalendar";
import { PatientDetails } from "./components/doctor/PatientDetails";
import { DoctorProfile } from "./components/doctor/DoctorProfile";

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
    // (Tu 'checkAuth' useEffect está perfecto)
    const checkAuth = async () => {
      const token = storage.getAccessToken();
      if (token) {
        try {
          const user = await authService.getCurrentUser();
          setCurrentUser(user);
        } catch (err) { storage.clear(); }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    // (Tu 'handleLogin' está perfecto)
    setError(null);
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      setCurrentUser(response.user);
      setCurrentPage('inicio');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const handleRegister = async (data: any) => {
    // (Tu 'handleRegister' está perfecto)
    setError(null);
    setIsLoading(true);
    const registerData = {
      nombre: data.nombre,
      apellidos: data.apellidos,
      email: data.email,
      password: data.password,
      password_confirmation: data.password_confirmation,
    };
    try {
      const response = await authService.register(registerData as any); 
      setCurrentUser(response.user);
      setCurrentPage('inicio');
    } catch (error: any) {
      setError(error.message); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  if (!currentUser) {
    // (Tu lógica de login/register está perfecta)
    return (
      <div>
        {error && <div style={{ color: 'red', padding: '10px', background: '#ffeeee', textAlign: 'center' }}>{error}</div>}
        {authView === 'login' ? (
          <Login onLogin={handleLogin} onNavigateToRegister={() => { setError(null); setAuthView('register'); }} />
        ) : (
          <Register onRegister={handleRegister} onNavigateToLogin={() => { setError(null); setAuthView('login'); }} />
        )}
      </div>
    );
  }

  // --- (MODIFICADO) renderContent ---
  const renderContent = () => {
    // ROL PACIENTE
    if (currentUser.rol === 'paciente') {
      switch (currentPage) {
        case 'inicio':
          return <PatientDashboard onNavigate={handleNavigate} />;
        case 'citas':
          return <PatientAppointments onNavigate={handleNavigate} />;
        case 'reservar-cita':
          return <BookAppointment onNavigate={handleNavigate} user={currentUser} />;
        case 'calendario':
          return <PatientCalendar />;
        case 'historial':
          return <MedicalHistory />;
        case 'perfil':
          return <PatientProfile user={currentUser} />;
        default:
          return <PatientDashboard onNavigate={handleNavigate} />;
      }
    }

    // ROL MÉDICO
    if (currentUser.rol === 'medico') {
      switch (currentPage) {
        case 'inicio':
          return <DoctorDashboard onNavigate={handleNavigate} />;
        case 'citas':
          return <DoctorAppointments />;
        case 'calendario':
          return <DoctorCalendar />;
        case 'pacientes':
          return <PatientDetails onNavigate={handleNavigate} />;
        case 'perfil':
          return <DoctorProfile user={currentUser} />;
        default:
          return <DoctorDashboard onNavigate={handleNavigate} />;
      }
    }

    // ROL ADMIN
    if (currentUser.rol === 'admin') {
      switch (currentPage) {
        case 'inicio':
          return <AdminDashboard onNavigate={handleNavigate} />;
        case 'usuarios':
          return <UserManagement />; 
        
        // --- ¡CORREGIDO! ---
        case 'medicos': 
          return <DoctorManagement />; // <-- Carga el nuevo componente

        case 'citas':
          return <AppointmentManagement />; 
        case 'reportes':
          return <Reports />;
        case 'configuracion':
          return <Settings />;
        case 'perfil':
          return <div>Perfil de Admin (Próximamente)</div>;
        default:
          return <AdminDashboard onNavigate={handleNavigate} />;
      }
    }
    return null; // Fallback
  };

  return (
    <>
      <MainLayout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        user={currentUser}
        onRoleSwitch={() => {}} // (No se usa)
        onLogout={handleLogout} 
      >
        {renderContent()}
      </MainLayout>
      <Toaster />
    </>
  );
}