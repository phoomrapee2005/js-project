'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';

/**
 * ส่วนเมนูนำทาง (Navbar)
 * จัดการการแสดงผลปุ่มต่างๆ ตามสถานะการเข้าสู่ระบบ
 */
export default function Navbar() {
  const [cartCount, setCartCount] = useState(0); // จำนวนสินค้าในตะกร้า
  const [user, setUser] = useState(null); // ข้อมูลผู้ใช้ที่ Login อยู่

  useEffect(() => {
    fetchCartCount();
    checkUser();
  }, []);

  // ฟังก์ชันตรวจสอบสถานะ Login จาก API
  async function checkUser() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated) {
        setUser({ username: data.username });
      }
    } catch (error) {
      console.error('Failed to check auth:', error);
    }
  }

  // ดึงจำนวนสินค้าในตะกร้ามาแสดงเลข Badge
  async function fetchCartCount() {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      if (data.items) {
        setCartCount(data.items.reduce((sum, item) => sum + item.quantity, 0));
      }
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
    }
  }

  // ฟังก์ชันออกจากระบบ
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/'; // กลับไปหน้าแรกและรีเฟรช
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Click & Clack
        </Link>
        <div className={styles.links}>
          {/* ปุ่มสำหรับทุกคน */}
          <Link href="/add" className={styles.addButton}>
            + Add Product
          </Link>
          <Link href="/cart" className={styles.cartLink}>
            Cart {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </Link>
          
          {/* แสดงส่วนนี้เมื่อ Login แล้ว */}
          {user ? (
            <div className={styles.userSection}>
              <Link href="/history" className={styles.cartLink}>
                History
              </Link>
              <span className={styles.username}>Hi, {user.username}</span>
              <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
            </div>
          ) : (
            /* แสดงส่วนนี้เมื่อยังไม่ได้ Login */
            <div className={styles.authLinks}>
              <Link href="/login" className={styles.cartLink}>Login</Link>
              <Link href="/register" className={styles.addButton}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
