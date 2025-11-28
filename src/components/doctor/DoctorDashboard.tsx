import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { StatCard } from "../shared/StatCard";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Appointment } from "../../types";
import { Calendar, Users, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "../ui/badge";

interface DoctorDashboardProps {
  appointments: Appointment[];
  onNavigate: (page: string) => void;
}

export function DoctorDashboard({ appointments, onNavigate }: DoctorDashboardProps) {
  const today = new Date().toISOString().split('T')[0];
  
  const todayAppointments = appointments
    .filter(a => a.fecha === today)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const upcomingAppointments = appointments
    .filter(a => a.estado === 'activa' || a.estado === 'pendiente')
    .filter(a => a.fecha >= today)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  const pendingCount = appointments.filter(a => a.estado === 'pendiente').length;
  const completedToday = appointments.filter(a => a.fecha === today && a.estado === 'completada').length;

  const getInitials = (nombre: string) => {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl">Panel del Médico</h1>
        <p className="text-gray-500 mt-1">Bienvenido, gestiona tus citas y pacientes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Citas Hoy"
          value={todayAppointments.length}
          icon={Calendar}
          description={`${completedToday} completadas`}
        />
        <StatCard
          title="Pendientes"
          value={pendingCount}
          icon={AlertCircle}
          description="Requieren confirmación"
        />
        <StatCard
          title="Próximas Citas"
          value={upcomingAppointments.length}
          icon={Clock}
          description="Total programadas"
        />
        <StatCard
          title="Pacientes Únicos"
          value={new Set(appointments.map(a => a.pacienteId)).size}
          icon={Users}
          description="Este mes"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Agenda de Hoy</CardTitle>
              <Button variant="outline" size="sm" onClick={() => onNavigate('calendario')}>
                Ver Calendario
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay citas programadas para hoy</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {getInitials(appointment.pacienteNombre)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm">{appointment.pacienteNombre}</p>
                        <p className="text-xs text-gray-500">{appointment.motivo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{appointment.hora}</p>
                      <Badge variant={appointment.estado === 'completada' ? 'outline' : 'default'} className="mt-1">
                        {appointment.estado}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Confirmations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Citas Pendientes de Confirmación</CardTitle>
              <Badge variant="secondary">{pendingCount}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {appointments.filter(a => a.estado === 'pendiente').length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay citas pendientes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments
                  .filter(a => a.estado === 'pendiente')
                  .slice(0, 5)
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm">{appointment.pacienteNombre}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(appointment.fecha).toLocaleDateString('es-ES')} - {appointment.hora}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8">
                          Confirmar
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 text-red-600">
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Patients */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pacientes Recientes</CardTitle>
            <Button variant="outline" size="sm" onClick={() => onNavigate('pacientes')}>
              Ver Todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...new Set(appointments.map(a => a.pacienteNombre))]
              .slice(0, 4)
              .map((nombre, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {getInitials(nombre)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm">{nombre}</p>
                        <p className="text-xs text-gray-500">
                          {appointments.filter(a => a.pacienteNombre === nombre).length} consultas
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Ver Historial
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
