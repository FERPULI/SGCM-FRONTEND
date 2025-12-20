/**
 * src/services/patients.service.ts
 * (CORREGIDO: Búsqueda profunda del ID real de paciente)
 */
import { http } from './http';
import { Patient } from '../types';

export interface PatientDirectoryItem {
  id: number;
  nombre_completo: string;
  role?: string;
  // Guardamos el ID de usuario original por si acaso
  user_id?: number; 
}

export interface PatientFilters { page?: number; per_page?: number; search?: string; }

export const patientsService = {

  getAll: async (): Promise<PatientDirectoryItem[]> => {
    try {
      // 1. Pedimos usuarios (y pedimos que incluya la relación 'paciente' si es posible)
      const response = await http.get<any>('users', { 
        params: { per_page: 100, include: 'paciente,patient' } 
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
        // A veces Laravel devuelve el paciente anidado en user.paciente o user.patient
        const pacienteRelacion = user.paciente || user.patient || {};
        
        // Prioridad 1: ID dentro del objeto paciente (ej: user.paciente.id)
        // Prioridad 2: Campo directo (ej: user.paciente_id)
        // Prioridad 3: ID del usuario (si es la misma tabla)
        const idReal = pacienteRelacion.id || user.paciente_id || user.patient_id || user.id;

        const nombreReal = user.name || user.nombre_completo || `${user.nombre || ''} ${user.apellidos || ''}`.trim() || `Usuario #${user.id}`;
        
        return {
          id: idReal, // <--- Aquí va el ID que el backend espera
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

  // ... (CRUD Métodos simplificados)
  getPatients: async (filters?: PatientFilters) => {
    const response = await http.get('users', { params: filters });
    return response.data.data || [];
  },
  createPatient: async (data: any) => {
      const response = await http.post('users', data);
      return response.data;
  }
};
