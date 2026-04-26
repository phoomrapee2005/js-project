'use client'; // บอกให้ Next.js รู้ว่าไฟล์นี้ทำงานฝั่ง Client (Browser)

import { useState, useEffect } from 'react'; // นำเข้า Hook สำหรับจัดการ State และ Lifecycle
import { useRouter } from 'next/navigation'; // นำเข้า useRouter สำหรับนำทางระหว่างหน้า
import Navbar from '@/components/Navbar'; // นำเข้า Component แถบเมนูนำทาง
import ProductForm from '@/components/ProductForm'; // นำเข้า Component ฟอร์มกรอกข้อมูลสินค้า
import styles from './page.module.css'; // นำเข้าไฟล์ CSS สำหรับตกแต่งหน้านี้

// Component หลักของหน้าแก้ไขสินค้า รับ params (id ของสินค้า) มาจาก URL
export default function EditProduct({ params }) {
  const router = useRouter(); // ใช้สำหรับนำทางระหว่างหน้า
  const [product, setProduct] = useState(null); // เก็บข้อมูลสินค้าที่ดึงมาจาก API
  const [loading, setLoading] = useState(true); // สถานะการโหลดข้อมูล

  // โหลดข้อมูลสินค้าเมื่อหน้าเปิดขึ้นครั้งแรก
  useEffect(() => {
    fetchProduct();
  }, []);

  // ฟังก์ชันดึงข้อมูลสินค้าตาม id จาก URL
  async function fetchProduct() {
    try {
      const { id } = await params; // ดึงค่า id จาก URL params
      const res = await fetch(`/api/products/${id}`); // เรียก API เพื่อดึงข้อมูลสินค้า
      if (res.ok) { // ถ้าสำเร็จ
        const data = await res.json(); // แปลงผลลัพธ์เป็น JSON
        setProduct(data); // บันทึกข้อมูลสินค้าเข้า State
      } else {
        alert('Product not found'); // แจ้งผู้ใช้ว่าไม่พบสินค้า
        router.push('/'); // นำผู้ใช้กลับหน้าแรก
      }
    } catch (error) {
      console.error('Error fetching product:', error); // แสดง Error ใน Console
    } finally {
      setLoading(false); // ปิดสถานะโหลดไม่ว่าจะสำเร็จหรือไม่
    }
  }

  // ฟังก์ชันจัดการเมื่อผู้ใช้กดบันทึกการแก้ไขสินค้า
  async function handleSubmit(formData) {
    try {
      const { id } = await params; // ดึงค่า id จาก URL params
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT', // ส่งคำขอแบบ PUT เพื่ออัปเดตข้อมูล
        headers: { 'Content-Type': 'application/json' }, // กำหนด Header เป็น JSON
        body: JSON.stringify(formData) // แปลงข้อมูลฟอร์มเป็น JSON String
      });

      if (res.ok) { // ถ้าอัปเดตสำเร็จ
        alert('Product updated successfully!'); // แจ้งผู้ใช้ว่าอัปเดตสำเร็จ
        router.push('/'); // นำทางกลับไปหน้าแรก
      } else {
        const errorData = await res.json(); // อ่านข้อมูล Error จาก API
        alert('Error: ' + (errorData.error || errorData.message || 'Unknown error')); // แสดงข้อความ Error
      }
    } catch (error) {
      console.error('Error updating product:', error); // แสดง Error ใน Console
      alert('Failed to update product'); // แจ้งผู้ใช้ว่าอัปเดตไม่สำเร็จ
    }
  }

  // ฟังก์ชันจัดการเมื่อผู้ใช้กดลบสินค้า
  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this product?')) return; // ถามยืนยันก่อนลบ

    try {
      const { id } = await params; // ดึงค่า id จาก URL params
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE' // ส่งคำขอแบบ DELETE เพื่อลบสินค้า
      });

      if (res.ok) { // ถ้าลบสำเร็จ
        alert('Product deleted successfully!'); // แจ้งผู้ใช้ว่าลบสำเร็จ
        router.push('/'); // นำทางกลับไปหน้าแรก
      } else {
        const errorData = await res.json(); // อ่านข้อมูล Error จาก API
        alert('Failed to delete product: ' + (errorData.error || errorData.message || 'Unknown error')); // แสดงข้อความ Error
      }
    } catch (error) {
      console.error('Error deleting product:', error); // แสดง Error ใน Console
    }
  }

  // แสดงหน้าโหลดขณะดึงข้อมูลสินค้า
  if (loading) {
    return (
      <div>
        <Navbar /> {/* แสดงแถบเมนูนำทาง */}
        <main className={styles.main}>
          <div className={styles.loading}>Loading...</div> {/* ข้อความระหว่างโหลด */}
        </main>
      </div>
    );
  }

  // ส่วนแสดงผลหลักของหน้าแก้ไขสินค้า
  return (
    <div> {/* กล่อง div ครอบทุกอย่างในหน้า */}
      <Navbar /> {/* แสดงแถบเมนูนำทาง */}
      <main className={styles.main}> {/* เนื้อหาหลักของหน้า */}
        <div className={styles.header}> {/* ส่วนหัวของหน้า */}
          <h1>Edit Product</h1> {/* หัวข้อหลักของหน้า */}
          <p>Update your listing</p> {/* คำอธิบายใต้หัวข้อ */}
        </div>

        <div className={styles.formContainer}> {/* กล่องสำหรับครอบฟอร์ม */}
          <ProductForm
            initialData={product} // ส่งข้อมูลสินค้าเดิมเข้าไปแสดงในฟอร์ม
            onSubmit={handleSubmit} // ส่งฟังก์ชันบันทึกการแก้ไข
            onDelete={handleDelete} // ส่งฟังก์ชันลบสินค้า
            isEdit={true} // บอก ProductForm ว่าเป็นโหมดแก้ไข (ไม่ใช่เพิ่มใหม่)
          />
        </div>
      </main>
    </div>
  );
}
