-- =========================================================
-- SEED ELECTRONICS SALES TEAM & ORDERS (2024-2025)
-- =========================================================

SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Get the Electronics Manager ID & Role
SET @mgr_id = (SELECT id FROM users WHERE email = 'electronics@inventory.com' LIMIT 1);
SET @role_sales = (SELECT id FROM roles WHERE name = 'SALES_EXECUTIVE' LIMIT 1);

-- 2. Cleanup old sales data to prevent duplicates
DELETE FROM sales_order_items WHERE sales_order_id IN (
    SELECT id FROM sales_orders WHERE created_by IN (
        SELECT id FROM users WHERE manager_id = @mgr_id AND role_id = @role_sales
    )
);
DELETE FROM sales_orders WHERE created_by IN (
    SELECT id FROM users WHERE manager_id = @mgr_id AND role_id = @role_sales
);
DELETE FROM users WHERE manager_id = @mgr_id AND role_id = @role_sales;

-- 3. Create 4 Sales Executives
-- Password: 'Sales@123'
INSERT INTO users (email, password_hash, first_name, last_name, phone, department, role_id, manager_id, is_active, email_verified) VALUES
('sales.alex@inventory.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYvKlN/X4.Aa', 'Alex', 'Sales', '9000000001', 'Electronics', @role_sales, @mgr_id, true, true),
('sales.betty@inventory.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYvKlN/X4.Aa', 'Betty', 'Sales', '9000000002', 'Electronics', @role_sales, @mgr_id, true, true),
('sales.charlie@inventory.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYvKlN/X4.Aa', 'Charlie', 'Sales', '9000000003', 'Electronics', @role_sales, @mgr_id, true, true),
('sales.diana@inventory.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYvKlN/X4.Aa', 'Diana', 'Sales', '9000000004', 'Electronics', @role_sales, @mgr_id, true, true);

SET @u1 = (SELECT id FROM users WHERE email = 'sales.alex@inventory.com' LIMIT 1);
SET @u2 = (SELECT id FROM users WHERE email = 'sales.betty@inventory.com' LIMIT 1);
SET @u3 = (SELECT id FROM users WHERE email = 'sales.charlie@inventory.com' LIMIT 1);
SET @u4 = (SELECT id FROM users WHERE email = 'sales.diana@inventory.com' LIMIT 1);

-- 4. Create Customers (Using INSERT IGNORE to skip duplicates)
INSERT IGNORE INTO customers (name, email, phone, city, state, is_active) VALUES
('Ravi Kumar', 'ravi.k@gmail.com', '9876543211', 'Mumbai', 'Maharashtra', true),
('Anita Desai', 'anita.d@yahoo.com', '9876543212', 'Pune', 'Maharashtra', true),
('Tech Solutions Ltd', 'procurement@techsol.in', '022-45678900', 'Mumbai', 'Maharashtra', true),
('Suresh Reddy', 'suresh.r@hotmail.com', '9876543213', 'Hyderabad', 'Telangana', true),
('Global Info Systems', 'admin@gis.com', '040-12345678', 'Hyderabad', 'Telangana', true),
('Priya Menon', 'priya.m@gmail.com', '9876543214', 'Chennai', 'Tamil Nadu', true),
('Vikram Singh', 'vikram.s@gmail.com', '9876543215', 'Delhi', 'Delhi', true),
('StartUp Hub', 'ops@startuphub.in', '011-23456789', 'Gurugram', 'Haryana', true),
('Kiran Patel', 'kiran.p@gmail.com', '9876543216', 'Ahmedabad', 'Gujarat', true),
('NextGen Electronics', 'store@nextgen.com', '079-98765432', 'Surat', 'Gujarat', true);

