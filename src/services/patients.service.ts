/**
 * Servicio de Pacientes (SIMPLIFICADO - Sin duplicar lógica de users)
 */

import { http } from './http';

export interface PatientFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export const patientsService = {
  
  /**
   * Obtener lista simplificada de pacientes para el selector de BookAppointment
   * (Busca en todos los usuarios y filtra por rol)
   */
  getPatientsForBooking: async () => {
    try {
      // 1. Pedimos todos los usuarios (ajusta el per_page según tu BD)
      const response = await http.get('users', {
        params: { per_page: 500 }
      });
      
      let rawData: any[] = [];
      if (response.data && Array.isArray(response.data.data)) {
         rawData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
         rawData = response.data;
      }

      // 2. MAPEO INTELIGENTE (Buscamos el ID de paciente donde sea que esté)
      const pacientesProcesados = rawData.map(user => {
        // BUSCAMOS EL ID REAL:
        const pacienteRelacion = user.paciente || user.patient || {};
        
        // Prioridad 1: ID dentro del objeto paciente
        // Prioridad 2: Campo directo paciente_id
        // Prioridad 3: ID del usuario
        const idReal = pacienteRelacion.id || user.paciente_id || user.patient_id || user.id;
        
        const nombreReal = user.name || user.nombre_completo || `${user.nombre || ''} ${user.apellidos || ''}`.trim() || `Usuario #${user.id}`;
        
        return {
          id: idReal, // <--- ID que el backend espera
          user_id: user.id, // Guardamos el del usuario por referencia
          nombre_completo: nombreReal,
          role: user.role || user.rol || 'user'
        };
      });

      // 3. Filtramos para mostrar solo los que parecen pacientes
      const soloPacientes = pacientesProcesados.filter(p => {
        const r = String(p.role).toLowerCase();
        return !r.includes('admin') && !r.includes('doctor') && !r.includes('medico');
      });

      return soloPacientes.length > 0 ? soloPacientes : pacientesProcesados;

    } catch (e) {
      console.error("Error crítico obteniendo usuarios:", e);
      return [];
    }
  },

  // CRUD Methods simplificados
  getPatients: async (filters?: PatientFilters) => {
    const response = await http.get('users', { params: filters });
    return response.data.data || [];
  },
  
  createPatient: async (data: any) => {
      const response = await http.post('users', data);
      return response.data;
  },

  updateProfile: async (id: number, data: any) => {
    const response = await http.put(`pacientes/${id}`, data);
    return response.data;
  }
};
