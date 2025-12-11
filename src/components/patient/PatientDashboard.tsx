import { useState, useEffect } from 'react';
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  Calendar as CalendarIcon, Clock, FileText, Loader2
} from "lucide-react";
import { patientService } from '../../services/patient.service';
import { PatientDashboardStats, Appointment } from '../../types';
import { toast } from 'sonner';

interface PatientDashboardProps {
  onNavigate: (page: string) => void;
}

export function PatientDashboard({ onNavigate }: PatientDashboardProps) {
  const [stats, setStats] = useState<PatientDashboardStats | null>(null);
  const [proximasCitas, setProximasCitas] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        const [dashboardData, citasData] = await Promise.all([
          patientService.getDashboard(),
          patientService.getMyAppointments()
        ]);
        
        setStats(dashboardData);
        
        // Filtrar y obtener las próximas 2 citas (pendientes/activas/programadas)
        const ahora = new Date();
        const citasFuturas = citasData
          .filter(cita => {
            const fechaCita = new Date(cita.fecha_hora_inicio);
            const estadosValidos = ['programada', 'pendiente', 'confirmada', 'activa'];
            return fechaCita >= ahora && estadosValidos.includes(cita.estado);
          })
          .sort((a, b) => new Date(a.fecha_hora_inicio).getTime() - new Date(b.fecha_hora_inicio).getTime())
          .slice(0, 2);
        
        setProximasCitas(citasFuturas);
      } catch (error) {
        toast.error("Error al cargar el resumen");
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const formatShortDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', month: 'long', year: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '-';
    // Extraer la hora directamente del string sin conversión de zona horaria
    const timePart = dateString.includes('T') ? dateString.split('T')[1] : dateString.split(' ')[1];
    if (!timePart) return '-';
    
    // Extraer HH:MM de "HH:MM:SS" o "HH:MM:SS.000000Z"
    const [hours, minutes] = timePart.split(':');
    return `${hours}:${minutes}`;
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
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Inicio</h1>
          <p className="text-xs text-gray-500 mt-0.5">Bienvenido a tu panel de paciente</p>
        </div>
        <Button 
          onClick={() => onNavigate('reservar-cita')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-lg h-9 font-medium"
        >
          + Reservar Cita
        </Button>
      </div>

      {/* Banner de próxima cita */}
      {stats?.proxima_cita && (
        <Card className="bg-blue-50 border border-blue-100 shadow-sm">
          <CardContent className="p-3 flex items-center gap-2.5">
            <CalendarIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <p className="text-xs text-gray-700">
              <span className="font-semibold">Próxima cita:</span> {stats.proxima_cita.medico.nombre_completo} - {formatShortDate(stats.proxima_cita.fecha_hora_inicio)} a las {formatTime(stats.proxima_cita.fecha_hora_inicio)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <Card className="border border-gray-200 shadow-sm bg-white rounded-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600 mb-1">Citas Programadas</p>
                <h2 className="text-2xl font-bold text-gray-900 mb-0.5">{stats?.resumen.citas_programadas || 0}</h2>
                <p className="text-[10px] text-gray-500">Próximas citas activas</p>
              </div>
              <div className="h-9 w-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm bg-white rounded-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600 mb-1">Historial</p>
                <h2 className="text-2xl font-bold text-gray-900 mb-0.5">{stats?.resumen.historial_completado || 0}</h2>
                <p className="text-[10px] text-gray-500">Consultas completadas</p>
              </div>
              <div className="h-9 w-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm bg-white rounded-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600 mb-1">Este Mes</p>
                <h2 className="text-2xl font-bold text-gray-900 mb-0.5">0</h2>
                <p className="text-[10px] text-gray-500">Citas en el mes actual</p>
              </div>
              <div className="h-9 w-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sección Próximas Citas */}
      {proximasCitas.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-3">Próximas Citas</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {proximasCitas.map((cita) => {
              const especialidad = cita.especialidad || 
                                 (typeof cita.medico?.especialidad === 'object' 
                                   ? cita.medico?.especialidad?.nombre 
                                   : cita.medico?.especialidad) || 
                                 "General";
              
              return (
                <Card key={cita.id} className="border border-gray-200 shadow-sm bg-white rounded-lg">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2.5">
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-900 leading-tight">
                          {cita.medico?.nombre_completo || cita.medico?.nombre || "Médico Asignado"}
                        </h3>
                        <p className="text-xs text-blue-600 font-medium mt-0.5">{especialidad}</p>
                      </div>
                      <Badge className="bg-black text-white hover:bg-black capitalize text-[10px] px-2 py-0.5">
                        {cita.estado}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-xs">{formatShortDate(cita.fecha_hora_inicio)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-xs">{formatTime(cita.fecha_hora_inicio)}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <FileText className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs line-clamp-2">{cita.motivo_consulta || "Consulta general"}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full text-xs h-8 border-gray-300" 
                        onClick={() => onNavigate('citas')}
                      >
                        Reprogramar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full text-xs h-8 border-gray-300"
                        onClick={() => onNavigate('citas')}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Accesos Rápidos */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <Card 
            className="border border-gray-200 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow rounded-lg"
            onClick={() => onNavigate('citas')}
          >
            <CardContent className="p-4 flex items-center gap-2.5">
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900">Ver Todas las Citas</h3>
                <p className="text-[10px] text-gray-500">Gestiona tus citas</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border border-gray-200 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow rounded-lg"
            onClick={() => onNavigate('historial')}
          >
            <CardContent className="p-4 flex items-center gap-2.5">
              <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900">Historial Médico</h3>
                <p className="text-[10px] text-gray-500">Consulta tu historial</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border border-gray-200 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow rounded-lg"
            onClick={() => onNavigate('calendario')}
          >
            <CardContent className="p-4 flex items-center gap-2.5">
              <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <CalendarIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900">Calendario</h3>
                <p className="text-[10px] text-gray-500">Vista de calendario</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

    </div>
  );
}
