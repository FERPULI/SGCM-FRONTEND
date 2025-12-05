import { useState, useEffect } from 'react';
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { 
  Eye, Trash2, Search, Plus, Calendar as CalendarIcon, 
  Loader2, User, Pencil, Filter as FilterIcon, SlidersHorizontal
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
                                  onClick={() => handleCancel(cita.id)}
                                  disabled={actionLoadingId === cita.id}
                                  className="h-8 px-3 text-gray-600 hover:text-red-600 hover:bg-red-50"
                                >
                                  {actionLoadingId === cita.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    'Cancelar'
                                  )}
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
        <DialogContent className="sm:max-w-md rounded-xl border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Detalles de la Cita</DialogTitle>
            <DialogDescription>Información completa del registro seleccionado.</DialogDescription>
          </DialogHeader>
          {viewAppointment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Fecha</p>
                  <p className="font-semibold text-gray-900">{formatDate(viewAppointment.fecha_hora_inicio)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Hora</p>
                  <p className="font-semibold text-gray-900">{formatTime(viewAppointment.fecha_hora_inicio)}</p>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-600 font-medium mb-1">Médico Tratante</p>
                <p className="font-bold text-blue-900">{getDoctorName(viewAppointment.medico)}</p>
                <p className="text-sm text-blue-700 mt-1">
                  {viewAppointment.especialidad || viewAppointment.medico?.especialidad?.nombre || "General"}
                </p>
              </div>

              {viewAppointment.motivo_consulta && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Motivo de Consulta</p>
                  <p className="text-gray-700 leading-relaxed">"{viewAppointment.motivo_consulta}"</p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Estado</p>
                <Badge className={`${getStatusBadgeClass(viewAppointment.estado)} hover:${getStatusBadgeClass(viewAppointment.estado)}`}>
                  {viewAppointment.estado}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewAppointment(null)} className="w-full rounded-lg">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Reprogramar */}
      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent className="sm:max-w-md rounded-xl border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle>Reprogramar Cita</DialogTitle>
            <DialogDescription>Selecciona una nueva fecha y hora para tu cita.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nueva Fecha</label>
              <Input 
                type="date" 
                min={new Date().toISOString().split('T')[0]} 
                value={newDate} 
                onChange={(e) => setNewDate(e.target.value)} 
                className="rounded-lg h-11" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nuevo Horario</label>
              {loadingSlots ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin"/> Buscando disponibilidad...
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                  {availableSlots.map(slot => (
                    <button 
                      key={slot} 
                      onClick={() => setNewTime(slot)} 
                      className={`px-2 py-2.5 text-xs rounded-lg border transition-all font-medium ${
                        newTime === slot 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                          : 'bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg text-center text-xs text-gray-500 italic border border-dashed">
                  Selecciona una fecha para ver horarios.
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setIsRescheduleOpen(false)} 
              className="rounded-lg"
            >
              Cancelar
            </Button>
            <Button 
              onClick={submitReschedule} 
              disabled={!newDate || !newTime} 
              className="bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Confirmar Cambio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}