import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Appointment } from "../../types";
import { Search, Eye } from "lucide-react";

interface PatientsListProps {
  appointments: Appointment[];
  onNavigate: (page: string) => void;
}

export function PatientsList({ appointments, onNavigate }: PatientsListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Get unique patients
  const uniquePatients = Array.from(
    new Map(
      appointments.map(a => [
        a.pacienteId,
        {
          id: a.pacienteId,
          nombre: a.pacienteNombre,
          appointmentCount: appointments.filter(ap => ap.pacienteId === a.pacienteId).length,
          lastVisit: appointments
            .filter(ap => ap.pacienteId === a.pacienteId && ap.estado === 'completada')
            .sort((x, y) => new Date(y.fecha).getTime() - new Date(x.fecha).getTime())[0]?.fecha,
        },
      ])
    ).values()
  );

  const filteredPatients = uniquePatients.filter(patient =>
    patient.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (nombre: string) => {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl">Mis Pacientes</h1>
        <p className="text-gray-500 mt-1">Lista de pacientes atendidos</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pacientes</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                        {getInitials(patient.nombre)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-sm">{patient.nombre}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {patient.appointmentCount} consultas
                      </p>
                    </div>
                    {patient.lastVisit && (
                      <Badge variant="outline" className="text-xs">
                        Última visita: {new Date(patient.lastVisit).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                      </Badge>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => onNavigate('pacientes')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
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
