import { NextResponse } from 'next/server'; // นำเข้า NextResponse สำหรับสร้าง HTTP Response
import { getConnection } from '@/lib/db'; // นำเข้าฟังก์ชันสร้างการเชื่อมต่อฐานข้อมูล
import { cookies } from 'next/headers'; // นำเข้า cookies สำหรับจัดการ Cookie

// API Handler สำหรับเข้าสู่ระบบ (POST /api/auth/login)
export async function POST(request) {
  let connection;
  try {
    const { username, password } = await request.json(); // รับ username และ password จาก Request Body

    connection = await getConnection(); // เชื่อมต่อฐานข้อมูล
    // ค้นหาผู้ใช้ที่มี username และ password ตรงกัน
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length === 0) { // ถ้าไม่พบผู้ใช้ (username หรือ password ผิด)
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 }); // ส่ง 401 Unauthorized
    }

    const user = rows[0]; // ดึงข้อมูลผู้ใช้ที่พบ
    const cookieStore = await cookies(); // เข้าถึง Cookie Store
    
    // บันทึก Cookie Session สำหรับการ Login (อายุ 24 ชั่วโมง)
    cookieStore.set('user_id', user.id.toString(), { maxAge: 60 * 60 * 24 }); // บันทึก user_id
    cookieStore.set('username', user.username, { maxAge: 60 * 60 * 24 }); // บันทึก username

    // ส่งข้อมูลผู้ใช้กลับ (ไม่รวม password)
    return NextResponse.json({ 
      message: 'Logged in successfully',
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error); // แสดง Error ใน Console
    return NextResponse.json({ error: error.message }, { status: 500 }); // ส่ง Error กลับ
  } finally {
    if (connection) await connection.end(); // ปิดการเชื่อมต่อฐานข้อมูลเสมอ
  }
}
