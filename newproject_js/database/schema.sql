-- =====================================================
-- Click & Clack - Gaming Gear Marketplace Database Schema
-- For TiDB / MySQL
-- =====================================================

-- Create database (run this first if database doesn't exist)
-- CREATE DATABASE IF NOT EXISTS clickclack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE clickclack;

-- =====================================================
-- 1. PRODUCTS TABLE
-- เก็บข้อมูลสินค้าทั้งหมด
-- =====================================================
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS products;

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'ชื่อสินค้า',
    brand VARCHAR(100) NOT NULL COMMENT 'แบรนด์ เช่น Logitech, Razer',
    category ENUM('mouse', 'keyboard', 'headset', 'mousepad', 'other') NOT NULL COMMENT 'ประเภทสินค้า',
    model VARCHAR(255) COMMENT 'รุ่น เช่น G Pro X',
    description TEXT COMMENT 'รายละเอียดสินค้า',
    `condition` ENUM('new', 'used') NOT NULL COMMENT 'มือ 1 หรือ มือ 2',
    quantity INT DEFAULT 1 COMMENT 'จำนวนคงเหลือ',
    price DECIMAL(10,2) NOT NULL COMMENT 'ราคา',
    image_url VARCHAR(500) COMMENT 'ลิงก์รูปภาพ',
    seller_name VARCHAR(255) NOT NULL COMMENT 'ชื่อผู้ขาย',
    seller_phone VARCHAR(20) NOT NULL COMMENT 'เบอร์ผู้ขาย',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_category (category),
    INDEX idx_condition (`condition`),
    INDEX idx_price (price),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางสินค้า';

-- =====================================================
-- 2. CART_ITEMS TABLE
-- เก็บสินค้าในตะกร้า (session-based)
-- =====================================================
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL COMMENT 'รหัสสินค้า',
    quantity INT DEFAULT 1 COMMENT 'จำนวน',
    session_id VARCHAR(255) NOT NULL COMMENT 'รหัส session',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_session (session_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตะกร้าสินค้า';

-- =====================================================
-- 3. ORDERS TABLE
-- เก็บคำสั่งซื้อ
-- =====================================================
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL COMMENT 'ชื่อผู้ซื้อ',
    customer_phone VARCHAR(20) NOT NULL COMMENT 'เบอร์ผู้ซื้อ',
    address TEXT NOT NULL COMMENT 'ที่อยู่จัดส่ง',
    postal_code VARCHAR(10) NOT NULL COMMENT 'รหัสไปรษณีย์',
    shipping_method ENUM('standard', 'express') NOT NULL COMMENT 'ปกติ 50 บาท / ไว 100 บาท',
    shipping_cost DECIMAL(10,2) NOT NULL COMMENT 'ค่าส่ง',
    total_amount DECIMAL(10,2) NOT NULL COMMENT 'ยอดรวมทั้งหมด',
    `status` ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending' COMMENT 'สถานะ',
    payment_proof VARCHAR(500) COMMENT 'ลิงก์หลักฐานการโอน (ถ้ามี)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_status (`status`),
    INDEX idx_created (created_at),
    INDEX idx_customer_phone (customer_phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='คำสั่งซื้อ';

-- =====================================================
-- 4. ORDER_ITEMS TABLE
-- เก็บรายละเอียดสินค้าในแต่ละคำสั่งซื้อ
-- =====================================================
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL COMMENT 'รหัสคำสั่งซื้อ',
    product_id INT NOT NULL COMMENT 'รหัสสินค้า',
    quantity INT NOT NULL COMMENT 'จำนวน',
    price DECIMAL(10,2) NOT NULL COMMENT 'ราคาตอนซื้อ',

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='รายการสินค้าในคำสั่งซื้อ';

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- สินค้าตัวอย่าง
INSERT INTO products (name, brand, category, model, description, `condition`, quantity, price, image_url, seller_name, seller_phone) VALUES
('Logitech G Pro X Superlight', 'Logitech', 'mouse', 'G Pro X', 'เมาส์เกมมิ่งเบา 63g sensor HERO 25K', 'new', 5, 4590, '/uploads/sample-mouse-1.jpg', 'Gamer Shop', '0812345678'),
('Razer BlackWidow V3', 'Razer', 'keyboard', 'BlackWidow V3', 'คีย์บอร์ด机械 RGB สwitzerland', 'new', 3, 5990, '/uploads/sample-keyboard-1.jpg', 'Razer Thailand', '0898765432'),
('HyperX Cloud II', 'HyperX', 'headset', 'Cloud II', 'หูฟังเกมมิ่ง 7.1 surround', 'used', 1, 2500, '/uploads/sample-headset-1.jpg', 'SecondHandGamer', '0955512345'),
('Glorious Model O', 'Glorious', 'mouse', 'Model O', 'เมาส์ ultralight 67g honeycomb', 'new', 8, 2890, '/uploads/sample-mouse-2.jpg', 'PC Component', '0822223333'),
('Keychron K2', 'Keychron', 'keyboard', 'K2', 'คีย์บอร์ด mechanical ไร้สาย', 'used', 2, 3200, '/uploads/sample-keyboard-2.jpg', 'Keyboard Lover', '0833334444'),
('SteelSeries QcK Heavy', 'SteelSeries', 'mousepad', 'QcK Heavy', 'แผ่นรองเมาส์ XL หนา 6mm', 'new', 10, 890, '/uploads/sample-mousepad-1.jpg', 'Gaming Gear TH', '0844445555');

-- =====================================================
-- VIEWS (Optional - สำหรับการ query ที่ซับซ้อน)
-- =====================================================

-- ดูสินค้าพร้อมสถิติ (ใช้กับ TiDB ที่รองรับ CTE)
CREATE OR REPLACE VIEW product_summary AS
SELECT
    p.*,
    CASE
        WHEN p.condition = 'new' THEN 'มือ 1'
        ELSE 'มือ 2'
    END as condition_label,
    CASE
        WHEN p.category = 'mouse' THEN 'Mouse'
        WHEN p.category = 'keyboard' THEN 'Keyboard'
        WHEN p.category = 'headset' THEN 'Headset'
        WHEN p.category = 'mousepad' THEN 'Mousepad'
        ELSE 'Other'
    END as category_label
FROM products p;

-- ดูยอดขายสินค้า
CREATE OR REPLACE VIEW product_sales AS
SELECT
    p.id,
    p.name,
    p.brand,
    p.category,
    COUNT(DISTINCT o.id) as order_count,
    COALESCE(SUM(oi.quantity), 0) as total_sold,
    COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
GROUP BY p.id, p.name, p.brand, p.category;

-- =====================================================
-- STORED PROCEDURES (Optional - สำหรับ TiDB)
-- =====================================================

DELIMITER //

-- สร้างคำสั่งซื้อใหม่พร้อมย้ายตะกร้า
CREATE PROCEDURE CreateOrderFromCart(
    IN p_session_id VARCHAR(255),
    IN p_customer_name VARCHAR(255),
    IN p_customer_phone VARCHAR(20),
    IN p_address TEXT,
    IN p_postal_code VARCHAR(10),
    IN p_shipping_method ENUM('standard', 'express'),
    IN p_payment_proof VARCHAR(500),
    OUT p_order_id INT,
    OUT p_total_amount DECIMAL(10,2)
)
BEGIN
    DECLARE v_shipping_cost DECIMAL(10,2);
    DECLARE v_subtotal DECIMAL(10,2);

    -- คำนวณค่าส่ง
    SET v_shipping_cost = CASE WHEN p_shipping_method = 'express' THEN 100 ELSE 50 END;

    -- คำนวณยอดรวมสินค้า
    SELECT COALESCE(SUM(c.quantity * p.price), 0) INTO v_subtotal
    FROM cart_items c
    JOIN products p ON c.product_id = p.id
    WHERE c.session_id = p_session_id;

    SET p_total_amount = v_subtotal + v_shipping_cost;

    -- สร้าง order
    INSERT INTO orders (
        customer_name, customer_phone, address, postal_code,
        shipping_method, shipping_cost, total_amount, payment_proof
    ) VALUES (
        p_customer_name, p_customer_phone, p_address, p_postal_code,
        p_shipping_method, v_shipping_cost, p_total_amount, p_payment_proof
    );

    SET p_order_id = LAST_INSERT_ID();

    -- ย้ายรายการจาก cart ไป order_items
    INSERT INTO order_items (order_id, product_id, quantity, price)
    SELECT p_order_id, c.product_id, c.quantity, p.price
    FROM cart_items c
    JOIN products p ON c.product_id = p.id
    WHERE c.session_id = p_session_id;

    -- ลดจำนวนสินค้า
    UPDATE products p
    JOIN cart_items c ON p.id = c.product_id
    SET p.quantity = p.quantity - c.quantity
    WHERE c.session_id = p_session_id;

    -- ล้างตะกร้า
    DELETE FROM cart_items WHERE session_id = p_session_id;
END //

-- ดูรายละเอียดคำสั่งซื้อ
CREATE PROCEDURE GetOrderDetails(IN p_order_id INT)
BEGIN
    SELECT
        o.*,
        oi.product_id,
        oi.quantity as item_quantity,
        oi.price as item_price,
        p.name as product_name,
        p.image_url
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE o.id = p_order_id;
END //

DELIMITER ;

-- =====================================================
-- TRIGGERS (Optional)
-- =====================================================

-- อัปเดตเวลาเมื่อแก้ไขสินค้า
DELIMITER //
CREATE TRIGGER update_product_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- =====================================================
-- QUERY EXAMPLES (ตัวอย่างการใช้งาน)
-- =====================================================

/*
-- ดูสินค้าทั้งหมดเรียงตามวันที่
SELECT * FROM products ORDER BY created_at DESC;

-- ดูสินค้ามือ 1 (new) เฉพาะเมาส์
SELECT * FROM products WHERE condition = 'new' AND category = 'mouse';

-- ดูสินค้าในตะกร้าของ session
SELECT c.*, p.name, p.price, p.image_url
FROM cart_items c
JOIN products p ON c.product_id = p.id
WHERE c.session_id = 'your-session-id';

-- ดูคำสั่งซื้อพร้อมรายการสินค้า
SELECT
    o.id, o.customer_name, o.total_amount, o.status,
    oi.product_id, oi.quantity, oi.price, p.name as product_name
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.id = 1;

-- ดูยอดขายรวม
SELECT
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    SUM(shipping_cost) as total_shipping
FROM orders
WHERE status != 'cancelled';

-- ดูสินค้าขายดี
SELECT p.name, COUNT(oi.id) as times_ordered, SUM(oi.quantity) as total_quantity
FROM products p
JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id
ORDER BY total_quantity DESC
LIMIT 10;
*/

-- =====================================================
-- END OF SCHEMA
-- =====================================================
