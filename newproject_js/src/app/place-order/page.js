'use client'; // บอกให้ Next.js รู้ว่าไฟล์นี้ทำงานฝั่ง Client (Browser)

import { useState, useEffect } from 'react'; // นำเข้า Hook สำหรับจัดการ State และ Lifecycle
import { useRouter } from 'next/navigation'; // นำเข้า useRouter สำหรับนำทางระหว่างหน้า
import Navbar from '@/components/Navbar'; // นำเข้า Component แถบเมนูนำทาง
import styles from './page.module.css'; // นำเข้าไฟล์ CSS สำหรับตกแต่งหน้านี้

// Component หลักของหน้ากรอกข้อมูลและยืนยันการสั่งซื้อ
export default function PlaceOrder() {
  const router = useRouter(); // ใช้สำหรับนำทางระหว่างหน้า
  const [cart, setCart] = useState({ items: [], total: 0 }); // เก็บข้อมูลสินค้าในตะกร้า
  const [loading, setLoading] = useState(true); // สถานะการโหลดข้อมูลตะกร้า
  const [submitting, setSubmitting] = useState(false); // สถานะการส่งคำสั่งซื้อ
  // ข้อมูลฟอร์มสำหรับกรอกข้อมูลการจัดส่ง
  const [formData, setFormData] = useState({
    customer_name: '',       // ชื่อผู้รับ
    customer_phone: '',      // เบอร์โทรศัพท์
    address: '',             // ที่อยู่จัดส่ง
    postal_code: '',         // รหัสไปรษณีย์
    shipping_method: 'standard' // วิธีการจัดส่ง (ค่าเริ่มต้น: มาตรฐาน)
  });

  // โหลดข้อมูลตะกร้าเมื่อหน้าเปิดขึ้นครั้งแรก
  useEffect(() => {
    fetchCart();
  }, []);

  // ฟังก์ชันดึงข้อมูลตะกร้าจาก API
  async function fetchCart() {
    try {
      const res = await fetch('/api/cart'); // เรียก API ตะกร้าสินค้า
      const data = await res.json(); // แปลงผลลัพธ์เป็น JSON
      if (data.items.length === 0) { // ถ้าตะกร้าว่างเปล่า
        alert('Your cart is empty'); // แจ้งผู้ใช้
        router.push('/'); // นำทางกลับหน้าแรก
        return;
      }
      setCart(data); // บันทึกข้อมูลตะกร้าเข้า State
    } catch (error) {
      console.error('Failed to fetch cart:', error); // แสดง Error ใน Console
    } finally {
      setLoading(false); // ปิดสถานะโหลด
    }
  }

  // ฟังก์ชันอัปเดต State เมื่อผู้ใช้กรอกข้อมูลในฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target; // ดึงชื่อ field และค่าที่กรอก
    setFormData(prev => ({ ...prev, [name]: value })); // อัปเดต State โดยรักษาค่าเดิม
  };

  // คำนวณค่าจัดส่ง: Express = 100 บาท, Standard = 50 บาท
  const shippingCost = formData.shipping_method === 'express' ? 100 : 50;
  const grandTotal = cart.total + shippingCost; // คำนวณยอดรวมทั้งหมด

  // ฟังก์ชันจัดการเมื่อผู้ใช้กดยืนยันการสั่งซื้อ
  async function handleSubmit(e) {
    e.preventDefault(); // ป้องกันการ Reload หน้า
    setSubmitting(true); // เปิดสถานะกำลังส่ง

    try {
      const res = await fetch('/api/orders', {
        method: 'POST', // ส่งคำขอแบบ POST เพื่อสร้างคำสั่งซื้อ
        headers: { 'Content-Type': 'application/json' }, // กำหนด Header เป็น JSON
        body: JSON.stringify(formData) // แปลงข้อมูลฟอร์มเป็น JSON String
      });

      if (res.ok) { // ถ้าสร้างคำสั่งซื้อสำเร็จ
        const data = await res.json(); // อ่านข้อมูล Response (มี order_id)
        router.push(`/order/${data.order_id}`); // นำทางไปหน้ายืนยันคำสั่งซื้อ
      } else {
        const errorData = await res.json(); // อ่านข้อมูล Error จาก API
        alert('Error: ' + (errorData.error || errorData.message || 'Unknown error')); // แสดงข้อความ Error
      }
    } catch (error) {
      console.error('Error placing order:', error); // แสดง Error ใน Console
      alert('Failed to place order'); // แจ้งผู้ใช้ว่าสั่งซื้อไม่สำเร็จ
    } finally {
      setSubmitting(false); // ปิดสถานะกำลังส่งไม่ว่าจะสำเร็จหรือไม่
    }
  }

  // แสดงหน้าโหลดขณะดึงข้อมูลตะกร้า
  if (loading) {
    return (
      <div>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.loading}>Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Navbar /> {/* แสดงแถบเมนูนำทาง */}
      <main className={styles.main}>
        <h1>Place Order</h1> {/* หัวข้อหลักของหน้า */}

        <div className={styles.container}> {/* Layout สองคอลัมน์ */}
          {/* ฟอร์มกรอกข้อมูลการจัดส่ง */}
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2>Shipping Information</h2> {/* หัวข้อส่วนข้อมูลการจัดส่ง */}

            {/* ช่องกรอกชื่อผู้รับ */}
            <div className={styles.field}>
              <label>Full Name *</label>
              <input type="text" name="customer_name" value={formData.customer_name}
                onChange={handleChange} required placeholder="Your full name" />
            </div>

            {/* ช่องกรอกเบอร์โทรศัพท์ */}
            <div className={styles.field}>
              <label>Phone Number *</label>
              <input type="tel" name="customer_phone" value={formData.customer_phone}
                onChange={handleChange} required placeholder="08xxxxxxxx" />
            </div>

            {/* ช่องกรอกที่อยู่ */}
            <div className={styles.field}>
              <label>Address *</label>
              <textarea name="address" value={formData.address}
                onChange={handleChange} required rows="3" placeholder="Your full address" />
            </div>

            {/* ช่องกรอกรหัสไปรษณีย์ */}
            <div className={styles.field}>
              <label>Postal Code *</label>
              <input type="text" name="postal_code" value={formData.postal_code}
                onChange={handleChange} required placeholder="10000" />
            </div>

            <h2>Shipping Method</h2> {/* หัวข้อเลือกวิธีการจัดส่ง */}

            {/* ตัวเลือกวิธีการจัดส่ง (Radio Button) */}
            <div className={styles.shippingOptions}>
              {/* ตัวเลือก Standard (3-5 วัน, 50 บาท) */}
              <label className={`${styles.option} ${formData.shipping_method === 'standard' ? styles.selected : ''}`}>
                <input type="radio" name="shipping_method" value="standard"
                  checked={formData.shipping_method === 'standard'} onChange={handleChange} />
                <div className={styles.optionContent}>
                  <span className={styles.optionName}>Standard Shipping</span>
                  <span className={styles.optionPrice}>฿50</span>
                  <span className={styles.optionTime}>3-5 business days</span>
                </div>
              </label>

              {/* ตัวเลือก Express (1-2 วัน, 100 บาท) */}
              <label className={`${styles.option} ${formData.shipping_method === 'express' ? styles.selected : ''}`}>
                <input type="radio" name="shipping_method" value="express"
                  checked={formData.shipping_method === 'express'} onChange={handleChange} />
                <div className={styles.optionContent}>
                  <span className={styles.optionName}>Express Shipping</span>
                  <span className={styles.optionPrice}>฿100</span>
                  <span className={styles.optionTime}>1-2 business days</span>
                </div>
              </label>
            </div>

            {/* ส่วนข้อมูลการชำระเงิน (โอนธนาคาร) */}
            <div className={styles.payment}>
              <h2>Payment Information</h2>
              <div className={styles.bankInfo}>
                <p><strong>Bank:</strong> ธนาคารกสิกรไทย (Kasikorn Bank)</p> {/* ชื่อธนาคาร */}
                <p><strong>Account Number:</strong> 1234567890</p> {/* เลขบัญชี */}
                <p><strong>Account Name:</strong> Click & Clack</p> {/* ชื่อบัญชี */}
                <p className={styles.amount}><strong>Amount to pay: ฿{grandTotal.toLocaleString()}</strong></p> {/* ยอดที่ต้องโอน */}
              </div>
            </div>

            {/* ปุ่มยืนยันการสั่งซื้อ */}
            <button type="submit" disabled={submitting} className={styles.submitButton}>
              {submitting ? 'Processing...' : `Pay ฿${grandTotal.toLocaleString()}`} {/* แสดงยอดที่ต้องชำระบนปุ่ม */}
            </button>
          </form>

          {/* ส่วนสรุปรายการสินค้าที่สั่งซื้อ (ด้านขวา) */}
          <div className={styles.orderSummary}>
            <h2>Order Summary</h2>

            <div className={styles.items}>
              {cart.items.map(item => ( // วนลูปแสดงแต่ละสินค้าในตะกร้า
                <div key={item.id} className={styles.item}>
                  <span>{item.name} x {item.quantity}</span> {/* ชื่อสินค้าและจำนวน */}
                  <span>฿{(item.price * item.quantity).toLocaleString()}</span> {/* ราคารวมของสินค้านั้น */}
                </div>
              ))}
            </div>

            {/* สรุปยอดชำระ */}
            <div className={styles.row}>
              <span>Subtotal</span>
              <span>฿{cart.total.toLocaleString()}</span> {/* ราคาสินค้ารวม */}
            </div>
            <div className={styles.row}>
              <span>Shipping</span>
              <span>฿{shippingCost}</span> {/* ค่าจัดส่ง */}
            </div>
            <div className={styles.total}>
              <span>Total</span>
              <span>฿{grandTotal.toLocaleString()}</span> {/* ยอดรวมทั้งหมด */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
