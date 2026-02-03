-- =========================================================
-- SEED FMCG SALES TEAM & ORDERS (2024-2025)
-- =========================================================

SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Get the FMCG Manager ID & Role
SET @mgr_fmcg = (SELECT id FROM users WHERE email = 'fmcg@inventory.com' LIMIT 1);
SET @role_sales = (SELECT id FROM roles WHERE name = 'SALES_EXECUTIVE' LIMIT 1);

-- 2. Cleanup old sales data to prevent duplicates
DELETE FROM sales_order_items WHERE sales_order_id IN (
    SELECT id FROM sales_orders WHERE created_by IN (
        SELECT id FROM users WHERE manager_id = @mgr_fmcg AND role_id = @role_sales
    )
);
DELETE FROM sales_orders WHERE created_by IN (
    SELECT id FROM users WHERE manager_id = @mgr_fmcg AND role_id = @role_sales
);
DELETE FROM users WHERE manager_id = @mgr_fmcg AND role_id = @role_sales;

-- 3. Create 4 Sales Executives
-- Password: 'Sales@123'
INSERT INTO users (email, password_hash, first_name, last_name, phone, department, role_id, manager_id, is_active, email_verified) VALUES
('sales.rahul@inventory.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYvKlN/X4.Aa', 'Rahul', 'Verma', '9111111111', 'FMCG', @role_sales, @mgr_fmcg, true, true),
('sales.sneha@inventory.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYvKlN/X4.Aa', 'Sneha', 'Reddy', '9111111112', 'FMCG', @role_sales, @mgr_fmcg, true, true),
('sales.amit@inventory.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYvKlN/X4.Aa', 'Amit', 'Singh', '9111111113', 'FMCG', @role_sales, @mgr_fmcg, true, true),
('sales.pooja@inventory.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYvKlN/X4.Aa', 'Pooja', 'Das', '9111111114', 'FMCG', @role_sales, @mgr_fmcg, true, true);

SET @s1 = (SELECT id FROM users WHERE email = 'sales.rahul@inventory.com' LIMIT 1);
SET @s2 = (SELECT id FROM users WHERE email = 'sales.sneha@inventory.com' LIMIT 1);
SET @s3 = (SELECT id FROM users WHERE email = 'sales.amit@inventory.com' LIMIT 1);
SET @s4 = (SELECT id FROM users WHERE email = 'sales.pooja@inventory.com' LIMIT 1);

-- 4. Create Customers
INSERT IGNORE INTO customers (name, email, phone, city, state, is_active) VALUES
-- Rahul's Customers
('Big Bazaar Store', 'store.mgroad@bigbazaar.com', '080-40001000', 'Bangalore', 'Karnataka', true),
('Reliance Fresh', 'manager.indiranagar@reliance.com', '080-22223333', 'Bangalore', 'Karnataka', true),
('Kirana King', 'rajesh.kirana@gmail.com', '9845098450', 'Mysore', 'Karnataka', true),
-- Sneha's Customers
('More Supermarket', 'procure@more.in', '040-66667777', 'Hyderabad', 'Telangana', true),
('Ratnadeep Stores', 'orders@ratnadeep.co.in', '040-55554444', 'Hyderabad', 'Telangana', true),
('Spencer Retail', 'stock@spencers.in', '044-88889999', 'Chennai', 'Tamil Nadu', true),
-- Amit's Customers
('D-Mart Delhi', 'delhi.hub@dmart.com', '011-45674567', 'New Delhi', 'Delhi', true),
('Easyday Club', 'contact@easyday.in', '0124-4567890', 'Gurugram', 'Haryana', true),
-- Pooja's Customers
('Metro Cash & Carry', 'b2b@metro.co.in', '022-67896789', 'Mumbai', 'Maharashtra', true),
('Star Bazaar', 'inventory@starbazaar.com', '022-33332222', 'Pune', 'Maharashtra', true);

