import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { Settings as SettingsIcon, Bell, Shield, Database, Mail } from "lucide-react";

export function Settings() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl">Configuración del Sistema</h1>
        <p className="text-gray-500 mt-1">Gestiona la configuración general de la plataforma</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
              <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
              <TabsTrigger value="integraciones">Integraciones</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg flex items-center gap-2 mb-4">
                    <SettingsIcon className="h-5 w-5" />
                    Configuración General
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombreSistema">Nombre del Sistema</Label>
                        <Input
                          id="nombreSistema"
                          defaultValue="Sistema de Gestión de Citas Médicas"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nombreClinica">Nombre de la Clínica</Label>
                        <Input
                          id="nombreClinica"
                          placeholder="Hospital General"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email de Contacto</Label>
                        <Input
                          id="email"
                          type="email"
                          defaultValue="contacto@hospital.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono de Contacto</Label>
                        <Input
                          id="telefono"
                          defaultValue="+34 900 000 000"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="direccion">Dirección</Label>
                      <Input
                        id="direccion"
                        placeholder="Calle Principal, 123, Ciudad"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm mb-4">Horarios de Atención</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Lunes a Viernes</span>
                      <Input className="w-40" defaultValue="09:00 - 18:00" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Sábado</span>
                      <Input className="w-40" defaultValue="09:00 - 14:00" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Domingo</span>
                      <Input className="w-40" defaultValue="Cerrado" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm mb-4">Preferencias del Sistema</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Duración de Cita por Defecto</Label>
                        <p className="text-xs text-gray-500">Tiempo estimado por consulta</p>
                      </div>
                      <Input className="w-32" type="number" defaultValue="30" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Días de Anticipación</Label>
                        <p className="text-xs text-gray-500">Máximo de días para reservar citas</p>
                      </div>
                      <Input className="w-32" type="number" defaultValue="60" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Permitir Auto-Registro de Pacientes</Label>
                        <p className="text-xs text-gray-500">Los pacientes pueden crear su propia cuenta</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notificaciones" className="space-y-6 pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg flex items-center gap-2 mb-4">
                    <Bell className="h-5 w-5" />
                    Configuración de Notificaciones
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Recordatorios de Cita por Email</Label>
                        <p className="text-xs text-gray-500">Enviar recordatorios 24 horas antes</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Recordatorios de Cita por SMS</Label>
                        <p className="text-xs text-gray-500">Enviar SMS 2 horas antes</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Notificar Nuevas Citas a Médicos</Label>
                        <p className="text-xs text-gray-500">Alertar cuando se asigna una nueva cita</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Confirmar Cancelaciones</Label>
                        <p className="text-xs text-gray-500">Enviar confirmación de cancelación</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm mb-4">Configuración de Email</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpServer">Servidor SMTP</Label>
                      <Input id="smtpServer" placeholder="smtp.gmail.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">Puerto</Label>
                      <Input id="smtpPort" placeholder="587" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpUser">Usuario</Label>
                      <Input id="smtpUser" type="email" placeholder="ejemplo@email.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPass">Contraseña</Label>
                      <Input id="smtpPass" type="password" placeholder="••••••••" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seguridad" className="space-y-6 pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5" />
                    Seguridad y Privacidad
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Autenticación de Dos Factores</Label>
                        <p className="text-xs text-gray-500">Requerir 2FA para todos los usuarios</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Bloqueo Automático de Sesión</Label>
                        <p className="text-xs text-gray-500">Cerrar sesión después de inactividad</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Registro de Auditoría</Label>
                        <p className="text-xs text-gray-500">Mantener logs de todas las acciones</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Encriptación de Datos</Label>
                        <p className="text-xs text-gray-500">Encriptar información sensible</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm mb-4">Políticas de Contraseña</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Longitud Mínima</Label>
                      <Input className="w-32" type="number" defaultValue="8" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Requerir Caracteres Especiales</Label>
                        <p className="text-xs text-gray-500">Al menos un carácter especial</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Requerir Mayúsculas y Minúsculas</Label>
                        <p className="text-xs text-gray-500">Combinación de letras</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integraciones" className="space-y-6 pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg flex items-center gap-2 mb-4">
                    <Database className="h-5 w-5" />
                    Integraciones y APIs
                  </h3>
                  
                  <div className="space-y-3">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-sm">Google Calendar</CardTitle>
                            <CardDescription className="text-xs">Sincronizar citas con Google Calendar</CardDescription>
                          </div>
                          <Switch />
                        </div>
                      </CardHeader>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-sm">Stripe Payments</CardTitle>
                            <CardDescription className="text-xs">Procesar pagos en línea</CardDescription>
                          </div>
                          <Switch />
                        </div>
                      </CardHeader>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-sm">Twilio SMS</CardTitle>
                            <CardDescription className="text-xs">Envío de SMS a pacientes</CardDescription>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardHeader>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-sm">SendGrid Email</CardTitle>
                            <CardDescription className="text-xs">Servicio de email transaccional</CardDescription>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardHeader>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
            <Button variant="outline">Cancelar</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Guardar Cambios</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
