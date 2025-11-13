const db = require('../../models');
const responseHelper = require('../../utils/responseHelper');
const { Op } = require('sequelize');

const clienteController = {
  // Listar todos los clientes
  async listar(req, res) {
    try {
      const { busqueda, estado_cliente, estado_kyc } = req.query;

      // Construir filtros
      const where = {};
      
      if (busqueda) {
        where[Op.or] = [
          { primer_nombre: { [Op.like]: `%${busqueda}%` } },
          { primer_apellido: { [Op.like]: `%${busqueda}%` } },
          { dpi: { [Op.like]: `%${busqueda}%` } },
          { nit: { [Op.like]: `%${busqueda}%` } },
          { correo: { [Op.like]: `%${busqueda}%` } }
        ];
      }

      if (estado_cliente) {
        where.estado_cliente = estado_cliente;
      }

      if (estado_kyc) {
        where.estado_kyc = estado_kyc;
      }

      const clientes = await db.Cliente.findAll({
        where,
        include: [
          {
            model: db.TelefonoCliente,
            as: 'telefonos'
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return responseHelper.success(res, clientes, 'Clientes obtenidos exitosamente');
    } catch (error) {
      console.error('Error al listar clientes:', error);
      return responseHelper.error(res, 'Error al obtener clientes', 500);
    }
  },

  // Obtener cliente por ID
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const cliente = await db.Cliente.findByPk(id, {
        include: [
          {
            model: db.TelefonoCliente,
            as: 'telefonos'
          },
          {
            model: db.Cuenta,
            as: 'cuentas',
            include: [
              {
                model: db.TipoCuenta,
                as: 'tipoCuenta'
              },
              {
                model: db.Agencia,
                as: 'agencia'
              }
            ]
          },
          {
            model: db.Prestamo,
            as: 'prestamos',
            include: [
              {
                model: db.TipoPrestamo,
                as: 'tipoPrestamo'
              }
            ]
          }
        ]
      });

      if (!cliente) {
        return responseHelper.error(res, 'Cliente no encontrado', 404);
      }

      return responseHelper.success(res, cliente, 'Cliente obtenido exitosamente');
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      return responseHelper.error(res, 'Error al obtener cliente', 500);
    }
  },

  // Crear nuevo cliente
  async crear(req, res) {
    const transaction = await db.sequelize.transaction();
    
    try {
      const {
        dpi,
        nit,
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido,
        direccion,
        correo,
        telefonos
      } = req.body;

      // Validar campos requeridos
      if (!dpi || !nit || !primer_nombre || !primer_apellido || !direccion || !correo) {
        await transaction.rollback();
        return responseHelper.error(res, 'Faltan campos requeridos', 400);
      }

      // Crear cliente
      const cliente = await db.Cliente.create({
        dpi,
        nit,
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido,
        direccion,
        correo,
        estado_kyc: 'pendiente',
        estado_cliente: 'activo'
      }, { transaction });

      // Crear teléfonos si se proporcionaron
      if (telefonos && Array.isArray(telefonos) && telefonos.length > 0) {
        const telefonosData = telefonos.map(tel => ({
          id_cliente: cliente.id_cliente,
          numero_telefono: tel.numero_telefono,
          tipo: tel.tipo || 'movil',
          principal: tel.principal || false
        }));

        await db.TelefonoCliente.bulkCreate(telefonosData, { transaction });
      }

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: req.user.id_usuario,
        accion: 'CREAR_CLIENTE',
        modulo: 'clientes',
        descripcion: `Cliente creado: ${primer_nombre} ${primer_apellido} (DPI: ${dpi})`,
        ip_address: req.ip,
        datos_adicionales: { id_cliente: cliente.id_cliente }
      }, { transaction });

      await transaction.commit();

      // Obtener cliente con relaciones
      const clienteCreado = await db.Cliente.findByPk(cliente.id_cliente, {
        include: [{ model: db.TelefonoCliente, as: 'telefonos' }]
      });

      return responseHelper.success(res, clienteCreado, 'Cliente creado exitosamente', 201);
    } catch (error) {
      await transaction.rollback();
      console.error('Error al crear cliente:', error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return responseHelper.error(res, 'El DPI, NIT o correo ya existe', 409);
      }
      return responseHelper.error(res, 'Error al crear cliente', 500);
    }
  },

  // Actualizar cliente
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const {
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido,
        direccion,
        correo
      } = req.body;

      const cliente = await db.Cliente.findByPk(id);

      if (!cliente) {
        return responseHelper.error(res, 'Cliente no encontrado', 404);
      }

      // Actualizar campos
      await cliente.update({
        primer_nombre: primer_nombre || cliente.primer_nombre,
        segundo_nombre: segundo_nombre !== undefined ? segundo_nombre : cliente.segundo_nombre,
        primer_apellido: primer_apellido || cliente.primer_apellido,
        segundo_apellido: segundo_apellido !== undefined ? segundo_apellido : cliente.segundo_apellido,
        direccion: direccion || cliente.direccion,
        correo: correo || cliente.correo
      });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: req.user.id_usuario,
        accion: 'ACTUALIZAR_CLIENTE',
        modulo: 'clientes',
        descripcion: `Cliente actualizado: ${cliente.primer_nombre} ${cliente.primer_apellido}`,
        ip_address: req.ip,
        datos_adicionales: { id_cliente: id }
      });

      // Obtener cliente actualizado con relaciones
      const clienteActualizado = await db.Cliente.findByPk(id, {
        include: [{ model: db.TelefonoCliente, as: 'telefonos' }]
      });

      return responseHelper.success(res, clienteActualizado, 'Cliente actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return responseHelper.error(res, 'El correo ya existe', 409);
      }
      return responseHelper.error(res, 'Error al actualizar cliente', 500);
    }
  },

  // Cambiar estado del cliente
  async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado_cliente } = req.body;

      if (!['activo', 'inactivo'].includes(estado_cliente)) {
        return responseHelper.error(res, 'Estado inválido', 400);
      }

      const cliente = await db.Cliente.findByPk(id);

      if (!cliente) {
        return responseHelper.error(res, 'Cliente no encontrado', 404);
      }

      await cliente.update({ estado_cliente });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: req.user.id_usuario,
        accion: 'CAMBIAR_ESTADO_CLIENTE',
        modulo: 'clientes',
        descripcion: `Estado de cliente ${cliente.primer_nombre} ${cliente.primer_apellido} cambiado a: ${estado_cliente}`,
        ip_address: req.ip,
        datos_adicionales: { id_cliente: id, nuevo_estado: estado_cliente }
      });

      return responseHelper.success(res, { estado_cliente }, 'Estado actualizado exitosamente');
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      return responseHelper.error(res, 'Error al cambiar estado', 500);
    }
  },

  // Actualizar estado KYC
  async actualizarKYC(req, res) {
    try {
      const { id } = req.params;
      const { estado_kyc } = req.body;

      if (!['pendiente', 'verificado', 'rechazado'].includes(estado_kyc)) {
        return responseHelper.error(res, 'Estado KYC inválido', 400);
      }

      const cliente = await db.Cliente.findByPk(id);

      if (!cliente) {
        return responseHelper.error(res, 'Cliente no encontrado', 404);
      }

      await cliente.update({ estado_kyc });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: req.user.id_usuario,
        accion: 'ACTUALIZAR_KYC',
        modulo: 'clientes',
        descripcion: `KYC de cliente ${cliente.primer_nombre} ${cliente.primer_apellido} cambiado a: ${estado_kyc}`,
        ip_address: req.ip,
        datos_adicionales: { id_cliente: id, nuevo_estado_kyc: estado_kyc }
      });

      return responseHelper.success(res, { estado_kyc }, 'Estado KYC actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar KYC:', error);
      return responseHelper.error(res, 'Error al actualizar KYC', 500);
    }
  },

  // Agregar teléfono
  async agregarTelefono(req, res) {
    try {
      const { id } = req.params;
      const { numero_telefono, tipo, principal } = req.body;

      if (!numero_telefono) {
        return responseHelper.error(res, 'Número de teléfono requerido', 400);
      }

      const cliente = await db.Cliente.findByPk(id);

      if (!cliente) {
        return responseHelper.error(res, 'Cliente no encontrado', 404);
      }

      const telefono = await db.TelefonoCliente.create({
        id_cliente: id,
        numero_telefono,
        tipo: tipo || 'movil',
        principal: principal || false
      });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: req.user.id_usuario,
        accion: 'AGREGAR_TELEFONO',
        modulo: 'clientes',
        descripcion: `Teléfono agregado al cliente ${cliente.primer_nombre} ${cliente.primer_apellido}`,
        ip_address: req.ip,
        datos_adicionales: { id_cliente: id, id_telefono: telefono.id_telefono }
      });

      return responseHelper.success(res, telefono, 'Teléfono agregado exitosamente', 201);
    } catch (error) {
      console.error('Error al agregar teléfono:', error);
      return responseHelper.error(res, 'Error al agregar teléfono', 500);
    }
  },

  // Eliminar teléfono
  async eliminarTelefono(req, res) {
    try {
      const { id, idTelefono } = req.params;

      const telefono = await db.TelefonoCliente.findOne({
        where: {
          id_telefono: idTelefono,
          id_cliente: id
        }
      });

      if (!telefono) {
        return responseHelper.error(res, 'Teléfono no encontrado', 404);
      }

      await telefono.destroy();

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: req.user.id_usuario,
        accion: 'ELIMINAR_TELEFONO',
        modulo: 'clientes',
        descripcion: `Teléfono eliminado del cliente ID ${id}`,
        ip_address: req.ip,
        datos_adicionales: { id_cliente: id, id_telefono: idTelefono }
      });

      return responseHelper.success(res, null, 'Teléfono eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar teléfono:', error);
      return responseHelper.error(res, 'Error al eliminar teléfono', 500);
    }
  }
};

module.exports = clienteController;
