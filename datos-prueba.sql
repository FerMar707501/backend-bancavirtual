-- ============================================================================
-- DATOS DE PRUEBA - Sistema Bancario Virtual
-- ============================================================================
-- Este archivo contiene inserts de datos de prueba para testing
-- Ejecutar después de database.sql
-- ============================================================================

USE banco_virtual;

-- ============================================================================
-- CLIENTES DE PRUEBA
-- ============================================================================

INSERT INTO clientes (dpi, nit, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, direccion, correo, estado_kyc, estado_cliente) VALUES
('2555123450101', '55512345', 'Juan', 'Carlos', 'Pérez', 'López', 'Zona 1, Ciudad de Guatemala', 'juan.perez@email.com', 'verificado', 'activo'),
('2666234560202', '66623456', 'María', 'Elena', 'González', 'Martínez', 'Zona 10, Ciudad de Guatemala', 'maria.gonzalez@email.com', 'verificado', 'activo'),
('2777345670303', '77734567', 'Carlos', 'Alberto', 'Rodríguez', 'Hernández', 'Antigua Guatemala', 'carlos.rodriguez@email.com', 'verificado', 'activo'),
('2888456780404', '88845678', 'Ana', 'Lucía', 'Ramírez', 'García', 'Quetzaltenango', 'ana.ramirez@email.com', 'pendiente', 'activo'),
('2999567890505', '99956789', 'Luis', 'Fernando', 'Morales', 'Castillo', 'Zona 4, Ciudad de Guatemala', 'luis.morales@email.com', 'verificado', 'activo');

-- ============================================================================
-- TELÉFONOS DE CLIENTES
-- ============================================================================

INSERT INTO telefonos_cliente (id_cliente, numero_telefono, tipo, principal) VALUES
(1, '5511-2233', 'movil', TRUE),
(1, '2222-3344', 'fijo', FALSE),
(2, '5522-3344', 'movil', TRUE),
(3, '5533-4455', 'movil', TRUE),
(3, '7832-5566', 'trabajo', FALSE),
(4, '5544-5566', 'movil', TRUE),
(5, '5555-6677', 'movil', TRUE);

-- ============================================================================
-- USUARIOS PARA CLIENTES
-- ============================================================================
-- Nota: Todas las contraseñas son: password123
-- Hash bcrypt: $2b$10$YourHashHere

INSERT INTO usuarios (username, password, nombre_completo, correo, id_rol, id_agencia, estado) VALUES
('juan.perez', '$2b$10$K7L/W3iHJ7K4FQNZiZHr0eZN.Qj7sJ6vPj0qN.Ua6Z0Q5YxH8LqGu', 'Juan Carlos Pérez López', 'juan.perez@email.com', 3, 1, 'activo'),
('maria.gonzalez', '$2b$10$K7L/W3iHJ7K4FQNZiZHr0eZN.Qj7sJ6vPj0qN.Ua6Z0Q5YxH8LqGu', 'María Elena González Martínez', 'maria.gonzalez@email.com', 3, 2, 'activo'),
('carlos.rodriguez', '$2b$10$K7L/W3iHJ7K4FQNZiZHr0eZN.Qj7sJ6vPj0qN.Ua6Z0Q5YxH8LqGu', 'Carlos Alberto Rodríguez Hernández', 'carlos.rodriguez@email.com', 3, 3, 'activo'),
('gerente', '$2b$10$K7L/W3iHJ7K4FQNZiZHr0eZN.Qj7sJ6vPj0qN.Ua6Z0Q5YxH8LqGu', 'Gerente General', 'gerente@bancovirtual.com', 2, 1, 'activo'),
('cajero', '$2b$10$K7L/W3iHJ7K4FQNZiZHr0eZN.Qj7sJ6vPj0qN.Ua6Z0Q5YxH8LqGu', 'Cajero Principal', 'cajero@bancovirtual.com', 3, 1, 'activo');

-- ============================================================================
-- CUENTAS BANCARIAS
-- ============================================================================

INSERT INTO cuentas (numero_cuenta, id_cliente, id_tipo_cuenta, id_agencia, saldo, fecha_apertura, estado) VALUES
('BV146944059614', 1, 1, 1, 25000.00, '2024-01-15', 'activa'),
('BV606541807624', 1, 2, 1, 15000.00, '2024-01-15', 'activa'),
('BV234567890123', 2, 1, 2, 50000.00, '2024-02-20', 'activa'),
('BV345678901234', 2, 2, 2, 30000.00, '2024-02-20', 'activa'),
('BV456789012345', 3, 1, 3, 75000.00, '2024-03-10', 'activa'),
('BV567890123456', 4, 1, 4, 5000.00, '2024-04-05', 'activa'),
('BV678901234567', 5, 1, 1, 100000.00, '2024-05-01', 'activa'),
('BV789012345678', 5, 3, 1, 200000.00, '2024-05-01', 'activa');

-- ============================================================================
-- PRÉSTAMOS
-- ============================================================================

