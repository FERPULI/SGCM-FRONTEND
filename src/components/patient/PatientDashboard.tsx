import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Calendar, Clock, FileText, Plus, User } from "lucide-react";
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
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await patientService.getDashboard();
        setStats(data);
      } catch (error) {
        toast.error("No se pudo cargar la información del panel.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Cargando tu panel...</div>;
  }

  if (!stats) return null;

  // Helper para formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Helper para formatear hora
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Inicio</h1>
          <p className="text-gray-500">Bienvenido a tu panel de paciente</p>
        </div>
        <Button 
          onClick={() => onNavigate('reservar-cita')}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
        >
          <Plus className="mr-2 h-4 w-4" /> Reservar Cita
        </Button>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card: Citas Programadas */}
        <Card className="shadow-sm border-gray-100 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Citas Programadas</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-bold text-gray-900">{stats.resumen.citas_programadas}</h3>
                  <Clock className="h-4 w-4 text-gray-400 translate-y-[-2px]" />
                </div>
                <p className="text-sm text-gray-400">Próximas citas activas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Historial */}
        <Card className="shadow-sm border-gray-100 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Historial</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-bold text-gray-900">{stats.resumen.historial_completado}</h3>
                  <FileText className="h-4 w-4 text-gray-400 translate-y-[-2px]" />
                </div>
                <p className="text-sm text-gray-400">Consultas completadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sección Próximas Citas */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Próximas Citas</h2>
        
        <Card className="shadow-sm border-gray-200 min-h-[250px] flex flex-col justify-center">
          <CardContent className="p-0">
            {stats.proxima_cita ? (
              // --- CASO 1: HAY CITA PROGRAMADA ---
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-blue-50/50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-start gap-4">
                    <div className="bg-white p-3 rounded-full shadow-sm border border-blue-100">
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">
                        {formatDate(stats.proxima_cita.fecha_hora_inicio)}
                      </h4>
                      <p className="text-blue-600 font-medium text-md flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(stats.proxima_cita.fecha_hora_inicio)}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-gray-600 bg-white/60 px-3 py-1 rounded-full w-fit text-sm border border-blue-100/50">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>Dr. {stats.proxima_cita.medico.nombre_completo}</span>
                        <span className="text-gray-300">|</span>
                        <span className="font-medium text-gray-700">{stats.proxima_cita.medico.especialidad}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => onNavigate('citas')}>
                    Ver Detalles
                  </Button>
                </div>
              </div>
            ) : (
              // --- CASO 2: ESTADO VACÍO (Como tu imagen) ---
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-gray-50 p-4 rounded-2xl mb-4 border border-gray-100">
                  <Calendar className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No tienes citas programadas</h3>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto mb-6 text-sm">
                  No hay citas activas en este momento. Reserva una nueva cita con nuestros especialistas para comenzar.
                </p>
                <Button variant="outline" onClick={() => onNavigate('reservar-cita')}>
                  Reservar una cita
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}