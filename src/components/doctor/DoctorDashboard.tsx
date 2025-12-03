import React, { useEffect } from 'react';
import { 
  Calendar, Users, Clock, AlertCircle, Loader2, FileText, ChevronRight, CheckCircle 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { StatCard } from "../shared/StatCard";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { useApi } from '../../hooks/useApi';
import { doctorService } from '../../services/doctors.service';
import { User } from "../../types"; 

interface DoctorDashboardProps {
  onNavigate: (page: string) => void;
  user: User | null; 
}

// [IMPORTANTE] export function (sin default) para que funcione con App.tsx
export function DoctorDashboard({ onNavigate, user }: DoctorDashboardProps) {
  
  const { data: dashboardData, isLoading, execute: fetchDashboard } = useApi(doctorService.getDashboardData);

  useEffect(() => { fetchDashboard(); }, []);

  const handleAppointmentAction = async (id: number, action: 'confirm' | 'reject') => {
    try {
      if (action === 'confirm') await doctorService.confirmAppointment(id);
      else await doctorService.rejectAppointment(id);
      fetchDashboard();
    } catch (error) { console.error("Error", error); }
  };

  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'Dr';
  
  const formatDate = (dateString: string) => {
    if (!dateString) return { date: '-', time: '-' };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (isLoading && !dashboardData) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-600"/></div>;
  }

  const stats = dashboardData?.stats || { appointments_today: 0, pending_appointments: 0, upcoming_appointments: 0, unique_patients_month: 0 };
  const doctorName = user?.name?.split(' ')[0] || 'Doctor';

  return (
    <div className="p-6 space-y-8 bg-gray-50/50 min-h-screen w-full">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel del Médico</h1>
          <p className="text-gray-600 mt-1 text-lg">
            Bienvenido, <span className="text-blue-700 font-semibold">Dr. {doctorName}</span>.
          </p>
        </div>
        <Button onClick={() => onNavigate('citas')} className="bg-blue-600 hover:bg-blue-700 shadow-md">
          <Calendar className="mr-2 h-4 w-4" /> Gestionar Agenda
        </Button>
      </div>

      {/* 2. STATS (Grid 4 columnas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Citas Hoy" value={stats.appointments_today} icon={<Calendar className="h-5 w-5 text-blue-500" />} description="Pacientes hoy" />
        <StatCard title="Pendientes" value={stats.pending_appointments} icon={<AlertCircle className="h-5 w-5 text-yellow-600" />} description="Por confirmar" />
        <StatCard title="Futuras" value={stats.upcoming_appointments} icon={<Clock className="h-5 w-5 text-purple-500" />} description="Próximos días" />
        <StatCard title="Pacientes" value={stats.unique_patients_month} icon={<Users className="h-5 w-5 text-green-500" />} description="Este mes" />
      </div>

      {/* 3. COLUMNAS PRINCIPALES (Agenda Izq / Pendientes Der) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        
        {/* AGENDA */}
        <Card className="shadow-sm border-gray-200 h-full">
          <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-gray-100">
            <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-blue-600" /><CardTitle className="text-lg font-semibold text-gray-800">Agenda de Hoy</CardTitle></div>
            <Button variant="ghost" onClick={() => onNavigate('calendario')} className="text-blue-600 h-8 text-sm hover:bg-blue-50">Ver Calendario <ChevronRight className="ml-1 h-4 w-4" /></Button>
          </CardHeader>
          <CardContent className="p-0">
            {!dashboardData?.today_appointments?.length ? (
              <div className="py-12 text-center text-gray-400 flex flex-col items-center gap-2 justify-center h-full">
                <Calendar className="h-10 w-10 opacity-20"/> Sin citas hoy
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {dashboardData.today_appointments.map((cita) => (
                  <div key={cita.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-bold font-mono">{formatDate(cita.appointment_date).time}</div>
                    <div><p className="font-semibold text-gray-900">{cita.patient?.first_name} {cita.patient?.last_name}</p><p className="text-xs text-gray-500">{cita.reason}</p></div>
                    <Badge variant="outline" className="ml-auto">{cita.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* PENDIENTES (TARJETA AMARILLA ESPECÍFICA) */}
        <Card className="shadow-md border-yellow-400 bg-yellow-50 h-full">
          <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-yellow-200 bg-yellow-100/50">
            <div className="flex items-center gap-2"><AlertCircle className="h-6 w-6 text-yellow-700" /><CardTitle className="text-lg font-bold text-gray-800">Solicitudes Pendientes</CardTitle></div>
            <Badge className="bg-yellow-400 text-yellow-900 border-yellow-500 font-bold px-3">{stats.pending_appointments}</Badge>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {!dashboardData?.pending_appointments?.length ? (
              <div className="py-12 text-center flex flex-col items-center justify-center h-full"><CheckCircle className="h-12 w-12 text-green-600 mb-2 opacity-60" /><p className="text-gray-700 font-medium">¡Todo al día!</p></div>
            ) : (
              dashboardData.pending_appointments.map((cita) => (
                <div key={cita.id} className="bg-white border border-yellow-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 bg-yellow-100 border border-yellow-200"><AvatarFallback className="text-yellow-800 text-xs font-bold">{getInitials(cita.patient?.first_name || '')}</AvatarFallback></Avatar>
                      <div><p className="font-bold text-gray-900 text-sm">{cita.patient?.first_name} {cita.patient?.last_name}</p><p className="text-xs text-gray-600 mt-1 flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(cita.appointment_date).date} - {formatDate(cita.appointment_date).time}</p></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 h-8 text-xs bg-gray-900 text-white hover:bg-black font-medium" onClick={() => handleAppointmentAction(cita.id, 'confirm')}>Confirmar</Button>
                    <Button variant="outline" className="flex-1 h-8 text-xs text-red-600 border-red-200 hover:bg-red-50 font-medium" onClick={() => handleAppointmentAction(cita.id, 'reject')}>Rechazar</Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* 4. PACIENTES RECIENTES */}
      <div className="pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Users className="h-6 w-6 text-gray-500"/> Pacientes Recientes</h2>
          <Button variant="outline" size="sm" onClick={() => onNavigate('pacientes')}>Ver Todos</Button>
        </div>
        
        {!dashboardData?.recent_patients?.length ? (
           <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 text-gray-400">No hay pacientes recientes</div>
        ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardData.recent_patients.slice(0, 4).map(p => (
                 <Card key={p.id} className="hover:shadow-lg transition-all border-gray-200 group cursor-pointer" onClick={() => onNavigate('pacientes')}>
                    <CardContent className="pt-8 pb-8 text-center flex flex-col items-center">
                       <Avatar className="h-16 w-16 mb-4 bg-blue-50 text-blue-600 border-4 border-white shadow-md group-hover:scale-105 transition-transform"><AvatarFallback className="text-xl font-bold">{getInitials(p.first_name)}</AvatarFallback></Avatar>
                       <p className="font-bold text-gray-900 truncate w-full px-2 text-lg">{p.first_name} {p.last_name}</p>
                       <p className="text-sm text-gray-500 mb-4 capitalize">{p.gender === 'male' ? 'Masculino' : 'Femenino'}</p>
                       <Button variant="outline" size="sm" className="w-full h-9 text-xs font-medium hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"><FileText className="h-3 w-3 mr-2"/> Ver Historial</Button>
                    </CardContent>
                 </Card>
              ))}
           </div>
        )}
      </div>
    </div>
  );
}