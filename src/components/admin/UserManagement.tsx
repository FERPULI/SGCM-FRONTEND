import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea"; // <-- AÑADIDO
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Search, Plus, Edit, Trash2, Mail, Phone, MoreHorizontal, Users, UserCog } from "lucide-react"; 
import { toast } from "sonner"; 
import { debounce } from 'lodash'; 
import { usersService } from '../../services/users.service';
import { handleApiError } from '../../services/http';
// --- (MODIFICADO) Imports ---
import { User, UserRole, PaginatedResponse, CreateUserData, UpdateUserData, UserStats, Especialidad } from '../../types'; 
import { especialidadService } from '../../services/especialidad.service'; // <-- AÑADIDO

// --- (MODIFICADO) Tipo para el formulario del Modal ---
type UserFormData = {
  id: number | null;
  nombre: string;
  apellidos: string;
  email: string;
  rol: UserRole;
  activo: boolean;
  password?: string;
  password_confirmation?: string;
  
  // Campos de Paciente
  fecha_nacimiento?: string;
  telefono?: string;
  direccion?: string;
  tipo_sangre?: string;
  alergias?: string;
  
  // Campos de Médico
  especialidad_id?: number | string; 
  licencia_medica?: string;
  telefono_consultorio?: string;
  biografia?: string; // <-- AÑADIDO
};

// --- (MODIFICADO) Formulario vacío por defecto ---
const defaultEmptyForm: UserFormData = {
  id: null,
  nombre: "",
  apellidos: "",
  email: "",
  rol: "paciente",
  activo: true,
  password: "",
  password_confirmation: "",
  fecha_nacimiento: "",
  telefono: "",
  direccion: "",
  tipo_sangre: "",
  alergias: "",
  especialidad_id: "",
  licencia_medica: "",
  telefono_consultorio: "",
  biografia: "", // <-- AÑADIDO
};

