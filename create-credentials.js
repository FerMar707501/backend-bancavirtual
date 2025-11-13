require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createCredentials() {
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

    // Check if roles exist, if not create them
    const [roles] = await connection.execute('SELECT * FROM roles WHERE codigo IN (?, ?)', ['ADMIN', 'CLIENTE']);
    let adminRoleId, clientRoleId;
    
    if (roles.length === 0) {
      // Create roles
      const [adminRole] = await connection.execute(
        'INSERT INTO roles (codigo, nombre, descripcion) VALUES (?, ?, ?)',
        ['ADMIN', 'Administrador', 'Rol de administrador del sistema']
      );
      adminRoleId = adminRole.insertId;
      
      const [clientRole] = await connection.execute(
        'INSERT INTO roles (codigo, nombre, descripcion) VALUES (?, ?, ?)',
        ['CLIENTE', 'Cliente', 'Rol de cliente del banco']
      );
      clientRoleId = clientRole.insertId;
      console.log('✓ Roles created');
    } else {
      adminRoleId = roles.find(r => r.codigo === 'ADMIN')?.id_rol;
      clientRoleId = roles.find(r => r.codigo === 'CLIENTE')?.id_rol;
    }

    // Get or create agency
    let [agencies] = await connection.execute('SELECT * FROM agencias LIMIT 1');
    let agencyId;
    if (agencies.length === 0) {
      const [agency] = await connection.execute(
        'INSERT INTO agencias (codigo_agencia, nombre, direccion, telefono) VALUES (?, ?, ?, ?)',
        ['AG001', 'Agencia Central', 'Ciudad de Guatemala', '2222-3333']
      );
      agencyId = agency.insertId;
      console.log('✓ Agency created');
    } else {
      agencyId = agencies[0].id_agencia;
    }

    // Insert Admin User
    const [adminResult] = await connection.execute(
      `INSERT INTO usuarios (username, password, nombre_completo, correo, id_rol, id_agencia, estado) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['admin', adminPassword, 'Administrador Sistema', 'admin@bancovirtual.com', adminRoleId, agencyId, 'activo']
    );
    console.log('✓ Admin user created:', adminResult.insertId);

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

    // Get or create account type
    let [accountTypes] = await connection.execute('SELECT * FROM tipos_cuenta WHERE codigo = ?', ['AHO']);
    let accountTypeId;
    if (accountTypes.length === 0) {
      const [accountType] = await connection.execute(
        'INSERT INTO tipos_cuenta (codigo, nombre, descripcion, tasa_interes) VALUES (?, ?, ?, ?)',
        ['AHO', 'Cuenta de Ahorros', 'Cuenta para ahorros personal', 2.50]
      );
      accountTypeId = accountType.insertId;
      console.log('✓ Account type created');
    } else {
      accountTypeId = accountTypes[0].id_tipo_cuenta;
    }

    // Create a bank account for the client
    await connection.execute(
      `INSERT INTO cuentas (numero_cuenta, id_cliente, id_tipo_cuenta, id_agencia, saldo, estado) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['1000000001', clienteId, accountTypeId, agencyId, 10000.00, 'activa']
    );
    console.log('✓ Bank account created for client');

    console.log('\n=== CREDENTIALS CREATED ===\n');
    console.log('ADMIN:');
    console.log('  Username: admin');
    console.log('  Email: admin@bancovirtual.com');
    console.log('  Password: Admin123!');
    console.log('  Role: Administrador\n');
    
    console.log('CLIENT:');
    console.log('  Username: juan.perez');
    console.log('  Email: juan.perez@email.com');
    console.log('  Password: Cliente123!');
    console.log('  Role: Cliente');
    console.log('  DPI: 1234567890101');
    console.log('  Account Number: 1000000001');
    console.log('  Initial Balance: Q10,000.00\n');

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.error('Error: Users already exist in database');
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    await connection.end();
  }
}

createCredentials();
