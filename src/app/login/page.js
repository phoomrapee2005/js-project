'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';

/**
 * หน้าเข้าสู่ระบบ (Login Page)
 */
export default function LoginPage() {
  const router = useRouter();
  // เก็บข้อมูลในฟอร์ม (Username และ Password)
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(''); // เก็บข้อความแสดงข้อผิดพลาด
  const [loading, setLoading] = useState(false); // สถานะการส่งข้อมูล

  // ฟังก์ชันอัปเดตข้อมูลเมื่อมีการพิมพ์ในช่อง Input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ฟังก์ชันจัดการเมื่อกดปุ่ม Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ส่งข้อมูลไปยัง API Login
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        // ถ้าสำเร็จ ให้ Refresh หน้าเว็บเพื่อให้ Navbar โหลดข้อมูลผู้ใช้ใหม่
        window.location.href = '/'; 
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.card}>
          <h1>Welcome Back</h1>
          <p>Login to manage your gaming gear</p>

          {/* แสดงกล่อง Error ถ้า Login ไม่สำเร็จ */}
          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your username"
              />
            </div>
            <div className={styles.field}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* ลิงก์สำหรับไปหน้าสมัครสมาชิก */}
          <p className={styles.footer}>
            Don't have an account? <Link href="/register">Register here</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
