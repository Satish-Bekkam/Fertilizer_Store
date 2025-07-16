import { db } from '@/lib/mysql';

export async function PUT(req, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const data = await req.json();
    if (!id || !data.name || !data.phone || !data.address) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }
    let cropTypes;
    if (Array.isArray(data.crop_types)) {
      cropTypes = JSON.stringify(data.crop_types);
    } else if (typeof data.crop_types === 'string' && data.crop_types.trim() !== '') {
      cropTypes = JSON.stringify([data.crop_types]);
    } else {
      cropTypes = JSON.stringify([]);
    }
    const status = (data.status || 'active').toLowerCase();
    await db.query(
      'UPDATE customers SET name = ?, phone = ?, address = ?, crop_types = ?, status = ? WHERE id = ?',
      [data.name, data.phone, data.address, cropTypes, status, id]
    );
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function DELETE(req, context) {
  try {
    const params = await context.params;
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing customer ID' }), { status: 400 });
    }
    await db.query('DELETE FROM customers WHERE id = ?', [id]);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
