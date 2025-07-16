-- Migration: Add sellingPrice column to products table
ALTER TABLE products
ADD COLUMN sellingPrice DECIMAL(10,2) DEFAULT 0;
