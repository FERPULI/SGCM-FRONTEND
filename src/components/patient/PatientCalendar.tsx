import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, User, MapPin, Loader2, AlertCircle 
} from "lucide-react";
import { patientService } from '../../services/patient.service';
import { Appointment } from '../../types';
import { toast } from 'sonner';

export function PatientCalendar() {
  // --- Estados ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());

  // --- Carga de Datos ---
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setIsLoading(true);
        const data = await patientService.getMyAppointments();
        setAppointments(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error("Error al cargar el calendario");
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadAppointments();
  }, []);

  // --- Helpers de Fecha ---
  const parseDate = (dateString: string) => {
    if (!dateString) return new Date();
    return new Date(dateString);
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay(); // 0 = Domingo
  };

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  // --- Filtros ---
  const getAppointmentsForDay = (day: number) => {
    return (appointments || []).filter(app => {
      const appDate = parseDate(app.fecha_hora_inicio);
      return (
        appDate.getDate() === day &&
        appDate.getMonth() === currentDate.getMonth() &&
        appDate.getFullYear() === currentDate.getFullYear()
      );
    }).sort((a, b) => new Date(a.fecha_hora_inicio).getTime() - new Date(b.fecha_hora_inicio).getTime());
  };

  const selectedDayAppointments = (appointments || []).filter(app => {
    const appDate = parseDate(app.fecha_hora_inicio);
    return isSameDay(appDate, selectedDay);
  }).sort((a, b) => new Date(a.fecha_hora_inicio).getTime() - new Date(b.fecha_hora_inicio).getTime());

  // Obtener las próximas 3 citas
  const getProximasCitas = () => {
    const ahora = new Date();
    return (appointments || [])
      .filter(app => {
        const fechaCita = parseDate(app.fecha_hora_inicio);
        const estadosValidos = ['programada', 'pendiente', 'confirmada', 'activa'];
        return fechaCita >= ahora && estadosValidos.includes(app.estado);
      })
      .sort((a, b) => parseDate(a.fecha_hora_inicio).getTime() - parseDate(b.fecha_hora_inicio).getTime())
      .slice(0, 3);
  };

  const proximasCitas = getProximasCitas();

  // --- Estilos de Estado ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'programada': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'confirmada': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'completada': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelada': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  // --- Renderizado Grid ---
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Celdas vacías
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[100px] bg-gray-50/30 border-b border-r border-gray-100 hidden md:block"></div>);
    }

    // Días reales
    for (let day = 1; day <= daysInMonth; day++) {
      const dayAppointments = getAppointmentsForDay(day);
      const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      
      const isSelected = isSameDay(dateObj, selectedDay);
      const isToday = isSameDay(dateObj, new Date());
      const hasEvents = dayAppointments.length > 0;

      days.push(
        <div 
          key={day} 
          onClick={() => setSelectedDay(dateObj)}
          className={`
            min-h-[80px] md:min-h-[100px] border-b border-r border-gray-100 p-2 cursor-pointer transition-all relative group flex flex-col
            ${isSelected ? 'bg-blue-600 text-white ring-2 ring-inset ring-blue-500 z-10 shadow-lg' : 'hover:bg-gray-50 bg-white'}
            ${isToday && !isSelected ? 'bg-blue-50 border-blue-200' : ''}
            ${hasEvents && !isSelected ? 'bg-blue-100/40 border-blue-200' : ''}
          `}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={`
              text-xs md:text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full transition-all
              ${isToday && !isSelected ? 'bg-blue-600 text-white shadow-md' : isSelected ? 'text-white font-bold bg-blue-500' : hasEvents ? 'text-blue-700 font-bold' : 'text-gray-700'}
            `}>
              {day}
            </span>
            {/* Indicador Móvil */}
            {hasEvents && !isSelected && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 md:hidden"></div>}
          </div>

          {/* Lista de eventos (Escritorio) */}
          <div className="flex-col gap-1 mt-1 overflow-hidden hidden md:flex">
            {dayAppointments.slice(0, 2).map((app, i) => (
              <div 
                key={i} 
                className={`text-[9px] px-1 py-0.5 rounded border truncate font-medium ${
                  isSelected 
                    ? 'bg-white/20 text-white border-white/30' 
                    : getStatusColor(app.estado)
                }`}
                title={`${app.medico?.nombre_completo}`}
              >
                {new Date(app.fecha_hora_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} {app.medico?.nombre_completo?.split(' ')[1]}
              </div>
            ))}
            {dayAppointments.length > 2 && (
              <span className={`text-[9px] pl-1 font-medium ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>+{dayAppointments.length - 2}</span>
            )}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col gap-1 mb-4">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mi Calendario</h1>
          <p className="text-gray-500">Organiza tus tiempos y revisa tus próximas consultas.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full items-start">
          
          {/* --- CALENDARIO (2/3) --- */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-lg shadow-gray-200/60 overflow-hidden bg-white rounded-2xl">
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 capitalize flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                  {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" onClick={() => changeMonth(-1)} className="h-8 w-8 rounded-full"><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="h-8 rounded-full text-xs">Hoy</Button>
                  <Button variant="outline" size="icon" onClick={() => changeMonth(1)} className="h-8 w-8 rounded-full"><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                  <div key={d} className="py-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 bg-white">
                {isLoading ? (
                  <div className="col-span-7 h-[400px] flex flex-col items-center justify-center text-gray-400">
                    <Loader2 className="h-8 w-8 animate-spin mb-2 text-blue-600" />
                    <p>Cargando...</p>
                  </div>
                ) : renderCalendarDays()}
              </div>
            </Card>
          </div>

          {/* --- AGENDA DEL DÍA (1/3) --- */}
          <div className="lg:col-span-1">
            <Card className="border-none shadow-lg shadow-gray-200/60 h-full bg-white rounded-2xl flex flex-col sticky top-6 max-h-[600px]">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-900 text-lg mb-1">Agenda del Día</h3>
                <p className="text-sm font-medium text-blue-600 capitalize flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {selectedDay.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
                {selectedDayAppointments.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CalendarIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No hay citas para este día.</p>
                  </div>
                ) : (
                  selectedDayAppointments.map(cita => (
                    <div key={cita.id} className="group relative bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${
                        cita.estado === 'confirmada' ? 'bg-emerald-500' : 
                        cita.estado === 'cancelada' ? 'bg-rose-500' : 'bg-blue-500'
                      }`} />

                      <div className="pl-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                            {new Date(cita.fecha_hora_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          <Badge variant="outline" className={`text-[10px] uppercase border-0 px-1.5 py-0 ${getStatusColor(cita.estado)}`}>
                            {cita.estado}
                          </Badge>
                        </div>
                        
                        <h4 className="font-bold text-sm text-gray-800 mt-2">
                          {cita.medico?.nombre_completo || "Dr. Asignado"}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {cita.medico?.telefono_consultorio ? 'Consultorio Privado' : 'Hospital Central'}
                        </div>

                        {cita.motivo_consulta && (
                          <div className="mt-2 text-xs text-gray-500 italic border-l-2 border-gray-200 pl-2 line-clamp-2">
                            "{cita.motivo_consulta}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

        </div>

        {/* Próximas Citas */}
        {proximasCitas.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Próximas Citas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proximasCitas.map((cita) => {
                const especialidad = cita.especialidad || 
                                   (typeof cita.medico?.especialidad === 'object' 
                                     ? cita.medico?.especialidad?.nombre 
                                     : cita.medico?.especialidad) || 
                                   "General";
                
                return (
                  <Card key={cita.id} className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {cita.medico?.nombre_completo || cita.medico?.nombre || "Médico Asignado"}
                          </h3>
                          <p className="text-sm text-blue-600">{especialidad}</p>
                        </div>
                        <Badge className={`capitalize ${getStatusColor(cita.estado)}`}>
                          {cita.estado}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{parseDate(cita.fecha_hora_inicio).toLocaleDateString('es-ES', { 
                            day: 'numeric', month: 'long', year: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{parseDate(cita.fecha_hora_inicio).toLocaleTimeString('es-ES', { 
                            hour: '2-digit', minute: '2-digit' 
                          })}</span>
                        </div>
                        {cita.motivo_consulta && (
                          <div className="flex items-start gap-2 mt-3 pt-3 border-t border-gray-100">
                            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span className="text-xs line-clamp-2">{cita.motivo_consulta}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}