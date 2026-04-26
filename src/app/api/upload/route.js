import { NextResponse } from 'next/server'; // นำเข้า NextResponse สำหรับสร้าง HTTP Response
import { writeFile, mkdir } from 'fs/promises'; // นำเข้าฟังก์ชัน I/O สำหรับเขียนไฟล์และสร้างโฟลเดอร์
import { join } from 'path'; // นำเข้าฟังก์ชันสำหรับสร้าง Path ไฟล์

// API Handler สำหรับ Upload รูปภาพ (POST /api/upload)
export async function POST(request) {
  try {
    const formData = await request.formData(); // รับข้อมูล FormData จาก Request
    const file = formData.get('file'); // ดึงไฟล์จาก FormData โดยใช้ key 'file'

    if (!file) { // ถ้าไม่มีไฟล์ส่งมา
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 }); // ส่ง 400 Bad Request
    }

    const bytes = await file.arrayBuffer(); // อ่านข้อมูลไฟล์เป็น ArrayBuffer
    const buffer = Buffer.from(bytes); // แปลงเป็น Buffer สำหรับเขียนลงไฟล์

    // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน: Timestamp + Random Number + ชื่อไฟล์เดิม (แทนที่ Space ด้วย -)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + '-' + file.name.replace(/\s+/g, '-');

    // กำหนดโฟลเดอร์ที่จะเก็บรูป: public/uploads/ ใน Root ของโปรเจกต์
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
    try {
      await mkdir(uploadDir, { recursive: true }); // recursive: true ป้องกัน Error ถ้าโฟลเดอร์มีอยู่แล้ว
    } catch (err) {
      // ไม่ต้องทำอะไรถ้าโฟลเดอร์มีอยู่แล้ว
    }

    const filepath = join(uploadDir, filename); // สร้าง Path เต็มของไฟล์

    await writeFile(filepath, buffer); // เขียนไฟล์ลงในโฟลเดอร์

    // ส่ง URL ของรูปที่ Upload แล้วกลับ (Path สำหรับเข้าถึงผ่าน Browser)
    return NextResponse.json({
      url: `/uploads/${filename}`, // URL สำหรับเข้าถึงรูปภาพ
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error); // แสดง Error ใน Console
    return NextResponse.json({ error: error.message }, { status: 500 }); // ส่ง Error กลับ
  }
}
