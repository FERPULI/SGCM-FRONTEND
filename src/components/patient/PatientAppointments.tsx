import { useState, useEffect } from 'react';
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { 
  Eye, Trash2, Search, Plus, ChevronLeft, ChevronRight, 
  Calendar as CalendarIcon, Loader2, Home, Pencil, Filter
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

// --- Definimos los nuevos tipos de filtro ---
type FilterType = 'todas' | 'pendientes' | 'realizadas' | 'canceladas';

export function PatientAppointments({ onNavigate }: PatientAppointmentsProps) {
  // --- Estados de Datos ---
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- Estados de UI ---
  const [activeFilter, setActiveFilter] = useState<FilterType>('todas'); // <--- NUEVO ESTADO
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // --- Estados de Acción ---
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  
  // --- Estados de Modales ---
  const [viewAppointment, setViewAppointment] = useState<Appointment | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleCita, setRescheduleCita] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // --- CARGA DE DATOS ---
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
      // (El filtrado se hará automáticamente por el useEffect)
    } catch (error) {
      toast.error("Error al cargar tus citas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // --- FILTRADO DOBLE (PESTAÑA + BUSCADOR) ---
  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    
    const filtered = allAppointments.filter(cita => {
      // 1. Filtro por Pestaña (Estado)
      let matchesStatus = true;
      if (activeFilter === 'pendientes') {
        matchesStatus = ['programada', 'pendiente', 'confirmada'].includes(cita.estado);
      } else if (activeFilter === 'realizadas') {
        matchesStatus = cita.estado === 'completada';
      } else if (activeFilter === 'canceladas') {
        matchesStatus = cita.estado === 'cancelada';
      }
      // 'todas' pasa siempre (matchesStatus = true)

      // 2. Filtro por Buscador (Texto)
      const matchesSearch = 
        getDoctorName(cita.medico).toLowerCase().includes(lowerTerm) ||
        (cita.especialidad || cita.medico?.especialidad?.nombre || "").toLowerCase().includes(lowerTerm) ||
        cita.estado.toLowerCase().includes(lowerTerm);

      return matchesStatus && matchesSearch;
    });

    setFilteredAppointments(filtered);
    setCurrentPage(1); // Resetear paginación al cambiar filtros
  }, [searchTerm, activeFilter, allAppointments]);

  // --- PAGINACIÓN ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAppointments.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredAppointments.length / rowsPerPage);

  // --- ACCIONES (Cancelar/Reprogramar) ---
  const handleCancel = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta cita?")) return;
    try {
      setActionLoadingId(id);
      await appointmentsService.cancelAppointment(id);
      toast.success("Cita cancelada correctamente");
      loadAppointments(); 
    } catch (error) {
      toast.error("No se pudo cancelar la cita");
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
      toast.success("Cita reprogramada con éxito");
      setIsRescheduleOpen(false);
      loadAppointments();
    } catch (err: any) {
      toast.error("No se pudo reprogramar", { description: "El horario podría estar ocupado." });
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
    if (!date) return dateString || '-';
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = parseDateSafe(dateString);
    if (!date) return '-';
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const getDoctorName = (medico: any) => {
    if (!medico) return "Médico Asignado";
    const nombre = medico.nombre_completo || medico.nombre; 
    if (!nombre || nombre === "Usuario No Encontrado") return "Dr. Especialista";
    return nombre;
  };

  const getStatusBadgeClass = (status: AppointmentStatus) => {
    switch (status) {
      case 'programada': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'confirmada': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completada': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelada': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const isEditable = (status: AppointmentStatus) => {
    return ['programada', 'pendiente', 'confirmada'].includes(status);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Breadcrumb y Título */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Home className="h-4 w-4" />
            <span>/</span>
            <span>Mis Citas</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Mis Citas</h1>
        </div>

        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-6 space-y-6">
            
            {/* --- NUEVO MENÚ DE FILTROS (TABS) --- */}
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 overflow-x-auto">
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
                    px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                    ${activeFilter === tab.id 
                      ? 'bg-blue-50 text-blue-700 font-semibold' // Estilo Activo
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} // Estilo Inactivo
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Barra de Herramientas (Buscador y Agregar) */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Buscar por médico, especialidad..." 
                    className="pl-9 border-gray-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
                  <select 
                    className="border border-gray-300 rounded p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                  <span>filas</span>
                </div>
              </div>

              <Button 
                onClick={() => onNavigate('reservar-cita')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 w-full md:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" /> Nueva Cita
              </Button>
            </div>

            {/* TABLA DE DATOS */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 w-16">#</th>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4">Hora</th>
                      <th className="px-6 py-4">Doctor</th>
                      <th className="px-6 py-4">Especialidad</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4 text-center">Opciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex justify-center items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" /> Cargando datos...
                          </div>
                        </td>
                      </tr>
                    ) : currentRows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <Filter className="h-8 w-8 text-gray-300" />
                            <p>No se encontraron citas en esta sección.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentRows.map((cita, index) => (
                        <tr key={cita.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-gray-500">
                            {indexOfFirstRow + index + 1}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {formatDate(cita.fecha_hora_inicio)}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {formatTime(cita.fecha_hora_inicio)}
                          </td>
                          <td className="px-6 py-4 text-gray-900">
                            {getDoctorName(cita.medico)}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {cita.especialidad || cita.medico?.especialidad?.nombre || "General"}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusBadgeClass(cita.estado)}`}>
                              {cita.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center items-center gap-2">
                              <button 
                                onClick={() => setViewAppointment(cita)}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                                title="Ver Detalles"
                              >
                                <Eye className="h-5 w-5" />
                              </button>

                              {isEditable(cita.estado) && (
                                <>
                                  <button 
                                    onClick={() => handleOpenReschedule(cita)}
                                    disabled={actionLoadingId === cita.id}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                    title="Reprogramar"
                                  >
                                    <Pencil className="h-5 w-5" />
                                  </button>

                                  <button 
                                    onClick={() => handleCancel(cita.id)}
                                    disabled={actionLoadingId === cita.id}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    title="Cancelar"
                                  >
                                    {actionLoadingId === cita.id ? (
                                      <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-5 w-5" />
                                    )}
                                  </button>
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
            </div>

            {/* Paginación */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
              <p className="text-sm text-gray-500">
                Mostrando {indexOfFirstRow + 1} a {Math.min(indexOfLastRow, filteredAppointments.length)} de {filteredAppointments.length} entradas
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                </Button>
                <span className="text-sm font-medium px-2">
                  {currentPage} / {totalPages || 1}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* --- MODAL DETALLES --- */}
      <Dialog open={!!viewAppointment} onOpenChange={(open) => !open && setViewAppointment(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles de la Cita</DialogTitle>
            <DialogDescription>Información completa del registro</DialogDescription>
          </DialogHeader>
          {viewAppointment && (
            <div className="grid grid-cols-2 gap-4 text-sm py-2">
              <div><p className="text-gray-500">Fecha</p><p className="font-medium">{formatDate(viewAppointment.fecha_hora_inicio)}</p></div>
              <div><p className="text-gray-500">Hora</p><p className="font-medium">{formatTime(viewAppointment.fecha_hora_inicio)}</p></div>
              <div className="col-span-2"><p className="text-gray-500">Médico</p><p className="font-bold">{getDoctorName(viewAppointment.medico)}</p></div>
              <div className="col-span-2"><p className="text-gray-500">Ubicación</p><p className="font-medium">{viewAppointment.medico?.telefono_consultorio ? 'Consultorio Privado' : 'Hospital Central'}</p></div>
              <div className="col-span-2"><p className="text-gray-500">Motivo</p><p className="italic text-gray-700">{viewAppointment.motivo_consulta || "Sin especificar"}</p></div>
            </div>
          )}
          <DialogFooter><Button onClick={() => setViewAppointment(null)}>Cerrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL REPROGRAMAR --- */}
      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reprogramar Cita</DialogTitle>
            <DialogDescription>Selecciona una nueva fecha y hora.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nueva Fecha</label>
              <Input 
                type="date" 
                min={new Date().toISOString().split('T')[0]}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nuevo Horario</label>
              {loadingSlots ? (
                <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin"/> Cargando horarios...</div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setNewTime(slot)}
                      className={`px-2 py-2 text-xs rounded border ${newTime === slot ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:border-blue-400'}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">Selecciona una fecha para ver horarios disponibles.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleOpen(false)}>Cancelar</Button>
            <Button onClick={submitReschedule} disabled={!newDate || !newTime}>Confirmar Cambio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}