/**
 * Exportaciones centralizadas de servicios
 * 
 * Punto de entrada único para todos los servicios de la API
 */

export * from './http';
export * from './auth.service';
export * from './appointments.service';
export * from './patients.service';
export * from './doctor.service';
export * from './users.service';
export * from './medical-records.service';
export * from './reports.service';
export * from './notifications.service';
export * from './settings.service';

// Exportar servicios como objeto para uso directo
export { authService } from './auth.service';
export { appointmentsService } from './appointments.service';
export { patientsService } from './patients.service';
export { doctorService } from './doctor.service';
export { usersService } from './users.service';
export { medicalRecordsService } from './medical-records.service';
export { reportsService } from './reports.service';
export { notificationsService } from './notifications.service';
export { settingsService } from './settings.service';
