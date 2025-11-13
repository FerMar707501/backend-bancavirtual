# 🏦 Sistema Bancario Virtual - Backend

Sistema bancario completo desarrollado con Node.js, Express y MySQL con Sequelize ORM.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)
- [Seguridad](#seguridad)
- [Pruebas](#pruebas)

## ✨ Características

### Funcionalidades Principales

- ✅ **Autenticación y Autorización**
  - Login/Logout con JWT
  - Refresh tokens
  - Sistema de permisos granular por rol
  - Hash de contraseñas con bcrypt

- ✅ **Gestión de Usuarios**
  - CRUD completo de usuarios
  - Asignación de roles y permisos
  - Control de estados (activo/inactivo)
  - Bitácora de acciones

- ✅ **Gestión de Clientes**
  - Registro completo de clientes
  - Proceso KYC (Know Your Customer)
  - Gestión de teléfonos
  - Historial de cuentas y préstamos

- ✅ **Cuentas Bancarias**
  - Creación de cuentas (ahorro, corriente, nómina)
  - Generación automática de números de cuenta
  - Control de estados
  - Consulta de saldos

- ✅ **Transacciones**
  - Depósitos
  - Retiros
  - Transferencias entre cuentas
  - Validación de saldos
  - Transacciones ACID
  - Historial completo

- ✅ **Préstamos**
  - Solicitud de préstamos
  - Proceso de aprobación
  - Desembolso automático
  - Cálculo de cuotas e intereses
  - Pagos de préstamos
  - Estados del préstamo

## 🛠 Tecnologías

- **Node.js** v20+
- **Express.js** 4.18+
- **MySQL** 8+
- **Sequelize ORM** 6.35+
- **JWT** (jsonwebtoken)
- **Bcrypt** para hash de contraseñas
- **Dotenv** para variables de entorno
- **CORS** para seguridad
- **Helmet** para headers HTTP seguros

## 📦 Instalación

### Prerrequisitos

- Node.js v20 o superior
- MySQL 8 o superior
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
cd Backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

4. **Crear base de datos**
```sql
CREATE DATABASE banco_virtual;
```

5. **Ejecutar el script SQL**
```bash
# Importar el archivo SQL proporcionado
mysql -u root -p banco_virtual < banco_virtual.sql
```

6. **Iniciar el servidor**
```bash
npm start
# o en modo desarrollo
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## ⚙️ Configuración

### Variables de Entorno (.env)

```env
# Servidor
PORT=3000
NODE_ENV=production

# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=banco_virtual
DB_USER=root
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_secreto_super_seguro
JWT_REFRESH_SECRET=otro_secreto_diferente
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# CORS
CORS_ORIGIN=*
```

## 📁 Estructura del Proyecto

```
Backend/
├── src/
│   ├── config/
│   │   └── database.js           # Configuración de Sequelize
│   ├── controllers/               # Controladores de lógica de negocio
│   │   ├── auth/
│   │   │   ├── authController.js
│   │   │   └── usuarioController.js
│   │   ├── clientes/
│   │   │   └── clienteController.js
│   │   ├── cuentas/
│   │   │   ├── cuentaController.js
│   │   │   └── tipoCuentaController.js
│   │   ├── transacciones/
│   │   │   └── transaccionController.js
│   │   └── prestamos/
│   │       ├── prestamoController.js
│   │       ├── pagoPrestamoController.js
│   │       └── tipoPrestamoController.js
│   ├── middlewares/
│   │   ├── auth.js                # Autenticación JWT
│   │   ├── permissions.js         # Control de permisos
│   │   └── errorHandler.js        # Manejo de errores
│   ├── models/                    # Modelos Sequelize (19 modelos)
│   │   ├── auth/
│   │   ├── clientes/
│   │   ├── cuentas/
│   │   ├── transacciones/
│   │   ├── prestamos/
│   │   ├── agencias/
│   │   ├── bitacora/
│   │   └── index.js               # Asociaciones
│   ├── routes/                    # Definición de rutas
│   │   ├── auth/
│   │   ├── clientes/
│   │   ├── cuentas/
│   │   ├── transacciones/
│   │   ├── prestamos/
│   │   └── index.js
│   ├── services/                  # Lógica de negocio
│   │   ├── tokenService.js
│   │   └── transaccionService.js
│   └── utils/                     # Utilidades
│       ├── generators.js          # Generadores de números únicos
│       └── responseHelper.js      # Helper de respuestas
├── .env                           # Variables de entorno
├── .env.example                   # Ejemplo de .env
├── server.js                      # Punto de entrada
├── package.json
└── README.md
```

## 📡 API Endpoints

### Autenticación (11 endpoints)

```
POST   /api/auth/login              # Iniciar sesión
POST   /api/auth/logout             # Cerrar sesión
POST   /api/auth/refresh            # Renovar token
POST   /api/auth/change-password    # Cambiar contraseña
GET    /api/usuarios                # Listar usuarios
GET    /api/usuarios/:id            # Obtener usuario
POST   /api/usuarios                # Crear usuario
PUT    /api/usuarios/:id            # Actualizar usuario
DELETE /api/usuarios/:id            # Eliminar usuario
GET    /api/usuarios/:id/permisos   # Obtener permisos
PATCH  /api/usuarios/:id/estado     # Cambiar estado
```

### Clientes (8 endpoints)

```
GET    /api/clientes                # Listar clientes
GET    /api/clientes/:id            # Obtener cliente
POST   /api/clientes                # Crear cliente
PUT    /api/clientes/:id            # Actualizar cliente
DELETE /api/clientes/:id            # Eliminar cliente
PATCH  /api/clientes/:id/kyc        # Actualizar KYC
GET    /api/clientes/:id/cuentas    # Cuentas del cliente
GET    /api/clientes/:id/prestamos  # Préstamos del cliente
```

### Cuentas (9 endpoints)

```
GET    /api/cuentas                 # Listar cuentas
GET    /api/cuentas/:id             # Obtener cuenta
POST   /api/cuentas                 # Crear cuenta
PATCH  /api/cuentas/:id/estado      # Cambiar estado
GET    /api/cuentas/:id/saldo       # Consultar saldo
GET    /api/cuentas/:id/transacciones  # Transacciones
GET    /api/tipos-cuenta            # Listar tipos
GET    /api/tipos-cuenta/:id        # Obtener tipo
POST   /api/tipos-cuenta            # Crear tipo
```

### Transacciones (6 endpoints)

```
GET    /api/transacciones           # Listar transacciones
GET    /api/transacciones/:id       # Obtener transacción
GET    /api/transacciones/cuenta/:id/historial  # Historial
POST   /api/transacciones/deposito  # Realizar depósito
POST   /api/transacciones/retiro    # Realizar retiro
POST   /api/transacciones/transferencia  # Transferir
```

### Préstamos (8 endpoints)

```
GET    /api/prestamos               # Listar préstamos
GET    /api/prestamos/:id           # Obtener préstamo
POST   /api/prestamos/solicitar     # Solicitar préstamo
POST   /api/prestamos/:id/aprobar   # Aprobar préstamo
POST   /api/prestamos/:id/desembolsar  # Desembolsar
POST   /api/prestamos/:id/rechazar  # Rechazar préstamo
POST   /api/pagos-prestamo          # Realizar pago
GET    /api/pagos-prestamo/prestamo/:id  # Listar pagos
GET    /api/tipos-prestamo          # Listar tipos
GET    /api/tipos-prestamo/:id      # Obtener tipo
```

## 🔒 Seguridad

### Medidas Implementadas

1. **Autenticación JWT**
   - Access tokens de corta duración (15 min)
   - Refresh tokens de larga duración (7 días)
   - Tokens almacenados en base de datos

2. **Hash de Contraseñas**
   - Bcrypt con 10 rounds
   - Nunca se almacenan en texto plano

3. **Sistema de Permisos**
   - Control granular por endpoint
   - Roles con permisos específicos
   - Validación en cada request

4. **Validaciones**
   - Validación de datos de entrada
   - Sanitización de inputs
   - Prevención de SQL Injection (Sequelize)

5. **Headers de Seguridad**
   - CORS configurado
   - Helmet para headers HTTP
   - Rate limiting (opcional)

6. **Auditoría**
   - Bitácora completa de operaciones
   - Registro de IP y usuario
   - Timestamps en todas las tablas

## 🧪 Pruebas

### Ejecutar Pruebas Completas

```bash
# Asegúrate de que el servidor esté corriendo
npm start

# En otra terminal, ejecuta:
./test-completo.sh
```

### Pruebas Individuales

```bash
# Módulo de autenticación
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Listar clientes (requiere token)
curl -X GET http://localhost:3000/api/clientes \
  -H "Authorization: Bearer TU_TOKEN"

# Crear cuenta
curl -X POST http://localhost:3000/api/cuentas \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id_cliente":1,"id_tipo_cuenta":1,"saldo_inicial":1000}'
```

### Scripts de Prueba

- `test-completo.sh` - Prueba todos los módulos
- `test-transacciones.sh` - Prueba transacciones
- `test-prestamos.sh` - Prueba préstamos

## 📊 Estadísticas

- **Endpoints totales:** 42
- **Modelos de base de datos:** 19
- **Controllers:** 9
- **Middlewares:** 3
- **Services:** 2
- **Líneas de código:** ~4,500
- **Archivos JavaScript:** 45+

## 🎯 Estado del Proyecto

✅ **COMPLETADO AL 100%**

Todas las funcionalidades principales están implementadas y probadas:

- ✅ Autenticación y autorización
- ✅ Gestión de usuarios y permisos
- ✅ CRUD de clientes
- ✅ Gestión de cuentas
- ✅ Transacciones bancarias
- ✅ Sistema de préstamos completo
- ✅ Bitácora de auditoría
- ✅ Validaciones de negocio

## 🚀 Despliegue

### Producción

Para desplegar en producción:

1. Configurar variables de entorno de producción
2. Configurar base de datos MySQL
3. Configurar servidor web (nginx/apache)
4. Configurar PM2 para gestión de procesos
5. Configurar SSL/TLS (HTTPS)
6. Configurar backups automáticos

### PM2 (Recomendado)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicación
pm2 start server.js --name banco-virtual

# Ver logs
pm2 logs banco-virtual

# Reiniciar
pm2 restart banco-virtual

# Detener
pm2 stop banco-virtual
```

## 👥 Credenciales por Defecto

**Usuario Administrador:**
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANTE:** Cambiar estas credenciales en producción.

## 📝 Licencia

Este proyecto es privado y no tiene licencia pública.

## 🤝 Contacto

Para soporte o consultas, contactar al equipo de desarrollo.

---

**Desarrollado con ❤️ por el equipo de Banco Virtual**
