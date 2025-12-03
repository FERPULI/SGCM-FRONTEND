import { http } from './http';
import { API_ENDPOINTS } from '../config/api';
import { 
  DoctorDirectoryItem, 
  PaginatedResponse, 
  UserFilters, 
  DoctorDashboardData,
  Appointment 
} from '../types'; 

const emptyPaginatedResponse: PaginatedResponse<DoctorDirectoryItem> = {
  data: [],
  links: { first: null, last: null, prev: null, next: null },
  meta: { current_page: 1, from: 0, last_page: 1, path: "", per_page: 10, to: 0, total: 0, stats_generales: { totalMedicos: 0, totalEspecialidades: 0, totalCitas: 0, totalPacientesAtendidos: 0 } }
};

export const doctorService = {
  
  getMedicosDirectory: async (filters?: UserFilters) => {
    try {
      const response = await http.get<PaginatedResponse<DoctorDirectoryItem>>(API_ENDPOINTS.MEDICOS.LIST, { params: filters });
      return response.data || emptyPaginatedResponse;
    } catch (e) { return emptyPaginatedResponse; }
  },

  getDashboardData: async (): Promise<DoctorDashboardData | null> => {
    try {
      const response = await http.get('/citas'); 
      const rawCitas = response.data.data || response.data || [];

      // Mapeo robusto
      const citas: Appointment[] = rawCitas.map((cita: any) => {
        const p = cita.paciente || {};
        const u = p.user || p.usuario || {}; 
        
        const nombre = u.name || u.nombre || p.nombre || p.first_name || 'Paciente';
        const apellido = u.last_name || u.apellidos || p.apellidos || p.last_name || '';
        // Soporte para ambos nombres de campo de fecha
        const fechaReal = cita.fecha_hora_inicio || cita.appointment_date;

        return {
          id: cita.id,
          patient_id: cita.paciente_id,
          doctor_id: cita.doctor_id,
          appointment_date: fechaReal,
          status: (cita.estado || cita.status || 'pendiente').toLowerCase(),
          reason: cita.motivo || cita.reason || 'Consulta General',
          patient: {
            id: p.id || 0,
            first_name: nombre,
            last_name: apellido,
            gender: p.gender || p.genero || 'other'
          }
        };
      });

      const hoyStr = new Date().toISOString().split('T')[0];
      const citasHoy = citas.filter(c => c.appointment_date?.toString().startsWith(hoyStr));
      const citasPendientes = citas.filter(c => c.status === 'pendiente');
      const citasFuturas = citas.filter(c => new Date(c.appointment_date) > new Date());
      
      const mapPacientes = new Map();
      citas.forEach(c => {
        if (c.patient && c.patient.id !== 0 && !mapPacientes.has(c.patient.id)) {
          mapPacientes.set(c.patient.id, c.patient);
        }
      });
      const recentPatients = Array.from(mapPacientes.values()).slice(0, 5);

      return {
        stats: {
          appointments_today: citasHoy.length,
          pending_appointments: citasPendientes.length,
          upcoming_appointments: citasFuturas.length,
          unique_patients_month: recentPatients.length 
        },
        today_appointments: citasHoy,
        pending_appointments: citasPendientes,
        recent_patients: recentPatients
      };

    } catch (error) {
      console.error("Error dashboard:", error);
      return null;
    }
  },

  confirmAppointment: async (id: number) => { await http.put(`/citas/${id}`, { estado: 'confirmada' }); },
  rejectAppointment: async (id: number) => { await http.put(`/citas/${id}`, { estado: 'cancelada' }); }
};