const db = require('../../models');
const responseHelper = require('../../utils/responseHelper');
const { Op } = require('sequelize');

const bitacoraController = {
  // Listar registros de bitácora
  async listar(req, res) {
    try {
      const { 
        fecha_inicio, 
        fecha_fin, 
        id_usuario, 
        accion, 
        limit = 100,
        page = 1 
      } = req.query;

      const where = {};
      const offset = (page - 1) * limit;

      // Filtrar por rango de fechas
      if (fecha_inicio && fecha_fin) {
        where.createdAt = {
          [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
        };
      }

      // Filtrar por usuario
      if (id_usuario) {
        where.id_usuario = id_usuario;
      }

      // Filtrar por acción
      if (accion) {
        where.accion = { [Op.like]: `%${accion}%` };
      }

      const { count, rows } = await db.Bitacora.findAndCountAll({
        where,
        include: [
          {
            model: db.Usuario,
            as: 'usuario',
            attributes: ['id_usuario', 'username', 'nombre_completo']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      return responseHelper.success(res, {
        total: count,
        pagina_actual: parseInt(page),
        total_paginas: Math.ceil(count / limit),
        registros: rows
      }, 'Bitácora obtenida exitosamente');
    } catch (error) {
      console.error('Error al listar bitácora:', error);
      return responseHelper.error(res, 'Error al obtener bitácora', 500);
    }
  },

  // Obtener registro por ID
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const registro = await db.Bitacora.findByPk(id, {
        include: [
          {
            model: db.Usuario,
            as: 'usuario',
            attributes: ['id_usuario', 'username', 'nombre_completo', 'correo']
          }
        ]
      });

      if (!registro) {
        return responseHelper.error(res, 'Registro de bitácora no encontrado', 404);
      }

      return responseHelper.success(res, registro, 'Registro obtenido exitosamente');
    } catch (error) {
      console.error('Error al obtener registro de bitácora:', error);
      return responseHelper.error(res, 'Error al obtener registro', 500);
    }
  },

  // Obtener estadísticas de auditoría
  async estadisticas(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;

      const where = {};

      if (fecha_inicio && fecha_fin) {
        where.createdAt = {
          [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
        };
      } else {
        // Por defecto, últimos 30 días
        const hace30dias = new Date();
        hace30dias.setDate(hace30dias.getDate() - 30);
        where.createdAt = {
          [Op.gte]: hace30dias
        };
      }

      const registros = await db.Bitacora.findAll({
        where,
        include: [
          {
            model: db.Usuario,
            as: 'usuario',
            attributes: ['id_usuario', 'username', 'nombre_completo']
          }
        ]
      });

      // Estadísticas por acción
      const porAccion = {};
      registros.forEach(r => {
        porAccion[r.accion] = (porAccion[r.accion] || 0) + 1;
      });

      // Estadísticas por usuario
      const porUsuario = {};
      registros.forEach(r => {
        const username = r.usuario.username;
        porUsuario[username] = (porUsuario[username] || 0) + 1;
      });

      // Acciones por día
      const porDia = {};
      registros.forEach(r => {
        const dia = r.createdAt.toISOString().split('T')[0];
        porDia[dia] = (porDia[dia] || 0) + 1;
      });

      return responseHelper.success(res, {
        total_registros: registros.length,
        por_accion: Object.entries(porAccion)
          .map(([accion, cantidad]) => ({ accion, cantidad }))
          .sort((a, b) => b.cantidad - a.cantidad),
        por_usuario: Object.entries(porUsuario)
          .map(([usuario, cantidad]) => ({ usuario, cantidad }))
          .sort((a, b) => b.cantidad - a.cantidad)
          .slice(0, 10),
        por_dia: Object.entries(porDia)
          .map(([dia, cantidad]) => ({ dia, cantidad }))
          .sort((a, b) => a.dia.localeCompare(b.dia))
      }, 'Estadísticas generadas exitosamente');
    } catch (error) {
      console.error('Error al generar estadísticas:', error);
      return responseHelper.error(res, 'Error al generar estadísticas', 500);
    }
  }
};

module.exports = bitacoraController;
