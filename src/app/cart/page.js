'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CartItem from '@/components/CartItem';
import styles from './page.module.css';

/**
 * หน้าตะกร้าสินค้า (Cart Page)
 */
export default function Cart() {
  const router = useRouter();
  const [cartData, setCartData] = useState({ items: [], total: 0 }); // เก็บข้อมูลรายการในตะกร้าและยอดรวม
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูลตะกร้าเมื่อเปิดหน้าเว็บ
  useEffect(() => {
    fetchCart();
  }, []);

  // ฟังก์ชันดึงข้อมูลจาก API ตะกร้าสินค้า
  async function fetchCart() {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      setCartData(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }

  // ฟังก์ชันลบสินค้าออกจากตะกร้า
  async function removeFromCart(cartItemId) {
    try {
      const res = await fetch(`/api/cart?id=${cartItemId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCart(); // โหลดข้อมูลใหม่หลังจากลบ
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  }

  // ฟังก์ชันจำลองการชำระเงิน (ไปยังหน้ากรอกข้อมูลการสั่งซื้อ)
  const handleCheckout = () => {
    router.push('/place-order');
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.loading}>Loading your cart...</div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main className={styles.main}>
        <h1>Shopping Cart</h1>

        {/* ตรวจสอบว่ามีสินค้าในตะกร้าหรือไม่ */}
        {!cartData.items || cartData.items.length === 0 ? (
          <div className={styles.empty}>
            <p>Your cart is empty</p>
            <Link href="/" className={styles.checkoutButton} style={{ display: 'inline-block', width: 'auto' }}>
              Go Shopping
            </Link>
          </div>
        ) : (
          <div className={styles.container}>
            {/* แสดงรายการสินค้าทีละชิ้น */}
            <div className={styles.items}>
              {cartData.items.map((item) => (
                <CartItem 
                  key={item.id} 
                  item={item} 
                  onRemove={removeFromCart} 
                />
              ))}
            </div>

            {/* ส่วนสรุปยอดเงินด้านข้าง */}
            <div className={styles.summary}>
              <h2>Order Summary</h2>
              <div className={styles.row}>
                <span>Subtotal</span>
                <span>฿{cartData.total.toLocaleString()}</span>
              </div>
              <div className={styles.row}>
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className={styles.total}>
                <span>Total</span>
                <span>฿{cartData.total.toLocaleString()}</span>
              </div>
              <button 
                className={styles.checkoutButton}
                onClick={handleCheckout}
              >
                Checkout
              </button>
              <Link href="/" className={styles.continue}>
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
