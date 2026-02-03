-- 1. Ensure FMCG Category exists
INSERT INTO categories (name, description, is_active) 
VALUES ('FMCG', 'Fast Moving Consumer Goods - Food, Beverages, Personal Care', true)
ON DUPLICATE KEY UPDATE description=VALUES(description);

SET @cat_fmcg = (SELECT id FROM categories WHERE name = 'FMCG');

-- 2. Create/Ensure Inventory Staff for FMCG Dept
-- Password is 'Staff@123' ($2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYvKlN/X4.Aa)
INSERT INTO users (email, password_hash, first_name, last_name, phone, department, role_id, is_active, email_verified)
VALUES ('fmcg@inventory.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYvKlN/X4.Aa', 'Rajesh', 'Kumar', '9898989898', 'FMCG', 2, true, true)
ON DUPLICATE KEY UPDATE department='FMCG';

SET @staff_fmcg = (SELECT id FROM users WHERE email = 'fmcg@inventory.com');

-- 3. Create Suppliers (Indian Context)
INSERT INTO suppliers (name, contact_person, email, phone, address, city, state, country, postal_code, is_active, created_by) VALUES 
('ITC Limited', 'Sanjiv Puri', 'customer.service@itc.in', '1800-425-4444', 'Virginia House, 37 J.L. Nehru Road', 'Kolkata', 'West Bengal', 'India', '700071', true, @staff_fmcg),
('Hindustan Unilever Ltd', 'Rohit Jawa', 'lever.care@unilever.com', '1800-102-2221', 'Unilever House, B.D. Sawant Marg, Chakala, Andheri (E)', 'Mumbai', 'Maharashtra', 'India', '400099', true, @staff_fmcg),
('Nestle India Ltd', 'Suresh Narayanan', 'wecare@in.nestle.com', '1800-103-1947', '100/101, World Trade Centre, Barakhamba Lane', 'New Delhi', 'Delhi', 'India', '110001', true, @staff_fmcg),
('Britannia Industries', 'Varun Berry', 'feedback@britindia.com', '1800-425-4449', '5/1A Hungerford Street', 'Kolkata', 'West Bengal', 'India', '700017', true, @staff_fmcg);

-- Get Supplier IDs
SET @sup_itc = (SELECT id FROM suppliers WHERE name = 'ITC Limited');
SET @sup_hul = (SELECT id FROM suppliers WHERE name = 'Hindustan Unilever Ltd');
SET @sup_nestle = (SELECT id FROM suppliers WHERE name = 'Nestle India Ltd');
SET @sup_britannia = (SELECT id FROM suppliers WHERE name = 'Britannia Industries');

-- 4. Insert Products (2024-2025 Packaging/Variants)
-- Prices in INR

-- ITC PRODUCTS
INSERT INTO products (sku, name, description, category_id, unit_price, cost_price, quantity_on_hand, reorder_point, reorder_quantity, unit_of_measure, location, created_by, auto_reorder_enabled) VALUES
('ITC-ASH-ATTA-5KG', 'Aashirvaad Select Atta 5kg', 'Premium Sharbati Wheat Flour, 2024 Pack', @cat_fmcg, 285.00, 240.00, 200, 50, 100, 'BAG', 'Aisle F1', @staff_fmcg, true),
('ITC-SUNFEAST-DF', 'Sunfeast Dark Fantasy Choco Fills', '300g Family Pack, New 2025 Recipe', @cat_fmcg, 140.00, 110.00, 500, 100, 200, 'BOX', 'Aisle F2', @staff_fmcg, true),
('ITC-YIPP-NOODLES', 'Sunfeast YiPPee! Magic Masala', '240g Pack of 4, Long Noodles', @cat_fmcg, 54.00, 42.00, 1000, 200, 500, 'PACK', 'Aisle F3', @staff_fmcg, true);

