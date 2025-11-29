import { useState, useEffect } from 'react';
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { 
  Eye, Trash2, Search, Plus, ChevronLeft, ChevronRight, 
  Calendar as CalendarIcon, Loader2, Home, Pencil, Filter, X, Clock, CheckCircle2, XCircle
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from "../ui/dialog";
import { patientService } from '../../services/patient.service';
import { appointmentsService } from '../../services/appointments.service';
import { Appointment, AppointmentStatus } from '../../types';
import { toast } from 'sonner';

interface PatientAppointmentsProps {
  onNavigate: (page: string) => void;
}

type FilterType = 'todas' | 'pendientes' | 'realizadas' | 'canceladas';

export function PatientAppointments({ onNavigate }: PatientAppointmentsProps) {
  // --- Estados ---
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('todas');
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  
  // Modales
  const [viewAppointment, setViewAppointment] = useState<Appointment | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleCita, setRescheduleCita] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // --- CARGA ---
  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const data = await patientService.getMyAppointments();
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.fecha_hora_inicio).getTime();
        const dateB = new Date(b.fecha_hora_inicio).getTime();
        return dateB - dateA;
      });
      setAllAppointments(sortedData);
    } catch (error) {
      toast.error("Error al cargar tus citas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // --- FILTROS ---
  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = allAppointments.filter(cita => {
      let matchesStatus = true;
      if (activeFilter === 'pendientes') matchesStatus = ['programada', 'pendiente', 'confirmada'].includes(cita.estado);
      else if (activeFilter === 'realizadas') matchesStatus = cita.estado === 'completada';
      else if (activeFilter === 'canceladas') matchesStatus = cita.estado === 'cancelada';

      const matchesSearch = 
        getDoctorName(cita.medico).toLowerCase().includes(lowerTerm) ||
        (cita.especialidad || cita.medico?.especialidad?.nombre || "").toLowerCase().includes(lowerTerm) ||
        cita.estado.toLowerCase().includes(lowerTerm);

      return matchesStatus && matchesSearch;
    });
    setFilteredAppointments(filtered);
    setCurrentPage(1);
  }, [searchTerm, activeFilter, allAppointments]);

  // --- PAGINACIÓN ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAppointments.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredAppointments.length / rowsPerPage);

  // --- ACCIONES ---
  const handleCancel = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta cita?")) return;
    try {
      setActionLoadingId(id);
      await appointmentsService.cancelAppointment(id);
      toast.success("Cita cancelada");
      loadAppointments(); 
    } catch (error) {
      toast.error("No se pudo cancelar");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenReschedule = (cita: Appointment) => {
    setRescheduleCita(cita);
    setNewDate("");
    setNewTime("");
    setAvailableSlots([]);
    setIsRescheduleOpen(true);
  };

  useEffect(() => {
    const loadSlots = async () => {
      if (!newDate || !rescheduleCita) return;
      setLoadingSlots(true);
      try {
        const medicoId = rescheduleCita.medico?.id || (rescheduleCita as any).medico_id;
        const slots = await appointmentsService.getAvailableSlots(medicoId, newDate);
        setAvailableSlots(slots);
      } catch (error) {
        toast.error("Error al cargar horarios");
      } finally {
        setLoadingSlots(false);
      }
    };
    if (isRescheduleOpen && newDate) loadSlots();
  }, [newDate, isRescheduleOpen, rescheduleCita]);

  const submitReschedule = async () => {
    if (!rescheduleCita || !newDate || !newTime) return;
    try {
      setActionLoadingId(rescheduleCita.id);
      await appointmentsService.rescheduleAppointment(rescheduleCita.id, newDate, newTime);
      toast.success("Cita reprogramada");
      setIsRescheduleOpen(false);
      loadAppointments();
    } catch (err: any) {
      toast.error("Error al reprogramar");
    } finally {
      setActionLoadingId(null);
    }
  };

  // --- HELPERS ---
  const parseDateSafe = (dateString: string) => {
    if (!dateString) return null;
    const safeString = dateString.replace(' ', 'T'); 
    const date = new Date(safeString);
    return isNaN(date.getTime()) ? null : date;
  };
  const formatDate = (dateString: string) => {
    const date = parseDateSafe(dateString);
    return date ? date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';
  };
  const formatTime = (dateString: string) => {
    const date = parseDateSafe(dateString);
    return date ? date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '-';
  };
  const getDoctorName = (medico: any) => {
    if (!medico) return "Médico Asignado";
    const nombre = medico.nombre_completo || medico.nombre; 
    if (!nombre || nombre === "Usuario No Encontrado") return "Dr. Especialista";
    return nombre;
  };
  const getStatusBadgeClass = (status: AppointmentStatus) => {
    switch (status) {
      case 'programada': return 'bg-yellow-100 text-yellow-700 border-yellow-200 ring-1 ring-yellow-200/50';
      case 'confirmada': return 'bg-blue-100 text-blue-700 border-blue-200 ring-1 ring-blue-200/50';
      case 'completada': return 'bg-green-100 text-green-700 border-green-200 ring-1 ring-green-200/50';
      case 'cancelada': return 'bg-red-100 text-red-700 border-red-200 ring-1 ring-red-200/50';
      default: return 'bg-gray-100 text-gray-600';
    }
  };
  const isEditable = (status: AppointmentStatus) => ['programada', 'pendiente', 'confirmada'].includes(status);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <Home className="h-4 w-4" />
            <span className="text-gray-300">/</span>
            <span>Pacientes</span>
            <span className="text-gray-300">/</span>
            <span className="text-blue-600">Mis Citas</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestión de Citas</h1>
        </div>

        <Card className="border-none shadow-lg shadow-gray-200/50 bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            
            {/* --- BARRA DE HERRAMIENTAS SUPERIOR --- */}
            <div className="p-6 border-b border-gray-100 bg-white flex flex-col lg:flex-row justify-between items-center gap-6">
              
              {/* MENÚ DE TABS (Segmented Control) */}
              <div className="flex p-1 bg-gray-100/80 rounded-full gap-1 w-full lg:w-auto overflow-x-auto">
                {[
                  { id: 'todas', label: 'Todas' },
                  { id: 'pendientes', label: 'Pendientes' },
                  { id: 'realizadas', label: 'Realizadas' },
                  { id: 'canceladas', label: 'Canceladas' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id as FilterType)}
                    className={`
                      px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap
                      ${activeFilter === tab.id 
                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200' 
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* BUSCADOR Y BOTÓN */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                
                {/* --- BUSCADOR ESTILO NAVBAR (PÍLDORA) --- */}
                <div className="relative w-full sm:w-72 group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Search className="h-4 w-4" />
                  </div>
                  <Input 
                    placeholder="Buscar por doctor, especialidad..." 
                    // CLAVE: rounded-full, pl-10, bg-white
                    className="pl-10 h-10 rounded-full border-gray-200 bg-white focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="h-3 w-3" /></button>
                  )}
                </div>

                <Button 
                  onClick={() => onNavigate('reservar-cita')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 h-10 rounded-full shadow-md shadow-blue-200 transition-all w-full sm:w-auto whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-2" /> Nueva Cita
                </Button>
              </div>
            </div>

            {/* --- TABLA DE DATOS (Sin cambios funcionales) --- */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-medium">Fecha y Hora</th>
                    <th className="px-6 py-4 font-medium">Doctor</th>
                    <th className="px-6 py-4 font-medium">Especialidad</th>
                    <th className="px-6 py-4 font-medium">Estado</th>
                    <th className="px-6 py-4 text-center font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-500"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-blue-500" />Cargando registros...</td></tr>
                  ) : currentRows.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-500 bg-gray-50/30"><div className="flex flex-col items-center gap-2"><Filter className="h-10 w-10 text-gray-200" /><p className="font-medium">No se encontraron citas</p><p className="text-xs">Intenta cambiar los filtros o crea una nueva.</p></div></td></tr>
                  ) : (
                    currentRows.map((cita) => (
                      <tr key={cita.id} className="hover:bg-blue-50/30 transition-colors group">
                        {/* Fecha */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-lg text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                              <CalendarIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{formatDate(cita.fecha_hora_inicio)}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Clock className="h-3 w-3" /> {formatTime(cita.fecha_hora_inicio)}</p>
                            </div>
                          </div>
                        </td>
                        {/* Doctor */}
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{getDoctorName(cita.medico)}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Licencia disponible</p>
                        </td>
                        {/* Especialidad */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                            {cita.especialidad || cita.medico?.especialidad?.nombre || "General"}
                          </span>
                        </td>
                        {/* Estado */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(cita.estado)}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {cita.estado}
                          </span>
                        </td>
                        {/* Opciones */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button 
                              variant="ghost" size="icon"
                              onClick={() => setViewAppointment(cita)}
                              className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Ver Detalles"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {isEditable(cita.estado) && (
                              <>
                                <Button 
                                  variant="ghost" size="icon"
                                  onClick={() => handleOpenReschedule(cita)}
                                  disabled={actionLoadingId === cita.id}
                                  className="h-8 w-8 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg"
                                  title="Reprogramar"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>

                                <Button 
                                  variant="ghost" size="icon"
                                  onClick={() => handleCancel(cita.id)}
                                  disabled={actionLoadingId === cita.id}
                                  className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Cancelar"
                                >
                                  {actionLoadingId === cita.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINACIÓN (Footer) */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-gray-500 font-medium">
                Mostrando <span className="text-gray-900 font-bold">{currentRows.length > 0 ? indexOfFirstRow + 1 : 0}</span> - <span className="text-gray-900 font-bold">{Math.min(indexOfLastRow, filteredAppointments.length)}</span> de <span className="text-gray-900 font-bold">{filteredAppointments.length}</span> registros
              </p>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 text-xs border-gray-200 hover:bg-white hover:text-blue-600 rounded-lg"
                >
                  <ChevronLeft className="h-3 w-3 mr-1" /> Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-white hover:text-gray-900'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <Button 
                  variant="outline" size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="h-8 text-xs border-gray-200 hover:bg-white hover:text-blue-600 rounded-lg"
                >
                  Siguiente <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* --- MODALES (Detalles y Reprogramar - Sin cambios funcionales, solo estilos menores) --- */}
      <Dialog open={!!viewAppointment} onOpenChange={(open) => !open && setViewAppointment(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl">Detalles de la Cita</DialogTitle>
            <DialogDescription>Información completa del registro seleccionado.</DialogDescription>
          </DialogHeader>
          {viewAppointment && (
            <div className="grid grid-cols-2 gap-4 text-sm py-4">
              <div className="p-4 bg-gray-50 rounded-2xl"><p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Fecha</p><p className="font-bold text-gray-900">{formatDate(viewAppointment.fecha_hora_inicio)}</p></div>
              <div className="p-4 bg-gray-50 rounded-2xl"><p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Hora</p><p className="font-bold text-gray-900">{formatTime(viewAppointment.fecha_hora_inicio)}</p></div>
              <div className="col-span-2 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><User className="h-5 w-5"/></div>
                <div><p className="text-blue-500 text-xs uppercase font-bold tracking-wider">Médico Tratante</p><p className="font-bold text-lg text-blue-900">{getDoctorName(viewAppointment.medico)}</p></div>
              </div>
              {viewAppointment.motivo_consulta && (<div className="col-span-2 bg-gray-50 p-4 rounded-2xl border border-gray-100"><p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">Motivo de Consulta</p><p className="text-gray-700 italic leading-relaxed">"{viewAppointment.motivo_consulta}"</p></div>)}
            </div>
          )}
          <DialogFooter><Button onClick={() => setViewAppointment(null)} className="rounded-xl w-full sm:w-auto">Cerrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Reprogramar se mantiene igual funcionalmente */}
      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader><DialogTitle>Reprogramar Cita</DialogTitle><DialogDescription>Selecciona una nueva fecha y hora para tu cita.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Nueva Fecha</label><Input type="date" min={new Date().toISOString().split('T')[0]} value={newDate} onChange={(e) => setNewDate(e.target.value)} className="rounded-xl border-gray-200 h-11" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Nuevo Horario</label>{loadingSlots ? (<div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-xl"><Loader2 className="h-4 w-4 animate-spin"/> Buscando disponibilidad...</div>) : availableSlots.length > 0 ? (<div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">{availableSlots.map(slot => (<button key={slot} onClick={() => setNewTime(slot)} className={`px-2 py-2.5 text-xs rounded-lg border transition-all font-medium ${newTime === slot ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600'}`}>{slot}</button>))}</div>) : (<div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-500 italic border border-dashed">Selecciona una fecha para ver horarios.</div>)}</div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0"><Button variant="outline" onClick={() => setIsRescheduleOpen(false)} className="rounded-xl border-gray-200">Cancelar</Button><Button onClick={submitReschedule} disabled={!newDate || !newTime} className="bg-blue-600 hover:bg-blue-700 rounded-xl text-white shadow-lg shadow-blue-200">Confirmar Cambio</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}