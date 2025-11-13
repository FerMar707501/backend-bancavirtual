-- ============================================================================
-- Script de Creación de Base de Datos - Sistema Bancario Virtual
-- Base de Datos: banco_virtual
-- SGBD: MySQL 8.0+
-- Fecha: 2025-11-12
-- ============================================================================

DROP DATABASE IF EXISTS banco_virtual;
CREATE DATABASE banco_virtual CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE banco_virtual;

-- ============================================================================
-- TABLA: AGENCIAS
-- Descripción: Sucursales del banco a nivel nacional
-- ============================================================================
CREATE TABLE agencias (
    id_agencia INT AUTO_INCREMENT PRIMARY KEY,
    codigo_agencia VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_codigo_agencia (codigo_agencia),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- ============================================================================
-- TABLA: CLIENTES
-- Descripción: Información de los clientes del banco
-- ============================================================================
CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    dpi VARCHAR(20) UNIQUE NOT NULL,
    nit VARCHAR(20) UNIQUE NOT NULL,
    primer_nombre VARCHAR(50) NOT NULL,
    segundo_nombre VARCHAR(50),
    primer_apellido VARCHAR(50) NOT NULL,
    segundo_apellido VARCHAR(50),
    direccion VARCHAR(255) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    estado_kyc ENUM('pendiente', 'verificado', 'rechazado') DEFAULT 'pendiente',
    estado_cliente ENUM('activo', 'inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dpi (dpi),
    INDEX idx_nit (nit),
    INDEX idx_estado_cliente (estado_cliente),
    INDEX idx_correo (correo)
) ENGINE=InnoDB;

-- ============================================================================
-- TABLA: TELEFONOS_CLIENTE
-- Descripción: Múltiples teléfonos asociados a un cliente
-- ============================================================================
CREATE TABLE telefonos_cliente (
    id_telefono INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    numero_telefono VARCHAR(20) NOT NULL,
    tipo ENUM('movil', 'fijo', 'trabajo') DEFAULT 'movil',
    principal BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    INDEX idx_cliente (id_cliente)
) ENGINE=InnoDB;

-- ============================================================================
-- TABLA: TIPOS_CUENTA
-- Descripción: Catálogo de tipos de cuentas bancarias
-- ============================================================================
CREATE TABLE tipos_cuenta (
    id_tipo_cuenta INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    tasa_interes DECIMAL(5,2) DEFAULT 0.00,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    INDEX idx_codigo (codigo)
) ENGINE=InnoDB;

-- ============================================================================
-- TABLA: CUENTAS
-- Descripción: Cuentas bancarias de los clientes
-- ============================================================================
CREATE TABLE cuentas (
    id_cuenta INT AUTO_INCREMENT PRIMARY KEY,
    numero_cuenta VARCHAR(30) UNIQUE NOT NULL,
    id_cliente INT NOT NULL,
    id_tipo_cuenta INT NOT NULL,
    id_agencia INT NOT NULL,
    saldo DECIMAL(15,2) DEFAULT 0.00,
    fecha_apertura DATE NOT NULL,
    estado ENUM('activa', 'bloqueada', 'cerrada') DEFAULT 'activa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_tipo_cuenta) REFERENCES tipos_cuenta(id_tipo_cuenta),
    FOREIGN KEY (id_agencia) REFERENCES agencias(id_agencia),
    INDEX idx_numero_cuenta (numero_cuenta),
    INDEX idx_cliente (id_cliente),
    INDEX idx_agencia (id_agencia),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- ============================================================================
-- TABLA: TIPOS_TRANSACCION
-- Descripción: Catálogo de tipos de transacciones
-- ============================================================================
CREATE TABLE tipos_transaccion (
    id_tipo_transaccion INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    afecta_saldo ENUM('suma', 'resta', 'neutro') NOT NULL,
    INDEX idx_codigo (codigo)
) ENGINE=InnoDB;

-- ============================================================================
-- TABLA: ROLES
-- Descripción: Roles de usuarios del sistema
-- ============================================================================
CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    INDEX idx_codigo (codigo)
) ENGINE=InnoDB;

-- ============================================================================
-- TABLA: USUARIOS
-- Descripción: Usuarios del sistema bancario
-- ============================================================================
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    id_rol INT NOT NULL,
    id_agencia INT,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    ultimo_acceso DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol),
    FOREIGN KEY (id_agencia) REFERENCES agencias(id_agencia),
    INDEX idx_username (username),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- ============================================================================
