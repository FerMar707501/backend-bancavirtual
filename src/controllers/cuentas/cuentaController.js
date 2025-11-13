const db = require('../../models');
const responseHelper = require('../../utils/responseHelper');
const { generateAccountNumber } = require('../../utils/generators');
const { Op } = require('sequelize');

const cuentaController = {
  // Listar todas las cuentas
  async listar(req, res) {
    try {
      const { id_cliente, estado, busqueda } = req.query;

      const where = {};

      if (id_cliente) {
        where.id_cliente = id_cliente;
      }

      if (estado) {
        where.estado = estado;
      }

      if (busqueda) {
        where.numero_cuenta = { [Op.like]: `%${busqueda}%` };
      }

      const cuentas = await db.Cuenta.findAll({
        where,
        include: [
          {
            model: db.Cliente,
            as: 'cliente',
            attributes: ['id_cliente', 'primer_nombre', 'primer_apellido', 'dpi']
          },
          {
            model: db.TipoCuenta,
            as: 'tipoCuenta'
          },
          {
            model: db.Agencia,
            as: 'agencia'
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return responseHelper.success(res, cuentas, 'Cuentas obtenidas exitosamente');
    } catch (error) {
      console.error('Error al listar cuentas:', error);
      return responseHelper.error(res, 'Error al obtener cuentas', 500);
    }
  },

  // Obtener cuenta por ID
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const cuenta = await db.Cuenta.findByPk(id, {
        include: [
          {
            model: db.Cliente,
            as: 'cliente',
            include: [
              {
                model: db.TelefonoCliente,
                as: 'telefonos'
              }
            ]
          },
          {
            model: db.TipoCuenta,
            as: 'tipoCuenta'
          },
          {
            model: db.Agencia,
            as: 'agencia'
          }
        ]
      });

      if (!cuenta) {
        return responseHelper.error(res, 'Cuenta no encontrada', 404);
      }

      return responseHelper.success(res, cuenta, 'Cuenta obtenida exitosamente');
    } catch (error) {
      console.error('Error al obtener cuenta:', error);
      return responseHelper.error(res, 'Error al obtener cuenta', 500);
    }
  },

  // Obtener cuenta por número
  async obtenerPorNumero(req, res) {
    try {
      const { numero_cuenta } = req.params;

      const cuenta = await db.Cuenta.findOne({
        where: { numero_cuenta },
        include: [
          {
            model: db.Cliente,
            as: 'cliente'
          },
          {
            model: db.TipoCuenta,
            as: 'tipoCuenta'
          },
          {
            model: db.Agencia,
            as: 'agencia'
          }
        ]
      });

      if (!cuenta) {
        return responseHelper.error(res, 'Cuenta no encontrada', 404);
      }

      return responseHelper.success(res, cuenta, 'Cuenta obtenida exitosamente');
    } catch (error) {
      console.error('Error al obtener cuenta:', error);
      return responseHelper.error(res, 'Error al obtener cuenta', 500);
    }
  },

  // Crear nueva cuenta
  async crear(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
      const { id_cliente, id_tipo_cuenta, id_agencia, saldo_inicial } = req.body;

      // Validar campos requeridos
      if (!id_cliente || !id_tipo_cuenta || !id_agencia) {
        await transaction.rollback();
        return responseHelper.error(res, 'Faltan campos requeridos', 400);
      }

      // Verificar que el cliente existe y está activo
      const cliente = await db.Cliente.findByPk(id_cliente);
      if (!cliente) {
        await transaction.rollback();
        return responseHelper.error(res, 'Cliente no encontrado', 404);
      }

      if (cliente.estado_cliente !== 'activo') {
        await transaction.rollback();
        return responseHelper.error(res, 'El cliente no está activo', 400);
      }

      // Verificar que el tipo de cuenta existe
      const tipoCuenta = await db.TipoCuenta.findByPk(id_tipo_cuenta);
      if (!tipoCuenta) {
        await transaction.rollback();
        return responseHelper.error(res, 'Tipo de cuenta no encontrado', 404);
      }

      if (tipoCuenta.estado !== 'activo') {
        await transaction.rollback();
        return responseHelper.error(res, 'El tipo de cuenta no está activo', 400);
      }

      // Generar número de cuenta único
      let numero_cuenta;
      let exists = true;
      let attempts = 0;

      while (exists && attempts < 10) {
        numero_cuenta = generateAccountNumber();
        const existingCuenta = await db.Cuenta.findOne({ 
          where: { numero_cuenta },
          transaction 
        });
        exists = !!existingCuenta;
        attempts++;
      }

      if (exists) {
        await transaction.rollback();
        return responseHelper.error(res, 'No se pudo generar número de cuenta único', 500);
      }

      // Crear cuenta
      const cuenta = await db.Cuenta.create({
        numero_cuenta,
        id_cliente,
        id_tipo_cuenta,
        id_agencia: id_agencia,
        saldo: saldo_inicial || 0.00,
        fecha_apertura: new Date(),
        estado: 'activa'
      }, { transaction });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: req.user.id_usuario,
        accion: 'CREAR_CUENTA',
        modulo: 'cuentas',
        descripcion: `Cuenta creada: ${numero_cuenta} para cliente ${cliente.primer_nombre} ${cliente.primer_apellido}`,
        ip_address: req.ip,
        datos_adicionales: {
          id_cuenta: cuenta.id_cuenta,
          numero_cuenta,
          id_cliente
        }
      }, { transaction });

      await transaction.commit();

      // Obtener cuenta con relaciones
      const cuentaCreada = await db.Cuenta.findByPk(cuenta.id_cuenta, {
        include: [
          { model: db.Cliente, as: 'cliente' },
          { model: db.TipoCuenta, as: 'tipoCuenta' },
          { model: db.Agencia, as: 'agencia' }
        ]
      });

      return responseHelper.success(res, cuentaCreada, 'Cuenta creada exitosamente', 201);
    } catch (error) {
      await transaction.rollback();
      console.error('Error al crear cuenta:', error);
      return responseHelper.error(res, 'Error al crear cuenta', 500);
    }
  },

  // Bloquear/Desbloquear cuenta
  async bloquear(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      const cuenta = await db.Cuenta.findByPk(id, {
        include: [{ model: db.Cliente, as: 'cliente' }]
      });

      if (!cuenta) {
        return responseHelper.error(res, 'Cuenta no encontrada', 404);
      }

      const nuevoEstado = cuenta.estado === 'activa' ? 'bloqueada' : 'activa';
      await cuenta.update({ estado: nuevoEstado });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: req.user.id_usuario,
        accion: nuevoEstado === 'bloqueada' ? 'BLOQUEAR_CUENTA' : 'DESBLOQUEAR_CUENTA',
        modulo: 'cuentas',
        descripcion: `Cuenta ${cuenta.numero_cuenta} ${nuevoEstado}. Motivo: ${motivo || 'No especificado'}`,
        ip_address: req.ip,
        datos_adicionales: {
          id_cuenta: id,
          nuevo_estado: nuevoEstado,
          motivo
        }
      });

      return responseHelper.success(res, { estado: nuevoEstado }, `Cuenta ${nuevoEstado} exitosamente`);
    } catch (error) {
      console.error('Error al bloquear/desbloquear cuenta:', error);
      return responseHelper.error(res, 'Error al cambiar estado de cuenta', 500);
    }
  },

  // Cerrar cuenta
  async cerrar(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      const cuenta = await db.Cuenta.findByPk(id, {
        include: [{ model: db.Cliente, as: 'cliente' }]
      });

      if (!cuenta) {
        return responseHelper.error(res, 'Cuenta no encontrada', 404);
      }

      if (cuenta.estado === 'cerrada') {
        return responseHelper.error(res, 'La cuenta ya está cerrada', 400);
      }

      // Verificar que el saldo sea 0
      if (parseFloat(cuenta.saldo) !== 0) {
        return responseHelper.error(res, 'No se puede cerrar una cuenta con saldo diferente a 0', 400);
      }

      await cuenta.update({ estado: 'cerrada' });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: req.user.id_usuario,
        accion: 'CERRAR_CUENTA',
        modulo: 'cuentas',
        descripcion: `Cuenta ${cuenta.numero_cuenta} cerrada. Motivo: ${motivo || 'No especificado'}`,
        ip_address: req.ip,
        datos_adicionales: {
          id_cuenta: id,
          motivo
        }
      });

      return responseHelper.success(res, null, 'Cuenta cerrada exitosamente');
    } catch (error) {
      console.error('Error al cerrar cuenta:', error);
      return responseHelper.error(res, 'Error al cerrar cuenta', 500);
    }
  },

  // Consultar saldo
  async consultarSaldo(req, res) {
    try {
      const { id } = req.params;

      const cuenta = await db.Cuenta.findByPk(id, {
        attributes: ['id_cuenta', 'numero_cuenta', 'saldo', 'estado'],
        include: [
          {
            model: db.Cliente,
            as: 'cliente',
            attributes: ['id_cliente', 'primer_nombre', 'primer_apellido']
          },
          {
            model: db.TipoCuenta,
            as: 'tipoCuenta',
            attributes: ['nombre', 'tasa_interes']
          }
        ]
      });

      if (!cuenta) {
        return responseHelper.error(res, 'Cuenta no encontrada', 404);
      }

      if (cuenta.estado !== 'activa') {
        return responseHelper.error(res, `La cuenta está ${cuenta.estado}`, 400);
      }

      return responseHelper.success(res, cuenta, 'Saldo consultado exitosamente');
    } catch (error) {
      console.error('Error al consultar saldo:', error);
      return responseHelper.error(res, 'Error al consultar saldo', 500);
    }
  },

  // Obtener cuentas del cliente autenticado
  async misCuentas(req, res) {
    try {
      // Obtener el usuario completo para tener acceso al correo
      const usuario = await db.Usuario.findByPk(req.user.id_usuario);
      
      if (!usuario) {
        return responseHelper.error(res, 'Usuario no encontrado', 404);
      }

      // Buscar el cliente asociado al usuario por correo
      const cliente = await db.Cliente.findOne({
        where: { correo: usuario.correo }
      });

      if (!cliente) {
        return responseHelper.error(res, 'No se encontró información del cliente', 404);
      }

      // Obtener las cuentas del cliente
      const cuentas = await db.Cuenta.findAll({
        where: { 
          id_cliente: cliente.id_cliente,
          estado: { [Op.in]: ['activa', 'bloqueada'] }
        },
        include: [
          {
            model: db.TipoCuenta,
            as: 'tipoCuenta'
          },
          {
            model: db.Agencia,
            as: 'agencia'
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return responseHelper.success(res, { cuentas }, 'Cuentas obtenidas exitosamente');
    } catch (error) {
      console.error('Error al obtener mis cuentas:', error);
      return responseHelper.error(res, 'Error al obtener cuentas', 500);
    }
  }
};

module.exports = cuentaController;
