'use client'; // บอกให้ Next.js รู้ว่าไฟล์นี้ทำงานฝั่ง Client (Browser)

import { useRouter } from 'next/navigation'; // นำเข้า useRouter สำหรับใช้นำทางระหว่างหน้า
import Navbar from '@/components/Navbar'; // นำเข้า Component แถบเมนูนำทาง
import ProductForm from '@/components/ProductForm'; // นำเข้า Component ฟอร์มกรอกข้อมูลสินค้า
import styles from './page.module.css'; // นำเข้าไฟล์ CSS สำหรับตกแต่งหน้านี้โดยเฉพาะ

// ประกาศ Component หลักของหน้า "เพิ่มสินค้า" และ export ออกไปให้หน้าอื่นใช้งานได้
export default function AddProduct() {
  const router = useRouter(); // สร้างตัวแปร router สำหรับใช้เปลี่ยนหน้า

  // ฟังก์ชัน handleSubmit สำหรับจัดการเมื่อผู้ใช้กดส่งฟอร์ม
  async function handleSubmit(formData) {
    try {
      // ส่งข้อมูลสินค้าไปยัง API ด้วยวิธี POST
      const res = await fetch('/api/products', {
        method: 'POST', // กำหนดวิธีการส่งข้อมูลเป็น POST
        headers: { 'Content-Type': 'application/json' }, // กำหนด Header ว่าข้อมูลเป็น JSON
        body: JSON.stringify(formData) // แปลงข้อมูลฟอร์มเป็น JSON String ก่อนส่ง
      });

      if (res.ok) { // ถ้า API ตอบกลับว่าสำเร็จ (HTTP Status 200-299)
        alert('Product added successfully!'); // แสดงข้อความแจ้งว่าเพิ่มสินค้าสำเร็จ
        router.push('/'); // นำทางผู้ใช้กลับไปยังหน้าแรก
      } else {
        const errorData = await res.json(); // อ่านข้อมูล Error ที่ API ส่งกลับมาเป็น JSON
        alert('Error: ' + (errorData.error || errorData.message || 'Unknown error')); // แสดงข้อความ Error ที่ได้รับ
      }
    } catch (error) {
      console.error('Error adding product:', error); // แสดง Error ใน Console สำหรับ Debug
      alert('Failed to add product'); // แสดงข้อความแจ้งผู้ใช้ว่าเพิ่มสินค้าไม่สำเร็จ
    }
  }

  // ส่วนแสดงผล (JSX) ของหน้า
  return (
    <div> {/* กล่อง div ครอบทุกอย่างในหน้า */}
      <Navbar /> {/* แสดง Component แถบเมนูนำทาง */}
      <main className={styles.main}> {/* ส่วนเนื้อหาหลักของหน้า */}
        <div className={styles.header}> {/* กล่อง div สำหรับส่วนหัวของหน้า */}
          <h1>Add New Product</h1> {/* หัวข้อหลักของหน้า */}
          <p>Sell your gaming gear</p> {/* ข้อความอธิบายใต้หัวข้อ */}
        </div>

        <div className={styles.formContainer}> {/* กล่อง div สำหรับครอบฟอร์ม */}
          <ProductForm onSubmit={handleSubmit} /> {/* แสดง Component ฟอร์ม และส่งฟังก์ชัน handleSubmit ไปด้วย */}
        </div>
      </main>
    </div>
  );
}
