require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createClientOnly() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const clientPassword = await bcrypt.hash('Cliente123!', 10);

    // Get client role
    const [roles] = await connection.execute('SELECT * FROM roles WHERE codigo = ?', ['CLIENTE']);
    let clientRoleId;
    
    if (roles.length === 0) {
      const [clientRole] = await connection.execute(
        'INSERT INTO roles (codigo, nombre, descripcion) VALUES (?, ?, ?)',
        ['CLIENTE', 'Cliente', 'Rol de cliente del banco']
      );
      clientRoleId = clientRole.insertId;
      console.log('✓ Client role created');
    } else {
      clientRoleId = roles[0].id_rol;
    }

    // Get agency
    const [agencies] = await connection.execute('SELECT * FROM agencias LIMIT 1');
    const agencyId = agencies[0].id_agencia;

    // Insert Client in clientes table
    const [clienteResult] = await connection.execute(
      `INSERT INTO clientes (dpi, nit, primer_nombre, primer_apellido, direccion, correo, estado_kyc, estado_cliente) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['1234567890101', '12345678', 'Juan', 'Pérez', 'Zona 1, Ciudad de Guatemala', 'juan.perez@email.com', 'verificado', 'activo']
    );
    const clienteId = clienteResult.insertId;
    console.log('✓ Client created:', clienteId);

    // Insert Client User
    const [clientUserResult] = await connection.execute(
      `INSERT INTO usuarios (username, password, nombre_completo, correo, id_rol, id_agencia, estado) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['juan.perez', clientPassword, 'Juan Pérez', 'juan.perez@email.com', clientRoleId, agencyId, 'activo']
    );
    console.log('✓ Client user created:', clientUserResult.insertId);

    // Get account type
    const [accountTypes] = await connection.execute('SELECT * FROM tipos_cuenta WHERE codigo = ?', ['AHO']);
    let accountTypeId;
    if (accountTypes.length === 0) {
      const [accountType] = await connection.execute(
        'INSERT INTO tipos_cuenta (codigo, nombre, descripcion, tasa_interes) VALUES (?, ?, ?, ?)',
        ['AHO', 'Cuenta de Ahorros', 'Cuenta para ahorros personal', 2.50]
      );
      accountTypeId = accountType.insertId;
    } else {
      accountTypeId = accountTypes[0].id_tipo_cuenta;
    }

    // Create bank account
    await connection.execute(
      `INSERT INTO cuentas (numero_cuenta, id_cliente, id_tipo_cuenta, id_agencia, saldo, estado) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['1000000001', clienteId, accountTypeId, agencyId, 10000.00, 'activa']
    );
    console.log('✓ Bank account created');

    console.log('\n=== CLIENT CREATED SUCCESSFULLY ===\n');
    console.log('CLIENT:');
    console.log('  Username: juan.perez');
    console.log('  Email: juan.perez@email.com');
    console.log('  Password: Cliente123!');
    console.log('  DPI: 1234567890101');
    console.log('  Account Number: 1000000001');
    console.log('  Initial Balance: Q10,000.00\n');

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.error('Error: Client already exists');
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    await connection.end();
  }
}

createClientOnly();