-- TABLA: TRANSACCIONES
-- Descripción: Registro de todas las transacciones bancarias
-- ============================================================================
CREATE TABLE transacciones (
    id_transaccion INT AUTO_INCREMENT PRIMARY KEY,
    numero_comprobante VARCHAR(50) UNIQUE NOT NULL,
    id_cuenta_origen INT,
    id_cuenta_destino INT,
    id_tipo_transaccion INT NOT NULL,
    monto DECIMAL(15,2) NOT NULL,
    descripcion VARCHAR(255),
    id_usuario INT NOT NULL,
    id_agencia INT NOT NULL,
    fecha_transaccion DATETIME NOT NULL,
    estado ENUM('completada', 'pendiente', 'reversada') DEFAULT 'completada',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cuenta_origen) REFERENCES cuentas(id_cuenta),
    FOREIGN KEY (id_cuenta_destino) REFERENCES cuentas(id_cuenta),
    FOREIGN KEY (id_tipo_transaccion) REFERENCES tipos_transaccion(id_tipo_transaccion),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_agencia) REFERENCES agencias(id_agencia),
    INDEX idx_comprobante (numero_comprobante),
    INDEX idx_cuenta_origen (id_cuenta_origen),
    INDEX idx_cuenta_destino (id_cuenta_destino),
    INDEX idx_fecha (fecha_transaccion),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- ============================================================================
-- TABLA: REVERSOS
-- Descripción: Control de reversos de transacciones
-- ============================================================================
CREATE TABLE reversos (
    id_reverso INT AUTO_INCREMENT PRIMARY KEY,
    id_transaccion_original INT NOT NULL,
    id_transaccion_reverso INT NOT NULL,
    motivo TEXT NOT NULL,
    id_usuario_autoriza INT NOT NULL,
    fecha_reverso DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_transaccion_original) REFERENCES transacciones(id_transaccion),
    FOREIGN KEY (id_transaccion_reverso) REFERENCES transacciones(id_transaccion),
    FOREIGN KEY (id_usuario_autoriza) REFERENCES usuarios(id_usuario),
    INDEX idx_transaccion_original (id_transaccion_original)
) ENGINE=InnoDB;

-- ============================================================================
-- TABLA: TIPOS_PRESTAMO
-- Descripción: Catálogo de tipos de préstamos
-- ============================================================================
CREATE TABLE tipos_prestamo (
    id_tipo_prestamo INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    tasa_interes_anual DECIMAL(5,2) NOT NULL,
    tasa_mora DECIMAL(5,2) NOT NULL,
    plazo_minimo_meses INT NOT NULL,
    plazo_maximo_meses INT NOT NULL,
    monto_minimo DECIMAL(15,2) NOT NULL,
    monto_maximo DECIMAL(15,2) NOT NULL,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    INDEX idx_codigo (codigo)
) ENGINE=InnoDB;

-- ============================================================================
-- TABLA: PRESTAMOS
-- Descripción: Préstamos otorgados a clientes
-- ============================================================================
CREATE TABLE prestamos (
    id_prestamo INT AUTO_INCREMENT PRIMARY KEY,
    numero_prestamo VARCHAR(30) UNIQUE NOT NULL,
    id_cliente INT NOT NULL,
    id_tipo_prestamo INT NOT NULL,
    id_agencia INT NOT NULL,
    monto_solicitado DECIMAL(15,2) NOT NULL,
    monto_aprobado DECIMAL(15,2),
    plazo_meses INT NOT NULL,
    tasa_interes DECIMAL(5,2) NOT NULL,
    destino VARCHAR(255) NOT NULL,
    fecha_solicitud DATE NOT NULL,
    fecha_aprobacion DATE,
    fecha_desembolso DATE,
    estado ENUM('solicitado', 'aprobado', 'rechazado', 'desembolsado', 'vigente', 'en_mora', 'castigado', 'cancelado') DEFAULT 'solicitado',
    id_analista INT,
    id_gerente_aprueba INT,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_tipo_prestamo) REFERENCES tipos_prestamo(id_tipo_prestamo),
    FOREIGN KEY (id_agencia) REFERENCES agencias(id_agencia),
    FOREIGN KEY (id_analista) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_gerente_aprueba) REFERENCES usuarios(id_usuario),
    INDEX idx_numero_prestamo (numero_prestamo),
    INDEX idx_cliente (id_cliente),
    INDEX idx_estado (estado),
    INDEX idx_agencia (id_agencia)
) ENGINE=InnoDB;

