-- KULU Seed Data (Development)
-- Run after schema migrations
-- Promote admin: UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';

INSERT INTO categories (name, slug, description, sort_order, is_active) VALUES
  ('Electronics', 'electronics', 'Phones, computers, and gadgets', 1, true),
  ('Phones', 'phones', 'Smartphones and mobile accessories', 2, true),
  ('Computers', 'computers', 'Laptops, desktops, and peripherals', 3, true),
  ('Accessories', 'accessories', 'Cases, chargers, cables and more', 4, true),
  ('Home & Kitchen', 'home-kitchen', 'Appliances and kitchen essentials', 5, true),
  ('Fashion', 'fashion', 'Clothing, shoes and style', 6, true),
  ('Beauty', 'beauty', 'Skincare, makeup and personal care', 7, true),
  ('Office', 'office', 'Stationery and office supplies', 8, true),
  ('Other', 'other', 'Miscellaneous products', 9, true);

INSERT INTO delivery_configs (region, city, fee, estimated_days_min, estimated_days_max) VALUES
  ('Addis Ababa', NULL, 80, 1, 2),
  ('Oromia', NULL, 150, 2, 4),
  ('Amhara', NULL, 180, 3, 5),
  ('Tigray', NULL, 220, 4, 7),
  ('SNNPR', NULL, 180, 3, 5),
  ('Sidama', NULL, 160, 2, 4),
  ('Dire Dawa', NULL, 200, 3, 5),
  ('Harari', NULL, 200, 3, 5),
  ('Somali', NULL, 250, 4, 8),
  ('Afar', NULL, 250, 4, 8),
  ('Benishangul-Gumuz', NULL, 220, 4, 7),
  ('Gambela', NULL, 250, 4, 8);

INSERT INTO products (name, slug, description, price, discount_price, sku, stock_quantity, category_id, brand, is_active, is_featured)
SELECT 'Samsung Galaxy A15', 'samsung-galaxy-a15', 'Affordable 6.5" smartphone with 128GB storage, 50MP camera.', 18500, 16900, 'SAM-A15-128', 45, id, 'Samsung', true, true FROM categories WHERE slug = 'phones';

INSERT INTO products (name, slug, description, price, discount_price, sku, stock_quantity, category_id, brand, is_active, is_featured)
SELECT 'Tecno Spark 20', 'tecno-spark-20', 'Stylish design, 6.6" display, 50MP dual camera.', 12500, NULL, 'TEC-SP20-128', 60, id, 'Tecno', true, true FROM categories WHERE slug = 'phones';

INSERT INTO products (name, slug, description, price, discount_price, sku, stock_quantity, category_id, brand, is_active, is_featured)
SELECT 'HP 15s Laptop', 'hp-15s-laptop', '15.6" Full HD, Intel Core i5, 8GB RAM, 512GB SSD.', 48500, 45900, 'HP-15S-I5-512', 12, id, 'HP', true, true FROM categories WHERE slug = 'computers';

INSERT INTO products (name, slug, description, price, discount_price, sku, stock_quantity, category_id, brand, is_active, is_featured)
SELECT 'USB-C Fast Charger 65W', 'usb-c-fast-charger-65w', 'Compatible with most modern phones and laptops.', 1850, 1490, 'ACC-CHG-65W', 120, id, 'Generic', true, false FROM categories WHERE slug = 'accessories';

INSERT INTO products (name, slug, description, price, discount_price, sku, stock_quantity, category_id, brand, is_active, is_featured)
SELECT 'Wireless Earbuds Pro', 'wireless-earbuds-pro', 'Noise isolation, long battery life, IPX5.', 3200, NULL, 'ACC-EAR-PRO', 85, id, 'Generic', true, true FROM categories WHERE slug = 'accessories';

INSERT INTO products (name, slug, description, price, discount_price, sku, stock_quantity, category_id, brand, is_active, is_featured)
SELECT 'Electric Kettle 1.7L', 'electric-kettle-1-7l', 'Stainless steel, auto shut-off. Perfect for Ethiopian tea.', 2100, 1890, 'HK-KET-17', 40, id, 'Generic', true, false FROM categories WHERE slug = 'home-kitchen';
