import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

/**
 * API สำหรับการสมัครสมาชิก (Register)
 * มีระบบตรวจสอบความปลอดภัยของข้อมูล (Validation) ตามเงื่อนไขที่กำหนด
 */
export async function POST(request) {
  let connection;
  try {
    const { username, email, password, full_name, birth_date, age, address } = await request.json();

    // ฟังก์ชันช่วยตรวจสอบตัวอักษร
    const hasUpperCase = (str) => /[A-Z]/.test(str);
    const hasLowerCase = (str) => /[a-z]/.test(str);

    // 1. ตรวจสอบ Username: ต้องยาว > 7 ตัว และมีทั้งตัวพิมพ์ใหญ่/เล็ก
    if (!username || username.length <= 7 || !hasUpperCase(username) || !hasLowerCase(username)) {
      return NextResponse.json({ 
        error: 'Username must be longer than 7 characters and contain both uppercase and lowercase letters.' 
      }, { status: 400 });
    }

    // 2. ตรวจสอบ Password: ต้องยาว > 7 ตัว และมีทั้งตัวพิมพ์ใหญ่/เล็ก
    if (!password || password.length <= 7 || !hasUpperCase(password) || !hasLowerCase(password)) {
      return NextResponse.json({ 
        error: 'Password must be longer than 7 characters and contain both uppercase and lowercase letters.' 
      }, { status: 400 });
    }

    // 3. ตรวจสอบ Email: บังคับใช้ @gmail.com เท่านั้น
    if (!email || !email.endsWith('@gmail.com')) {
      return NextResponse.json({ 
        error: 'Email must be a valid @gmail.com address.' 
      }, { status: 400 });
    }

    connection = await getConnection();

    // 4. ตรวจสอบชื่อผู้ใช้ซ้ำ (Username or Email Duplicate Check)
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Username or Email already exists' }, { status: 400 });
    }

    // 5. บันทึกข้อมูลสมาชิกลงในตาราง users
    await connection.execute(
      'INSERT INTO users (username, email, password, full_name, birth_date, age, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, password, full_name, birth_date, age, address]
    );

    return NextResponse.json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
