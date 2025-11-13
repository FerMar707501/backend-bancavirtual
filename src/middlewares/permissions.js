const db = require('../models');
const responseHelper = require('../utils/responseHelper');

const permissionsMiddleware = (permisosRequeridos = []) => {
  return async (req, res, next) => {
    try {
      // Normalizar permisosRequeridos a array si es un string
      const permisos = Array.isArray(permisosRequeridos) 
        ? permisosRequeridos 
        : [permisosRequeridos];

      // Si no se requieren permisos específicos, solo verificar autenticación
      if (permisos.length === 0) {
        return next();
      }

      // Obtener usuario con su rol y permisos
      const usuario = await db.Usuario.findByPk(req.user.id_usuario, {
        include: [
          {
            model: db.Rol,
            as: 'rol',
            include: [
              {
                model: db.Permiso,
                as: 'permisos'
              }
            ]
          }
        ]
      });

      if (!usuario) {
        return responseHelper.error(res, 'Usuario no encontrado', 404);
      }

      if (usuario.estado !== 'activo') {
        return responseHelper.error(res, 'Usuario inactivo', 403);
      }

      // Extraer códigos de permisos del usuario
      const permisosUsuario = usuario.rol.permisos.map(p => p.codigo);

      // Verificar si el usuario tiene al menos uno de los permisos requeridos
      const tienePermiso = permisos.some(permiso => 
        permisosUsuario.includes(permiso)
      );

      if (!tienePermiso) {
        return responseHelper.error(
          res, 
          'No tienes permisos para realizar esta acción', 
          403
        );
      }

      // Agregar rol y permisos al request para uso posterior
      req.user.rol = usuario.rol.codigo;
      req.user.permisos = permisosUsuario;

      next();
    } catch (error) {
      console.error('Error en verificación de permisos:', error);
      return responseHelper.error(res, 'Error al verificar permisos', 500);
    }
  };
};

module.exports = permissionsMiddleware;
