import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { User } from "../../types";
import { Camera, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { http } from "../../services/http";
import { patientService } from "../../services/patient.service";
import { STORAGE_KEYS } from "../../config/api";

interface PatientProfileProps {
  user: User;
}

export function PatientProfile({ user }: PatientProfileProps) {
    const handleSave = async () => {
      try {
        setIsLoading(true);
        const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        if (!userData) {
          toast.error("Error: No se encontró información del usuario");
          return;
        }
        const parsedUser = JSON.parse(userData);
        const pacienteId = parsedUser.paciente?.id || parsedUser.id;
        if (!pacienteId) {
          toast.error("No se encontró el ID del paciente");
          return;
        }

        // Validar contraseñas si se están cambiando
        if (passwordData.newPassword || passwordData.confirmPassword) {
          if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            setIsLoading(false);
            return;
          }
          if (passwordData.newPassword.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres");
            setIsLoading(false);
            return;
          }
        }

        const dataToUpdate: any = {
          nombre: formData.nombre,
          telefono: formData.telefono,
          fecha_nacimiento: formData.fecha_nacimiento,
          direccion: formData.direccion,
          tipo_sangre: formData.tipo_sangre,
        };

        // Agregar contraseña si se está cambiando
        if (passwordData.newPassword && passwordData.newPassword === passwordData.confirmPassword) {
          dataToUpdate.password = passwordData.newPassword;
          dataToUpdate.password_confirmation = passwordData.confirmPassword;
        }

        console.log("Datos a enviar:", dataToUpdate); // Debug
        await patientService.updateProfile(pacienteId, dataToUpdate);
        const updatedUser = {
          ...parsedUser,
          nombre: formData.nombre,
          telefono: formData.telefono,
          paciente: {
            ...(parsedUser.paciente || {}),
            telefono: formData.telefono,
            fecha_nacimiento: formData.fecha_nacimiento,
            direccion: formData.direccion,
            tipo_sangre: formData.tipo_sangre,
          }
        };
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
        
        // Limpiar campos de contraseña
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        
        toast.success("✓ Perfil actualizado exitosamente");
        setIsEditing(false);
      } catch (error: any) {
        console.error("Error al actualizar perfil:", error);
        toast.error(error.response?.data?.message || "✗ Error al actualizar el perfil");
      } finally {
        setIsLoading(false);
      }
    };
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    fecha_nacimiento: "",
    direccion: "",
    tipo_sangre: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Cargar datos del paciente desde localStorage
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (userData) {
      const parsedUser = JSON.parse(userData);
      const paciente = parsedUser.paciente || parsedUser;

      // Formatear fecha_nacimiento a yyyy-MM-dd si existe
      let fechaNacimiento = "";
      if (paciente.fecha_nacimiento) {
        // Si viene en formato dd/mm/yyyy o yyyy-mm-dd
        if (/^\d{4}-\d{2}-\d{2}$/.test(paciente.fecha_nacimiento)) {
          fechaNacimiento = paciente.fecha_nacimiento;
        } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(paciente.fecha_nacimiento)) {
          // Convertir dd/mm/yyyy a yyyy-mm-dd
          const [d, m, y] = paciente.fecha_nacimiento.split("/");
          fechaNacimiento = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
        } else {
          // Intentar parsear con Date
          const dateObj = new Date(paciente.fecha_nacimiento);
          if (!isNaN(dateObj.getTime())) {
            fechaNacimiento = dateObj.toISOString().slice(0, 10);
          }
        }
      }
      setFormData({
        nombre: parsedUser.nombre || "",
        email: parsedUser.email || "",
        telefono: paciente.telefono || parsedUser.telefono || "",
        fecha_nacimiento: fechaNacimiento,
        direccion: paciente.direccion || "",
        tipo_sangre: paciente.tipo_sangre || "",
      });
    }
  }, []);

  const getInitials = (nombre: string) => {
    return nombre
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl">Mi Perfil</h1>
        <p className="text-gray-500 mt-1">Gestiona tu información personal</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-blue-600 text-white text-2xl">
                    {getInitials(formData.nombre)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <h2 className="text-xl">{formData.nombre}</h2>
                <p className="text-sm text-gray-500 capitalize">Paciente</p>
              </div>
              <div className="w-full pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span>{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Teléfono:</span>
                  <span>{formData.telefono}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Tabs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Información Personal</CardTitle>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="personal">
              <TabsList>
                <TabsTrigger value="personal">Datos Personales</TabsTrigger>
                <TabsTrigger value="security">Seguridad</TabsTrigger>
                <TabsTrigger value="preferences">Preferencias</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre Completo</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled={true}
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) =>
                        setFormData({ ...formData, telefono: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                    <Input
                      id="fecha_nacimiento"
                      type="date"
                      value={formData.fecha_nacimiento}
                      onChange={(e) =>
                        setFormData({ ...formData, fecha_nacimiento: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      value={formData.direccion}
                      onChange={(e) =>
                        setFormData({ ...formData, direccion: e.target.value })
                      }
                      placeholder="Calle, Ciudad, CP"
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo_sangre">Tipo de Sangre</Label>
                    <Input
                      id="tipo_sangre"
                      value={formData.tipo_sangre}
                      onChange={(e) =>
                        setFormData({ ...formData, tipo_sangre: e.target.value })
                      }
                      placeholder="Ej: O+, A+, B-, AB+"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Contraseña Actual</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="••••••••"
                      value="••••••••"
                      disabled={true}
                      className="bg-gray-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500">La contraseña actual no se puede modificar desde aquí</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nueva Contraseña</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Ingresa nueva contraseña"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirma la nueva contraseña"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  {passwordData.newPassword && passwordData.confirmPassword && 
                   passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="text-sm text-red-600">Las contraseñas no coinciden</p>
                  )}
                  {passwordData.newPassword && passwordData.newPassword === passwordData.confirmPassword && (
                    <p className="text-sm text-green-600">✓ Las contraseñas coinciden</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm">Notificaciones por Email</h4>
                      <p className="text-xs text-gray-500">
                        Recibir recordatorios de citas por correo
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Activado
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm">Notificaciones SMS</h4>
                      <p className="text-xs text-gray-500">
                        Recibir recordatorios de citas por SMS
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Activado
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm">Newsletter</h4>
                      <p className="text-xs text-gray-500">
                        Recibir información médica y consejos de salud
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Desactivado
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
