import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { StatusBadge } from "../shared/StatusBadge";
import { Cita, Especialidad } from "../../types"; 
import { Plus, Edit, Trash2, Loader2, AlertCircle, Calendar as CalendarIcon, CheckCircle2, Clock, XCircle, CalendarClock } from "lucide-react";
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
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Estado del Formulario
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    date: undefined as Date | undefined,
    time: "",
    reason: ""
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [citasRes, medicosRes, espRes, pacRes] = await Promise.all([
        appointmentsService.getAppointments(),
        doctorsService.getAll(),
        especialidadService.getAll(),
        patientsService.getAll()
      ]);

      if (citasRes && Array.isArray(citasRes.data)) setAppointments(citasRes.data);
      else if (Array.isArray(citasRes)) setAppointments(citasRes);

      // Guardamos médicos asegurando que sea array
      setDoctors(Array.isArray(medicosRes) ? medicosRes : []);
      // Debug: Ver qué llega en médicos
      console.log("Médicos cargados:", medicosRes); 
      
      setSpecialties(Array.isArray(espRes) ? espRes : []);
      setPatients(Array.isArray(pacRes) ? pacRes : []);

    } catch (error) {
      console.error(error);
      setError("Error cargando datos del sistema");
    } finally {
      setIsLoading(false);
    }
  };

  // --- CÁLCULO DE ESTADÍSTICAS ---
  const stats = {
    total: appointments.length,
    activas: appointments.filter(a => a.estado === 'programada' || a.estado === 'confirmada').length,
    pendientes: appointments.filter(a => a.estado === 'pendiente').length,
    completadas: appointments.filter(a => a.estado === 'completada' || a.estado === 'finalizada').length,
    canceladas: appointments.filter(a => a.estado === 'cancelada').length,
  };

  // --- Lógica del Formulario ---
