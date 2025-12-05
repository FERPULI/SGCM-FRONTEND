import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Users, 
  Clock, 
  AlertCircle, 
  Loader2, 
  CalendarDays,
  ChevronRight
} from "lucide-react";
import { doctorService } from '../../services/doctors.service';
import { DoctorDashboardData } from "../../types"; 
import { useAuth } from '../../hooks/useAuth';

// --- COMPONENTES UI ---
const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>
    {children}
  </div>
);

const Button = ({ onClick, children, variant = 'primary', className = "", fullWidth = false }: any) => {
  const baseStyle = "px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none transition-all duration-200";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow",
    white: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm",
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant as keyof typeof variants] || variants.primary} ${fullWidth ? 'w-full' : ''} ${className}`}>
      {children}
    </button>
  );
};

const StatCard = ({ label, value, subtext, icon: Icon }: any) => (
  <Card className="p-6 flex flex-col justify-between h-36 relative hover:border-blue-300 transition-colors cursor-default group">
    <div className="flex justify-between items-start mb-2">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <Icon className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors" strokeWidth={1.5} />
    </div>
    <div className="mt-auto">
      <span className="text-3xl font-semibold text-gray-900 block tracking-tight">{value}</span>
      <span className="text-xs text-gray-400 mt-1 block">{subtext}</span>
    </div>
  </Card>
);

export function DoctorDashboard({ onNavigate = () => {} }: { onNavigate?: any }) {
  
  // 1. OBTENER USUARIO DESDE EL HOOK
  const { user } = useAuth();
  
  // DEBUG: Esto mostrará en la consola del navegador (F12) qué datos están llegando exactamente.
  console.log("DATOS USUARIO DASHBOARD:", user);

  const [dashboardData, setDashboardData] = useState<DoctorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 2. LÓGICA EXTENDIDA PARA ENCONTRAR EL NOMBRE
  // A veces el usuario viene anidado (user.user) o directo (user).
  const targetUser = (user as any)?.user || (user as any)?.data || user;

  // Buscamos NOMBRE (varias opciones)
  const rawName = targetUser?.nombre || targetUser?.name || targetUser?.first_name || targetUser?.nombres || '';
  
  // Buscamos APELLIDOS (varias opciones)
  const rawLast = targetUser?.apellidos || targetUser?.last_name || targetUser?.apellido || '';

  // Prefijo Dr.
  const role = (targetUser?.rol || targetUser?.role || '').toLowerCase();
  const isDoc = role.includes('medico') || role.includes('doctor');
  const prefix = isDoc ? 'Dr.' : '';

  // Construimos el nombre final
  const fullName = `${prefix} ${rawName} ${rawLast}`.trim();


  // 3. HELPER PARA NOMBRE DE PACIENTES (Igual lógica)
  const getPatientName = (p: any) => {
    if (!p) return 'Paciente';
    const n = p.nombre || p.name || p.first_name || p.nombres || '';
    const l = p.apellidos || p.last_name || p.apellido || '';
    return `${n} ${l}`.trim() || 'Sin Nombre';
  };

  useEffect(() => { 
    const fetchData = async () => {
        try {
            const data = await doctorService.getDashboardData();
            setDashboardData(data);
        } catch (error) {
            console.error("Error dashboard:", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, []);

  const stats = dashboardData?.stats || { appointments_today: 0, pending_appointments: 0, upcoming_appointments: 0, unique_patients_month: 0 };
  const pendingApps = dashboardData?.pending_appointments || [];
  const todayApps = dashboardData?.today_appointments || [];
  const recentPatients = dashboardData?.recent_patients || [];

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600"/>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen w-full font-sans text-slate-800">
      
      {/* HEADER CORREGIDO */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Panel del Médico</h1>
        <p className="text-gray-500 mt-1 text-sm flex items-center flex-wrap gap-1">
          Bienvenido
          
          {/* Si tenemos nombre, lo mostramos. Si no, mostramos un fallback para saber que cargó */}
          {fullName ? (
             <span className="text-blue-600 font-bold">, {fullName},</span> 
          ) : (
             <span className="text-blue-600 font-bold">, Doctor,</span>
          )}
          
          gestiona tus citas y pacientes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Citas Hoy" value={stats.appointments_today} subtext="0 completadas" icon={Calendar} />
        <StatCard label="Pendientes" value={stats.pending_appointments} subtext="Requieren confirmación" icon={AlertCircle} />
        <StatCard label="Próximas Citas" value={stats.upcoming_appointments} subtext="Total programadas" icon={Clock} />
        <StatCard label="Pacientes Únicos" value={stats.unique_patients_month} subtext="Este mes" icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AGENDA */}
        <Card className="flex flex-col min-h-[320px]">
            <div className="p-6 flex justify-between items-center border-b border-gray-50">
                <h2 className="text-base font-bold text-gray-800">Agenda de Hoy</h2>
                <Button variant="white" onClick={() => onNavigate('calendario')} className="text-xs py-1.5 h-8">Ver Calendario</Button>
            </div>
            <div className="flex-1 p-6">
                {todayApps.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center pb-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4"><CalendarDays className="w-8 h-8 text-gray-300" strokeWidth={1.5} /></div>
                    <p className="text-gray-400 font-medium text-sm">No hay citas programadas para hoy</p>
                </div>
                ) : (
                <div className="space-y-3">
                    {todayApps.map((cita: any) => (
                    <div key={cita.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100 group">
                        <div className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg font-bold text-xs mr-4 text-center min-w-[60px]">
                            {new Date(cita.appointment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div>
                            {/* NOMBRE PACIENTE CORREGIDO */}
                            <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                                {getPatientName(cita.patient)}
                            </p>
                            <p className="text-xs text-gray-500">{cita.reason || 'Consulta General'}</p>
                        </div>
                        <div className="ml-auto"><ChevronRight className="w-4 h-4 text-gray-300" /></div>
                    </div>
                    ))}
                </div>
                )}
            </div>
        </Card>

        {/* PENDIENTES */}
        <Card className="flex flex-col min-h-[320px]">
            <div className="p-6 flex justify-between items-center border-b border-gray-50">
                <h2 className="text-base font-bold text-gray-800">Citas Pendientes</h2>
                {pendingApps.length > 0 && <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-md">{pendingApps.length}</span>}
            </div>
            <div className="flex-1 p-6 overflow-y-auto max-h-[320px]">
                {pendingApps.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 pb-4"><p className="text-sm">No hay solicitudes pendientes</p></div>
                ) : (
                <div className="space-y-4">
                     {pendingApps.map((cita) => (
                         <div key={cita.id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-yellow-200 transition-colors">
                             <div>
                                {/* NOMBRE PACIENTE CORREGIDO */}
                                <h4 className="font-bold text-gray-900 text-sm mb-1">
                                    {getPatientName(cita.patient)}
                                </h4>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(cita.appointment_date).toLocaleDateString()}
                                </p>
                             </div>
                             <div className="flex items-center gap-2 w-full sm:w-auto">
                                 <Button variant="primary" className="flex-1 sm:flex-none text-xs h-8 px-3 bg-blue-600 hover:bg-blue-700">Confirmar</Button>
                                 <Button variant="white" className="flex-1 sm:flex-none text-xs h-8 px-3 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-100">Rechazar</Button>
                             </div>
                          </div>
                     ))}
                </div>
                )}
            </div>
        </Card>
      </div>
      
      {/* RECIENTES */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-gray-800">Pacientes Recientes</h2>
            <Button variant="white" onClick={() => onNavigate('pacientes')} className="text-xs h-8">Ver Todos</Button>
        </div>
        {recentPatients.length === 0 ? (
            <div className="text-center py-8"><p className="text-gray-400 text-sm">No hay historial reciente.</p></div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recentPatients.map((patient) => (
                    <div key={patient.id} className="border border-gray-100 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow group bg-white cursor-pointer">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm uppercase group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                {getPatientName(patient).charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                {/* NOMBRE PACIENTE CORREGIDO */}
                                <h3 className="font-bold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                                    {getPatientName(patient)}
                                </h3>
                                <p className="text-xs text-gray-500 truncate">Paciente recurrente</p>
                            </div>
                    </div>
                ))}
            </div>
        )}
      </Card>
    </div>
  );
}