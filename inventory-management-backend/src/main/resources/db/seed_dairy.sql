-- =========================================================
-- SAFELY CLEANUP OLD DATA (If exists for this department)
-- =========================================================

SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Find Staff ID
SET @staff_id = (SELECT id FROM users WHERE email = 'dairy@inventory.com');

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
DELETE FROM users WHERE email = 'dairy@inventory.com';

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;


-- =========================================================
-- INSERT NEW INDIAN DATA (Dairy & Groceries)
-- =========================================================

-- 1. Ensure Category exists
INSERT INTO categories (name, description, is_active) 
VALUES ('Dairy & Groceries', 'Milk, Cheese, Paneer, and Daily Essentials', true)
ON DUPLICATE KEY UPDATE description=VALUES(description);

SET @cat_id = (SELECT id FROM categories WHERE name = 'Dairy & Groceries');

-- 2. Create Inventory Staff
-- Password: 'Staff@123'
INSERT INTO users (email, password_hash, first_name, last_name, phone, department, role_id, is_active, email_verified)
VALUES ('dairy@inventory.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYvKlN/X4.Aa', 'Priya', 'Nair', '9845012345', 'Dairy & Groceries', 2, true, true);

SET @staff_id = (SELECT id FROM users WHERE email = 'dairy@inventory.com');

-- 3. Create Suppliers
INSERT INTO suppliers (name, contact_person, email, phone, address, city, state, country, postal_code, is_active, created_by) VALUES 
('Hatsun Agro Product', 'RG Chandramogan', 'info@hap.in', '044-24501622', 'Karapakkam, OMR', 'Chennai', 'Tamil Nadu', 'India', '600097', true, @staff_id),
('Amul (GCMMF)', 'Jayen Mehta', 'customercare@amul.coop', '1800-258-3333', 'Amul Dairy Road', 'Anand', 'Gujarat', 'India', '388001', true, @staff_id),
('Heritage Foods', 'Bhuvaneswari Nara', 'customercare@heritagefoods.in', '1800-425-2929', 'Panjagutta', 'Hyderabad', 'Telangana', 'India', '500082', true, @staff_id),
('Milky Mist Dairy', 'T. Sathish Kumar', 'feedback@milkymist.com', '1800-419-9000', 'Pattakaranpalayam', 'Erode', 'Tamil Nadu', 'India', '638316', true, @staff_id);

-- Get Supplier IDs
SET @sup_hap = (SELECT id FROM suppliers WHERE name = 'Hatsun Agro Product');
SET @sup_amul = (SELECT id FROM suppliers WHERE name = 'Amul (GCMMF)');
SET @sup_heritage = (SELECT id FROM suppliers WHERE name = 'Heritage Foods');
SET @sup_milky = (SELECT id FROM suppliers WHERE name = 'Milky Mist Dairy');

-- 4. Insert Products (INR Prices)

-- HATSUN (HAP)
INSERT INTO products (sku, name, description, category_id, unit_price, cost_price, quantity_on_hand, reorder_point, reorder_quantity, unit_of_measure, location, created_by, auto_reorder_enabled) VALUES
('HAP-CURD-500', 'Hatsun Curd 500g', 'Thick Pot Set Curd, Pouch', @cat_id, 38.00, 30.00, 200, 50, 100, 'PACK', 'Fridge 1A', @staff_id, true),
('ARUN-IC-TUB', 'Arun Ice Cream Vanilla', '1L Family Tub, Creamy Vanilla', @cat_id, 240.00, 190.00, 50, 10, 20, 'TUB', 'Freezer 2', @staff_id, false);

-- AMUL
INSERT INTO products (sku, name, description, category_id, unit_price, cost_price, quantity_on_hand, reorder_point, reorder_quantity, unit_of_measure, location, created_by, auto_reorder_enabled) VALUES
('AMUL-BUTTER-500', 'Amul Butter 500g', 'Pasteurized Salted Butter', @cat_id, 275.00, 230.00, 300, 60, 150, 'PACK', 'Fridge 1B', @staff_id, true),
('AMUL-GOLD-1L', 'Amul Gold Milk 1L', 'Full Cream Milk, Tetra Pack', @cat_id, 72.00, 60.00, 500, 100, 200, 'CARTON', 'Shelf D1', @staff_id, true),
('AMUL-CHEESE-SL', 'Amul Cheese Slices', '200g (10 Slices), Processed', @cat_id, 145.00, 115.00, 100, 20, 50, 'PACK', 'Fridge 1C', @staff_id, true);

-- HERITAGE
INSERT INTO products (sku, name, description, category_id, unit_price, cost_price, quantity_on_hand, reorder_point, reorder_quantity, unit_of_measure, location, created_by, auto_reorder_enabled) VALUES
('HER-TONED-500', 'Heritage Toned Milk 500ml', 'Daily Fresh Milk Pouch', @cat_id, 28.00, 24.00, 400, 100, 200, 'PACK', 'Fridge 2A', @staff_id, true),
('HER-GHEE-1L', 'Heritage Cow Ghee 1L', 'Pure Cow Ghee, Aroma Jar', @cat_id, 650.00, 520.00, 80, 15, 40, 'JAR', 'Shelf G1', @staff_id, false);

-- MILKY MIST
INSERT INTO products (sku, name, description, category_id, unit_price, cost_price, quantity_on_hand, reorder_point, reorder_quantity, unit_of_measure, location, created_by, auto_reorder_enabled) VALUES
('MM-PANEER-200', 'Milky Mist Paneer 200g', 'Fresh Malai Paneer, Vacuum Pack', @cat_id, 115.00, 85.00, 150, 30, 80, 'PACK', 'Fridge 2B', @staff_id, true),
('MM-YOGURT-MANGO', 'Milky Mist Greek Yogurt', 'Mango Flavor 100g Cup', @cat_id, 45.00, 32.00, 120, 25, 60, 'CUP', 'Fridge 2C', @staff_id, true);

-- 5. Link Products to Suppliers
INSERT INTO product_suppliers (product_id, supplier_id, supplier_sku, supplier_price, lead_time_days, is_preferred)
SELECT id, @sup_hap, CONCAT('SUP-', sku), cost_price, 2, true FROM products WHERE sku LIKE 'HAP%' OR sku LIKE 'ARUN%';

INSERT INTO product_suppliers (product_id, supplier_id, supplier_sku, supplier_price, lead_time_days, is_preferred)
SELECT id, @sup_amul, CONCAT('SUP-', sku), cost_price, 3, true FROM products WHERE sku LIKE 'AMUL%';

INSERT INTO product_suppliers (product_id, supplier_id, supplier_sku, supplier_price, lead_time_days, is_preferred)
SELECT id, @sup_heritage, CONCAT('SUP-', sku), cost_price, 2, true FROM products WHERE sku LIKE 'HER%';

INSERT INTO product_suppliers (product_id, supplier_id, supplier_sku, supplier_price, lead_time_days, is_preferred)
SELECT id, @sup_milky, CONCAT('SUP-', sku), cost_price, 4, true FROM products WHERE sku LIKE 'MM%';