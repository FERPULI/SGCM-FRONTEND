import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  Calendar as CalendarIcon, Clock, User, Activity, 
  ChevronRight, Plus, FileText, Loader2, MapPin, Stethoscope
} from "lucide-react";
import { patientService } from '../../services/patient.service';
import { PatientDashboardStats } from '../../types';
import { toast } from 'sonner';

interface PatientDashboardProps {
  onNavigate: (page: string) => void;
}

export function PatientDashboard({ onNavigate }: PatientDashboardProps) {
  const [stats, setStats] = useState<PatientDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        const data = await patientService.getDashboard();
        console.log("Dashboard Data:", data); // Debug para verificar
        setStats(data);
      } catch (error) {
        toast.error("Error al cargar el resumen");
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, []);

  // --- HELPERS SEGUROS ---
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', { 
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('es-ES', { 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  // Helper para obtener el nombre de la especialidad de forma segura
  const getSpecialtyName = () => {
    if (!stats?.proxima_cita?.medico) return "General";
    
    // Si viene como objeto (según tu JSON actual)
    if (typeof stats.proxima_cita.medico.especialidad === 'object') {
      return stats.proxima_cita.medico.especialidad.nombre;
    }
    // Si viniera como string (por si acaso)
    return stats.proxima_cita.medico.especialidad || "General";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-600" />
        <p>Cargando tu resumen...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 min-h-screen bg-gray-50/50">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Bienvenido de nuevo</h1>
          <p className="text-gray-500 mt-1">Aquí tienes el resumen de tu salud hoy.</p>
        </div>
        <Button 
          onClick={() => onNavigate('reservar-cita')}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 rounded-full px-6 transition-all"
        >
          <Plus className="h-5 w-5 mr-2" /> Nueva Cita
        </Button>
      </div>

      {/* --- TARJETAS DE RESUMEN --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Próximas Citas */}
        <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white rounded-2xl overflow-hidden group cursor-pointer" onClick={() => onNavigate('citas')}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Citas Pendientes</p>
              <h3 className="text-3xl font-bold text-blue-600 group-hover:scale-110 transition-transform origin-left">
                {stats?.resumen.citas_programadas || 0}
              </h3>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <CalendarIcon className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Historial */}
        <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white rounded-2xl overflow-hidden group cursor-pointer" onClick={() => onNavigate('historial')}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Historial</p>
              <h3 className="text-3xl font-bold text-green-600 group-hover:scale-110 transition-transform origin-left">
                {stats?.resumen.historial_completado || 0}
              </h3>
            </div>
            <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <Activity className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Accesos Rápidos (Decorativo para completar el grid) */}
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl overflow-hidden text-white col-span-1 md:col-span-2 relative">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-white/10 skew-x-12 transform origin-bottom-right"></div>
          <CardContent className="p-6 relative z-10 flex flex-col justify-center h-full">
            <h3 className="font-bold text-xl mb-1">¿Necesitas ayuda?</h3>
            <p className="text-blue-100 text-sm mb-4">Contacta con soporte o revisa las preguntas frecuentes.</p>
            <Button variant="secondary" size="sm" className="w-fit bg-white/20 hover:bg-white/30 border-0 text-white backdrop-blur-sm">
              Ver Ayuda
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* --- SECCIÓN PRINCIPAL: PRÓXIMA CITA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Tarjeta de Próxima Cita */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Tu Próxima Cita</h2>
            <Button variant="link" className="text-blue-600 p-0 hover:no-underline group" onClick={() => onNavigate('citas')}>
              Ver todas <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {stats?.proxima_cita ? (
            <Card className="border-none shadow-lg shadow-blue-100/50 bg-white rounded-3xl overflow-hidden hover:shadow-xl transition-shadow relative group">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  
                  {/* Fecha (Columna Izquierda) */}
                  <div className="bg-blue-50/50 p-8 flex flex-col justify-center items-center md:items-start min-w-[200px] border-r border-blue-100">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 uppercase tracking-wide mb-3">
                      {stats.proxima_cita.estado}
                    </span>
                    <h3 className="text-4xl font-bold text-blue-900 mb-1">
                      {new Date(stats.proxima_cita.fecha_hora_inicio).getDate()}
                    </h3>
                    <p className="text-lg font-medium text-blue-600 capitalize mb-4">
                      {new Date(stats.proxima_cita.fecha_hora_inicio).toLocaleDateString('es-ES', { month: 'long' })}
                    </p>
                    <div className="flex items-center gap-2 text-gray-600 bg-white px-4 py-2 rounded-xl shadow-sm">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="font-bold">{formatTime(stats.proxima_cita.fecha_hora_inicio)}</span>
                    </div>
                  </div>

                  {/* Detalles (Columna Derecha) */}
                  <div className="p-8 flex-1 flex flex-col justify-center">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
                        <User className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Médico Tratante</p>
                        <h3 className="text-xl font-bold text-gray-900">
                          {stats.proxima_cita.medico.nombre_completo}
                        </h3>
                        <div className="flex items-center gap-2 text-blue-600 mt-1">
                          <Stethoscope className="h-4 w-4" />
                          <span className="font-medium text-sm">
                            {getSpecialtyName()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-2xl">
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Motivo</p>
                        <p className="text-gray-700 font-medium text-sm line-clamp-2">
                          "{stats.proxima_cita.motivo_consulta}"
                        </p>
                      </div>
                      
                      {/* Botones de Acción Rápida */}
                      <div className="flex items-center gap-2">
                        <Button className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 shadow-sm rounded-xl h-full">
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-50 border-dashed border-2 border-gray-200 rounded-2xl p-8 text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <CalendarIcon className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No tienes citas próximas</h3>
              <p className="text-gray-500 mt-1 mb-6">Tu agenda está libre por ahora.</p>
              <Button onClick={() => onNavigate('reservar-cita')} variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                Agendar ahora
              </Button>
            </Card>
          )}
        </div>

        {/* --- PANEL LATERAL: ACTIVIDAD RECIENTE --- */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Actividad</h2>
          <Card className="border-none shadow-md bg-white rounded-3xl h-full">
            <CardContent className="p-6">
              <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:h-full before:w-0.5 before:bg-gray-100 pl-6">
                {/* Item 1 */}
                <div className="relative">
                  <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-white"></div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Hoy</p>
                  <p className="text-sm text-gray-600">Has iniciado sesión en el portal.</p>
                </div>
                {/* Item 2 */}
                <div className="relative">
                  <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-green-500 ring-4 ring-white"></div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Resumen</p>
                  <p className="text-sm text-gray-600">Tienes <strong>{stats?.resumen.citas_programadas}</strong> citas pendientes.</p>
                </div>
                {/* Item 3 */}
                <div className="relative">
                  <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-gray-300 ring-4 ring-white"></div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Recordatorio</p>
                  <p className="text-sm text-gray-600">Recuerda llegar 15 minutos antes de tu próxima cita.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}