"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

type DebtRecord = {
  invoice_id?: string;
  id?: string;
  customer_name?: string;
  customer?: string;
  phone?: string;
  total?: number;
  debtEndDate?: string;
  status?: string;
};

export default function DebtRecordsPage() {
  const [debts, setDebts] = React.useState<DebtRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    fetch("/api/debt")
      .then((res) => res.json())
      .then((data) => {
        setDebts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setDebts([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Debt Records</CardTitle>
            <CardDescription>All sales with payment method "Debt"</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : debts.length === 0 ? (
              <div>No debt records found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Debt End Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debts.map((debt) => (
                    <TableRow key={debt.invoice_id || debt.id}>
                      <TableCell>{debt.invoice_id || debt.id}</TableCell>
                      <TableCell>{debt.customer_name || debt.customer}</TableCell>
                      <TableCell>{debt.phone}</TableCell>
                      <TableCell>₹{debt.total}</TableCell>
                      <TableCell>{debt.debtEndDate || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={debt.status === "Paid" ? "default" : "destructive"}>{debt.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
