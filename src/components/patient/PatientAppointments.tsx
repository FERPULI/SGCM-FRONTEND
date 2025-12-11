import { useState, useEffect } from 'react';
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { 
  Eye, Trash2, Search, Plus, Calendar as CalendarIcon, 
  Loader2, User, Pencil, Filter as FilterIcon, SlidersHorizontal, Clock, FileText
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

type FilterType = 'todas' | 'activas' | 'pendientes' | 'completadas' | 'canceladas';

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
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelCita, setCancelCita] = useState<Appointment | null>(null);

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
      if (activeFilter === 'activas') matchesStatus = cita.estado === 'activa';
      else if (activeFilter === 'pendientes') matchesStatus = cita.estado === 'pendiente';
      else if (activeFilter === 'completadas') matchesStatus = cita.estado === 'completada';
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
  const handleCancel = (cita: Appointment) => {
    setCancelCita(cita);
    setIsCancelOpen(true);
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
    if (!rescheduleCita || !newDate || !newTime) {
      toast.error("Por favor selecciona fecha y hora");
      return;
    }
    
    try {
      setActionLoadingId(rescheduleCita.id);
      
      console.log('Enviando reprogramación:', { 
        citaId: rescheduleCita.id, 
        fechaActual: rescheduleCita.fecha_hora_inicio,
        nuevaFecha: newDate, 
        nuevaHora: newTime 
      });
      
      const citaActualizada = await appointmentsService.rescheduleAppointment(
        rescheduleCita.id, 
        newDate, 
        newTime
      );
      
      console.log('Cita actualizada recibida:', citaActualizada);
      console.log('Nueva fecha_hora_inicio:', citaActualizada.fecha_hora_inicio);
      
      // Cerrar modal y limpiar estados PRIMERO
      setIsRescheduleOpen(false);
      setRescheduleCita(null);
      setNewDate("");
      setNewTime("");
      setAvailableSlots([]);
      setActionLoadingId(null);
      
      // Mostrar mensaje de éxito
      toast.success("✓ Cita reprogramada exitosamente");
      
      // Recargar completamente la lista desde el servidor
      await loadAppointments();
      
      console.log('Lista de citas recargada desde el servidor');
      
    } catch (err: any) {
      console.error("Error completo al reprogramar:", err);
      toast.error(err.response?.data?.message || "✗ Error al reprogramar la cita");
      setActionLoadingId(null);
    }
  };

  // --- CANCELAR CITA ---
  const submitCancelAppointment = async () => {
    if (!cancelCita) return;
    
    try {
      setActionLoadingId(cancelCita.id);
      
      await appointmentsService.cancelAppointment(cancelCita.id);
      
      // Cerrar modal y limpiar estados
      setIsCancelOpen(false);
      setCancelCita(null);
      setActionLoadingId(null);
      
      // Mostrar mensaje de éxito
      toast.success("✓ Cita cancelada exitosamente");
      
      // Recargar la lista desde el servidor
      await loadAppointments();
      
    } catch (err: any) {
      console.error("Error al cancelar la cita:", err);
      toast.error(err.response?.data?.message || "✗ Error al cancelar la cita");
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
    if (!dateString) return '-';
    // Extraer solo la parte de fecha sin conversión de zona horaria
    const dateOnly = dateString.split('T')[0];
    const [year, month, day] = dateOnly.split('-');
    return `${day}/${month}/${year}`;
  };
  
  const formatTime = (dateString: string) => {
    if (!dateString) return '-';
    // Extraer la hora directamente del string sin conversión
    const timePart = dateString.includes('T') ? dateString.split('T')[1] : dateString.split(' ')[1];
    if (!timePart) return '-';
    
    // Extraer HH:MM de "HH:MM:SS" o "HH:MM:SS.000000Z"
    const [hours, minutes] = timePart.split(':');
    return `${hours}:${minutes}`;
  };
  
  const getDoctorName = (medico: any) => {
    if (!medico) return "Médico Asignado";
    const nombre = medico.nombre_completo || medico.nombre; 
    if (!nombre || nombre === "Usuario No Encontrado") return "Dr. Especialista";
    return nombre;
  };
  const getStatusBadgeClass = (status: AppointmentStatus) => {
    switch (status) {
      case 'activa': return 'bg-black text-white';
      case 'pendiente': return 'bg-yellow-100 text-yellow-700';
      case 'completada': return 'bg-blue-100 text-blue-700';
      case 'cancelada': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };
  const isEditable = (status: AppointmentStatus) => ['programada', 'pendiente', 'confirmada', 'activa'].includes(status);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Citas</h1>
            <p className="text-sm text-gray-500 mt-1">Gestiona tus citas médicas</p>
          </div>
          <Button 
            onClick={() => onNavigate('reservar-cita')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-11 rounded-lg shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" /> Reservar Cita
          </Button>
        </div>

        {/* Card Principal */}
        <Card className="border-0 shadow-sm bg-white rounded-xl">
          <CardContent className="p-6 space-y-6">
            
            {/* Lista de Citas Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Lista de Citas</h2>
            </div>

            {/* Tabs de Filtro */}
            <div className="flex items-center gap-3 border-b border-gray-200 pb-1">
              {[
                { id: 'todas', label: 'Todas' },
                { id: 'activas', label: 'Activas' },
                { id: 'pendientes', label: 'Pendientes' },
                { id: 'completadas', label: 'Completadas' },
                { id: 'canceladas', label: 'Canceladas' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as FilterType)}
                  className={`
                    px-1 pb-3 text-sm font-medium transition-colors relative
                    ${activeFilter === tab.id 
                      ? 'text-blue-600' 
                      : 'text-gray-500 hover:text-gray-900'}
                  `}
                >
                  {tab.label}
                  {activeFilter === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t" />
                  )}
                </button>
              ))}
            </div>

            {/* Barra de búsqueda */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Buscar médico o especialidad..." 
                  className="pl-10 h-11 rounded-lg border-gray-200 bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                className="h-11 px-4 rounded-lg border-gray-200"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="py-16 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-blue-500" />
                  <p className="text-gray-500">Cargando citas...</p>
                </div>
              ) : currentRows.length === 0 ? (
                <div className="py-16 text-center">
                  <FilterIcon className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                  <p className="font-medium text-gray-900">No se encontraron citas</p>
                  <p className="text-sm text-gray-500 mt-1">Intenta cambiar los filtros o crea una nueva.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200">
                    <tr className="text-left text-gray-600">
                      <th className="pb-3 px-4 font-medium">Médico</th>
                      <th className="pb-3 px-4 font-medium">Especialidad</th>
                      <th className="pb-3 px-4 font-medium">Fecha</th>
                      <th className="pb-3 px-4 font-medium">Hora</th>
                      <th className="pb-3 px-4 font-medium">Estado</th>
                      <th className="pb-3 px-4 font-medium">Motivo</th>
                      <th className="pb-3 px-4 font-medium text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentRows.map((cita) => (
                      <tr key={cita.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">{getDoctorName(cita.medico)}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-blue-600 font-medium">
                            {cita.especialidad || cita.medico?.especialidad?.nombre || "General"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{formatDate(cita.fecha_hora_inicio)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {formatTime(cita.fecha_hora_inicio)}
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`${getStatusBadgeClass(cita.estado)} hover:${getStatusBadgeClass(cita.estado)} capitalize`}>
                            {cita.estado}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <FilterIcon className="h-4 w-4 text-gray-400" />
                            </div>
                            <span className="text-gray-600 text-sm truncate max-w-[150px]">
                              {cita.motivo_consulta || 'Consulta general'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setViewAppointment(cita)}
                              className="h-8 px-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                            >
                              Ver
                            </Button>

                            {isEditable(cita.estado) && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleOpenReschedule(cita)}
                                  disabled={actionLoadingId === cita.id}
                                  className="h-8 px-3 text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                                >
                                  Reprogramar
                                </Button>

                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleCancel(cita)}
                                  disabled={actionLoadingId === cita.id}
                                  className="h-8 px-3 text-gray-600 hover:text-red-600 hover:bg-red-50"
                                >
                                  Cancelar
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Modal Ver Detalles */}
      <Dialog open={!!viewAppointment} onOpenChange={(open) => !open && setViewAppointment(null)}>
        <DialogContent className="max-w-[1472px] w-[calc(100%-2rem)] rounded-lg shadow-2xl p-0 max-h-[90vh] flex flex-col">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-gray-200 shrink-0">
            <DialogTitle className="text-base font-bold text-gray-900">Detalles de la Cita</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Información completa de la cita médica
            </DialogDescription>
          </DialogHeader>
          {viewAppointment && (
            <div className="px-6 py-4 space-y-3 overflow-y-auto flex-1">
              {/* Información de la Cita */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <h3 className="text-xs font-bold text-blue-900 mb-2">Información de la Cita</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <CalendarIcon className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-600">Fecha</p>
                      <p className="text-xs font-bold text-gray-900">{formatDate(viewAppointment.fecha_hora_inicio)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-600">Hora</p>
                      <p className="text-xs font-bold text-gray-900">{formatTime(viewAppointment.fecha_hora_inicio)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información del Paciente */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <h3 className="text-xs font-bold text-gray-900 mb-2">Información del Paciente</h3>
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-600">Nombre</p>
                    <p className="text-xs font-semibold text-gray-900">
                      {(viewAppointment as any).paciente?.nombre_completo || "Paciente"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información del Médico */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <h3 className="text-xs font-bold text-gray-900 mb-2">Información del Médico</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-gray-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-600">Nombre</p>
                      <p className="text-xs font-semibold text-gray-900">{getDoctorName(viewAppointment.medico)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-gray-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-600">Especialidad</p>
                      <p className="text-xs font-semibold text-blue-600">
                        {viewAppointment.especialidad || viewAppointment.medico?.especialidad?.nombre || "General"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Motivo de la Consulta */}
              {viewAppointment.motivo_consulta && (
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <h3 className="text-xs font-bold text-gray-900 mb-1">Motivo de la Consulta</h3>
                  <p className="text-xs text-gray-700">{viewAppointment.motivo_consulta}</p>
                </div>
              )}

              {/* Estado */}
              <div className="flex items-center justify-between pt-1 pb-2">
                <span className="text-xs font-medium text-gray-700">Estado de la cita:</span>
                <Badge className={`${getStatusBadgeClass(viewAppointment.estado)} text-xs px-3 py-1 capitalize`}>
                  {viewAppointment.estado}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter className="px-6 pb-5 pt-3 border-t border-gray-200 shrink-0">
            <Button 
              onClick={() => setViewAppointment(null)} 
              className="w-full rounded-lg h-10 bg-black hover:bg-gray-800 text-sm font-bold"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Reprogramar */}
      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent className="max-w-2xl w-[calc(100%-2rem)] rounded-xl shadow-xl p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-lg font-bold text-gray-900">Reprogramar Cita</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Selecciona una nueva fecha y hora para tu cita.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-4 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Nueva Fecha</label>
              <Input 
                type="date" 
                min={new Date().toISOString().split('T')[0]} 
                value={newDate} 
                onChange={(e) => setNewDate(e.target.value)} 
                className="rounded-lg h-10 text-sm border-gray-300" 
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Nuevo Horario</label>
              {loadingSlots ? (
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600"/> 
                  <span className="font-medium">Buscando disponibilidad...</span>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 bg-gray-50 rounded-lg border border-gray-200">
                  {availableSlots.map(slot => (
                    <button 
                      key={slot} 
                      onClick={() => setNewTime(slot)} 
                      className={`px-2 py-2 text-xs rounded-md border transition-all font-bold ${
                        newTime === slot 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105' 
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600 hover:shadow-sm'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg text-center text-xs text-gray-500 italic border border-dashed border-gray-300">
                  📅 Selecciona una fecha para ver horarios disponibles.
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 pt-2 flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsRescheduleOpen(false)} 
              className="flex-1 rounded-lg h-9 text-sm border-gray-300"
            >
              Cancelar
            </Button>
            <Button 
              onClick={submitReschedule} 
              disabled={!newDate || !newTime || !!actionLoadingId} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg h-9 text-sm font-semibold"
            >
              {actionLoadingId ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2"/> Guardando...</>
              ) : (
                '✓ Confirmar Cambio'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Cancelar Cita */}
      <Dialog open={isCancelOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCancelOpen(false);
          setCancelCita(null);
        }
      }}>
        <DialogContent className="max-w-md rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Cancelar Cita</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-2">
              ¿Estás seguro de que deseas cancelar esta cita?
            </DialogDescription>
          </DialogHeader>
          
          {cancelCita && (
            <div className="py-4 space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Médico</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {getDoctorName(cancelCita.medico)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CalendarIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Fecha y Hora</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(cancelCita.fecha_hora_inicio)} - {formatTime(cancelCita.fecha_hora_inicio)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Motivo</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {cancelCita.motivo_consulta || 'Consulta general'}
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-red-600 font-medium">
                Esta acción cambiará el estado de la cita a "Cancelada".
              </p>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCancelOpen(false);
                setCancelCita(null);
              }}
              disabled={!!actionLoadingId}
              className="flex-1 rounded-lg h-9 text-sm border-gray-300"
            >
              No, mantener cita
            </Button>
            <Button 
              onClick={submitCancelAppointment}
              disabled={!!actionLoadingId}
              className="flex-1 bg-red-600 hover:bg-red-700 rounded-lg h-9 text-sm font-semibold"
            >
              {actionLoadingId === cancelCita?.id ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2"/> Cancelando...</>
              ) : (
                'Sí, cancelar cita'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}