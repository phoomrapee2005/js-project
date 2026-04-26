'use client'; // บอกให้ Next.js รู้ว่าไฟล์นี้ทำงานฝั่ง Client (Browser)

import { useState, useEffect } from 'react'; // นำเข้า Hook สำหรับจัดการ State และ Lifecycle
import Link from 'next/link'; // นำเข้า Component สำหรับสร้างลิงก์นำทาง
import Navbar from '@/components/Navbar'; // นำเข้า Component แถบเมนูนำทาง
import styles from './page.module.css'; // นำเข้าไฟล์ CSS สำหรับตกแต่งหน้านี้

// Component หลักของหน้าแสดงรายละเอียดคำสั่งซื้อ รับ params (id ของออเดอร์) มาจาก URL
export default function OrderConfirmation({ params }) {
  const [orderData, setOrderData] = useState(null); // เก็บข้อมูลคำสั่งซื้อและรายการสินค้า
  const [loading, setLoading] = useState(true); // สถานะการโหลดข้อมูล

  // โหลดข้อมูลคำสั่งซื้อเมื่อหน้าเปิดขึ้นครั้งแรก
  useEffect(() => {
    fetchOrder();
  }, []);

  // ฟังก์ชันดึงข้อมูลคำสั่งซื้อตาม id จาก URL
  async function fetchOrder() {
    try {
      const { id } = await params; // ดึงค่า id จาก URL params
      const res = await fetch(`/api/orders/${id}`); // เรียก API เพื่อดึงข้อมูลคำสั่งซื้อ
      if (res.ok) { // ถ้าดึงข้อมูลสำเร็จ
        const data = await res.json(); // แปลงผลลัพธ์เป็น JSON
        setOrderData(data); // บันทึกข้อมูลคำสั่งซื้อเข้า State
      }
    } catch (error) {
      console.error('Error fetching order:', error); // แสดง Error ใน Console
    } finally {
      setLoading(false); // ปิดสถานะโหลดไม่ว่าจะสำเร็จหรือไม่
    }
  }

  // ฟังก์ชันพิมพ์ใบเสร็จ
  const handlePrint = () => {
    window.print(); // เปิดหน้าต่างพิมพ์ของ Browser
  };

  // แสดงหน้าโหลดขณะดึงข้อมูล
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

  // แสดงหน้าแจ้งไม่พบคำสั่งซื้อ
  if (!orderData) {
    return (
      <div>
        <Navbar /> {/* แสดงแถบเมนูนำทาง */}
        <main className={styles.main}>
          <div className={styles.error}>Order not found</div> {/* แจ้งว่าไม่พบคำสั่งซื้อ */}
        </main>
      </div>
    );
  }

  // แยกข้อมูลคำสั่งซื้อและรายการสินค้าออกจาก orderData
  const { order, items } = orderData;

  return (
    <div> {/* กล่อง div ครอบทุกอย่างในหน้า */}
      <Navbar /> {/* แสดงแถบเมนูนำทาง */}
      <main className={styles.main}> {/* เนื้อหาหลักของหน้า */}
        {/* ส่วนแสดงข้อความขอบคุณหลังสั่งซื้อสำเร็จ */}
        <div className={styles.thankYou}>
          <div className={styles.checkmark}>✓</div> {/* ไอคอนเครื่องหมายถูก */}
          <h1>Thank You!</h1> {/* หัวข้อขอบคุณ */}
          <p>Your order has been placed successfully</p> {/* ข้อความยืนยันการสั่งซื้อ */}
          <p className={styles.orderNumber}>Order #{order.id}</p> {/* แสดงหมายเลขคำสั่งซื้อ */}
        </div>

        {/* ส่วนแสดงใบเสร็จรายละเอียดการสั่งซื้อ */}
        <div className={styles.receipt}>
          <div className={styles.receiptHeader}> {/* หัวข้อใบเสร็จ */}
            <h2>Order Receipt</h2> {/* ชื่อใบเสร็จ */}
            <button onClick={handlePrint} className={styles.printButton}>
              Print Receipt {/* ปุ่มพิมพ์ใบเสร็จ */}
            </button>
          </div>

          {/* ส่วนข้อมูลรายการสั่งซื้อ */}
          <div className={styles.section}>
            <h3>Order Information</h3> {/* หัวข้อข้อมูลออเดอร์ */}
            <div className={styles.infoGrid}> {/* Grid แสดงข้อมูล */}
              <div>
                <span>Order Date:</span> {/* ป้ายกำกับ */}
                <p>{new Date(order.created_at).toLocaleString('th-TH')}</p> {/* วันที่สั่งซื้อ (แสดงในรูปแบบไทย) */}
              </div>
              <div>
                <span>Status:</span> {/* ป้ายกำกับ */}
                <p className={styles.status}>{order.status}</p> {/* สถานะคำสั่งซื้อ */}
              </div>
              <div>
                <span>Shipping Method:</span> {/* ป้ายกำกับ */}
                <p>{order.shipping_method === 'express' ? 'Express (1-2 days)' : 'Standard (3-5 days)'}</p> {/* วิธีการจัดส่งที่เลือก */}
              </div>
            </div>
          </div>

          {/* ส่วนข้อมูลผู้รับสินค้า */}
          <div className={styles.section}>
            <h3>Customer Information</h3> {/* หัวข้อข้อมูลลูกค้า */}
            <div className={styles.infoGrid}>
              <div>
                <span>Name:</span> {/* ป้ายกำกับ */}
                <p>{order.customer_name}</p> {/* ชื่อผู้รับ */}
              </div>
              <div>
                <span>Phone:</span> {/* ป้ายกำกับ */}
                <p>{order.customer_phone}</p> {/* เบอร์โทรศัพท์ */}
              </div>
              <div className={styles.fullWidth}> {/* กล่องกว้างเต็มแถว */}
                <span>Address:</span> {/* ป้ายกำกับ */}
                <p>{order.address}</p> {/* ที่อยู่จัดส่ง */}
                <p>Postal Code: {order.postal_code}</p> {/* รหัสไปรษณีย์ */}
              </div>
            </div>
          </div>

          {/* ส่วนแสดงรายการสินค้าในคำสั่งซื้อ */}
          <div className={styles.section}>
            <h3>Order Items</h3> {/* หัวข้อรายการสินค้า */}
            <table className={styles.table}> {/* ตารางแสดงรายการสินค้า */}
              <thead>
                <tr>
                  <th>Product</th>   {/* คอลัมน์ชื่อสินค้า */}
                  <th>Qty</th>       {/* คอลัมน์จำนวน */}
                  <th>Price</th>     {/* คอลัมน์ราคาต่อชิ้น */}
                  <th>Total</th>     {/* คอลัมน์ราคารวม */}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => ( // วนลูปแสดงแต่ละรายการสินค้า
                  <tr key={item.id}> {/* แต่ละแถวใช้ id เป็น key */}
                    <td>{item.product_name}</td> {/* ชื่อสินค้า */}
                    <td>{item.quantity}</td> {/* จำนวนที่สั่ง */}
                    <td>฿{item.price.toLocaleString()}</td> {/* ราคาต่อชิ้น */}
                    <td>฿{(item.price * item.quantity).toLocaleString()}</td> {/* ราคารวมของสินค้านั้น */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ส่วนสรุปยอดชำระเงิน */}
          <div className={styles.summary}>
            <div className={styles.row}>
              <span>Subtotal:</span> {/* ราคาสินค้ารวม (ไม่รวมค่าส่ง) */}
              <span>฿{(order.total_amount - order.shipping_cost).toLocaleString()}</span>
            </div>
            <div className={styles.row}>
              <span>Shipping:</span> {/* ค่าจัดส่ง */}
              <span>฿{order.shipping_cost.toLocaleString()}</span>
            </div>
            <div className={styles.total}>
              <span>Total:</span> {/* ยอดรวมทั้งหมด */}
              <span>฿{order.total_amount.toLocaleString()}</span>
            </div>
          </div>

          {/* ส่วนข้อมูลการชำระเงิน */}
          <div className={styles.paymentInfo}>
            <h3>Payment Information</h3> {/* หัวข้อข้อมูลการชำระ */}
            <p><strong>Bank:</strong> Kasikorn Bank (กสิกรไทย)</p> {/* ชื่อธนาคาร */}
            <p><strong>Account:</strong> 1234567890</p> {/* เลขบัญชี */}
            <p><strong>Account Name:</strong> Click & Clack</p> {/* ชื่อบัญชี */}
            <p className={styles.paymentNote}>
              Please complete your payment and send the receipt to our contact. {/* คำแนะนำการชำระเงิน */}
            </p>
          </div>
        </div>

        {/* ปุ่มกลับไปช้อปปิ้งต่อ */}
        <div className={styles.actions}>
          <Link href="/" className={styles.continueButton}>
            Continue Shopping {/* ลิงก์กลับไปหน้าสินค้า */}
          </Link>
        </div>
      </main>
    </div>
  );
}
