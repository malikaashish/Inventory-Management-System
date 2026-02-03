-- =========================================================
-- SAFELY CLEANUP OLD DATA (If exists for this department)
-- =========================================================

SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Find Staff ID
SET @staff_id = (SELECT id FROM users WHERE email = 'fashion@inventory.com');

-- 2. Delete dependent data
DELETE FROM product_suppliers WHERE product_id IN (SELECT id FROM products WHERE created_by = @staff_id);
DELETE FROM sales_order_items WHERE product_id IN (SELECT id FROM products WHERE created_by = @staff_id);
DELETE FROM purchase_order_items WHERE product_id IN (SELECT id FROM products WHERE created_by = @staff_id);
DELETE FROM stock_adjustments WHERE product_id IN (SELECT id FROM products WHERE created_by = @staff_id);

-- 3. Delete products
DELETE FROM products WHERE created_by = @staff_id;

-- 4. Delete suppliers and their POs
DELETE FROM purchase_orders WHERE supplier_id IN (SELECT id FROM suppliers WHERE created_by = @staff_id);
DELETE FROM suppliers WHERE created_by = @staff_id;

-- 5. Delete user
DELETE FROM users WHERE email = 'fashion@inventory.com';

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;


-- =========================================================
-- INSERT NEW INDIAN DATA (Men & Women Wear)
-- =========================================================

-- 1. Ensure Category exists
INSERT INTO categories (name, description, is_active) 
VALUES ('Fashion & Apparel', 'Men and Women Clothing, Footwear, and Accessories', true)
ON DUPLICATE KEY UPDATE description=VALUES(description);

SET @cat_id = (SELECT id FROM categories WHERE name = 'Fashion & Apparel');

-- 2. Create Inventory Staff
-- Password: 'Staff@123'
INSERT INTO users (email, password_hash, first_name, last_name, phone, department, role_id, is_active, email_verified)
VALUES ('fashion@inventory.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYvKlN/X4.Aa', 'Sneha', 'Kapoor', '9988776655', 'Men & Women Wear', 2, true, true);

SET @staff_id = (SELECT id FROM users WHERE email = 'fashion@inventory.com');

-- 3. Create Suppliers (Aditya Birla Fashion & Retail / Future Group context)
INSERT INTO suppliers (name, contact_person, email, phone, address, city, state, country, postal_code, is_active, created_by) VALUES 
('Lee Cooper India', 'Rakesh Biyani', 'support@leecooper.in', '022-6119-5000', 'Knowledge House, Shyam Nagar, Jogeshwari', 'Mumbai', 'Maharashtra', 'India', '400060', true, @staff_id),
('Van Heusen (ABFRL)', 'Vishak Kumar', 'customerservice@abfrl.adityabirla.com', '080-6727-1600', 'Divyasree Technopolis, Yemalur Post', 'Bangalore', 'Karnataka', 'India', '560037', true, @staff_id),
('Peter England', 'Manish Singhai', 'peterengland.care@abfrl.com', '1800-425-3050', 'Madura Fashion, 7th Floor, Skyline Icon', 'Bangalore', 'Karnataka', 'India', '560025', true, @staff_id),
('Allen Solly', 'Richa Pai', 'allensolly.care@abfrl.com', '080-4354-6300', 'Plot No. 5B, Doddanekundi Industrial Area', 'Bangalore', 'Karnataka', 'India', '560048', true, @staff_id);

-- Get Supplier IDs
SET @sup_lee = (SELECT id FROM suppliers WHERE name = 'Lee Cooper India');
SET @sup_van = (SELECT id FROM suppliers WHERE name = 'Van Heusen (ABFRL)');
SET @sup_pe = (SELECT id FROM suppliers WHERE name = 'Peter England');
SET @sup_allen = (SELECT id FROM suppliers WHERE name = 'Allen Solly');

-- 4. Insert Products (INR Prices)

