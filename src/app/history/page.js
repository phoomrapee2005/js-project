'use client'; // บอกให้ Next.js รู้ว่าไฟล์นี้ทำงานฝั่ง Client (Browser)

import { useState, useEffect } from 'react'; // นำเข้า Hook สำหรับจัดการ State และ Lifecycle
import Link from 'next/link'; // นำเข้า Component สำหรับสร้างลิงก์นำทาง
import Navbar from '@/components/Navbar'; // นำเข้า Component แถบเมนูนำทาง
import styles from './page.module.css'; // นำเข้าไฟล์ CSS สำหรับตกแต่งหน้านี้

// Component หลักของหน้าประวัติการสั่งซื้อ
export default function PurchaseHistory() {
  const [orders, setOrders] = useState([]); // เก็บรายการคำสั่งซื้อทั้งหมดของผู้ใช้
  const [loading, setLoading] = useState(true); // สถานะการโหลดข้อมูล

  // โหลดข้อมูลคำสั่งซื้อเมื่อเปิดหน้าเว็บ
  useEffect(() => {
    fetchOrders();
  }, []);

  // ฟังก์ชันดึงข้อมูลคำสั่งซื้อจาก API
  async function fetchOrders() {
    try {
      const res = await fetch('/api/orders'); // ส่งคำขอไปยัง API เพื่อดึงคำสั่งซื้อ
      if (res.ok) { // ถ้าการตอบกลับสำเร็จ
        const data = await res.json(); // แปลงผลลัพธ์เป็น JSON
        setOrders(data.orders || []); // บันทึกรายการคำสั่งซื้อ (ถ้าไม่มีให้ใช้ Array ว่าง)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error); // แสดง Error ใน Console กรณีดึงข้อมูลไม่สำเร็จ
    } finally {
      setLoading(false); // ปิดสถานะโหลดไม่ว่าจะสำเร็จหรือไม่
    }
  }

  // แสดงหน้าโหลดขณะดึงข้อมูล
  if (loading) {
    return (
      <div>
        <Navbar /> {/* แสดงแถบเมนูนำทาง */}
        <main className={styles.main}>
          <div className={styles.loading}>Loading purchase history...</div> {/* ข้อความระหว่างโหลด */}
        </main>
      </div>
    );
  }

  return (
    <div> {/* กล่อง div ครอบทุกอย่างในหน้า */}
      <Navbar /> {/* แสดงแถบเมนูนำทาง */}
      <main className={styles.main}> {/* เนื้อหาหลักของหน้า */}
        <h1>Purchase History</h1> {/* หัวข้อหลักของหน้า */}

        {/* ตรวจสอบว่ามีคำสั่งซื้อหรือไม่ */}
        {orders.length === 0 ? (
          <div className={styles.empty}> {/* กรณีไม่มีคำสั่งซื้อ */}
            <h2>No orders found</h2> {/* แจ้งว่ายังไม่มีคำสั่งซื้อ */}
            <p>You haven't placed any orders yet.</p> {/* คำอธิบายเพิ่มเติม */}
            <Link href="/" className={styles.emptyLink}>
              Start Shopping {/* ลิงก์กลับไปหน้าหลักเพื่อช้อปปิ้ง */}
            </Link>
          </div>
        ) : (
          <div className={styles.orderList}> {/* กล่องแสดงรายการคำสั่งซื้อ */}
            {orders.map((order) => ( // วนลูปแสดงแต่ละคำสั่งซื้อ
              <Link href={`/order/${order.id}`} key={order.id} className={styles.orderCard}> {/* ลิงก์ไปหน้ารายละเอียดคำสั่งซื้อ */}
                <div className={styles.orderHeader}> {/* ส่วนหัวของการ์ดคำสั่งซื้อ */}
                  <span className={styles.orderId}>Order #{order.id}</span> {/* แสดงหมายเลขคำสั่งซื้อ */}
                  <span className={styles.orderDate}>
                    {new Date(order.created_at).toLocaleDateString('en-GB', {
                      year: 'numeric', // แสดงปี
                      month: 'long',   // แสดงชื่อเดือนเต็ม
                      day: 'numeric',  // แสดงวันที่
                      hour: '2-digit',   // แสดงชั่วโมง
                      minute: '2-digit'  // แสดงนาที
                    })}
                  </span>
                </div>
                
                <div className={styles.orderDetails}> {/* ส่วนรายละเอียดสถานะและยอดเงิน */}
                  <span className={`${styles.status} ${styles[order.status]}`}>
                    {order.status} {/* แสดงสถานะคำสั่งซื้อ เช่น pending, completed */}
                  </span>
                  <span className={styles.total}>
                    ฿{parseFloat(order.total_amount).toLocaleString()} {/* แสดงยอดรวมพร้อมจัดรูปแบบตัวเลข */}
                  </span>
                  <button className={styles.viewButton}>View Details</button> {/* ปุ่มดูรายละเอียด */}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
