const db = require('../../models');
const responseHelper = require('../../utils/responseHelper');
const { generateLoanNumber } = require('../../utils/generators');
const { Op } = require('sequelize');

const prestamoController = {
  // Ver mis préstamos (para clientes)
  async misPrestamos(req, res) {
    try {
      // Validar que el usuario esté autenticado
      if (!req.user) {
        return responseHelper.error(res, 'Usuario no válido', 401);
      }

      // Buscar usuario completo
      const usuario = await db.Usuario.findByPk(req.user.id_usuario);
      
      if (!usuario || !usuario.correo) {
        return responseHelper.error(res, 'Usuario no válido', 401);
      }

      // Buscar cliente asociado al usuario por correo
      const cliente = await db.Cliente.findOne({
        where: { correo: usuario.correo }
      });

      if (!cliente) {
        return responseHelper.success(res, [], 'No se encontró información de cliente');
      }

      const prestamos = await db.Prestamo.findAll({
        where: { id_cliente: cliente.id_cliente },
        include: [
          {
            model: db.TipoPrestamo,
            as: 'tipoPrestamo',
            attributes: ['id_tipo_prestamo', 'codigo', 'nombre', 'descripcion', 'tasa_interes_anual']
          },
          {
            model: db.Usuario,
            as: 'usuarioAprobador',
            attributes: ['id_usuario', 'username', 'nombre_completo'],
            required: false
          },
          {
            model: db.PagoPrestamo,
            as: 'pagos',
            separate: true,
            order: [['fecha_pago', 'DESC']],
            limit: 5
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return responseHelper.success(res, prestamos, 'Préstamos obtenidos exitosamente');
    } catch (error) {
      console.error('Error al obtener mis préstamos:', error);
      return responseHelper.error(res, 'Error al obtener préstamos', 500);
    }
  },

  // Listar todos los préstamos
  async listar(req, res) {
    try {
      const { id_cliente, estado, tipo } = req.query;

      const where = {};

      if (id_cliente) {
        where.id_cliente = id_cliente;
      }

      if (estado) {
        where.estado = estado;
      }

      if (tipo) {
        where.id_tipo_prestamo = tipo;
      }

      const prestamos = await db.Prestamo.findAll({
        where,
        include: [
          {
            model: db.Cliente,
            as: 'cliente',
            attributes: ['id_cliente', 'primer_nombre', 'primer_apellido', 'dpi']
          },
          {
            model: db.TipoPrestamo,
            as: 'tipoPrestamo'
          },
          {
            model: db.Usuario,
            as: 'usuarioAprobador',
            attributes: ['id_usuario', 'username', 'nombre_completo']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return responseHelper.success(res, prestamos, 'Préstamos obtenidos exitosamente');
    } catch (error) {
      console.error('Error al listar préstamos:', error);
      return responseHelper.error(res, 'Error al obtener préstamos', 500);
    }
  },

  // Obtener préstamo por ID
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const prestamo = await db.Prestamo.findByPk(id, {
        include: [
          {
            model: db.Cliente,
            as: 'cliente',
            include: [
              {
                model: db.TelefonoCliente,
                as: 'telefonos'
              },
              {
                model: db.Cuenta,
                as: 'cuentas'
              }
            ]
          },
          {
            model: db.TipoPrestamo,
            as: 'tipoPrestamo'
          },
          {
            model: db.Usuario,
            as: 'usuarioAprobador',
            attributes: ['id_usuario', 'username', 'nombre_completo']
          },
          {
            model: db.PagoPrestamo,
            as: 'pagos',
            order: [['fecha_pago', 'DESC']]
          }
        ]
      });

      if (!prestamo) {
        return responseHelper.error(res, 'Préstamo no encontrado', 404);
      }

      return responseHelper.success(res, prestamo, 'Préstamo obtenido exitosamente');
    } catch (error) {
      console.error('Error al obtener préstamo:', error);
      return responseHelper.error(res, 'Error al obtener préstamo', 500);
    }
  },

  // Solicitar préstamo
  async solicitar(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
      const {
        id_cliente,
        id_tipo_prestamo,
        id_cuenta_desembolso,
        monto_solicitado,
        plazo_meses,
        destino_prestamo,
        proposito,
        tasa_interes,
        frecuencia_pago
      } = req.body;

      // Validar campos requeridos
      if (!id_cliente || !id_tipo_prestamo || !monto_solicitado || !plazo_meses) {
        await transaction.rollback();
        return responseHelper.error(res, 'Faltan campos requeridos', 400);
      }

      // Validar que el cliente existe y está activo
      const cliente = await db.Cliente.findByPk(id_cliente, { transaction });
      if (!cliente) {
        await transaction.rollback();
        return responseHelper.error(res, 'Cliente no encontrado', 404);
      }

      if (cliente.estado_cliente !== 'activo') {
        await transaction.rollback();
        return responseHelper.error(res, 'El cliente no está activo', 400);
      }

      if (cliente.estado_kyc !== 'verificado') {
        await transaction.rollback();
        return responseHelper.error(res, 'El cliente debe tener KYC verificado', 400);
      }

      // Verificar tipo de préstamo
      const tipoPrestamo = await db.TipoPrestamo.findByPk(id_tipo_prestamo, { transaction });
      if (!tipoPrestamo) {
        await transaction.rollback();
        return responseHelper.error(res, 'Tipo de préstamo no encontrado', 404);
      }

      if (tipoPrestamo.estado !== 'activo') {
        await transaction.rollback();
        return responseHelper.error(res, 'Tipo de préstamo no disponible', 400);
      }

      // Validar montos
      if (parseFloat(monto_solicitado) < parseFloat(tipoPrestamo.monto_minimo) ||
          parseFloat(monto_solicitado) > parseFloat(tipoPrestamo.monto_maximo)) {
        await transaction.rollback();
        return responseHelper.error(res, 
          `El monto debe estar entre Q${tipoPrestamo.monto_minimo} y Q${tipoPrestamo.monto_maximo}`, 
          400);
      }

      // Validar plazo
      if (plazo_meses < tipoPrestamo.plazo_minimo_meses || 
          plazo_meses > tipoPrestamo.plazo_maximo_meses) {
        await transaction.rollback();
        return responseHelper.error(res, 
          `El plazo debe estar entre ${tipoPrestamo.plazo_minimo_meses} y ${tipoPrestamo.plazo_maximo_meses} meses`, 
          400);
      }

      // Generar número de préstamo
      let numero_prestamo;
      let exists = true;
      let attempts = 0;

      while (exists && attempts < 10) {
        numero_prestamo = generateLoanNumber();
        const existingPrestamo = await db.Prestamo.findOne({ 
          where: { numero_prestamo },
          transaction 
        });
        exists = !!existingPrestamo;
        attempts++;
      }

      if (exists) {
        await transaction.rollback();
        return responseHelper.error(res, 'No se pudo generar número de préstamo único', 500);
      }

      // Calcular cuota mensual (fórmula de amortización)
      const tasaMensual = parseFloat(tipoPrestamo.tasa_interes_anual) / 100 / 12;
      const cuotaMensual = parseFloat(monto_solicitado) * 
        (tasaMensual * Math.pow(1 + tasaMensual, plazo_meses)) / 
        (Math.pow(1 + tasaMensual, plazo_meses) - 1);

      // Crear préstamo
      const prestamo = await db.Prestamo.create({
        numero_prestamo,
        id_cliente,
        id_tipo_prestamo,
        id_cuenta_desembolso: id_cuenta_desembolso || null,
        id_agencia: req.user.id_agencia || 1,
        monto_solicitado,
        monto_aprobado: null,
        tasa_interes: tasa_interes || tipoPrestamo.tasa_interes_anual,
        plazo_meses,
        frecuencia_pago: frecuencia_pago || 'mensual',
        cuota_mensual: cuotaMensual.toFixed(2),
        saldo_pendiente: 0,
        destino: proposito || destino_prestamo || 'No especificado',
        fecha_solicitud: new Date(),
        estado: 'solicitado'
      }, { transaction });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: req.user.id_usuario,
        accion: 'SOLICITAR_PRESTAMO',
        modulo: 'prestamos',
        descripcion: `Préstamo solicitado: ${numero_prestamo} por Q${monto_solicitado} para cliente ${cliente.primer_nombre} ${cliente.primer_apellido}`,
        ip_address: req.ip,
        datos_adicionales: {
          id_prestamo: prestamo.id_prestamo,
          numero_prestamo,
          id_cliente,
          monto: monto_solicitado
        }
      }, { transaction });

      await transaction.commit();

      // Obtener préstamo con relaciones
      const prestamoCreado = await db.Prestamo.findByPk(prestamo.id_prestamo, {
        include: [
          { model: db.Cliente, as: 'cliente' },
          { model: db.TipoPrestamo, as: 'tipoPrestamo' }
        ]
      });

      return responseHelper.success(res, prestamoCreado, 'Préstamo solicitado exitosamente', 201);
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      console.error('Error al solicitar préstamo:', error);
      return responseHelper.error(res, 'Error al solicitar préstamo', 500);
    }
  },

  // Aprobar préstamo
  async aprobar(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
      const { id } = req.params;
      const { monto_aprobado, id_cuenta_destino } = req.body;

      const prestamo = await db.Prestamo.findByPk(id, {
        include: [{ model: db.Cliente, as: 'cliente' }],
        transaction
      });

      if (!prestamo) {
        await transaction.rollback();
        return responseHelper.error(res, 'Préstamo no encontrado', 404);
      }

      if (prestamo.estado !== 'solicitado') {
        await transaction.rollback();
        return responseHelper.error(res, `El préstamo ya está ${prestamo.estado}`, 400);
      }

      if (!monto_aprobado) {
        await transaction.rollback();
        return responseHelper.error(res, 'Debe especificar el monto aprobado', 400);
      }

      // Validar cuenta destino si se proporciona
      if (id_cuenta_destino) {
        const cuenta = await db.Cuenta.findByPk(id_cuenta_destino, { transaction });
        if (!cuenta || cuenta.id_cliente !== prestamo.id_cliente) {
          await transaction.rollback();
          return responseHelper.error(res, 'Cuenta inválida o no pertenece al cliente', 400);
        }
      }

      // Recalcular cuota con monto aprobado
      const tasaMensual = parseFloat(prestamo.tasa_interes) / 100 / 12;
      const cuotaMensual = parseFloat(monto_aprobado) * 
        (tasaMensual * Math.pow(1 + tasaMensual, prestamo.plazo_meses)) / 
        (Math.pow(1 + tasaMensual, prestamo.plazo_meses) - 1);

      await prestamo.update({
        monto_aprobado,
        cuota_mensual: cuotaMensual.toFixed(2),
        fecha_aprobacion: new Date(),
        id_usuario_aprobador: req.user.id_usuario,
        estado: 'aprobado'
      }, { transaction });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: req.user.id_usuario,
        accion: 'APROBAR_PRESTAMO',
        modulo: 'prestamos',
        descripcion: `Préstamo ${prestamo.numero_prestamo} aprobado por Q${monto_aprobado}`,
        ip_address: req.ip,
        datos_adicionales: {
          id_prestamo: id,
          monto_solicitado: prestamo.monto_solicitado,
          monto_aprobado
        }
      }, { transaction });

      await transaction.commit();

      const prestamoActualizado = await db.Prestamo.findByPk(id, {
        include: [
          { model: db.Cliente, as: 'cliente' },
          { model: db.TipoPrestamo, as: 'tipoPrestamo' },
          { model: db.Usuario, as: 'usuarioAprobador' }
        ]
      });

      return responseHelper.success(res, prestamoActualizado, 'Préstamo aprobado exitosamente');
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      console.error('Error al aprobar préstamo:', error);
      return responseHelper.error(res, 'Error al aprobar préstamo', 500);
    }
  },

  // Desembolsar préstamo
  async desembolsar(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
      const { id } = req.params;

      const prestamo = await db.Prestamo.findByPk(id, {
        include: [{ model: db.Cliente, as: 'cliente' }],
        transaction
      });

      if (!prestamo) {
        await transaction.rollback();
        return responseHelper.error(res, 'Préstamo no encontrado', 404);
      }

      if (prestamo.estado !== 'aprobado') {
        await transaction.rollback();
        return responseHelper.error(res, `El préstamo está ${prestamo.estado}, debe estar aprobado`, 400);
      }

      // Usar la cuenta de desembolso del préstamo
      const id_cuenta_destino = prestamo.id_cuenta_desembolso;
      
      if (!id_cuenta_destino) {
        await transaction.rollback();
        return responseHelper.error(res, 'El préstamo no tiene cuenta de desembolso configurada', 400);
      }

      // Validar cuenta
      const cuenta = await db.Cuenta.findByPk(id_cuenta_destino, { transaction });
      if (!cuenta) {
        await transaction.rollback();
        return responseHelper.error(res, 'Cuenta no encontrada', 404);
      }

      if (cuenta.id_cliente !== prestamo.id_cliente) {
        await transaction.rollback();
        return responseHelper.error(res, 'La cuenta no pertenece al cliente del préstamo', 400);
      }

      if (cuenta.estado !== 'activa') {
        await transaction.rollback();
        return responseHelper.error(res, `La cuenta está ${cuenta.estado}`, 400);
      }

      // Crear transacción de desembolso
      const tipoTransaccion = await db.TipoTransaccion.findOne({
        where: { codigo: 'DEP' },
        transaction
      });

      const transaccionDesembolso = await db.Transaccion.create({
        numero_comprobante: `DES-${prestamo.numero_prestamo}`,
        id_cuenta_origen: null,
        id_cuenta_destino,
        id_tipo_transaccion: tipoTransaccion.id_tipo_transaccion,
        monto: prestamo.monto_aprobado,
        descripcion: `Desembolso de préstamo ${prestamo.numero_prestamo}`,
        id_usuario: req.user.id_usuario,
        id_agencia: req.user.id_agencia || 1,
        fecha_transaccion: new Date(),
        estado: 'completada'
      }, { transaction });

      // Actualizar saldo de cuenta
      const nuevoSaldo = parseFloat(cuenta.saldo) + parseFloat(prestamo.monto_aprobado);
      await cuenta.update({ saldo: nuevoSaldo }, { transaction });

      // Actualizar préstamo
      await prestamo.update({
        fecha_desembolso: new Date(),
        saldo_pendiente: prestamo.monto_aprobado,
        estado: 'vigente'
      }, { transaction });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: req.user.id_usuario,
        accion: 'DESEMBOLSAR_PRESTAMO',
        modulo: 'prestamos',
        descripcion: `Préstamo ${prestamo.numero_prestamo} desembolsado: Q${prestamo.monto_aprobado} a cuenta ${cuenta.numero_cuenta}`,
        ip_address: req.ip,
        datos_adicionales: {
          id_prestamo: id,
          id_cuenta: id_cuenta_destino,
          monto: prestamo.monto_aprobado,
          id_transaccion: transaccionDesembolso.id_transaccion
        }
      }, { transaction });

      await transaction.commit();

      const prestamoActualizado = await db.Prestamo.findByPk(id, {
        include: [
          { model: db.Cliente, as: 'cliente' },
          { model: db.TipoPrestamo, as: 'tipoPrestamo' }
        ]
      });

      return responseHelper.success(res, {
        prestamo: prestamoActualizado,
        transaccion: transaccionDesembolso,
        saldo_cuenta: nuevoSaldo
      }, 'Préstamo desembolsado exitosamente');
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      console.error('Error al desembolsar préstamo:', error);
      return responseHelper.error(res, 'Error al desembolsar préstamo', 500);
    }
  },

  // Rechazar préstamo
  async rechazar(req, res) {
    try {
      const { id } = req.params;
      const { motivo_rechazo } = req.body;

      const prestamo = await db.Prestamo.findByPk(id);

      if (!prestamo) {
        return responseHelper.error(res, 'Préstamo no encontrado', 404);
      }

      if (prestamo.estado !== 'solicitado') {
        return responseHelper.error(res, `El préstamo ya está ${prestamo.estado}`, 400);
      }

      await prestamo.update({
        estado: 'rechazado',
        motivo_rechazo: motivo_rechazo || 'No especificado'
      });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: req.user.id_usuario,
        accion: 'RECHAZAR_PRESTAMO',
        modulo: 'prestamos',
        descripcion: `Préstamo ${prestamo.numero_prestamo} rechazado. Motivo: ${motivo_rechazo || 'No especificado'}`,
        ip_address: req.ip,
        datos_adicionales: {
          id_prestamo: id,
          motivo: motivo_rechazo
        }
      });

      return responseHelper.success(res, null, 'Préstamo rechazado');
    } catch (error) {
      console.error('Error al rechazar préstamo:', error);
      return responseHelper.error(res, 'Error al rechazar préstamo', 500);
    }
  }
};

module.exports = prestamoController;
