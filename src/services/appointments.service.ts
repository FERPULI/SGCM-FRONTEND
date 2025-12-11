/**
 * Servicio de Citas Médicas
 * (CORREGIDO y AJUSTADO para BookAppointment)
 */

import { http, ApiResponse } from './http';
import { API_ENDPOINTS } from '../config/api';
import { Appointment, AppointmentStatus, PaginatedResponse, CreateAppointmentPayload, AvailableSlotsResponse } from '../types';

// --- Interfaces Locales (si no están en types.ts) ---
export interface UpdateAppointmentData {
  appointment_date?: string;
  reason?: string;
  notes?: string;
  status?: AppointmentStatus;
}

export interface AppointmentFilters {
  page?: number;
  per_page?: number;
  status?: AppointmentStatus;
  doctor_id?: number;
  patient_id?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// --- Objeto de paginación vacío por defecto ---
const emptyPaginatedResponse: PaginatedResponse<Appointment> = {
  data: [],
  links: { first: null, last: null, prev: null, next: null },
  meta: {
    current_page: 1,
    from: 0,
    last_page: 1,
    path: "",
    per_page: 10,
    to: 0,
    total: 0,
  }
};

export const appointmentsService = {
  /**
   * Obtener lista de citas (con paginación y filtros)
   */
  getAppointments: async (filters?: AppointmentFilters): Promise<PaginatedResponse<Appointment>> => {
    try {
      const response = await http.get<PaginatedResponse<Appointment>>(
        API_ENDPOINTS.APPOINTMENTS.LIST,
        { params: filters }
      );
      
      if (!response || !response.data) {
        return emptyPaginatedResponse;
      }
      return response.data; // Devuelve el objeto completo { data, links, meta }

    } catch (error) {
      console.error("Error al obtener citas:", error);
      return emptyPaginatedResponse;
    }
  },

  /**
   * Obtener una cita por ID
   */
  getAppointmentById: async (id: number): Promise<Appointment | null> => {
    try {
      const response = await http.get<ApiResponse<Appointment>>(
        API_ENDPOINTS.APPOINTMENTS.GET(id)
      );
      return response.data?.data || null;
    } catch (error) {
      console.error(`Error al obtener cita ${id}:`, error);
      return null;
    }
  },

  /**
   * (MODIFICADO) Crear nueva cita
   * Adaptado para recibir CreateAppointmentPayload (medico_id, fecha, hora, motivo)
   */
  createAppointment: async (data: CreateAppointmentPayload): Promise<Appointment> => {
    // Transformamos los datos al formato que espera tu API Laravel
    const payload = {
      medico_id: data.medico_id,
      paciente_id: data.paciente_id, // <-- ¡AQUÍ ENVIAMOS EL ID QUE FALTABA!
      fecha_hora_inicio: `${data.fecha} ${data.hora}:00`,
      motivo_consulta: data.motivo
    };

    const response = await http.post<ApiResponse<Appointment>>(
      API_ENDPOINTS.APPOINTMENTS.CREATE,
      payload
    );
    
    if (!response.data?.data) {
      throw new Error("La API no devolvió la cita creada.");
    }
    return response.data.data;
  },

  /**
   * Actualizar cita
   */
  updateAppointment: async (id: number, data: UpdateAppointmentData): Promise<Appointment> => {
    const response = await http.put<ApiResponse<Appointment>>(
      API_ENDPOINTS.APPOINTMENTS.UPDATE(id),
      data
    );
    if (!response.data?.data) {
      throw new Error("La API no devolvió la cita actualizada.");
    }
    return response.data.data;
  },

  /**
   * Eliminar cita
   */
  deleteAppointment: async (id: number): Promise<void> => {
    await http.delete(API_ENDPOINTS.APPOINTMENTS.DELETE(id));
  },

  /**
   * Obtener citas de un paciente
   */
  getPatientAppointments: async (patientId: number, filters?: AppointmentFilters): Promise<PaginatedResponse<Appointment>> => {
    try {
      const response = await http.get<PaginatedResponse<Appointment>>(
        API_ENDPOINTS.APPOINTMENTS.BY_PATIENT(patientId),
        { params: filters }
      );
      if (!response || !response.data) return emptyPaginatedResponse;
      return response.data;
    } catch (error) {
      return emptyPaginatedResponse;
    }
  },

  /**
   * Obtener citas de un doctor
   */
  getDoctorAppointments: async (doctorId: number, filters?: AppointmentFilters): Promise<PaginatedResponse<Appointment>> => {
    try {
      const response = await http.get<PaginatedResponse<Appointment>>(
        API_ENDPOINTS.APPOINTMENTS.BY_DOCTOR(doctorId),
        { params: filters }
      );
      if (!response || !response.data) return emptyPaginatedResponse;
      return response.data;
    } catch (error) {
      return emptyPaginatedResponse;
    }
  },

  /**
   * Cancelar cita
   */
  cancelAppointment: async (id: number, reason?: string): Promise<Appointment> => {
    const response = await http.put<ApiResponse<Appointment>>(
      API_ENDPOINTS.APPOINTMENTS.UPDATE(id),
      { 
        estado: 'cancelada',
        cancellation_reason: reason 
      }
    );
    return response.data?.data!;
  },

  /**
   * Confirmar cita
   */
  confirmAppointment: async (id: number): Promise<Appointment> => {
    const response = await http.post<ApiResponse<Appointment>>(
      API_ENDPOINTS.APPOINTMENTS.CONFIRM(id)
    );
    return response.data?.data!;
  },

  /**
   * Completar cita
   */
  completeAppointment: async (id: number, notes?: string): Promise<Appointment> => {
    const response = await http.post<ApiResponse<Appointment>>(
      API_ENDPOINTS.APPOINTMENTS.COMPLETE(id),
      { completion_notes: notes }
    );
    return response.data?.data!;
  },

  /**
   * Reprogramar cita
   */
  rescheduleAppointment: async (id: number, newDate: string, newTime: string): Promise<Appointment> => {
    // Asegurarnos de que el formato de hora sea correcto (HH:MM)
    // Los slots vienen como "15:30", así que solo necesitamos agregar ":00" si no lo tiene
    let formattedTime = newTime.trim();
    
    // Si el formato es "HH:MM", agregar ":00"
    if (formattedTime.match(/^\d{2}:\d{2}$/)) {
      formattedTime = `${formattedTime}:00`;
    }
    
    const payload = {
      fecha_hora_inicio: `${newDate} ${formattedTime}`
    };
    
    console.log('Reprogramando cita:', { 
      id, 
      newDate, 
      newTime, 
      formattedTime,
      fullDateTime: payload.fecha_hora_inicio 
    });
    
    const response = await http.put<ApiResponse<Appointment>>(
      API_ENDPOINTS.APPOINTMENTS.UPDATE(id),
      payload
    );
    
    console.log('Respuesta completa de reprogramación:', response);
    
    if (!response.data?.data) {
      throw new Error("La API no devolvió la cita reprogramada.");
    }
    
    return response.data.data;
  },

  /**
   * (MODIFICADO) Obtener horarios disponibles
   * Devuelve un array de strings ['09:00', '09:30']
   */
  getAvailableSlots: async (medicoId: number, date: string): Promise<string[]> => {
    try {
      // Tu API devuelve: { fecha: "...", slots: ["...", "..."] }
      // No está envuelta en 'data' si sigues el patrón de tu JSON de ejemplo anterior.
      // Si está envuelta en 'data', ajusta abajo.
      
      const response = await http.get<AvailableSlotsResponse>(
        API_ENDPOINTS.APPOINTMENTS.AVAILABLE_SLOTS,
        { params: { medico_id: medicoId, fecha: date } }
      );
      
      // Si la respuesta es directa:
      if (response.data && Array.isArray(response.data.slots)) {
        return response.data.slots;
      }
      
      // Si la respuesta está vacía o mal formada
      return [];

    } catch (error) {
      console.error("Error al obtener horarios disponibles:", error);
      return [];
    }
  },
};