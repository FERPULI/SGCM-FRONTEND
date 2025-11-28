import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Badge } from "../ui/badge";
import { Appointment } from "../../types";
import { Clock, User, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface DoctorCalendarProps {
  appointments: Appointment[];
}

export function DoctorCalendar({ appointments }: DoctorCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const appointmentsForDate = selectedDate
    ? appointments.filter(
        (apt) =>
          new Date(apt.fecha).toDateString() === selectedDate.toDateString()
      ).sort((a, b) => a.hora.localeCompare(b.hora))
    : [];

  const datesWithAppointments = appointments.map((apt) => new Date(apt.fecha));

  const getInitials = (nombre: string) => {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Calendario Médico</h1>
          <p className="text-gray-500 mt-1">Vista de calendario de tus citas</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Gestionar Disponibilidad
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Selecciona una Fecha</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border mx-auto"
              modifiers={{
                booked: datesWithAppointments,
              }}
              modifiersStyles={{
                booked: {
                  backgroundColor: '#DBEAFE',
                  color: '#1E40AF',
                },
              }}
            />
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded" />
                <span>Días con citas</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments for selected date */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                {selectedDate
                  ? selectedDate.toLocaleDateString('es-ES', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Selecciona una fecha'}
              </CardTitle>
              <Badge variant="secondary">{appointmentsForDate.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {appointmentsForDate.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No hay citas programadas</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {appointmentsForDate.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-3 border rounded-lg space-y-2 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                            {getInitials(appointment.pacienteNombre)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm">{appointment.pacienteNombre}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{appointment.hora}</span>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={appointment.estado === 'activa' ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {appointment.estado}
                      </Badge>
                    </div>
                    {appointment.motivo && (
                      <p className="text-xs text-gray-600 pl-10">
                        {appointment.motivo}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, idx) => {
              const date = new Date();
              date.setDate(date.getDate() - date.getDay() + idx + 1);
              const dayAppointments = appointments.filter(
                a => new Date(a.fecha).toDateString() === date.toDateString()
              );
              
              return (
                <div key={day} className="text-center p-4 border rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">{day}</p>
                  <p className="text-sm">{date.getDate()}</p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {dayAppointments.length}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
