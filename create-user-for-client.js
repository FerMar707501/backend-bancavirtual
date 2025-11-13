require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createUserForExistingClient() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const clientPassword = await bcrypt.hash('Cliente123!', 10);

    // Get agency
    const [agencies] = await connection.execute('SELECT * FROM agencias LIMIT 1');
    const agencyId = agencies[0].id_agencia;

    // Check if user already exists
    const [existingUser] = await connection.execute('SELECT * FROM usuarios WHERE correo = ?', ['juan.perez@email.com']);
    
    if (existingUser.length > 0) {
      console.log('User already exists with ID:', existingUser[0].id_usuario);
      console.log('\n=== EXISTING CREDENTIALS ===\n');
      console.log('CLIENT:');
      console.log('  Username:', existingUser[0].username);
      console.log('  Email:', existingUser[0].correo);
      console.log('  Password: Cliente123! (if not changed)');
      return;
    }

    // Insert Client User
    const [clientUserResult] = await connection.execute(
      `INSERT INTO usuarios (username, password, nombre_completo, correo, id_rol, id_agencia, estado) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['juan.perez', clientPassword, 'Juan Pérez', 'juan.perez@email.com', 5, agencyId, 'activo']
    );
    console.log('✓ Client user created:', clientUserResult.insertId);

    console.log('\n=== CLIENT USER CREATED ===\n');
    console.log('CLIENT:');
    console.log('  Username: juan.perez');
    console.log('  Email: juan.perez@email.com');
    console.log('  Password: Cliente123!');
    console.log('  Account Numbers: BV305867899715, BV606541807624\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

createUserForExistingClient();
