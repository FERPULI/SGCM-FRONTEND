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
import { doctorService } from '../../services/doctor.service';
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
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* --- HEADER CON BOTÓN ATRÁS (Solicitado) --- */}
        <div className="flex items-center gap-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleBack} 
            className="rounded-full h-12 w-12 border-gray-200 bg-white hover:bg-gray-100 hover:text-blue-600 shadow-sm transition-all"
            title="Volver atrás"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Nueva Cita</h1>
            <p className="text-gray-500 mt-1">Agenda tu consulta en 3 simples pasos.</p>
          </div>
        </div>

        {/* --- STEPPER --- */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-0" />
          {[
            { id: 1, label: "Especialidad" },
            { id: 2, label: "Médico" },
            { id: 3, label: "Resumen" }
          ].map(step => (
            <div key={step.id} className="relative z-10 flex flex-col items-center flex-1 cursor-default">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${currentStep >= step.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-200 text-gray-500'}`}>{step.id}</div>
              <span className={`mt-2 text-xs font-semibold uppercase tracking-wider ${currentStep >= step.id ? 'text-blue-700' : 'text-gray-400'}`}>{step.label}</span>
            </div>
          ))}
        </div>

        {/* ================= PASO 1: ESPECIALIDADES ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* BUSCADOR HERO (CORREGIDO: PADDING PL-16) */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">¿Qué especialista necesitas hoy?</h2>
              <div className="relative max-w-2xl mx-auto group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Search className="h-6 w-6" />
                </div>
                <Input 
                  placeholder="Buscar especialidad (ej. Cardiología, Pediatría)..." 
                  // CORRECCIÓN: pl-16 para que no pise el icono
                  className="pl-16 h-16 rounded-full text-lg border-gray-200 bg-gray-50 focus:bg-white shadow-inner focus:shadow-lg focus:border-blue-500 focus:ring-blue-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {isLoadingData ? (
              <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-600" />
                <p>Cargando especialidades...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredSpecialties.map((esp) => (
                  <div 
                    key={esp.id}
                    onClick={() => handleSelectSpecialty(esp)}
                    className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 cursor-pointer flex items-center gap-4"
                  >
                    <div className="h-14 w-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      <Stethoscope className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-700">{esp.nombre}</h3>
                      <p className="text-sm text-gray-500 group-hover:text-blue-600/70 line-clamp-1">
                        {esp.descripcion || "Especialistas disponibles"}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= PASO 2: MÉDICOS ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Especialistas en {selectedSpecialty?.nombre}</h2>
                <p className="text-sm text-gray-500">Selecciona el profesional de tu preferencia</p>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Filtrar por nombre..." 
                  // CORRECCIÓN: pl-11
                  className="pl-11 h-10 border-gray-200 rounded-xl focus:ring-blue-500"
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
            </div>

            {isLoadingData ? (
              <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-600" />
                <p>Buscando doctores...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDoctors.map((doc) => (
                  <div 
                    key={doc.id_medico}
                    onClick={() => handleSelectDoctor(doc)}
                    className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer flex items-start gap-5"
                  >
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xl font-bold text-gray-500 border-2 border-white shadow-sm">
                      {getDoctorName(doc).charAt(4)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors">
                          {getDoctorName(doc)}
                        </h3>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-100">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-bold text-yellow-700">4.8</span>
                        </div>
                      </div>
                      
                      <p className="text-sm font-medium text-blue-600 mb-2">{doc.especialidad.nombre}</p>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>Consultorio: {doc.telefono_consultorio || "Central"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <span>Licencia: {doc.licencia_medica}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredDoctors.length === 0 && (
                  <div className="col-span-2 py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                    <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No se encontraron médicos con ese nombre.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= PASO 3: HORARIO (Sin cambios, ya estaba bien) ================= */}
        {currentStep === 3 && selectedDoctor && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardContent className="p-6 md:p-8">
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-blue-600" />
                      Selecciona fecha y hora
                    </h3>
                    <Input 
                      type="date" 
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="h-12 text-base cursor-pointer border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    />
                  </div>
                  <div className="mb-8">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-3 block">Horarios Disponibles</label>
                    {!selectedDate ? (
                      <div className="p-6 bg-gray-50 rounded-xl text-center text-gray-400 border border-dashed border-gray-200 text-sm">Selecciona una fecha primero</div>
                    ) : isLoadingData ? (
                      <div className="p-6 flex justify-center items-center gap-2 text-blue-600 text-sm"><Loader2 className="h-5 w-5 animate-spin" /> Cargando horarios...</div>
                    ) : availableSlots.length === 0 ? (
                      <div className="p-4 bg-orange-50 text-orange-700 rounded-xl border border-orange-100 text-center text-sm">No hay turnos disponibles.</div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`
                              py-2.5 px-2 rounded-lg font-medium text-sm transition-all duration-200 border
                              ${selectedTime === slot 
                                ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200 ring-offset-1' 
                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'}
                            `}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Motivo de consulta</label>
                    <Textarea 
                      placeholder="Describe brevemente tus síntomas..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      className="bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden sticky top-6">
                <div className="bg-gray-900 p-6 text-white">
                  <h3 className="font-bold text-lg">Resumen</h3>
                  <p className="text-gray-400 text-xs mt-1">Verifica los detalles antes de confirmar</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex gap-4 items-start">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 shrink-0"><User className="h-5 w-5" /></div>
                    <div><p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Profesional</p><p className="font-bold text-gray-900 text-sm">{getDoctorName(selectedDoctor)}</p><p className="text-xs text-gray-500">{selectedSpecialty?.nombre}</p></div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-bold border border-orange-100 shrink-0"><Clock className="h-5 w-5" /></div>
                    <div><p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Cita</p><p className="font-bold text-gray-900 text-sm capitalize">{selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }) : '-'}</p><p className="text-xs text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded w-fit mt-1">{selectedTime || 'Pendiente'}</p></div>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all" disabled={!selectedDate || !selectedTime || isSubmitting} onClick={handleConfirmBooking}>
                      {isSubmitting ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Confirmando...</>) : (<>Confirmar Reserva <CheckCircle2 className="ml-2 h-5 w-5" /></>)}
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