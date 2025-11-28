# Guía de Despliegue - Sistema de Gestión de Citas Médicas

Esta guía proporciona instrucciones detalladas para desplegar el frontend del Sistema de Gestión de Citas Médicas en producción.

## 📋 Índice

1. [Preparación Pre-Despliegue](#preparación-pre-despliegue)
2. [Build de Producción](#build-de-producción)
3. [Despliegue en Servidor Web](#despliegue-en-servidor-web)
4. [Despliegue en Plataformas Cloud](#despliegue-en-plataformas-cloud)
5. [Despliegue con Docker](#despliegue-con-docker)
6. [Configuración de Dominio y SSL](#configuración-de-dominio-y-ssl)
7. [Optimizaciones de Rendimiento](#optimizaciones-de-rendimiento)
8. [Monitoreo y Logs](#monitoreo-y-logs)

---

## 🔧 Preparación Pre-Despliegue

### 1. Verificar Variables de Entorno

Crea un archivo \`.env.production\`:

\`\`\`env
# API Configuration
VITE_API_BASE_URL=https://api.tudominio.com/api

# App Configuration
VITE_APP_NAME="Sistema de Gestión de Citas Médicas"
VITE_APP_VERSION=1.0.0
VITE_ENV=production

# Deshabilitar modo debug
VITE_DEBUG=false

# API Timeout
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_EMAIL_REMINDERS=true
VITE_ENABLE_SMS_NOTIFICATIONS=true
\`\`\`

### 2. Auditoría de Seguridad

\`\`\`bash
# Revisar dependencias vulnerables
npm audit

# Corregir automáticamente
npm audit fix

# Para vulnerabilidades críticas
npm audit fix --force
\`\`\`

### 3. Tests

\`\`\`bash
# Ejecutar tests antes de desplegar
npm run test

# Linting
npm run lint
\`\`\`

---

## 📦 Build de Producción

### Compilar la Aplicación

\`\`\`bash
# Limpiar builds anteriores
rm -rf dist

# Construir para producción
npm run build

# O con archivo .env específico
npm run build -- --mode production
\`\`\`

### Verificar el Build

\`\`\`bash
# Previsualizar localmente
npm run preview

# El servidor estará en http://localhost:4173
\`\`\`

### Optimizaciones en vite.config.ts

\`\`\`typescript
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false, // Desactivar sourcemaps en producción
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.logs
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'utils': ['axios', 'date-fns'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
\`\`\`

---

## 🌐 Despliegue en Servidor Web

### Opción 1: Nginx

#### 1. Instalar Nginx

\`\`\`bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
\`\`\`

#### 2. Copiar Archivos

\`\`\`bash
# Crear directorio
sudo mkdir -p /var/www/medical-appointments

# Copiar build
sudo cp -r dist/* /var/www/medical-appointments/

# Establecer permisos
sudo chown -R www-data:www-data /var/www/medical-appointments
sudo chmod -R 755 /var/www/medical-appointments
\`\`\`

#### 3. Configurar Nginx

Crear archivo \`/etc/nginx/sites-available/medical-appointments\`:

\`\`\`nginx
server {
    listen 80;
    listen [::]:80;
    
    server_name tudominio.com www.tudominio.com;
    root /var/www/medical-appointments;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;

    # Cache static assets
    location ~* \\.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing - redirect all to index.html
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Deny access to hidden files
    location ~ /\\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
\`\`\`

#### 4. Activar Sitio

\`\`\`bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/medical-appointments /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
\`\`\`

### Opción 2: Apache

#### 1. Instalar Apache

\`\`\`bash
sudo apt install apache2
\`\`\`

#### 2. Copiar Archivos

\`\`\`bash
sudo mkdir -p /var/www/medical-appointments
sudo cp -r dist/* /var/www/medical-appointments/
sudo chown -R www-data:www-data /var/www/medical-appointments
\`\`\`

#### 3. Configurar VirtualHost

Crear \`/etc/apache2/sites-available/medical-appointments.conf\`:

\`\`\`apache
<VirtualHost *:80>
    ServerName tudominio.com
    ServerAlias www.tudominio.com
    DocumentRoot /var/www/medical-appointments

    <Directory /var/www/medical-appointments>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Logging
    ErrorLog ${APACHE_LOG_DIR}/medical-appointments-error.log
    CustomLog ${APACHE_LOG_DIR}/medical-appointments-access.log combined
</VirtualHost>
\`\`\`

#### 4. Crear .htaccess

En \`/var/www/medical-appointments/.htaccess\`:

\`\`\`apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # HTTPS redirect
    # RewriteCond %{HTTPS} off
    # RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    # SPA routing
    RewriteRule ^index\\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>
\`\`\`

#### 5. Activar Sitio

\`\`\`bash
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate
sudo a2ensite medical-appointments
sudo systemctl restart apache2
\`\`\`

---

## ☁️ Despliegue en Plataformas Cloud

### Vercel

#### 1. Instalar Vercel CLI

\`\`\`bash
npm install -g vercel
\`\`\`

#### 2. Configurar vercel.json

\`\`\`json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "@vite_api_base_url"
  }
}
\`\`\`

#### 3. Desplegar

\`\`\`bash
# Login
vercel login

# Desplegar a producción
vercel --prod

# Configurar variables de entorno
vercel env add VITE_API_BASE_URL production
\`\`\`

### Netlify

#### 1. Instalar Netlify CLI

\`\`\`bash
npm install -g netlify-cli
\`\`\`

#### 2. Configurar netlify.toml

\`\`\`toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
\`\`\`

#### 3. Desplegar

\`\`\`bash
# Login
netlify login

# Desplegar
netlify deploy --prod

# O conectar con GitHub para despliegue automático
netlify init
\`\`\`

### AWS S3 + CloudFront

#### 1. Crear Bucket S3

\`\`\`bash
aws s3 mb s3://medical-appointments-frontend
\`\`\`

#### 2. Configurar Bucket para Hosting

\`\`\`bash
aws s3 website s3://medical-appointments-frontend \\
  --index-document index.html \\
  --error-document index.html
\`\`\`

#### 3. Subir Archivos

\`\`\`bash
aws s3 sync dist/ s3://medical-appointments-frontend \\
  --delete \\
  --cache-control "public, max-age=31536000" \\
  --exclude "index.html"

aws s3 cp dist/index.html s3://medical-appointments-frontend/index.html \\
  --cache-control "no-cache"
\`\`\`

#### 4. Configurar CloudFront

Ver documentación de AWS CloudFront para CDN y certificados SSL.

---

## 🐳 Despliegue con Docker

### 1. Crear Dockerfile

\`\`\`dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \\
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
\`\`\`

### 2. Crear nginx.conf

\`\`\`nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
\`\`\`

### 3. Crear .dockerignore

\`\`\`
node_modules
dist
.git
.env
.env.local
*.log
\`\`\`

### 4. Construir y Ejecutar

\`\`\`bash
# Construir imagen
docker build -t medical-appointments-frontend .

# Ejecutar contenedor
docker run -d -p 80:80 --name medical-app medical-appointments-frontend

# Con variables de entorno
docker run -d -p 80:80 \\
  -e VITE_API_BASE_URL=https://api.tudominio.com/api \\
  --name medical-app \\
  medical-appointments-frontend
\`\`\`

### 5. Docker Compose

\`\`\`yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=https://api.tudominio.com/api
    restart: unless-stopped
    networks:
      - medical-app-network

networks:
  medical-app-network:
    driver: bridge
\`\`\`

---

## 🔒 Configuración de Dominio y SSL

### Certbot (Let's Encrypt) - Nginx

\`\`\`bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tudominio.com -d www.tudominio.com

# Renovación automática
sudo certbot renew --dry-run
\`\`\`

### Certbot - Apache

\`\`\`bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d tudominio.com -d www.tudominio.com
\`\`\`

---

## ⚡ Optimizaciones de Rendimiento

### 1. Compresión Brotli (Nginx)

\`\`\`bash
# Instalar módulo brotli
sudo apt install nginx-module-brotli
\`\`\`

\`\`\`nginx
# En nginx.conf
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
\`\`\`

### 2. HTTP/2

\`\`\`nginx
listen 443 ssl http2;
\`\`\`

### 3. CDN

Considerar usar Cloudflare, AWS CloudFront, o similar para distribución global.

### 4. Caché del Navegador

Ya configurado en ejemplos de Nginx/Apache arriba.

---

## 📊 Monitoreo y Logs

### PM2 (para Node.js servers)

\`\`\`bash
# Instalar PM2
npm install -g pm2

# Iniciar con PM2
pm2 serve dist 3000 --spa --name medical-app

# Guardar configuración
pm2 save

# Startup automático
pm2 startup
\`\`\`

### Logs de Nginx

\`\`\`bash
# Ver logs en tiempo real
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
\`\`\`

### Herramientas de Monitoreo

- **Google Analytics**: Para analytics de usuarios
- **Sentry**: Para tracking de errores
- **New Relic**: Para rendimiento
- **Uptime Robot**: Para monitoreo de uptime

---

## ✅ Checklist Pre-Despliegue

- [ ] Variables de entorno configuradas
- [ ] Build de producción generado sin errores
- [ ] Tests ejecutados y pasando
- [ ] Auditoría de seguridad completada
- [ ] SSL/TLS configurado
- [ ] Compresión habilitada (gzip/brotli)
- [ ] Cache configurado correctamente
- [ ] Headers de seguridad aplicados
- [ ] Dominio apuntando al servidor
- [ ] Backups configurados
- [ ] Monitoreo habilitado
- [ ] Logs accesibles
- [ ] Documentación actualizada

---

## 🆘 Troubleshooting

### Problema: Rutas 404 en refresh

**Solución**: Asegúrate de que el servidor está redirigiendo todas las rutas a \`index.html\`.

### Problema: Variables de entorno no funcionan

**Solución**: Reconstruir la aplicación después de cambiar \`.env\`. Las variables se "bake" en el build.

### Problema: Assets no cargan (CORS)

**Solución**: Verificar configuración CORS en el backend y headers del servidor web.

---

## 📞 Soporte

Para más ayuda, consulta la documentación principal o contacta al equipo de desarrollo.
