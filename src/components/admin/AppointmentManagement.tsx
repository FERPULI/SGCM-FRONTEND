import { useState, useEffect } from "react";
import * as httpService from "../../services/http"; 

const api = (httpService as any).http || (httpService as any).default || (httpService as any).api || (httpService as any).axios;

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Search, Plus, Edit, Trash2, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// --- INTERFACES ACTUALIZADAS ---
interface AppointmentView {
  id: number;
  pacienteNombre: string;
  medicoNombre: string;
  especialidad: string;
  fecha: string;
  hora: string;
  estado: string;
  pacienteEmail?: string;
  // Campos ocultos necesarios para editar
  pacienteId: string;
  medicoId: string;
  fechaRaw: string; // Fecha completa ISO para el calendario
  motivo: string;
}

interface Stats {
  total: number;
  activas: number;
  pendientes: number;
  completadas: number;
  canceladas: number;
}

interface SimpleUser {
  id: number;
  nombre: string;
}

export function AppointmentManagement() {
  // Estados principales
  const [appointments, setAppointments] = useState<AppointmentView[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, activas: 0, pendientes: 0, completadas: 0, canceladas: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todas");
  
  // Estado del Modal y Edición
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null); // ID de la cita que se está editando (null si es nueva)
  
  // Listas para selects
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [pacientesList, setPacientesList] = useState<SimpleUser[]>([]);
  const [medicosList, setMedicosList] = useState<SimpleUser[]>([]);
  
  // Formulario
  const [formData, setFormData] = useState({
    pacienteId: "",
    medicoId: "",
    date: undefined as Date | undefined,
    hora: "",
    estado: "programada",
    motivo: ""
  });

  // --- 1. CARGA DE CITAS ---
  const fetchCitas = async () => {
    setIsLoading(true);
    try {
      if (!api) return;
      const response = await api.get('/appointments', { params: { status: activeTab, search: searchTerm } });

      if (response.data?.success) {
        const pageData = response.data.data; 
        const arrayData = pageData?.data || []; 
        
        const mappedData = arrayData.map((item: any) => {
          // Extraer hora limpia (HH:mm) de la fecha ISO
          const fechaObj = new Date(item.fecha_hora_inicio);
          const horaLimpia = fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

          return {
            id: item.id,
            pacienteNombre: item.paciente?.user ? `${item.paciente.user.nombre} ${item.paciente.user.apellidos}` : 'Desconocido',
            pacienteEmail: item.paciente?.user?.email,
            medicoNombre: item.medico?.user ? `${item.medico.user.nombre} ${item.medico.user.apellidos}` : 'N/A',
            especialidad: item.medico?.especialidad?.nombre || 'General',
            fecha: item.fecha_hora_inicio,
            hora: horaLimpia, 
            estado: item.estado || 'pendiente',
            // Mapeamos los datos extra para la edición
            pacienteId: item.paciente_id?.toString() || "",
            medicoId: item.medico_id?.toString() || "",
            fechaRaw: item.fecha_hora_inicio,
            motivo: item.motivo_consulta || ""
          };
        });
        
        setAppointments(mappedData);
        if (response.data.stats) setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error cargando citas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. CARGAR OPCIONES DEL FORMULARIO ---
  const fetchOptions = async () => {
    setLoadingOptions(true);
    try {
      const [pacientesRes, medicosRes] = await Promise.all([
        api.get('/patients-list'), 
        api.get('/doctors-list')    
      ]);

      const pacientesData = Array.isArray(pacientesRes.data) ? pacientesRes.data : (pacientesRes.data?.data || []);
      const medicosData = Array.isArray(medicosRes.data) ? medicosRes.data : (medicosRes.data?.data || []);
      
      setPacientesList(pacientesData);
      setMedicosList(medicosData);
    } catch (error) {
      console.error("Error cargando listas:", error);
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { fetchCitas(); }, 500);
    return () => clearTimeout(timer);
  }, [activeTab, searchTerm]);

  useEffect(() => {
    if (showAddDialog) fetchOptions();
  }, [showAddDialog]);

  // --- 3. ACCIÓN: ABRIR EDITAR ---
  const handleEdit = (cita: AppointmentView) => {
    setEditingId(cita.id); // Marcamos que estamos editando
    setFormData({
      pacienteId: cita.pacienteId,
      medicoId: cita.medicoId,
      date: new Date(cita.fechaRaw), // Convertimos string ISO a objeto Date para el calendario
      hora: cita.hora,
      estado: cita.estado,
      motivo: cita.motivo
    });
    setShowAddDialog(true);
  };

  // --- 4. ACCIÓN: ELIMINAR ---
  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.")) {
      return;
    }
    
    try {
      await api.delete(`/appointments/${id}`);
      fetchCitas(); // Recargar tabla
    } catch (error) {
      console.error("Error eliminando cita:", error);
      alert("Hubo un error al intentar eliminar la cita.");
    }
  };

  // --- 5. ACCIÓN: GUARDAR (CREAR O ACTUALIZAR) ---
  const handleSave = async () => {
    if (!formData.pacienteId || !formData.medicoId || !formData.date || !formData.hora) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    try {
      const fechaBase = format(formData.date, 'yyyy-MM-dd');
      const fechaHoraInicio = `${fechaBase} ${formData.hora}:00`;

      const payload = {
        paciente_id: formData.pacienteId,
        medico_id: formData.medicoId,
        fecha_hora_inicio: fechaHoraInicio,
        motivo_consulta: formData.motivo,
        estado: formData.estado
      };

      if (editingId) {
        // MODO EDICIÓN: PUT
        await api.put(`/appointments/${editingId}`, payload);
      } else {
        // MODO CREACIÓN: POST
        await api.post('/appointments', payload);
      }
      
      handleCloseDialog();
      fetchCitas();
      
    } catch (error) {
      console.error("Error guardando cita", error);
      alert("Error al guardar la cita. Verifica la consola.");
    }
  };

  // Limpiar formulario al cerrar
  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingId(null); // Resetear modo edición
    setFormData({ pacienteId: "", medicoId: "", date: undefined, hora: "", estado: "programada", motivo: "" });
  };

  const getStatusColor = (estado: string) => {
    switch(estado) {
      case 'programada': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmada': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'completada': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelada': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8;
    return [`${hour.toString().padStart(2, '0')}:00`, `${hour.toString().padStart(2, '0')}:30`];
  }).flat();

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Citas</h1>
          <p className="text-gray-500 mt-1">Administra y supervisa todas las citas médicas.</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <Plus className="h-4 w-4 mr-2" /> Nueva Cita
        </Button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total" value={stats.total} />
        <StatCard title="Activas" value={stats.activas} color="text-blue-600" />
        <StatCard title="Pendientes" value={stats.pendientes} color="text-orange-600" />
        <StatCard title="Completadas" value={stats.completadas} color="text-green-600" />
        <StatCard title="Canceladas" value={stats.canceladas} color="text-red-600" />
      </div>

      {/* TABLA */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <CardTitle className="text-lg font-semibold">Listado de Citas</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por paciente o médico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 bg-gray-100/50 p-1">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="activas">Activas</TabsTrigger>
              <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
              <TabsTrigger value="completadas">Completadas</TabsTrigger>
              <TabsTrigger value="canceladas">Canceladas</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <div className="rounded-md border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-600">Paciente</TableHead>
                      <TableHead className="font-semibold text-gray-600">Médico / Especialidad</TableHead>
                      <TableHead className="font-semibold text-gray-600">Fecha y Hora</TableHead>
                      <TableHead className="font-semibold text-gray-600">Estado</TableHead>
                      <TableHead className="text-right font-semibold text-gray-600">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow><TableCell colSpan={5} className="h-32 text-center"><Loader2 className="h-8 w-8 animate-spin inline text-blue-500" /></TableCell></TableRow>
                    ) : appointments.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="h-32 text-center text-gray-500">No se encontraron citas.</TableCell></TableRow>
                    ) : (
                      appointments.map((cita) => (
                        <TableRow key={cita.id} className="hover:bg-gray-50/50 transition-colors">
                          <TableCell>
                            <div className="font-medium text-gray-900">{cita.pacienteNombre}</div>
                            {cita.pacienteEmail && <div className="text-xs text-gray-500">{cita.pacienteEmail}</div>}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-gray-900">{cita.medicoNombre}</div>
                            <div className="text-xs text-blue-600 bg-blue-50 inline-block px-1.5 py-0.5 rounded mt-0.5 font-medium">{cita.especialidad}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-gray-700">
                                <CalendarIcon className="h-3.5 w-3.5 text-gray-400"/>
                                {new Date(cita.fecha).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500 ml-5.5">{cita.hora}</div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(cita.estado)}`}>
                              {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {/* BOTONES FUNCIONALES AHORA */}
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600" onClick={() => handleEdit(cita)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(cita.id)}>
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
      
      {/* DIALOG (Mismo que antes, ahora reutilizable para Editar) */}
      <Dialog open={showAddDialog} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Cita" : "Nueva Cita"}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            
            {/* Columna Izquierda */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paciente">Paciente</Label>
                <Select value={formData.pacienteId} onValueChange={(val) => setFormData({...formData, pacienteId: val})}>
                  <SelectTrigger id="paciente">
                    <SelectValue placeholder={loadingOptions ? "Cargando..." : "Selecciona un paciente"} />
                  </SelectTrigger>
                  <SelectContent>
                    {pacientesList.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fecha</Label>
                <div className="border rounded-md p-2 flex justify-center">
                   <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => setFormData({...formData, date: date})}
                      locale={es}
                      className="rounded-md border shadow-sm"
                   />
                </div>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medico">Médico</Label>
                <Select value={formData.medicoId} onValueChange={(val) => setFormData({...formData, medicoId: val})}>
                  <SelectTrigger id="medico">
                    <SelectValue placeholder={loadingOptions ? "Cargando..." : "Selecciona un médico"} />
                  </SelectTrigger>
                  <SelectContent>
                    {medicosList.map(m => (
                      <SelectItem key={m.id} value={m.id.toString()}>{m.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Hora</Label>
                    <Select value={formData.hora} onValueChange={(val) => setFormData({...formData, hora: val})}>
                    <SelectTrigger>
                        <SelectValue placeholder="--:--" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                        {timeSlots.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select value={formData.estado} onValueChange={(val) => setFormData({...formData, estado: val})}>
                    <SelectTrigger>
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="programada">Programada</SelectItem>
                        <SelectItem value="confirmada">Confirmada</SelectItem>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="completada">Completada</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo de la consulta</Label>
                <Textarea 
                    id="motivo" 
                    placeholder="Describe el motivo..." 
                    className="h-32 resize-none"
                    value={formData.motivo}
                    onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">
              {editingId ? "Guardar Cambios" : "Crear Cita"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ title, value, color = "text-gray-900" }: { title: string, value: number, color?: string }) {
  return (
    <Card><CardContent className="pt-6 flex flex-col items-center justify-center p-4"><p className={`text-3xl font-bold ${color}`}>{value}</p><p className="text-sm font-medium text-gray-500 mt-1">{title}</p></CardContent></Card>
  );
}