-- ============================================================================
-- TABLA: PLAN_PAGOS
-- Descripción: Plan de pagos de cada préstamo
-- ============================================================================
CREATE TABLE plan_pagos (
    id_plan_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_prestamo INT NOT NULL,
    numero_cuota INT NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    monto_capital DECIMAL(15,2) NOT NULL,
    monto_interes DECIMAL(15,2) NOT NULL,
    monto_cuota DECIMAL(15,2) NOT NULL,
    saldo_capital DECIMAL(15,2) NOT NULL,
    estado ENUM('pendiente', 'pagada', 'vencida', 'en_mora') DEFAULT 'pendiente',
    FOREIGN KEY (id_prestamo) REFERENCES prestamos(id_prestamo) ON DELETE CASCADE,
    INDEX idx_prestamo (id_prestamo),
    INDEX idx_fecha_vencimiento (fecha_vencimiento),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- ============================================================================
-- TABLA: PAGOS_PRESTAMO
-- Descripción: Registro de pagos realizados a préstamos
-- ============================================================================
CREATE TABLE pagos_prestamo (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_prestamo INT NOT NULL,
    id_plan_pago INT,
    id_transaccion INT NOT NULL,
    fecha_pago DATETIME NOT NULL,
    monto_total DECIMAL(15,2) NOT NULL,
    monto_capital DECIMAL(15,2) NOT NULL,
    monto_interes DECIMAL(15,2) NOT NULL,
    monto_mora DECIMAL(15,2) DEFAULT 0.00,
    id_usuario INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_prestamo) REFERENCES prestamos(id_prestamo),
    FOREIGN KEY (id_plan_pago) REFERENCES plan_pagos(id_plan_pago),
    FOREIGN KEY (id_transaccion) REFERENCES transacciones(id_transaccion),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    INDEX idx_prestamo (id_prestamo),
    INDEX idx_fecha_pago (fecha_pago)
) ENGINE=InnoDB;

-- ============================================================================
-- TABLA: PAGOS_RECURRENTES
-- Descripción: Pagos automáticos programados
-- ============================================================================
CREATE TABLE pagos_recurrentes (
    id_pago_recurrente INT AUTO_INCREMENT PRIMARY KEY,
    id_cuenta INT NOT NULL,
    concepto VARCHAR(100) NOT NULL,
    monto DECIMAL(15,2) NOT NULL,
    frecuencia ENUM('semanal', 'quincenal', 'mensual') NOT NULL,
    dia_ejecucion INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    estado ENUM('activo', 'pausado', 'cancelado') DEFAULT 'activo',
    cuenta_destino VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cuenta) REFERENCES cuentas(id_cuenta),
    INDEX idx_cuenta (id_cuenta),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- ============================================================================
-- TABLA: PERMISOS
-- Descripción: Catálogo de permisos del sistema
-- ============================================================================
CREATE TABLE permisos (
    id_permiso INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    modulo VARCHAR(50) NOT NULL,
    descripcion TEXT,
    INDEX idx_codigo (codigo),
    INDEX idx_modulo (modulo)
) ENGINE=InnoDB;

-- ============================================================================
-- TABLA: ROLES_PERMISOS
-- Descripción: Relación N:M entre roles y permisos
-- ============================================================================
CREATE TABLE roles_permisos (
    id_rol_permiso INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    id_permiso INT NOT NULL,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE CASCADE,
    FOREIGN KEY (id_permiso) REFERENCES permisos(id_permiso) ON DELETE CASCADE,
    UNIQUE KEY unique_rol_permiso (id_rol, id_permiso),
    INDEX idx_rol (id_rol),
    INDEX idx_permiso (id_permiso)
) ENGINE=InnoDB;

-- ============================================================================
-- TABLA: PARAMETROS_SISTEMA
-- Descripción: Parámetros configurables del sistema
-- ============================================================================
CREATE TABLE parametros_sistema (
    id_parametro INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(50) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descripcion VARCHAR(255),
    tipo_dato ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clave (clave)
) ENGINE=InnoDB;

-- ============================================================================
-- TABLA: BITACORA
-- Descripción: Registro de auditoría de acciones del sistema
-- ============================================================================
CREATE TABLE bitacora (
    id_bitacora INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    accion VARCHAR(100) NOT NULL,
    modulo VARCHAR(50) NOT NULL,
    descripcion TEXT,
    ip_address VARCHAR(45),
    datos_adicionales JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    INDEX idx_usuario (id_usuario),
    INDEX idx_fecha (created_at),
    INDEX idx_modulo (modulo)
) ENGINE=InnoDB;

