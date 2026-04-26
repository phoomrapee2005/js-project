import { NextResponse } from 'next/server'; // นำเข้า NextResponse สำหรับสร้าง HTTP Response
import { cookies } from 'next/headers'; // นำเข้า cookies สำหรับจัดการ Cookie

// API Handler สำหรับตรวจสอบสถานะการเข้าสู่ระบบของผู้ใช้ (GET /api/auth/me)
export async function GET() {
  const cookieStore = await cookies(); // เข้าถึง Cookie Store
  const username = cookieStore.get('username')?.value; // ดึงค่า username จาก Cookie (ถ้ามี)

  if (!username) { // ถ้าไม่พบ username ใน Cookie (ยังไม่ได้ Login)
    return NextResponse.json({ authenticated: false }); // ส่งกลับว่ายังไม่ได้ Login
  }

  return NextResponse.json({ authenticated: true, username }); // ส่งกลับว่า Login แล้ว พร้อม username
}
