import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, User, MapPin, Loader2, AlertCircle, Search
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

  // --- Helpers de Fecha (Robustos) ---
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

  // --- Filtros de Citas ---
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

  // --- Estilos de Estado (Visual) ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'programada': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'confirmada': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'completada': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelada': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // --- Renderizado del Grid (Motor del Calendario) ---
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Celdas vacías (Relleno inicial)
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="bg-gray-50/30 border-b border-r border-gray-200/60 h-32 lg:h-40"></div>);
    }

    // Días reales
    for (let day = 1; day <= daysInMonth; day++) {
      const dayAppointments = getAppointmentsForDay(day);
      const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      
      const isSelected = isSameDay(dateObj, selectedDay);
      const isToday = isSameDay(dateObj, new Date());

      days.push(
        <div 
          key={day} 
          onClick={() => setSelectedDay(dateObj)}
          className={`
            h-32 lg:h-40 border-b border-r border-gray-200/60 p-2 cursor-pointer transition-all relative group flex flex-col
            ${isSelected ? 'bg-white ring-2 ring-inset ring-blue-600 z-10' : 'hover:bg-gray-50 bg-white'}
            ${isToday && !isSelected ? 'bg-blue-50/30' : ''}
          `}
        >
          {/* Cabecera del Día (Número) */}
          <div className="flex justify-between items-start mb-1">
            <span className={`
              text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-all
              ${isToday 
                ? 'bg-blue-600 text-white shadow-md' 
                : isSelected 
                  ? 'text-blue-700 font-bold bg-blue-50' 
                  : 'text-gray-700 group-hover:text-black'}
            `}>
              {day}
            </span>
          </div>

          {/* Lista de Eventos (Chips dentro del calendario) */}
          <div className="flex flex-col gap-1 mt-1 overflow-hidden flex-1">
            {dayAppointments.slice(0, 3).map((app, i) => (
              <div 
                key={i} 
                className={`
                  text-[10px] px-1.5 py-1 rounded border truncate font-medium flex items-center gap-1.5
                  ${getStatusColor(app.estado)}
                `}
                title={`${new Date(app.fecha_hora_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${app.medico?.nombre_completo}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  app.estado === 'confirmada' ? 'bg-emerald-500' : 
                  app.estado === 'cancelada' ? 'bg-rose-500' : 'bg-blue-500'
                }`} />
                <span className="truncate">
                  {new Date(app.fecha_hora_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} {app.medico?.nombre_completo?.split(' ')[0]}
                </span>
              </div>
            ))}
            
            {/* Indicador de "Ver más" */}
            {dayAppointments.length > 3 && (
              <span className="text-[10px] text-gray-400 pl-1 font-medium hover:text-blue-600 transition-colors">
                +{dayAppointments.length - 3} más
              </span>
            )}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-[1920px] mx-auto space-y-6">
        
        {/* Título Principal */}
        <div className="flex flex-col gap-1 mb-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mi Calendario</h1>
          <p className="text-gray-500">Planificación mensual de tus consultas.</p>
        </div>

        {/* LAYOUT PRINCIPAL: 2 COLUMNAS (CALENDARIO | AGENDA) */}
        <div className="flex flex-col xl:flex-row gap-6 h-full">
          
          {/* --- IZQUIERDA: CALENDARIO COMPLETO (Flexible) --- */}
          <div className="flex-1 min-w-0">
            <Card className="border-none shadow-xl shadow-gray-200/60 overflow-hidden bg-white rounded-2xl h-full flex flex-col">
              
              {/* Controles del Mes */}
              <div className="flex flex-col sm:flex-row justify-between items-center p-5 border-b border-gray-100 gap-4 bg-white">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-gray-900 capitalize flex items-center gap-2">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                    {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                    <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)} className="h-8 w-8 hover:bg-white hover:shadow-sm rounded-md"><ChevronLeft className="h-4 w-4" /></Button>
                    <div className="h-4 w-[1px] bg-gray-300 mx-1" />
                    <Button variant="ghost" size="icon" onClick={() => changeMonth(1)} className="h-8 w-8 hover:bg-white hover:shadow-sm rounded-md"><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200">
                  Volver a Hoy
                </Button>
              </div>

              {/* Encabezados de Días (Lun-Dom) */}
              <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                  <div key={d} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">{d}</div>
                ))}
              </div>

              {/* El Grid del Calendario */}
              <div className="grid grid-cols-7 bg-white flex-1 auto-rows-fr">
                {isLoading ? (
                  <div className="col-span-7 h-[600px] flex flex-col items-center justify-center text-gray-400">
                    <Loader2 className="h-12 w-12 animate-spin mb-4 text-blue-600" />
                    <p className="text-lg">Sincronizando agenda...</p>
                  </div>
                ) : (
                  renderCalendarDays()
                )}
              </div>
            </Card>
          </div>

          {/* --- DERECHA: AGENDA LATERAL (Ancho Fijo) --- */}
          <div className="w-full xl:w-[400px] shrink-0">
            <Card className="border-none shadow-xl shadow-gray-200/60 h-full bg-white rounded-2xl flex flex-col overflow-hidden sticky top-6 max-h-[calc(100vh-100px)]">
              
              {/* Header Agenda */}
              <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">Agenda del Día</h3>
                  <Badge variant="secondary" className="bg-white border-gray-200 text-gray-600">
                    {selectedDayAppointments.length} citas
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <div className="p-1.5 bg-blue-100 rounded-md">
                    <CalendarIcon className="h-4 w-4" />
                  </div>
                  <span className="capitalize text-lg">
                    {selectedDay.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'long' })}
                  </span>
                </div>
              </div>
              
              {/* Lista de Eventos (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                {selectedDayAppointments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                      <Clock className="h-8 w-8 text-gray-300" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Sin eventos</h4>
                    <p className="text-sm text-gray-500 max-w-[200px]">No tienes citas programadas para este día.</p>
                  </div>
                ) : (
                  selectedDayAppointments.map(cita => (
                    <div key={cita.id} className="group relative bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300">
                      {/* Indicador de Hora */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                          {new Date(cita.fecha_hora_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <div className="h-[1px] flex-1 bg-gray-100 group-hover:bg-blue-100 transition-colors" />
                        <Badge className={`text-[10px] uppercase shadow-none border-0 ${getStatusColor(cita.estado)}`}>
                          {cita.estado}
                        </Badge>
                      </div>

                      {/* Detalles */}
                      <div className="space-y-2 pl-1">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 bg-blue-50 p-1.5 rounded-full text-blue-600">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800 leading-none">
                              {cita.medico?.nombre_completo || "Dr. Asignado"}
                            </p>
                            <p className="text-xs text-blue-600 font-medium mt-1">
                              {cita.especialidad || cita.medico?.especialidad?.nombre || "General"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 bg-gray-100 p-1.5 rounded-full text-gray-500">
                            <MapPin className="h-3.5 w-3.5" />
                          </div>
                          <p className="text-xs text-gray-600 mt-1 leading-tight">
                            {cita.medico?.telefono_consultorio ? 'Consultorio Privado' : 'Hospital Central, Piso 3'}
                          </p>
                        </div>

                        {cita.motivo_consulta && (
                          <div className="mt-3 pt-3 border-t border-gray-50 flex gap-2">
                            <AlertCircle className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-gray-500 italic line-clamp-2">"{cita.motivo_consulta}"</p>
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
      </div>
    </div>
  );
}