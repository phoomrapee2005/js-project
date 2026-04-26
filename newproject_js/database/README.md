# Click & Clack Database

## Database Schema Overview

| Table | Description |
|-------|-------------|
| `products` | เก็บข้อมูลสินค้าทั้งหมด |
| `cart_items` | เก็บสินค้าในตะกร้า (session-based) |
| `orders` | เก็บคำสั่งซื้อ |
| `order_items` | เก็บรายละเอียดสินค้าในแต่ละคำสั่งซื้อ |

## ER Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  products   │       │ order_items │       │   orders    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──────┤ product_id  │       │ id (PK)     │
│ name        │       │ order_id    │──────►│ customer_*  │
│ brand       │       │ quantity    │       │ total_*     │
│ category    │       │ price       │       │ status      │
│ condition   │       └─────────────┘       └─────────────┘
│ price       │
│ quantity    │
│ seller_*    │
└─────────────┘
       ▲
       │
┌──────┴──────┐
│  cart_items   │
├───────────────┤
│ id (PK)       │
│ product_id    │
│ session_id    │
│ quantity      │
└───────────────┘
```

## Setup Instructions

### 1. สร้าง Database ใน DBeaver

```sql
CREATE DATABASE IF NOT EXISTS clickclack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE clickclack;
```

### 2. รัน Schema

เปิดไฟล์ `schema.sql` ใน DBeaver แล้ว Execute ทั้งหมด

หรือรันทีละส่วน:

```sql
-- 1. สร้างตาราง
-- 2. เพิ่ม sample data
-- 3. สร้าง views และ procedures
```

### 3. เช็คว่าสร้างสำเร็จ

```sql
SHOW TABLES;
DESCRIBE products;
DESCRIBE orders;
```

## Connection String

```
mysql://username:password@host:4000/clickclack?sslaccept=strict
```

## Common Queries

### ดูสินค้าทั้งหมด
```sql
SELECT * FROM products ORDER BY created_at DESC;
```

### ดูตะกร้าของ session
```sql
SELECT c.*, p.name, p.price, p.image_url
FROM cart_items c
JOIN products p ON c.product_id = p.id
WHERE c.session_id = 'your-session-id';
```

### ดูคำสั่งซื้อพร้อมรายละเอียด
```sql
SELECT o.*, oi.product_id, oi.quantity, p.name as product_name
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.id = 1;
```

### ดูยอดขายรวม
```sql
SELECT 
    COUNT(*) as total_orders,
    SUM(total_amount) as revenue
FROM orders 
WHERE status != 'cancelled';
```

## Backup & Restore

### Backup
```bash
mysqldump -h gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com -P 4000 -u username -p clickclack > backup.sql
```

### Restore
```bash
mysql -h gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com -P 4000 -u username -p clickclack < backup.sql
```

## Troubleshooting

| Error | Solution |
|-------|----------|
| `Access denied` | ตรวจสอบ username/password |
| `Unknown database` | รันคำสั่ง CREATE DATABASE ก่อน |
| `SSL connection error` | เปิด SSL ใน connection settings |
| `Table doesn't exist` | รัน schema.sql ใหม่ |

## Indexes

ตารางมี indexes ที่จำเป็นแล้ว:
- `products`: category, condition, price, created_at
- `cart_items`: session_id, product_id
- `orders`: status, created_at, customer_phone
- `order_items`: order_id, product_id
