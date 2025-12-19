import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { StatusBadge } from "../shared/StatusBadge";
import { Cita, Especialidad } from "../../types"; 
import { Plus, Edit, Trash2, Loader2, AlertCircle, Calendar as CalendarIcon, Eye } from "lucide-react";
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
  // Estados de Datos
  const [appointments, setAppointments] = useState<Cita[]>([]);
  const [doctors, setDoctors] = useState<DoctorDirectoryItem[]>([]);
  const [specialties, setSpecialties] = useState<Especialidad[]>([]);
  const [patients, setPatients] = useState<PatientDirectoryItem[]>([]); 
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todas");
  const [showDialog, setShowDialog] = useState(false);
  
  // Estado para Edición
  const [editingId, setEditingId] = useState<number | null>(null);

  // Estado del Formulario
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
        appointmentsService.getAppointments({ per_page: 100 }), // Usamos tu filtro
        doctorsService.getAll(),
        especialidadService.getAll(),
        patientsService.getAll()
      ]);

      // Adaptamos la respuesta paginada de tu servicio a un array simple para la tabla
      const listaCitas = citasRes.data || []; 
      setAppointments(listaCitas);

      setDoctors(Array.isArray(medicosRes) ? medicosRes : []);
      setSpecialties(Array.isArray(espRes) ? espRes : []);
      setPatients(Array.isArray(pacRes) ? pacRes : []);

    } catch (error) {
      console.error(error);
      setError("Error cargando datos del sistema");
    } finally {
      setIsLoading(false);
    }
  };

  // --- ESTADÍSTICAS ---
  const stats = {
    total: appointments.length,
    activas: appointments.filter(a => a.estado === 'programada' || a.estado === 'confirmada').length,
    pendientes: appointments.filter(a => a.estado === 'pendiente').length,
    completadas: appointments.filter(a => a.estado === 'completada' || a.estado === 'finalizada').length,
    canceladas: appointments.filter(a => a.estado === 'cancelada').length,
  };

  // --- ABRIR MODAL CREAR ---
  const openCreateDialog = () => {
    setEditingId(null); 
    setFormData({ patientId: "", doctorId: "", date: undefined, time: "", reason: "", status: "programada" });
    setShowDialog(true);
  };

  // --- ABRIR MODAL EDITAR (LÓGICA CONECTADA) ---
// --- ABRIR MODAL EDITAR (CORREGIDO) ---
  const handleEditClick = (cita: Cita) => {
    setEditingId(cita.id); 
    
    // Parsear fecha para el formulario
    const fechaStr = cita.fecha_hora_inicio || cita.fecha || "";
    const fechaObj = new Date(fechaStr);
    
    // Extraer hora
    let horaStr = "";
    if (cita.hora) {
        horaStr = cita.hora.substring(0, 5);
    } else if (isValid(fechaObj)) {
        horaStr = format(fechaObj, "HH:mm");
    }

    // BLINDAJE DE MOTIVO: Buscamos en todos los campos posibles y aseguramos que no sea null
    const motivoReal = cita.motivo || cita.motivo_consulta || "";

    setFormData({
        patientId: cita.paciente_id?.toString() || cita.paciente?.id?.toString() || "",
        doctorId: cita.medico_id?.toString() || cita.medico?.id?.toString() || "",
        date: isValid(fechaObj) ? fechaObj : undefined,
        time: horaStr,
        reason: motivoReal, // Aquí cargamos el motivo existente
        status: cita.estado || "programada"
    });
    
    setShowDialog(true);
  };

  // --- ELIMINAR CITA (CONECTADO A TU SERVICIO) ---
  const handleDeleteClick = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar esta cita?")) return;

    try {
        // Llamada a tu servicio deleteAppointment
        await appointmentsService.deleteAppointment(id);
        toast.success("Cita eliminada correctamente");
        loadData();
    } catch (error) {
        console.error("Error eliminando:", error);
        toast.error("No se pudo eliminar la cita");
    }
  };

  // --- GUARDAR (CREAR O ACTUALIZAR) ---
// --- GUARDAR (CREAR O ACTUALIZAR) ---
  const handleSaveAppointment = async () => {
    if (!formData.patientId || !formData.doctorId || !formData.date || !formData.time) {
      toast.error("Faltan campos obligatorios (Paciente, Médico, Fecha u Hora)");
      return;
    }

    setIsSubmitting(true);
    try {
      const fechaFormat = format(formData.date, "yyyy-MM-dd");
      
      // TRUCO ANTI-ERROR 422:
      // Si el motivo está vacío, enviamos un texto por defecto para que sea un 'string' válido.
      const motivoSeguro = formData.reason && formData.reason.trim() !== "" 
                           ? formData.reason 
                           : "Consulta General"; 

      if (editingId) {
        // --- ACTUALIZAR ---
        await appointmentsService.updateAppointment(editingId, {
            fecha: fechaFormat,
            hora: formData.time,
            motivo_consulta: motivoSeguro, // Usamos la variable segura
            estado: formData.status as any
        });
        toast.success("Cita actualizada correctamente");
      } else {
        // --- CREAR ---
        await appointmentsService.createAppointment({
            medico_id: parseInt(formData.doctorId),
            paciente_id: parseInt(formData.patientId),
            fecha: fechaFormat,
            hora: formData.time,
            motivo: motivoSeguro // Usamos la variable segura
        });
        toast.success("Cita creada correctamente");
      }

      setShowDialog(false);
      loadData(); 
    } catch (error: any) {
      console.error(error);
      // Mejor manejo de errores para saber qué pasa
      if (error.response && error.response.data) {
          const data = error.response.data;
          if (data.message) toast.error(`Error: ${data.message}`);
          if (data.errors) {
              // Muestra el primer error de validación que encuentre
              const firstKey = Object.keys(data.errors)[0];
              toast.error(`${firstKey}: ${data.errors[firstKey][0]}`);
          }
      } else {
          toast.error("Error al guardar la cita");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Helpers UI ---
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
                        <TableCell><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{getSpecialtyName(cita.medico?.id || 0)}</span></TableCell>
                        <TableCell>{safeFormat(cita.fecha_hora_inicio, "d MMMM yyyy")}</TableCell>
                        <TableCell>{safeFormat(cita.fecha_hora_inicio, "HH:mm")}</TableCell>
                        <TableCell><StatusBadge status={cita.estado} /></TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
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
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{editingId ? "Editar Cita" : "Nueva Cita"}</DialogTitle></DialogHeader>
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
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button className="bg-blue-600" onClick={handleSaveAppointment} disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : (editingId ? "Actualizar" : "Crear")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}