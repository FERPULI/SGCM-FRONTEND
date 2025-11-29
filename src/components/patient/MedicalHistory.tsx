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
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Historial Médico</h1>
          <p className="text-gray-500">Registro completo de tus diagnósticos y tratamientos.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- COLUMNA IZQUIERDA: RESUMEN DE SALUD --- */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-lg shadow-blue-100/50 bg-white rounded-2xl overflow-hidden sticky top-6">
              <div className="bg-blue-600 p-6 text-white text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <Activity className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-xl font-bold">Ficha Médica</h2>
                <p className="text-blue-100 text-sm">Resumen Clínico</p>
              </div>
              
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl text-center border border-gray-100">
                    <Droplet className="h-5 w-5 text-red-500 mx-auto mb-2" />
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Sangre</p>
                    <p className="text-lg font-bold text-gray-900">{profile?.tipo_sangre || '-'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl text-center border border-gray-100">
                    <HeartPulse className="h-5 w-5 text-pink-500 mx-auto mb-2" />
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Edad</p>
                    <p className="text-lg font-bold text-gray-900">{profile?.edad || '-'} años</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl text-center border border-gray-100">
                    <Ruler className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Altura</p>
                    <p className="text-lg font-bold text-gray-900">{profile?.altura || '-'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl text-center border border-gray-100">
                    <Weight className="h-5 w-5 text-orange-500 mx-auto mb-2" />
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Peso</p>
                    <p className="text-lg font-bold text-gray-900">{profile?.peso || '-'}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-bold text-gray-700">Alergias</span>
                    </div>
                    <div className="bg-orange-50 text-orange-800 p-3 rounded-xl text-sm border border-orange-100 font-medium">
                      {profile?.alergias || 'Ninguna conocida'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-bold text-gray-700">Condiciones Crónicas</span>
                    </div>
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-xl text-sm border border-blue-100 font-medium">
                      {profile?.condiciones_cronicas || 'Ninguna registrada'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* --- COLUMNA DERECHA: LÍNEA DE TIEMPO --- */}
          <div className="lg:col-span-2 space-y-6">
            
            {history.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Historial Vacío</h3>
                <p className="text-gray-500 mt-1">Aún no tienes registros de consultas completadas.</p>
              </div>
            ) : (
              history.map((record) => (
                <Card key={record.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl overflow-hidden group">
                  <div className="flex flex-col md:flex-row">
                    
                    {/* Fecha Lateral */}
                    <div className="bg-gray-50 p-6 md:w-48 flex flex-col justify-center items-center md:items-start border-b md:border-b-0 md:border-r border-gray-100 shrink-0">
                      <div className="flex items-center gap-2 text-blue-600 mb-2 bg-blue-50 px-3 py-1 rounded-full">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Fecha</span>
                      </div>
                      <p className="text-xl font-bold text-gray-900 capitalize text-center md:text-left leading-tight">
                        {formatDate(record.fecha)}
                      </p>
                    </div>

                    {/* Contenido Principal */}
                    <div className="p-6 flex-1">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <Stethoscope className="h-6 w-6" />
                          </div>
                          <div>
                            {/* AQUÍ USAMOS EL HELPER SEGURO */}
                            <h3 className="font-bold text-lg text-gray-900">{getDoctorName(record)}</h3>
                            
                            <Badge variant="secondary" className="mt-1 bg-gray-100 text-gray-600 hover:bg-gray-200 border-0">
                              {/* AQUÍ TAMBIÉN USAMOS EL HELPER */}
                              {getSpecialty(record)}
                            </Badge>
                          </div>
                        </div>
                        
                        {record.archivos_adjuntos && (
                          <Button variant="outline" size="sm" className="text-blue-600 border-blue-100 hover:bg-blue-50">
                            <Download className="h-4 w-4 mr-2" /> Receta / Adjuntos
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100">
                          <div className="flex items-center gap-2 mb-2 text-amber-700">
                            <Activity className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Diagnóstico</span>
                          </div>
                          <p className="text-gray-900 font-medium text-sm leading-relaxed">{record.diagnostico}</p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2 text-gray-500">
                             <FileText className="h-4 w-4" />
                             <span className="text-xs font-bold uppercase tracking-wider">Tratamiento / Indicaciones</span>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                            {record.tratamiento}
                          </p>
                        </div>
                      </div>
                    </div>
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