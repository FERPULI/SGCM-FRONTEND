// src/components/admin/AdminDashboard.tsx

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Users, Calendar, UserCog, Activity, TrendingUp, AlertCircle, CheckCircle2, Stethoscope, Clock, FileText, UserPlus, Loader2 } from "lucide-react";
import { AdminDashboardStats, AppointmentStatus } from "../../types"; 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { reportsService } from '../../services/reports.service';
import { handleApiError } from '../../services/http';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

// --- Funciones Helper ---
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

const getStatusVariant = (status: AppointmentStatus): "default" | "secondary" | "outline" | "destructive" => {
  switch (status) {
    case 'completada': return 'outline';
    case 'confirmada':
    case 'activa': return 'default';
    case 'programada':
    case 'pendiente': return 'secondary';
    case 'cancelada': return 'destructive';
    default: return 'secondary';
  }
};

// --- COMPONENTE PRINCIPAL ---
export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      console.log("🔄 Iniciando carga del Dashboard...");
      try {
        setIsLoading(true);
        setError(null);
        
        const statsData = await reportsService.getDashboardStats();
        console.log("✅ Datos recibidos del Dashboard:", statsData);
        setStats(statsData);

      } catch (err) {
        console.error("❌ Error cargando estadísticas:", err);
        const errorMsg = handleApiError(err);
        setError(errorMsg);
        toast.error(`Error: ${errorMsg}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-gray-500 text-sm">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">Error al cargar el dashboard: {error}</div>;
  }

  if (!stats) {
    return <div className="p-6">No se pudieron cargar las estadísticas.</div>;
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Panel de Administración</h1>
        <p className="text-gray-500 mt-1">Vista general del sistema de gestión de citas</p>
      </div>

      {/* KPI CARDS (FILA 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardComponent 
          title="Total Pacientes" 
          value={stats.totalPacientes} 
          icon={Users} 
          subtext="Pacientes registrados"
          colorIcon="text-blue-600"
          bgIcon="bg-blue-100"
          trend={stats.nuevosUsuarios > 0 ? `+${stats.nuevosUsuarios} este mes` : undefined}
        />
        <StatCardComponent 
          title="Total Médicos" 
          value={stats.totalMedicos} 
          icon={Stethoscope} 
          subtext="Médicos activos"
          colorIcon="text-indigo-600"
          bgIcon="bg-indigo-100"
        />
        <StatCardComponent 
          title="Citas Hoy" 
          value={stats.citasHoy} 
          icon={Calendar} 
          subtext="Programadas para hoy"
          colorIcon="text-emerald-600"
          bgIcon="bg-emerald-100"
        />
        <StatCardComponent 
          title="Pendientes" 
          value={stats.citasPendientes} 
          icon={Clock} 
          subtext="Requieren atención"
          colorIcon="text-orange-600"
          bgIcon="bg-orange-100"
        />
      </div>

      {/* PANELES DETALLE (FILA 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PANEL IZQUIERDO: ACTIVIDAD */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Actividad del Sistema</CardTitle>

            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-500">Citas Completadas</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.citasCompletadas}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>

            <div className="space-y-5">
              {/* Tasa Completación */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Tasa de Completación</span>
                  </div>
                  <span className="font-bold text-gray-900">{stats.tasaCompletacion.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-green-500 h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${stats.tasaCompletacion}%` }}
                  ></div>
                </div>
              </div>

              {/* Tasa Cancelación */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Tasa de Cancelación</span>
                  </div>
                  <span className="font-bold text-gray-900">{stats.tasaCancelacion.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-red-500 h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${stats.tasaCancelacion}%` }}
                  ></div>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* PANEL DERECHO: ESTADÍSTICAS RÁPIDAS */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-700">Estadísticas Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <QuickStatItem 
              icon={FileText} 
              label="Total Histórico de Citas" 
              value={stats.totalCitas} 
              color="text-blue-600"
              bg="bg-blue-100"
            />
            <QuickStatItem 
              icon={TrendingUp} 
              label="Citas este Mes" 
              value={stats.citasEsteMes} 
              color="text-purple-600"
              bg="bg-purple-100"
            />
            <QuickStatItem 
              icon={UserPlus} 
              label="Nuevos Usuarios (Mes)" 
              value={stats.nuevosUsuarios} 
              color="text-orange-600"
              bg="bg-orange-100"
            />
          </CardContent>
        </Card>
      </div>

      {/* TABLA DE CITAS RECIENTES */}
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
                {stats.citasRecientes.length > 0 ? (
                  stats.citasRecientes.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">
                        {appointment.paciente.nombre_completo}
                      </TableCell>
                      <TableCell>
                        {typeof appointment.medico.nombre_completo === 'string' 
                          ? appointment.medico.nombre_completo 
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{formatDate(appointment.fecha_hora_inicio)}</TableCell>
                      <TableCell>{formatTime(appointment.fecha_hora_inicio)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(appointment.estado)} className="capitalize">
                          {appointment.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Ver</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No hay citas recientes registradas.
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

// --- SUBCOMPONENTES ---

function StatCardComponent({ title, value, icon: Icon, subtext, colorIcon, bgIcon, trend }: any) {
  return (
    <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${bgIcon}`}>
            <Icon className={`h-5 w-5 ${colorIcon}`} />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <div className="h-2 w-2 rounded-full bg-gray-300 mr-2"></div>
          <span className="text-xs text-gray-400">{trend || subtext}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickStatItem({ icon: Icon, label, value, color, bg }: any) {
  return (
    <div className="flex items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-default">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-4 ${bg}`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
