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
    return new Date(dateString).toLocaleTimeString('es-ES', { 
      hour: '2-digit', minute: '2-digit' 
    });
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
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      
      {/* Header con próxima cita */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inicio</h1>
          <p className="text-sm text-gray-500 mt-1">Bienvenido a tu panel de paciente</p>
        </div>
        <Button 
          onClick={() => onNavigate('reservar-cita')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Reservar Cita
        </Button>
      </div>

      {/* Banner de próxima cita */}
      {stats?.proxima_cita && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-center gap-3">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-gray-700">
              <span className="font-medium">Próxima cita:</span> {stats.proxima_cita.medico.nombre_completo} - {formatShortDate(stats.proxima_cita.fecha_hora_inicio)} a las {formatTime(stats.proxima_cita.fecha_hora_inicio)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Citas Programadas</p>
                <h2 className="text-4xl font-bold text-gray-900">{stats?.resumen.citas_programadas || 0}</h2>
                <p className="text-xs text-gray-400 mt-1">Próximas citas activas</p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Historial</p>
                <h2 className="text-4xl font-bold text-gray-900">{stats?.resumen.historial_completado || 0}</h2>
                <p className="text-xs text-gray-400 mt-1">Consultas completadas</p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Este Mes</p>
                <h2 className="text-4xl font-bold text-gray-900">0</h2>
                <p className="text-xs text-gray-400 mt-1">Citas en el mes actual</p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sección Próximas Citas */}
      {proximasCitas.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Próximas Citas</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {proximasCitas.map((cita) => {
              const especialidad = cita.especialidad || 
                                 (typeof cita.medico?.especialidad === 'object' 
                                   ? cita.medico?.especialidad?.nombre 
                                   : cita.medico?.especialidad) || 
                                 "General";
              
              return (
                <Card key={cita.id} className="border-0 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {cita.medico?.nombre_completo || cita.medico?.nombre || "Médico Asignado"}
                        </h3>
                        <p className="text-sm text-blue-600">{especialidad}</p>
                      </div>
                      <Badge className="bg-black text-white hover:bg-black capitalize">
                        {cita.estado}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatShortDate(cita.fecha_hora_inicio)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(cita.fecha_hora_inicio)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{cita.motivo_consulta || "Consulta general"}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <Button variant="outline" className="w-full" onClick={() => onNavigate('citas')}>
                        Reprogramar
                      </Button>
                      <Button variant="outline" className="w-full">
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Card 
            className="border-0 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onNavigate('citas')}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Ver Todas las Citas</h3>
                <p className="text-sm text-gray-500">Gestiona tus citas</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onNavigate('historial')}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Historial Médico</h3>
                <p className="text-sm text-gray-500">Consulta tu historial</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onNavigate('calendario')}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Calendario</h3>
                <p className="text-sm text-gray-500">Vista de calendario</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

    </div>
  );
}
