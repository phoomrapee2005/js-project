'use client'; // บอกให้ Next.js รู้ว่าไฟล์นี้ทำงานฝั่ง Client (Browser)

import { useState } from 'react'; // นำเข้า Hook สำหรับจัดการ State
import { useRef } from 'react'; // นำเข้า useRef สำหรับอ้างอิง DOM element (input file)
import styles from './ProductForm.module.css'; // นำเข้าไฟล์ CSS สำหรับตกแต่ง Component นี้

// Component ฟอร์มสำหรับเพิ่ม/แก้ไขสินค้า
// รับ Props: initialData (ข้อมูลเดิม), onSubmit (ฟังก์ชันส่งข้อมูล), onDelete (ฟังก์ชันลบ), isEdit (โหมดแก้ไข)
export default function ProductForm({ initialData, onSubmit, onDelete, isEdit = false }) {
  // State เก็บข้อมูลในฟอร์ม โดยดึงค่าเดิมจาก initialData ถ้ามี
  const [formData, setFormData] = useState({
    name: initialData?.name || '',               // ชื่อสินค้า
    brand: initialData?.brand || '',             // แบรนด์
    category: initialData?.category || 'mouse', // หมวดหมู่ (ค่าเริ่มต้น: mouse)
    model: initialData?.model || '',             // รุ่น (ไม่บังคับ)
    description: initialData?.description || '', // คำอธิบายสินค้า
    condition: initialData?.condition || 'new', // สภาพสินค้า (ค่าเริ่มต้น: new)
    quantity: initialData?.quantity ?? 1,        // จำนวน (ค่าเริ่มต้น: 1)
    price: initialData?.price || '',             // ราคา
    image_url: initialData?.image_url || '',     // URL รูปภาพ
    seller_name: initialData?.seller_name || '', // ชื่อผู้ขาย
    seller_phone: initialData?.seller_phone || '' // เบอร์โทรผู้ขาย
  });
  const [imageFile, setImageFile] = useState(null); // เก็บไฟล์รูปภาพที่ผู้ใช้เลือก
  const [imagePreview, setImagePreview] = useState(initialData?.image_url || ''); // URL สำหรับแสดงตัวอย่างรูป
  const [uploading, setUploading] = useState(false); // สถานะกำลัง Upload รูป
  const [loading, setLoading] = useState(false); // สถานะกำลังส่งฟอร์ม
  const fileInputRef = useRef(null); // อ้างอิง input file เพื่อ trigger การเลือกไฟล์

  // ฟังก์ชันอัปเดต State เมื่อผู้ใช้กรอกข้อมูลในฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target; // ดึงชื่อ field และค่าที่กรอก
    setFormData(prev => ({ ...prev, [name]: value })); // อัปเดตเฉพาะ field ที่เปลี่ยน
  };

  // ฟังก์ชันจัดการเมื่อผู้ใช้เลือกไฟล์รูปภาพ
  const handleFileChange = (e) => {
    const file = e.target.files[0]; // ดึงไฟล์แรกที่เลือก
    if (file) {
      setImageFile(file); // บันทึกไฟล์เข้า State
      const reader = new FileReader(); // สร้าง FileReader เพื่ออ่านไฟล์
      reader.onloadend = () => {
        setImagePreview(reader.result); // เมื่ออ่านเสร็จ นำ Base64 ไปแสดงตัวอย่าง
      };
      reader.readAsDataURL(file); // อ่านไฟล์เป็น Data URL (Base64)
    }
  };

  // ฟังก์ชัน Upload รูปภาพไปยัง Server
  const uploadImage = async () => {
    if (!imageFile) return formData.image_url || null; // ถ้าไม่มีไฟล์ใหม่ ใช้ URL เดิม

    setUploading(true); // เปิดสถานะกำลัง Upload
    const uploadFormData = new FormData(); // สร้าง FormData สำหรับส่งไฟล์
    uploadFormData.append('file', imageFile); // เพิ่มไฟล์รูปภาพ

    try {
      const res = await fetch('/api/upload', {
        method: 'POST', // ส่งคำขอแบบ POST
        body: uploadFormData // ส่งไฟล์ในรูป FormData
      });

      if (!res.ok) {
        throw new Error('Upload failed'); // โยน Error ถ้า Upload ล้มเหลว
      }

      const data = await res.json(); // อ่าน URL ที่ได้จาก Server
      return data.url; // คืน URL ของรูปที่ Upload แล้ว
    } catch (error) {
      console.error('Upload error:', error); // แสดง Error ใน Console
      alert('Failed to upload image'); // แจ้งผู้ใช้ว่า Upload ไม่สำเร็จ
      return formData.image_url || null; // ใช้ URL เดิมถ้า Upload ล้มเหลว
    } finally {
      setUploading(false); // ปิดสถานะ Upload
    }
  };

  // ฟังก์ชันจัดการเมื่อผู้ใช้กดปุ่มบันทึก
  const handleSubmit = async (e) => {
    e.preventDefault(); // ป้องกันการ Reload หน้า
    setLoading(true); // เปิดสถานะกำลังบันทึก

    const imageUrl = await uploadImage(); // Upload รูปก่อน แล้วรับ URL กลับมา

    // จัดรูปแบบข้อมูลก่อนส่ง (Normalize)
    const submitData = {
      ...formData,
      quantity: parseInt(formData.quantity, 10) || 1, // แปลงจำนวนเป็น Integer
      price: parseFloat(formData.price) || 0,         // แปลงราคาเป็น Float
      model: formData.model?.trim() || null,           // แปลง string ว่างเป็น null
      description: formData.description?.trim() || null, // แปลง string ว่างเป็น null
      image_url: imageUrl || null                      // ใช้ URL รูปจาก Upload
    };

    await onSubmit(submitData); // ส่งข้อมูลไปยังฟังก์ชัน onSubmit ที่ Component แม่ส่งมา
    setLoading(false); // ปิดสถานะกำลังบันทึก
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}> {/* ฟอร์มหลัก */}
      <div className={styles.grid}> {/* Layout Grid สำหรับจัดฟอร์ม */}
        {/* ส่วน Upload รูปภาพสินค้า */}
        <div className={`${styles.field} ${styles.imageField}`}>
          <label>Product Image</label>
          <div className={styles.imageUpload} onClick={() => fileInputRef.current?.click()}>
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className={styles.preview} /> // แสดงตัวอย่างรูป
            ) : (
              <div className={styles.uploadPlaceholder}>
                <span>Click to upload image</span> {/* คำแนะนำให้คลิกเพื่อเลือกรูป */}
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange}
              accept="image/*" hidden /> {/* Input ไฟล์ซ่อน ถูก trigger จาก div ด้านบน */}
          </div>
          {uploading && <span className={styles.uploading}>Uploading...</span>} {/* แสดงขณะ Upload */}
        </div>

        {/* ช่องกรอกชื่อผู้ขาย */}
        <div className={styles.field}>
          <label>Seller Name *</label>
          <input type="text" name="seller_name" value={formData.seller_name}
            onChange={handleChange} required placeholder="Your name" />
        </div>

        {/* ช่องกรอกเบอร์โทรผู้ขาย */}
        <div className={styles.field}>
          <label>Seller Phone *</label>
          <input type="tel" name="seller_phone" value={formData.seller_phone}
            onChange={handleChange} required placeholder="08xxxxxxxx" />
        </div>

        {/* ช่องกรอกแบรนด์ */}
        <div className={styles.field}>
          <label>Brand *</label>
          <input type="text" name="brand" value={formData.brand}
            onChange={handleChange} required placeholder="e.g., Logitech, Razer" />
        </div>

        {/* Dropdown เลือกหมวดหมู่สินค้า */}
        <div className={styles.field}>
          <label>Category *</label>
          <select name="category" value={formData.category} onChange={handleChange} required>
            <option value="mouse">Mouse</option>       {/* เมาส์ */}
            <option value="keyboard">Keyboard</option> {/* คีย์บอร์ด */}
            <option value="headset">Headset</option>   {/* หูฟัง */}
            <option value="mousepad">Mousepad</option> {/* แผ่นรองเมาส์ */}
            <option value="other">Other</option>       {/* อื่นๆ */}
          </select>
        </div>

        {/* ช่องกรอกรุ่นสินค้า (ไม่บังคับ) */}
        <div className={styles.field}>
          <label>Model</label>
          <input type="text" name="model" value={formData.model}
            onChange={handleChange} placeholder="e.g., G Pro X, BlackWidow" />
        </div>

        {/* ช่องกรอกชื่อสินค้า */}
        <div className={styles.field}>
          <label>Product Name *</label>
          <input type="text" name="name" value={formData.name}
            onChange={handleChange} required placeholder="Product name" />
        </div>

        {/* Dropdown เลือกสภาพสินค้า */}
        <div className={styles.field}>
          <label>Condition *</label>
          <select name="condition" value={formData.condition} onChange={handleChange} required>
            <option value="new">มือ 1 (New)</option>   {/* สินค้าใหม่ */}
            <option value="used">มือ 2 (Used)</option> {/* สินค้ามือสอง */}
          </select>
        </div>

        {/* ช่องกรอกจำนวนสินค้า */}
        <div className={styles.field}>
          <label>Quantity *</label>
          <input type="number" name="quantity" value={formData.quantity}
            onChange={handleChange} min="1" required />
        </div>

        {/* ช่องกรอกราคา (บาท) */}
        <div className={styles.field}>
          <label>Price (THB) *</label>
          <input type="number" name="price" value={formData.price}
            onChange={handleChange} min="0" step="0.01" required placeholder="0" />
        </div>
      </div>

      {/* ช่องกรอกคำอธิบายสินค้า */}
      <div className={styles.field}>
        <label>Description</label>
        <textarea name="description" value={formData.description}
          onChange={handleChange} rows="4" placeholder="Product description..." />
      </div>

      {/* ปุ่มบันทึกและปุ่มลบ (แสดงเฉพาะโหมดแก้ไข) */}
      <div className={styles.buttons}>
        <button type="submit" disabled={loading || uploading} className={styles.submitButton}>
          {loading || uploading ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'} {/* ข้อความบนปุ่มเปลี่ยนตามสถานะ */}
        </button>
        {isEdit && onDelete && ( // แสดงปุ่มลบเฉพาะเมื่ออยู่ในโหมดแก้ไขเท่านั้น
          <button type="button" onClick={onDelete} className={styles.deleteButton}>
            Delete Product {/* ปุ่มลบสินค้า */}
          </button>
        )}
      </div>
    </form>
  );
}
