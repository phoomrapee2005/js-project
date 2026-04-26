'use client';

import Link from 'next/link';
import styles from './ProductCard.module.css';

/**
 * Component สำหรับแสดงการ์ดสินค้าแต่ละชิ้นในหน้า Home
 */
export default function ProductCard({ product, onAddToCart }) {
  
  // ฟังก์ชันจัดการเมื่อกดปุ่ม Add to Cart
  const handleAddToCart = async (e) => {
    e.preventDefault(); // ป้องกันไม่ให้เปลี่ยนหน้าไปยังลิงก์หลักของการ์ด
    e.stopPropagation(); // ป้องกันเหตุการณ์คลิกซ้อนทับ
    await onAddToCart(product.id); // เรียกฟังก์ชันเพิ่มลงตะกร้าจากหน้าหลัก
  };

  return (
    <div className={styles.card}>
      {/* คลิกที่การ์ดเพื่อไปยังหน้ารายละเอียดสินค้า */}
      <Link href={`/product/${product.id}`} className={styles.link}>
        <div className={styles.imageContainer}>
          {/* แสดงรูปสินค้า ถ้าไม่มีให้แสดง No Image */}
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className={styles.image}
            />
          ) : (
            <div className={styles.noImage}>No Image</div>
          )}
          {/* ป้ายบอกว่าเป็น มือ 1 หรือ มือ 2 */}
          <span className={`${styles.badge} ${product.condition === 'new' ? styles.new : styles.used}`}>
            {product.condition === 'new' ? 'มือ 1' : 'มือ 2'}
          </span>
        </div>
        
        {/* รายละเอียดเนื้อหาในหน้าการ์ด */}
        <div className={styles.content}>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.brand}>{product.brand} {product.model && `- ${product.model}`}</p>
          <p className={styles.category}>{getCategoryLabel(product.category)}</p>
          <p className={styles.price}>฿{product.price.toLocaleString()}</p>
        </div>
      </Link>
      
      {/* ปุ่มเพิ่มสินค้าลงในตะกร้า */}
      <button className={styles.addButton} onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
}

/**
 * ฟังก์ชันช่วยแปลงชื่อหมวดหมู่ภาษาอังกฤษเป็นตัวพิมพ์ใหญ่ตามดีไซน์
 */
function getCategoryLabel(category) {
  const labels = {
    mouse: 'Mouse',
    keyboard: 'Keyboard',
    headset: 'Headset',
    mousepad: 'Mousepad',
    other: 'Other'
  };
  return labels[category] || category;
}
