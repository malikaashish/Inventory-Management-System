-- 1. Ensure Electronics Category exists
INSERT INTO categories (name, description, is_active) 
VALUES ('Electronics', 'Smartphones, Laptops, and Accessories', true)
ON DUPLICATE KEY UPDATE description=VALUES(description);

SET @cat_id = (SELECT id FROM categories WHERE name = 'Electronics');

-- 2. Create Inventory Staff for Electronics Dept (Indian Profile)
-- Password: 'Staff@123'
INSERT INTO users (email, password_hash, first_name, last_name, phone, department, role_id, is_active, email_verified)
VALUES ('electronics@inventory.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYvKlN/X4.Aa', 'Amit', 'Verma', '9876543210', 'Electronics', 2, true, true);

SET @staff_id = (SELECT id FROM users WHERE email = 'electronics@inventory.com');

-- 3. Create Suppliers (Indian Operations)
INSERT INTO suppliers (name, contact_person, email, phone, address, city, state, country, postal_code, is_active, created_by) VALUES 
('Samsung India', 'Rajeev Suri', 'support.india@samsung.com', '1800-40-7267864', 'DLF Centre, Sansad Marg', 'New Delhi', 'Delhi', 'India', '110001', true, @staff_id),
('Lenovo India', 'Shailendra Katyal', 'commercialts@lenovo.com', '1800-419-7555', 'Vatika Business Park, Sohna Road', 'Gurugram', 'Haryana', 'India', '122018', true, @staff_id),
('Noise (Nexxbase)', 'Gaurav Khatri', 'help@gonoise.com', '0124-426-6228', 'Sector 44', 'Gurugram', 'Haryana', 'India', '122003', true, @staff_id),
('Xiaomi India', 'Muralikrishnan B', 'service.in@xiaomi.com', '1800-103-6286', 'Orchid Block, Embassy Tech Village', 'Bangalore', 'Karnataka', 'India', '560103', true, @staff_id);

-- Get Supplier IDs
SET @sup_samsung = (SELECT id FROM suppliers WHERE name = 'Samsung India');
SET @sup_lenovo = (SELECT id FROM suppliers WHERE name = 'Lenovo India');
SET @sup_noise = (SELECT id FROM suppliers WHERE name = 'Noise (Nexxbase)');
SET @sup_xiaomi = (SELECT id FROM suppliers WHERE name = 'Xiaomi India');

-- 4. Insert Products (2024-2025 Models) - Prices in INR (₹)

-- SAMSUNG PRODUCTS (INR)
INSERT INTO products (sku, name, description, category_id, unit_price, cost_price, quantity_on_hand, reorder_point, reorder_quantity, unit_of_measure, location, created_by, auto_reorder_enabled) VALUES
('SAM-S24-ULTRA', 'Samsung Galaxy S24 Ultra', 'AI Phone, Titanium, 12GB/256GB', @cat_id, 129999.00, 115000.00, 50, 10, 20, 'UNIT', 'Shelf A1', @staff_id, true),
('SAM-ZFOLD6', 'Samsung Galaxy Z Fold 6', 'Foldable Screen, 2025 Model', @cat_id, 164999.00, 145000.00, 30, 5, 10, 'UNIT', 'Shelf A2', @staff_id, true),
('SAM-BUDS3-PRO', 'Samsung Galaxy Buds 3 Pro', 'Active Noise Cancellation, 2024', @cat_id, 19999.00, 15000.00, 100, 20, 50, 'UNIT', 'Bin B1', @staff_id, false);

-- LENOVO PRODUCTS (INR)
INSERT INTO products (sku, name, description, category_id, unit_price, cost_price, quantity_on_hand, reorder_point, reorder_quantity, unit_of_measure, location, created_by, auto_reorder_enabled) VALUES
('LEN-X1-CARB', 'Lenovo ThinkPad X1 Carbon', 'Gen 12, Core Ultra 7, 16GB RAM', @cat_id, 185000.00, 160000.00, 25, 5, 15, 'UNIT', 'Shelf C1', @staff_id, true),
('LEN-LOQ-15', 'Lenovo LOQ 15', 'Gaming Laptop, RTX 4060, 2025', @cat_id, 89990.00, 75000.00, 40, 10, 20, 'UNIT', 'Shelf C2', @staff_id, true);

-- NOISE PRODUCTS (INR)
INSERT INTO products (sku, name, description, category_id, unit_price, cost_price, quantity_on_hand, reorder_point, reorder_quantity, unit_of_measure, location, created_by, auto_reorder_enabled) VALUES
('NOI-COLORFIT', 'Noise ColorFit Pro 5', 'Smartwatch, AMOLED, BT Calling', @cat_id, 3499.00, 2200.00, 200, 30, 100, 'UNIT', 'Bin D1', @staff_id, true),
('NOI-BUDS-VS', 'Noise Buds VS104', 'Wireless Earbuds, 45H Playtime', @cat_id, 1299.00, 800.00, 300, 50, 150, 'UNIT', 'Bin D2', @staff_id, true);

-- XIAOMI PRODUCTS (INR)
INSERT INTO products (sku, name, description, category_id, unit_price, cost_price, quantity_on_hand, reorder_point, reorder_quantity, unit_of_measure, location, created_by, auto_reorder_enabled) VALUES
('MI-14-CIVI', 'Xiaomi 14 Civi', 'Leica Camera, Snapdragon 8s Gen 3', @cat_id, 42999.00, 38000.00, 60, 15, 30, 'UNIT', 'Shelf E1', @staff_id, true),
('MI-PAD-6', 'Xiaomi Pad 6', 'Tablet, 144Hz Display, 8GB/256GB', @cat_id, 26999.00, 22000.00, 80, 20, 40, 'UNIT', 'Shelf E2', @staff_id, false),
('REDMI-WATCH', 'Redmi Watch 5 Active', 'Smart Watch, 2025 Model', @cat_id, 2999.00, 1800.00, 150, 40, 100, 'UNIT', 'Bin E3', @staff_id, true);

-- 5. Link Products to Suppliers (ProductSupplier Join Table)
INSERT INTO product_suppliers (product_id, supplier_id, supplier_sku, supplier_price, lead_time_days, is_preferred)
SELECT id, @sup_samsung, CONCAT('SUP-', sku), cost_price, 5, true FROM products WHERE sku LIKE 'SAM%';

INSERT INTO product_suppliers (product_id, supplier_id, supplier_sku, supplier_price, lead_time_days, is_preferred)
SELECT id, @sup_lenovo, CONCAT('SUP-', sku), cost_price, 7, true FROM products WHERE sku LIKE 'LEN%';

INSERT INTO product_suppliers (product_id, supplier_id, supplier_sku, supplier_price, lead_time_days, is_preferred)
SELECT id, @sup_noise, CONCAT('SUP-', sku), cost_price, 3, true FROM products WHERE sku LIKE 'NOI%';

INSERT INTO product_suppliers (product_id, supplier_id, supplier_sku, supplier_price, lead_time_days, is_preferred)
SELECT id, @sup_xiaomi, CONCAT('SUP-', sku), cost_price, 4, true FROM products WHERE sku LIKE 'MI%' OR sku LIKE 'REDMI%';