-- LEE COOPER
INSERT INTO products (sku, name, description, category_id, unit_price, cost_price, quantity_on_hand, reorder_point, reorder_quantity, unit_of_measure, location, created_by, auto_reorder_enabled) VALUES
('LC-JEANS-M-SLIM', 'Lee Cooper Men Slim Fit Jeans', 'Dark Blue, 2024 Collection, Size 32', @cat_id, 2499.00, 1800.00, 150, 30, 50, 'PIECE', 'Rack J1', @staff_id, true),
('LC-BOOTS-LTHR', 'Lee Cooper Leather Boots', 'High Ankle Tan Boots, 2025 Edition', @cat_id, 4299.00, 3200.00, 60, 10, 20, 'PAIR', 'Shelf S1', @staff_id, false),
('LC-WMN-TOP-WHT', 'Lee Cooper Women Floral Top', 'Cotton Blend, Summer 2024', @cat_id, 1299.00, 800.00, 80, 20, 40, 'PIECE', 'Rack W1', @staff_id, true);

-- VAN HEUSEN
INSERT INTO products (sku, name, description, category_id, unit_price, cost_price, quantity_on_hand, reorder_point, reorder_quantity, unit_of_measure, location, created_by, auto_reorder_enabled) VALUES
('VH-FORMAL-SHIRT', 'Van Heusen Men Formal Shirt', 'Wrinkle Free White, Size 40', @cat_id, 2299.00, 1500.00, 200, 40, 100, 'PIECE', 'Rack M1', @staff_id, true),
('VH-BLAZER-NAVY', 'Van Heusen Ceremonial Blazer', 'Navy Blue, Slim Fit, 2025 Series', @cat_id, 6999.00, 5000.00, 25, 5, 10, 'PIECE', 'Rack S2', @staff_id, false),
('VH-WMN-DRESS', 'Van Heusen Women Midi Dress', 'Black Party Wear, Size M', @cat_id, 3499.00, 2400.00, 40, 10, 20, 'PIECE', 'Rack W2', @staff_id, true);

-- PETER ENGLAND
INSERT INTO products (sku, name, description, category_id, unit_price, cost_price, quantity_on_hand, reorder_point, reorder_quantity, unit_of_measure, location, created_by, auto_reorder_enabled) VALUES
('PE-CASUAL-CHK', 'Peter England Casual Shirt', 'Red Checks, Cotton, 2024 Pack', @cat_id, 1499.00, 950.00, 300, 50, 150, 'PIECE', 'Rack M2', @staff_id, true),
('PE-TROUSER-GRY', 'Peter England Formal Trousers', 'Grey Slim Fit, Poly Viscose', @cat_id, 1899.00, 1200.00, 180, 30, 60, 'PIECE', 'Rack M3', @staff_id, true);

-- ALLEN SOLLY
INSERT INTO products (sku, name, description, category_id, unit_price, cost_price, quantity_on_hand, reorder_point, reorder_quantity, unit_of_measure, location, created_by, auto_reorder_enabled) VALUES
('AS-POLO-TEE', 'Allen Solly Men Polo T-Shirt', 'Solid Yellow with Logo, 2025', @cat_id, 1099.00, 700.00, 400, 80, 200, 'PIECE', 'Rack M4', @staff_id, true),
('AS-WMN-HANDBAG', 'Allen Solly Women Tote Bag', 'Faux Leather, Beige, 2024 Style', @cat_id, 2999.00, 1800.00, 35, 8, 15, 'PIECE', 'Shelf A1', @staff_id, false),
('AS-WMN-TUNIC', 'Allen Solly Printed Tunic', 'Viscose Rayon, Multicolor', @cat_id, 1699.00, 1100.00, 70, 15, 30, 'PIECE', 'Rack W3', @staff_id, true);

-- 5. Link Products to Suppliers
INSERT INTO product_suppliers (product_id, supplier_id, supplier_sku, supplier_price, lead_time_days, is_preferred)
SELECT id, @sup_lee, CONCAT('SUP-', sku), cost_price, 10, true FROM products WHERE sku LIKE 'LC%';

INSERT INTO product_suppliers (product_id, supplier_id, supplier_sku, supplier_price, lead_time_days, is_preferred)
SELECT id, @sup_van, CONCAT('SUP-', sku), cost_price, 7, true FROM products WHERE sku LIKE 'VH%';

INSERT INTO product_suppliers (product_id, supplier_id, supplier_sku, supplier_price, lead_time_days, is_preferred)
SELECT id, @sup_pe, CONCAT('SUP-', sku), cost_price, 5, true FROM products WHERE sku LIKE 'PE%';

INSERT INTO product_suppliers (product_id, supplier_id, supplier_sku, supplier_price, lead_time_days, is_preferred)
SELECT id, @sup_allen, CONCAT('SUP-', sku), cost_price, 6, true FROM products WHERE sku LIKE 'AS%';