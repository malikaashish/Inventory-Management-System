-- =========================================================
-- SEED DAIRY & GROCERIES SALES TEAM & ORDERS (2024-2025)
-- =========================================================

SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Get the Dairy Manager ID & Role
SET @mgr_dairy = (SELECT id FROM users WHERE email = 'dairy@inventory.com' LIMIT 1);
SET @role_sales = (SELECT id FROM roles WHERE name = 'SALES_EXECUTIVE' LIMIT 1);

-- 2. Cleanup old data
DELETE FROM sales_order_items WHERE sales_order_id IN (
    SELECT id FROM sales_orders WHERE created_by IN (
        SELECT id FROM users WHERE manager_id = @mgr_dairy AND role_id = @role_sales
    )
);
DELETE FROM sales_orders WHERE created_by IN (
    SELECT id FROM users WHERE manager_id = @mgr_dairy AND role_id = @role_sales
);
DELETE FROM users WHERE manager_id = @mgr_dairy AND role_id = @role_sales;

-- 3. Create 4 Sales Executives
-- Password: 'Sales@123'
INSERT INTO users (email, password_hash, first_name, last_name, phone, department, role_id, manager_id, is_active, email_verified) VALUES
('sales.karthik@inventory.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYvKlN/X4.Aa', 'Karthik', 'Raja', '9222222221', 'Dairy & Groceries', @role_sales, @mgr_dairy, true, true),
('sales.meera@inventory.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYvKlN/X4.Aa', 'Meera', 'Iyer', '9222222222', 'Dairy & Groceries', @role_sales, @mgr_dairy, true, true),
('sales.arjun@inventory.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYvKlN/X4.Aa', 'Arjun', 'Das', '9222222223', 'Dairy & Groceries', @role_sales, @mgr_dairy, true, true),
('sales.latha@inventory.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYvKlN/X4.Aa', 'Latha', 'Menon', '9222222224', 'Dairy & Groceries', @role_sales, @mgr_dairy, true, true);

SET @s1 = (SELECT id FROM users WHERE email = 'sales.karthik@inventory.com' LIMIT 1);
SET @s2 = (SELECT id FROM users WHERE email = 'sales.meera@inventory.com' LIMIT 1);
SET @s3 = (SELECT id FROM users WHERE email = 'sales.arjun@inventory.com' LIMIT 1);
SET @s4 = (SELECT id FROM users WHERE email = 'sales.latha@inventory.com' LIMIT 1);

-- 4. Create Customers
INSERT IGNORE INTO customers (name, email, phone, city, state, is_active) VALUES
-- Karthik's Customers
('Hotel Saravana Bhavan', 'purchasing@hsb.com', '044-24345678', 'Chennai', 'Tamil Nadu', true),
('Adyar Ananda Bhavan', 'info@a2b.in', '044-24456789', 'Chennai', 'Tamil Nadu', true),
('Murugan Idli Shop', 'orders@muruganidli.com', '044-24341234', 'Madurai', 'Tamil Nadu', true),
-- Meera's Customers
('Nilgiris Supermarket', 'store.manager@nilgiris.com', '080-25587654', 'Bangalore', 'Karnataka', true),
('MK Retail', 'purchase@mkretail.com', '080-25201234', 'Bangalore', 'Karnataka', true),
('Spar Hypermarket', 'bangalore@spar.in', '080-41112222', 'Bangalore', 'Karnataka', true),
-- Arjun's Customers
('Paradise Biryani', 'kitchen@paradise.in', '040-66661111', 'Hyderabad', 'Telangana', true),
('Karachi Bakery', 'sales@karachibakery.com', '040-24605678', 'Hyderabad', 'Telangana', true),
-- Latha's Customers
('Lulu Mall Hypermarket', 'kochi@lulu.in', '0484-2727777', 'Kochi', 'Kerala', true),
('Bismi Hypermarket', 'calicut@bismi.in', '0495-2345678', 'Kozhikode', 'Kerala', true);

-- Get Customer IDs
SET @c1 = (SELECT id FROM customers WHERE email = 'purchasing@hsb.com' LIMIT 1);
SET @c2 = (SELECT id FROM customers WHERE email = 'store.manager@nilgiris.com' LIMIT 1);
SET @c3 = (SELECT id FROM customers WHERE email = 'kitchen@paradise.in' LIMIT 1);
SET @c4 = (SELECT id FROM customers WHERE email = 'kochi@lulu.in' LIMIT 1);

