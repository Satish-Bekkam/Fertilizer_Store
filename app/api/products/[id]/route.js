// PUT (update) a product by id
export async function PUT(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    const data = await request.json();
    await db.query(
      'UPDATE products SET name = ?, category = ?, brand = ?, mrp = ?, sellingPrice = ?, stock = ?, minStock = ?, unit = ?, expiryDate = ?, barcode = ?, description = ? WHERE id = ?',
      [
        data.name,
        data.category,
        data.brand,
        Number(data.mrp),
        Number(data.sellingPrice),
        Number(data.stock),
        Number(data.minStock),
        data.unit,
        data.expiryDate,
        data.barcode,
        data.description,
        id
      ]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
import { NextResponse } from 'next/server';
import { db } from '@/lib/mysql';

// DELETE a product by id
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
