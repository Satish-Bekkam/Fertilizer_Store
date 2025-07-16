import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';

// DELETE a sale by id
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await pool.query('DELETE FROM sales WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
