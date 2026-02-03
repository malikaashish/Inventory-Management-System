-- =========================================================
-- SEED FASHION SALES TEAM & ORDERS (2024-2025)
-- =========================================================

SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Get the Fashion Manager ID & Role
SET @mgr_fashion = (SELECT id FROM users WHERE email = 'fashion@inventory.com' LIMIT 1);
SET @role_sales = (SELECT id FROM roles WHERE name = 'SALES_EXECUTIVE' LIMIT 1);

-- 2. Cleanup old data
DELETE FROM sales_order_items WHERE sales_order_id IN (
    SELECT id FROM sales_orders WHERE created_by IN (
        SELECT id FROM users WHERE manager_id = @mgr_fashion AND role_id = @role_sales
    )
);
DELETE FROM sales_orders WHERE created_by IN (
    SELECT id FROM users WHERE manager_id = @mgr_fashion AND role_id = @role_sales
);
DELETE FROM users WHERE manager_id = @mgr_fashion AND role_id = @role_sales;

-- 3. Create 4 Sales Executives
-- Password: 'Sales@123'
INSERT INTO users (email, password_hash, first_name, last_name, phone, department, role_id, manager_id, is_active, email_verified) VALUES
('sales.zara@inventory.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYvKlN/X4.Aa', 'Zara', 'Khan', '9333333331', 'Men & Women Wear', @role_sales, @mgr_fashion, true, true),
('sales.kabir@inventory.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYvKlN/X4.Aa', 'Kabir', 'Singh', '9333333332', 'Men & Women Wear', @role_sales, @mgr_fashion, true, true),
('sales.ria@inventory.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYvKlN/X4.Aa', 'Ria', 'Sharma', '9333333333', 'Men & Women Wear', @role_sales, @mgr_fashion, true, true),
('sales.vihaan@inventory.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYvKlN/X4.Aa', 'Vihaan', 'Mehta', '9333333334', 'Men & Women Wear', @role_sales, @mgr_fashion, true, true);

SET @s1 = (SELECT id FROM users WHERE email = 'sales.zara@inventory.com' LIMIT 1);
SET @s2 = (SELECT id FROM users WHERE email = 'sales.kabir@inventory.com' LIMIT 1);
SET @s3 = (SELECT id FROM users WHERE email = 'sales.ria@inventory.com' LIMIT 1);
SET @s4 = (SELECT id FROM users WHERE email = 'sales.vihaan@inventory.com' LIMIT 1);

-- 4. Create Customers
INSERT IGNORE INTO customers (name, email, phone, city, state, is_active) VALUES
-- Zara's Customers
('Shoppers Stop', 'buying@shoppersstop.com', '022-11223344', 'Mumbai', 'Maharashtra', true),
('Lifestyle Stores', 'orders@lifestylestores.com', '080-55667788', 'Bangalore', 'Karnataka', true),
('Westside', 'stock@westside.com', '022-99887766', 'Mumbai', 'Maharashtra', true),
-- Kabir's Customers
('Pantaloons', 'inventory@pantaloons.com', '022-44556677', 'Mumbai', 'Maharashtra', true),
('Reliance Trends', 'manager@trends.com', '080-33445566', 'Bangalore', 'Karnataka', true),
-- Ria's Customers
('Max Fashion', 'buying@maxfashion.com', '080-77889900', 'Bangalore', 'Karnataka', true),
('FabIndia', 'crafts@fabindia.com', '011-22334455', 'New Delhi', 'Delhi', true),
-- Vihaan's Customers
('H&M India', 'store.delhi@hm.com', '011-66778899', 'New Delhi', 'Delhi', true),
('Zara India', 'manager.mumbai@zara.com', '022-88990011', 'Mumbai', 'Maharashtra', true);

-- Get Customer IDs
SET @c1 = (SELECT id FROM customers WHERE email = 'buying@shoppersstop.com' LIMIT 1);
SET @c2 = (SELECT id FROM customers WHERE email = 'inventory@pantaloons.com' LIMIT 1);
SET @c3 = (SELECT id FROM customers WHERE email = 'buying@maxfashion.com' LIMIT 1);
SET @c4 = (SELECT id FROM customers WHERE email = 'store.delhi@hm.com' LIMIT 1);

