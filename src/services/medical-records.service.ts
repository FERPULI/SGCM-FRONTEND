/**
 * Servicio de Historiales Médicos
 * 
 * Maneja todas las operaciones relacionadas con registros médicos
 */

import { http, ApiResponse } from './http';
import { API_ENDPOINTS } from '../config/api';
import { MedicalRecord } from '../types';

export interface CreateMedicalRecordData {
  appointment_id?: number;
  diagnosis: string;
  treatment: string;
  prescriptions?: string;
  notes?: string;
  vital_signs?: {
    blood_pressure?: string;
    heart_rate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
  attachments?: File[];
}

export interface UpdateMedicalRecordData extends Partial<CreateMedicalRecordData> {}

export const medicalRecordsService = {
  /**
   * Obtener registros médicos de un paciente
   */
  getMedicalRecords: async (patientId: number): Promise<MedicalRecord[]> => {
    const response = await http.get<ApiResponse<MedicalRecord[]>>(
      API_ENDPOINTS.MEDICAL_HISTORY.LIST(patientId)
    );
    
    return response.data.data!;
  },

  /**
   * Obtener un registro médico específico
   */
  getMedicalRecordById: async (patientId: number, recordId: number): Promise<MedicalRecord> => {
    const response = await http.get<ApiResponse<MedicalRecord>>(
      API_ENDPOINTS.MEDICAL_HISTORY.GET(patientId, recordId)
    );
    
    return response.data.data!;
  },

  /**
   * Crear nuevo registro médico
   */
  createMedicalRecord: async (
    patientId: number, 
    data: CreateMedicalRecordData
  ): Promise<MedicalRecord> => {
    // Si hay archivos adjuntos, usar FormData
    if (data.attachments && data.attachments.length > 0) {
      const formData = new FormData();
      
      // Agregar campos de texto
      formData.append('diagnosis', data.diagnosis);
      formData.append('treatment', data.treatment);
      if (data.prescriptions) formData.append('prescriptions', data.prescriptions);
      if (data.notes) formData.append('notes', data.notes);
      if (data.appointment_id) formData.append('appointment_id', data.appointment_id.toString());
      if (data.vital_signs) formData.append('vital_signs', JSON.stringify(data.vital_signs));
      
      // Agregar archivos
      data.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
      
      const response = await http.post<ApiResponse<MedicalRecord>>(
        API_ENDPOINTS.MEDICAL_HISTORY.CREATE(patientId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data.data!;
    }
    
    // Sin archivos, enviar JSON normal
    const response = await http.post<ApiResponse<MedicalRecord>>(
      API_ENDPOINTS.MEDICAL_HISTORY.CREATE(patientId),
      data
    );
    
    return response.data.data!;
  },

  /**
   * Actualizar registro médico
   */
  updateMedicalRecord: async (
    patientId: number,
    recordId: number,
    data: UpdateMedicalRecordData
  ): Promise<MedicalRecord> => {
    const response = await http.put<ApiResponse<MedicalRecord>>(
      API_ENDPOINTS.MEDICAL_HISTORY.UPDATE(patientId, recordId),
      data
    );
    
    return response.data.data!;
  },

  /**
   * Eliminar registro médico
   */
  deleteMedicalRecord: async (patientId: number, recordId: number): Promise<void> => {
    await http.delete(API_ENDPOINTS.MEDICAL_HISTORY.DELETE(patientId, recordId));
  },
};
