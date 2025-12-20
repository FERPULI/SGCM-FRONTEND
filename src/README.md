# Sistema de Gestión de Citas Médicas

Sistema integral de gestión de citas médicas con tres roles de usuario: pacientes, doctores y administradores. Construido con React, TypeScript y Tailwind CSS, diseñado para consumir una API REST de Laravel.

## 🚀 Características

### Para Pacientes
- ✅ Registro y autenticación
- 📅 Agendar citas médicas
- 📋 Ver historial de citas
- 🏥 Acceso a historial médico
- 👤 Gestión de perfil personal
- 🔔 Notificaciones de citas

### Para Doctores
- 📊 Dashboard con estadísticas
- 📅 Calendario de citas
- 👥 Lista de pacientes
- 📝 Crear y actualizar historiales médicos
- ⏰ Gestión de horarios de atención
- 👤 Perfil profesional

### Para Administradores
- 📈 Dashboard con reportes y análisis
- 👥 Gestión de usuarios (pacientes, doctores, admins)
- 📅 Gestión de citas
- 📊 Reportes y estadísticas
- ⚙️ Configuración del sistema

## 📋 Requisitos Previos

- Node.js >= 18.x
- npm >= 9.x o yarn >= 1.22.x
- Backend Laravel corriendo (ver documentación de backend)

## 🛠️ Instalación

### 1. Clonar el repositorio

