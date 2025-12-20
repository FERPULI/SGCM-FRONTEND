import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog"; // Agregué Description para quitar el warning
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { StatusBadge } from "../shared/StatusBadge";
import { Cita, Especialidad } from "../../types"; 
import { Plus, Edit, Trash2, Loader2, AlertCircle, Calendar as CalendarIcon, Eye, Clock, User, FileText } from "lucide-react";
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

// Servicios
import { appointmentsService } from "../../services/appointments.service";
import { doctorsService, DoctorDirectoryItem } from "../../services/doctors.service"; 
import { especialidadService } from "../../services/especialidad.service"; 
import { patientsService, PatientDirectoryItem } from "../../services/patients.service"; 

export function AppointmentManagement() {
  const [appointments, setAppointments] = useState<Cita[]>([]);
  const [doctors, setDoctors] = useState<DoctorDirectoryItem[]>([]);
  const [specialties, setSpecialties] = useState<Especialidad[]>([]);
  const [patients, setPatients] = useState<PatientDirectoryItem[]>([]); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todas");
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewingAppointment, setViewingAppointment] = useState<Cita | null>(null);

  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    date: undefined as Date | undefined,
    time: "",
    reason: "",
    status: "programada"
  });

  useEffect(() => { loadData(); }, []);

