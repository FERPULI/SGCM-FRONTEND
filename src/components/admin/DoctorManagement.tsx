import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
// import { Textarea } from "../ui/textarea"; // <-- 1. LÍNEA ELIMINADA
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Search, Plus, Edit, Trash2, Mail, Phone, MoreHorizontal, Users, UserCog, Stethoscope, BriefcaseMedical } from "lucide-react";
import { toast } from "sonner";
import { debounce } from 'lodash';
// --- (COMENTADO) No llamaremos a los servicios por ahora ---
// import { usersService } from '../../services/users.service';
// import { doctorService } from '../../services/doctor.service';
// import { especialidadService } from '../../services/especialidad.service';
import { handleApiError } from '../../services/http';
import { User, UserRole, PaginatedResponse, CreateUserData, UpdateUserData, DoctorStats, DoctorDirectoryItem, Especialidad } from '../../types';

// --- (Definición de UserFormData y defaultEmptyForm) ---
type UserFormData = {
  id: number | null;
  nombre: string;
  apellidos: string;
  email: string;
  rol: UserRole;
  activo: boolean;
  password?: string;
  password_confirmation?: string;
  especialidad_id?: number | string;
  licencia_medica?: string;
  telefono_consultorio?: string;
  biografia?: string;
  fecha_nacimiento?: string;
  telefono?: string;
  direccion?: string;
  tipo_sangre?: string;
  alergias?: string;
};
const defaultEmptyForm: UserFormData = {
  id: null,
  nombre: "",
  apellidos: "",
  email: "",
  rol: "medico",
  activo: true,
  password: "",
  password_confirmation: "",
  especialidad_id: "",
  licencia_medica: "",
  telefono_consultorio: "",
  biografia: "",
};
// --- (Fin Definiciones) ---

// --- (NUEVO) Datos Estáticos (Mock Data) ---
const mockStats: DoctorStats = {
  totalMedicos: 2,
  totalEspecialidades: 2,
  totalCitas: 3,
  totalPacientesAtendidos: 1,
};

const mockMedicos: DoctorDirectoryItem[] = [
  {
    id_medico: 1,
    id_usuario: 10,
    nombre_completo: "Dr. Carlos Ramírez",
    email: "carlos@hospital.com",
    licencia_medica: "CMP-12345",
    telefono_consultorio: "+54 911 1234 567",
    biografia: "Cardiólogo experto.",
    especialidad: { id: 1, nombre: "Cardiología" },
    estadisticas: { citas_totales: 2, citas_completadas: 1, citas_pendientes: 0, pacientes_atendidos: 1 },
  },
  {
    id_medico: 2,
    id_usuario: 11,
    nombre_completo: "Dra. Ana Martínez",
    email: "ana@hospital.com",
    licencia_medica: "CMP-67890",
    telefono_consultorio: "+54 911 6789 012",
    biografia: "Pediatra con 10 años de exp.",
    especialidad: { id: 2, nombre: "Pediatría" },
    estadisticas: { citas_totales: 1, completadas: 0, pendientes: 1, pacientes_atendidos: 1 },
  }
];

const mockMeta = {
  current_page: 1, from: 1, last_page: 1,
  path: "", per_page: 10, to: 2, total: 2,
  links: { first: null, last: null, prev: null, next: null }
};
// --- (Fin Mock Data) ---

