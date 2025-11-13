require('dotenv').config();
const app = require('./src/config/app');
const { testConnection } = require('./src/config/database');
const errorHandler = require('./src/middlewares/errorHandler');

const PORT = process.env.PORT || 3000;

// Inicializar servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    await testConnection();

    // Importar rutas
    const routes = require('./src/routes');
    app.use('/api', routes);

    // Middleware de manejo de errores (debe ir al final)
    app.use(errorHandler);

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════╗
║   🏦  BANCO VIRTUAL - API REST                ║
║                                                ║
║   🚀 Servidor corriendo en puerto ${PORT}        ║
║   🌍 Entorno: ${process.env.NODE_ENV}                  ║
║   📊 Base de datos: ${process.env.DB_NAME}       ║
║                                                ║
║   📡 API: http://localhost:${PORT}               ║
╚════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  // No cerrar el servidor, solo logear el error
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // No cerrar el servidor, solo logear el error
});

// Iniciar
startServer();
