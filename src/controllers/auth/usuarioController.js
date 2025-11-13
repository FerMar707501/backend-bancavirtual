const db = require('../../models');
const responseHelper = require('../../utils/responseHelper');

const usuarioController = {
  // Listar todos los usuarios
  async listar(req, res) {
    try {
      const usuarios = await db.Usuario.findAll({
        attributes: { exclude: ['password'] },
        include: [
          {
            model: db.Rol,
            as: 'rol'
          },
          {
            model: db.Agencia,
            as: 'agencia'
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return responseHelper.success(res, usuarios, 'Usuarios obtenidos exitosamente');
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      return responseHelper.error(res, 'Error al obtener usuarios', 500);
    }
  },

  // Obtener usuario por ID
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const usuario = await db.Usuario.findByPk(id, {
        attributes: { exclude: ['password'] },
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
          },
          {
            model: db.Agencia,
            as: 'agencia'
          }
        ]
      });

      if (!usuario) {
        return responseHelper.error(res, 'Usuario no encontrado', 404);
      }

      return responseHelper.success(res, usuario, 'Usuario obtenido exitosamente');
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return responseHelper.error(res, 'Error al obtener usuario', 500);
    }
  },

  // Crear nuevo usuario
  async crear(req, res) {
    try {
      const { username, password, nombre_completo, correo, id_rol, id_agencia } = req.body;

      // Validar campos requeridos
      if (!username || !password || !nombre_completo || !correo || !id_rol) {
        return responseHelper.error(res, 'Faltan campos requeridos', 400);
      }

      // Validar longitud de contraseña
      if (password.length < 6) {
        return responseHelper.error(res, 'La contraseña debe tener al menos 6 caracteres', 400);
      }

      // Crear usuario (el hook beforeCreate se encarga del hash)
      const usuario = await db.Usuario.create({
        username,
        password,
        nombre_completo,
        correo,
        id_rol,
        id_agencia,
        estado: 'activo'
      });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: req.user.id_usuario,
        accion: 'CREAR_USUARIO',
        modulo: 'usuarios',
        descripcion: `Usuario creado: ${username}`,
        ip_address: req.ip,
        datos_adicionales: { id_usuario_creado: usuario.id_usuario }
      });

      // Obtener usuario con relaciones
      const usuarioCreado = await db.Usuario.findByPk(usuario.id_usuario, {
        attributes: { exclude: ['password'] },
        include: [
          { model: db.Rol, as: 'rol' },
          { model: db.Agencia, as: 'agencia' }
        ]
      });

      return responseHelper.success(res, usuarioCreado, 'Usuario creado exitosamente', 201);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return responseHelper.error(res, 'El username o correo ya existe', 409);
      }
      return responseHelper.error(res, 'Error al crear usuario', 500);
    }
  },

  // Actualizar usuario
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { username, nombre_completo, correo, id_rol, id_agencia } = req.body;

      const usuario = await db.Usuario.findByPk(id);

      if (!usuario) {
        return responseHelper.error(res, 'Usuario no encontrado', 404);
      }

      // Actualizar campos (sin password)
      await usuario.update({
        username: username || usuario.username,
        nombre_completo: nombre_completo || usuario.nombre_completo,
        correo: correo || usuario.correo,
        id_rol: id_rol || usuario.id_rol,
        id_agencia: id_agencia !== undefined ? id_agencia : usuario.id_agencia
      });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: req.user.id_usuario,
        accion: 'ACTUALIZAR_USUARIO',
        modulo: 'usuarios',
        descripcion: `Usuario actualizado: ${usuario.username}`,
        ip_address: req.ip,
        datos_adicionales: { id_usuario_actualizado: id }
      });

      // Obtener usuario actualizado con relaciones
      const usuarioActualizado = await db.Usuario.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [
          { model: db.Rol, as: 'rol' },
          { model: db.Agencia, as: 'agencia' }
        ]
      });

      return responseHelper.success(res, usuarioActualizado, 'Usuario actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return responseHelper.error(res, 'El username o correo ya existe', 409);
      }
      return responseHelper.error(res, 'Error al actualizar usuario', 500);
    }
  },

  // Cambiar estado del usuario
  async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!['activo', 'inactivo'].includes(estado)) {
        return responseHelper.error(res, 'Estado inválido', 400);
      }

      const usuario = await db.Usuario.findByPk(id);

      if (!usuario) {
        return responseHelper.error(res, 'Usuario no encontrado', 404);
      }

      await usuario.update({ estado });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: req.user.id_usuario,
        accion: 'CAMBIAR_ESTADO_USUARIO',
        modulo: 'usuarios',
        descripcion: `Estado de usuario ${usuario.username} cambiado a: ${estado}`,
        ip_address: req.ip,
        datos_adicionales: { id_usuario_afectado: id, nuevo_estado: estado }
      });

      return responseHelper.success(res, { estado }, 'Estado actualizado exitosamente');
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      return responseHelper.error(res, 'Error al cambiar estado', 500);
    }
  },

  // Resetear contraseña (por administrador)
  async resetearPassword(req, res) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return responseHelper.error(res, 'La contraseña debe tener al menos 6 caracteres', 400);
      }

      const usuario = await db.Usuario.findByPk(id);

      if (!usuario) {
        return responseHelper.error(res, 'Usuario no encontrado', 404);
      }

      await usuario.update({ password: newPassword });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: req.user.id_usuario,
        accion: 'RESETEAR_PASSWORD',
        modulo: 'usuarios',
        descripcion: `Contraseña reseteada para usuario: ${usuario.username}`,
        ip_address: req.ip,
        datos_adicionales: { id_usuario_afectado: id }
      });

      return responseHelper.success(res, null, 'Contraseña reseteada exitosamente');
    } catch (error) {
      console.error('Error al resetear contraseña:', error);
      return responseHelper.error(res, 'Error al resetear contraseña', 500);
    }
  }
};

module.exports = usuarioController;
