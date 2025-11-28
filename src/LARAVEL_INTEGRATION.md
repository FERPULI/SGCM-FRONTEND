# Guía de Integración con Laravel Backend

Esta guía explica cómo integrar el frontend React con un backend Laravel para el Sistema de Gestión de Citas Médicas.

## 📋 Tabla de Contenidos

1. [Requisitos del Backend](#requisitos-del-backend)
2. [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
3. [Endpoints Requeridos](#endpoints-requeridos)
4. [Formato de Respuestas](#formato-de-respuestas)
5. [Autenticación JWT](#autenticación-jwt)
6. [Middleware y Permisos](#middleware-y-permisos)
7. [Manejo de Errores](#manejo-de-errores)
8. [CORS Configuration](#cors-configuration)

## 🔧 Requisitos del Backend

### Paquetes Laravel Recomendados

\`\`\`bash
composer require tymon/jwt-auth
composer require spatie/laravel-permission
composer require laravel/sanctum
\`\`\`

### Configuración Inicial

1. **JWT Authentication**
\`\`\`bash
php artisan jwt:secret
\`\`\`

2. **Permisos**
\`\`\`bash
php artisan vendor:publish --provider="Spatie\\Permission\\PermissionServiceProvider"
php artisan migrate
\`\`\`

## 🗄️ Estructura de la Base de Datos

### Migraciones Principales

#### Usuarios (users)
\`\`\`php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->timestamp('email_verified_at')->nullable();
    $table->string('password');
    $table->enum('role', ['admin', 'doctor', 'patient'])->default('patient');
    $table->boolean('is_active')->default(true);
    $table->string('phone')->nullable();
    $table->rememberToken();
    $table->timestamps();
});
\`\`\`

#### Pacientes (patients)
\`\`\`php
Schema::create('patients', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->string('first_name');
    $table->string('last_name');
    $table->date('date_of_birth');
    $table->enum('gender', ['male', 'female', 'other']);
    $table->text('address')->nullable();
    $table->string('emergency_contact_name')->nullable();
    $table->string('emergency_contact_phone')->nullable();
    $table->string('blood_type')->nullable();
    $table->text('allergies')->nullable();
    $table->text('chronic_conditions')->nullable();
    $table->timestamps();
});
\`\`\`

#### Doctores (doctors)
\`\`\`php
Schema::create('doctors', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->string('first_name');
    $table->string('last_name');
    $table->string('specialty');
    $table->string('license_number')->unique();
    $table->integer('years_of_experience')->default(0);
    $table->text('education')->nullable();
    $table->text('bio')->nullable();
    $table->decimal('consultation_fee', 10, 2)->nullable();
    $table->boolean('is_available')->default(true);
    $table->timestamps();
});
\`\`\`

#### Citas (appointments)
\`\`\`php
Schema::create('appointments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('patient_id')->constrained()->onDelete('cascade');
    $table->foreignId('doctor_id')->constrained()->onDelete('cascade');
    $table->dateTime('appointment_date');
    $table->enum('status', [
        'pending',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled',
        'no_show'
    ])->default('pending');
    $table->string('reason');
    $table->text('notes')->nullable();
    $table->text('cancellation_reason')->nullable();
    $table->text('completion_notes')->nullable();
    $table->timestamps();
});
\`\`\`

#### Historial Médico (medical_records)
\`\`\`php
Schema::create('medical_records', function (Blueprint $table) {
    $table->id();
    $table->foreignId('patient_id')->constrained()->onDelete('cascade');
    $table->foreignId('doctor_id')->constrained()->onDelete('cascade');
    $table->foreignId('appointment_id')->nullable()->constrained();
    $table->date('record_date');
    $table->text('diagnosis');
    $table->text('treatment');
    $table->text('prescriptions')->nullable();
    $table->text('notes')->nullable();
    $table->json('vital_signs')->nullable();
    $table->json('attachments')->nullable();
    $table->timestamps();
});
\`\`\`

#### Horarios de Doctores (doctor_schedules)
\`\`\`php
Schema::create('doctor_schedules', function (Blueprint $table) {
    $table->id();
    $table->foreignId('doctor_id')->constrained()->onDelete('cascade');
    $table->integer('day_of_week'); // 0-6 (Domingo a Sábado)
    $table->time('start_time');
    $table->time('end_time');
    $table->boolean('is_available')->default(true);
    $table->timestamps();
});
\`\`\`

## 🌐 Endpoints Requeridos

### Autenticación

#### POST /api/auth/register
\`\`\`php
// Request
{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "patient",
    "phone": "+123456789"
}

// Response
{
    "success": true,
    "data": {
        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "token_type": "bearer",
        "expires_in": 3600,
        "user": {
            "id": 1,
            "name": "Juan Pérez",
            "email": "juan@example.com",
            "role": "patient",
            ...
        }
    },
    "message": "Usuario registrado exitosamente"
}
\`\`\`

#### POST /api/auth/login
\`\`\`php
// Request
{
    "email": "juan@example.com",
    "password": "password123"
}

// Response (igual que register)
\`\`\`

#### POST /api/auth/logout
\`\`\`php
// Headers: Authorization: Bearer {token}

// Response
{
    "success": true,
    "message": "Sesión cerrada exitosamente"
}
\`\`\`

#### GET /api/auth/me
\`\`\`php
// Headers: Authorization: Bearer {token}

// Response
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Juan Pérez",
        "email": "juan@example.com",
        "role": "patient",
        "patient": { ... } // si es paciente
    }
}
\`\`\`

### Citas (Appointments)

#### GET /api/appointments
\`\`\`php
// Query params: ?page=1&per_page=10&status=pending&doctor_id=1&date_from=2024-01-01

// Response
{
    "success": true,
    "data": {
        "data": [
            {
                "id": 1,
                "patient_id": 1,
                "doctor_id": 2,
                "appointment_date": "2024-01-15 10:00:00",
                "status": "pending",
                "reason": "Consulta general",
                "notes": null,
                "patient": { ... },
                "doctor": { ... },
                "created_at": "2024-01-01 12:00:00"
            }
        ],
        "current_page": 1,
        "per_page": 10,
        "total": 45,
        "last_page": 5,
        "from": 1,
        "to": 10
    }
}
\`\`\`

#### POST /api/appointments
\`\`\`php
// Request
{
    "doctor_id": 2,
    "appointment_date": "2024-01-15 10:00:00",
    "reason": "Consulta general",
    "notes": "Primera visita"
}

// Response
{
    "success": true,
    "data": {
        "id": 1,
        "patient_id": 1,
        "doctor_id": 2,
        ...
    },
    "message": "Cita creada exitosamente"
}
\`\`\`

#### PUT /api/appointments/{id}
#### DELETE /api/appointments/{id}
#### POST /api/appointments/{id}/cancel
#### POST /api/appointments/{id}/confirm
#### POST /api/appointments/{id}/complete

### Pacientes (Patients)

#### GET /api/patients
#### POST /api/patients
#### GET /api/patients/{id}
#### PUT /api/patients/{id}
#### DELETE /api/patients/{id}
#### GET /api/patients/profile (paciente autenticado)
#### PUT /api/patients/profile
#### GET /api/patients/{id}/medical-history

### Doctores (Doctors)

#### GET /api/doctors
#### POST /api/doctors
#### GET /api/doctors/{id}
#### PUT /api/doctors/{id}
#### DELETE /api/doctors/{id}
#### GET /api/doctors/profile (doctor autenticado)
#### PUT /api/doctors/profile
#### GET /api/doctors/{id}/schedule
#### PUT /api/doctors/{id}/schedule
#### GET /api/doctors/specialties

### Usuarios (Admin)

#### GET /api/users
#### POST /api/users
#### GET /api/users/{id}
#### PUT /api/users/{id}
#### DELETE /api/users/{id}
#### POST /api/users/{id}/toggle-status

### Historiales Médicos

#### GET /api/patients/{patientId}/medical-records
#### POST /api/patients/{patientId}/medical-records
#### GET /api/patients/{patientId}/medical-records/{recordId}
#### PUT /api/patients/{patientId}/medical-records/{recordId}
#### DELETE /api/patients/{patientId}/medical-records/{recordId}

### Reportes (Admin)

#### GET /api/reports/dashboard-stats
#### GET /api/reports/appointments-by-date
#### GET /api/reports/appointments-by-status
#### GET /api/reports/doctors-performance

## 📦 Formato de Respuestas

### Éxito
\`\`\`json
{
    "success": true,
    "data": { ... },
    "message": "Operación exitosa"
}
\`\`\`

### Error
\`\`\`json
{
    "success": false,
    "message": "Error al procesar la solicitud",
    "errors": {
        "email": ["El email ya está en uso"],
        "password": ["La contraseña debe tener al menos 8 caracteres"]
    }
}
\`\`\`

### Paginación
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

## 🔐 Autenticación JWT

### Configuración en config/jwt.php
\`\`\`php
'ttl' => env('JWT_TTL', 60), // minutos
'refresh_ttl' => env('JWT_REFRESH_TTL', 20160), // 2 semanas
\`\`\`

### AuthController Ejemplo
\`\`\`php
<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Auth;
use Tymon\\JWTAuth\\Facades\\JWTAuth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (!$token = auth()->attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales inválidas'
            ], 401);
        }

        return $this->respondWithToken($token);
    }

    protected function respondWithToken($token)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'access_token' => $token,
                'token_type' => 'bearer',
                'expires_in' => auth()->factory()->getTTL() * 60,
                'user' => auth()->user()->load(['patient', 'doctor'])
            ]
        ]);
    }
}
\`\`\`

## 🛡️ Middleware y Permisos

### api.php Routes
\`\`\`php
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    
    Route::middleware('auth:api')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

Route::middleware('auth:api')->group(function () {
    // Rutas para pacientes
    Route::middleware('role:patient')->group(function () {
        Route::get('patients/profile', [PatientController::class, 'profile']);
        Route::post('appointments', [AppointmentController::class, 'store']);
    });

    // Rutas para doctores
    Route::middleware('role:doctor')->group(function () {
        Route::get('doctors/profile', [DoctorController::class, 'profile']);
        Route::get('doctors/appointments', [AppointmentController::class, 'doctorAppointments']);
    });

    // Rutas para administradores
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::get('reports/dashboard-stats', [ReportController::class, 'dashboardStats']);
    });
});
\`\`\`

### RoleMiddleware
\`\`\`php
<?php

namespace App\\Http\\Middleware;

use Closure;
use Illuminate\\Http\\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        if (!$request->user() || !in_array($request->user()->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado'
            ], 403);
        }

        return $next($request);
    }
}
\`\`\`

## ❌ Manejo de Errores

### Handler.php
\`\`\`php
public function render($request, Throwable $exception)
{
    if ($request->is('api/*')) {
        if ($exception instanceof ValidationException) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $exception->errors()
            ], 422);
        }

        if ($exception instanceof ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Recurso no encontrado'
            ], 404);
        }

        if ($exception instanceof UnauthorizedException) {
            return response()->json([
                'success' => false,
                'message' => 'No autorizado'
            ], 401);
        }

        return response()->json([
            'success' => false,
            'message' => 'Error del servidor'
        ], 500);
    }

    return parent::render($request, $exception);
}
\`\`\`

## 🔄 CORS Configuration

### config/cors.php
\`\`\`php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    
    'allowed_methods' => ['*'],
    
    'allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:3000',
        env('FRONTEND_URL', 'http://localhost:5173')
    ],
    
    'allowed_origins_patterns' => [],
    
    'allowed_headers' => ['*'],
    
    'exposed_headers' => [],
    
    'max_age' => 0,
    
    'supports_credentials' => true,
];
\`\`\`

### .env
\`\`\`env
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key
JWT_TTL=60
JWT_REFRESH_TTL=20160
\`\`\`

## 🚀 Testing

### Ejemplo de Test
\`\`\`php
public function test_user_can_login()
{
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => bcrypt('password123')
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => 'test@example.com',
        'password' => 'password123'
    ]);

    $response->assertStatus(200)
             ->assertJsonStructure([
                 'success',
                 'data' => [
                     'access_token',
                     'token_type',
                     'expires_in',
                     'user'
                 ]
             ]);
}
\`\`\`

## 📝 Notas Adicionales

1. **Validación**: Usar Form Requests para validación compleja
2. **Resources**: Usar API Resources para formatear respuestas consistentes
3. **Rate Limiting**: Implementar rate limiting en rutas públicas
4. **Logs**: Registrar todas las acciones importantes
5. **Backups**: Configurar backups automáticos de la base de datos
6. **Queue**: Usar colas para envío de emails y notificaciones
7. **Cache**: Implementar cache para consultas frecuentes

## 🔗 Enlaces Útiles

- [Laravel JWT Auth Documentation](https://jwt-auth.readthedocs.io/)
- [Laravel API Resources](https://laravel.com/docs/eloquent-resources)
- [Spatie Laravel Permission](https://spatie.be/docs/laravel-permission/)
