# PLANIFICACIÓN - SISTEMA BANCARIO VIRTUAL
## Banco Virtual con Node.js, Sequelize ORM, MySQL y MCP

---

## 📋 INFORMACIÓN GENERAL

**Tecnologías:**
- **Backend:** Node.js + Express.js
- **ORM:** Sequelize
- **Base de Datos:** MySQL 8.0+
- **Frontend:** HTML5 + Bootstrap 5 + JavaScript Vanilla
- **Arquitectura:** MCP (Model-Controller-Provider/Pattern)
- **Autenticación:** JWT (JSON Web Tokens)

---

## 🏗️ ESTRUCTURA DEL PROYECTO

### **Arquitectura de Carpetas - Backend (API REST)**

```
Backend/
├── src/
│   ├── config/
│   │   ├── database.js         # Configuración de Sequelize
│   │   ├── jwt.js              # Configuración de JWT
│   │   └── app.js              # Configuración de Express
│   │
│   ├── models/                 # MODELS - Modelos Sequelize (ORM) - Capa de Datos
│   │   ├── index.js            # Inicialización de Sequelize y asociaciones
│   │   ├── auth/
│   │   │   ├── Usuario.js
│   │   │   ├── Rol.js
│   │   │   └── Permiso.js
│   │   ├── clientes/
│   │   │   ├── Cliente.js
│   │   │   └── TelefonoCliente.js
│   │   ├── cuentas/
│   │   │   ├── Cuenta.js
│   │   │   └── TipoCuenta.js
│   │   ├── transacciones/
│   │   │   ├── Transaccion.js
│   │   │   ├── TipoTransaccion.js
│   │   │   ├── Reverso.js
│   │   │   └── PagoRecurrente.js
│   │   ├── prestamos/
│   │   │   ├── Prestamo.js
│   │   │   ├── TipoPrestamo.js
│   │   │   ├── PlanPago.js
│   │   │   └── PagoPrestamo.js
│   │   ├── catalogos/
│   │   │   ├── Agencia.js
│   │   │   ├── RolPermiso.js
│   │   │   └── ParametroSistema.js
│   │   └── auditoria/
│   │       └── Bitacora.js
│   │
│   ├── controllers/            # CONTROLLERS - Lógica de negocio y coordinación
│   │   ├── auth/
│   │   │   ├── authController.js       # Login, logout, refresh token
│   │   │   ├── usuarioController.js    # CRUD usuarios
│   │   │   └── rolController.js        # Gestión de roles y permisos
│   │   ├── clientes/
│   │   │   └── clienteController.js    # CRUD clientes y teléfonos
│   │   ├── cuentas/
│   │   │   ├── cuentaController.js     # CRUD cuentas bancarias
│   │   │   └── tipoCuentaController.js # Gestión tipos de cuenta
│   │   ├── transacciones/
│   │   │   ├── transaccionController.js  # Depósitos, retiros, transferencias
│   │   │   ├── reversoController.js      # Reversos de transacciones
│   │   │   └── pagoRecurrenteController.js # Pagos automáticos
│   │   ├── prestamos/
│   │   │   ├── prestamoController.js     # Solicitud, aprobación, desembolso
│   │   │   ├── planPagoController.js     # Generación de plan de pagos
│   │   │   └── pagoPrestamoController.js # Registro de pagos
│   │   ├── reportes/
│   │   │   ├── reporteTransaccionController.js
│   │   │   ├── reporteClienteController.js
│   │   │   ├── reportePrestamoController.js
│   │   │   └── reporteMorosidadController.js
│   │   └── administracion/
│   │       ├── agenciaController.js
│   │       ├── parametroController.js
│   │       └── bitacoraController.js
│   │
│   ├── routes/                 # ROUTES (Provider) - Definición de endpoints de la API
│   │   ├── index.js            # Enrutador principal que agrupa todas las rutas
│   │   ├── auth/
│   │   │   ├── authRoutes.js
│   │   │   ├── usuarioRoutes.js
│   │   │   └── rolRoutes.js
│   │   ├── clientes/
│   │   │   └── clienteRoutes.js
│   │   ├── cuentas/
│   │   │   ├── cuentaRoutes.js
│   │   │   └── tipoCuentaRoutes.js
│   │   ├── transacciones/
│   │   │   ├── transaccionRoutes.js
│   │   │   ├── reversoRoutes.js
│   │   │   └── pagoRecurrenteRoutes.js
│   │   ├── prestamos/
│   │   │   ├── prestamoRoutes.js
│   │   │   └── pagoPrestamoRoutes.js
│   │   ├── reportes/
│   │   │   └── reporteRoutes.js
│   │   └── administracion/
│   │       ├── agenciaRoutes.js
│   │       ├── parametroRoutes.js
│   │       └── bitacoraRoutes.js
│   │
│   ├── middlewares/            # Middlewares - Interceptores de peticiones
│   │   ├── auth.js             # Verificación de JWT
│   │   ├── permissions.js      # Verificación de permisos por rol
│   │   ├── validation.js       # Validación de datos de entrada
│   │   ├── errorHandler.js     # Manejo centralizado de errores
│   │   └── logger.js           # Logging de peticiones
│   │
│   ├── services/               # Services - Lógica de negocio compleja reutilizable
│   │   ├── auth/
│   │   │   └── tokenService.js
│   │   ├── transacciones/
│   │   │   └── transaccionService.js  # Lógica de saldos y movimientos
│   │   ├── prestamos/
│   │   │   ├── calculadoraService.js  # Cálculo de cuotas e intereses
│   │   │   └── planPagoService.js     # Generación de planes de pago
│   │   └── reportes/
│   │       └── generadorService.js
│   │
│   └── utils/                  # Utilidades y helpers
│       ├── validators.js       # Validaciones personalizadas
│       ├── generators.js       # Generadores de números de cuenta, préstamo, etc.
│       ├── dateHelpers.js      # Funciones para manejo de fechas
│       └── responseHelper.js   # Formato estándar de respuestas
│
├── database.sql            # Script SQL de la base de datos
├── .env                    # Variables de entorno (NO SUBIR A GIT)
├── .env.example            # Ejemplo de variables de entorno
├── .gitignore
├── package.json
├── package-lock.json
└── server.js               # Punto de entrada principal de la API
```

