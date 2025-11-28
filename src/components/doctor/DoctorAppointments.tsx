import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { StatusBadge } from "../shared/StatusBadge";
import { Appointment, AppointmentStatus } from "../../types";
import { Search, Filter, CheckCircle, X } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface DoctorAppointmentsProps {
  appointments: Appointment[];
}

export function DoctorAppointments({ appointments }: DoctorAppointmentsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<AppointmentStatus | "todas">("todas");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.pacienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.motivo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === "todas" || appointment.estado === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getInitials = (nombre: string) => {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl">Gestión de Citas</h1>
        <p className="text-gray-500 mt-1">Administra tus citas médicas</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Citas</CardTitle>
            <div className="flex gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar paciente o motivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList>
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="pendiente">Pendientes</TabsTrigger>
              <TabsTrigger value="activa">Confirmadas</TabsTrigger>
              <TabsTrigger value="completada">Completadas</TabsTrigger>
              <TabsTrigger value="cancelada">Canceladas</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No se encontraron citas
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                  {getInitials(appointment.pacienteNombre)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{appointment.pacienteNombre}</span>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(appointment.fecha)}</TableCell>
                          <TableCell>{appointment.hora}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {appointment.motivo || '-'}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={appointment.estado} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setShowConfirmDialog(true);
                                }}
                              >
                                Ver Detalles
                              </Button>
                              {appointment.estado === 'pendiente' && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Confirmar
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Rechazar
                                  </Button>
                                </>
                              )}
                              {appointment.estado === 'activa' && (
                                <Button variant="ghost" size="sm" className="text-blue-600">
                                  Completar
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Appointment Details Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la Cita</DialogTitle>
            <DialogDescription>
              Información completa de la cita médica
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Paciente</label>
                <p className="text-sm">{selectedAppointment.pacienteNombre}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Fecha</label>
                  <p className="text-sm">{formatDate(selectedAppointment.fecha)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Hora</label>
                  <p className="text-sm">{selectedAppointment.hora}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Estado</label>
                <div className="mt-1">
                  <StatusBadge status={selectedAppointment.estado} />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Motivo de consulta</label>
                <p className="text-sm">{selectedAppointment.motivo || 'No especificado'}</p>
              </div>
              {selectedAppointment.notas && (
                <div>
                  <label className="text-sm text-gray-500">Notas</label>
                  <p className="text-sm">{selectedAppointment.notas}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cerrar
            </Button>
            {selectedAppointment?.estado === 'activa' && (
              <Button className="bg-blue-600 hover:bg-blue-700">
                Iniciar Consulta
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
