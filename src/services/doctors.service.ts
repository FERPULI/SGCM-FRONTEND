/**
 * src/services/doctors.service.ts
 * Servicio de Médicos (Corregido para evitar Logout)
 */
import { http } from './http'; 
import { 
  PaginatedResponse, 
  UserFilters, 
  DoctorDashboardData,
  Appointment 
} from '../types'; 

// --- 1. DEFINICIÓN LOCAL DE LA INTERFAZ ---
export interface DoctorDirectoryItem {
  id: number;
  nombre_completo?: string; 
  nombre?: string;
  apellidos?: string;
  especialidad_id: number;
}

const emptyPaginatedResponse: PaginatedResponse<DoctorDirectoryItem> = {
  data: [],
  links: { first: null, last: null, prev: null, next: null },
  meta: { current_page: 1, from: 0, last_page: 1, path: "", per_page: 10, to: 0, total: 0 }
};

// --- 2. DEFINIMOS EL SERVICIO ---
export const doctorService = {
  
  // --- MÉTODO PRINCIPAL (CORREGIDO) ---
  getAll: async () => {
    try {
      // CAMBIO CLAVE: Usamos 'medicos-directorio' SIN la barra al inicio.
      // Esto asegura que se concatene bien con /api (ej: /api/medicos-directorio)
      const url = 'medicos-directorio';
      
      const response = await http.get<DoctorDirectoryItem[]>(url, { params: { per_page: 100 } });
      
      // Lógica robusta para extraer datos
      if ((response.data as any).data && Array.isArray((response.data as any).data)) {
        return (response.data as any).data as DoctorDirectoryItem[];
      } else if (Array.isArray(response.data)) {
        return response.data as DoctorDirectoryItem[];
      }
      return [];
    } catch (e) {
      console.error("Error obteniendo directorio de médicos", e);
      return [];
    }
  },

  // --- MÉTODOS EXISTENTES (Rutas corregidas también) ---
  getMedicosDirectory: async (filters?: UserFilters) => {
    try {
      // Usamos la misma ruta segura
      const response = await http.get<PaginatedResponse<DoctorDirectoryItem>>('medicos-directorio', { params: filters });
      return response.data || emptyPaginatedResponse;
    } catch (e) { return emptyPaginatedResponse; }
  },

  getDashboardData: async (): Promise<DoctorDashboardData | null> => {
    try {
      // Ruta segura: 'citas' (sin barra inicial)
      const response = await http.get('citas'); 
      const rawCitas = response.data.data || response.data || [];

      // ... (El resto de tu lógica de mapeo está perfecta, la dejamos igual) ...
      const citas: Appointment[] = rawCitas.map((cita: any) => {
        const p = cita.paciente || {};
        const u = p.user || p.usuario || {}; 
        const nombre = u.name || u.nombre || p.nombre || p.first_name || 'Paciente';
        const apellido = u.last_name || u.apellidos || p.apellidos || p.last_name || '';
        const fechaReal = cita.fecha_hora_inicio || cita.appointment_date;

        return {
          id: cita.id,
          patient_id: cita.paciente_id,
          doctor_id: cita.doctor_id || cita.medico_id,
          appointment_date: fechaReal,
          status: (cita.estado || cita.status || 'pendiente').toLowerCase(),
          reason: cita.motivo_consulta || cita.motivo || cita.reason || 'Consulta General',
          patient: {
            id: p.id || 0,
            first_name: nombre,
            last_name: apellido,
            gender: p.gender || p.genero || 'other',
            user_id: p.user_id || 0, 
            date_of_birth: p.date_of_birth || '',
            created_at: '',
            updated_at: ''
          }
        } as Appointment;
      });

      const hoyStr = new Date().toISOString().split('T')[0];
      const citasHoy = citas.filter(c => c.appointment_date?.toString().startsWith(hoyStr));
      const citasPendientes = citas.filter(c => c.status === 'pendiente');
      
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
          upcoming_appointments: citas.filter(c => new Date(c.appointment_date) > new Date()).length,
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

  confirmAppointment: async (id: number) => { await http.put(`citas/${id}`, { estado: 'confirmada' }); },
  rejectAppointment: async (id: number) => { await http.put(`citas/${id}`, { estado: 'cancelada' }); }
};

// --- 3. EXPORTAMOS TAMBIÉN EL ALIAS PLURAL ---
export const doctorsService = doctorService;