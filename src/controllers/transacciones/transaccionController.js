const db = require('../../models');
const responseHelper = require('../../utils/responseHelper');
const transaccionService = require('../../services/transacciones/transaccionService');
const { Op } = require('sequelize');

const transaccionController = {
  // Listar transacciones
  async listar(req, res) {
    try {
      const { 
        id_cuenta, 
        tipo, 
        estado, 
        fecha_inicio, 
        fecha_fin,
        limit = 50 
      } = req.query;

      const where = {};

      // Filtrar por cuenta (origen o destino)
      if (id_cuenta) {
        where[Op.or] = [
          { id_cuenta_origen: id_cuenta },
          { id_cuenta_destino: id_cuenta }
        ];
      }

      // Filtrar por tipo de transacción
      if (tipo) {
        const tipoTransaccion = await db.TipoTransaccion.findOne({
          where: { codigo: tipo }
        });
        if (tipoTransaccion) {
          where.id_tipo_transaccion = tipoTransaccion.id_tipo_transaccion;
        }
      }

      // Filtrar por estado
      if (estado) {
        where.estado = estado;
      }

      // Filtrar por rango de fechas
      if (fecha_inicio || fecha_fin) {
        where.fecha_transaccion = {};
        if (fecha_inicio) {
          where.fecha_transaccion[Op.gte] = new Date(fecha_inicio);
        }
        if (fecha_fin) {
          where.fecha_transaccion[Op.lte] = new Date(fecha_fin);
        }
      }

      const transacciones = await db.Transaccion.findAll({
        where,
        include: [
          {
            model: db.TipoTransaccion,
            as: 'tipoTransaccion'
          },
          {
            model: db.Cuenta,
            as: 'cuentaOrigen',
            include: [
              {
                model: db.Cliente,
                as: 'cliente',
                attributes: ['id_cliente', 'primer_nombre', 'primer_apellido']
              }
            ]
          },
          {
            model: db.Cuenta,
            as: 'cuentaDestino',
            include: [
              {
                model: db.Cliente,
                as: 'cliente',
                attributes: ['id_cliente', 'primer_nombre', 'primer_apellido']
              }
            ]
          },
          {
            model: db.Usuario,
            as: 'usuario',
            attributes: ['id_usuario', 'username', 'nombre_completo']
          },
          {
            model: db.Agencia,
            as: 'agencia',
            attributes: ['id_agencia', 'nombre']
          }
        ],
        order: [['fecha_transaccion', 'DESC']],
        limit: parseInt(limit)
      });

      return responseHelper.success(res, transacciones, 'Transacciones obtenidas exitosamente');
    } catch (error) {
      console.error('Error al listar transacciones:', error);
      return responseHelper.error(res, 'Error al obtener transacciones', 500);
    }
  },

  // Obtener transacción por ID
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const transaccion = await db.Transaccion.findByPk(id, {
        include: [
          {
            model: db.TipoTransaccion,
            as: 'tipoTransaccion'
          },
          {
            model: db.Cuenta,
            as: 'cuentaOrigen',
            include: [
              {
                model: db.Cliente,
                as: 'cliente'
              },
              {
                model: db.TipoCuenta,
                as: 'tipoCuenta'
              }
            ]
          },
          {
            model: db.Cuenta,
            as: 'cuentaDestino',
            include: [
              {
                model: db.Cliente,
                as: 'cliente'
              },
              {
                model: db.TipoCuenta,
                as: 'tipoCuenta'
              }
            ]
          },
          {
            model: db.Usuario,
            as: 'usuario',
            attributes: ['id_usuario', 'username', 'nombre_completo']
          },
          {
            model: db.Agencia,
            as: 'agencia'
          }
        ]
      });

      if (!transaccion) {
        return responseHelper.error(res, 'Transacción no encontrada', 404);
      }

      return responseHelper.success(res, transaccion, 'Transacción obtenida exitosamente');
    } catch (error) {
      console.error('Error al obtener transacción:', error);
      return responseHelper.error(res, 'Error al obtener transacción', 500);
    }
  },

  // Realizar depósito
  async deposito(req, res) {
    try {
      const { id_cuenta, monto, descripcion } = req.body;

      // Validaciones
      if (!id_cuenta || !monto) {
        return responseHelper.error(res, 'Faltan campos requeridos', 400);
      }

      if (parseFloat(monto) <= 0) {
        return responseHelper.error(res, 'El monto debe ser mayor a 0', 400);
      }

      // Realizar depósito
      const resultado = await transaccionService.deposito(
        id_cuenta,
        monto,
        descripcion,
        req.user.id_usuario,
        req.user.id_agencia || 1,
        req.ip
      );

      // Obtener transacción completa
      const transaccion = await db.Transaccion.findByPk(resultado.transaccion.id_transaccion, {
        include: [
          {
            model: db.TipoTransaccion,
            as: 'tipoTransaccion'
          },
          {
            model: db.Cuenta,
            as: 'cuentaDestino',
            include: [{ model: db.Cliente, as: 'cliente' }]
          }
        ]
      });

      return responseHelper.success(res, {
        transaccion,
        saldo_anterior: resultado.saldo_anterior,
        saldo_nuevo: resultado.saldo_nuevo
      }, 'Depósito realizado exitosamente', 201);
    } catch (error) {
      console.error('Error al realizar depósito:', error);
      return responseHelper.error(res, error.message || 'Error al realizar depósito', 500);
    }
  },

  // Realizar retiro
  async retiro(req, res) {
    try {
      const { id_cuenta, monto, descripcion } = req.body;

      // Validaciones
      if (!id_cuenta || !monto) {
        return responseHelper.error(res, 'Faltan campos requeridos', 400);
      }

      if (parseFloat(monto) <= 0) {
        return responseHelper.error(res, 'El monto debe ser mayor a 0', 400);
      }

      // Realizar retiro
      const resultado = await transaccionService.retiro(
        id_cuenta,
        monto,
        descripcion,
        req.user.id_usuario,
        req.user.id_agencia || 1,
        req.ip
      );

      // Obtener transacción completa
      const transaccion = await db.Transaccion.findByPk(resultado.transaccion.id_transaccion, {
        include: [
          {
            model: db.TipoTransaccion,
            as: 'tipoTransaccion'
          },
          {
            model: db.Cuenta,
            as: 'cuentaOrigen',
            include: [{ model: db.Cliente, as: 'cliente' }]
          }
        ]
      });

      return responseHelper.success(res, {
        transaccion,
        saldo_anterior: resultado.saldo_anterior,
        saldo_nuevo: resultado.saldo_nuevo
      }, 'Retiro realizado exitosamente', 201);
    } catch (error) {
      console.error('Error al realizar retiro:', error);
      return responseHelper.error(res, error.message || 'Error al realizar retiro', 500);
    }
  },

  // Realizar transferencia
  async transferencia(req, res) {
    try {
      const { id_cuenta_origen, id_cuenta_destino, monto, descripcion } = req.body;

      // Validaciones
      if (!id_cuenta_origen || !id_cuenta_destino || !monto) {
        return responseHelper.error(res, 'Faltan campos requeridos', 400);
      }

      if (parseFloat(monto) <= 0) {
        return responseHelper.error(res, 'El monto debe ser mayor a 0', 400);
      }

      // Realizar transferencia
      const resultado = await transaccionService.transferencia(
        id_cuenta_origen,
        id_cuenta_destino,
        monto,
        descripcion,
        req.user.id_usuario,
        req.user.id_agencia || 1,
        req.ip
      );

      // Obtener transacción completa
      const transaccion = await db.Transaccion.findByPk(resultado.transaccion.id_transaccion, {
        include: [
          {
            model: db.TipoTransaccion,
            as: 'tipoTransaccion'
          },
          {
            model: db.Cuenta,
            as: 'cuentaOrigen',
            include: [{ model: db.Cliente, as: 'cliente' }]
          },
          {
            model: db.Cuenta,
            as: 'cuentaDestino',
            include: [{ model: db.Cliente, as: 'cliente' }]
          }
        ]
      });

      return responseHelper.success(res, {
        transaccion,
        cuenta_origen: resultado.cuenta_origen,
        cuenta_destino: resultado.cuenta_destino
      }, 'Transferencia realizada exitosamente', 201);
    } catch (error) {
      console.error('Error al realizar transferencia:', error);
      return responseHelper.error(res, error.message || 'Error al realizar transferencia', 500);
    }
  },

  // Obtener historial de una cuenta
  async historialCuenta(req, res) {
    try {
      const { id_cuenta } = req.params;
      const { limit = 50 } = req.query;

      // Verificar que la cuenta existe
      const cuenta = await db.Cuenta.findByPk(id_cuenta);
      if (!cuenta) {
        return responseHelper.error(res, 'Cuenta no encontrada', 404);
      }

      const transacciones = await db.Transaccion.findAll({
        where: {
          [Op.or]: [
            { id_cuenta_origen: id_cuenta },
            { id_cuenta_destino: id_cuenta }
          ]
        },
        include: [
          {
            model: db.TipoTransaccion,
            as: 'tipoTransaccion'
          },
          {
            model: db.Cuenta,
            as: 'cuentaOrigen',
            attributes: ['numero_cuenta']
          },
          {
            model: db.Cuenta,
            as: 'cuentaDestino',
            attributes: ['numero_cuenta']
          }
        ],
        order: [['fecha_transaccion', 'DESC']],
        limit: parseInt(limit)
      });

      return responseHelper.success(res, transacciones, 'Historial obtenido exitosamente');
    } catch (error) {
      console.error('Error al obtener historial:', error);
      return responseHelper.error(res, 'Error al obtener historial', 500);
    }
  }
};

module.exports = transaccionController;
