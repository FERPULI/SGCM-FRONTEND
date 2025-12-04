import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin, MoreVertical } from 'lucide-react';
import type { Appointment } from '../../types';

// --- 1. DATOS MOCK ---
const mockAppointments: Appointment[] = [
  {
    id: 1,
    patient_id: 101,
    doctor_id: 202,
    appointment_date: '2025-12-04 09:00:00',
    status: 'confirmed',
    reason: 'Consulta de seguimiento',
    created_at: '', updated_at: '',
    patient: { id: 101, user_id: 501, first_name: 'Ana', last_name: 'López', date_of_birth: '', gender: 'female', created_at: '', updated_at: '' }
  } as Appointment,
  {
    id: 2,
    patient_id: 102,
    doctor_id: 202,
    appointment_date: '2025-12-04 11:30:00',
    status: 'pending',
    reason: 'Revisión general',
    created_at: '', updated_at: '',
    patient: { id: 102, user_id: 502, first_name: 'Carlos', last_name: 'Ruiz', date_of_birth: '', gender: 'male', created_at: '', updated_at: '' }
  } as Appointment,
  {
    id: 3,
    patient_id: 103,
    doctor_id: 202,
    appointment_date: '2025-12-05 10:00:00',
    status: 'confirmed',
    reason: 'Entrega de análisis',
    created_at: '', updated_at: '',
    patient: { id: 103, user_id: 503, first_name: 'María', last_name: 'González', date_of_birth: '', gender: 'female', created_at: '', updated_at: '' }
  } as Appointment,
];

interface DoctorCalendarProps {
  appointments?: Appointment[];
}

export const DoctorCalendar: React.FC<DoctorCalendarProps> = ({ appointments = mockAppointments }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 4)); // Dic 2025
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 11, 4)); // 4 Dic 2025

  // --- LÓGICA DEL CALENDARIO ---
  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // --- FILTRADO DE CITAS ---
  const selectedDateAppointments = appointments.filter(app => {
    const appDate = new Date(app.appointment_date);
    return (
      appDate.getDate() === selectedDate.getDate() &&
      appDate.getMonth() === selectedDate.getMonth() &&
      appDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  // --- GENERACIÓN DE RESUMEN SEMANAL ---
  const generateWeekSummary = () => {
    // Encontrar el inicio de la semana (Lunes) relativo a la fecha seleccionada
    const current = new Date(selectedDate);
    const day = current.getDay(); // 0 (Domingo) - 6 (Sábado)
    // Ajuste para que la semana empiece en Lunes
    const diff = current.getDate() - day + (day === 0 ? -6 : 1); 
    
    const monday = new Date(current.setDate(diff));

    return Array.from({ length: 7 }).map((_, index) => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + index);
      
      const count = appointments.filter(app => {
        const d = new Date(app.appointment_date);
        return d.getDate() === dayDate.getDate() && 
               d.getMonth() === dayDate.getMonth() &&
               d.getFullYear() === dayDate.getFullYear();
      }).length;

      return {
        name: dayNames[dayDate.getDay()],
        number: dayDate.getDate(),
        count: count,
        isToday: dayDate.toDateString() === new Date().toDateString(),
        isSelected: dayDate.toDateString() === selectedDate.toDateString()
      };
    });
  };

  const weekSummary = generateWeekSummary();

  const renderCalendarDays = () => {
    const totalDays = daysInMonth(currentDate);
    const startDay = firstDayOfMonth(currentDate);
    const blanks = Array.from({ length: startDay });
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);

    return (
      <>
        {blanks.map((_, i) => <div key={`blank-${i}`} className="h-10 w-10" />)}
        {days.map(day => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === new Date().toDateString();
          
          const hasAppointment = appointments.some(app => {
            const d = new Date(app.appointment_date);
            return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
          });

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(date)}
              className={`
                h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all relative
                ${isSelected 
                  ? 'bg-gray-900 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
                ${isToday && !isSelected ? 'text-blue-600 font-bold bg-blue-50' : ''}
              `}
            >
              {day}
              {hasAppointment && !isSelected && (
                <span className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full"></span>
              )}
            </button>
          );
        })}
      </>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario Médico</h1>
          <p className="text-gray-500 mt-1">Vista de calendario de tus citas</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Gestionar Disponibilidad</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* PANEL IZQUIERDO: CALENDARIO */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h3 className="text-gray-600 font-medium mb-4">Selecciona una Fecha</h3>
          
          <div className="flex items-center justify-between mb-6 px-2">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2 text-center">
            {dayNames.map(day => (
              <span key={day} className="text-xs font-medium text-gray-400 uppercase">
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 place-items-center">
            {renderCalendarDays()}
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-gray-600">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Días con citas</span>
          </div>
        </div>

        {/* PANEL DERECHO: DETALLES */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 capitalize">
                {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
              </h2>
            </div>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
              {selectedDateAppointments.length}
            </span>
          </div>

          <div className="p-6 flex-1 min-h-[300px]">
            {selectedDateAppointments.length > 0 ? (
              <div className="space-y-4">
                {selectedDateAppointments.map((app) => (
                  <div key={app.id} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                      <Clock className="w-5 h-5 mb-1" />
                      <span className="text-xs font-bold">
                        {new Date(app.appointment_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-gray-900">
                          {app.patient?.first_name} {app.patient?.last_name}
                        </h4>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{app.reason}</p>
                      
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                          ${app.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}
                        `}>
                          {app.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                        </span>
                        {app.status === 'confirmed' && (
                          <div className="flex items-center text-xs text-gray-400">
                            <MapPin className="w-3 h-3 mr-1" />
                            Consultorio 204
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <CalendarIcon className="w-8 h-8 text-gray-300" />
                </div>
                <p>No hay citas programadas para este día</p>
                <button className="mt-4 text-blue-600 text-sm font-medium hover:underline">
                  Programar una cita manualmente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PANEL INFERIOR: RESUMEN SEMANAL */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-gray-600 font-medium mb-4">Resumen Semanal</h3>
        
        {/* CORRECCIÓN PRINCIPAL: grid-cols-7 para asegurar una sola fila horizontal */}
        <div className="grid grid-cols-7 gap-4">
          {weekSummary.map((day, idx) => (
            <div 
              key={idx}
              className={`
                flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer h-32
                ${day.isSelected 
                  ? 'border-blue-300 bg-blue-50' // Estilo seleccionado (Borde azul, fondo suave)
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(day.number);
                setSelectedDate(newDate);
              }}
            >
              {/* Día de la semana */}
              <span className="text-xs font-medium text-gray-500 mb-2">
                {day.name}
              </span>
              
              {/* Número del día */}
              <span className={`text-2xl font-bold mb-3 ${day.isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                {day.number}
              </span>
              
              {/* Pill de contador */}
              <span className={`
                px-3 py-0.5 rounded-full text-xs font-medium
                ${day.isSelected 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-500'
                }
              `}>
                {day.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorCalendar;