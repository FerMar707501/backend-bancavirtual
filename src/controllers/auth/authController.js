const db = require('../../models');
const tokenService = require('../../services/auth/tokenService');
const responseHelper = require('../../utils/responseHelper');

const authController = {
  // Login
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // Validar datos de entrada
      if (!username || !password) {
        return responseHelper.error(res, 'Username/Email y password son requeridos', 400);
      }

      // Buscar usuario por username o correo
      const { Op } = require('sequelize');
      const usuario = await db.Usuario.findOne({
        where: {
          [Op.or]: [
            { username: username },
            { correo: username }
          ]
        },
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
        return responseHelper.error(res, 'Credenciales inválidas', 401);
      }

      // Verificar estado
      if (usuario.estado !== 'activo') {
        return responseHelper.error(res, 'Usuario inactivo', 403);
      }

      // Verificar contraseña
      const passwordValido = await usuario.comparePassword(password);
      if (!passwordValido) {
        return responseHelper.error(res, 'Credenciales inválidas', 401);
      }

      // Generar tokens
      const tokens = tokenService.generateTokens(usuario);

      // Actualizar último acceso
      await usuario.update({ ultimo_acceso: new Date() });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: usuario.id_usuario,
        accion: 'LOGIN',
        modulo: 'auth',
        descripcion: `Usuario ${username} inició sesión`,
        ip_address: req.ip
      });

      // Preparar respuesta
      const userData = {
        id_usuario: usuario.id_usuario,
        username: usuario.username,
        nombre_completo: usuario.nombre_completo,
        correo: usuario.correo,
        rol: {
          id_rol: usuario.rol.id_rol,
          codigo: usuario.rol.codigo,
          nombre: usuario.rol.nombre
        },
        permisos: usuario.rol.permisos.map(p => p.codigo),
        agencia: usuario.agencia ? {
          id_agencia: usuario.agencia.id_agencia,
          nombre: usuario.agencia.nombre
        } : null
      };

      return responseHelper.success(res, {
        user: userData,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }, 'Login exitoso');

    } catch (error) {
      console.error('Error en login:', error);
      return responseHelper.error(res, 'Error al iniciar sesión', 500);
    }
  },

  // Logout
  async logout(req, res) {
    try {
      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: req.user.id_usuario,
        accion: 'LOGOUT',
        modulo: 'auth',
        descripcion: `Usuario cerró sesión`,
        ip_address: req.ip
      });

      return responseHelper.success(res, null, 'Logout exitoso');
    } catch (error) {
      console.error('Error en logout:', error);
      return responseHelper.error(res, 'Error al cerrar sesión', 500);
    }
  },

  // Refresh token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return responseHelper.error(res, 'Refresh token no proporcionado', 400);
      }

      // Verificar refresh token
      const decoded = tokenService.verifyRefreshToken(refreshToken);

      // Buscar usuario
      const usuario = await db.Usuario.findByPk(decoded.id_usuario);

      if (!usuario || usuario.estado !== 'activo') {
        return responseHelper.error(res, 'Usuario no válido', 401);
      }

      // Generar nuevos tokens
      const tokens = tokenService.generateTokens(usuario);

      return responseHelper.success(res, tokens, 'Tokens renovados exitosamente');

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return responseHelper.error(res, 'Refresh token expirado', 401);
      }
      if (error.name === 'JsonWebTokenError') {
        return responseHelper.error(res, 'Refresh token inválido', 401);
      }
      console.error('Error en refresh token:', error);
      return responseHelper.error(res, 'Error al renovar tokens', 500);
    }
  },

  // Obtener perfil del usuario autenticado
  async getProfile(req, res) {
    try {
      const usuario = await db.Usuario.findByPk(req.user.id_usuario, {
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

      return responseHelper.success(res, usuario, 'Perfil obtenido exitosamente');

    } catch (error) {
      console.error('Error al obtener perfil:', error);
      return responseHelper.error(res, 'Error al obtener perfil', 500);
    }
  },

  // Cambiar contraseña
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return responseHelper.error(res, 'Contraseña actual y nueva son requeridas', 400);
      }

      if (newPassword.length < 6) {
        return responseHelper.error(res, 'La contraseña debe tener al menos 6 caracteres', 400);
      }

      // Buscar usuario
      const usuario = await db.Usuario.findByPk(req.user.id_usuario);

      if (!usuario) {
        return responseHelper.error(res, 'Usuario no encontrado', 404);
      }

      // Verificar contraseña actual
      const passwordValido = await usuario.comparePassword(currentPassword);
      if (!passwordValido) {
        return responseHelper.error(res, 'Contraseña actual incorrecta', 401);
      }

      // Actualizar contraseña (el hook beforeUpdate se encarga del hash)
      await usuario.update({ password: newPassword });

      // Registrar en bitácora
      await db.Bitacora.create({
        id_usuario: usuario.id_usuario,
        accion: 'CAMBIO_PASSWORD',
        modulo: 'auth',
        descripcion: 'Usuario cambió su contraseña',
        ip_address: req.ip
      });

      return responseHelper.success(res, null, 'Contraseña actualizada exitosamente');

    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      return responseHelper.error(res, 'Error al cambiar contraseña', 500);
    }
  }
};

module.exports = authController;