-- ============================================================================
-- DATOS INICIALES - CATÁLOGOS
-- ============================================================================

-- Insertar Roles
INSERT INTO roles (codigo, nombre, descripcion) VALUES
('ADMIN', 'Administrador', 'Gestiona parámetros del sistema, usuarios, permisos y catálogos'),
('GERENTE', 'Gerente', 'Genera reportes, aprueba préstamos, administra usuarios'),
('CAJERO', 'Cajero/Operador', 'Registra depósitos, retiros y transferencias'),
('ANALISTA', 'Analista de Crédito', 'Evalúa solicitudes de préstamo y sube documentos');

-- Insertar Tipos de Cuenta
INSERT INTO tipos_cuenta (codigo, nombre, descripcion, tasa_interes, estado) VALUES
('AHO', 'Ahorro', 'Cuenta de ahorro personal', 2.50, 'activo'),
('MON', 'Monetaria', 'Cuenta corriente monetaria', 0.00, 'activo'),
('DPF', 'Depósito a Plazo', 'Depósito a plazo fijo', 5.00, 'activo');

-- Insertar Tipos de Transacción
INSERT INTO tipos_transaccion (codigo, nombre, afecta_saldo) VALUES
('DEP', 'Depósito', 'suma'),
('RET', 'Retiro', 'resta'),
('TRA', 'Transferencia', 'neutro'),
('PAG', 'Pago de Préstamo', 'resta'),
('INT', 'Interés Generado', 'suma'),
('COM', 'Comisión', 'resta');

-- Insertar Tipos de Préstamo
INSERT INTO tipos_prestamo (codigo, nombre, tasa_interes_anual, tasa_mora, plazo_minimo_meses, plazo_maximo_meses, monto_minimo, monto_maximo, estado) VALUES
('PER', 'Préstamo Personal', 12.50, 3.00, 6, 60, 1000.00, 150000.00, 'activo'),
('HIP', 'Préstamo Hipotecario', 8.75, 2.50, 60, 360, 50000.00, 2000000.00, 'activo'),
('VEH', 'Préstamo Vehicular', 10.00, 2.75, 12, 84, 25000.00, 500000.00, 'activo'),
('EMP', 'Préstamo Empresarial', 11.25, 3.50, 12, 120, 10000.00, 1000000.00, 'activo');

-- Insertar Agencias
INSERT INTO agencias (codigo_agencia, nombre, direccion, telefono, estado) VALUES
('AG001', 'Agencia Central', 'Zona 1, Ciudad de Guatemala', '2222-1111', 'activo'),
('AG002', 'Agencia Zona 10', 'Zona 10, Ciudad de Guatemala', '2222-2222', 'activo'),
('AG003', 'Agencia Antigua', 'Antigua Guatemala, Sacatepéquez', '7832-1111', 'activo'),
('AG004', 'Agencia Quetzaltenango', 'Quetzaltenango', '7765-1111', 'activo');

