import { NextResponse } from 'next/server'; // นำเข้า NextResponse สำหรับสร้าง HTTP Response
import { getConnection } from '@/lib/db'; // นำเข้าฟังก์ชันสร้างการเชื่อมต่อฐานข้อมูล
import { cookies } from 'next/headers'; // นำเข้า cookies สำหรับจัดการ Cookie

// ฟังก์ชันดึงหรือสร้าง Session ID จาก Cookie (ใช้แทนการ Login สำหรับตะกร้าสินค้า)
async function getSessionId() {
  const cookieStore = await cookies(); // เข้าถึง Cookie Store
  let sessionId = cookieStore.get('session_id')?.value; // พยายามดึง session_id จาก Cookie
  if (!sessionId) { // ถ้าไม่มี session_id
    sessionId = crypto.randomUUID(); // สร้าง UUID ใหม่สำหรับผู้ใช้นี้
    cookieStore.set('session_id', sessionId, { maxAge: 60 * 60 * 24 * 7 }); // บันทึก Cookie อายุ 7 วัน
  }
  return sessionId; // คืน Session ID
}

// API Handler สำหรับดึงข้อมูลตะกร้าสินค้า (GET)
export async function GET(request) {
  try {
    const sessionId = await getSessionId(); // ดึง Session ID ของผู้ใช้
    const host = request.headers.get('host'); // ดึงชื่อ Host เพื่อสร้าง URL รูปภาพ
    const protocol = request.headers.get('x-forwarded-proto') || 'http'; // ดึง Protocol (http/https)
    const baseUrl = `${protocol}://${host}`; // สร้าง Base URL เต็ม

    const connection = await getConnection(); // เชื่อมต่อฐานข้อมูล
    const [rows] = await connection.execute(
      // ดึงรายการตะกร้าพร้อมข้อมูลสินค้าจากตาราง products (JOIN)
      `SELECT c.*, p.name, p.price, p.image_url, p.quantity as stock_quantity
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.session_id = ?`,
      [sessionId] // ใช้ Session ID ในการกรองข้อมูล
    );
    await connection.end(); // ปิดการเชื่อมต่อฐานข้อมูล

    // แปลง Path รูปภาพเป็น URL เต็มสำหรับสินค้าที่อยู่ใน /uploads/
    const itemsWithUrls = rows.map(item => {
      if (item.image_url && item.image_url.startsWith('/uploads/')) {
        return { ...item, image_url: `${baseUrl}${item.image_url}` }; // เพิ่ม Base URL หน้า Path รูป
      }
      return item; // คืนข้อมูลเดิมถ้าไม่ใช่ Local Path
    });

    // คำนวณราคารวมทั้งตะกร้า
    const total = itemsWithUrls.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return NextResponse.json({ items: itemsWithUrls, total }); // ส่งข้อมูลตะกร้าและยอดรวมกลับ
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 }); // ส่ง Error กลับถ้าเกิดปัญหา
  }
}

// API Handler สำหรับเพิ่มสินค้าลงตะกร้า (POST)
export async function POST(request) {
  try {
    const sessionId = await getSessionId(); // ดึง Session ID ของผู้ใช้
    const { product_id, quantity = 1 } = await request.json(); // รับ product_id และ quantity จาก Body

    const connection = await getConnection(); // เชื่อมต่อฐานข้อมูล

    // ตรวจสอบว่าสินค้านี้มีในตะกร้าของ Session นี้แล้วหรือยัง
    const [existing] = await connection.execute(
      'SELECT * FROM cart_items WHERE session_id = ? AND product_id = ?',
      [sessionId, product_id]
    );

    if (existing.length > 0) {
      // ถ้ามีแล้ว: เพิ่มจำนวนเข้าไปแทนที่จะเพิ่มรายการใหม่
      await connection.execute(
        'UPDATE cart_items SET quantity = quantity + ? WHERE session_id = ? AND product_id = ?',
        [quantity, sessionId, product_id]
      );
    } else {
      // ถ้ายังไม่มี: เพิ่มรายการใหม่ลงในตะกร้า
      await connection.execute(
        'INSERT INTO cart_items (session_id, product_id, quantity) VALUES (?, ?, ?)',
        [sessionId, product_id, quantity]
      );
    }

    await connection.end(); // ปิดการเชื่อมต่อฐานข้อมูล
    return NextResponse.json({ message: 'Added to cart' }); // ส่งข้อความยืนยันกลับ
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 }); // ส่ง Error กลับถ้าเกิดปัญหา
  }
}

// API Handler สำหรับลบสินค้าออกจากตะกร้า (DELETE)
export async function DELETE(request) {
  try {
    const sessionId = await getSessionId(); // ดึง Session ID ของผู้ใช้
    const { searchParams } = new URL(request.url); // แยก Query String จาก URL
    const cartItemId = searchParams.get('id'); // ดึงค่า id ของรายการที่ต้องการลบ

    const connection = await getConnection(); // เชื่อมต่อฐานข้อมูล
    await connection.execute(
      // ลบรายการตาม id และ session_id (เพื่อป้องกันลบของคนอื่น)
      'DELETE FROM cart_items WHERE id = ? AND session_id = ?',
      [cartItemId, sessionId]
    );
    await connection.end(); // ปิดการเชื่อมต่อ

    return NextResponse.json({ message: 'Removed from cart' }); // ส่งข้อความยืนยันกลับ
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 }); // ส่ง Error กลับถ้าเกิดปัญหา
  }
}