-- Get Product IDs (Fashion)
SET @p_jeans = (SELECT id FROM products WHERE sku = 'LC-JEANS-M-SLIM' LIMIT 1);
SET @p_shirt = (SELECT id FROM products WHERE sku = 'VH-FORMAL-SHIRT' LIMIT 1);
SET @p_dress = (SELECT id FROM products WHERE sku = 'VH-WMN-DRESS' LIMIT 1);
SET @p_tshirt = (SELECT id FROM products WHERE sku = 'AS-POLO-TEE' LIMIT 1);

-- 5. Create Sales Orders

-- Order 1: Zara (2024 - Jeans)
INSERT INTO sales_orders (order_number, customer_id, order_date, status, subtotal, tax_amount, discount_amount, total_amount, created_by)
VALUES ('SO-FASH-24-01', @c1, '2024-04-10 11:00:00', 'COMPLETED', 124950.00, 14994.00, 5000.00, 134944.00, @s1);
SET @so1 = LAST_INSERT_ID();
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total)
VALUES (@so1, @p_jeans, 50, 2499.00, 124950.00);

-- Order 2: Zara (2025 - Shirts)
INSERT INTO sales_orders (order_number, customer_id, order_date, status, subtotal, tax_amount, discount_amount, total_amount, created_by)
VALUES ('SO-FASH-25-02', @c1, '2025-01-20 15:30:00', 'PENDING', 45980.00, 5517.60, 0.00, 51497.60, @s1);
SET @so2 = LAST_INSERT_ID();
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total)
VALUES (@so2, @p_shirt, 20, 2299.00, 45980.00);

-- Order 3: Kabir (2024 - Dresses)
INSERT INTO sales_orders (order_number, customer_id, order_date, status, subtotal, tax_amount, discount_amount, total_amount, created_by)
VALUES ('SO-FASH-24-03', @c2, '2024-10-05 13:45:00', 'SHIPPED', 34990.00, 4198.80, 1000.00, 38188.80, @s2);
SET @so3 = LAST_INSERT_ID();
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total)
VALUES (@so3, @p_dress, 10, 3499.00, 34990.00);

-- Order 4: Ria (2025 - Polos)
INSERT INTO sales_orders (order_number, customer_id, order_date, status, subtotal, tax_amount, discount_amount, total_amount, created_by)
VALUES ('SO-FASH-25-04', @c3, '2025-02-15 10:30:00', 'COMPLETED', 109900.00, 13188.00, 2000.00, 121088.00, @s3);
SET @so4 = LAST_INSERT_ID();
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total)
VALUES (@so4, @p_tshirt, 100, 1099.00, 109900.00);

-- Order 5: Vihaan (2024 - Mixed)
INSERT INTO sales_orders (order_number, customer_id, order_date, status, subtotal, tax_amount, discount_amount, total_amount, created_by)
VALUES ('SO-FASH-24-05', @c4, '2024-12-01 17:00:00', 'COMPLETED', 7996.00, 959.52, 0.00, 8955.52, @s4);
SET @so5 = LAST_INSERT_ID();
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total)
VALUES (@so5, @p_jeans, 2, 2499.00, 4998.00),
       (@so5, @p_shirt, 1, 2299.00, 2299.00); 
       -- Note: Logic check: 4998+2299=7297... Updating subtotal to match sum.
UPDATE sales_orders SET subtotal=7297.00, tax_amount=875.64, total_amount=8172.64 WHERE id=@so5;

-- Order 6: Vihaan (2025)
INSERT INTO sales_orders (order_number, customer_id, order_date, status, subtotal, tax_amount, discount_amount, total_amount, created_by)
VALUES ('SO-FASH-25-06', @c4, '2025-03-05 11:15:00', 'PROCESSING', 34990.00, 4198.80, 500.00, 38688.80, @s4);
SET @so6 = LAST_INSERT_ID();
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total)
VALUES (@so6, @p_dress, 10, 3499.00, 34990.00);

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;