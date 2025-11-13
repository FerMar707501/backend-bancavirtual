require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let accessToken = '';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.yellow}🧪 ${msg}${colors.reset}`)
};

async function testAuth() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║     PRUEBAS DE AUTENTICACIÓN - FASE 3         ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  try {
    // Test 1: Login exitoso
    log.test('Test 1: Login con credenciales válidas');
    try {
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        username: 'admin',
        password: 'admin123'
      });

      if (loginRes.data.success) {
        accessToken = loginRes.data.data.accessToken;
        log.success('Login exitoso');
        log.info(`Usuario: ${loginRes.data.data.user.username}`);
        log.info(`Rol: ${loginRes.data.data.user.rol.nombre}`);
        log.info(`Permisos: ${loginRes.data.data.user.permisos.length}`);
      }
    } catch (error) {
      log.error(`Login falló: ${error.response?.data?.error?.message || error.message}`);
    }

    // Test 2: Login con credenciales inválidas
    log.test('\nTest 2: Login con credenciales inválidas');
    try {
      await axios.post(`${API_URL}/auth/login`, {
        username: 'admin',
        password: 'wrongpassword'
      });
      log.error('Debería haber fallado pero no lo hizo');
    } catch (error) {
      if (error.response?.status === 401) {
        log.success('Login rechazado correctamente (401)');
      } else {
        log.error(`Error inesperado: ${error.message}`);
      }
    }

    // Test 3: Obtener perfil (con token)
    log.test('\nTest 3: Obtener perfil de usuario autenticado');
    try {
      const profileRes = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (profileRes.data.success) {
        log.success('Perfil obtenido exitosamente');
        log.info(`Usuario: ${profileRes.data.data.username}`);
      }
    } catch (error) {
      log.error(`Error al obtener perfil: ${error.response?.data?.error?.message || error.message}`);
    }

    // Test 4: Acceso sin token
    log.test('\nTest 4: Intentar acceder sin token');
    try {
      await axios.get(`${API_URL}/auth/profile`);
      log.error('Debería haber fallado pero no lo hizo');
    } catch (error) {
      if (error.response?.status === 401) {
        log.success('Acceso denegado correctamente (401)');
      } else {
        log.error(`Error inesperado: ${error.message}`);
      }
    }

    // Test 5: Listar usuarios (con permisos)
    log.test('\nTest 5: Listar usuarios (requiere permisos)');
    try {
      const usuariosRes = await axios.get(`${API_URL}/usuarios`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (usuariosRes.data.success) {
        log.success(`Usuarios obtenidos: ${usuariosRes.data.data.length}`);
      }
    } catch (error) {
      log.error(`Error al listar usuarios: ${error.response?.data?.error?.message || error.message}`);
    }

    // Test 6: Cambiar contraseña
    log.test('\nTest 6: Cambiar contraseña');
    try {
      const changePassRes = await axios.post(`${API_URL}/auth/change-password`, {
        currentPassword: 'admin123',
        newPassword: 'admin123' // Mantener la misma para no afectar
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (changePassRes.data.success) {
        log.success('Contraseña actualizada exitosamente');
      }
    } catch (error) {
      log.error(`Error al cambiar contraseña: ${error.response?.data?.error?.message || error.message}`);
    }

    // Test 7: Logout
    log.test('\nTest 7: Logout');
    try {
      const logoutRes = await axios.post(`${API_URL}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (logoutRes.data.success) {
        log.success('Logout exitoso');
      }
    } catch (error) {
      log.error(`Error en logout: ${error.response?.data?.error?.message || error.message}`);
    }

    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║     ✅ PRUEBAS DE AUTENTICACIÓN COMPLETADAS   ║');
    console.log('╚════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n❌ Error general en las pruebas:', error.message);
  }
}

// Verificar que el servidor esté corriendo
axios.get(`${API_URL}`)
  .then(() => {
    log.success('Servidor corriendo en http://localhost:3000\n');
    testAuth();
  })
  .catch(() => {
    log.error('Servidor no está corriendo. Inicia el servidor con: npm start\n');
    process.exit(1);
  });
