const responseHelper = require('../utils/responseHelper');

const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Error de Sequelize
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return responseHelper.validationError(res, errors);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return responseHelper.error(res, 'El registro ya existe', 409);
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return responseHelper.error(res, 'Referencia a registro inexistente', 400);
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return responseHelper.error(res, 'Token inválido', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return responseHelper.error(res, 'Token expirado', 401);
  }

  // Error genérico
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';
  
  return responseHelper.error(res, message, statusCode);
};

module.exports = errorHandler;
