# Documentación: Registro de Pacientes - Backend

## Resumen
Cuando se crea un nuevo paciente a través del formulario de registro, el **backend debe crear registros en DOS tablas**:
1. Tabla `users` (Usuario)
2. Tabla `pacientes` (Paciente) con el mismo ID

---

## Endpoint de Registro
**Ruta:** `POST /api/auth/register`

### Request Body
```json
{
  "nombre": "Juan",
  "apellidos": "Pérez García",
  "email": "juan.perez@email.com",
  "password": "password123",
  "password_confirmation": "password123",
  "rol": "paciente",
  "activo": true,
  "device_name": "web-browser",
  
  // Campos opcionales del paciente
  "telefono": "123456789",
  "fecha_nacimiento": "1990-01-15",
  "direccion": "Calle Principal 123",
  "tipo_sangre": "O+",
  "alergias": "Ninguna"
}
```

### Response Body (Éxito)
```json
{
  "token": "1|abcdef123456...",
  "token_type": "Bearer",
  "user": {
    "id": 15,
    "nombre": "Juan",
    "apellidos": "Pérez García",
    "nombre_completo": "Juan Pérez García",
    "email": "juan.perez@email.com",
    "rol": "paciente",
    "activo": true,
    "created_at": "2025-12-20T10:30:00.000000Z",
    "updated_at": "2025-12-20T10:30:00.000000Z",
    "paciente": {
      "id": 15,
      "usuario_id": 15,
      "fecha_nacimiento": "1990-01-15",
      "telefono": "123456789",
      "direccion": "Calle Principal 123",
      "tipo_sangre": "O+",
      "alergias": "Ninguna"
    },
    "medico": null
  }
}
```

---

## Implementación en Laravel (Backend)

### Controlador: AuthController.php

```php
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Paciente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    /**
     * Registrar nuevo paciente
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        // 1. Validar datos de entrada
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'telefono' => 'nullable|string|max:20',
            'fecha_nacimiento' => 'nullable|date',
            'direccion' => 'nullable|string|max:500',
            'tipo_sangre' => 'nullable|string|max:5',
            'alergias' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // 2. Usar transacción para crear ambos registros
        try {
            DB::beginTransaction();

            // 2.1. Crear usuario en tabla 'users'
            $user = User::create([
                'nombre' => $request->nombre,
                'apellidos' => $request->apellidos,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'rol' => 'paciente',
                'activo' => true,
            ]);

            // 2.2. Crear paciente en tabla 'pacientes' con el mismo ID
            $paciente = Paciente::create([
                'id' => $user->id,  // ⚠️ IMPORTANTE: Mismo ID que el usuario
                'usuario_id' => $user->id,
                'fecha_nacimiento' => $request->fecha_nacimiento,
                'telefono' => $request->telefono,
                'direccion' => $request->direccion,
                'tipo_sangre' => $request->tipo_sangre,
                'alergias' => $request->alergias,
            ]);

            DB::commit();

            // 3. Crear token de autenticación (Laravel Sanctum)
            $token = $user->createToken($request->device_name ?? 'web-browser')->plainTextToken;

            // 4. Cargar la relación del paciente para la respuesta
            $user->load('paciente');

            // 5. Devolver respuesta exitosa
            return response()->json([
                'token' => $token,
                'token_type' => 'Bearer',
                'user' => $user
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Error al registrar el paciente',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
```

---

## Modelos de Laravel

### User.php
```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'nombre',
        'apellidos',
        'email',
        'password',
        'rol',
        'activo',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'email_verified_at' => 'datetime',
    ];

    protected $appends = ['nombre_completo'];

    public function getNombreCompletoAttribute()
    {
        return "{$this->nombre} {$this->apellidos}";
    }

    // Relación con Paciente (1:1)
    public function paciente()
    {
        return $this->hasOne(Paciente::class, 'usuario_id');
    }

    // Relación con Médico (1:1)
    public function medico()
    {
        return $this->hasOne(Medico::class, 'usuario_id');
    }
}
```