-- HUL PRODUCTS
INSERT INTO products (sku, name, description, category_id, unit_price, cost_price, quantity_on_hand, reorder_point, reorder_quantity, unit_of_measure, location, created_by, auto_reorder_enabled) VALUES
('HUL-SURF-EXCEL', 'Surf Excel Matic Liquid 2L', 'Front Load, 2024 Stain Removal Tech', @cat_fmcg, 430.00, 350.00, 150, 30, 60, 'BOTTLE', 'Aisle C1', @staff_fmcg, true),
('HUL-BRU-GOLD', 'Bru Gold Instant Coffee 100g', '100% Pure Coffee Granules', @cat_fmcg, 325.00, 260.00, 120, 20, 50, 'JAR', 'Aisle C2', @staff_fmcg, false),
('HUL-LUX-SOAP', 'Lux International Creamy Perfection', 'Pack of 3 x 125g, 2025 Edition', @cat_fmcg, 155.00, 115.00, 300, 50, 100, 'PACK', 'Aisle C3', @staff_fmcg, true);

-- NESTLE PRODUCTS
INSERT INTO products (sku, name, description, category_id, unit_price, cost_price, quantity_on_hand, reorder_point, reorder_quantity, unit_of_measure, location, created_by, auto_reorder_enabled) VALUES
('NES-MAGGI-SPL', 'Maggi 2-Minute Noodles Special Masala', '70g x 12 Pack, 2024 Spices', @cat_fmcg, 192.00, 160.00, 800, 150, 400, 'PACK', 'Aisle N1', @staff_fmcg, true),
('NES-KITKAT-RICH', 'Nestle KitKat Rich Chocolate', '41.5g x 3, 2025 Dark Edition', @cat_fmcg, 90.00, 65.00, 400, 80, 150, 'BOX', 'Aisle N2', @staff_fmcg, true),
('NES-NESCAFE-CL', 'Nescafe Classic 200g', 'Original Instant Coffee, Glass Jar', @cat_fmcg, 620.00, 510.00, 100, 25, 50, 'JAR', 'Aisle N3', @staff_fmcg, true);

-- BRITANNIA PRODUCTS
INSERT INTO products (sku, name, description, category_id, unit_price, cost_price, quantity_on_hand, reorder_point, reorder_quantity, unit_of_measure, location, created_by, auto_reorder_enabled) VALUES
('BRI-GOOD-DAY', 'Britannia Good Day Cashew', '600g Family Pack, Buttery Taste', @cat_fmcg, 120.00, 95.00, 600, 100, 300, 'PACK', 'Aisle B1', @staff_fmcg, true),
('BRI-NUTRI-CHOICE', 'Britannia NutriChoice Digestive', '1kg Hi-Fibre Biscuits, 2024 Health Pack', @cat_fmcg, 240.00, 190.00, 250, 40, 100, 'BOX', 'Aisle B2', @staff_fmcg, false),
('BRI-CHEESE-SL', 'Britannia Cheese Slices', '200g (10 Slices), Processed Cheese', @cat_fmcg, 165.00, 130.00, 80, 15, 40, 'PACK', 'Fridge 1', @staff_fmcg, true);

-- 5. Link Products to Suppliers (ProductSupplier Join Table)
INSERT INTO product_suppliers (product_id, supplier_id, supplier_sku, supplier_price, lead_time_days, is_preferred)
SELECT id, @sup_itc, CONCAT('SUP-', sku), cost_price, 3, true FROM products WHERE sku LIKE 'ITC%';

INSERT INTO product_suppliers (product_id, supplier_id, supplier_sku, supplier_price, lead_time_days, is_preferred)
SELECT id, @sup_hul, CONCAT('SUP-', sku), cost_price, 4, true FROM products WHERE sku LIKE 'HUL%';

INSERT INTO product_suppliers (product_id, supplier_id, supplier_sku, supplier_price, lead_time_days, is_preferred)
SELECT id, @sup_nestle, CONCAT('SUP-', sku), cost_price, 5, true FROM products WHERE sku LIKE 'NES%';

INSERT INTO product_suppliers (product_id, supplier_id, supplier_sku, supplier_price, lead_time_days, is_preferred)
SELECT id, @sup_britannia, CONCAT('SUP-', sku), cost_price, 2, true FROM products WHERE sku LIKE 'BRI%';