**🎯 Explicación de Arquitectura MCP para API REST:**

- **Models (M):** Representan la estructura de datos y la conexión con MySQL a través de Sequelize
- **Controllers (C):** Manejan la lógica de negocio, reciben requests, validan y envían responses
- **Routes/Providers (P):** Definen los endpoints HTTP (GET, POST, PUT, DELETE) de la API
- **Services:** Lógica compleja reutilizable (cálculos, generación de reportes)
- **Middlewares:** Interceptan requests (autenticación, validación, logging)
- **Utils:** Funciones auxiliares genéricas

---

## 📦 ESTRUCTURA DEL FRONTEND

```
Frontend/
├── assets/
│   ├── css/
│   │   ├── bootstrap.min.css
│   │   ├── styles.css
│   │   └── theme.css
│   ├── js/
│   │   ├── bootstrap.bundle.min.js
│   │   ├── jquery-3.6.0.min.js
│   │   └── app.js
│   └── img/
│       ├── logo.png
│       └── favicon.ico
│
├── pages/
│   ├── auth/
│   │   ├── login.html
│   │   └── cambiar-password.html
│   ├── dashboard/
│   │   └── index.html
│   ├── clientes/
│   │   ├── listar.html
│   │   ├── crear.html
│   │   └── editar.html
│   ├── cuentas/
│   │   ├── listar.html
│   │   ├── crear.html
│   │   └── detalle.html
│   ├── transacciones/
│   │   ├── deposito.html
│   │   ├── retiro.html
│   │   ├── transferencia.html
│   │   └── historial.html
│   ├── prestamos/
│   │   ├── solicitar.html
│   │   ├── listar.html
│   │   ├── evaluar.html
│   │   └── pagos.html
│   ├── reportes/
│   │   ├── transacciones.html
│   │   ├── clientes.html
│   │   ├── prestamos.html
│   │   └── morosidad.html
│   └── administracion/
│       ├── usuarios.html
│       ├── roles.html
│       ├── agencias.html
│       └── parametros.html
│
├── components/             # Componentes HTML reutilizables
│   ├── navbar.html
│   ├── sidebar.html
│   └── footer.html
│
├── js/                     # JavaScript modular
│   ├── config/
│   │   └── api.js          # Configuración de API endpoints
│   ├── services/
│   │   ├── authService.js
│   │   ├── clienteService.js
│   │   ├── cuentaService.js
│   │   ├── transaccionService.js
│   │   └── prestamoService.js
│   ├── utils/
│   │   ├── validation.js
│   │   ├── formatter.js
│   │   └── storage.js
│   └── main.js
│
└── index.html              # Página de inicio
```