-- Get Customer IDs (Limit 1 prevents subquery error if dupes exist)
SET @c1 = (SELECT id FROM customers WHERE email = 'ravi.k@gmail.com' LIMIT 1);
SET @c3 = (SELECT id FROM customers WHERE email = 'procurement@techsol.in' LIMIT 1);
SET @c4 = (SELECT id FROM customers WHERE email = 'suresh.r@hotmail.com' LIMIT 1);
SET @c8 = (SELECT id FROM customers WHERE email = 'ops@startuphub.in' LIMIT 1);
SET @c9 = (SELECT id FROM customers WHERE email = 'kiran.p@gmail.com' LIMIT 1);
SET @c10 = (SELECT id FROM customers WHERE email = 'store@nextgen.com' LIMIT 1);

SET @p_s24 = (SELECT id FROM products WHERE sku = 'SAM-S24-ULTRA' LIMIT 1);
SET @p_lenovo = (SELECT id FROM products WHERE sku = 'LEN-X1-CARB' LIMIT 1);
SET @p_noise = (SELECT id FROM products WHERE sku = 'NOI-COLORFIT' LIMIT 1);
SET @p_xiaomi = (SELECT id FROM products WHERE sku = 'MI-14-CIVI' LIMIT 1);

-- 5. Create Sales Orders

-- Order 1: Alex (2024)
INSERT INTO sales_orders (order_number, customer_id, order_date, status, subtotal, tax_amount, discount_amount, total_amount, created_by)
VALUES ('SO-2024-001', @c1, '2024-05-10 10:30:00', 'COMPLETED', 129999.00, 23400.00, 0.00, 153399.00, @u1);
SET @so1 = LAST_INSERT_ID();
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total)
VALUES (@so1, @p_s24, 1, 129999.00, 129999.00);

-- Order 2: Alex (2025)
INSERT INTO sales_orders (order_number, customer_id, order_date, status, subtotal, tax_amount, discount_amount, total_amount, created_by)
VALUES ('SO-2025-002', @c3, '2025-01-15 14:00:00', 'SHIPPED', 370000.00, 66600.00, 5000.00, 431600.00, @u1);
SET @so2 = LAST_INSERT_ID();
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total)
VALUES (@so2, @p_lenovo, 2, 185000.00, 370000.00);

-- Order 3: Betty (2024)
INSERT INTO sales_orders (order_number, customer_id, order_date, status, subtotal, tax_amount, discount_amount, total_amount, created_by)
VALUES ('SO-2024-003', @c4, '2024-11-20 09:15:00', 'COMPLETED', 6998.00, 1260.00, 0.00, 8258.00, @u2);
SET @so3 = LAST_INSERT_ID();
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total)
VALUES (@so3, @p_noise, 2, 3499.00, 6998.00);

-- Order 4: Charlie (2025)
INSERT INTO sales_orders (order_number, customer_id, order_date, status, subtotal, tax_amount, discount_amount, total_amount, created_by)
VALUES ('SO-2025-004', @c8, '2025-02-01 11:45:00', 'PENDING', 214995.00, 38699.00, 0.00, 253694.00, @u3);
SET @so4 = LAST_INSERT_ID();
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total)
VALUES (@so4, @p_xiaomi, 5, 42999.00, 214995.00);

-- Order 5: Diana (2024)
INSERT INTO sales_orders (order_number, customer_id, order_date, status, subtotal, tax_amount, discount_amount, total_amount, created_by)
VALUES ('SO-2024-005', @c10, '2024-08-15 16:20:00', 'COMPLETED', 185000.00, 33300.00, 1000.00, 217300.00, @u4);
SET @so5 = LAST_INSERT_ID();
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total)
VALUES (@so5, @p_lenovo, 1, 185000.00, 185000.00);

-- Order 6: Diana (2025)
INSERT INTO sales_orders (order_number, customer_id, order_date, status, subtotal, tax_amount, discount_amount, total_amount, created_by)
VALUES ('SO-2025-006', @c9, '2025-03-10 10:00:00', 'PROCESSING', 132998.00, 23940.00, 0.00, 156938.00, @u4);
SET @so6 = LAST_INSERT_ID();
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total)
VALUES (@so6, @p_s24, 1, 129999.00, 129999.00),
       (@so6, @p_noise, 1, 2999.00, 2999.00);

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;