export function UserManagement() {
  
  const [paginationData, setPaginationData] = useState<PaginatedResponse<User> | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null); 
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]); // <-- AÑADIDO
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<UserRole | "todos">("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<UserFormData>(defaultEmptyForm);
  
  // --- (MODIFICADO) LÓGICA DE CARGA DE DATOS ---
  const fetchUsersAndStats = async (page = currentPage, search = debouncedSearch, role = activeTab) => {
    try {
      setIsLoading(true);
      setError(null);
      const filters = {
        page: page,
        per_page: 10,
        q: search || undefined,
        rol: role === "todos" ? undefined : role,
      };
      
      // Carga todo en paralelo
      const [usersData, statsData, especialidadesData] = await Promise.all([
        usersService.getUsers(filters), 
        usersService.getUserStats(),
        especialidadService.getAllEspecialidades() // <-- AÑADIDO
      ]);
      
      setPaginationData(usersData);
      setStats(statsData);
      setEspecialidades(especialidadesData); // <-- AÑADIDO
      setCurrentPage(usersData.meta.current_page);

    } catch (err: any) {
      setError(handleApiError(err));
      toast.error("Error al cargar datos", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Debounce para la búsqueda ---
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

  // --- useEffect principal para cargar datos ---
  useEffect(() => {
    fetchUsersAndStats(currentPage, debouncedSearch, activeTab);
  }, [currentPage, debouncedSearch, activeTab]);

  // --- LÓGICA DE FILTROS (Handlers) ---
  const handleTabChange = (value: string) => {
    setActiveTab(value as UserRole | "todos");
    setCurrentPage(1);
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (paginationData?.meta.last_page || 1)) {
      setCurrentPage(newPage);
    }
  };

  // --- (MODIFICADO) LÓGICA DE MODAL ---
  const handleOpenNewModal = () => {
    setModalMode('create');
    setFormData(defaultEmptyForm); 
    setIsModalOpen(true);
  };
  
  // "Aplana" el objeto 'user' anidado para rellenar el formulario
  const handleOpenEditModal = (user: User) => {
    setModalMode('edit');
    
    // Formatea la fecha de nacimiento si existe
    let fechaNac = "";
    if (user.paciente?.fecha_nacimiento) {
      fechaNac = user.paciente.fecha_nacimiento.split('T')[0];
    }
    
    setFormData({
      id: user.id,
      nombre: user.nombre,
      apellidos: user.apellidos,
      email: user.email,
      rol: user.rol,
      activo: user.activo,
      
      // Aplanar datos del Paciente
      fecha_nacimiento: fechaNac,
      telefono: user.paciente?.telefono || "",
      direccion: user.paciente?.direccion || "",
      tipo_sangre: user.paciente?.tipo_sangre || "",
      alergias: user.paciente?.alergias || "",
      
      // Aplanar datos del Médico
      especialidad_id: user.medico?.especialidad_id || "",
      licencia_medica: user.medico?.licencia_medica || "",
      telefono_consultorio: user.medico?.telefono_consultorio || "",
      biografia: user.medico?.biografia || "",
    });
    setIsModalOpen(true);
  };

  const handleModalFormChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // --- (MODIFICADO) LÓGICA DE SUBMIT ---
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'create' && (!formData.password || formData.password !== formData.password_confirmation)) {
      toast.error("Las contraseñas no coinciden o están vacías.");
      return;
    }
    
    // 1. Construir el objeto base
    let data: CreateUserData | UpdateUserData;
    const baseData = {
      nombre: formData.nombre,
      apellidos: formData.apellidos,
      email: formData.email,
      rol: formData.rol,
    };
    
    if (modalMode === 'create') {
      (baseData as CreateUserData).password = formData.password!;
      (baseData as CreateUserData).password_confirmation = formData.password_confirmation!;
    } else {
      (baseData as UpdateUserData).activo = formData.activo;
    }

    // 2. Añadir campos dinámicos según el ROL
    if (formData.rol === 'paciente') {
      data = {
        ...baseData,
        fecha_nacimiento: formData.fecha_nacimiento,
        telefono: formData.telefono,
        direccion: formData.direccion,
        tipo_sangre: formData.tipo_sangre,
        alergias: formData.alergias,
      };
    } else if (formData.rol === 'medico') {
      data = {
        ...baseData,
        especialidad_id: Number(formData.especialidad_id),
        licencia_medica: formData.licencia_medica,
        telefono_consultorio: formData.telefono_consultorio,
        biografia: formData.biografia, // <-- AÑADIDO
      };
    } else {
      data = baseData; // Rol 'admin' solo envía datos base
    }

    // 3. Enviar a la API
    try {
      if (modalMode === 'edit' && formData.id) {
        await usersService.updateUser(formData.id, data as UpdateUserData);
        toast.success("Usuario actualizado correctamente");
      } else {
        await usersService.createUser(data as CreateUserData);
        toast.success("Usuario creado correctamente");
      }
      setIsModalOpen(false);
      fetchUsersAndStats(currentPage, debouncedSearch, activeTab); // Recarga todo
    } catch (err: any) {
      toast.error("Error al guardar", { description: handleApiError(err) });
    }
  };
  
  // --- LÓGICA DE ELIMINAR ---
  const handleDelete = async (userId: number) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar a este usuario?")) {
      return;
    }
    try {
      await usersService.deleteUser(userId);
      toast.success("Usuario eliminado correctamente");
      fetchUsersAndStats(currentPage, debouncedSearch, activeTab); // Recarga todo
    } catch (err: any) {
      toast.error("Error al eliminar", { description: handleApiError(err) });
    }
  };

  // --- Funciones de Ayuda (Corregidas) ---
  const getInitials = (nombre: string, apellidos: string = "") => {
    const n = nombre?.split(' ')[0][0] || '';
    const a = apellidos?.split(' ')[0][0] || '';
    return `${n}${a}`.toUpperCase();
  };

  const getRoleBadgeVariant = (rol: UserRole) => {
    switch (rol) {
      case 'admin': return 'destructive';
      case 'medico': return 'default'; 
      case 'paciente': return 'secondary';
      default: return 'outline';
    }
  };

  // --- Renderizado ---
  if (isLoading && !paginationData) {
    return <div className="p-6">Cargando usuarios...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-500">Error al cargar usuarios: {error}</div>;
  }
  if (!paginationData || !stats) { 
    return <div className="p-6">Cargando datos...</div>;
  }

  const { data: users, meta } = paginationData;
  const { total, from, to, last_page, current_page } = meta;

  return (
    <div className="p-6 space-y-6">
      {/* --- Encabezado y Stats Cards --- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Gestión de Usuarios</h1>
          <p className="text-gray-500 mt-1">
            Administra pacientes, médicos y administradores
          </p>
        </div>
        <Button onClick={handleOpenNewModal}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Usuario
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl">{stats.total_usuarios}</p>
              <p className="text-sm text-gray-500">Total Usuarios</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl">{stats.pacientes}</p>
              <p className="text-sm text-gray-500">Pacientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl">{stats.medicos}</p>
              <p className="text-sm text-gray-500">Médicos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl">{stats.administradores}</p>
              <p className="text-sm text-gray-500">Administradores</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        {/* --- CardHeader con Buscador y Tabs de Filtros --- */}
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Usuarios ({total})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="paciente">Pacientes</TabsTrigger>
              <TabsTrigger value="medico">Médicos</TabsTrigger>
              <TabsTrigger value="admin">Administradores</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-6">
              <div className="rounded-lg border">
                
                {/* --- (MODIFICADA) Tabla de Usuarios --- */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          Cargando...
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No se encontraron usuarios
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-blue-100 text-blue-700">
                                  {getInitials(user.nombre, user.apellidos)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm">{user.nombre} {user.apellidos}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span className="text-xs">{user.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3 text-gray-400" />
                                {/* --- (CORRECCIÓN CLAVE) Lee de la relación --- */}
                                <span className="text-xs">
                                  {user.rol === 'paciente' ? (user.paciente?.telefono || '-') : 
                                   user.rol === 'medico' ? (user.medico?.telefono_consultorio || '-') : '-'}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(user.rol)} className="capitalize">
                              {user.rol}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.activo ? 'default' : 'secondary'}>
                              {user.activo ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(user.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* --- Paginación --- */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => handlePageChange(current_page - 1)}
          disabled={current_page === 1}
        >
          Anterior
        </Button>
        <span>Página {current_page} de {last_page}</span>
        <Button
          variant="outline"
          onClick={() => handlePageChange(current_page + 1)}
          disabled={current_page === last_page}
        >
          Siguiente
        </Button>
      </div>

      {/* --- (MODIFICADO) Modal (Dialog) para Crear/Editar --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleModalSubmit}>
            <DialogHeader>
              <DialogTitle>
                {modalMode === 'edit' ? 'Editar Usuario' : 'Nuevo Usuario'}
              </DialogTitle>
              <DialogDescription>
                {modalMode === 'edit' 
                  ? 'Modifica la información del usuario' 
                  : 'Completa el formulario para crear un nuevo usuario'
                }
              </DialogDescription>
            </DialogHeader>
            
            {/* --- Formulario Dinámico --- */}
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
                <Input id="email" type="email" value={formData.email} onChange={(e) => handleModalFormChange('email', e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rol">Rol</Label>
                <Select 
                  value={formData.rol} 
                  onValueChange={(value) => handleModalFormChange('rol', value as UserRole)}
                  disabled={modalMode === 'edit'} // No se puede cambiar el rol al editar
                >
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paciente">Paciente</SelectItem>
                    <SelectItem value="medico">Médico</SelectItem> 
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {modalMode === 'edit' && (
                <div className="space-y-2">
                  <Label htmlFor="activo">Estado</Label>
                  <Select 
                    value={formData.activo ? 'true' : 'false'} 
                    onValueChange={(value) => handleModalFormChange('activo', value === 'true')}
                  >
                    <SelectTrigger><SelectValue/></SelectTrigger>
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

              {/* --- Campos Dinámicos para PACIENTE --- */}
              {formData.rol === 'paciente' && (
                <>
                  <div className="col-span-2 border-t pt-4 mt-4">
                    <Label className="text-base font-semibold">Datos del Paciente</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input id="telefono" value={formData.telefono} onChange={(e) => handleModalFormChange('telefono', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                    <Input id="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={(e) => handleModalFormChange('fecha_nacimiento', e.target.value)} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input id="direccion" value={formData.direccion} onChange={(e) => handleModalFormChange('direccion', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo_sangre">Tipo de Sangre</Label>
                    <Input id="tipo_sangre" value={formData.tipo_sangre} onChange={(e) => handleModalFormChange('tipo_sangre', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alergias">Alergias</Label>
                    <Input id="alergias" value={formData.alergias} onChange={(e) => handleModalFormChange('alergias', e.target.value)} />
                  </div>
                </>
              )}
              
              {/* --- Campos Dinámicos para MÉDICO --- */}
              {formData.rol === 'medico' && (
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
                    {/* --- (MODIFICADO) Select Dinámico --- */}
                    <Select 
                      value={String(formData.especialidad_id)} 
                      onValueChange={(value) => handleModalFormChange('especialidad_id', value)}
                    >
                      <SelectTrigger><SelectValue placeholder="Seleccione una especialidad" /></SelectTrigger>
                      <SelectContent>
                        {especialidades.length === 0 ? (
                          <SelectItem value="" disabled>Cargando...</SelectItem>
                        ) : (
                          especialidades.map(esp => (
                            <SelectItem key={esp.id} value={String(esp.id)}>{esp.nombre}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="biografia">Biografía</Label>
                    <Textarea 
                      id="biografia" 
                      value={formData.biografia} 
                      onChange={(e) => handleModalFormChange('biografia', e.target.value)}
                      placeholder="Médico especialista con 10 años de experiencia..."
                    />
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {modalMode === 'edit' ? 'Guardar Cambios' : 'Crear Usuario'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}