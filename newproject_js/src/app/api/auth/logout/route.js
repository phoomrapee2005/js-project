import { NextResponse } from 'next/server'; // นำเข้า NextResponse สำหรับสร้าง HTTP Response
import { cookies } from 'next/headers'; // นำเข้า cookies สำหรับจัดการ Cookie

// API Handler สำหรับออกจากระบบ (POST /api/auth/logout)
export async function POST() {
  const cookieStore = await cookies(); // เข้าถึง Cookie Store
  cookieStore.delete('user_id'); // ลบ Cookie user_id เพื่อยกเลิก Session
  cookieStore.delete('username'); // ลบ Cookie username เพื่อยกเลิก Session
  return NextResponse.json({ message: 'Logged out successfully' }); // ส่งข้อความยืนยันการออกจากระบบ
}
