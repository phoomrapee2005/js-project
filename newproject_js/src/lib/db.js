import mysql from 'mysql2/promise';

/**
 * ฟังก์ชันสำหรับการเชื่อมต่อฐานข้อมูล TiDB Cloud (MySQL)
 * มีการตั้งค่า SSL เพื่อความปลอดภัยตามข้อกำหนดของ TiDB Serverless
 */
export async function getConnection() {
  // ดึงค่าการเชื่อมต่อจาก Environment Variables (.env.local)
  const config = {
    host: process.env.TIDB_HOST || '127.0.0.1',
    user: process.env.TIDB_USER || 'root',
    password: process.env.TIDB_PASSWORD || '',
    database: process.env.TIDB_DATABASE || 'clickclack',
    port: parseInt(process.env.TIDB_PORT || '3306'),
    // ตั้งค่า SSL: จำเป็นสำหรับ TiDB Cloud เพื่อป้องกันการดักจับข้อมูล
    ssl: process.env.TIDB_SSL === 'false' ? undefined : {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    },
  };

  try {
    // สร้างการเชื่อมต่อใหม่
    const connection = await mysql.createConnection(config);
    
    // ตรวจสอบและสร้างตาราง users โดยอัตโนมัติหากยังไม่มีในฐานข้อมูล
    // รองรับข้อมูล: username, email, password, ชื่อ-นามสกุล, วันเกิด, อายุ, ที่อยู่
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        birth_date DATE,
        age INT,
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    return connection;
  } catch (err) {
    // จัดการกรณีเชื่อมต่อไม่ได้ (เช่น ลืมเปิดฐานข้อมูล หรือ Port ผิด)
    if (err.code === 'ECONNREFUSED') {
      throw new Error(`ไม่สามารถเชื่อมต่อ Database ได้ที่พอร์ต ${config.port} กรุณาตรวจสอบว่าเปิด Database หรือยัง?`);
    }
    throw err;
  }
}
