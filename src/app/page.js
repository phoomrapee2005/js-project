'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';

/**
 * หน้าหลัก (Home Page)
 * ทำหน้าที่แสดงรายการสินค้าทั้งหมดและระบบกรองข้อมูล
 */
export default function Home() {
  const [products, setProducts] = useState([]); // เก็บรายการสินค้า
  const [loading, setLoading] = useState(true); // สถานะการโหลด
  const [filter, setFilter] = useState('all'); // เก็บค่าการกรอง (all, new, used)

  // ทำงานเมื่อ Component ถูกโหลดครั้งแรก
  useEffect(() => {
    fetchProducts();

    // ระบบ Polling: ดึงข้อมูลใหม่ทุกๆ 5 วินาที เพื่อให้เห็นสินค้าล่าสุดตลอดเวลา
    const interval = setInterval(() => {
      fetchProducts();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ฟังก์ชันดึงข้อมูลสินค้าจาก API
  async function fetchProducts() {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error('API returned non-array:', data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  // ฟังก์ชันสำหรับเพิ่มสินค้าลงตะกร้า
  async function addToCart(productId) {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: 1 })
      });

      if (res.ok) {
        alert('Added to cart!');
      } else {
        alert('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }

  // การกรองสินค้าตามเงื่อนไขที่ผู้ใช้เลือก (มือ 1 / มือ 2)
  const safeProducts = Array.isArray(products) ? products : [];
  const filteredProducts = filter === 'all'
    ? safeProducts
    : safeProducts.filter(p => p.condition === filter);

  return (
    <div>
      <Navbar />
      <main className={styles.main}>
        {/* ส่วน Hero: อธิบายว่าเว็บนี้คืออะไร */}
        <div className={styles.hero}>
          <div className={styles.heroBadge}>Marketplace for Gamers</div>
          <h1>Upgrade Your <span className={styles.gradientText}>Battle Station</span></h1>
          <p>
            ยินดีต้อนรับสู่ <strong>Click & Clack</strong> — แหล่งรวม Gaming Gear คุณภาพเยี่ยม 
            ไม่ว่าจะเป็นเมาส์ คีย์บอร์ด หูฟัง ทั้ง <span className={styles.highlight}>มือ 1 และ มือ 2</span> 
            ที่เราคัดสรรมาเพื่อเกมเมอร์ตัวจริงในราคาที่จับต้องได้
          </p>
        </div>

        {/* ส่วนตัวเลือกการกรองสินค้า */}
        <div className={styles.filters}>
          <button
            className={filter === 'all' ? styles.active : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={filter === 'new' ? styles.active : ''}
            onClick={() => setFilter('new')}
          >
            มือ 1 (New)
          </button>
          <button
            className={filter === 'used' ? styles.active : ''}
            onClick={() => setFilter('used')}
          >
            มือ 2 (Used)
          </button>
        </div>

        {/* แสดงรายการสินค้าแบบ Grid */}
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <div className={styles.grid}>
            {filteredProducts?.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}

        {/* กรณีไม่มีสินค้าที่ตรงตามเงื่อนไข */}
        {!loading && (!filteredProducts || filteredProducts.length === 0) && (
          <div className={styles.empty}>
            <p>No products found</p>
          </div>
        )}
      </main>
    </div>
  );
}
