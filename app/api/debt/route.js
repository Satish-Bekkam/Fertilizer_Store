import { NextResponse } from 'next/server';
import { db } from '@/lib/mysql';

// GET all debt records
export async function GET() {
  try {
    const [rows] = await db.query('SELECT * FROM sales WHERE paymentMethod = "Debt"');
    // Normalize date fields
    const normalizedRows = rows.map(row => ({
      ...row,
      date: row.date ? new Date(row.date).toISOString().split('T')[0] : null,
      dueDate: row.dueDate ? new Date(row.dueDate).toISOString().split('T')[0] : null,
      debtEndDate: row.debtEndDate ? new Date(row.debtEndDate).toISOString().split('T')[0] : null,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
    }));
    return NextResponse.json(normalizedRows);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