const loadData = async () => {
    setIsLoading(true);
    try {
      const [citasRes, medicosRes, espRes, pacRes] = await Promise.all([
        // Pedimos muchas para evitar paginación oculta
        appointmentsService.getAppointments({ per_page: 300 }), 
        doctorsService.getAll(),
        especialidadService.getAll(),
        patientsService.getAll()
      ]);

      const listaCitas = (citasRes as any).data || (Array.isArray(citasRes) ? citasRes : []);
      
      // --- CORRECCIÓN DE ORDENAMIENTO ---
      // Forzamos a que la ID más alta (la última creada) aparezca primera en la tabla
      const citasOrdenadas = Array.isArray(listaCitas) 
        ? [...listaCitas].sort((a: Cita, b: Cita) => Number(b.id) - Number(a.id)) 
        : [];
      
      setAppointments(citasOrdenadas); // Guardamos la lista ya ordenada

      // ... resto de la carga (médicos, pacientes, etc.) ...
      const listaMedicos = (medicosRes as any).data || (Array.isArray(medicosRes) ? medicosRes : []);
      setDoctors(Array.isArray(listaMedicos) ? listaMedicos : []);
      const listaEsp = (espRes as any).data || (Array.isArray(espRes) ? espRes : []);
      setSpecialties(Array.isArray(listaEsp) ? listaEsp : []);
      const listaPacientes = (pacRes as any).data || (Array.isArray(pacRes) ? pacRes : []);
      setPatients(Array.isArray(listaPacientes) ? listaPacientes : []);

    } catch (error) {
      console.error(error);
      setError("Error cargando datos del sistema");
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    total: appointments.length,
    activas: appointments.filter(a => a.estado === 'programada' || a.estado === 'confirmada').length,
    pendientes: appointments.filter(a => a.estado === 'pendiente').length,
    completadas: appointments.filter(a => a.estado === 'completada' || a.estado === 'finalizada').length,
    canceladas: appointments.filter(a => a.estado === 'cancelada').length,
  };

  const openCreateDialog = () => {
    setEditingId(null); 
    setFormData({ patientId: "", doctorId: "", date: undefined, time: "", reason: "", status: "programada" });
    setShowDialog(true);
  };

  const handleEditClick = (cita: Cita) => {
    setEditingId(cita.id); 
    const fechaStr = cita.fecha_hora_inicio || cita.fecha || "";
    const fechaObj = new Date(fechaStr);
    let horaStr = "";
    if (cita.hora) {
        horaStr = cita.hora.substring(0, 5);
    } else if (isValid(fechaObj)) {
        horaStr = format(fechaObj, "HH:mm");
    }
    const motivoReal = cita.motivo || cita.motivo_consulta || "";
    setFormData({
        patientId: cita.paciente_id?.toString() || cita.paciente?.id?.toString() || "",
        doctorId: cita.medico_id?.toString() || cita.medico?.id?.toString() || "",
        date: isValid(fechaObj) ? fechaObj : undefined,
        time: horaStr,
        reason: motivoReal, 
        status: cita.estado || "programada"
    });
    setShowDialog(true);
  };

  const handleViewClick = (cita: Cita) => {
    setViewingAppointment(cita);
    setShowViewDialog(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar esta cita?")) return;
    try {
        await appointmentsService.deleteAppointment(id);
        toast.success("Cita eliminada correctamente");
        // Actualizamos la lista localmente para que desaparezca al instante
        setAppointments(prev => prev.filter(c => c.id !== id));
    } catch (error) {
        console.error("Error eliminando:", error);
        toast.error("No se pudo eliminar la cita");
    }
  };

  // --- FUNCIÓN GUARDAR OPTIMIZADA ---
  const handleSaveAppointment = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!formData.patientId || !formData.doctorId || !formData.date || !formData.time) {
      toast.error("Faltan campos obligatorios");
      return;
    }

    setIsSubmitting(true);
    try {
      const fechaFormat = format(formData.date, "yyyy-MM-dd");
      const motivoSeguro = formData.reason && formData.reason.trim() !== "" ? formData.reason : "Consulta General"; 

      if (editingId) {
        // ACTUALIZAR
        const updatedCita = await appointmentsService.updateAppointment(editingId, {
            fecha: fechaFormat,
            hora: formData.time,
            motivo_consulta: motivoSeguro,
            estado: formData.status as any
        });
        
        // Actualizamos la lista localmente
        setAppointments(prev => prev.map(c => c.id === editingId ? updatedCita : c));
        toast.success("Cita actualizada");
      } else {
        // CREAR
        const newCita = await appointmentsService.createAppointment({
            medico_id: formData.doctorId,   
            paciente_id: formData.patientId, 
            fecha: fechaFormat,
            hora: formData.time,
            motivo: motivoSeguro
        });

        // --- TRUCO DE VISIBILIDAD ---
        // Insertamos la nueva cita AL PRINCIPIO de la lista visualmente
        // Esto garantiza que la veas aunque el backend la ponga al final.
        if (newCita && newCita.id) {
             setAppointments(prev => [newCita, ...prev]);
             toast.success("Cita creada correctamente");
        } else {
             // Si el backend no devolvió el objeto completo, recargamos
             toast.success("Cita creada. Actualizando lista...");
             loadData();
        }
      }

      setShowDialog(false);

    } catch (error: any) {
      console.error("❌ Error al guardar:", error);
      if (error.response) {
          const s = error.response.status;
          if (s === 422) {
             const data = error.response.data;
             if(data.errors) {
                 const firstError = Object.values(data.errors)[0];
                 toast.error(`Error: ${firstError}`);
             } else {
                 toast.error("Datos inválidos");
             }
          } else {
             toast.error(`Error del servidor (${s})`);
          }
      } else {
          toast.error("Error de conexión");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helpers de visualización (Sin cambios)
  const getSpecialtyName = (medicoIdInCita: number) => {
    if (!medicoIdInCita) return "Sin Médico";
    let doctor = doctors.find(d => {
       if (!d) return false;
       const docAny = d as any;
       const idReal = docAny.id || docAny.id_medico || docAny.user_id;
       return idReal == medicoIdInCita;
    });
    if (!doctor) return "-"; 
    const docAny = doctor as any;
    if (docAny.especialidad && docAny.especialidad.nombre) return docAny.especialidad.nombre;
    const espId = docAny.especialidad_id || docAny.id_especialidad;
    const specialty = specialties.find(s => s.id == espId);
    return specialty ? specialty.nombre : "-";
  };

  const getPatientName = (p: PatientDirectoryItem) => {
    if (!p) return "Desconocido";
    if (p.nombre_completo) return p.nombre_completo;
    if (p.user) return `${p.user.nombre} ${p.user.apellidos}`;
    return `${p.nombre || ''} ${p.apellidos || ''}`.trim() || `Paciente #${p.id}`;
  };

  const getDoctorDisplayName = (d: any) => {
    if (d.nombre_completo) return d.nombre_completo;
    if (d.user && d.user.nombre) return `${d.user.nombre} ${d.user.apellidos || ''}`;
    if (d.nombre) return `${d.nombre} ${d.apellidos || ''}`;
    return `Médico #${d.id}`;
  };

  const getPatientNameForDisplay = (cita: Cita) => {
     if(cita.paciente?.nombre_completo) return cita.paciente.nombre_completo;
     const found = patients.find(p => p.id === cita.paciente_id || (p as any).id_paciente === cita.paciente_id);
     return found ? getPatientName(found) : "Desconocido";
  };

  const getDoctorNameForDisplay = (cita: Cita) => {
    if(cita.medico?.nombre_completo) return cita.medico.nombre_completo;
    const found = doctors.find(d => {
        const dAny = d as any;
        const dId = dAny.id || dAny.id_medico;
        return dId === cita.medico_id;
    });
    return found ? getDoctorDisplayName(found) : "Desconocido";
  };

  const getDoctorSpecialtyForDisplay = (cita: Cita) => {
    const med = cita.medico as any;
    if (med && med.especialidad && med.especialidad.nombre) return med.especialidad.nombre;
    if (med && med.especialidad_nombre) return med.especialidad_nombre;
    return getSpecialtyName(cita.medico_id || med?.id || 0);
  };

  const filteredAppointments = appointments.filter(cita => {
    if (!cita) return false;
    const nombrePaciente = cita.paciente?.nombre_completo || "Desconocido";
    const nombreMedico = cita.medico?.nombre_completo || "No asignado";
    const matchesSearch = 
      nombrePaciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nombreMedico.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "todas" || cita.estado?.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesTab;
  });

  const safeFormat = (dateStr: string, fmt: string) => {
    try { return isValid(new Date(dateStr)) ? format(new Date(dateStr), fmt, { locale: es }) : "-"; } catch { return "-"; }
  };

  const timeSlots = Array.from({ length: 13 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

  if (error) return <div className="p-6 text-red-500 flex items-center gap-2"><AlertCircle/> {error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Gestión de Citas</h1><p className="text-gray-500 mt-1">Administra todas las citas del sistema</p></div>
        <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4 mr-2" /> Nueva Cita</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4 flex flex-col items-center text-center"><span className="text-2xl font-bold">{stats.total}</span><span className="text-xs text-gray-500 uppercase">Total</span></CardContent></Card>
        <Card><CardContent className="p-4 flex flex-col items-center text-center"><span className="text-2xl font-bold text-indigo-600">{stats.activas}</span><span className="text-xs text-gray-500 uppercase">Activas</span></CardContent></Card>
        <Card><CardContent className="p-4 flex flex-col items-center text-center"><span className="text-2xl font-bold text-yellow-600">{stats.pendientes}</span><span className="text-xs text-gray-500 uppercase">Pendientes</span></CardContent></Card>
        <Card><CardContent className="p-4 flex flex-col items-center text-center"><span className="text-2xl font-bold text-green-600">{stats.completadas}</span><span className="text-xs text-gray-500 uppercase">Completadas</span></CardContent></Card>
        <Card><CardContent className="p-4 flex flex-col items-center text-center"><span className="text-2xl font-bold text-red-600">{stats.canceladas}</span><span className="text-xs text-gray-500 uppercase">Canceladas</span></CardContent></Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
                <TabsTrigger value="todas">Todas</TabsTrigger>
                <TabsTrigger value="programada">Activas</TabsTrigger>
                <TabsTrigger value="pendiente">Pendientes</TabsTrigger>
                <TabsTrigger value="completada">Completadas</TabsTrigger>
                <TabsTrigger value="cancelada">Canceladas</TabsTrigger>
            </TabsList>
            
            <div className="rounded-lg border">
            <Table>
                <TableHeader><TableRow><TableHead>Paciente</TableHead><TableHead>Médico</TableHead><TableHead>Especialidad</TableHead><TableHead>Fecha</TableHead><TableHead>Hora</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                <TableBody>
                {isLoading ? (<TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="animate-spin inline mr-2"/>Cargando...</TableCell></TableRow>) : 
                    filteredAppointments.length === 0 ? (<TableRow><TableCell colSpan={7} className="text-center py-8">No se encontraron citas</TableCell></TableRow>) : (
                    filteredAppointments.map((cita) => (
                    <TableRow key={cita.id}>
                        <TableCell className="font-medium">{cita.paciente?.nombre_completo || "Desconocido"}</TableCell>
                        <TableCell>{cita.medico?.nombre_completo || "No asignado"}</TableCell>
                        <TableCell><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{getDoctorSpecialtyForDisplay(cita)}</span></TableCell>
                        <TableCell>{safeFormat(cita.fecha_hora_inicio, "d MMMM yyyy")}</TableCell>
                        <TableCell>{safeFormat(cita.fecha_hora_inicio, "HH:mm")}</TableCell>
                        <TableCell><StatusBadge status={cita.estado} /></TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleViewClick(cita)}>
                                    <Eye className="h-4 w-4 text-gray-600 hover:text-gray-900" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleEditClick(cita)}>
                                    <Edit className="h-4 w-4 text-gray-600 hover:text-blue-600" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(cita.id)}>
                                    <Trash2 className="h-4 w-4 text-red-400 hover:text-red-600" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                    ))
                )}
                </TableBody>
            </Table>
            </div>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* MODAL CREAR/EDITAR */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
              <DialogTitle>{editingId ? "Editar Cita" : "Nueva Cita"}</DialogTitle>
              {/* Added DialogDescription to fix console warning */}
              <DialogDescription>
                {editingId ? "Modifique los detalles de la cita existente." : "Complete el formulario para agendar una nueva cita médica."}
              </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Select value={formData.patientId} onValueChange={(val) => setFormData({...formData, patientId: val})}>
                <SelectTrigger><SelectValue placeholder="Seleccionar paciente" /></SelectTrigger>
                <SelectContent>
                  {patients.map(p => {
                    const docAny = p as any;
                    const idReal = docAny.id || docAny.id_paciente || docAny.user_id;
                    if (!idReal) return null; 
                    return <SelectItem key={idReal} value={idReal.toString()}>{getPatientName(p)}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Médico</Label>
              <Select value={formData.doctorId} onValueChange={(val) => setFormData({...formData, doctorId: val})}>
                <SelectTrigger><SelectValue placeholder="Seleccionar médico" /></SelectTrigger>
                <SelectContent>
                  {doctors.map(d => {
                      const docAny = d as any;
                      const idReal = docAny.id || docAny.id_medico || docAny.user_id;
                      if (!idReal) return null;
                      return <SelectItem key={idReal} value={idReal.toString()}>{getDoctorDisplayName(docAny)}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
               <Label>Fecha</Label>
               <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className={`w-full justify-start text-left font-normal ${!formData.date ? "text-muted-foreground" : ""}`}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={formData.date} onSelect={(date) => setFormData({...formData, date})} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Hora</Label>
              <Select value={formData.time} onValueChange={(val) => setFormData({...formData, time: val})}>
                <SelectTrigger><SelectValue placeholder="Seleccionar hora" /></SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (<SelectItem key={time} value={time}>{time}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            {editingId && (
                <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                        <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="programada">Programada / Activa</SelectItem>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="completada">Completada</SelectItem>
                            <SelectItem value="cancelada">Cancelada</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
            <div className="col-span-2 space-y-2">
              <Label>Motivo de Consulta</Label>
              <Textarea placeholder="Describa el motivo..." value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})}/>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button type="button" className="bg-blue-600" onClick={handleSaveAppointment} disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : (editingId ? "Actualizar" : "Crear")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* MODAL VER DETALLES */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-md">
            <DialogHeader className="flex flex-row items-center justify-between">
                <div>
                    <DialogTitle className="text-xl">Detalles de la Cita</DialogTitle>
                    {/* Added DialogDescription here too */}
                    <DialogDescription>
                        Información completa del registro médico.
                    </DialogDescription>
                </div>
                {viewingAppointment && <StatusBadge status={viewingAppointment.estado} />}
            </DialogHeader>

            {viewingAppointment && (
                <div className="space-y-4 py-2">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex justify-between items-center">
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-blue-900 mb-1">Información de la Cita</h4>
                            <div className="flex items-center text-blue-700">
                                <CalendarIcon className="h-4 w-4 mr-2" />
                                <span className="text-sm font-medium">{safeFormat(viewingAppointment.fecha_hora_inicio, "EEEE, d 'de' MMMM 'de' yyyy")}</span>
                            </div>
                        </div>
                        <div className="flex items-center text-blue-700 mt-5">
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">{safeFormat(viewingAppointment.fecha_hora_inicio, "HH:mm")}</span>
                        </div>
                    </div>

                    <div className="border rounded-lg p-4">
                        <h4 className="text-sm text-gray-500 mb-3">Información del Paciente</h4>
                        <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                <User className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Nombre</p>
                                <p className="text-sm font-medium text-gray-900">{getPatientNameForDisplay(viewingAppointment)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-lg p-4">
                        <h4 className="text-sm text-gray-500 mb-3">Información del Médico</h4>
                        <div className="flex items-center mb-3">
                            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                <User className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Nombre</p>
                                <p className="text-sm font-medium text-gray-900">{getDoctorNameForDisplay(viewingAppointment)}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                             <div className="h-10 w-10 flex items-center justify-center mr-3">
                                <FileText className="h-5 w-5 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Especialidad</p>
                                <p className="text-sm font-medium text-gray-900">{getDoctorSpecialtyForDisplay(viewingAppointment)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-lg p-4">
                        <h4 className="text-sm text-gray-500 mb-2">Motivo de la Consulta</h4>
                        <p className="text-sm text-gray-700">
                            {viewingAppointment.motivo || viewingAppointment.motivo_consulta || "Sin motivo especificado"}
                        </p>
                    </div>
                </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}