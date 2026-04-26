const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST || 'localhost',
      user: process.env.TIDB_USER || 'root',
      password: process.env.TIDB_PASSWORD || '',
      database: process.env.TIDB_DATABASE || 'clickclack',
      port: parseInt(process.env.TIDB_PORT || '4000'),
      ssl: process.env.TIDB_SSL === 'false' ? undefined : {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
      },
    });
    console.log('Successfully connected to the database.');
    const [rows] = await connection.execute('SELECT name, image_url FROM products ORDER BY created_at DESC LIMIT 5');
    console.log('Last 5 products:', rows);
    await connection.end();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

testConnection();
