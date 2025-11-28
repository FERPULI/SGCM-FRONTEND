import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { StatCard } from "../shared/StatCard"; // (Asegúrate de tener este componente)
import { Users, Calendar, UserCog, Activity, TrendingUp, AlertCircle } from "lucide-react";
// --- (MODIFICADO) Importa los tipos corregidos ---
import { AdminDashboardStats, RecentAppointment, AppointmentStatus, MedicoData } from "../../types"; // (MedicoData añadido)
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
// --- (MODIFICADO) Solo importa reportsService ---
import { reportsService } from '../../services/reports.service';
import { handleApiError } from '../../services/http';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

// --- (NUEVO) Funciones Helper para Formatear Fecha/Hora ---
const formatDate = (isoString: string) => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatTime = (isoString: string) => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// --- (NUEVO) Función Helper para la insignia (Badge) ---
const getStatusVariant = (status: AppointmentStatus): "default" | "secondary" | "outline" | "destructive" => {
  switch (status) {
    case 'completada':
      return 'outline';
    case 'confirmada':
    case 'activa': // (Asumiendo que 'activa' es 'default')
      return 'default';
    case 'programada':
    case 'pendiente':
      return 'secondary';
    case 'cancelada':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  
  // --- Estados ---
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Carga de Datos (MODIFICADO) ---
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 4. (MODIFICADO) Llama a UN SOLO servicio
        const statsData = await reportsService.getDashboardStats();
        setStats(statsData);

      } catch (err: any) {
        const errorMsg = handleApiError(err);
        setError(errorMsg);
        toast.error("Error al cargar el dashboard", { description: errorMsg });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []); // El [] significa que se ejecuta solo una vez

  // --- Renderizado de Carga y Error ---
  if (isLoading) {
    return <div className="p-6">Cargando panel de administración...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-500">Error al cargar el dashboard: {error}</div>;
  }
  if (!stats) {
     return <div className="p-6">No se pudieron cargar las estadísticas.</div>;
  }

  // --- Renderizado Principal (JSX) ---
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl">Panel de Administración</h1>
        <p className="text-gray-500 mt-1">Vista general del sistema de gestión de citas</p>
      </div>

      {/* Stats Cards (usando camelCase) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Pacientes"
          value={stats.totalPacientes}
          icon={Users}
          description="Pacientes registrados"
          trend={`+${stats.nuevosUsuarios} este mes`}
        />
        <StatCard
          title="Total Médicos"
          value={stats.totalMedicos}
          icon={UserCog}
          description="Médicos activos"
        />
        <StatCard
          title="Citas Hoy"
          value={stats.citasHoy}
          icon={Calendar}
          description="Programadas para hoy"
        />
        <StatCard
          title="Pendientes"
          value={stats.citasPendientes}
          icon={AlertCircle}
          description="Requieren atención"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Actividad del Sistema</CardTitle>
              <Button variant="outline" size="sm" onClick={() => onNavigate('reportes')}>
                Ver Reporte
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Citas Completadas</p>
                  {/* --- ¡AQUÍ ESTÁ LA CORRECCIÓN! --- */}
                  <p className="text-2xl">{stats.citasCompletadas}</p>
                </div>
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tasa de Completación</span>
                  <span>{stats.tasaCompletacion.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${stats.tasaCompletacion}%` }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tasa de Cancelación</span>
                  <span>{stats.tasaCancelacion.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: `${stats.tasaCancelacion}%` }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total de Citas</p>
                    <p className="text-xl">{stats.totalCitas}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Citas Este Mes</p>
                    <p className="text-xl">{stats.citasEsteMes}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nuevos Pacientes (Mes)</p>
                    <p className="text-xl">{stats.nuevosUsuarios}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Citas Recientes</CardTitle>
            <Button variant="outline" size="sm" onClick={() => onNavigate('citas')}>
              Ver Todas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Médico</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* (MODIFICADO) Lee de 'stats.citasRecientes' */}
                {stats.citasRecientes.length > 0 ? (
                  stats.citasRecientes.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>{appointment.paciente.nombre_completo}</TableCell>
                      
                      {/* --- ¡CORRECCIÓN CLAVE! --- */}
                      <TableCell>
                        {/* Comprueba si 'nombre_completo' es un string o un objeto */}
                        {typeof appointment.medico.nombre_completo === 'string' 
                          ? appointment.medico.nombre_completo 
                          : 'Error de API (Médico)'}
                      </TableCell>
                      {/* --- FIN DE LA CORRECCIÓN --- */}
                      
                      <TableCell>
                        {formatDate(appointment.fecha_hora_inicio)}
                      </TableCell>
                      <TableCell>
                        {formatTime(appointment.fecha_hora_inicio)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(appointment.estado)} className="capitalize">
                          {appointment.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No hay citas recientes.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}