'use client'; // บอกให้ Next.js รู้ว่าไฟล์นี้ทำงานฝั่ง Client (Browser)

import styles from './CartItem.module.css'; // นำเข้าไฟล์ CSS สำหรับตกแต่ง Component นี้

// Component แสดงรายการสินค้าแต่ละชิ้นในตะกร้า
// รับ Props: item (ข้อมูลสินค้าในตะกร้า), onRemove (ฟังก์ชันลบสินค้า)
export default function CartItem({ item, onRemove }) {
  const totalPrice = item.price * item.quantity; // คำนวณราคารวมของสินค้านี้ (ราคา x จำนวน)

  return (
    <div className={styles.item}> {/* กล่องแสดงสินค้าแต่ละชิ้น */}
      {/* ส่วนแสดงรูปภาพสินค้า */}
      <div className={styles.image}>
        {item.image_url ? ( // ถ้ามีรูปภาพ
          <img src={item.image_url} alt={item.name} /> // แสดงรูปสินค้า
        ) : (
          <div className={styles.noImage}>No Image</div> // แสดงข้อความถ้าไม่มีรูป
        )}
      </div>

      {/* ส่วนแสดงรายละเอียดสินค้า */}
      <div className={styles.details}>
        <h4>{item.name}</h4> {/* ชื่อสินค้า */}
        <p className={styles.price}>฿{item.price.toLocaleString()} x {item.quantity}</p> {/* ราคาต่อชิ้น x จำนวน */}
      </div>

      {/* ส่วนแสดงราคารวม */}
      <div className={styles.total}>
        <p>฿{totalPrice.toLocaleString()}</p> {/* ราคารวมของสินค้านี้ */}
      </div>

      {/* ปุ่มลบสินค้าออกจากตะกร้า */}
      <button className={styles.removeButton} onClick={() => onRemove(item.id)}>
        Remove {/* เรียกฟังก์ชัน onRemove พร้อมส่ง id ของรายการในตะกร้า */}
      </button>
    </div>
  );
}
