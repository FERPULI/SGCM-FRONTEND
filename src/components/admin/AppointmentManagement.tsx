import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { StatusBadge } from "../shared/StatusBadge";
import { Appointment, AppointmentStatus } from "../../types";
import { Search, Plus, Edit, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { appointmentsService } from "../../services/appointments.service";
import { toast } from "sonner";

// --- Helpers de Fecha ---
// Evita problemas de zona horaria al convertir a string para la API
const formatDateToLocalISO = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
  return adjustedDate.toISOString().split('T')[0];
};

const formatDateDisplay = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return isNaN(date.getTime()) 
    ? dateString 
    : date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatTimeDisplay = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return isNaN(date.getTime()) 
    ? "" 
    : date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'programada': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'confirmada': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'completada': return 'bg-green-100 text-green-700 border-green-200';
    case 'cancelada': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-600';
  }
};

// Modificamos la interface para que sea opcional y evitar crasheos si no se pasan datos
interface AppointmentManagementProps {
  appointments: Appointment[];
}

export function AppointmentManagement({ appointments }: AppointmentManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<AppointmentStatus | "todas">("todas");
  
  // Estados del Modal
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.pacienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.medicoNombre.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Citas</h1>
          <p className="text-gray-500 mt-1">Administra todas las citas del sistema</p>
        </div>
        <Button onClick={handleCreateClick} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cita
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl">{appointments.length}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl">{appointments.filter(a => a.estado === 'activa').length}</p>
              <p className="text-sm text-gray-500">Activas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl">{appointments.filter(a => a.estado === 'pendiente').length}</p>
              <p className="text-sm text-gray-500">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl">{appointments.filter(a => a.estado === 'completada').length}</p>
              <p className="text-sm text-gray-500">Completadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl">{appointments.filter(a => a.estado === 'cancelada').length}</p>
              <p className="text-sm text-gray-500">Canceladas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla y Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Citas</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="programada">Programadas</TabsTrigger>
              <TabsTrigger value="confirmada">Confirmadas</TabsTrigger>
              <TabsTrigger value="completada">Completadas</TabsTrigger>
              <TabsTrigger value="cancelada">Canceladas</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
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
                    {filteredAppointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No se encontraron citas
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell className="font-medium">{appointment.paciente?.nombre_completo || "Sin nombre"}</TableCell>
                          <TableCell>{appointment.medico?.nombre_completo || "Sin asignar"}</TableCell>
                          <TableCell>{formatDateDisplay(appointment.fecha_hora_inicio)}</TableCell>
                          <TableCell>{formatTimeDisplay(appointment.fecha_hora_inicio)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`capitalize border-0 px-2 py-1 ${getStatusColor(appointment.estado)}`}>
                                {appointment.estado}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditClick(appointment)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(appointment.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
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

      {/* MODAL DE AGREGAR/EDITAR */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingAppointment ? 'Editar Cita' : 'Nueva Cita'}</DialogTitle>
            <DialogDescription>
              {editingAppointment ? 'Modifica la información de la cita existente.' : 'Agenda una nueva cita médica.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            
            {/* Selector Paciente */}
            <div className="space-y-2">
              <Label htmlFor="paciente">Paciente</Label>
              <Select defaultValue={editingAppointment?.pacienteId}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingLists ? "Cargando..." : "Seleccionar paciente"} />
                </SelectTrigger>
                <SelectContent>
                  {patientsList.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.nombre_completo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selector Médico */}
            <div className="space-y-2">
              <Label htmlFor="medico">Médico</Label>
              <Select defaultValue={editingAppointment?.medicoId}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingLists ? "Cargando..." : "Seleccionar médico"} />
                </SelectTrigger>
                <SelectContent>
                   {doctorsList.map(d => (
                      <SelectItem key={d.id_medico} value={d.id_medico.toString()}>{d.nombre_completo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha */}
            <div className="space-y-2">
              <Label>Fecha</Label>
              <div className="border rounded-md p-2 flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className="rounded-md border shadow-none"
                />
              </div>
            </div>

            {/* Hora y Estado/Motivo */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hora">Hora</Label>
                <Select 
                    value={formData.hora} 
                    onValueChange={(val) => setFormData({...formData, hora: val})}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccionar hora" /></SelectTrigger>
                  <SelectContent>
                    {/* Lista estática de horas, puedes hacerla dinámica con getAvailableSlots */}
                    {["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "15:00", "15:30", "16:00", "16:30", "17:00"].map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select 
                    value={formData.estado} 
                    onValueChange={(val) => setFormData({...formData, estado: val})}
                >
                  <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programada">Programada</SelectItem>
                    <SelectItem value="confirmada">Confirmada</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo</Label>
                <Textarea
                  id="motivo"
                  placeholder="Describe el motivo de la consulta..."
                  value={formData.motivo}
                  onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingAppointment ? 'Guardar Cambios' : 'Agendar Cita'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}