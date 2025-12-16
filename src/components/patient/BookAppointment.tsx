import { useState, useEffect } from 'react';
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea"; 
import { 
  Search, ChevronLeft, Stethoscope, User, Calendar as CalendarIcon, 
  Clock, CheckCircle2, Loader2, MapPin, ChevronRight, Star, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";

// Servicios y Tipos
import { especialidadService } from '../../services/especialidad.service';
import { doctorService } from '../../services/doctors.service';
import { appointmentsService } from '../../services/appointments.service';
import { Especialidad, DoctorDirectoryItem, User as UserType } from '../../types';

interface BookAppointmentProps {
  onNavigate: (page: string) => void;
  user: UserType | null;
}

export function BookAppointment({ onNavigate, user }: BookAppointmentProps) {
  // --- Estados ---
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);   
  const [searchTerm, setSearchTerm] = useState("");

  // --- Datos ---
  const [specialties, setSpecialties] = useState<Especialidad[]>([]);
  const [doctors, setDoctors] = useState<DoctorDirectoryItem[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // --- Selecciones ---
  const [selectedSpecialty, setSelectedSpecialty] = useState<Especialidad | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorDirectoryItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(""); 
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [reason, setReason] = useState("");

  // --- Helper Nombre ---
  const getDoctorName = (doc: DoctorDirectoryItem) => {
    if (!doc.nombre_completo || doc.nombre_completo === "Usuario No Encontrado") {
      return `Dr. Especialista en ${doc.especialidad.nombre}`;
    }
    return doc.nombre_completo;
  };

  // --- EFECTOS (Carga de datos) ---
  useEffect(() => {
    const loadSpecialties = async () => {
      setIsLoadingData(true);
      try {
        const data = await especialidadService.getAllEspecialidades();
        setSpecialties(data);
      } catch (error) {
        toast.error("Error al cargar especialidades");
      } finally {
        setIsLoadingData(false);
      }
    };
    if (currentStep === 1) loadSpecialties();
  }, [currentStep]);

  useEffect(() => {
    const loadDoctors = async () => {
      if (!selectedSpecialty) return;
      setIsLoadingData(true);
      try {
        const response = await doctorService.getMedicosDirectory({
          per_page: 100, 
          especialidad_id: selectedSpecialty.id 
        });
        const filtered = response.data.filter(doc => doc.especialidad.id === selectedSpecialty.id);
        setDoctors(filtered);
      } catch (error) {
        toast.error("Error al cargar médicos");
      } finally {
        setIsLoadingData(false);
      }
    };
    if (currentStep === 2) loadDoctors();
  }, [currentStep, selectedSpecialty]);

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDoctor || !selectedDate) return;
      setIsLoadingData(true);
      setAvailableSlots([]); 
      setSelectedTime("");   
      try {
        const slots = await appointmentsService.getAvailableSlots(selectedDoctor.id_medico, selectedDate);
        setAvailableSlots(slots);
      } catch (error) {
        toast.error("No se pudieron cargar los horarios.");
      } finally {
        setIsLoadingData(false);
      }
    };
    if (currentStep === 3 && selectedDate) loadSlots();
  }, [selectedDate, selectedDoctor, currentStep]);

  // --- HANDLERS ---
  const handleSelectSpecialty = (specialty: Especialidad) => {
    setSelectedSpecialty(specialty);
    setSearchTerm(""); 
    setCurrentStep(2);
  };

  const handleSelectDoctor = (doctor: DoctorDirectoryItem) => {
    setSelectedDoctor(doctor);
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today); 
    setCurrentStep(3); 
  };

  const handleConfirmBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;
    setIsSubmitting(true);
    try {
      const pacienteId = user?.paciente?.id || user?.id;
      if (!pacienteId) throw new Error("No se pudo identificar tu usuario.");

      await appointmentsService.createAppointment({
        medico_id: selectedDoctor.id_medico,
        paciente_id: pacienteId, 
        fecha: selectedDate,
        hora: selectedTime,
        motivo: reason || "Consulta general",
      });
      
      toast.success("¡Cita reservada con éxito!");
      onNavigate('inicio'); 
    } catch (err: any) {
      console.error("Error reservando:", err);
      toast.error("No se pudo reservar", { description: "Intenta nuevamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) onNavigate('inicio');
    else if (currentStep === 2) {
      setSelectedSpecialty(null);
      setDoctors([]);
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setSelectedDoctor(null);
      setSelectedDate("");
      setSelectedTime("");
      setReason("");
      setCurrentStep(2);
    }
  };

  // Filtros locales
  const filteredSpecialties = specialties.filter(s => 
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredDoctors = doctors.filter(d => 
    getDoctorName(d).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleBack} 
            className="rounded-lg h-10 w-10 border border-gray-300 bg-white hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Nueva Cita</h1>
            <p className="text-gray-500 text-sm">Agenda tu consulta en 3 pasos</p>
          </div>
        </div>

        {/* STEPPER */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            {[
              { id: 1, label: "Especialidad", icon: Stethoscope },
              { id: 2, label: "Médico", icon: User },
              { id: 3, label: "Resumen", icon: CheckCircle2 }
            ].map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all
                    ${isActive ? 'bg-blue-600 text-white' : ''}
                    ${isCompleted ? 'bg-green-600 text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-500' : ''}
                  `}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className={`text-xs font-medium ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* PASO 1: ESPECIALIDADES */}
        {currentStep === 1 && (
          <div className="space-y-6">
            
            {/* Buscador */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">¿Qué especialista necesitas?</h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input 
                  placeholder="Buscar especialidad..." 
                  className="pl-12 h-12 text-base text-center border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* Lista de especialidades */}
            {isLoadingData ? (
              <div className="py-20 flex flex-col items-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600">Cargando especialidades...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSpecialties.map((esp) => (
                  <button
                    key={esp.id}
                    onClick={() => handleSelectSpecialty(esp)}
                    className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Stethoscope className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{esp.nombre}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {esp.descripcion || "Atención especializada"}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PASO 2: MÉDICOS */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Médicos de {selectedSpecialty?.nombre}</h2>
                  <p className="text-sm text-gray-500">Selecciona tu médico preferido</p>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Buscar médico..." 
                    className="pl-10 h-10 border-gray-300"
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                </div>
              </div>
            </div>

            {isLoadingData ? (
              <div className="py-20 flex flex-col items-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600">Cargando médicos...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDoctors.map((doc) => (
                  <button
                    key={doc.id_medico}
                    onClick={() => handleSelectDoctor(doc)}
                    className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{getDoctorName(doc)}</h3>
                        <p className="text-sm text-blue-600 mb-2">{doc.especialidad.nombre}</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" />
                            <span>{doc.telefono_consultorio || "Consultorio Central"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            <span>Lic: {doc.licencia_medica}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
                {filteredDoctors.length === 0 && (
                  <div className="col-span-2 py-16 text-center bg-white rounded-xl border border-gray-200">
                    <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No se encontraron médicos</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= PASO 3: HORARIO Y RESUMEN ================= */}
        {currentStep === 3 && selectedDoctor && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="lg:col-span-2 space-y-5">
              <Card className="border-2 border-gray-100 shadow-xl bg-white rounded-3xl overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <div className="mb-7">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <CalendarIcon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Selecciona fecha y hora</h3>
                    </div>
                    <Input 
                      type="date" 
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="h-14 text-base font-medium cursor-pointer border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all shadow-sm hover:shadow-md"
                    />
                  </div>
                  
                  <div className="mb-7">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        Horarios Disponibles
                      </label>
                      {availableSlots.length > 0 && (
                        <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-semibold border border-green-200">
                          {availableSlots.length} disponibles
                        </span>
                      )}
                    </div>
                    
                    {!selectedDate ? (
                      <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl text-center border-2 border-dashed border-gray-200">
                        <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Selecciona una fecha primero</p>
                      </div>
                    ) : isLoadingData ? (
                      <div className="p-8 flex justify-center items-center gap-3">
                        <div className="w-6 h-6 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <span className="text-blue-600 font-medium">Cargando horarios...</span>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="p-6 bg-orange-50 text-orange-700 rounded-2xl border-2 border-orange-200 text-center">
                        <Clock className="h-10 w-10 text-orange-400 mx-auto mb-2" />
                        <p className="font-semibold">No hay turnos disponibles para esta fecha.</p>
                        <p className="text-sm text-orange-600 mt-1">Intenta con otra fecha</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`
                              relative py-3 px-2 rounded-xl font-bold text-sm transition-all duration-300 border-2 overflow-hidden
                              ${selectedTime === slot 
                                ? 'bg-white text-red-600 border-red-500 shadow-xl shadow-red-100 scale-105 ring-4 ring-red-100' 
                                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600 hover:shadow-lg hover:scale-105'}
                            `}
                          >
                            {selectedTime === slot && (
                              <div className="absolute top-1 right-1 bg-red-500 rounded-full p-0.5">
                                <CheckCircle2 className="h-3 w-3 text-white" />
                              </div>
                            )}
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 block flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-blue-600" />
                      Motivo de consulta
                    </label>
                    <Textarea 
                      placeholder="Describe brevemente tus síntomas o motivo de la consulta..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={4}
                      className="bg-gray-50 border-2 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl resize-none text-base"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-6 border-2 border-gray-200">
                <div className="bg-blue-600 p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-semibold">PASO 3 DE 3</span>
                  </div>
                  <h3 className="font-bold text-2xl">Resumen</h3>
                  <p className="text-blue-100 text-sm mt-1">Verifica los detalles antes de confirmar</p>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Profesional */}
                  <div className="flex gap-3 items-start p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shrink-0">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-blue-700 uppercase font-bold mb-1.5">Profesional</p>
                      <p className="font-bold text-gray-900 text-sm leading-tight mb-1">{getDoctorName(selectedDoctor)}</p>
                      <p className="text-xs text-gray-600">{selectedSpecialty?.nombre}</p>
                    </div>
                  </div>
                  
                  {/* Cita Programada */}
                  <div className="flex gap-3 items-start p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="h-12 w-12 rounded-lg bg-orange-600 flex items-center justify-center shadow-md shrink-0">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-orange-700 uppercase font-bold mb-1.5">Cita Programada</p>
                      <p className="font-semibold text-gray-900 text-sm capitalize mb-2">
                        {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Fecha pendiente'}
                      </p>
                      {selectedTime ? (
                        <div className="inline-flex items-center gap-1.5 bg-red-600 px-3 py-1.5 rounded-md shadow-sm">
                          <Clock className="h-4 w-4 text-white" />
                          <span className="text-white font-bold text-sm">{selectedTime}</span>
                        </div>
                      ) : (
                        <p className="text-sm text-red-600 font-semibold">Hora pendiente</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Botón Confirmar */}
                  <div className="pt-4 border-t border-gray-200">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base" 
                      disabled={!selectedDate || !selectedTime || isSubmitting} 
                      onClick={handleConfirmBooking}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2 text-white">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="text-white font-bold">Confirmando...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-white">
                          <span className="text-white font-bold">Confirmar Reserva</span>
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}