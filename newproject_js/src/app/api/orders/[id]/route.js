import { NextResponse } from 'next/server'; // นำเข้า NextResponse สำหรับสร้าง HTTP Response
import { getConnection } from '@/lib/db'; // นำเข้าฟังก์ชันสร้างการเชื่อมต่อฐานข้อมูล

// API Handler สำหรับดึงรายละเอียดคำสั่งซื้อตาม ID (GET /api/orders/[id])
export async function GET(request, { params }) {
  try {
    const { id } = await params; // ดึงค่า id ของคำสั่งซื้อจาก URL params
    const connection = await getConnection(); // เชื่อมต่อฐานข้อมูล

    // ดึงข้อมูลคำสั่งซื้อจากตาราง orders ตาม id
    const [orderRows] = await connection.execute(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );

    if (orderRows.length === 0) { // ถ้าไม่พบคำสั่งซื้อ
      await connection.end();
      return NextResponse.json({ error: 'Order not found' }, { status: 404 }); // ส่ง 404 กลับ
    }

    const host = request.headers.get('host'); // ดึงชื่อ Host เพื่อสร้าง URL รูปภาพ
    const protocol = request.headers.get('x-forwarded-proto') || 'http'; // ดึง Protocol (http/https)
    const baseUrl = `${protocol}://${host}`; // สร้าง Base URL เต็ม

    // ดึงรายการสินค้าในคำสั่งซื้อนี้พร้อมชื่อและรูปสินค้าจากตาราง products (JOIN)
    const [itemRows] = await connection.execute(
      `SELECT oi.*, p.name as product_name, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    await connection.end(); // ปิดการเชื่อมต่อฐานข้อมูล

    // แปลง Path รูปภาพเป็น URL เต็มสำหรับสินค้าที่อยู่ใน /uploads/
    const itemsWithUrls = itemRows.map(item => {
      if (item.image_url && item.image_url.startsWith('/uploads/')) {
        return { ...item, image_url: `${baseUrl}${item.image_url}` }; // เพิ่ม Base URL หน้า Path รูป
      }
      return item; // คืนข้อมูลเดิมถ้าไม่ใช่ Local Path
    });

    // ส่งข้อมูลคำสั่งซื้อและรายการสินค้ากลับ
    return NextResponse.json({
      order: orderRows[0], // ข้อมูลคำสั่งซื้อหลัก
      items: itemsWithUrls  // รายการสินค้าในคำสั่งซื้อ
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 }); // ส่ง Error กลับถ้าเกิดปัญหา
  }
}
