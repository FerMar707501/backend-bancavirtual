require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function resetAdminPassword() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const newPassword = await bcrypt.hash('Admin123!', 10);

    await connection.execute(
      'UPDATE usuarios SET password = ? WHERE username = ?',
      [newPassword, 'admin']
    );

    console.log('✓ Admin password reset successfully!');
    console.log('\nNew credentials:');
    console.log('  Username: admin');
    console.log('  Email: admin@bancovirtual.com');
    console.log('  Password: Admin123!');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

resetAdminPassword();