-- Get Product IDs (Dairy)
SET @p_curd = (SELECT id FROM products WHERE sku = 'HAP-CURD-500' LIMIT 1);
SET @p_butter = (SELECT id FROM products WHERE sku = 'AMUL-BUTTER-500' LIMIT 1);
SET @p_ghee = (SELECT id FROM products WHERE sku = 'HER-GHEE-1L' LIMIT 1);
SET @p_paneer = (SELECT id FROM products WHERE sku = 'MM-PANEER-200' LIMIT 1);

-- 5. Create Sales Orders

-- Order 1: Karthik (2024 - Curd)
INSERT INTO sales_orders (order_number, customer_id, order_date, status, subtotal, tax_amount, discount_amount, total_amount, created_by)
VALUES ('SO-DAIRY-24-01', @c1, '2024-02-10 06:00:00', 'COMPLETED', 1900.00, 95.00, 0.00, 1995.00, @s1);
SET @so1 = LAST_INSERT_ID();
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total)
VALUES (@so1, @p_curd, 50, 38.00, 1900.00);

-- Order 2: Karthik (2025 - Butter)
INSERT INTO sales_orders (order_number, customer_id, order_date, status, subtotal, tax_amount, discount_amount, total_amount, created_by)
VALUES ('SO-DAIRY-25-02', @c1, '2025-01-05 07:30:00', 'PENDING', 5500.00, 660.00, 100.00, 6060.00, @s1);
SET @so2 = LAST_INSERT_ID();
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total)
VALUES (@so2, @p_butter, 20, 275.00, 5500.00);

-- Order 3: Meera (2024 - Paneer)
INSERT INTO sales_orders (order_number, customer_id, order_date, status, subtotal, tax_amount, discount_amount, total_amount, created_by)
VALUES ('SO-DAIRY-24-03', @c2, '2024-09-15 10:00:00', 'SHIPPED', 3450.00, 172.50, 50.00, 3572.50, @s2);
SET @so3 = LAST_INSERT_ID();
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total)
VALUES (@so3, @p_paneer, 30, 115.00, 3450.00);

-- Order 4: Arjun (2025 - Ghee)
INSERT INTO sales_orders (order_number, customer_id, order_date, status, subtotal, tax_amount, discount_amount, total_amount, created_by)
VALUES ('SO-DAIRY-25-04', @c3, '2025-03-01 11:00:00', 'COMPLETED', 6500.00, 780.00, 0.00, 7280.00, @s3);
SET @so4 = LAST_INSERT_ID();
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total)
VALUES (@so4, @p_ghee, 10, 650.00, 6500.00);

-- Order 5: Latha (2024 - Mixed)
INSERT INTO sales_orders (order_number, customer_id, order_date, status, subtotal, tax_amount, discount_amount, total_amount, created_by)
VALUES ('SO-DAIRY-24-05', @c4, '2024-12-20 14:00:00', 'COMPLETED', 4575.00, 300.00, 75.00, 4800.00, @s4);
SET @so5 = LAST_INSERT_ID();
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total)
VALUES (@so5, @p_butter, 10, 275.00, 2750.00),
       (@so5, @p_curd, 20, 38.00, 760.00); -- Wait, math: 2750 + 760 = 3510... Updating values for consistency
       
-- FIXING values for consistency:
-- Items: 10 * 275 = 2750
--        20 * 38 = 760
--        Total = 3510.
-- Tax ~ 10% = 351.
-- Discount = 0.
-- Total = 3861.
UPDATE sales_orders SET subtotal=3510.00, tax_amount=351.00, discount_amount=0.00, total_amount=3861.00 WHERE id=@so5;

-- Order 6: Latha (2025)
INSERT INTO sales_orders (order_number, customer_id, order_date, status, subtotal, tax_amount, discount_amount, total_amount, created_by)
VALUES ('SO-DAIRY-25-06', @c4, '2025-02-14 09:30:00', 'PROCESSING', 2300.00, 115.00, 0.00, 2415.00, @s4);
SET @so6 = LAST_INSERT_ID();
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total)
VALUES (@so6, @p_paneer, 20, 115.00, 2300.00);

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;