import { User, Appointment, MedicalRecord } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    nombre: 'María González',
    email: 'maria@email.com',
    telefono: '+34 612 345 678',
    rol: 'paciente',
  },
  {
    id: '2',
    nombre: 'Dr. Carlos Ramírez',
    email: 'carlos@hospital.com',
    telefono: '+34 623 456 789',
    rol: 'medico',
    especialidad: 'Cardiología',
    numeroLicencia: 'MED-12345',
  },
  {
    id: '3',
    nombre: 'Dra. Ana Martínez',
    email: 'ana@hospital.com',
    telefono: '+34 634 567 890',
    rol: 'medico',
    especialidad: 'Pediatría',
    numeroLicencia: 'MED-12346',
  },
  {
    id: '4',
    nombre: 'Admin Sistema',
    email: 'admin@hospital.com',
    telefono: '+34 645 678 901',
    rol: 'administrador',
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    pacienteId: '1',
    pacienteNombre: 'María González',
    medicoId: '2',
    medicoNombre: 'Dr. Carlos Ramírez',
    especialidad: 'Cardiología',
    fecha: '2025-10-28',
    hora: '10:00',
    estado: 'activa',
    motivo: 'Revisión anual',
  },
  {
    id: '2',
    pacienteId: '1',
    pacienteNombre: 'María González',
    medicoId: '3',
    medicoNombre: 'Dra. Ana Martínez',
    especialidad: 'Pediatría',
    fecha: '2025-11-05',
    hora: '15:30',
    estado: 'pendiente',
    motivo: 'Consulta general',
  },
  {
    id: '3',
    pacienteId: '1',
    pacienteNombre: 'María González',
    medicoId: '2',
    medicoNombre: 'Dr. Carlos Ramírez',
    especialidad: 'Cardiología',
    fecha: '2025-09-15',
    hora: '11:00',
    estado: 'completada',
    motivo: 'Seguimiento',
  },
];

export const mockMedicalRecords: MedicalRecord[] = [
  {
    id: '1',
    pacienteId: '1',
    fecha: '2025-09-15',
    diagnostico: 'Hipertensión arterial leve',
    tratamiento: 'Cambios en la dieta y ejercicio regular',
    medicoNombre: 'Dr. Carlos Ramírez',
    notas: 'Paciente muestra mejora en presión arterial',
  },
  {
    id: '2',
    pacienteId: '1',
    fecha: '2025-08-10',
    diagnostico: 'Resfriado común',
    tratamiento: 'Reposo y líquidos abundantes',
    medicoNombre: 'Dra. Ana Martínez',
  },
];

export const mockDoctors = mockUsers.filter(u => u.rol === 'medico');

export const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30'
];