-- Insertar Permisos
INSERT INTO permisos (codigo, nombre, modulo, descripcion) VALUES
-- Módulo Cuentas
('CUENTA_CREAR', 'Crear Cuenta', 'cuentas', 'Permite crear nuevas cuentas bancarias'),
('CUENTA_LISTAR', 'Listar Cuentas', 'cuentas', 'Permite ver el listado de cuentas'),
('CUENTA_EDITAR', 'Editar Cuenta', 'cuentas', 'Permite modificar datos de cuentas'),
('CUENTA_BLOQUEAR', 'Bloquear Cuenta', 'cuentas', 'Permite bloquear/desbloquear cuentas'),
-- Módulo Transacciones
('TRANS_DEPOSITO', 'Realizar Depósito', 'transacciones', 'Permite realizar depósitos'),
('TRANS_RETIRO', 'Realizar Retiro', 'transacciones', 'Permite realizar retiros'),
('TRANS_TRANSFERENCIA', 'Realizar Transferencia', 'transacciones', 'Permite realizar transferencias'),
('TRANS_REVERSO', 'Autorizar Reverso', 'transacciones', 'Permite autorizar reversos de transacciones'),
('TRANS_LISTAR', 'Listar Transacciones', 'transacciones', 'Permite ver historial de transacciones'),
-- Módulo Préstamos
('PREST_SOLICITAR', 'Solicitar Préstamo', 'prestamos', 'Permite registrar solicitudes de préstamo'),
('PREST_EVALUAR', 'Evaluar Préstamo', 'prestamos', 'Permite evaluar solicitudes de préstamo'),
('PREST_APROBAR', 'Aprobar Préstamo', 'prestamos', 'Permite aprobar/rechazar préstamos'),
('PREST_DESEMBOLSAR', 'Desembolsar Préstamo', 'prestamos', 'Permite realizar desembolsos'),
('PREST_PAGAR', 'Registrar Pago', 'prestamos', 'Permite registrar pagos de préstamos'),
('PREST_LISTAR', 'Listar Préstamos', 'prestamos', 'Permite ver listado de préstamos'),
-- Módulo Reportes
('REP_TRANSACCIONES', 'Reporte Transacciones', 'reportes', 'Acceso a reportes de transacciones'),
('REP_CLIENTES', 'Reporte Clientes', 'reportes', 'Acceso a reportes de clientes'),
('REP_PRESTAMOS', 'Reporte Préstamos', 'reportes', 'Acceso a reportes de préstamos'),
('REP_MOROSIDAD', 'Reporte Morosidad', 'reportes', 'Acceso a análisis de morosidad'),
('REP_ESTADOS_CUENTA', 'Estados de Cuenta', 'reportes', 'Generar estados de cuenta'),
-- Módulo Administración
('ADMIN_USUARIOS', 'Gestionar Usuarios', 'administracion', 'Permite administrar usuarios'),
('ADMIN_ROLES', 'Gestionar Roles', 'administracion', 'Permite administrar roles y permisos'),
('ADMIN_PARAMETROS', 'Gestionar Parámetros', 'administracion', 'Permite configurar parámetros del sistema'),
('ADMIN_AGENCIAS', 'Gestionar Agencias', 'administracion', 'Permite administrar agencias'),
('ADMIN_BITACORA', 'Ver Bitácora', 'administracion', 'Acceso a logs del sistema');

-- Asignar Permisos a Roles
-- Administrador: Todos los permisos
INSERT INTO roles_permisos (id_rol, id_permiso)
SELECT 1, id_permiso FROM permisos;

-- Gerente: Todos los permisos excepto algunos de administración
INSERT INTO roles_permisos (id_rol, id_permiso)
SELECT 2, id_permiso FROM permisos WHERE codigo NOT IN ('ADMIN_PARAMETROS');

-- Cajero: Solo operaciones de caja
INSERT INTO roles_permisos (id_rol, id_permiso)
SELECT 3, id_permiso FROM permisos WHERE codigo IN (
    'CUENTA_LISTAR', 'TRANS_DEPOSITO', 'TRANS_RETIRO', 'TRANS_TRANSFERENCIA', 
    'TRANS_LISTAR', 'PREST_PAGAR', 'PREST_LISTAR'
);

-- Analista: Gestión de préstamos
INSERT INTO roles_permisos (id_rol, id_permiso)
SELECT 4, id_permiso FROM permisos WHERE codigo IN (
    'CUENTA_LISTAR', 'PREST_SOLICITAR', 'PREST_EVALUAR', 'PREST_LISTAR', 
    'REP_PRESTAMOS', 'REP_CLIENTES'
);

-- Insertar Parámetros del Sistema
INSERT INTO parametros_sistema (clave, valor, descripcion, tipo_dato) VALUES
('UMBRAL_SALDO_MINIMO', '100.00', 'Umbral para reporte de cuentas con saldo bajo', 'number'),
('DIAS_MORA_INICIAL', '5', 'Días después del vencimiento para considerar mora', 'number'),
('MONTO_MAXIMO_RETIRO_DIARIO', '10000.00', 'Monto máximo de retiro diario sin autorización especial', 'number'),
('COMISION_TRANSFERENCIA', '5.00', 'Comisión por transferencia entre cuentas', 'number'),
('NUMERO_CUENTA_PREFIJO', 'BV', 'Prefijo para números de cuenta', 'string'),
('NUMERO_PRESTAMO_PREFIJO', 'PR', 'Prefijo para números de préstamo', 'string'),
('SISTEMA_ACTIVO', 'true', 'Indica si el sistema está operativo', 'boolean');

-- Crear usuario administrador por defecto (password: admin123)
INSERT INTO usuarios (username, password, nombre_completo, correo, id_rol, estado) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador del Sistema', 'admin@bancovirtual.com', 1, 'activo');

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
