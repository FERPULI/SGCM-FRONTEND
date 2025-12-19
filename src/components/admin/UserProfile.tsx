import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Camera, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../services";
import { storage } from "../../utils/storage";

export function UserProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    telefono: "",
    direccion: "",
    biografia: "",
    licencia: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = (await authService.getCurrentUser()) || storage.getUser();
      if (user) {
        setFormData({
          name: user.name || "Admin Sistema",
          email: user.email || "admin@hospital.com",
          telefono: user.telefono || "+34 645 678 901",
          direccion: user.direccion || "Calle, Ciudad, CP",
          biografia:
            user.biografia ||
            "Médico especialista con más de 10 años de experiencia...",
          licencia: user.licencia || "Lic.",
        });
      }
    } catch {
      toast.error("Error al cargar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-8">
      <div className="mx-auto max-w-7xl">
        {/* TÍTULO */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Mi Perfil Profesional
          </h1>
          <p className="mt-1 text-gray-500">
            Gestiona tu información y disponibilidad
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* TARJETA IZQUIERDA */}
          <div className="w-full lg:w-[360px]">
            <Card className="rounded-2xl border-none shadow-sm">
              <CardContent className="flex flex-col items-center p-8">
                <div className="relative mb-6">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-blue-600 text-4xl font-bold text-white">
                    {getInitials(formData.name)}
                  </div>
                  <button className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-blue-600 p-2 text-white shadow">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                <h2 className="text-xl font-bold text-gray-900">
                  {formData.name}
                </h2>

                <div className="mt-1 flex items-center gap-1 text-sm font-semibold text-yellow-600">
                  <Shield className="h-4 w-4" />
                  {formData.licencia}
                </div>

                <div className="mt-8 w-full space-y-4 border-t pt-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="font-medium text-gray-700">
                      {formData.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Teléfono:</span>
                    <span className="font-medium text-gray-700">
                      {formData.telefono}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pacientes:</span>
                    <span className="font-medium text-gray-700">156</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* TARJETA DERECHA */}
          <div className="flex-1">
            <Card className="rounded-2xl border-none shadow-sm">
              <CardContent className="p-8">
                <div className="mb-8 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">
                    Información Profesional
                  </h3>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "Cancelar" : "Editar"}
                  </Button>
                </div>

                {/* TABS */}
                <div className="mb-8 inline-flex rounded-xl bg-gray-100 p-1">
                  {[
                    { id: "personal", label: "Datos Personales" },
                    { id: "profesional", label: "Datos Profesionales" },
                    { id: "disponibilidad", label: "Disponibilidad" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                        activeTab === tab.id
                          ? "bg-white text-blue-600 shadow"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* FORMULARIO */}
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                  <div>
                    <Label>Nombre Completo</Label>
                    <Input disabled={!isEditing} value={formData.name} />
                  </div>

                  <div>
                    <Label>Correo Electrónico</Label>
                    <Input disabled value={formData.email} />
                  </div>

                  <div>
                    <Label>Teléfono</Label>
                    <Input disabled={!isEditing} value={formData.telefono} />
                  </div>

                  <div>
                    <Label>Dirección Consultorio</Label>
                    <Input disabled={!isEditing} value={formData.direccion} />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Biografía Profesional</Label>
                    <Textarea
                      disabled={!isEditing}
                      value={formData.biografia}
                      className="min-h-[120px]"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-8 flex justify-end">
                    <Button className="bg-blue-600 px-10 hover:bg-blue-700">
                      Guardar Cambios
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
