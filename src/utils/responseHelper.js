const responseHelper = {
  success: (res, data, message = 'Operación exitosa', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  },

  error: (res, message = 'Error en la operación', statusCode = 500, details = null) => {
    return res.status(statusCode).json({
      success: false,
      error: {
        message,
        details
      }
    });
  },

  validationError: (res, errors) => {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Errores de validación',
        details: errors
      }
    });
  }
};

module.exports = responseHelper;
