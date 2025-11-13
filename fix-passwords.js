require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function fixPasswords() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const clientPassword = await bcrypt.hash('Cliente123!', 10);

    // Update admin
    await connection.execute(
      'UPDATE usuarios SET password = ? WHERE username = ?',
      [adminPassword, 'admin']
    );

    // Update client
    await connection.execute(
      'UPDATE usuarios SET password = ? WHERE username = ?',
      [clientPassword, 'juan.perez']
    );

    console.log('✅ Passwords updated successfully!\n');
    
    console.log('👤 ADMINISTRATOR');
    console.log('   - Username: admin');
    console.log('   - Email: admin@bancovirtual.com');
    console.log('   - Password: Admin123!\n');
    
    console.log('👤 CLIENT');
    console.log('   - Username: juan.perez');
    console.log('   - Email: juan.perez@email.com');
    console.log('   - Password: Cliente123!\n');
    
    // Verify hashes
    console.log('Verifying passwords...');
    const adminTest = await bcrypt.compare('Admin123!', adminPassword);
    const clientTest = await bcrypt.compare('Cliente123!', clientPassword);
    
    console.log('Admin password test:', adminTest ? '✅' : '❌');
    console.log('Client password test:', clientTest ? '✅' : '❌');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

fixPasswords();
