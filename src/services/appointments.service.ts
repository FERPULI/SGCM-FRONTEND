import { http } from './http';
import { API_ENDPOINTS } from '../config/api';
import { Cita, PaginatedResponse, AppointmentStatus } from '../types';

export interface CreateAppointmentPayload {
  medico_id: number | string;
  paciente_id: number | string;
  fecha: string; // YYYY-MM-DD
  hora: string;  // HH:mm
  motivo: string;
}

export interface UpdateAppointmentData {
  fecha?: string;
  hora?: string;
  motivo_consulta?: string;
  estado?: AppointmentStatus;
}

const emptyPaginatedResponse: PaginatedResponse<Cita> = {
  data: [],
  links: { first: null, last: null, prev: null, next: null },
  meta: { current_page: 1, from: 0, last_page: 1, per_page: 10, to: 0, total: 0 }
};

export const appointmentsService = {
  /**
   * 1. Obtener citas (SOLICITANDO ORDEN DESCENDENTE)
   */
  getAppointments: async (filters?: any): Promise<PaginatedResponse<Cita>> => {
    try {
      // Intentamos forzar al servidor a darnos las más nuevas primero y muchas (300)
      const params = { 
          ...filters, 
          per_page: 300, 
          sort_by: 'desc', // Intentos comunes de ordenamiento
          order: 'desc',
          orderBy: 'id'
      };

      const response = await http.get<PaginatedResponse<Cita>>(
        API_ENDPOINTS.APPOINTMENTS.LIST, 
        { params }
      );
      
      // Manejo flexible de la respuesta
      if (response.data && (response.data as any).data && Array.isArray((response.data as any).data)) {
         return response.data;
      } else if (Array.isArray(response.data)) {
         return { ...emptyPaginatedResponse, data: response.data as any };
      }
      return response.data || emptyPaginatedResponse;
    } catch (error) {
      console.error("Error al obtener citas:", error);
      return emptyPaginatedResponse;
    }
  },

  getAppointmentById: async (id: number): Promise<Cita | null> => {
    try {
      const response = await http.get<{ data: Cita }>(API_ENDPOINTS.APPOINTMENTS.GET(id));
      return response.data.data || (response.data as any);
    } catch (error) { return null; }
  },

  /**
   * 2. CREAR CITA (SOLUCIÓN QUIRÚRGICA)
   * Enviamos formato SQL puro y duro. Es lo que menos falla.
   */
  createAppointment: async (data: CreateAppointmentPayload): Promise<Cita> => {
    // Construcción manual de fechas YYYY-MM-DD HH:mm:ss
    const fechaInicio = `${data.fecha} ${data.hora}:00`;
    
    // Calculamos fin (+30 min)
    const d = new Date(`${data.fecha}T${data.hora}:00`);
    d.setMinutes(d.getMinutes() + 30);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const fechaFin = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

    const payload = {
      medico_id: Number(data.medico_id),
      paciente_id: Number(data.paciente_id),
      // Campos de fecha estándar
      fecha_hora_inicio: fechaInicio,
      fecha_hora_fin: fechaFin,
      // Campos redundantes pero seguros (sin cambiar nombres)
      motivo_consulta: data.motivo,
      estado: 'programada'
    };

    console.log("🚀 Payload Limpio:", payload);

    const response = await http.post<{ data: Cita }>(
      API_ENDPOINTS.APPOINTMENTS.CREATE,
      payload
    );
    
    return response.data.data || (response.data as any);
  },

  updateAppointment: async (id: number, data: UpdateAppointmentData): Promise<Cita> => {
    const payload: any = { ...data };
    if (data.fecha && data.hora) {
        payload.fecha_hora_inicio = `${data.fecha} ${data.hora}:00`;
        delete payload.fecha;
        delete payload.hora;
    }
    const response = await http.put(API_ENDPOINTS.APPOINTMENTS.UPDATE(id), payload);
    return (response.data as any).data || response.data;
  },

  deleteAppointment: async (id: number): Promise<void> => {
    await http.delete(API_ENDPOINTS.APPOINTMENTS.DELETE(id));
  },

  cancelAppointment: async (id: number, reason?: string): Promise<Cita> => {
    const response = await http.put<{ data: Cita }>(
      API_ENDPOINTS.APPOINTMENTS.UPDATE(id),
      { estado: 'cancelada', notas_paciente: reason }
    );
    return response.data.data || (response.data as any);
  }
};