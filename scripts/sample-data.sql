-- Insert sample data for Fertilizer Store

-- Insert product categories
INSERT INTO product_categories (name, description) VALUES
('Chemical Fertilizer', 'Synthetic fertilizers for quick nutrient supply'),
('Organic Fertilizer', 'Natural fertilizers for sustainable farming'),
('Pesticide', 'Chemicals for pest control'),
('Herbicide', 'Chemicals for weed control'),
('Fungicide', 'Chemicals for disease control'),
('Seeds', 'High quality seeds for various crops'),
('Tools', 'Farming tools and equipment');

-- Insert users
INSERT INTO users (username, email, password_hash, role, full_name, phone) VALUES
('admin', 'admin@agristore.com', '$2b$10$hash_here', 'admin', 'Store Owner', '+91 9999999999'),
('sales1', 'sales1@agristore.com', '$2b$10$hash_here', 'sales_staff', 'Rajesh Kumar', '+91 8888888888'),
('sales2', 'sales2@agristore.com', '$2b$10$hash_here', 'sales_staff', 'Priya Sharma', '+91 7777777777');

-- Insert sample customers
INSERT INTO customers (name, phone, email, address, crop_types, total_purchases, last_purchase_date) VALUES
('Ramesh Patel', '+91 9876543210', 'ramesh@email.com', 'Village Rampur, District Meerut, UP', '["Wheat", "Rice"]', 45000.00, '2024-01-10'),
('Sunita Devi', '+91 8765432109', 'sunita@email.com', 'Kisan Nagar, Ludhiana, Punjab', '["Cotton", "Sugarcane"]', 32000.00, '2024-01-08'),
('Amit Singh', '+91 7654321098', 'amit@email.com', 'Gram Panchayat Kheda, Gujarat', '["Groundnut", "Maize"]', 28000.00, '2024-01-05'),
('Kavita Sharma', '+91 6543210987', 'kavita@email.com', 'Village Sonpur, Bihar', '["Rice", "Vegetables"]', 15000.00, '2024-01-03'),
('Mohan Lal', '+91 5432109876', 'mohan@email.com', 'Tehsil Kaithal, Haryana', '["Wheat", "Mustard"]', 38000.00, '2024-01-07');

-- Insert sample products
INSERT INTO products (name, category_id, brand, description, price, unit, stock_quantity, min_stock_level, barcode, expiry_date) VALUES
('NPK 19:19:19', 1, 'IFFCO', 'Balanced NPK fertilizer for all crops', 500.00, 'kg', 45, 20, '1234567890123', '2024-12-31'),
('Urea', 1, 'KRIBHCO', 'Nitrogen fertilizer for vegetative growth', 400.00, 'kg', 12, 25, '1234567890124', '2024-11-30'),
('DAP', 1, 'NFL', 'Diammonium Phosphate for root development', 600.00, 'kg', 38, 15, '1234567890125', '2025-01-15'),
('Organic Compost', 2, 'Green Gold', 'Premium organic compost for soil health', 200.00, 'kg', 25, 10, '1234567890126', '2024-08-30'),
('Potash', 1, 'RCF', 'Potassium fertilizer for fruit quality', 450.00, 'kg', 8, 20, '1234567890127', '2024-10-15'),
('Zinc Sulphate', 1, 'Coromandel', 'Micronutrient for zinc deficiency', 350.00, 'kg', 30, 15, '1234567890128', '2025-03-20'),
('Neem Oil', 3, 'Bayer', 'Organic pesticide for pest control', 800.00, 'liter', 20, 10, '1234567890129', '2024-09-15'),
('2,4-D', 4, 'Dow', 'Selective herbicide for broadleaf weeds', 1200.00, 'liter', 15, 8, '1234567890130', '2024-07-30');

-- Insert sample sales
INSERT INTO sales (invoice_number, customer_id, user_id, sale_date, subtotal, tax_amount, discount_amount, total_amount, payment_method, payment_status) VALUES
('INV-001', 1, 1, '2024-01-10', 1400.00, 252.00, 0.00, 1652.00, 'upi', 'paid'),
('INV-002', 2, 2, '2024-01-09', 1800.00, 324.00, 100.00, 2024.00, 'cash', 'pending'),
('INV-003', 3, 1, '2024-01-08', 2200.00, 396.00, 0.00, 2596.00, 'bank_transfer', 'paid'),
('INV-004', 4, 2, '2024-01-07', 800.00, 144.00, 50.00, 894.00, 'cash', 'paid'),
('INV-005', 5, 1, '2024-01-06', 1500.00, 270.00, 0.00, 1770.00, 'upi', 'paid');

