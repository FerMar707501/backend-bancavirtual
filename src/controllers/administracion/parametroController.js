const db = require('../../models');
const responseHelper = require('../../utils/responseHelper');

const parametroController = {
  // Listar todos los parámetros del sistema
  async listar(req, res) {
    try {
      const { categoria } = req.query;

      const where = {};
      if (categoria) {
        where.categoria = categoria;
      }

      const parametros = await db.ParametroSistema.findAll({
        where,
        order: [['categoria', 'ASC'], ['clave', 'ASC']]
      });

      return responseHelper.success(res, parametros, 'Parámetros obtenidos exitosamente');
    } catch (error) {
      console.error('Error al listar parámetros:', error);
      return responseHelper.error(res, 'Error al obtener parámetros', 500);
    }
  },

  // Obtener parámetro por clave
  async obtenerPorClave(req, res) {
    try {
      const { clave } = req.params;

      const parametro = await db.ParametroSistema.findOne({
        where: { clave }
      });

      if (!parametro) {
        return responseHelper.error(res, 'Parámetro no encontrado', 404);
      }

      return responseHelper.success(res, parametro, 'Parámetro obtenido exitosamente');
    } catch (error) {
      console.error('Error al obtener parámetro:', error);
      return responseHelper.error(res, 'Error al obtener parámetro', 500);
    }
  },

  // Actualizar valor de parámetro
  async actualizar(req, res) {
    try {
      const { clave } = req.params;
      const { valor, descripcion } = req.body;

      if (!valor) {
        return responseHelper.error(res, 'El valor es requerido', 400);
      }

      const parametro = await db.ParametroSistema.findOne({
        where: { clave }
      });

      if (!parametro) {
        return responseHelper.error(res, 'Parámetro no encontrado', 404);
      }

      const valorAnterior = parametro.valor;

      await parametro.update({
        valor,
        descripcion: descripcion || parametro.descripcion
      });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: req.usuario.id_usuario,
        accion: 'ACTUALIZAR_PARAMETRO',
        descripcion: `Parámetro ${clave} actualizado: ${valorAnterior} → ${valor}`,
        ip: req.ip,
        datos_adicionales: JSON.stringify({
          clave,
          valor_anterior: valorAnterior,
          valor_nuevo: valor
        })
      });

      return responseHelper.success(res, parametro, 'Parámetro actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar parámetro:', error);
      return responseHelper.error(res, 'Error al actualizar parámetro', 500);
    }
  },

  // Crear nuevo parámetro
  async crear(req, res) {
    try {
      const { clave, valor, descripcion, categoria } = req.body;

      if (!clave || !valor || !categoria) {
        return responseHelper.error(res, 'Clave, valor y categoría son requeridos', 400);
      }

      // Verificar si ya existe
      const parametroExistente = await db.ParametroSistema.findOne({
        where: { clave }
      });

      if (parametroExistente) {
        return responseHelper.error(res, 'La clave del parámetro ya existe', 400);
      }

      const nuevoParametro = await db.ParametroSistema.create({
        clave,
        valor,
        descripcion,
        categoria
      });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: req.usuario.id_usuario,
        accion: 'CREAR_PARAMETRO',
        descripcion: `Parámetro creado: ${clave} = ${valor}`,
        ip: req.ip,
        datos_adicionales: JSON.stringify({ clave, valor, categoria })
      });

      return responseHelper.success(res, nuevoParametro, 'Parámetro creado exitosamente', 201);
    } catch (error) {
      console.error('Error al crear parámetro:', error);
      return responseHelper.error(res, 'Error al crear parámetro', 500);
    }
  }
};

module.exports = parametroController;
