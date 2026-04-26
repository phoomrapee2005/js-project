import { NextResponse } from 'next/server'; // นำเข้า NextResponse สำหรับสร้าง HTTP Response
import { getConnection } from '@/lib/db'; // นำเข้าฟังก์ชันสร้างการเชื่อมต่อฐานข้อมูล
import { cookies } from 'next/headers'; // นำเข้า cookies สำหรับจัดการ Cookie

// API Handler สำหรับสร้างคำสั่งซื้อใหม่ (POST)
export async function POST(request) {
  try {
    const cookieStore = await cookies(); // เข้าถึง Cookie Store
    const sessionId = cookieStore.get('session_id')?.value; // ดึง Session ID จาก Cookie

    if (!sessionId) { // ถ้าไม่มี Session ID (ไม่มีตะกร้า)
      return NextResponse.json({ error: 'No session found' }, { status: 400 }); // ส่ง Error กลับ
    }

    // รับข้อมูลการสั่งซื้อจาก Request Body
    const body = await request.json();
    const {
      customer_name,       // ชื่อผู้รับ
      customer_phone,      // เบอร์โทรผู้รับ
      address,             // ที่อยู่จัดส่ง
      postal_code,         // รหัสไปรษณีย์
      shipping_method,     // วิธีการจัดส่ง (standard/express)
      payment_proof = null // หลักฐานการชำระ (ถ้ามี)
    } = body;

    const connection = await getConnection(); // เชื่อมต่อฐานข้อมูล

    // ดึงรายการสินค้าในตะกร้าของ Session นี้ พร้อมราคาจาก products
    const [cartItems] = await connection.execute(
      `SELECT c.*, p.price FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.session_id = ?`,
      [sessionId]
    );

    if (cartItems.length === 0) { // ถ้าตะกร้าว่างเปล่า
      await connection.end();
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 }); // ส่ง Error กลับ
    }

    // คำนวณยอดราคาสินค้า, ค่าจัดส่ง, และยอดรวมทั้งหมด
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping_cost = shipping_method === 'express' ? 100 : 50; // Express = 100, Standard = 50
    const total_amount = subtotal + shipping_cost; // ยอดรวม = สินค้า + ค่าจัดส่ง

    // บันทึกคำสั่งซื้อลงในตาราง orders
    const [orderResult] = await connection.execute(
      `INSERT INTO orders (session_id, customer_name, customer_phone, address, postal_code, shipping_method, shipping_cost, total_amount, payment_proof)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sessionId, customer_name, customer_phone, address, postal_code, shipping_method, shipping_cost, total_amount, payment_proof]
    );

    const orderId = orderResult.insertId; // ดึง ID ของคำสั่งซื้อที่เพิ่งสร้าง

    // บันทึกรายการสินค้าในคำสั่งซื้อ และลดสต็อกสินค้า
    for (const item of cartItems) {
      // บันทึกแต่ละรายการสินค้าลงตาราง order_items
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );

      // ลดจำนวนสต็อกสินค้าตามที่สั่งซื้อ
      await connection.execute(
        'UPDATE products SET quantity = quantity - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // ล้างสินค้าทั้งหมดในตะกร้าหลังจากสั่งซื้อสำเร็จ
    await connection.execute('DELETE FROM cart_items WHERE session_id = ?', [sessionId]);

    await connection.end(); // ปิดการเชื่อมต่อฐานข้อมูล

    return NextResponse.json({ order_id: orderId, message: 'Order placed successfully' }); // ส่ง order_id กลับ
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 }); // ส่ง Error กลับถ้าเกิดปัญหา
  }
}

// API Handler สำหรับดึงประวัติคำสั่งซื้อของผู้ใช้ (GET)
export async function GET(request) {
  try {
    const cookieStore = await cookies(); // เข้าถึง Cookie Store
    const sessionId = cookieStore.get('session_id')?.value; // ดึง Session ID จาก Cookie

    if (!sessionId) { // ถ้าไม่มี Session ID (ไม่เคยช้อปปิ้ง)
      return NextResponse.json({ orders: [] }); // ส่ง Array ว่างกลับ
    }

    const connection = await getConnection(); // เชื่อมต่อฐานข้อมูล
    // ดึงคำสั่งซื้อทั้งหมดของ Session นี้ เรียงจากใหม่ไปเก่า
    const [orders] = await connection.execute(
      'SELECT * FROM orders WHERE session_id = ? ORDER BY created_at DESC',
      [sessionId]
    );
    await connection.end(); // ปิดการเชื่อมต่อ

    return NextResponse.json({ orders }); // ส่งรายการคำสั่งซื้อกลับ
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 }); // ส่ง Error กลับถ้าเกิดปัญหา
  }
}