---

## 🗄️ MODELOS DE BASE DE DATOS (Sequelize)

### **Principales Relaciones:**

1. **Cliente** ← (1:N) → **TelefonoCliente**
2. **Cliente** ← (1:N) → **Cuenta**
3. **Cuenta** ← (N:1) → **TipoCuenta**
4. **Cuenta** ← (N:1) → **Agencia**
5. **Cuenta** ← (1:N) → **Transaccion** (origen/destino)
6. **Usuario** ← (N:1) → **Rol**
7. **Rol** ← (N:M) → **Permiso** (a través de RolPermiso)
8. **Cliente** ← (1:N) → **Prestamo**
9. **Prestamo** ← (N:1) → **TipoPrestamo**
10. **Prestamo** ← (1:N) → **PlanPago**
11. **Prestamo** ← (1:N) → **PagoPrestamo**
12. **Transaccion** ← (1:1) → **Reverso**

---

## 🔐 MÓDULOS Y FUNCIONALIDADES

### **1. MÓDULO DE AUTENTICACIÓN Y AUTORIZACIÓN**

#### Componentes:
- **Login/Logout**
- **Gestión de Sesiones (JWT)**
- **Cambio de contraseña**
- **Recuperación de contraseña**

#### Endpoints:
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/change-password
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/profile
```

#### Archivos:
- `models/auth/Usuario.js`, `Rol.js`, `Permiso.js`
- `controllers/auth/authController.js`
- `routes/auth/authRoutes.js`
- `middlewares/auth.js`, `permissions.js`
- `services/auth/tokenService.js`

---

### **2. MÓDULO DE GESTIÓN DE USUARIOS**

#### Componentes:
- **CRUD de usuarios**
- **Asignación de roles**
- **Cambio de estado (activo/inactivo)**
- **Registro de último acceso**

#### Endpoints:
```
GET    /api/usuarios
GET    /api/usuarios/:id
POST   /api/usuarios
PUT    /api/usuarios/:id
DELETE /api/usuarios/:id
PUT    /api/usuarios/:id/estado
```

#### Archivos:
- `controllers/auth/usuarioController.js`
- `routes/auth/usuarioRoutes.js`

---

### **3. MÓDULO DE GESTIÓN DE CLIENTES**

#### Componentes:
- **CRUD de clientes**
- **Gestión de teléfonos**
- **Verificación KYC**
- **Búsqueda por DPI, NIT, nombre**

#### Endpoints:
```
GET    /api/clientes
GET    /api/clientes/:id
POST   /api/clientes
PUT    /api/clientes/:id
DELETE /api/clientes/:id
POST   /api/clientes/:id/telefonos
DELETE /api/clientes/:id/telefonos/:idTelefono
PUT    /api/clientes/:id/kyc
```

#### Archivos:
- `models/clientes/Cliente.js`, `TelefonoCliente.js`
- `controllers/clientes/clienteController.js`
- `routes/clientes/clienteRoutes.js`

---

### **4. MÓDULO DE GESTIÓN DE CUENTAS**

#### Componentes:
- **Crear cuenta bancaria**
- **Listar cuentas por cliente**
- **Bloquear/Desbloquear cuenta**
- **Consultar saldo**
- **Cerrar cuenta**

#### Endpoints:
```
GET    /api/cuentas
GET    /api/cuentas/:id
POST   /api/cuentas
PUT    /api/cuentas/:id
PUT    /api/cuentas/:id/bloquear
PUT    /api/cuentas/:id/cerrar
GET    /api/cuentas/:id/saldo
GET    /api/cuentas/:id/movimientos
GET    /api/tipos-cuenta
```

#### Archivos:
- `models/cuentas/Cuenta.js`, `TipoCuenta.js`
- `controllers/cuentas/cuentaController.js`
- `routes/cuentas/cuentaRoutes.js`

---

### **5. MÓDULO DE TRANSACCIONES**

#### Componentes:
- **Depósitos**
- **Retiros**
- **Transferencias entre cuentas**
- **Reversos de transacciones**
- **Historial de transacciones**
- **Pagos recurrentes**

#### Endpoints:
```
POST   /api/transacciones/deposito
POST   /api/transacciones/retiro
POST   /api/transacciones/transferencia
GET    /api/transacciones
GET    /api/transacciones/:id
POST   /api/transacciones/:id/reverso
GET    /api/transacciones/cuenta/:idCuenta
POST   /api/pagos-recurrentes
GET    /api/pagos-recurrentes
PUT    /api/pagos-recurrentes/:id
DELETE /api/pagos-recurrentes/:id
```

#### Archivos:
- `models/transacciones/Transaccion.js`, `TipoTransaccion.js`, `Reverso.js`
- `controllers/transacciones/transaccionController.js`, `reversoController.js`
- `routes/transacciones/transaccionRoutes.js`
- `services/transacciones/transaccionService.js`

---

### **6. MÓDULO DE PRÉSTAMOS**

#### Componentes:
- **Solicitud de préstamo**
- **Evaluación y análisis**
- **Aprobación/Rechazo**
- **Desembolso**
- **Generación de plan de pagos**
- **Registro de pagos**
- **Control de morosidad**

#### Endpoints:
```
POST   /api/prestamos
GET    /api/prestamos
GET    /api/prestamos/:id
PUT    /api/prestamos/:id/evaluar
PUT    /api/prestamos/:id/aprobar
PUT    /api/prestamos/:id/rechazar
POST   /api/prestamos/:id/desembolsar
GET    /api/prestamos/:id/plan-pagos
POST   /api/prestamos/:id/pagos
GET    /api/prestamos/:id/pagos
GET    /api/tipos-prestamo
```

#### Archivos:
- `models/prestamos/Prestamo.js`, `TipoPrestamo.js`, `PlanPago.js`, `PagoPrestamo.js`
- `controllers/prestamos/prestamoController.js`, `pagoPrestamoController.js`
- `routes/prestamos/prestamoRoutes.js`
- `services/prestamos/calculadoraService.js`, `planPagoService.js`

---

### **7. MÓDULO DE REPORTES**

#### Componentes:
- **Reporte de transacciones por período**
- **Reporte de clientes**
- **Reporte de préstamos**
- **Análisis de morosidad**
- **Estados de cuenta**

#### Endpoints:
```
GET    /api/reportes/transacciones
GET    /api/reportes/clientes
GET    /api/reportes/prestamos
GET    /api/reportes/morosidad
GET    /api/reportes/estado-cuenta/:idCuenta
```

#### Archivos:
- `controllers/reportes/reporteTransaccionController.js`, etc.
- `routes/reportes/reporteRoutes.js`
- `services/reportes/generadorService.js`

---

### **8. MÓDULO DE ADMINISTRACIÓN**

#### Componentes:
- **Gestión de agencias**
- **Gestión de roles y permisos**
- **Parámetros del sistema**
- **Bitácora de auditoría**

#### Endpoints:
```
GET    /api/agencias
POST   /api/agencias
PUT    /api/agencias/:id
GET    /api/roles
POST   /api/roles
PUT    /api/roles/:id
GET    /api/permisos
POST   /api/roles/:id/permisos
GET    /api/parametros
PUT    /api/parametros/:clave
GET    /api/bitacora
```

#### Archivos:
- `models/catalogos/Agencia.js`, `ParametroSistema.js`, `auditoria/Bitacora.js`
- `controllers/administracion/agenciaController.js`, etc.
- `routes/administracion/`

---

## 📝 PLAN DE IMPLEMENTACIÓN (FASES)

### **FASE 1: CONFIGURACIÓN INICIAL (Días 1-2)**

1. ✅ Inicializar proyecto Node.js
2. ✅ Instalar dependencias
3. ✅ Configurar Sequelize
4. ✅ Crear estructura de carpetas
5. ✅ Configurar variables de entorno
6. ✅ Crear servidor Express básico
7. ✅ Probar conexión a MySQL

**Dependencias principales:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.35.0",
    "mysql2": "^3.6.5",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-validator": "^7.0.1",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

---

### **FASE 2: MODELOS Y ASOCIACIONES (Días 3-4)**

1. ✅ Crear todos los modelos Sequelize
2. ✅ Definir asociaciones entre modelos
3. ✅ Sincronizar modelos con la base de datos
4. ✅ Probar relaciones

**Orden de creación:**
1. Modelos base: `Rol`, `Permiso`, `Agencia`, `TipoCuenta`, `TipoTransaccion`, `TipoPrestamo`
2. Modelos principales: `Usuario`, `Cliente`, `Cuenta`, `Prestamo`
3. Modelos relacionales: `TelefonoCliente`, `RolPermiso`, `PlanPago`
4. Modelos de operaciones: `Transaccion`, `PagoPrestamo`, `Reverso`
5. Modelos de auditoría: `Bitacora`, `ParametroSistema`

---

### **FASE 3: AUTENTICACIÓN Y AUTORIZACIÓN (Días 5-6)**

1. ✅ Implementar login con JWT
2. ✅ Middleware de autenticación
3. ✅ Middleware de permisos
4. ✅ Sistema de refresh tokens
5. ✅ Gestión de usuarios
6. ✅ Gestión de roles

---

### **FASE 4: MÓDULO DE CLIENTES Y CUENTAS (Días 7-9)**

1. ✅ CRUD de clientes
2. ✅ Gestión de teléfonos
3. ✅ CRUD de cuentas
4. ✅ Validaciones de negocio
5. ✅ Generador de número de cuenta

---

### **FASE 5: MÓDULO DE TRANSACCIONES (Días 10-12)**

1. ✅ Implementar depósitos
2. ✅ Implementar retiros
3. ✅ Implementar transferencias
4. ✅ Sistema de reversos
5. ✅ Validaciones de saldo
6. ✅ Registro en bitácora

---

### **FASE 6: MÓDULO DE PRÉSTAMOS (Días 13-16)**

1. ✅ Solicitud de préstamos
2. ✅ Evaluación y aprobación
3. ✅ Generación de plan de pagos
4. ✅ Desembolso
5. ✅ Registro de pagos
6. ✅ Control de morosidad

---

### **FASE 7: MÓDULO DE REPORTES (Días 17-18)**

1. ✅ Reportes de transacciones
2. ✅ Reportes de clientes
3. ✅ Reportes de préstamos
4. ✅ Análisis de morosidad
5. ✅ Estados de cuenta

---

### **FASE 8: ADMINISTRACIÓN Y AUDITORÍA (Días 19-20)**

1. ✅ Gestión de agencias
2. ✅ Parámetros del sistema
3. ✅ Bitácora de auditoría
4. ✅ Dashboard de administración

---

### **FASE 9: FRONTEND (Días 21-28)**

1. ✅ Estructura HTML base
2. ✅ Integración de Bootstrap
3. ✅ Páginas de autenticación
4. ✅ Dashboard principal
5. ✅ Módulo de clientes (UI)
6. ✅ Módulo de cuentas (UI)
7. ✅ Módulo de transacciones (UI)
8. ✅ Módulo de préstamos (UI)
9. ✅ Módulo de reportes (UI)
10. ✅ JavaScript para consumo de API
11. ✅ Validaciones frontend

---

### **FASE 10: PRUEBAS Y AJUSTES (Días 29-30)**

1. ✅ Pruebas de integración
2. ✅ Corrección de bugs
3. ✅ Optimización de consultas
4. ✅ Documentación de API
5. ✅ Manual de usuario

---

## 🔧 CONFIGURACIÓN DE VARIABLES DE ENTORNO

```env
# .env
NODE_ENV=development
PORT=3000

# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=banco_virtual
DB_USER=root
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=tu_clave_refresh_super_segura
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5500

# Otros
LOG_LEVEL=debug
```

---

## 🛡️ SEGURIDAD Y MEJORES PRÁCTICAS

1. **Validación de entrada:** Usar `express-validator`
2. **Sanitización de datos:** Prevenir SQL Injection (Sequelize lo maneja)
3. **Autenticación:** JWT con expiración
4. **Autorización:** Middleware de permisos por rol
5. **Hashing de passwords:** bcrypt con salt rounds = 10
6. **CORS:** Configurado para origen específico
7. **Helmet:** Headers de seguridad HTTP
8. **Rate limiting:** Limitar peticiones por IP
9. **Logging:** Morgan para logs de peticiones
10. **Auditoría:** Bitácora de todas las operaciones críticas

---

## 📊 FORMATO ESTÁNDAR DE RESPUESTAS API

```javascript
// Éxito
{
  "success": true,
  "data": {...},
  "message": "Operación exitosa"
}

// Error
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción del error",
    "details": [...]
  }
}
```

---

## 🚀 COMANDOS ÚTILES

```bash
# Instalar dependencias
npm install

# Desarrollo con recarga automática
npm run dev

# Producción
npm start

# Crear base de datos
mysql -u root -p < Backend/database.sql

