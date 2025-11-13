const tokenService = require('../services/auth/tokenService');
const responseHelper = require('../utils/responseHelper');

const authMiddleware = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return responseHelper.error(res, 'Token no proporcionado', 401);
    }

    // Extraer token
    const token = authHeader.split(' ')[1];

    // Verificar token
    const decoded = tokenService.verifyAccessToken(token);

    // Agregar información del usuario al request
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return responseHelper.error(res, 'Token expirado', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return responseHelper.error(res, 'Token inválido', 401);
    }
    return responseHelper.error(res, 'Error de autenticación', 401);
  }
};

module.exports = authMiddleware;