-- Insert sample sale items
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES
-- Sale 1 items
(1, 1, 2, 500.00, 1000.00),
(1, 2, 1, 400.00, 400.00),
-- Sale 2 items
(2, 3, 3, 600.00, 1800.00),
-- Sale 3 items
(3, 1, 2, 500.00, 1000.00),
(3, 5, 2, 450.00, 900.00),
(3, 4, 1, 200.00, 200.00),
-- Sale 4 items
(4, 4, 4, 200.00, 800.00),
-- Sale 5 items
(5, 1, 3, 500.00, 1500.00);

-- Insert fertilizer recommendations
INSERT INTO fertilizer_recommendations (crop_type, growth_stage, product_id, dosage_per_acre, application_timing, purpose, notes) VALUES
-- Wheat recommendations
('Wheat', 'Sowing', 3, '100 kg/acre', 'At sowing', 'Root development', 'Apply in furrows and cover with soil'),
('Wheat', 'Sowing', 5, '50 kg/acre', 'At sowing', 'Overall plant health', 'Broadcast and incorporate'),
('Wheat', 'Tillering', 2, '50 kg/acre', '20-25 days after sowing', 'Vegetative growth', 'Apply when soil has adequate moisture'),
('Wheat', 'Jointing', 2, '50 kg/acre', '40-45 days after sowing', 'Stem elongation', 'Split application recommended'),
('Wheat', 'Flowering', 1, '25 kg/acre', 'At flowering', 'Grain formation', 'Foliar application possible'),

-- Rice recommendations
('Rice', 'Transplanting', 3, '125 kg/acre', 'Before transplanting', 'Root establishment', 'Apply in puddled field'),
('Rice', 'Tillering', 2, '65 kg/acre', '15-20 days after transplanting', 'Tiller development', 'Apply in standing water'),
('Rice', 'Panicle Initiation', 2, '65 kg/acre', '35-40 days after transplanting', 'Panicle development', 'Maintain 2-3 cm water level'),
('Rice', 'Panicle Initiation', 5, '35 kg/acre', 'Same time as urea', 'Grain quality', 'Apply with urea for better results'),

-- Cotton recommendations
('Cotton', 'Sowing', 3, '125 kg/acre', 'At sowing', 'Root development', 'Place in furrows 5 cm away from seed'),
('Cotton', 'Sowing', 5, '50 kg/acre', 'At sowing', 'Plant vigor', 'Broadcast and incorporate'),
('Cotton', 'Squaring', 2, '100 kg/acre', '30-35 days after sowing', 'Vegetative growth', 'Side dress application'),
('Cotton', 'Flowering', 1, '50 kg/acre', 'At flowering', 'Boll formation', 'Avoid excess nitrogen');

-- Insert stock movements
INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, reference_id, notes) VALUES
(1, 'out', 2, 'sale', 1, 'Sale to Ramesh Patel'),
(2, 'out', 1, 'sale', 1, 'Sale to Ramesh Patel'),
(3, 'out', 3, 'sale', 2, 'Sale to Sunita Devi'),
(1, 'out', 2, 'sale', 3, 'Sale to Amit Singh'),
(5, 'out', 2, 'sale', 3, 'Sale to Amit Singh'),
(4, 'out', 1, 'sale', 3, 'Sale to Amit Singh'),
(4, 'out', 4, 'sale', 4, 'Sale to Kavita Sharma'),
(1, 'out', 3, 'sale', 5, 'Sale to Mohan Lal');

-- Insert sample WhatsApp messages
INSERT INTO whatsapp_messages (customer_id, phone_number, message_type, message_content, status) VALUES
(1, '+91 9876543210', 'invoice', 'Your invoice INV-001 for ₹1,652 has been generated. Thank you for your purchase!', 'delivered'),
(2, '+91 8765432109', 'reminder', 'Reminder: Your payment of ₹2,024 for invoice INV-002 is pending. Please make payment at your earliest convenience.', 'delivered'),
(3, '+91 7654321098', 'promotion', 'Special offer: 10% discount on all organic fertilizers this week. Visit our store now!', 'sent'),
(4, '+91 6543210987', 'notification', 'New stock arrived: Premium quality seeds for winter crops. Contact us for details.', 'delivered');

-- Insert sample notifications
INSERT INTO notifications (user_id, type, title, message) VALUES
(1, 'low_stock', 'Low Stock Alert', 'Urea stock is running low (12 units left). Minimum stock level is 25 units.'),
(1, 'low_stock', 'Low Stock Alert', 'Potash stock is running low (8 units left). Minimum stock level is 20 units.'),
(1, 'expiry_alert', 'Product Expiry Alert', 'Organic Compost will expire on 2024-08-30. Consider promotional pricing.'),
(2, 'payment_due', 'Payment Reminder', 'Invoice INV-002 payment of ₹2,024 is pending from Sunita Devi.'),
(1, 'system', 'Daily Report', 'Today\'s sales: 5 transactions totaling ₹8,936. Stock movements: 15 items sold.');
