require('dotenv').config();
const mysql = require('mysql2/promise');

async function showCredentials() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    // Get all users with their roles
    const [users] = await connection.execute(`
      SELECT u.id_usuario, u.username, u.correo, u.nombre_completo, 
             r.nombre as rol, u.estado
      FROM usuarios u
      JOIN roles r ON u.id_rol = r.id_rol
      ORDER BY r.codigo
    `);

    console.log('\n=== EXISTING USERS IN DATABASE ===\n');
    
    for (const user of users) {
      console.log(`${user.rol.toUpperCase()}:`);
      console.log(`  ID: ${user.id_usuario}`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Email: ${user.correo}`);
      console.log(`  Full Name: ${user.nombre_completo}`);
      console.log(`  Status: ${user.estado}`);
      
      // If user is a client, get their accounts
      if (user.rol === 'Cliente') {
        const [accounts] = await connection.execute(`
          SELECT c.numero_cuenta, c.saldo, tc.nombre as tipo_cuenta
          FROM cuentas c
          JOIN tipos_cuenta tc ON c.id_tipo_cuenta = tc.id_tipo_cuenta
          JOIN clientes cl ON c.id_cliente = cl.id_cliente
          WHERE cl.correo = ?
        `, [user.correo]);
        
        if (accounts.length > 0) {
          console.log('  Accounts:');
          accounts.forEach(acc => {
            console.log(`    - ${acc.numero_cuenta} (${acc.tipo_cuenta}): Q${acc.saldo.toFixed(2)}`);
          });
        }
      }
      console.log();
    }

    console.log('Note: If you need to reset passwords, you can use the credentials:');
    console.log('  Default admin password: Admin123!');
    console.log('  Default client password: Cliente123!');
    console.log('\nYou can login with username OR email at the login endpoint.\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

showCredentials();
