// This script will create the 'customers' table in the 'agri_store' database if it does not exist.
// Run this file using: node scripts/create-customers-table.js

import { db } from '../lib/mysql.js';

async function createCustomersTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      address VARCHAR(255),
      crop_types TEXT,
      status VARCHAR(20) DEFAULT 'active'
    );
  `;
  try {
    await db.query(sql);
    console.log('Customers table created or already exists.');
    process.exit(0);
  } catch (err) {
    console.error('Error creating customers table:', err.message);
    process.exit(1);
  }
}

createCustomersTable();
