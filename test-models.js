require('dotenv').config();
const db = require('./src/models');

const testModels = async () => {
  try {
    console.log('🔍 Probando conexión y modelos...\n');

    // Probar conexión
    await db.sequelize.authenticate();
    console.log('✅ Conexión a MySQL exitosa\n');

    // Sincronizar modelos (solo en desarrollo - NO EN PRODUCCIÓN)
    // await db.sequelize.sync({ alter: true });
    // console.log('✅ Modelos sincronizados con la base de datos\n');

    // Listar todos los modelos cargados
    console.log('📋 Modelos cargados:');
    const models = Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize');
    models.forEach((model, index) => {
      console.log(`   ${index + 1}. ${model}`);
    });
    console.log(`\n✅ Total: ${models.length} modelos\n`);

    // Probar algunas consultas básicas
    console.log('🔎 Probando consultas básicas:\n');

    // Contar roles
    const rolesCount = await db.Rol.count();
    console.log(`   📊 Roles registrados: ${rolesCount}`);

    // Contar usuarios
    const usuariosCount = await db.Usuario.count();
    console.log(`   👥 Usuarios registrados: ${usuariosCount}`);

    // Contar agencias
    const agenciasCount = await db.Agencia.count();
    console.log(`   🏢 Agencias registradas: ${agenciasCount}`);

    // Contar tipos de cuenta
    const tiposCuentaCount = await db.TipoCuenta.count();
    console.log(`   💳 Tipos de cuenta: ${tiposCuentaCount}`);

    // Contar tipos de préstamo
    const tiposPrestamoCount = await db.TipoPrestamo.count();
    console.log(`   💰 Tipos de préstamo: ${tiposPrestamoCount}`);

    // Contar clientes
    const clientesCount = await db.Cliente.count();
    console.log(`   👤 Clientes registrados: ${clientesCount}`);

    // Contar cuentas
    const cuentasCount = await db.Cuenta.count();
    console.log(`   🏦 Cuentas bancarias: ${cuentasCount}`);

    console.log('\n✅ Todos los modelos funcionan correctamente\n');

    // Probar una asociación
    console.log('🔗 Probando asociaciones:\n');
    
    const usuarioConRol = await db.Usuario.findOne({
      include: [
        { model: db.Rol, as: 'rol' }
      ]
    });

    if (usuarioConRol) {
      console.log(`   ✅ Usuario encontrado: ${usuarioConRol.username}`);
      console.log(`   ✅ Con rol: ${usuarioConRol.rol.nombre}`);
    } else {
      console.log('   ℹ️  No hay usuarios en la base de datos');
    }

    console.log('\n✅ FASE 2 COMPLETADA - Todos los modelos y asociaciones funcionan\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

testModels();
