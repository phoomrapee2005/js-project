import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

// กำหนดค่าที่อนุญาตสำหรับหมวดหมู่และสภาพสินค้า (Enum)
const VALID_CATEGORIES = ['mouse', 'keyboard', 'headset', 'mousepad', 'other'];
const VALID_CONDITIONS = ['new', 'used'];

/**
 * API สำหรับดึงรายการสินค้าทั้งหมด (GET)
 * มีการกรองเฉพาะสินค้าที่ยังมีสต็อก (quantity > 0)
 */
export async function GET(request) {
  let connection;
  try {
    // ดึงค่า Host และ Protocol เพื่อสร้าง URL รูปภาพแบบ Absolute
    const { searchParams } = new URL(request.url);
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    connection = await getConnection();
    
    // ดึงเฉพาะสินค้าที่ยังมีจำนวนมากกว่า 0 เพื่อไม่ให้โชว์สินค้าที่หมดแล้ว
    const [rows] = await connection.execute(
      'SELECT * FROM products WHERE quantity > 0 ORDER BY created_at DESC'
    );
    
    // แปลง Path รูปภาพจาก Local (/uploads/...) ให้เป็น URL เต็ม (http://...)
    // เพื่อให้คนอื่นที่เข้าผ่าน IP เครื่องเราสามารถเห็นรูปได้
    const productsWithUrls = rows.map(product => {
      if (product.image_url && product.image_url.startsWith('/uploads/')) {
        return {
          ...product,
          image_url: `${baseUrl}${product.image_url}`
        };
      }
      return product;
    });

    return NextResponse.json(productsWithUrls);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    // ปิดการเชื่อมต่อฐานข้อมูลทุกครั้งเพื่อประหยัดทรัพยากร
    if (connection) await connection.end();
  }
}

/**
 * API สำหรับลงขายสินค้าใหม่ (POST)
 */
export async function POST(request) {
  let connection;
  try {
    const body = await request.json();
    const {
      name,
      brand,
      category,
      model,
      description,
      condition,
      quantity,
      price,
      image_url,
      seller_name,
      seller_phone
    } = body;

    // ตรวจสอบข้อมูลที่จำเป็นว่าครบถ้วนหรือไม่
    if (!name || !brand || !category || !condition || !seller_name || !seller_phone) {
      return NextResponse.json(
        { error: 'Missing required fields: name, brand, category, condition, seller_name, seller_phone' },
        { status: 400 }
      );
    }

    // ทำความสะอาดข้อมูล (Normalization)
    const normalizedCategory = VALID_CATEGORIES.includes(category) ? category : 'other';
    const normalizedCondition = VALID_CONDITIONS.includes(condition) ? condition : 'new';
    const normalizedQuantity = parseInt(quantity, 10) || 1;
    const normalizedPrice = parseFloat(price) || 0;
    const normalizedModel = model?.trim() || null;
    const normalizedDescription = description?.trim() || null;
    const normalizedImageUrl = image_url?.trim() || null;

    connection = await getConnection();
    
    // บันทึกข้อมูลลงตาราง products
    const [result] = await connection.execute(
      `INSERT INTO products (name, brand, category, model, description, \`condition\`, quantity, price, image_url, seller_name, seller_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        brand.trim(),
        normalizedCategory,
        normalizedModel,
        normalizedDescription,
        normalizedCondition,
        normalizedQuantity,
        normalizedPrice,
        normalizedImageUrl,
        seller_name.trim(),
        seller_phone.trim()
      ]
    );

    return NextResponse.json({ id: result.insertId, message: 'Product created successfully' });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error.message || String(error), details: error.sqlMessage || '' },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