// --- Lógica del Formulario (CORREGIDA) ---
// --- Lógica del Formulario (FORMATO FINAL) ---
// --- Lógica del Formulario (VERSIÓN FINAL COMPATIBLE) ---
  const handleCreateAppointment = async () => {
    if (!formData.patientId || !formData.doctorId || !formData.date || !formData.time) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Preparamos las piezas de la fecha
      const fechaSola = format(formData.date, "yyyy-MM-dd"); // "2025-12-20"
      const horaSola = formData.time;                        // "10:00"
      const fechaYHora = `${fechaSola} ${horaSola}:00`;      // "2025-12-20 10:00:00"

      console.log("🚀 Enviando Cita Blindada:", { 
          id_paciente: formData.patientId,
          fecha: fechaSola,
          hora: horaSola 
      });

      // 2. Enviamos TODO lo que el backend podría pedir
      await appointmentsService.createAppointment({
        // IDs como números
        medico_id: parseInt(formData.doctorId, 10),
        paciente_id: parseInt(formData.patientId, 10),
        
        // OPCIÓN A: Estándar Laravel moderno
        fecha_hora_inicio: fechaYHora,
        fecha_inicio: fechaYHora,

        // OPCIÓN B: Formato clásico (Culpable del error 500)
        // Al enviarlos explícitamente, evitamos el "undefined undefined"
        fecha: fechaSola,
        hora: horaSola,
        
        // Otros datos
        motivo: formData.reason,
        estado: 'programada'
      });

      toast.success("Cita agendada exitosamente 🎉");
      setShowAddDialog(false);
      setFormData({ patientId: "", doctorId: "", date: undefined, time: "", reason: "" }); 
      loadData(); 
    } catch (error: any) {
      console.error("Fallo al crear cita:", error);
      
      if (error.response?.data) {
        const data = error.response.data;
        if (data.message) toast.error(`Error: ${data.message}`);
        
        // Si hay errores específicos, los mostramos
        if (data.errors) {
           Object.keys(data.errors).forEach(key => {
              toast.error(`${key}: ${data.errors[key][0]}`);
           });
        }
      } else {
        toast.error("Error de conexión con el servidor");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Helpers de Visualización ---
  const getSpecialtyName = (medicoIdInCita: number) => {
    if (!medicoIdInCita) return "Sin Médico";
    let doctor = doctors.find(d => {
       if (!d) return false;
       const docAny = d as any;
       // Buscamos ID en varios lugares posibles
       const idReal = docAny.id || docAny.id_medico || docAny.user_id;
       return idReal == medicoIdInCita;
    });
    if (!doctor) return "Medico No Listado"; 
    const docAny = doctor as any;
    if (docAny.especialidad && docAny.especialidad.nombre) return docAny.especialidad.nombre;
    const espId = docAny.especialidad_id || docAny.id_especialidad;
    const specialty = specialties.find(s => s.id == espId);
    return specialty ? specialty.nombre : "Sin Especialidad";
  };

  const getPatientName = (p: PatientDirectoryItem) => {
    if (!p) return "Desconocido";
    if (p.nombre_completo) return p.nombre_completo;
    if (p.user) return `${p.user.nombre} ${p.user.apellidos}`;
    return `${p.nombre || ''} ${p.apellidos || ''}`.trim() || `Paciente #${p.id}`;
  };

  // --- RENDERIZADO INTELIGENTE DE NOMBRE DE MÉDICO ---
  const getDoctorDisplayName = (d: any) => {
    if (d.nombre_completo) return d.nombre_completo;
    if (d.user && d.user.nombre) return `${d.user.nombre} ${d.user.apellidos || ''}`;
    if (d.nombre) return `${d.nombre} ${d.apellidos || ''}`;
    if (d.name) return d.name; // Laravel default
    return `Médico #${d.id || d.id_medico}`;
  };

  const filteredAppointments = appointments.filter(cita => {
    if (!cita) return false;
    const nombrePaciente = cita.paciente?.nombre_completo || "Desconocido";
    const nombreMedico = cita.medico?.nombre_completo || "No asignado";
    const nombreEspecialidad = getSpecialtyName(cita.medico?.id || 0);

    const matchesSearch = 
      nombrePaciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nombreMedico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nombreEspecialidad.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === "todas" || cita.estado === activeTab;
    return matchesSearch && matchesTab;
  });

  const safeFormat = (dateStr: string, fmt: string) => {
    try { return isValid(new Date(dateStr)) ? format(new Date(dateStr), fmt, { locale: es }) : "-"; } catch { return "-"; }
  };

  const timeSlots = Array.from({ length: 11 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  if (error) return <div className="p-6 text-red-500 flex items-center gap-2"><AlertCircle/> {error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Gestión de Citas</h1><p className="text-gray-500 mt-1">Administra todas las citas del sistema</p></div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4 mr-2" /> Nueva Cita</Button>
      </div>

      {/* --- SECCIÓN DE TARJETAS DE RESUMEN --- */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="p-2 bg-blue-100 rounded-full mb-2"><CalendarIcon className="h-5 w-5 text-blue-600" /></div>
            <span className="text-2xl font-bold text-gray-800">{stats.total}</span>
            <span className="text-xs text-gray-500 uppercase font-semibold">Total</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="p-2 bg-indigo-100 rounded-full mb-2"><CalendarClock className="h-5 w-5 text-indigo-600" /></div>
            <span className="text-2xl font-bold text-gray-800">{stats.activas}</span>
            <span className="text-xs text-gray-500 uppercase font-semibold">Activas</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="p-2 bg-yellow-100 rounded-full mb-2"><Clock className="h-5 w-5 text-yellow-600" /></div>
            <span className="text-2xl font-bold text-gray-800">{stats.pendientes}</span>
            <span className="text-xs text-gray-500 uppercase font-semibold">Pendientes</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="p-2 bg-green-100 rounded-full mb-2"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
            <span className="text-2xl font-bold text-gray-800">{stats.completadas}</span>
            <span className="text-xs text-gray-500 uppercase font-semibold">Completadas</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="p-2 bg-red-100 rounded-full mb-2"><XCircle className="h-5 w-5 text-red-600" /></div>
            <span className="text-2xl font-bold text-gray-800">{stats.canceladas}</span>
            <span className="text-xs text-gray-500 uppercase font-semibold">Canceladas</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList><TabsTrigger value="todas">Todas</TabsTrigger><TabsTrigger value="programada">Programadas</TabsTrigger><TabsTrigger value="confirmada">Confirmadas</TabsTrigger><TabsTrigger value="completada">Completadas</TabsTrigger><TabsTrigger value="cancelada">Canceladas</TabsTrigger></TabsList>
            <TabsContent value={activeTab} className="mt-6">
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
                          <TableCell className="text-right"><div className="flex justify-end gap-2"><Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="sm" className="text-red-600"><Trash2 className="h-4 w-4" /></Button></div></TableCell>
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
      
      {/* DIÁLOGO DE NUEVA CITA */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Nueva Cita</DialogTitle></DialogHeader>
          
          <div className="grid grid-cols-2 gap-6 py-4">
            
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Select onValueChange={(val) => setFormData({...formData, patientId: val})}>
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
              <Select onValueChange={(val) => setFormData({...formData, doctorId: val})}>
                <SelectTrigger><SelectValue placeholder="Seleccionar médico" /></SelectTrigger>
                <SelectContent>
                  {doctors.map(d => {
                     // LÓGICA TODOTERRENO PARA MÉDICOS
                     const docAny = d as any;
                     // 1. Buscamos el ID donde sea (id, id_medico, user_id)
                     const idReal = docAny.id || docAny.id_medico || docAny.user_id;
                     
                     // 2. Si no tiene ID, lo saltamos
                     if (!idReal) return null;

                     return (
                       <SelectItem key={idReal} value={idReal.toString()}>
                         {getDoctorDisplayName(docAny)}
                       </SelectItem>
                     );
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
              <Select onValueChange={(val) => setFormData({...formData, time: val})}>
                <SelectTrigger><SelectValue placeholder="Seleccionar hora" /></SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Motivo de Consulta</Label>
              <Textarea 
                placeholder="Describa el motivo de la cita..." 
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
            <Button className="bg-blue-600" onClick={handleCreateAppointment} disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear Cita"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}