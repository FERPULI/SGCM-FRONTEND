/**
 * Servicio de Pacientes
 * 
 * Maneja todas las operaciones relacionadas con pacientes
 */

import { http, ApiResponse, PaginatedResponse } from './http';
import { API_ENDPOINTS } from '../config/api';
import { Patient, MedicalRecord } from '../types';

export interface CreatePatientData {
  user_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string; // formato: YYYY-MM-DD
  gender: 'male' | 'female' | 'other';
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  blood_type?: string;
  allergies?: string;
  chronic_conditions?: string;
}

export interface UpdatePatientData extends Partial<CreatePatientData> {}

export interface PatientFilters {
  page?: number;
  per_page?: number;
  search?: string;
  gender?: string;
  age_from?: number;
  age_to?: number;
}

export const patientsService = {
  /**
   * Obtener lista de pacientes
   */
  getPatients: async (filters?: PatientFilters): Promise<PaginatedResponse<Patient>> => {
    const response = await http.get<ApiResponse<PaginatedResponse<Patient>>>(
      API_ENDPOINTS.PATIENTS.LIST,
      { params: filters }
    );
    
    return response.data.data!;
  },

  /**
   * Obtener un paciente por ID
   */
  getPatientById: async (id: number): Promise<Patient> => {
    const response = await http.get<ApiResponse<Patient>>(
      API_ENDPOINTS.PATIENTS.GET(id)
    );
    
    return response.data.data!;
  },

  /**
   * Crear nuevo paciente
   */
  createPatient: async (data: CreatePatientData): Promise<Patient> => {
    const response = await http.post<ApiResponse<Patient>>(
      API_ENDPOINTS.PATIENTS.CREATE,
      data
    );
    
    return response.data.data!;
  },

  /**
   * Actualizar paciente
   */
  updatePatient: async (id: number, data: UpdatePatientData): Promise<Patient> => {
    const response = await http.put<ApiResponse<Patient>>(
      API_ENDPOINTS.PATIENTS.UPDATE(id),
      data
    );
    
    return response.data.data!;
  },

  /**
   * Eliminar paciente
   */
  deletePatient: async (id: number): Promise<void> => {
    await http.delete(API_ENDPOINTS.PATIENTS.DELETE(id));
  },

  /**
   * Obtener historial médico de un paciente
   */
  getMedicalHistory: async (patientId: number): Promise<MedicalRecord[]> => {
    const response = await http.get<ApiResponse<MedicalRecord[]>>(
      API_ENDPOINTS.PATIENTS.MEDICAL_HISTORY(patientId)
    );
    
    return response.data.data!;
  },

  /**
   * Obtener perfil del paciente autenticado
   */
  getMyProfile: async (): Promise<Patient> => {
    const response = await http.get<ApiResponse<Patient>>(
      API_ENDPOINTS.PATIENTS.PROFILE
    );
    
    return response.data.data!;
  },

  /**
   * Actualizar perfil del paciente autenticado
   */
  updateMyProfile: async (data: UpdatePatientData): Promise<Patient> => {
    const response = await http.put<ApiResponse<Patient>>(
      API_ENDPOINTS.PATIENTS.PROFILE,
      data
    );
    
    return response.data.data!;
  },
};
