require('dotenv').config();
const mysql = require('mysql2/promise');

async function listAllData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('\n=== ROLES ===');
    const [roles] = await connection.execute('SELECT * FROM roles');
    console.table(roles);

    console.log('\n=== USUARIOS ===');
    const [usuarios] = await connection.execute('SELECT id_usuario, username, correo, nombre_completo, id_rol, estado FROM usuarios');
    console.table(usuarios);

    console.log('\n=== CLIENTES ===');
    const [clientes] = await connection.execute('SELECT * FROM clientes');
    console.table(clientes);

    console.log('\n=== CUENTAS ===');
    const [cuentas] = await connection.execute('SELECT * FROM cuentas');
    console.table(cuentas);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

listAllData();
