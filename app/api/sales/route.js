import { NextResponse } from 'next/server';
import { db } from '@/lib/mysql';

// GET all sales
export async function GET() {
  try {
    const [rows] = await db.query('SELECT * FROM sales');
    // Normalize date and dueDate fields to YYYY-MM-DD string
    const normalizedRows = rows.map(row => ({
      ...row,
      date: row.date ? new Date(row.date).toISOString().split('T')[0] : null,
      dueDate: row.dueDate ? new Date(row.dueDate).toISOString().split('T')[0] : null,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
    }));
    return NextResponse.json(normalizedRows);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST a new sale
export async function POST(request) {
  try {
    const data = await request.json();
    // Log the incoming data for debugging
    console.log('POST /api/sales payload:', data);
    const {
      customer_id,
      customer,
      phone,
      items,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      dueDate,
      date,
      status
    } = data;
    // Basic validation
    if (!customer_id || !customer || !Array.isArray(items) || items.length === 0 || !subtotal || !total || !paymentMethod) {
      return NextResponse.json({ success: false, error: 'Missing required fields', data }, { status: 400 });
    }
    // Use columns from the actual table (create-sales-table.js)
    const invoice_id = `INV-${Date.now()}`;
    await db.query(
      `INSERT INTO sales (invoice_id, customer_id, customer_name, phone, items, subtotal, tax, discount, total, paymentMethod, dueDate, date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoice_id,
        customer_id,
        customer,
        phone,
        JSON.stringify(items),
        subtotal,
        tax,
        discount,
        total,
        paymentMethod,
        dueDate,
        date,
        status
      ]
    );
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    // Log error for debugging
    console.error('POST /api/sales error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
