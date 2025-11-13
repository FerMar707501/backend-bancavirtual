const db = require('../../models');
const responseHelper = require('../../utils/responseHelper');
const { generateTransactionNumber } = require('../../utils/generators');

const transaccionService = {
  // Realizar depósito
  async deposito(id_cuenta_destino, monto, descripcion, id_usuario, id_agencia, ip_address) {
    const transaction = await db.sequelize.transaction();

    try {
      // Validar cuenta destino
      const cuenta = await db.Cuenta.findByPk(id_cuenta_destino, { transaction });
      
      if (!cuenta) {
        throw new Error('Cuenta no encontrada');
      }

      if (cuenta.estado !== 'activa') {
        throw new Error(`La cuenta está ${cuenta.estado}`);
      }

      // Obtener tipo de transacción
      const tipoTransaccion = await db.TipoTransaccion.findOne({
        where: { codigo: 'DEP' },
        transaction
      });

      if (!tipoTransaccion) {
        throw new Error('Tipo de transacción no configurado');
      }

      // Generar número de comprobante
      let numero_comprobante = generateTransactionNumber();

      // Crear transacción
      const transaccionCreada = await db.Transaccion.create({
        numero_comprobante,
        id_cuenta_origen: null,
        id_cuenta_destino,
        id_tipo_transaccion: tipoTransaccion.id_tipo_transaccion,
        monto,
        descripcion: descripcion || `Depósito en cuenta ${cuenta.numero_cuenta}`,
        id_usuario,
        id_agencia,
        fecha_transaccion: new Date(),
        estado: 'completada'
      }, { transaction });

      // Actualizar saldo de cuenta destino
      const nuevoSaldo = parseFloat(cuenta.saldo) + parseFloat(monto);
      await cuenta.update({ saldo: nuevoSaldo }, { transaction });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario,
        accion: 'DEPOSITO',
        modulo: 'transacciones',
        descripcion: `Depósito de Q${monto} en cuenta ${cuenta.numero_cuenta}`,
        ip_address,
        datos_adicionales: {
          id_transaccion: transaccionCreada.id_transaccion,
          numero_comprobante,
          id_cuenta: id_cuenta_destino,
          monto,
          saldo_anterior: cuenta.saldo,
          saldo_nuevo: nuevoSaldo
        }
      }, { transaction });

      await transaction.commit();

      return {
        transaccion: transaccionCreada,
        saldo_anterior: cuenta.saldo,
        saldo_nuevo: nuevoSaldo
      };
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  },

  // Realizar retiro
  async retiro(id_cuenta_origen, monto, descripcion, id_usuario, id_agencia, ip_address) {
    const transaction = await db.sequelize.transaction();

    try {
      // Validar cuenta origen
      const cuenta = await db.Cuenta.findByPk(id_cuenta_origen, { transaction });
      
      if (!cuenta) {
        throw new Error('Cuenta no encontrada');
      }

      if (cuenta.estado !== 'activa') {
        throw new Error(`La cuenta está ${cuenta.estado}`);
      }

      // Validar saldo suficiente
      if (parseFloat(cuenta.saldo) < parseFloat(monto)) {
        throw new Error('Saldo insuficiente');
      }

      // Obtener tipo de transacción
      const tipoTransaccion = await db.TipoTransaccion.findOne({
        where: { codigo: 'RET' },
        transaction
      });

      if (!tipoTransaccion) {
        throw new Error('Tipo de transacción no configurado');
      }

      // Generar número de comprobante
      let numero_comprobante = generateTransactionNumber();

      // Crear transacción
      const transaccionCreada = await db.Transaccion.create({
        numero_comprobante,
        id_cuenta_origen,
        id_cuenta_destino: null,
        id_tipo_transaccion: tipoTransaccion.id_tipo_transaccion,
        monto,
        descripcion: descripcion || `Retiro de cuenta ${cuenta.numero_cuenta}`,
        id_usuario,
        id_agencia,
        fecha_transaccion: new Date(),
        estado: 'completada'
      }, { transaction });

      // Actualizar saldo de cuenta origen
      const nuevoSaldo = parseFloat(cuenta.saldo) - parseFloat(monto);
      await cuenta.update({ saldo: nuevoSaldo }, { transaction });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario,
        accion: 'RETIRO',
        modulo: 'transacciones',
        descripcion: `Retiro de Q${monto} de cuenta ${cuenta.numero_cuenta}`,
        ip_address,
        datos_adicionales: {
          id_transaccion: transaccionCreada.id_transaccion,
          numero_comprobante,
          id_cuenta: id_cuenta_origen,
          monto,
          saldo_anterior: cuenta.saldo,
          saldo_nuevo: nuevoSaldo
        }
      }, { transaction });

      await transaction.commit();

      return {
        transaccion: transaccionCreada,
        saldo_anterior: cuenta.saldo,
        saldo_nuevo: nuevoSaldo
      };
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  },

  // Realizar transferencia
  async transferencia(id_cuenta_origen, id_cuenta_destino, monto, descripcion, id_usuario, id_agencia, ip_address) {
    const transaction = await db.sequelize.transaction();

    try {
      // Validar que no sean la misma cuenta
      if (id_cuenta_origen === id_cuenta_destino) {
        throw new Error('No se puede transferir a la misma cuenta');
      }

      // Validar cuenta origen
      const cuentaOrigen = await db.Cuenta.findByPk(id_cuenta_origen, { transaction });
      
      if (!cuentaOrigen) {
        throw new Error('Cuenta origen no encontrada');
      }

      if (cuentaOrigen.estado !== 'activa') {
        throw new Error(`La cuenta origen está ${cuentaOrigen.estado}`);
      }

      // Validar cuenta destino
      const cuentaDestino = await db.Cuenta.findByPk(id_cuenta_destino, { transaction });
      
      if (!cuentaDestino) {
        throw new Error('Cuenta destino no encontrada');
      }

      if (cuentaDestino.estado !== 'activa') {
        throw new Error(`La cuenta destino está ${cuentaDestino.estado}`);
      }

      // Validar saldo suficiente
      if (parseFloat(cuentaOrigen.saldo) < parseFloat(monto)) {
        throw new Error('Saldo insuficiente en cuenta origen');
      }

      // Obtener tipo de transacción
      const tipoTransaccion = await db.TipoTransaccion.findOne({
        where: { codigo: 'TRA' },
        transaction
      });

      if (!tipoTransaccion) {
        await transaction.rollback();
        throw new Error('Tipo de transacción no configurado');
      }

      // Generar número de comprobante
      let numero_comprobante = generateTransactionNumber();

      // Crear transacción
      const transaccionCreada = await db.Transaccion.create({
        numero_comprobante,
        id_cuenta_origen,
        id_cuenta_destino,
        id_tipo_transaccion: tipoTransaccion.id_tipo_transaccion,
        monto,
        descripcion: descripcion || `Transferencia de ${cuentaOrigen.numero_cuenta} a ${cuentaDestino.numero_cuenta}`,
        id_usuario,
        id_agencia,
        fecha_transaccion: new Date(),
        estado: 'completada'
      }, { transaction });

      // Actualizar saldos
      const nuevoSaldoOrigen = parseFloat(cuentaOrigen.saldo) - parseFloat(monto);
      const nuevoSaldoDestino = parseFloat(cuentaDestino.saldo) + parseFloat(monto);

      await cuentaOrigen.update({ saldo: nuevoSaldoOrigen }, { transaction });
      await cuentaDestino.update({ saldo: nuevoSaldoDestino }, { transaction });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario,
        accion: 'TRANSFERENCIA',
        modulo: 'transacciones',
        descripcion: `Transferencia de Q${monto} de ${cuentaOrigen.numero_cuenta} a ${cuentaDestino.numero_cuenta}`,
        ip_address,
        datos_adicionales: {
          id_transaccion: transaccionCreada.id_transaccion,
          numero_comprobante,
          id_cuenta_origen,
          id_cuenta_destino,
          monto,
          saldo_origen_anterior: cuentaOrigen.saldo,
          saldo_origen_nuevo: nuevoSaldoOrigen,
          saldo_destino_anterior: cuentaDestino.saldo,
          saldo_destino_nuevo: nuevoSaldoDestino
        }
      }, { transaction });

      await transaction.commit();

      return {
        transaccion: transaccionCreada,
        cuenta_origen: {
          numero_cuenta: cuentaOrigen.numero_cuenta,
          saldo_anterior: cuentaOrigen.saldo,
          saldo_nuevo: nuevoSaldoOrigen
        },
        cuenta_destino: {
          numero_cuenta: cuentaDestino.numero_cuenta,
          saldo_anterior: cuentaDestino.saldo,
          saldo_nuevo: nuevoSaldoDestino
        }
      };
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  }
};

module.exports = transaccionService;
