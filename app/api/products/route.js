import { NextResponse } from 'next/server';
import { db } from '@/lib/mysql';

// GET all products
export async function GET() {
  try {
    const [rows] = await db.query('SELECT * FROM products');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST a new product
export async function POST(request) {
  try {
    const data = await request.json();
    const {
      name,
      category,
      brand,
      mrp,
      sellingPrice,
      stock,
      minStock = 10,
      unit = 'kg',
      expiryDate,
      barcode,
      description,
      status = 'active'
    } = data;
    // Validate required fields
    if (!name || isNaN(Number(mrp)) || isNaN(Number(sellingPrice)) || isNaN(Number(stock))) {
      return NextResponse.json({ success: false, error: 'Missing or invalid required fields' }, { status: 400 });
    }
    await db.query(
      `INSERT INTO products 
        (name, category, brand, mrp, sellingPrice, stock, minStock, unit, expiryDate, barcode, description, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, category, brand, mrp, sellingPrice, stock, minStock, unit, expiryDate, barcode, description, status]
    );
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    // Log error for debugging
    console.error('Product POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
