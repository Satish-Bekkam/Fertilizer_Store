// This script will create the 'products' table in the 'agri_store' database if it does not exist.
// Run this file using: node scripts/create-products-table.js

import { db } from '../lib/mysql.js';

async function createProductsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      category VARCHAR(100),
      brand VARCHAR(100),
      price DECIMAL(10,2) NOT NULL,
      stock INT NOT NULL,
      minStock INT DEFAULT 10,
      unit VARCHAR(20) DEFAULT 'kg',
      expiryDate DATE,
      barcode VARCHAR(100),
      description TEXT,
      status VARCHAR(20) DEFAULT 'active'
    );
  `;
  try {
    await db.query(sql);
    console.log('Products table created or already exists.');
    process.exit(0);
  } catch (err) {
    console.error('Error creating products table:', err.message);
    process.exit(1);
  }
}

createProductsTable();