INSERT INTO prestamos (numero_prestamo, id_cliente, id_tipo_prestamo, id_cuenta_desembolso, monto_solicitado, monto_aprobado, plazo_meses, tasa_interes, tasa_mora, fecha_solicitud, fecha_aprobacion, fecha_desembolso, estado, id_usuario_aprobador) VALUES
('PR158081215825', 1, 1, 1, 100000.00, 100000.00, 24, 12.50, 3.00, '2024-06-01', '2024-06-03', '2024-06-05', 'vigente', 1),
('PR987654321098', 2, 2, 3, 500000.00, 500000.00, 240, 8.75, 2.50, '2024-06-10', '2024-06-15', '2024-06-20', 'vigente', 1),
('PR876543210987', 3, 3, 5, 150000.00, 150000.00, 60, 10.00, 2.75, '2024-07-01', '2024-07-05', '2024-07-08', 'vigente', 1),
('PR765432109876', 5, 4, 7, 300000.00, 300000.00, 36, 11.25, 3.50, '2024-08-01', '2024-08-05', '2024-08-10', 'vigente', 1);

-- ============================================================================
-- PLAN DE PAGOS (Generado para cada préstamo)
-- ============================================================================

-- Plan de pagos para préstamo PR158081215825 (24 meses)
INSERT INTO plan_pagos (id_prestamo, numero_cuota, fecha_vencimiento, monto_cuota, monto_capital, monto_interes, saldo_pendiente, estado) VALUES
(1, 1, '2024-07-05', 4708.47, 3666.80, 1041.67, 96333.20, 'pagado'),
(1, 2, '2024-08-05', 4708.47, 3705.04, 1003.43, 92628.16, 'pagado'),
(1, 3, '2024-09-05', 4708.47, 3743.66, 964.81, 88884.50, 'pendiente'),
(1, 4, '2024-10-05', 4708.47, 3782.65, 925.82, 85101.85, 'pendiente');

-- Plan de pagos para préstamo PR987654321098 (primeras 4 cuotas de 240)
INSERT INTO plan_pagos (id_prestamo, numero_cuota, fecha_vencimiento, monto_cuota, monto_capital, monto_interes, saldo_pendiente, estado) VALUES
(2, 1, '2024-07-20', 3980.72, 352.39, 3628.33, 499647.61, 'pagado'),
(2, 2, '2024-08-20', 3980.72, 354.96, 3625.76, 499292.65, 'pendiente'),
(2, 3, '2024-09-20', 3980.72, 357.54, 3623.18, 498935.11, 'pendiente'),
(2, 4, '2024-10-20', 3980.72, 360.14, 3620.58, 498574.97, 'pendiente');

-- ============================================================================
-- TRANSACCIONES
-- ============================================================================

-- Transacciones de depósitos iniciales
INSERT INTO transacciones (numero_transaccion, id_cuenta_origen, id_cuenta_destino, id_tipo_transaccion, monto, descripcion, estado, fecha_transaccion, id_usuario_registro) VALUES
('TRX001', NULL, 1, 1, 25000.00, 'Depósito inicial apertura cuenta', 'completada', '2024-01-15 10:00:00', 1),
('TRX002', NULL, 2, 1, 15000.00, 'Depósito inicial apertura cuenta', 'completada', '2024-01-15 10:05:00', 1),
('TRX003', NULL, 3, 1, 50000.00, 'Depósito inicial apertura cuenta', 'completada', '2024-02-20 09:00:00', 1),
('TRX004', NULL, 4, 1, 30000.00, 'Depósito inicial apertura cuenta', 'completada', '2024-02-20 09:05:00', 1),
('TRX005', NULL, 5, 1, 75000.00, 'Depósito inicial apertura cuenta', 'completada', '2024-03-10 11:00:00', 1),
('TRX006', NULL, 6, 1, 5000.00, 'Depósito inicial apertura cuenta', 'completada', '2024-04-05 10:30:00', 1),
('TRX007', NULL, 7, 1, 100000.00, 'Depósito inicial apertura cuenta', 'completada', '2024-05-01 09:00:00', 1),
('TRX008', NULL, 8, 1, 200000.00, 'Depósito inicial apertura cuenta', 'completada', '2024-05-01 09:10:00', 1);

-- Desembolsos de préstamos
INSERT INTO transacciones (numero_transaccion, id_cuenta_origen, id_cuenta_destino, id_tipo_transaccion, monto, descripcion, estado, fecha_transaccion, id_usuario_registro) VALUES
('TRX009', NULL, 1, 1, 95000.00, 'Desembolso de préstamo PR158081215825', 'completada', '2024-06-05 14:00:00', 1),
('TRX010', NULL, 3, 1, 475000.00, 'Desembolso de préstamo PR987654321098', 'completada', '2024-06-20 15:00:00', 1),
('TRX011', NULL, 5, 1, 142500.00, 'Desembolso de préstamo PR876543210987', 'completada', '2024-07-08 16:00:00', 1),
('TRX012', NULL, 7, 1, 285000.00, 'Desembolso de préstamo PR765432109876', 'completada', '2024-08-10 10:00:00', 1);

