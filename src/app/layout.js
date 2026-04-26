// นำเข้าฟอนต์ Inter จาก Google Fonts สำหรับใช้ในทั้งโปรเจกต์
import { Inter } from 'next/font/google';
// นำเข้าไฟล์ CSS หลักที่ใช้กับทุกหน้า
import './globals.css';

// สร้างฟอนต์ Inter โดยกำหนดให้รองรับภาษาละติน
const inter = Inter({ subsets: ['latin'] });

// ข้อมูล Metadata (SEO) ของเว็บไซต์ ใช้กำหนด Title และ Description
export const metadata = {
  title: 'Click & Clack - Gaming Gear Marketplace', // ชื่อเว็บที่แสดงบน Tab Browser
  description: 'Buy and sell gaming gear - New and used mice, keyboards, headsets, and more', // คำอธิบายเว็บสำหรับ Search Engine
};

// Root Layout: เป็น Layout หลักที่ครอบทุกหน้าในแอปพลิเคชัน
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