\`\`\`bash
git clone [URL_DEL_REPOSITORIO]
cd sistema-citas-medicas
\`\`\`

### 2. Instalar dependencias

\`\`\`bash
npm install
# o
yarn install
\`\`\`

### 3. Configurar variables de entorno

Copia el archivo \`.env.example\` a \`.env\`:

\`\`\`bash
cp .env.example .env
\`\`\`

Edita el archivo \`.env\` y configura las variables necesarias:

\`\`\`env
# URL de tu API Laravel (importante: sin /api al final)
VITE_API_BASE_URL=https://anakondita.com/deploy_backend/api

# Otras configuraciones...
\`\`\`

### 4. Iniciar el servidor de desarrollo

\`\`\`bash
npm run dev
# o
yarn dev
\`\`\`

La aplicación estará disponible en \`http://localhost:5173\`

## 📦 Construir para Producción

### Generar build de producción

\`\`\`bash
npm run build
# o
yarn build
\`\`\`

Los archivos generados estarán en la carpeta \`dist/\`

### Previsualizar build de producción

\`\`\`bash
npm run preview
# o
yarn preview
\`\`\`

## 🏗️ Estructura del Proyecto

\`\`\`
/
├── components/          # Componentes de React
│   ├── admin/          # Componentes específicos de admin
│   ├── auth/           # Componentes de autenticación
│   ├── doctor/         # Componentes específicos de doctores
│   ├── patient/        # Componentes específicos de pacientes
│   ├── layout/         # Componentes de layout (Sidebar, TopBar)
│   ├── shared/         # Componentes compartidos
│   └── ui/             # Componentes UI reutilizables
├── config/             # Archivos de configuración
│   └── api.ts          # Configuración de endpoints API
├── hooks/              # Custom React Hooks
│   ├── useAuth.ts      # Hook de autenticación
│   ├── useApi.ts       # Hook genérico para API
│   └── usePagination.ts # Hook de paginación
├── services/           # Servicios para consumir API
│   ├── http.ts         # Cliente HTTP con interceptores
│   ├── auth.service.ts
│   ├── appointments.service.ts
│   ├── patients.service.ts
│   ├── doctors.service.ts
│   ├── users.service.ts
│   ├── medical-records.service.ts
│   ├── reports.service.ts
│   ├── notifications.service.ts
│   └── settings.service.ts
├── types/              # Definiciones de TypeScript
│   └── index.ts
├── utils/              # Utilidades
│   └── storage.ts      # Manejo de localStorage
├── styles/             # Estilos globales
│   └── globals.css
├── data/               # Datos mock para desarrollo
│   └── mockData.ts
├── App.tsx             # Componente principal
└── .env.example        # Variables de entorno de ejemplo
\`\`\`

## 🔌 Consumo de API

### Configuración

Todos los endpoints están centralizados en \`/config/api.ts\`. Actualiza este archivo según los endpoints de tu backend Laravel.

### Servicios

Los servicios están organizados por módulo en la carpeta \`/services\`:

\`\`\`typescript
// Ejemplo de uso de servicio de autenticación
import { authService } from './services';

// Login
await authService.login({ email, password });

// Registro
await authService.register({ name, email, password, ... });

// Logout
await authService.logout();
\`\`\`

### Hooks Personalizados

#### useAuth
\`\`\`typescript
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // ... uso del hook
}
\`\`\`

#### useApi
\`\`\`typescript
import { useApi } from './hooks/useApi';
import { appointmentsService } from './services';

function AppointmentsList() {
  const { data, isLoading, error, execute } = useApi(
    appointmentsService.getAppointments
  );
  
  useEffect(() => {
    execute({ status: 'pending' });
  }, []);
}
\`\`\`

#### usePagination
\`\`\`typescript
import { usePagination } from './hooks/usePagination';
import { patientsService } from './services';

function PatientsList() {
  const {
    data,
    currentPage,
    total,
    isLoading,
    setPage,
    setFilters
  } = usePagination(patientsService.getPatients);
}
\`\`\`

## 🔐 Autenticación

El sistema utiliza autenticación JWT (JSON Web Tokens):

1. Al iniciar sesión, el token se guarda en localStorage
2. El token se incluye automáticamente en todas las peticiones via interceptores
3. Si el token expira, se intenta refrescar automáticamente
4. Si falla el refresh, se redirige al login

### Interceptores HTTP

Los interceptores en \`/services/http.ts\` manejan:
- ✅ Agregar token de autenticación a todas las peticiones
- 🔄 Refrescar token automáticamente cuando expira
- ❌ Manejo centralizado de errores (401, 403, 404, 422, 500)
- 🔒 Redirección automática a login si no está autenticado

## 📱 Deployment

### Opción 1: Servidor Web Tradicional (Apache/Nginx)

1. Construir la aplicación:
\`\`\`bash
npm run build
\`\`\`

2. Copiar el contenido de \`dist/\` a tu servidor web

3. Configurar el servidor para redirigir todas las rutas a \`index.html\` (para SPA routing)

#### Ejemplo Nginx:
\`\`\`nginx
server {
    listen 80;
    server_name tudominio.com;
    root /var/www/html/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
\`\`\`

#### Ejemplo Apache (.htaccess):
\`\`\`apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
\`\`\`

### Opción 2: Vercel

\`\`\`bash
npm install -g vercel
vercel
\`\`\`

### Opción 3: Netlify

\`\`\`bash
npm install -g netlify-cli
netlify deploy --prod
\`\`\`

### Opción 4: Docker

Crear \`Dockerfile\`:

\`\`\`dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
\`\`\`

Construir y ejecutar:

\`\`\`bash
docker build -t medical-appointments-frontend .
docker run -p 80:80 medical-appointments-frontend
\`\`\`

## 🔧 Scripts Disponibles

\`\`\`bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Construye para producción
npm run preview      # Previsualiza build de producción

# Linting
npm run lint         # Ejecuta linter
\`\`\`

## 🌐 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| \`VITE_API_BASE_URL\` | URL base de la API Laravel | \`https://anakondita.com/deploy_backend/api\` |
| \`VITE_APP_NAME\` | Nombre de la aplicación | \`Sistema de Citas Médicas\` |
| \`VITE_ENV\` | Ambiente de ejecución | \`development\` / \`production\` |
| \`VITE_API_TIMEOUT\` | Timeout para peticiones API (ms) | \`30000\` |

Ver \`.env.example\` para todas las variables disponibles.

## 🔄 Integración con Laravel Backend

### Endpoints Esperados

El frontend espera que el backend Laravel tenga los siguientes endpoints (ver \`/config/api.ts\` para lista completa):

#### Autenticación
- \`POST /api/auth/login\`
- \`POST /api/auth/register\`
- \`POST /api/auth/logout\`
- \`POST /api/auth/refresh\`
- \`GET /api/auth/me\`

#### Citas
- \`GET /api/appointments\`
- \`POST /api/appointments\`
- \`GET /api/appointments/{id}\`
- \`PUT /api/appointments/{id}\`
- \`DELETE /api/appointments/{id}\`
- ... (ver más en \`/config/api.ts\`)

### Formato de Respuestas

El backend debe responder en el siguiente formato:

**Éxito:**
\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa"
}
\`\`\`

**Error:**
\`\`\`json
{
  "success": false,
  "message": "Mensaje de error",
  "errors": {
    "field": ["Error de validación"]
  }
}
\`\`\`

**Paginación:**
\`\`\`json
{
  "success": true,
  "data": {
    "data": [...],
    "current_page": 1,
    "per_page": 10,
    "total": 100,
    "last_page": 10,
    "from": 1,
    "to": 10
  }
}
\`\`\`

## 🐛 Troubleshooting

### Error: CORS

Si tienes problemas de CORS, configura tu backend Laravel:

\`\`\`php
// config/cors.php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:5173'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => true,
\`\`\`

### Error: Token Expirado

El sistema maneja automáticamente tokens expirados. Si persiste el problema, verifica:
1. Que el endpoint \`/api/auth/refresh\` esté funcionando
2. Que el token de refresco se esté guardando correctamente

### Error: Variables de entorno no se cargan

Las variables deben comenzar con \`VITE_\` para ser accesibles en el cliente:
- ✅ \`VITE_API_BASE_URL\`
- ❌ \`API_BASE_URL\`

## 📄 Licencia

[Especificar licencia]

## 👥 Contribuidores

[Lista de contribuidores]

## 📞 Soporte

Para soporte y preguntas:
- Email: [email de soporte]
- Documentación: [URL de documentación]
- Issues: [URL de issues en GitHub]
\`\`\`
