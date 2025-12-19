// src/components/admin/AdminDashboard.tsx

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { StatCard } from "../shared/StatCard"; 
import { Users, Calendar, UserCog, Activity, TrendingUp, AlertCircle } from "lucide-react";
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

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
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
  }, []); 

  if (isLoading) {
    return <div className="p-6 flex justify-center text-gray-500">Cargando panel de administración...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-500">Error al cargar el dashboard: {error}</div>;
  }
  if (!stats) {
      return <div className="p-6">No se pudieron cargar las estadísticas.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
        <p className="text-gray-500 mt-1">Vista general del sistema de gestión de citas</p>
      </div>

      {/* --- AQUÍ ESTABA EL ERROR --- */}
      {/* CORREGIDO: Pasamos los iconos como elementos JSX <Icono /> */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Pacientes"
          value={stats.totalPacientes}
          icon={<Users className="h-4 w-4 text-muted-foreground" />} 
          description="Pacientes registrados"
          trend={stats.nuevosUsuarios > 0 ? `+${stats.nuevosUsuarios} este mes` : undefined}
        />
        <StatCard
          title="Total Médicos"
          value={stats.totalMedicos}
          icon={<UserCog className="h-4 w-4 text-muted-foreground" />}
          description="Médicos activos"
        />
        <StatCard
          title="Citas Hoy"
          value={stats.citasHoy}
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          description="Programadas para hoy"
        />
        <StatCard
          title="Pendientes"
          value={stats.citasPendientes}
          icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
          description="Requieren atención"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Actividad del Sistema</CardTitle>

            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Citas Completadas</p>
                  <p className="text-2xl font-bold">{stats.citasCompletadas}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              
              {/* Barras de progreso */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tasa de Completación</span>
                  <span className="font-medium">{stats.tasaCompletacion.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${stats.tasaCompletacion}%` }} />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tasa de Cancelación</span>
                  <span className="font-medium">{stats.tasaCancelacion.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full transition-all" style={{ width: `${stats.tasaCancelacion}%` }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total de Citas</p>
                    <p className="text-xl font-bold">{stats.totalCitas}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Citas Este Mes</p>
                    <p className="text-xl font-bold">{stats.citasEsteMes}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nuevos Pacientes (Mes)</p>
                    <p className="text-xl font-bold">{stats.nuevosUsuarios}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments Table */}
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