# Sincronizar modelos (solo desarrollo)
# Se configura en models/index.js con sequelize.sync()
```

---

## 📚 DOCUMENTACIÓN ADICIONAL

1. **API Documentation:** Se generará con Postman/Swagger
2. **Modelo Entidad-Relación:** Basado en database.sql
3. **Manual de Usuario:** Se creará en fase final
4. **Guía de Despliegue:** Para producción

---

## ✅ CRITERIOS DE ACEPTACIÓN

- ✅ Todos los módulos funcionales
- ✅ API RESTful completa
- ✅ Autenticación y autorización funcionando
- ✅ Validaciones de negocio implementadas
- ✅ Frontend consumiendo API correctamente
- ✅ Base de datos normalizada
- ✅ Código documentado
- ✅ Pruebas básicas realizadas

---

## 🎯 PRÓXIMOS PASOS

1. **Inicializar proyecto Node.js** y estructura de carpetas
2. **Configurar Sequelize** y conexión a MySQL
3. **Crear modelos** siguiendo el orden establecido
4. **Implementar autenticación** como base del sistema
5. **Desarrollar módulos** de forma incremental
6. **Integrar frontend** consumiendo la API

---

**Fecha de inicio:** 2025-11-12  
**Fecha estimada de finalización:** 2025-12-12 (30 días)  
**Estado:** ✅ PLANIFICACIÓN COMPLETADA - LISTO PARA INICIAR DESARROLLO

---

## 📞 CONTACTO Y SOPORTE

Para dudas o consultas durante el desarrollo, mantener comunicación constante y documentar cambios en el proyecto.

---

*Documento generado automáticamente - Sistema Bancario Virtual*