-- Get Customer IDs
SET @c1 = (SELECT id FROM customers WHERE email = 'store.mgroad@bigbazaar.com' LIMIT 1);
SET @c2 = (SELECT id FROM customers WHERE email = 'procure@more.in' LIMIT 1);
SET @c3 = (SELECT id FROM customers WHERE email = 'delhi.hub@dmart.com' LIMIT 1);
SET @c4 = (SELECT id FROM customers WHERE email = 'b2b@metro.co.in' LIMIT 1);

-- Get Product IDs (FMCG)
SET @p_atta = (SELECT id FROM products WHERE sku = 'ITC-ASH-ATTA-5KG' LIMIT 1);
SET @p_maggi = (SELECT id FROM products WHERE sku = 'NES-MAGGI-SPL' LIMIT 1);
SET @p_surf = (SELECT id FROM products WHERE sku = 'HUL-SURF-EXCEL' LIMIT 1);
SET @p_brit = (SELECT id FROM products WHERE sku = 'BRI-GOOD-DAY' LIMIT 1);

-- 5. Create Sales Orders

-- Order 1: Rahul (2024 - Big Order)
INSERT INTO sales_orders (order_number, customer_id, order_date, status, subtotal, tax_amount, discount_amount, total_amount, created_by)
VALUES ('SO-FMCG-24-01', @c1, '2024-03-15 10:00:00', 'COMPLETED', 28500.00, 1425.00, 500.00, 29425.00, @s1);
SET @so1 = LAST_INSERT_ID();
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total)
VALUES (@so1, @p_atta, 100, 285.00, 28500.00);

-- Order 2: Rahul (2025)
INSERT INTO sales_orders (order_number, customer_id, order_date, status, subtotal, tax_amount, discount_amount, total_amount, created_by)
VALUES ('SO-FMCG-25-02', @c1, '2025-01-10 14:30:00', 'PENDING', 9600.00, 480.00, 0.00, 10080.00, @s1);
SET @so2 = LAST_INSERT_ID();
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total)
VALUES (@so2, @p_maggi, 50, 192.00, 9600.00);

-- Order 3: Sneha (2024)
INSERT INTO sales_orders (order_number, customer_id, order_date, status, subtotal, tax_amount, discount_amount, total_amount, created_by)
VALUES ('SO-FMCG-24-03', @c2, '2024-08-20 11:00:00', 'SHIPPED', 8600.00, 1548.00, 200.00, 9948.00, @s2);
SET @so3 = LAST_INSERT_ID();
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total)
VALUES (@so3, @p_surf, 20, 430.00, 8600.00);

-- Order 4: Amit (2025)
INSERT INTO sales_orders (order_number, customer_id, order_date, status, subtotal, tax_amount, discount_amount, total_amount, created_by)
VALUES ('SO-FMCG-25-04', @c3, '2025-02-05 09:45:00', 'COMPLETED', 24000.00, 1200.00, 1000.00, 24200.00, @s3);
SET @so4 = LAST_INSERT_ID();
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total)
VALUES (@so4, @p_brit, 200, 120.00, 24000.00);

-- Order 5: Pooja (2024 - Mixed)
INSERT INTO sales_orders (order_number, customer_id, order_date, status, subtotal, tax_amount, discount_amount, total_amount, created_by)
VALUES ('SO-FMCG-24-05', @c4, '2024-11-12 16:15:00', 'COMPLETED', 5700.00, 285.00, 0.00, 5985.00, @s4);
SET @so5 = LAST_INSERT_ID();
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total)
VALUES (@so5, @p_atta, 20, 285.00, 5700.00);

-- Order 6: Pooja (2025)
INSERT INTO sales_orders (order_number, customer_id, order_date, status, subtotal, tax_amount, discount_amount, total_amount, created_by)
VALUES ('SO-FMCG-25-06', @c4, '2025-03-01 10:30:00', 'PROCESSING', 19200.00, 960.00, 500.00, 19660.00, @s4);
SET @so6 = LAST_INSERT_ID();
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total)
VALUES (@so6, @p_maggi, 100, 192.00, 19200.00);

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;