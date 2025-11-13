const bcrypt = require('bcryptjs');
const db = require('../src/models');

async function updatePasswords() {
  try {
    // Conectar a la base de datos
    await db.sequelize.authenticate();
    console.log('Conectado a la base de datos');

    // Hashear contraseñas
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const clientePassword = await bcrypt.hash('Cliente123!', 10);

    console.log('Admin password hash:', adminPassword);
    console.log('Cliente password hash:', clientePassword);

    // Actualizar usuario admin
    const [adminUpdated] = await db.sequelize.query(
      `UPDATE usuarios SET password = ? WHERE correo = 'admin@bancovirtual.com'`,
      { replacements: [adminPassword] }
    );

    // Actualizar usuario cliente
    const [clienteUpdated] = await db.sequelize.query(
      `UPDATE usuarios SET password = ? WHERE correo = 'juan.perez@email.com'`,
      { replacements: [clientePassword] }
    );

    console.log('\n✅ Contraseñas actualizadas correctamente');
    console.log('Admin:', adminUpdated.affectedRows > 0 ? 'Actualizado' : 'No encontrado');
    console.log('Cliente:', clienteUpdated.affectedRows > 0 ? 'Actualizado' : 'No encontrado');

    // Verificar usuarios
    console.log('\n📋 Usuarios en la base de datos:');
    const [usuarios] = await db.sequelize.query(
      `SELECT username, correo, nombre_completo, estado FROM usuarios LIMIT 5`
    );
    console.table(usuarios);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updatePasswords();
