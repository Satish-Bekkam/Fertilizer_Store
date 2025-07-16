-- Sample data for enhanced WhatsApp features

-- Update existing customers with WhatsApp preferences
UPDATE customers SET 
    whatsapp_enabled = TRUE,
    preferred_language = 'english',
    last_whatsapp_sent = '2024-01-10 10:30:00'
WHERE id = 1;

UPDATE customers SET 
    whatsapp_enabled = TRUE,
    preferred_language = 'hindi',
    last_whatsapp_sent = '2024-01-09 14:15:00'
WHERE id = 2;

UPDATE customers SET 
    whatsapp_enabled = TRUE,
    preferred_language = 'english',
    last_whatsapp_sent = '2024-01-08 09:00:00'
WHERE id = 3;

-- Insert sample WhatsApp campaigns
INSERT INTO whatsapp_campaigns (name, template_id, target_audience, scheduled_at, status, total_recipients, sent_count, delivered_count, created_by) VALUES
('Winter Fertilizer Promotion', 3, 'active_customers', '2024-01-15 09:00:00', 'scheduled', 150, 0, 0, 1),
('Payment Reminders - January', 2, 'specific_customers', '2024-01-12 10:00:00', 'completed', 25, 25, 23, 1),
('New Stock Notification - Seeds', 4, 'all_customers', '2024-01-08 08:00:00', 'completed', 200, 200, 185, 1);

-- Insert campaign recipients
INSERT INTO whatsapp_campaign_recipients (campaign_id, customer_id, phone_number, status, sent_at, delivered_at) VALUES
(2, 2, '+91 8765432109', 'delivered', '2024-01-12 10:05:00', '2024-01-12 10:06:00'),
(2, 4, '+91 6543210987', 'delivered', '2024-01-12 10:05:00', '2024-01-12 10:07:00'),
(3, 1, '+91 9876543210', 'delivered', '2024-01-08 08:02:00', '2024-01-08 08:03:00'),
(3, 2, '+91 8765432109', 'delivered', '2024-01-08 08:02:00', '2024-01-08 08:04:00'),
(3, 3, '+91 7654321098', 'failed', '2024-01-08 08:02:00', NULL),
(3, 4, '+91 6543210987', 'delivered', '2024-01-08 08:02:00', '2024-01-08 08:05:00');

-- Update existing WhatsApp messages with template references
UPDATE whatsapp_messages SET 
    template_id = 1,
    delivered_at = '2024-01-10 10:32:00',
    read_at = '2024-01-10 10:45:00',
    message_id = 'wamid.HBgNOTE3NjU0MzIxMDkVAgA='
WHERE id = 1;

UPDATE whatsapp_messages SET 
    template_id = 2,
    delivered_at = '2024-01-09 14:17:00',
    read_at = '2024-01-09 15:20:00',
    message_id = 'wamid.HBgNOTE4NzY1NDMyMTA5VAgA='
WHERE id = 2;

UPDATE whatsapp_messages SET 
    template_id = 3,
    delivered_at = '2024-01-08 09:05:00',
    message_id = 'wamid.HBgNOTEzNzY1NDMyMTA5VAgA='
WHERE id = 3;

-- Insert WhatsApp analytics data
INSERT INTO whatsapp_analytics (date, messages_sent, messages_delivered, messages_read, messages_failed, unique_recipients, campaigns_sent) VALUES
('2024-01-10', 45, 42, 38, 3, 35, 2),
('2024-01-09', 38, 36, 32, 2, 28, 1),
('2024-01-08', 52, 48, 41, 4, 42, 3),
('2024-01-07', 29, 27, 24, 2, 22, 1),
('2024-01-06', 33, 31, 28, 2, 25, 2);

-- Insert more detailed WhatsApp messages with enhanced features
INSERT INTO whatsapp_messages (customer_id, phone_number, message_type, message_content, status, template_id, delivered_at, read_at, message_id) VALUES
(1, '+91 9876543210', 'notification', 'Hi Rajesh Kumar! Based on your Wheat cultivation, we recommend NPK 19:19:19 for the Flowering stage. Dosage: 25 kg/acre. Visit us for expert guidance!', 'delivered', 8, '2024-01-11 09:15:00', '2024-01-11 09:30:00', 'wamid.HBgNOTE5ODc2NTQzMjEwVAgA='),

(2, '+91 8765432109', 'promotion', '🌾 Special Winter Offer! Get 15% off on all Organic Fertilizers. Limited time offer valid till 31st January. Visit our store or call +91 9999999999 now!', 'delivered', 3, '2024-01-11 08:00:00', '2024-01-11 08:45:00', 'wamid.HBgNOTE4NzY1NDMyMTA5VAgB='),

(3, '+91 7654321098', 'notification', 'Hurry Amit Singh! Only 8 units of Potash left in stock. This is perfect for your Groundnut. Order now to avoid disappointment!', 'delivered', 7, '2024-01-10 16:30:00', NULL, 'wamid.HBgNOTE3NjU0MzIxMDk4VAgA='),

(4, '+91 6543210987', 'invoice', 'Dear Sunita Devi, your invoice INV-004 for ₹894 has been generated. Please find the details attached. Thank you for your business with AgriStore Pro!', 'delivered', 1, '2024-01-07 11:20:00', '2024-01-07 12:15:00', 'wamid.HBgNOTE2NTQzMjEwOTg3VAgA=');
