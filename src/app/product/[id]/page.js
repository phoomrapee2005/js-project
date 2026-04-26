'use client'; // บอกให้ Next.js รู้ว่าไฟล์นี้ทำงานฝั่ง Client (Browser)

import { useState, useEffect } from 'react'; // นำเข้า Hook สำหรับจัดการ State และ Lifecycle
import Link from 'next/link'; // นำเข้า Component สำหรับสร้างลิงก์นำทาง
import { useRouter } from 'next/navigation'; // นำเข้า useRouter สำหรับนำทางระหว่างหน้า
import Navbar from '@/components/Navbar'; // นำเข้า Component แถบเมนูนำทาง
import styles from './page.module.css'; // นำเข้าไฟล์ CSS สำหรับตกแต่งหน้านี้

// Component หลักของหน้ารายละเอียดสินค้า รับ params (id ของสินค้า) มาจาก URL
export default function ProductDetail({ params }) {
  const router = useRouter(); // ใช้สำหรับนำทางระหว่างหน้า
  const [product, setProduct] = useState(null); // เก็บข้อมูลสินค้าที่ดึงมาจาก API
  const [loading, setLoading] = useState(true); // สถานะการโหลดข้อมูล

  useEffect(() => {
    fetchProduct(); // โหลดข้อมูลสินค้าเมื่อหน้าเปิดขึ้นครั้งแรก
  }, []);

  async function fetchProduct() {
    try {
      const { id } = await params; // ดึงค่า id จาก URL params
      const res = await fetch(`/api/products/${id}`); // เรียก API ดึงข้อมูลสินค้า
      if (res.ok) {
        const data = await res.json(); // แปลงผลลัพธ์เป็น JSON
        setProduct(data); // บันทึกข้อมูลสินค้าเข้า State
      } else {
        alert('Product not found'); // แจ้งผู้ใช้ว่าไม่พบสินค้า
        router.push('/'); // นำทางกลับไปหน้าแรก
      }
    } catch (error) {
      console.error('Error fetching product:', error); // แสดง Error ใน Console
    } finally {
      setLoading(false); // ปิดสถานะโหลดไม่ว่าจะสำเร็จหรือไม่
    }
  }

  // ฟังก์ชันเพิ่มสินค้านี้ลงในตะกร้า
  async function addToCart() {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST', // ส่งคำขอแบบ POST เพื่อเพิ่มสินค้า
        headers: { 'Content-Type': 'application/json' }, // กำหนด Header เป็น JSON
        body: JSON.stringify({ product_id: product.id, quantity: 1 }) // ส่ง id สินค้าและจำนวน 1 ชิ้น
      });
      if (res.ok) {
        alert('Added to cart!'); // แจ้งผู้ใช้ว่าเพิ่มลงตะกร้าแล้ว
      } else {
        alert('Failed to add to cart'); // แจ้งผู้ใช้ว่าเพิ่มไม่สำเร็จ
      }
    } catch (error) {
      console.error('Error adding to cart:', error); // แสดง Error ใน Console
    }
  }

  if (loading) { // แสดงหน้าโหลดขณะดึงข้อมูล
    return (
      <div>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.loading}>Loading...</div>
        </main>
      </div>
    );
  }

  if (!product) return null; // ถ้าไม่มีข้อมูลสินค้า ไม่แสดงอะไร+++

  return (
    <div>
      <Navbar /> {/* แสดงแถบเมนูนำทาง */}
      <main className={styles.main}>
        <div className={styles.container}> {/* Layout สองคอลัมน์ */}
          <div className={styles.imageSection}> {/* ส่วนรูปภาพสินค้า */}
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} /> // แสดงรูปสินค้า
            ) : (
              <div className={styles.noImage}>No Image Available</div> // แสดงเมื่อไม่มีรูป
            )}
          </div>

          <div className={styles.info}> {/* ส่วนรายละเอียดสินค้า */}
            <div className={styles.breadcrumbs}> {/* Breadcrumb นำทาง */}
              <Link href="/">Home</Link> / <span>{product.name}</span>
            </div>

            {/* ป้ายสภาพสินค้า: มือ 1 หรือ มือ 2 */}
            <span className={`${styles.condition} ${product.condition === 'new' ? styles.new : styles.used}`}>
              {product.condition === 'new' ? 'มือ 1 (New)' : 'มือ 2 (Used)'}
            </span>

            <h1>{product.name}</h1> {/* ชื่อสินค้า */}
            <p className={styles.brand}>{product.brand} {product.model && `- ${product.model}`}</p> {/* แบรนด์และรุ่น */}
            <p className={styles.category}>{getCategoryLabel(product.category)}</p> {/* หมวดหมู่ */}
            <p className={styles.price}>฿{product.price.toLocaleString()}</p> {/* ราคา */}

            <div className={styles.stock}>
              <span>Stock: {product.quantity} units</span> {/* จำนวนสต็อกที่เหลือ */}
            </div>

            <button className={styles.addButton} onClick={addToCart}>
              Add to Cart {/* ปุ่มเพิ่มลงตะกร้า */}
            </button>

            <Link href={`/edit/${product.id}`} className={styles.editLink}>
              Edit Product {/* ลิงก์ไปหน้าแก้ไขสินค้า */}
            </Link>
          </div>
        </div>

        <div className={styles.details}> {/* ส่วนรายละเอียดเพิ่มเติม */}
          <h2>Description</h2>
          <p>{product.description || 'No description available'}</p> {/* คำอธิบายสินค้า */}

          <h2>Seller Information</h2> {/* ข้อมูลผู้ขาย */}
          <div className={styles.seller}>
            <p><strong>Name:</strong> {product.seller_name}</p> {/* ชื่อผู้ขาย */}
            <p><strong>Phone:</strong> {product.seller_phone}</p> {/* เบอร์โทรผู้ขาย */}
          </div>
        </div>
      </main>
    </div>
  );
}

// ฟังก์ชันช่วยแปลงรหัสหมวดหมู่เป็นชื่อที่อ่านออก
function getCategoryLabel(category) {
  const labels = {
    mouse: 'Mouse',       // เมาส์
    keyboard: 'Keyboard', // คีย์บอร์ด
    headset: 'Headset',   // หูฟัง
    mousepad: 'Mousepad', // แผ่นรองเมาส์
    other: 'Other'        // อื่นๆ
  };
  return labels[category] || category; // คืนชื่อหมวดหมู่ ถ้าไม่พบให้คืนค่าเดิม
}
