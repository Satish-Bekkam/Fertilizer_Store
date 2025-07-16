export async function DELETE(req) {
  try {
    // Extract customer ID from the URL
    const url = new URL(req.url, 'http://localhost');
    const id = url.pathname.split('/').pop();
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing customer ID' }), { status: 400 });
    }
    const [result] = await db.query('DELETE FROM customers WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: 'Customer not found' }), { status: 404 });
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

import { db } from '@/lib/mysql';

export async function GET(req) {
  try {
    const [rows] = await db.query('SELECT * FROM customers');
    // Parse crop_types JSON for each customer
    const customers = rows.map((row) => ({
      ...row,
      crop_types: row.crop_types ? JSON.parse(row.crop_types) : [],
    }));
    return new Response(JSON.stringify(customers), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    // Validate required fields
    if (!data.name || !data.phone || !data.address) {
      return new Response(JSON.stringify({ error: 'Missing required fields: name, phone, address' }), { status: 400 });
    }
    // Store crop_types as JSON string (empty array if not provided)
    let cropTypes;
    if (Array.isArray(data.crop_types)) {
      cropTypes = JSON.stringify(data.crop_types);
    } else if (typeof data.crop_types === 'string' && data.crop_types.trim() !== '') {
      cropTypes = JSON.stringify([data.crop_types]);
    } else {
      cropTypes = JSON.stringify([]);
    }
    const status = (data.status || 'active').toLowerCase();
    const [result] = await db.query(
      'INSERT INTO customers (name, phone, address, crop_types, status) VALUES (?, ?, ?, ?, ?)',
      [data.name, data.phone, data.address, cropTypes, status]
    );
    return new Response(JSON.stringify({ success: true, id: result.insertId }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