### Paciente.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Paciente extends Model
{
    // ⚠️ IMPORTANTE: No usar auto-incremento
    public $incrementing = false;
    
    protected $table = 'pacientes';
    
    protected $fillable = [
        'id',
        'usuario_id',
        'fecha_nacimiento',
        'telefono',
        'direccion',
        'tipo_sangre',
        'alergias',
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date',
    ];

    // Relación inversa con User
    public function user()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
```

---

## Migraciones de Base de Datos

### create_users_table.php
```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('nombre');
    $table->string('apellidos');
    $table->string('email')->unique();
    $table->string('password');
    $table->enum('rol', ['admin', 'medico', 'paciente'])->default('paciente');
    $table->boolean('activo')->default(true);
    $table->timestamp('email_verified_at')->nullable();
    $table->rememberToken();
    $table->timestamps();
});
```

### create_pacientes_table.php
```php
Schema::create('pacientes', function (Blueprint $table) {
    // ⚠️ ID manual (no auto-incremento)
    $table->unsignedBigInteger('id')->primary();
    $table->unsignedBigInteger('usuario_id')->unique();
    $table->date('fecha_nacimiento')->nullable();
    $table->string('telefono', 20)->nullable();
    $table->string('direccion', 500)->nullable();
    $table->string('tipo_sangre', 5)->nullable();
    $table->text('alergias')->nullable();
    $table->timestamps();

    $table->foreign('usuario_id')
          ->references('id')
          ->on('users')
          ->onDelete('cascade');
});
```

---

## Ruta en Laravel

### api.php
```php
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/profile', [AuthController::class, 'profile']);
    });
});
```

---

## Validaciones en el Frontend

El frontend ya valida:
1. ✅ Campos obligatorios (nombre, apellidos, email, password)
2. ✅ Contraseñas coinciden
3. ✅ Contraseña mínimo 6 caracteres
4. ✅ Email válido

---

## Flujo Completo del Registro

```
1. Usuario completa formulario
   ↓
2. Frontend envía POST /api/auth/register
   ↓
3. Backend valida datos
   ↓
4. Backend inicia transacción DB
   ↓
5. Backend crea registro en 'users'
   ↓
6. Backend crea registro en 'pacientes' (mismo ID)
   ↓
7. Backend hace commit de transacción
   ↓
8. Backend genera token Sanctum
   ↓
9. Backend devuelve {token, user (con paciente)}
   ↓
10. Frontend guarda token y datos de usuario
   ↓
11. Frontend redirige a Dashboard de Paciente
```

---

## Posibles Errores

### Error: Email duplicado
```json
{
  "message": "Error de validación",
  "errors": {
    "email": ["El email ya está registrado"]
  }
}
```

### Error: Contraseña no confirmada
```json
{
  "message": "Error de validación",
  "errors": {
    "password": ["La confirmación de contraseña no coincide"]
  }
}
```

### Error: Transacción fallida
```json
{
  "message": "Error al registrar el paciente",
  "error": "Detalle del error SQL o de aplicación"
}
```

---

## Verificación del Frontend

El servicio de autenticación en el frontend ya incluye una verificación:

```typescript
// 4. Verificar que se creó el registro de paciente
if (!user.paciente) {
  console.warn('ADVERTENCIA: El usuario se creó pero no tiene registro de paciente asociado');
}
```

Esto alertará si el backend no creó correctamente el registro en la tabla `pacientes`.

---

## Testing

### Prueba Manual con Postman/Insomnia

**Request:**
```
POST http://tu-backend.com/api/auth/register
Content-Type: application/json

{
  "nombre": "María",
  "apellidos": "López Fernández",
  "email": "maria@test.com",
  "password": "password123",
  "password_confirmation": "password123",
  "telefono": "555-1234",
  "device_name": "postman"
}
```

**Verificación en BD:**
```sql
-- Verificar usuario
SELECT * FROM users WHERE email = 'maria@test.com';

-- Verificar paciente (debe tener el mismo ID)
SELECT * FROM pacientes WHERE usuario_id = [ID_DEL_USUARIO];
```

---

## Conclusión

Con esta implementación:
- ✅ Se crea el usuario en la tabla `users`
- ✅ Se crea el paciente en la tabla `pacientes` con el mismo ID
- ✅ Se mantiene integridad referencial
- ✅ Se usa transacción para garantizar consistencia
- ✅ Se devuelve el token de autenticación
- ✅ El frontend guarda y utiliza los datos correctamente
