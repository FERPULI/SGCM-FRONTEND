import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { StatusBadge } from "./StatusBadge";
import { Appointment } from "../../types";
import { Calendar, Clock, User, FileText } from "lucide-react";

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (id: string) => void;
  onReschedule?: (id: string) => void;
  showPatientName?: boolean;
  showDoctorName?: boolean;
}

export function AppointmentCard({ 
  appointment, 
  onCancel, 
  onReschedule,
  showPatientName = false,
  showDoctorName = true
}: AppointmentCardProps) {
  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              {showPatientName ? appointment.pacienteNombre : appointment.medicoNombre}
            </CardTitle>
            <p className="text-sm text-gray-500">{appointment.especialidad}</p>
          </div>
          <StatusBadge status={appointment.estado} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{formatDate(appointment.fecha)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{appointment.hora}</span>
          </div>
          {appointment.motivo && (
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-gray-500" />
              <span>{appointment.motivo}</span>
            </div>
          )}
        </div>
        
        {appointment.estado !== 'completada' && appointment.estado !== 'cancelada' && (
          <div className="flex gap-2 pt-2">
            {onReschedule && (
              <Button variant="outline" size="sm" onClick={() => onReschedule(appointment.id)} className="flex-1">
                Reprogramar
              </Button>
            )}
            {onCancel && (
              <Button variant="outline" size="sm" onClick={() => onCancel(appointment.id)} className="flex-1">
                Cancelar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
