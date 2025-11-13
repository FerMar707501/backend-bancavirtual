const jwt = require('jsonwebtoken');
const jwtConfig = require('../../config/jwt');

const tokenService = {
  // Generar access token
  generateAccessToken(payload) {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn
    });
  },

  // Generar refresh token
  generateRefreshToken(payload) {
    return jwt.sign(payload, jwtConfig.refreshSecret, {
      expiresIn: jwtConfig.refreshExpiresIn
    });
  },

  // Verificar access token
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, jwtConfig.secret);
    } catch (error) {
      throw error;
    }
  },

  // Verificar refresh token
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, jwtConfig.refreshSecret);
    } catch (error) {
      throw error;
    }
  },

  // Generar ambos tokens
  generateTokens(user) {
    const payload = {
      id_usuario: user.id_usuario,
      username: user.username,
      id_rol: user.id_rol,
      id_agencia: user.id_agencia
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload)
    };
  }
};

module.exports = tokenService;
