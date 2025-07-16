-- Enhanced WhatsApp features for Fertilizer Store

-- Add new columns to whatsapp_messages table
ALTER TABLE whatsapp_messages 
ADD COLUMN template_id INT,
ADD COLUMN scheduled_at TIMESTAMP NULL,
ADD COLUMN delivered_at TIMESTAMP NULL,
ADD COLUMN read_at TIMESTAMP NULL,
ADD COLUMN failed_reason TEXT,
ADD COLUMN message_id VARCHAR(100),
ADD COLUMN media_url VARCHAR(500),
ADD COLUMN media_type ENUM('image', 'document', 'audio', 'video') NULL;

-- Create WhatsApp templates table
CREATE TABLE whatsapp_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category ENUM('invoice', 'reminder', 'promotion', 'notification', 'greeting') NOT NULL,
    template_text TEXT NOT NULL,
    variables JSON, -- Array of variable names like ["customer_name", "amount"]
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create WhatsApp campaigns table for bulk messaging
CREATE TABLE whatsapp_campaigns (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    template_id INT NOT NULL,
    target_audience ENUM('all_customers', 'active_customers', 'specific_customers') NOT NULL,
    customer_filter JSON, -- Criteria for selecting customers
    scheduled_at TIMESTAMP NULL,
    status ENUM('draft', 'scheduled', 'sending', 'completed', 'failed') DEFAULT 'draft',
    total_recipients INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    delivered_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES whatsapp_templates(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create campaign recipients table
CREATE TABLE whatsapp_campaign_recipients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    campaign_id INT NOT NULL,
    customer_id INT NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
    sent_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    failed_reason TEXT,
    FOREIGN KEY (campaign_id) REFERENCES whatsapp_campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Add foreign key for template_id in whatsapp_messages
ALTER TABLE whatsapp_messages 
ADD FOREIGN KEY (template_id) REFERENCES whatsapp_templates(id);

-- Insert default WhatsApp templates
INSERT INTO whatsapp_templates (name, category, template_text, variables) VALUES
('Invoice Notification', 'invoice', 'Dear {customer_name}, your invoice {invoice_id} for ₹{amount} has been generated. Please find the details attached. Thank you for your business with {store_name}!', '["customer_name", "invoice_id", "amount", "store_name"]'),

('Payment Reminder', 'reminder', 'Hi {customer_name}, this is a friendly reminder that your payment of ₹{amount} for invoice {invoice_id} is due. Please make payment at your earliest convenience. Contact us: {phone}', '["customer_name", "amount", "invoice_id", "phone"]'),

('Seasonal Offer', 'promotion', '🌾 Special {season} Offer! Get {discount}% off on all {product_category}. Limited time offer valid till {end_date}. Visit our store or call {phone} now!', '["season", "discount", "product_category", "end_date", "phone"]'),

('New Stock Arrival', 'notification', '📦 Great news {customer_name}! Fresh stock of {product_name} has arrived. Perfect for your {crop_type} cultivation. Contact us for bulk orders and special pricing!', '["customer_name", "product_name", "crop_type"]'),

('Welcome Message', 'greeting', 'Welcome to {store_name}, {customer_name}! Thank you for choosing us for your agricultural needs. We are here to help you grow better crops. Contact us anytime: {phone}', '["store_name", "customer_name", "phone"]'),

('Order Confirmation', 'notification', 'Order confirmed! {customer_name}, your order {order_id} worth ₹{amount} has been confirmed. Expected delivery: {delivery_date}. Track your order: {tracking_link}', '["customer_name", "order_id", "amount", "delivery_date", "tracking_link"]'),

('Low Stock Alert', 'notification', 'Hurry {customer_name}! Only {stock_quantity} units of {product_name} left in stock. This is perfect for your {crop_type}. Order now to avoid disappointment!', '["customer_name", "stock_quantity", "product_name", "crop_type"]'),

('Fertilizer Recommendation', 'notification', 'Hi {customer_name}! Based on your {crop_type} cultivation, we recommend {fertilizer_name} for the {growth_stage} stage. Dosage: {dosage}. Visit us for expert guidance!', '["customer_name", "crop_type", "fertilizer_name", "growth_stage", "dosage"]');

-- Create indexes for better performance
CREATE INDEX idx_whatsapp_messages_template ON whatsapp_messages(template_id);
CREATE INDEX idx_whatsapp_messages_scheduled ON whatsapp_messages(scheduled_at);
CREATE INDEX idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX idx_whatsapp_campaigns_status ON whatsapp_campaigns(status);
CREATE INDEX idx_whatsapp_campaigns_scheduled ON whatsapp_campaigns(scheduled_at);
CREATE INDEX idx_campaign_recipients_status ON whatsapp_campaign_recipients(status);

-- Add WhatsApp preferences to customers table
ALTER TABLE customers 
ADD COLUMN whatsapp_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN preferred_language ENUM('english', 'hindi', 'punjabi', 'gujarati') DEFAULT 'english',
ADD COLUMN last_whatsapp_sent TIMESTAMP NULL;

-- Create WhatsApp analytics table
CREATE TABLE whatsapp_analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    messages_sent INT DEFAULT 0,
    messages_delivered INT DEFAULT 0,
    messages_read INT DEFAULT 0,
    messages_failed INT DEFAULT 0,
    unique_recipients INT DEFAULT 0,
    campaigns_sent INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (date)
);
