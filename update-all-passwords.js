require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function updateAllPasswords() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    // Usuarios a actualizar
    const users = [
      { username: 'admin', password: 'Admin123!' },
      { username: 'juan.perez', password: 'Cliente123!' }
    ];

    console.log('Actualizando contraseñas...\n');

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      const [result] = await connection.execute(
        'UPDATE usuarios SET password = ? WHERE username = ?',
        [hashedPassword, user.username]
      );

      if (result.affectedRows > 0) {
        console.log(`✓ Password actualizado para: ${user.username}`);
        console.log(`  Contraseña: ${user.password}`);
      } else {
        console.log(`✗ Usuario no encontrado: ${user.username}`);
      }
    }

    console.log('\n¡Todas las contraseñas han sido actualizadas!');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

updateAllPasswords();