export function DoctorManagement() {

  // --- (MODIFICADO) Estados inicializados con Mock Data ---
  const [directoryData, setDirectoryData] = useState<PaginatedResponse<DoctorDirectoryItem>>({ data: mockMedicos, links: mockMeta.links, meta: mockMeta });
  const [stats, setStats] = useState<DoctorStats | null>(mockStats);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [isLoading, setIsLoading] = useState(false); // <-- Falso para mostrar de inmediato
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(defaultEmptyForm);

  /*
  // --- (COMENTADO) LÓGICA DE CARGA DE DATOS ---
  const fetchData = async (page = currentPage, search = debouncedSearch) => {
    // ... (Aquí iría la lógica de API que probaremos después)
  };

  // --- (COMENTADO) useEffects ---
  const debouncedFetch = useMemo(
    () => debounce((searchVal: string) => {
      setDebouncedSearch(searchVal);
      setCurrentPage(1); 
    }, 500), 
    []
  );
  useEffect(() => {
    debouncedFetch(searchTerm);
    return () => debouncedFetch.cancel();
  }, [searchTerm, debouncedFetch]);

  useEffect(() => {
    // fetchData(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);
  */

  // --- Handlers (Simplificados) ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // --- LÓGICA DE MODAL (Simplificada) ---
  const handleOpenNewModal = () => {
    setModalMode('create');
    setFormData(defaultEmptyForm);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (medico: DoctorDirectoryItem) => {
    setModalMode('edit');
    setFormData({
      id: medico.id_usuario,
      nombre: medico.nombre_completo.split(' ')[1] || '',
      apellidos: medico.nombre_completo.split(' ')[2] || '',
      email: medico.email,
      rol: "medico",
      activo: true,
      especialidad_id: medico.especialidad.id,
      licencia_medica: medico.licencia_medica,
      telefono_consultorio: medico.telefono_consultorio,
      biografia: medico.biografia || "",
    });
    setIsModalOpen(true);
  };

  const handleModalFormChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Función deshabilitada en modo estático.");
    setIsModalOpen(false);
  };

  const handleDelete = async (idUsuario: number | null) => {
    toast.error("Función deshabilitada en modo estático.");
  };

  // --- Funciones de Ayuda ---
  const getInitials = (nombre: string, apellidos: string = "") => {
    const n = nombre?.split(' ')[0][0] || '';
    const a = apellidos?.split(' ')[0][0] || '';
    return `${n}${a}`.toUpperCase();
  };

  // --- Renderizado ---
  if (isLoading) {
    return <div className="p-6">Cargando gestión de médicos...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-500">Error al cargar médicos: {error}</div>;
  }
  if (!directoryData || !stats) {
    return <div className="p-6">No se pudieron cargar los datos estáticos.</div>;
  }

  const { data: medicos, meta } = directoryData;

  return (
    <div className="p-6 space-y-6">
      {/* --- Encabezado y Stats Cards --- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Gestión de Médicos</h1>
          <p className="text-gray-500 mt-1">Administra el equipo médico del sistema</p>
        </div>
        <Button onClick={handleOpenNewModal}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Médico
        </Button>
      </div>
      {/* --- Stats Cards con datos estáticos --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Médicos</p>
                <p className="text-2xl">{stats.totalMedicos}</p>
              </div>
              <UserCog className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Especialidades</p>
                <p className="text-2xl">{stats.totalEspecialidades}</p>
              </div>
              <BriefcaseMedical className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Citas Totales</p>
                <p className="text-2xl">{stats.totalCitas}</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pacientes Atendidos</p>
                <p className="text-2xl">{stats.totalPacientesAtendidos}</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- Directorio y Buscador --- */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Directorio de Médicos ({meta.total || 0})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o especialidad..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* --- Grid de Tarjetas de Médicos --- */}
          {medicos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No se encontraron médicos.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medicos.map((medico) => (
                <Card key={medico.id_medico} className="flex flex-col">
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {getInitials(medico.nombre_completo.split(' ')[0], medico.nombre_completo.split(' ')[1] || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{medico.nombre_completo}</CardTitle>
                      <Badge variant="secondary" className="mt-1">{medico.especialidad?.nombre || 'Sin Esp.'}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Citas totales:</span> <span>{medico.estadisticas?.citas_totales ?? 0}</span></div>
                      <div className="flex justify-between"><span>Completadas:</span> <span>{medico.estadisticas?.citas_completadas ?? 0}</span></div>
                      <div className="flex justify-between"><span>Pendientes:</span> <span>{medico.estadisticas?.citas_pendientes ?? 0}</span></div>
                      <div className="flex justify-between"><span>Pacientes:</span> <span>{medico.estadisticas?.pacientes_atendidos ?? 0}</span></div>
                    </div>
                    <div className="border-t pt-4 space-y-2 text-xs text-gray-600">
                      <p><strong>Email:</strong> {medico.email || '-'}</p>
                      <p><strong>Teléfono:</strong> {medico.telefono_consultorio || '-'}</p>
                      <p><strong>Licencia:</strong> {medico.licencia_medica || '-'}</p>
                    </div>
                  </CardContent>
                  <DialogFooter className="border-t p-4 flex-row justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditModal(medico)}
                    >
                      <Edit className="h-4 w-4 mr-2" /> Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(medico.id_usuario)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- Paginación --- */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => handlePageChange(meta.current_page - 1)}
          disabled={!meta.prev}
        >
          Anterior
        </Button>
        <span>Página {meta.current_page} de {meta.last_page}</span>
        <Button
          variant="outline"
          onClick={() => handlePageChange(meta.current_page + 1)}
          disabled={!meta.next}
        >
          Siguiente
        </Button>
      </div>

      {/* --- Modal (Dialog) para Crear/Editar --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleModalSubmit}>
            <DialogHeader>
              <DialogTitle>
                {modalMode === 'edit' ? 'Editar Médico' : 'Nuevo Médico'}
              </DialogTitle>
              <DialogDescription>
                {modalMode === 'edit'
                  ? 'Modifica la información del médico'
                  : 'Completa el formulario para crear un nuevo médico'
                }
              </DialogDescription>
            </DialogHeader>

            {/* --- Formulario Dinámico (SOLO MÉDICO) --- */}
            <div className="grid grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">

              {/* --- Campos Comunes --- */}
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" value={formData.nombre} onChange={(e) => handleModalFormChange('nombre', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input id="apellidos" value={formData.apellidos} onChange={(e) => handleModalFormChange('apellidos', e.target.value)} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" value={formData.email} onChange={(e) => handleModalFormChange('email', e.target.value)} />
              </div>

              {/* (Rol está oculto, se fuerza a 'medico') */}

              {modalMode === 'edit' && (
                <div className="space-y-2">
                  <Label htmlFor="activo">Estado</Label>
                  <Select
                    value={formData.activo ? 'true' : 'false'}
                    onValueChange={(value) => handleModalFormChange('activo', value === 'true')}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Activo</SelectItem>
                      <SelectItem value="false">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {modalMode === 'create' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input id="password" type="password" value={formData.password} onChange={(e) => handleModalFormChange('password', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password_confirmation">Confirmar Contraseña</Label>
                    <Input id="password_confirmation" type="password" value={formData.password_confirmation} onChange={(e) => handleModalFormChange('password_confirmation', e.target.value)} />
                  </div>
                </>
              )}

              {/* --- Campos Dinámicos para MÉDICO --- */}
              <>
                <div className="col-span-2 border-t pt-4 mt-4">
                  <Label className="text-base font-semibold">Datos del Médico</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licencia_medica">Licencia Médica</Label>
                  <Input id="licencia_medica" value={formData.licencia_medica} onChange={(e) => handleModalFormChange('licencia_medica', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono_consultorio">Teléfono (Consultorio)</Label>
                  <Input id="telefono_consultorio" value={formData.telefono_consultorio} onChange={(e) => handleModalFormChange('telefono_consultorio', e.target.value)} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="especialidad_id">Especialidad</Label>
                  <Select
                    value={String(formData.especialidad_id)}
                    onValueChange={(value) => handleModalFormChange('especialidad_id', value)}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccione una especialidad" /></SelectTrigger>
                    <SelectContent>
                      {/* (Datos estáticos por ahora) */}
                      <SelectItem value="1">Cardiología</SelectItem>
                      <SelectItem value="2">Pediatría</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="biografia">Biografía</Label>
                  {/* --- 2. LÍNEA MODIFICADA (Input en lugar de Textarea) --- */}
                  <Input
                    id="biografia"
                    value={formData.biografia}
                    onChange={(e) => handleModalFormChange('biografia', e.target.value)}
                    placeholder="Médico especialista con 10 años de experiencia..."
                  />
                </div>
              </>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {modalMode === 'edit' ? 'Guardar Cambios' : 'Crear Médico'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}