-- Pagos de préstamos
INSERT INTO transacciones (numero_transaccion, id_cuenta_origen, id_cuenta_destino, id_tipo_transaccion, monto, descripcion, estado, fecha_transaccion, id_usuario_registro) VALUES
('TRX013', 1, NULL, 4, 4708.47, 'Pago cuota 1 préstamo PR158081215825', 'completada', '2024-07-05 09:00:00', 5),
('TRX014', 1, NULL, 4, 4708.47, 'Pago cuota 2 préstamo PR158081215825', 'completada', '2024-08-05 09:00:00', 5),
('TRX015', 3, NULL, 4, 3980.72, 'Pago cuota 1 préstamo PR987654321098', 'completada', '2024-07-20 10:00:00', 5);

-- Operaciones regulares
INSERT INTO transacciones (numero_transaccion, id_cuenta_origen, id_cuenta_destino, id_tipo_transaccion, monto, descripcion, estado, fecha_transaccion, id_usuario_registro) VALUES
('TRX016', NULL, 2, 1, 5000.00, 'Depósito en efectivo', 'completada', '2024-09-01 10:00:00', 5),
('TRX017', 2, NULL, 2, 1000.00, 'Retiro en efectivo', 'completada', '2024-09-05 11:00:00', 5),
('TRX018', 2, 1, 3, 500.00, 'Transferencia entre cuentas', 'completada', '2024-09-10 12:00:00', 5),
('TRX019', NULL, 4, 1, 10000.00, 'Depósito en efectivo', 'completada', '2024-09-15 09:00:00', 5),
('TRX020', 4, NULL, 2, 5000.00, 'Retiro en efectivo', 'completada', '2024-09-20 10:00:00', 5);

-- Transferencias entre clientes
INSERT INTO transacciones (numero_transaccion, id_cuenta_origen, id_cuenta_destino, id_tipo_transaccion, monto, descripcion, estado, fecha_transaccion, id_usuario_registro) VALUES
('TRX021', 3, 5, 3, 2000.00, 'Transferencia pago servicios', 'completada', '2024-10-01 14:00:00', 2),
('TRX022', 7, 1, 3, 1500.00, 'Transferencia préstamo personal', 'completada', '2024-10-05 15:00:00', 2),
('TRX023', 5, 3, 3, 3000.00, 'Transferencia factura', 'completada', '2024-10-10 16:00:00', 3);

-- Pagos de préstamos relacionados
INSERT INTO pagos_prestamo (id_prestamo, id_plan_pago, id_transaccion, monto_pagado, monto_capital, monto_interes, monto_mora, saldo_restante, fecha_pago) VALUES
(1, 1, 13, 4708.47, 3666.80, 1041.67, 0.00, 96333.20, '2024-07-05 09:00:00'),
(1, 2, 14, 4708.47, 3705.04, 1003.43, 0.00, 92628.16, '2024-08-05 09:00:00'),
(2, 1, 15, 3980.72, 352.39, 3628.33, 0.00, 499647.61, '2024-07-20 10:00:00');

-- ============================================================================
-- BITÁCORA (Registros de actividad del sistema)
-- ============================================================================

INSERT INTO bitacora (id_usuario, accion, modulo, descripcion, ip_address) VALUES
(1, 'LOGIN', 'auth', 'Inicio de sesión exitoso', '192.168.1.100'),
(1, 'CREATE', 'cuentas', 'Creación de cuenta BV146944059614', '192.168.1.100'),
(1, 'CREATE', 'prestamos', 'Creación de préstamo PR158081215825', '192.168.1.100'),
(1, 'APPROVE', 'prestamos', 'Aprobación de préstamo PR158081215825', '192.168.1.100'),
(5, 'LOGIN', 'auth', 'Inicio de sesión exitoso', '192.168.1.105'),
(5, 'CREATE', 'transacciones', 'Depósito en cuenta BV606541807624', '192.168.1.105'),
(5, 'CREATE', 'transacciones', 'Retiro de cuenta BV606541807624', '192.168.1.105'),
(2, 'LOGIN', 'auth', 'Inicio de sesión exitoso', '192.168.1.102'),
(3, 'LOGIN', 'auth', 'Inicio de sesión exitoso', '192.168.1.103');

-- ============================================================================
-- FIN DE DATOS DE PRUEBA
-- ============================================================================

-- Verificar datos insertados
SELECT 'Clientes registrados:' AS Info, COUNT(*) AS Total FROM clientes;
SELECT 'Usuarios creados:' AS Info, COUNT(*) AS Total FROM usuarios;
SELECT 'Cuentas activas:' AS Info, COUNT(*) AS Total FROM cuentas WHERE estado = 'activa';
SELECT 'Préstamos vigentes:' AS Info, COUNT(*) AS Total FROM prestamos WHERE estado = 'vigente';
SELECT 'Transacciones completadas:' AS Info, COUNT(*) AS Total FROM transacciones WHERE estado = 'completada';
