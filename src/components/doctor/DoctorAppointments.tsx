import React, { useState } from 'react';
import { Search, Filter, Check, X, Calendar, Clock, User, FileText, AlertCircle } from 'lucide-react'; 
import type { Appointment, AppointmentStatus } from '../../types';

// --- 1. COMPONENTES INTERNOS DE UI (Para evitar dependencias externas) ---

// Badge de Estado
const StatusBadge = ({ status }: { status: AppointmentStatus }) => {
  const styles = {
    confirmed: 'bg-gray-900 text-white',      // Visual: "Activa"
    pending: 'bg-gray-100 text-gray-600',     // Visual: "Pendiente"
    completed: 'bg-gray-100 text-gray-500 border border-gray-200', // Visual: "Completada"
    cancelled: 'bg-red-50 text-red-600'       // Visual: "Cancelada"
  };

  const labels = {
    confirmed: 'Activa',
    pending: 'Pendiente',
    completed: 'Completada',
    cancelled: 'Cancelada'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
};

// Modal (Dialog) Personalizado
const AppointmentModal = ({ 
  isOpen, 
  onClose, 
  appointment, 
  formatDate 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  appointment: Appointment | null;
  formatDate: (d: string) => string;
}) => {
  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Detalles de la Cita</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Info Paciente */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
              {appointment.patient?.first_name[0]}{appointment.patient?.last_name[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {appointment.patient?.first_name} {appointment.patient?.last_name}
              </p>
              <p className="text-xs text-gray-500">Paciente</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3"/> Fecha</span>
              <span className="text-sm font-medium text-gray-900">{formatDate(appointment.appointment_date)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3"/> Hora</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(appointment.appointment_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs text-gray-500 block mb-1">Estado Actual</span>
            <StatusBadge status={appointment.status} />
          </div>

          <div>
            <span className="text-xs text-gray-500 block mb-1">Motivo de consulta</span>
            <p className="text-sm text-gray-700 bg-white border border-gray-100 p-3 rounded-md">
              {appointment.reason || 'Sin motivo especificado'}
            </p>
          </div>
          
          {appointment.notes && (
            <div>
              <span className="text-xs text-gray-500 block mb-1">Notas Adicionales</span>
              <p className="text-sm text-gray-600 italic">"{appointment.notes}"</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cerrar
          </button>
          {appointment.status === 'confirmed' && (
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
              Iniciar Consulta
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 2. DATOS MOCK (Adaptados a tus Types) ---
const mockAppointments: Appointment[] = [
  {
    id: 1,
    patient_id: 101,
    doctor_id: 202,
    appointment_date: '2025-10-27 10:00:00',
    status: 'confirmed',
    reason: 'Revisión anual',
    notes: 'Paciente refiere molestias leves en la zona lumbar.',
    created_at: '2025-10-01',
    updated_at: '2025-10-01',
    patient: { id: 101, user_id: 501, first_name: 'María', last_name: 'González', date_of_birth: '1990-05-15', gender: 'female', created_at: '', updated_at: '' }
  } as Appointment,
  {
    id: 2,
    patient_id: 102,
    doctor_id: 202,
    appointment_date: '2025-11-04 15:30:00',
    status: 'pending',
    reason: 'Consulta general',
    created_at: '2025-10-02',
    updated_at: '2025-10-02',
    patient: { id: 102, user_id: 502, first_name: 'Carlos', last_name: 'Ruiz', date_of_birth: '1985-08-20', gender: 'male', created_at: '', updated_at: '' }
  } as Appointment,
  {
    id: 3,
    patient_id: 103,
    doctor_id: 202,
    appointment_date: '2025-09-14 11:00:00',
    status: 'completed',
    reason: 'Seguimiento',
    created_at: '2025-09-01',
    updated_at: '2025-09-01',
    patient: { id: 103, user_id: 503, first_name: 'Ana', last_name: 'López', date_of_birth: '1992-03-10', gender: 'female', created_at: '', updated_at: '' }
  } as Appointment,
];

// --- 3. COMPONENTE PRINCIPAL ---
export const DoctorAppointments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<AppointmentStatus | "all">("all");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Filtros
  const filteredAppointments = mockAppointments.filter(app => {
    const fullName = `${app.patient?.first_name} ${app.patient?.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                          app.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || app.status === activeTab;
    return matchesSearch && matchesTab;
  });

  // Helpers
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', { 
      day: 'numeric', month: 'long', year: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', { 
      hour: '2-digit', minute: '2-digit', hour12: false 
    });
  };

  const getInitials = (first: string = '', last: string = '') => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const openModal = (app: Appointment) => {
    setSelectedAppointment(app);
    setShowModal(true);
  };

  const tabs = [
    { id: 'all', label: 'Todas' },
    { id: 'pending', label: 'Pendientes' },
    { id: 'confirmed', label: 'Confirmadas' },
    { id: 'completed', label: 'Completadas' },
    { id: 'cancelled', label: 'Canceladas' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>
        <p className="text-gray-500 mt-1">Administra tus citas médicas</p>
      </div>

      {/* Card Principal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        
        {/* Top Bar: Título y Buscador */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Lista de Citas</h2>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar paciente o motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                  ${activeTab === tab.id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto p-6 pt-2">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="pb-4 pl-2">Paciente</th>
                <th className="pb-4">Fecha</th>
                <th className="pb-4">Hora</th>
                <th className="pb-4">Motivo</th>
                <th className="pb-4">Estado</th>
                <th className="pb-4 text-right pr-2">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((cita) => (
                  <tr key={cita.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-200">
                          {getInitials(cita.patient?.first_name, cita.patient?.last_name)}
                        </div>
                        <span className="font-medium text-gray-900">
                          {cita.patient?.first_name} {cita.patient?.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-600">{formatDate(cita.appointment_date)}</td>
                    <td className="py-4 text-gray-600 font-medium">{formatTime(cita.appointment_date)}</td>
                    <td className="py-4 text-gray-600 max-w-xs truncate">{cita.reason}</td>
                    <td className="py-4">
                      <StatusBadge status={cita.status} />
                    </td>
                    <td className="py-4 text-right pr-2">
                      <div className="flex items-center justify-end gap-3">
                        
                        <button 
                          onClick={() => openModal(cita)}
                          className="text-gray-500 hover:text-gray-900 text-xs font-medium transition-colors"
                        >
                           Ver Detalles
                        </button>

                        {cita.status === 'confirmed' && (
                          <button className="text-blue-600 hover:text-blue-700 text-xs font-medium px-2 py-1 hover:bg-blue-50 rounded transition-colors">
                            Completar
                          </button>
                        )}

                        {cita.status === 'pending' && (
                          <>
                            <button className="text-green-600 hover:text-green-700 text-xs font-medium flex items-center gap-1 px-2 py-1 hover:bg-green-50 rounded transition-colors">
                              <Check className="w-3 h-3" /> Confirmar
                            </button>
                            <button className="text-red-500 hover:text-red-600 text-xs font-medium flex items-center gap-1 px-2 py-1 hover:bg-red-50 rounded transition-colors">
                              <X className="w-3 h-3" /> Rechazar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-gray-300"/>
                      <p>No se encontraron citas con este filtro.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renderizado del Modal Integrado */}
      <AppointmentModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        appointment={selectedAppointment}
        formatDate={formatDate}
      />
    </div>
  );
};

export default DoctorAppointments;