import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Appointment, MedicalRecord } from "../../types";
import { ArrowLeft, Phone, Mail, Calendar, FileText, Activity } from "lucide-react";

interface PatientDetailsProps {
  onNavigate: (page: string) => void;
}

export function PatientDetails({ onNavigate }: PatientDetailsProps) {
  // Mock patient data
  const patient = {
    id: '1',
    nombre: 'María González',
    email: 'maria@email.com',
    telefono: '+34 612 345 678',
    fechaNacimiento: '1985-05-15',
    direccion: 'Calle Principal 123, Madrid',
    seguroMedico: 'Seguro Nacional de Salud',
  };

  const patientAppointments: Appointment[] = [
    {
      id: '1',
      pacienteId: '1',
      pacienteNombre: 'María González',
      medicoId: '2',
      medicoNombre: 'Dr. Carlos Ramírez',
      especialidad: 'Cardiología',
      fecha: '2025-10-28',
      hora: '10:00',
      estado: 'activa',
      motivo: 'Revisión anual',
    },
  ];

  const patientRecords: MedicalRecord[] = [
    {
      id: '1',
      pacienteId: '1',
      fecha: '2025-09-15',
      diagnostico: 'Hipertensión arterial leve',
      tratamiento: 'Cambios en la dieta y ejercicio regular',
      medicoNombre: 'Dr. Carlos Ramírez',
      notas: 'Paciente muestra mejora en presión arterial',
    },
  ];

  const getInitials = (nombre: string) => {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => onNavigate('pacientes')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl">Detalles del Paciente</h1>
          <p className="text-gray-500 mt-1">Información completa y historial médico</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-blue-600 text-white text-2xl">
                  {getInitials(patient.nombre)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl">{patient.nombre}</h2>
                <p className="text-sm text-gray-500">
                  {calculateAge(patient.fechaNacimiento)} años
                </p>
              </div>

              <Separator />

              <div className="w-full space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-left flex-1">{patient.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-left flex-1">{patient.telefono}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-left flex-1">
                    {new Date(patient.fechaNacimiento).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="w-full text-left space-y-2 text-sm">
                <div>
                  <p className="text-gray-500">Dirección</p>
                  <p>{patient.direccion}</p>
                </div>
                <div>
                  <p className="text-gray-500">Seguro Médico</p>
                  <p>{patient.seguroMedico}</p>
                </div>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <FileText className="h-4 w-4 mr-2" />
                Nueva Consulta
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patient Details Tabs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Información del Paciente</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="historial">
              <TabsList>
                <TabsTrigger value="historial">Historial Médico</TabsTrigger>
                <TabsTrigger value="citas">Citas</TabsTrigger>
                <TabsTrigger value="signos">Signos Vitales</TabsTrigger>
              </TabsList>

              <TabsContent value="historial" className="space-y-4 pt-4">
                {patientRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay registros médicos</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {patientRecords.map((record) => (
                      <div key={record.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">
                              {new Date(record.fecha).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                          <Badge variant="outline">Completada</Badge>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                          <div>
                            <p className="text-xs text-gray-500">Diagnóstico</p>
                            <p className="text-sm">{record.diagnostico}</p>
                          </div>
                          <Separator />
                          <div>
                            <p className="text-xs text-gray-500">Tratamiento</p>
                            <p className="text-sm">{record.tratamiento}</p>
                          </div>
                          {record.notas && (
                            <>
                              <Separator />
                              <div>
                                <p className="text-xs text-gray-500">Notas</p>
                                <p className="text-sm text-gray-600">{record.notas}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="citas" className="space-y-4 pt-4">
                <div className="space-y-3">
                  {patientAppointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm">{appointment.especialidad}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(appointment.fecha).toLocaleDateString('es-ES')} - {appointment.hora}
                          </p>
                        </div>
                        <Badge variant={appointment.estado === 'completada' ? 'outline' : 'default'}>
                          {appointment.estado}
                        </Badge>
                      </div>
                      {appointment.motivo && (
                        <p className="text-sm text-gray-600 mt-2">{appointment.motivo}</p>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="signos" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <Activity className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Presión Arterial</p>
                          <p className="text-lg">120/80</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Activity className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Frecuencia Cardíaca</p>
                          <p className="text-lg">72 bpm</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Activity className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Temperatura</p>
                          <p className="text-lg">36.5°C</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Activity className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Peso</p>
                          <p className="text-lg">70 kg</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
