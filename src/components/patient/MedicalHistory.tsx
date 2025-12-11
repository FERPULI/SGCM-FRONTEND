import { useState, useEffect } from 'react';
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  Activity, FileText, Calendar, User, HeartPulse, 
  AlertTriangle, Droplet, Ruler, Weight, Stethoscope, Download, Loader2
} from "lucide-react";
import { patientService } from '../../services/patient.service';
import { MedicalRecord, PatientClinicalProfile } from '../../types';
import { toast } from 'sonner';

export function MedicalHistory() {
  const [history, setHistory] = useState<MedicalRecord[]>([]);
  const [profile, setProfile] = useState<PatientClinicalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [historyData, profileData] = await Promise.all([
          patientService.getMedicalHistory(),
          patientService.getClinicalProfile()
        ]);
        
        // Validación de seguridad: Asegurar que sea array
        const safeHistory = Array.isArray(historyData) ? historyData : [];

        // Ordenar por fecha descendente
        const sortedHistory = safeHistory.sort((a, b) => 
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );

        setHistory(sortedHistory);
        setProfile(profileData);
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar datos");
        setHistory([]); // Evitar crash si falla
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    // Fix para fechas ISO
    const date = new Date(dateString.replace(/-/g, '/'));
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  // --- HELPERS SEGUROS (ESTO EVITA LA PANTALLA BLANCA) ---
  
  const getDoctorName = (record: MedicalRecord) => {
    // Verifica todas las posibles estructuras que pueda devolver tu backend
    if (!record.medico) return "Médico no especificado";
    
    // Si es objeto con nombre_completo (Estructura nueva)
    if (typeof record.medico === 'object' && 'nombre_completo' in record.medico) {
        return (record.medico as any).nombre_completo;
    }
    // Si es objeto con nombre (Estructura antigua)
    if (typeof record.medico === 'object' && 'nombre' in record.medico) {
        return (record.medico as any).nombre;
    }
    // Si viene como string directo
    if (typeof record.medico === 'string') {
        return record.medico;
    }
    
    return "Dr. Asignado";
  };
  
  const getSpecialty = (record: MedicalRecord) => {
     if (!record.medico) return "General";
     
     // Si especialidad es un objeto (Estructura nueva)
     if (typeof (record.medico as any).especialidad === 'object') {
         return (record.medico as any).especialidad?.nombre || "General";
     }
     // Si especialidad es un string
     if (typeof (record.medico as any).especialidad === 'string') {
         return (record.medico as any).especialidad;
     }
     return "General";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-10 flex flex-col justify-center items-center text-gray-400">
        <Loader2 className="h-10 w-10 animate-spin mb-3 text-blue-600" /> 
        <p>Cargando historial clínico...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Historial Médico</h1>
          <p className="text-sm text-gray-500">Consulta tu historial de diagnósticos y tratamientos</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-gray-200 shadow-sm bg-white rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 mb-1">Total de Consultas</p>
                  <h2 className="text-2xl font-bold text-gray-900">{history.length}</h2>
                  <p className="text-[10px] text-gray-500">Registros médicos</p>
                </div>
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm bg-white rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 mb-1">Última Consulta</p>
                  <h2 className="text-sm font-bold text-gray-900">
                    {history.length > 0 ? formatDate(history[0].fecha).split(' de ')[0] + ' ' + formatDate(history[0].fecha).split(' de ')[1] : '-'}
                  </h2>
                  <p className="text-[10px] text-gray-500">
                    {history.length > 0 ? getDoctorName(history[0]) : 'Sin consultas'}
                  </p>
                </div>
                <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm bg-white rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 mb-1">Médicos Consultados</p>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {new Set(history.map(r => getDoctorName(r))).size}
                  </h2>
                  <p className="text-[10px] text-gray-500">Profesionales diferentes</p>
                </div>
                <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* --- FICHA MÉDICA --- */}
          <div className="lg:col-span-1 space-y-4">
            <div 
              className="border-2 border-blue-300 shadow-lg rounded-xl overflow-hidden"
              style={{ 
                background: 'linear-gradient(to bottom right, rgb(37, 99, 235), rgb(29, 78, 216))'
              }}
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Ficha Médica</h2>
                    <p className="text-blue-100 text-sm">Información Clínica</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-white">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-red-50 rounded-xl text-center border-2 border-red-100">
                    <Droplet className="h-6 w-6 text-red-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 uppercase font-semibold tracking-wider mb-1">Tipo de Sangre</p>
                    <p className="text-2xl font-bold text-gray-900">{profile?.tipo_sangre || 'O+'}</p>
                  </div>
                  <div className="p-4 bg-pink-50 rounded-xl text-center border-2 border-pink-100">
                    <HeartPulse className="h-6 w-6 text-pink-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 uppercase font-semibold tracking-wider mb-1">Edad</p>
                    <p className="text-2xl font-bold text-gray-900">{profile?.edad || '35'} años</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl text-center border-2 border-blue-100">
                    <Ruler className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 uppercase font-semibold tracking-wider mb-1">Altura</p>
                    <p className="text-2xl font-bold text-gray-900">{profile?.altura || '-'}</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-xl text-center border-2 border-orange-100">
                    <Weight className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 uppercase font-semibold tracking-wider mb-1">Peso</p>
                    <p className="text-2xl font-bold text-gray-900">{profile?.peso || '-'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <span className="text-sm font-bold text-gray-900">Alergias</span>
                    </div>
                    <div className="bg-orange-50 text-orange-900 p-4 rounded-xl text-sm border-2 border-orange-200 font-medium">
                      {profile?.alergias || 'Ninguna'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-bold text-gray-900">Condiciones Crónicas</span>
                    </div>
                    <div className="bg-blue-50 text-blue-900 p-4 rounded-xl text-sm border-2 border-blue-200 font-medium">
                      {profile?.condiciones_cronicas || 'Ninguna'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- REGISTROS MÉDICOS --- */}
          <div className="lg:col-span-2 space-y-4">
            
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-bold text-gray-900">Registros Médicos</h2>
            </div>
            
            {history.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Sin registros</h3>
                <p className="text-sm text-gray-500 mt-2">Aún no tienes consultas completadas.</p>
              </div>
            ) : (
              history.map((record) => (
                <Card key={record.id} className="border-2 border-gray-200 shadow-md hover:shadow-xl transition-all bg-white rounded-xl overflow-hidden">
                  <div className="p-6">
                    {/* Header con fecha y médico */}
                    <div className="flex items-start justify-between mb-5 pb-5 border-b-2 border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                          <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-gray-900">{formatDate(record.fecha)}</p>
                          <p className="text-sm text-gray-500 mt-1">Dr. {getDoctorName(record)}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100 px-4 py-1.5 text-sm font-semibold">
                        Completada
                      </Badge>
                    </div>

                    {/* Médico y Especialidad */}
                    <div className="flex items-center gap-4 mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shrink-0 border border-gray-200">
                        <Stethoscope className="h-6 w-6 text-gray-700" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Médico Tratante</p>
                        <p className="text-base font-bold text-gray-900">{getDoctorName(record)}</p>
                      </div>
                      <div>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-2 border-blue-200 px-3 py-1.5 text-sm font-semibold">
                          {getSpecialty(record)}
                        </Badge>
                      </div>
                    </div>

                    {/* Diagnóstico */}
                    <div className="mb-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Activity className="h-5 w-5 text-red-500" />
                        <span className="text-sm font-bold text-gray-900">Diagnóstico</span>
                      </div>
                      <p className="text-base text-gray-900 bg-red-50 p-4 rounded-xl border-2 border-red-100 leading-relaxed">
                        {record.diagnostico}
                      </p>
                    </div>

                    {/* Tratamiento */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-bold text-gray-900">Tratamiento / Indicaciones</span>
                      </div>
                      <p className="text-base text-gray-800 bg-blue-50 p-4 rounded-xl border-2 border-blue-100 leading-relaxed">
                        {record.tratamiento}
                      </p>
                    </div>

                    {/* Notas adicionales si existen */}
                    {record.notas_adicionales && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 italic">
                          <span className="font-semibold">Notas:</span> {record.notas_adicionales}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}