const db = require('../../models');
const responseHelper = require('../../utils/responseHelper');

const tipoPrestamoController = {
  // Listar tipos de préstamo
  async listar(req, res) {
    try {
      const { estado } = req.query;

      const where = {};
      if (estado) {
        where.estado = estado;
      }

      const tiposPrestamo = await db.TipoPrestamo.findAll({
        where,
        order: [['nombre', 'ASC']]
      });

      return responseHelper.success(res, tiposPrestamo, 'Tipos de préstamo obtenidos exitosamente');
    } catch (error) {
      console.error('Error al listar tipos de préstamo:', error);
      return responseHelper.error(res, 'Error al obtener tipos de préstamo', 500);
    }
  },

  // Obtener tipo de préstamo por ID
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const tipoPrestamo = await db.TipoPrestamo.findByPk(id);

      if (!tipoPrestamo) {
        return responseHelper.error(res, 'Tipo de préstamo no encontrado', 404);
      }

      return responseHelper.success(res, tipoPrestamo, 'Tipo de préstamo obtenido exitosamente');
    } catch (error) {
      console.error('Error al obtener tipo de préstamo:', error);
      return responseHelper.error(res, 'Error al obtener tipo de préstamo', 500);
    }
  }
};

module.exports = tipoPrestamoController;
