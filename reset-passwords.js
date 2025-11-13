const bcrypt = require('bcryptjs');
const db = require('./src/models');

async function resetPasswords() {
  try {
    console.log('Conectando a la base de datos...');
    await db.sequelize.authenticate();
    console.log('Conexión exitosa\n');

    // Contraseñas en texto plano
    const passwords = {
      'admin': 'Admin123!',
      'juan.perez': 'Cliente123!'
    };

    for (const [username, plainPassword] of Object.entries(passwords)) {
      console.log(`\nBuscando usuario: ${username}`);
      const usuario = await db.Usuario.findOne({
        where: { username: username }
      });

      if (usuario) {
        console.log(`Usuario encontrado: ${usuario.nombre_completo} (${usuario.correo})`);
        console.log(`Estado actual: ${usuario.estado}`);
        
        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        
        // Actualizar directamente en la BD sin hooks
        await db.sequelize.query(
          'UPDATE usuarios SET password = ?, estado = ? WHERE username = ?',
          {
            replacements: [hashedPassword, 'activo', username],
            type: db.sequelize.QueryTypes.UPDATE
          }
        );
        
        console.log(`✓ Contraseña actualizada: ${plainPassword}`);
        
        // Verificar que funciona
        const verificar = await bcrypt.compare(plainPassword, hashedPassword);
        console.log(`✓ Verificación: ${verificar ? 'OK' : 'ERROR'}`);
      } else {
        console.log(`✗ Usuario no encontrado: ${username}`);
      }
    }

    console.log('\n=================================');
    console.log('Resumen de Credenciales:');
    console.log('=================================');
    console.log('Admin:');
    console.log('  Usuario: admin');
    console.log('  Password: Admin123!');
    console.log('');
    console.log('Cliente:');
    console.log('  Usuario: juan.perez');
    console.log('  Password: Cliente123!');
    console.log('=================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetPasswords();
