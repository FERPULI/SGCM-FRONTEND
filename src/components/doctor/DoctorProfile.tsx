import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { User } from "../../types";
import { Camera, Save, Award } from "lucide-react";

interface DoctorProfileProps {
  user: User;
}

export function DoctorProfile({ user }: DoctorProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: user.nombre,
    email: user.email,
    telefono: user.telefono,
    especialidad: user.especialidad || '',
    numeroLicencia: user.numeroLicencia || '',
    biografia: 'Médico especialista con más de 10 años de experiencia...',
  });

  const handleSave = () => {
    setIsEditing(false);
  };

  const getInitials = (nombre: string) => {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl">Mi Perfil Profesional</h1>
        <p className="text-gray-500 mt-1">Gestiona tu información y disponibilidad</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-blue-600 text-white text-2xl">
                    {getInitials(user.nombre)}
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
                <h2 className="text-xl">{user.nombre}</h2>
                <p className="text-sm text-gray-500">{user.especialidad}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs text-gray-600">Lic. {user.numeroLicencia}</span>
                </div>
              </div>
              <div className="w-full pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="text-xs">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Teléfono:</span>
                  <span>{user.telefono}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pacientes:</span>
                  <span>156</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Tabs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Información Profesional</CardTitle>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="personal">
              <TabsList>
                <TabsTrigger value="personal">Datos Personales</TabsTrigger>
                <TabsTrigger value="profesional">Datos Profesionales</TabsTrigger>
                <TabsTrigger value="disponibilidad">Disponibilidad</TabsTrigger>
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
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      disabled={!isEditing}
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
                    <Label htmlFor="direccion">Dirección Consultorio</Label>
                    <Input
                      id="direccion"
                      placeholder="Calle, Ciudad, CP"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="biografia">Biografía Profesional</Label>
                  <Textarea
                    id="biografia"
                    value={formData.biografia}
                    onChange={(e) =>
                      setFormData({ ...formData, biografia: e.target.value })
                    }
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value="profesional" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="especialidad">Especialidad</Label>
                    <Input
                      id="especialidad"
                      value={formData.especialidad}
                      onChange={(e) =>
                        setFormData({ ...formData, especialidad: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numeroLicencia">Número de Licencia</Label>
                    <Input
                      id="numeroLicencia"
                      value={formData.numeroLicencia}
                      onChange={(e) =>
                        setFormData({ ...formData, numeroLicencia: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="universidad">Universidad</Label>
                    <Input
                      id="universidad"
                      placeholder="Nombre de la universidad"
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aniosExperiencia">Años de Experiencia</Label>
                    <Input
                      id="aniosExperiencia"
                      type="number"
                      placeholder="10"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="disponibilidad" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="text-sm">Lunes</h4>
                      <p className="text-xs text-gray-500">09:00 - 17:00</p>
                    </div>
                    <Button variant="outline" size="sm">Editar</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="text-sm">Martes</h4>
                      <p className="text-xs text-gray-500">09:00 - 17:00</p>
                    </div>
                    <Button variant="outline" size="sm">Editar</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="text-sm">Miércoles</h4>
                      <p className="text-xs text-gray-500">09:00 - 17:00</p>
                    </div>
                    <Button variant="outline" size="sm">Editar</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="text-sm">Jueves</h4>
                      <p className="text-xs text-gray-500">09:00 - 17:00</p>
                    </div>
                    <Button variant="outline" size="sm">Editar</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="text-sm">Viernes</h4>
                      <p className="text-xs text-gray-500">09:00 - 14:00</p>
                    </div>
                    <Button variant="outline" size="sm">Editar</Button>
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
