const db = require('../../models');
const responseHelper = require('../../utils/responseHelper');

const pagoPrestamoController = {
  // Realizar pago de préstamo
  async realizarPago(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
      const { id_prestamo, monto_pago, id_cuenta_origen } = req.body;

      // Validaciones
      if (!id_prestamo || !monto_pago) {
        await transaction.rollback();
        return responseHelper.error(res, 'Faltan campos requeridos', 400);
      }

      if (parseFloat(monto_pago) <= 0) {
        await transaction.rollback();
        return responseHelper.error(res, 'El monto debe ser mayor a 0', 400);
      }

      // Obtener préstamo
      const prestamo = await db.Prestamo.findByPk(id_prestamo, {
        include: [{ model: db.Cliente, as: 'cliente' }],
        transaction
      });

      if (!prestamo) {
        await transaction.rollback();
        return responseHelper.error(res, 'Préstamo no encontrado', 404);
      }

      if (prestamo.estado !== 'vigente') {
        await transaction.rollback();
        return responseHelper.error(res, `El préstamo está ${prestamo.estado}`, 400);
      }

      let id_transaccion = null;

      // Si se proporciona cuenta origen, validar y descontar
      if (id_cuenta_origen) {
        const cuenta = await db.Cuenta.findByPk(id_cuenta_origen, { transaction });
        
        if (!cuenta) {
          await transaction.rollback();
          return responseHelper.error(res, 'Cuenta no encontrada', 404);
        }

        if (cuenta.estado !== 'activa') {
          await transaction.rollback();
          return responseHelper.error(res, `La cuenta está ${cuenta.estado}`, 400);
        }

        if (parseFloat(cuenta.saldo) < parseFloat(monto_pago)) {
          await transaction.rollback();
          return responseHelper.error(res, 'Saldo insuficiente en la cuenta', 400);
        }

        // Descontar de cuenta
        const nuevoSaldo = parseFloat(cuenta.saldo) - parseFloat(monto_pago);
        await cuenta.update({ saldo: nuevoSaldo }, { transaction });

        // Crear transacción
        const tipoTransaccion = await db.TipoTransaccion.findOne({
          where: { codigo: 'PAG' },
          transaction
        });

        const transaccionCreada = await db.Transaccion.create({
          numero_comprobante: `PAG-${prestamo.numero_prestamo}-${Date.now()}`,
          id_cuenta_origen,
          id_cuenta_destino: null,
          id_tipo_transaccion: tipoTransaccion.id_tipo_transaccion,
          monto: monto_pago,
          descripcion: `Pago de préstamo ${prestamo.numero_prestamo}`,
          id_usuario: req.user.id_usuario,
          id_agencia: req.user.id_agencia || 1,
          fecha_transaccion: new Date(),
          estado: 'completada'
        }, { transaction });

        id_transaccion = transaccionCreada.id_transaccion;
      }

      // Calcular intereses sobre saldo pendiente (simplificado)
      const saldoAnterior = parseFloat(prestamo.saldo_pendiente);
      const tasaMensual = parseFloat(prestamo.tasa_interes) / 100 / 12;
      const intereses = saldoAnterior * tasaMensual;
      
      // Determinar capital pagado
      let montoPagoReal = parseFloat(monto_pago);
      let interesesPagados = Math.min(montoPagoReal, intereses);
      let capitalPagado = Math.max(0, montoPagoReal - interesesPagados);

      // Actualizar saldo pendiente
      const nuevoSaldoPendiente = Math.max(0, saldoAnterior - capitalPagado);

      // Crear registro de pago
      const pago = await db.PagoPrestamo.create({
        id_prestamo,
        id_transaccion: id_transaccion,
        fecha_pago: new Date(),
        monto_total: monto_pago,
        monto_capital: capitalPagado.toFixed(2),
        monto_interes: interesesPagados.toFixed(2),
        monto_mora: 0,
        id_usuario: req.user.id_usuario
      }, { transaction });

      // Actualizar préstamo
      const estadoFinal = nuevoSaldoPendiente === 0 ? 'cancelado' : 'vigente';
      await prestamo.update({
        saldo_pendiente: nuevoSaldoPendiente.toFixed(2),
        estado: estadoFinal
      }, { transaction });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: req.user.id_usuario,
        accion: 'PAGAR_PRESTAMO',
        modulo: 'prestamos',
        descripcion: `Pago de Q${monto_pago} realizado al préstamo ${prestamo.numero_prestamo}`,
        ip_address: req.ip,
        datos_adicionales: {
          id_prestamo,
          id_pago: pago.id_pago,
          monto: monto_pago,
          capital_pagado: capitalPagado,
          interes_pagado: interesesPagados,
          nuevo_saldo: nuevoSaldoPendiente
        }
      }, { transaction });

      await transaction.commit();

      return responseHelper.success(res, {
        pago,
        saldo_anterior: saldoAnterior,
        saldo_nuevo: nuevoSaldoPendiente,
        estado_prestamo: estadoFinal
      }, 'Pago registrado exitosamente', 201);
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      console.error('Error al realizar pago:', error);
      return responseHelper.error(res, 'Error al realizar pago', 500);
    }
  },

  // Listar pagos de un préstamo
  async listarPagos(req, res) {
    try {
      const { id_prestamo } = req.params;

      const prestamo = await db.Prestamo.findByPk(id_prestamo);
      if (!prestamo) {
        return responseHelper.error(res, 'Préstamo no encontrado', 404);
      }

      const pagos = await db.PagoPrestamo.findAll({
        where: { id_prestamo },
        include: [
          {
            model: db.Usuario,
            as: 'usuario',
            attributes: ['id_usuario', 'username', 'nombre_completo']
          }
        ],
        order: [['fecha_pago', 'DESC']]
      });

      return responseHelper.success(res, pagos, 'Pagos obtenidos exitosamente');
    } catch (error) {
      console.error('Error al listar pagos:', error);
      return responseHelper.error(res, 'Error al obtener pagos', 500);
    }
  }
};

module.exports = pagoPrestamoController;
