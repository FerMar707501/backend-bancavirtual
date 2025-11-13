const db = require('../../models');
const responseHelper = require('../../utils/responseHelper');

const tipoCuentaController = {
  // Listar todos los tipos de cuenta
  async listar(req, res) {
    try {
      const { estado } = req.query;

      const where = {};
      if (estado) {
        where.estado = estado;
      }

      const tiposCuenta = await db.TipoCuenta.findAll({
        where,
        order: [['nombre', 'ASC']]
      });

      return responseHelper.success(res, tiposCuenta, 'Tipos de cuenta obtenidos exitosamente');
    } catch (error) {
      console.error('Error al listar tipos de cuenta:', error);
      return responseHelper.error(res, 'Error al obtener tipos de cuenta', 500);
    }
  },

  // Obtener tipo de cuenta por ID
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const tipoCuenta = await db.TipoCuenta.findByPk(id);

      if (!tipoCuenta) {
        return responseHelper.error(res, 'Tipo de cuenta no encontrado', 404);
      }

      return responseHelper.success(res, tipoCuenta, 'Tipo de cuenta obtenido exitosamente');
    } catch (error) {
      console.error('Error al obtener tipo de cuenta:', error);
      return responseHelper.error(res, 'Error al obtener tipo de cuenta', 500);
    }
  }
};

module.exports = tipoCuentaController;
