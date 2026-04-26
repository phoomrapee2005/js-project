import { NextResponse } from 'next/server'; // นำเข้า NextResponse สำหรับสร้าง HTTP Response
import { getConnection } from '@/lib/db'; // นำเข้าฟังก์ชันสร้างการเชื่อมต่อฐานข้อมูล

// กำหนดค่าที่อนุญาตสำหรับหมวดหมู่และสภาพสินค้า (ป้องกันการบันทึกข้อมูลผิดประเภท)
const VALID_CATEGORIES = ['mouse', 'keyboard', 'headset', 'mousepad', 'other'];
const VALID_CONDITIONS = ['new', 'used'];

// API Handler สำหรับดึงสินค้าตาม ID (GET /api/products/[id])
export async function GET(request, { params }) {
  try {
    const { id } = await params; // ดึงค่า id จาก URL params
    const host = request.headers.get('host'); // ดึงชื่อ Host เพื่อสร้าง URL รูปภาพ
    const protocol = request.headers.get('x-forwarded-proto') || 'http'; // ดึง Protocol
    const baseUrl = `${protocol}://${host}`; // สร้าง Base URL เต็ม

    const connection = await getConnection(); // เชื่อมต่อฐานข้อมูล
    const [rows] = await connection.execute(
      'SELECT * FROM products WHERE id = ?', // ดึงสินค้าตาม id
      [id]
    );
    await connection.end(); // ปิดการเชื่อมต่อ

    if (rows.length === 0) { // ถ้าไม่พบสินค้า
      return NextResponse.json({ error: 'Product not found' }, { status: 404 }); // ส่ง 404 กลับ
    }

    const product = rows[0]; // ดึงสินค้าชิ้นแรก (และชิ้นเดียว)
    if (product.image_url && product.image_url.startsWith('/uploads/')) {
      product.image_url = `${baseUrl}${product.image_url}`; // แปลง Path รูปเป็น URL เต็ม
    }

    return NextResponse.json(product); // ส่งข้อมูลสินค้ากลับ
  } catch (error) {
    console.error('Error fetching product:', error); // แสดง Error ใน Console
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 }); // ส่ง Error กลับ
  }
}

// API Handler สำหรับอัปเดตข้อมูลสินค้า (PUT /api/products/[id])
export async function PUT(request, { params }) {
  try {
    const { id } = await params; // ดึงค่า id จาก URL params
    const body = await request.json(); // รับข้อมูลที่จะอัปเดตจาก Request Body
    const {
      name, brand, category, model, description,
      condition, quantity, price, image_url, seller_name, seller_phone
    } = body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!name || !brand || !seller_name || !seller_phone) {
      return NextResponse.json(
        { error: 'Missing required fields: name, brand, seller_name, seller_phone' },
        { status: 400 }
      );
    }

    // ตรวจสอบและจัดรูปแบบข้อมูล Enum (ป้องกันค่าที่ไม่ถูกต้อง)
    const normalizedCategory = VALID_CATEGORIES.includes(category) ? category : 'other';
    const normalizedCondition = VALID_CONDITIONS.includes(condition) ? condition : 'new';

    // แปลงชนิดข้อมูลตัวเลข
    const normalizedQuantity = parseInt(quantity, 10) || 1; // แปลงจำนวนเป็น Integer
    const normalizedPrice = parseFloat(price) || 0;         // แปลงราคาเป็น Float

    // แปลง String ว่างเป็น null สำหรับ field ที่ไม่บังคับ
    const normalizedModel = model?.trim() || null;
    const normalizedDescription = description?.trim() || null;
    const normalizedImageUrl = image_url?.trim() || null;

    const connection = await getConnection(); // เชื่อมต่อฐานข้อมูล
    // อัปเดตข้อมูลสินค้าในตาราง products
    await connection.execute(
      `UPDATE products SET name=?, brand=?, category=?, model=?, description=?, \`condition\`=?, quantity=?, price=?, image_url=?, seller_name=?, seller_phone=? WHERE id=?`,
      [name.trim(), brand.trim(), normalizedCategory, normalizedModel, normalizedDescription,
       normalizedCondition, normalizedQuantity, normalizedPrice, normalizedImageUrl,
       seller_name.trim(), seller_phone.trim(), id]
    );
    await connection.end(); // ปิดการเชื่อมต่อ

    return NextResponse.json({ message: 'Product updated successfully' }); // ส่งข้อความยืนยัน
  } catch (error) {
    console.error('Error updating product:', error); // แสดง Error ใน Console
    return NextResponse.json(
      { error: error.message || String(error), stack: error.stack },
      { status: 500 }
    );
  }
}

// API Handler สำหรับลบสินค้า (DELETE /api/products/[id])
export async function DELETE(request, { params }) {
  try {
    const { id } = await params; // ดึงค่า id จาก URL params
    const connection = await getConnection(); // เชื่อมต่อฐานข้อมูล

    // ลบออกจาก cart_items ก่อน เพื่อหลีกเลี่ยง Foreign Key Error
    await connection.execute('DELETE FROM cart_items WHERE product_id = ?', [id]);

    // ลบออกจาก order_items ก่อน เพื่อหลีกเลี่ยง Foreign Key Error
    await connection.execute('DELETE FROM order_items WHERE product_id = ?', [id]);

    // ลบสินค้าออกจากตาราง products
    await connection.execute('DELETE FROM products WHERE id = ?', [id]);
    await connection.end(); // ปิดการเชื่อมต่อ

    return NextResponse.json({ message: 'Product deleted successfully' }); // ส่งข้อความยืนยัน
  } catch (error) {
    console.error('Error deleting product:', error); // แสดง Error ใน Console
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 }); // ส่ง Error กลับ
  }
}
