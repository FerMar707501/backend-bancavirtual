const db = require('../../models');
const responseHelper = require('../../utils/responseHelper');
const { Op } = require('sequelize');

const agenciaController = {
  // Listar todas las agencias
  async listar(req, res) {
    try {
      const { estado, busqueda } = req.query;

      const where = {};

      if (estado) {
        where.estado = estado;
      }

      if (busqueda) {
        where[Op.or] = [
          { codigo_agencia: { [Op.like]: `%${busqueda}%` } },
          { nombre: { [Op.like]: `%${busqueda}%` } },
          { direccion: { [Op.like]: `%${busqueda}%` } }
        ];
      }

      const agencias = await db.Agencia.findAll({
        where,
        order: [['nombre', 'ASC']]
      });

      return responseHelper.success(res, agencias, 'Agencias obtenidas exitosamente');
    } catch (error) {
      console.error('Error al listar agencias:', error);
      return responseHelper.error(res, 'Error al obtener agencias', 500);
    }
  },

  // Obtener una agencia por ID
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const agencia = await db.Agencia.findByPk(id, {
        include: [
          {
            model: db.Cuenta,
            as: 'cuentas',
            attributes: ['id_cuenta', 'numero_cuenta', 'saldo', 'estado'],
            limit: 10
          },
          {
            model: db.Usuario,
            as: 'usuarios',
            attributes: ['id_usuario', 'username', 'nombre_completo', 'estado'],
            limit: 10
          }
        ]
      });

      if (!agencia) {
        return responseHelper.error(res, 'Agencia no encontrada', 404);
      }

      return responseHelper.success(res, agencia, 'Agencia obtenida exitosamente');
    } catch (error) {
      console.error('Error al obtener agencia:', error);
      return responseHelper.error(res, 'Error al obtener agencia', 500);
    }
  },

  // Crear nueva agencia
  async crear(req, res) {
    try {
      const { codigo_agencia, nombre, direccion, telefono } = req.body;

      // Validar campos requeridos
      if (!codigo_agencia || !nombre || !direccion) {
        return responseHelper.error(res, 'Código, nombre y dirección son requeridos', 400);
      }

      // Verificar si el código ya existe
      const agenciaExistente = await db.Agencia.findOne({
        where: { codigo_agencia }
      });

      if (agenciaExistente) {
        return responseHelper.error(res, 'El código de agencia ya existe', 400);
      }

      const nuevaAgencia = await db.Agencia.create({
        codigo_agencia,
        nombre,
        direccion,
        telefono,
        estado: 'activo'
      });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: req.usuario.id_usuario,
        accion: 'CREAR_AGENCIA',
        descripcion: `Agencia creada: ${nombre} (${codigo_agencia})`,
        ip: req.ip,
        datos_adicionales: JSON.stringify({ id_agencia: nuevaAgencia.id_agencia })
      });

      return responseHelper.success(res, nuevaAgencia, 'Agencia creada exitosamente', 201);
    } catch (error) {
      console.error('Error al crear agencia:', error);
      return responseHelper.error(res, 'Error al crear agencia', 500);
    }
  },

  // Actualizar agencia
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { nombre, direccion, telefono } = req.body;

      const agencia = await db.Agencia.findByPk(id);

      if (!agencia) {
        return responseHelper.error(res, 'Agencia no encontrada', 404);
      }

      await agencia.update({
        nombre: nombre || agencia.nombre,
        direccion: direccion || agencia.direccion,
        telefono: telefono !== undefined ? telefono : agencia.telefono
      });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: req.usuario.id_usuario,
        accion: 'ACTUALIZAR_AGENCIA',
        descripcion: `Agencia actualizada: ${agencia.nombre}`,
        ip: req.ip,
        datos_adicionales: JSON.stringify({ id_agencia: id })
      });

      return responseHelper.success(res, agencia, 'Agencia actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar agencia:', error);
      return responseHelper.error(res, 'Error al actualizar agencia', 500);
    }
  },

  // Cambiar estado de agencia
  async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!['activo', 'inactivo'].includes(estado)) {
        return responseHelper.error(res, 'Estado no válido', 400);
      }

      const agencia = await db.Agencia.findByPk(id);

      if (!agencia) {
        return responseHelper.error(res, 'Agencia no encontrada', 404);
      }

      await agencia.update({ estado });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: req.usuario.id_usuario,
        accion: 'CAMBIAR_ESTADO_AGENCIA',
        descripcion: `Estado de agencia ${agencia.nombre} cambiado a: ${estado}`,
        ip: req.ip,
        datos_adicionales: JSON.stringify({ id_agencia: id, estado })
      });

      return responseHelper.success(res, agencia, `Agencia ${estado === 'activo' ? 'activada' : 'inactivada'} exitosamente`);
    } catch (error) {
      console.error('Error al cambiar estado de agencia:', error);
      return responseHelper.error(res, 'Error al cambiar estado de agencia', 500);
    }
  }
};

module.exports = agenciaController;
