'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import styles from '../login/page.module.css';

/**
 * หน้าสมัครสมาชิก (Register Page)
 */
export default function RegisterPage() {
  const router = useRouter();
  
  // เก็บข้อมูลสมาชิกระดับละเอียด (username, email, password และข้อมูลส่วนตัว)
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '',
    full_name: '',
    birth_date: '',
    age: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // อัปเดต State เมื่อผู้ใช้กรอกข้อมูลแต่ละช่อง
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ฟังก์ชันจัดการเมื่อกดปุ่มสมัครสมาชิก
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ส่งข้อมูลไปยัง API Register ซึ่งมีการตรวจสอบกฎเหล็กหลังบ้าน
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert('Registration successful! Please login.');
        router.push('/login'); // สำเร็จแล้วส่งไปหน้า Login
      } else {
        const data = await res.json();
        // แสดงข้อความ Error เช่น Username ซ้ำ หรือรหัสผ่านไม่ตรงตามกฎ
        setError(data.error || 'Registration failed');
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
        <div className={styles.card} style={{ maxWidth: '600px' }}>
          <h1>Create Account</h1>
          <p>Join the Click & Clack community</p>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* ช่องกรอก Username พร้อมบอกเงื่อนไข */}
            <div className={styles.field}>
              <label>Username (A-z, &gt; 7 chars)</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Ex: MyUsername123"
              />
            </div>
            {/* ช่องกรอก Email พร้อมบอกเงื่อนไข @gmail.com */}
            <div className={styles.field}>
              <label>Email (@gmail.com)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="yourname@gmail.com"
              />
            </div>
            {/* ช่องกรอก Password พร้อมบอกเงื่อนไข */}
            <div className={styles.field}>
              <label>Password (A-z, &gt; 7 chars)</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="StrongPassword123"
              />
            </div>
            
            {/* ข้อมูลส่วนตัวเพิ่มเติม */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className={styles.field}>
                <label>First & Last Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                />
              </div>
              <div className={styles.field}>
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  placeholder="25"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>Birth Date</label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Your shipping address"
                style={{ 
                  padding: '1rem', 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  color: 'white',
                  minHeight: '100px'
                }}
              />
            </div>

            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <p className={styles.footer}>
            Already have an account? <Link href="/login">Login here</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
