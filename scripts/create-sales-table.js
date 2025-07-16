// This script will create the 'sales' table in the 'agri_store' database if it does not exist.
// Run this file using: node scripts/create-sales-table.js

import { db } from '../lib/mysql.js';

async function createSalesTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS sales (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_id VARCHAR(20),
      customer_id INT,
      customer_name VARCHAR(255),
      phone VARCHAR(20),
      items JSON,
      subtotal DECIMAL(12,2),
      tax DECIMAL(12,2),
      discount DECIMAL(12,2),
      total DECIMAL(12,2),
      paymentMethod VARCHAR(50),
      dueDate DATE,
      date DATE,
      status VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
  `;
  try {
    await db.query(sql);
    console.log('Sales table created or already exists.');
    process.exit(0);
  } catch (err) {
    console.error('Error creating sales table:', err.message);
    process.exit(1);
  }
}

createSalesTable();
