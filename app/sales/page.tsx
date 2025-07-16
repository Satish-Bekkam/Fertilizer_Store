"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Download, MessageSquare, Eye, Trash2 } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import SaleDetailsDialog from "@/components/sale-details-dialog"

import { useToast } from "@/hooks/use-toast"

// Fetch customers, products, and sales from API
import React from "react"
import DebtCompound from "@/components/debt-compound"

type SaleItem = {
  product: string;
  quantity: number;
  price: number;
  total: number;
};
type Sale = {
  id?: string;
  customer: string;
  customer_id?: number | null;
  phone: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  dueDate: Date | string;
  debtEndDate?: Date | string;
  date?: string;
  status?: string;
};
type Customer = { id: number; name: string; phone: string };
type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  unit: string;
  mrp?: number;
  sellingPrice?: number;
};

export default function SalesPage() {
  const { toast } = useToast()
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [products, setProducts] = React.useState<Product[]>([])
  const [sales, setSales] = React.useState<Sale[]>([])
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentSale, setCurrentSale] = useState<Sale>({
    customer: "",
    customer_id: null,
    phone: "",
    items: [] as SaleItem[],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    paymentMethod: "Cash",
    dueDate: "", // Use string for deterministic SSR
    debtEndDate: undefined,
  })
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editSale, setEditSale] = useState<Sale | null>(null)
  // Edit Sale logic
  const openEditDialog = (sale: Sale) => {
    setEditSale(sale);
    setIsEditOpen(true);
  };

  const handleEditChange = (field: keyof Sale, value: any) => {
    if (!editSale) return;
    setEditSale({ ...editSale, [field]: value });
  };

  const saveEditedSale = async () => {
    if (!editSale) return;
    try {
      const response = await fetch(`/api/sales/${editSale.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editSale),
      });
      if (response.ok) {
        // Refetch sales
        fetch("/api/sales")
          .then((res) => res.json())
          .then((data) => setSales(Array.isArray(data) ? data : []));
        setIsEditOpen(false);
        toast({ title: "Sale Updated", description: `Sale ${editSale.id} updated successfully.` });
      } else {
        toast({ title: "Error", description: "Failed to update sale", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to update sale", variant: "destructive" });
    }
  };

  // Fetch customers
  React.useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(Array.isArray(data) ? data : []))
      .catch(() => setCustomers([]))
  }, [])
  // Fetch products
  React.useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
  }, [])
  // Fetch sales
  React.useEffect(() => {
    fetch("/api/sales")
      .then((res) => res.json())
      .then((data) => setSales(Array.isArray(data) ? data : []))
      .catch(() => setSales([]))
  }, [])

  const filteredSales = sales.filter((sale: Sale) => {
    const id = (sale && sale.id != null) ? sale.id.toString().toLowerCase() : '';
    const customerName = (() => {
      if (!sale) return '';
      const found = customers.find(c => c && (c.id === sale.customer_id || c.name === sale.customer));
      return (found && found.name ? found.name : sale.customer) || '';
    })().toLowerCase();
    const phone = (sale && sale.phone ? sale.phone : '').toLowerCase();
    const status = (sale && sale.status ? sale.status : '').toLowerCase();
    const date = (sale && sale.date ? sale.date : '').toLowerCase();
    const term = (searchTerm || '').toLowerCase();
    return (
      id.includes(term) ||
      customerName.includes(term) ||
      phone.includes(term) ||
      status.includes(term) ||
      date.includes(term)
    );
  });

  const addItemToSale = () => {
    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Please select a product",
        variant: "destructive",
      })
      return
    }

    const product = products.find((p: Product) => p.id.toString() === selectedProduct)
    if (!product) return

    if (quantity > product.stock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.stock} units available for ${product.name}`,
        variant: "destructive",
      })
      return
    }

    // Use product's sellingPrice for price fields
    const price = product.sellingPrice ?? product.mrp ?? product.price ?? 0;
    const newItem: SaleItem = {
      product: product.name,
      quantity: quantity,
      price: price,
      total: quantity * price,
    }

    const updatedItems: SaleItem[] = [...(currentSale.items || []), newItem]
    // Subtotal is sum of item totals (using sellingPrice)
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0)
    // Tax is 18% of subtotal
    const tax = subtotal * 0.18
    // Total is subtotal + tax
    const total = subtotal + tax
    // Discount is always 0 (no manual selling price field)

    setCurrentSale({
      ...currentSale,
      items: updatedItems,
      subtotal,
      tax,
      total,
      discount: 0,
    })

    setSelectedProduct("")
    setQuantity(1)

    toast({
      title: "Item Added",
      description: `${product.name} added to invoice (MRP: ₹${product.mrp ?? product.price}, Selling Price: ₹${product.sellingPrice ?? product.price})`,
    })
  }

  const removeItemFromSale = (index: number) => {
    const updatedItems: SaleItem[] = (currentSale.items || []).filter((_, i) => i !== index)
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * 0.18
    const total = subtotal + tax - currentSale.discount

    setCurrentSale({
      ...currentSale,
      items: updatedItems,
      subtotal,
      tax,
      total,
    })
  }

  const generateInvoiceNumber = () => {
    if (!sales || sales.length === 0) return "INV-001"
    const lastInvoice = sales[0]
    if (!lastInvoice.id) return "INV-001"
    const lastNumber = Number.parseInt(lastInvoice.id.split("-")[1])
    return `INV-${String(lastNumber + 1).padStart(3, "0")}`
  }

  const createSale = async () => {
    if (!currentSale.customer || currentSale.items.length === 0) {
      toast({
        title: "Error",
        description: "Please select customer and add items",
        variant: "destructive",
      })
      return
    }

    // Prepare sale data for API
    const salePayload = {
      customer_id: currentSale.customer_id,
      items: currentSale.items || [],
      subtotal: currentSale.subtotal,
      tax: currentSale.tax,
      discount: currentSale.discount,
      total: currentSale.total,
      paymentMethod: currentSale.paymentMethod,
      dueDate:
        !currentSale.dueDate || currentSale.dueDate === ""
          ? null
          : (typeof currentSale.dueDate === "string"
              ? currentSale.dueDate
              : (currentSale.dueDate instanceof Date
                  ? currentSale.dueDate.toISOString().split("T")[0]
                  : null)),
      date: new Date().toISOString().split('T')[0],
      status: currentSale.paymentMethod === "Credit" ? "Pending" : "Paid",
      phone: currentSale.phone,
      customer: currentSale.customer,
    }

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(salePayload),
      })
      if (response.ok) {
        // Refetch sales
        fetch("/api/sales")
          .then((res) => res.json())
          .then((data) => setSales(Array.isArray(data) ? data : []))
        setCurrentSale({
          customer: "",
          customer_id: null,
          phone: "",
          items: [] as SaleItem[],
          subtotal: 0,
          tax: 0,
          discount: 0,
          total: 0,
          paymentMethod: "Cash",
          dueDate: "", // Reset to string
        })
        setIsNewSaleOpen(false)
        toast({
          title: "Invoice Created",
          description: `Invoice created successfully`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to create sale",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create sale",
        variant: "destructive",
      })
    }
  }

  // Invoice Dialog state for real-time bill and print
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [invoiceSale, setInvoiceSale] = useState<Sale | null>(null);

  // Print handler for invoice dialog
  const handlePrintInvoice = () => {
    const printContents = document.getElementById('invoice-bill-content');
    if (!printContents) return;
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;
    printWindow.document.write('<html><head><title>Invoice Bill</title>');
    printWindow.document.write('<style>body{font-family:sans-serif;padding:24px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:8px;} th{background:#f3f3f3;} .text-right{text-align:right;} .text-center{text-align:center;} .font-bold{font-weight:bold;} .mb-2{margin-bottom:8px;} .mt-2{margin-top:8px;} </style>');
    printWindow.document.write('</head><body >');
    printWindow.document.write(printContents.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Show invoice dialog with real-time bill
  const showInvoiceDialog = (sale: Sale) => {
    setInvoiceSale(sale);
    setIsInvoiceDialogOpen(true);
  };

  const sendWhatsAppInvoice = (sale: Sale) => {
    showInvoiceDialog(sale);
    toast({
      title: "WhatsApp Sent",
      description: `Invoice ${sale.id} sent to ${sale.customer}`,
    });
  };

  const downloadPDF = (sale: Sale) => {
    showInvoiceDialog(sale);
    toast({
      title: "PDF Downloaded",
      description: `Invoice ${sale.id} downloaded successfully`,
    });
  };

  const viewSaleDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailsOpen(true);
  };

  const deleteSale = async (saleId: string) => {
    try {
      const response = await fetch(`/api/sales/${saleId}`, { method: "DELETE" })
      if (response.ok) {
        setSales(sales.filter((sale: Sale) => sale.id !== saleId))
        toast({
          title: "Invoice Deleted",
          description: "Invoice has been deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete sale",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete sale",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      {/* DebtCompound removed: now in Debt Records module */}
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sales & Invoicing</h1>
                <p className="text-gray-600">Create invoices and manage sales</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setIsNewSaleOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Sale
                </Button>
              </div>
            </div>
          </div>
        </header>

        <SaleDetailsDialog 
          sale={selectedSale} 
          isOpen={isDetailsOpen} 
          onClose={() => setIsDetailsOpen(false)}
          printInvoice={() => {
            // Print only the invoice dialog content
            const dialog = document.getElementById('invoice-dialog-content');
            if (dialog) {
              const printWindow = window.open('', '', 'width=800,height=600');
              printWindow?.document.write('<html><head><title>Print Invoice</title>');
              printWindow?.document.write('<style>body{font-family:sans-serif;padding:24px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ccc;padding:8px;} .text-right{text-align:right;}</style>');
              printWindow?.document.write('</head><body >');
              printWindow?.document.write(dialog.innerHTML);
              printWindow?.document.write('</body></html>');
              printWindow?.document.close();
              printWindow?.focus();
              printWindow?.print();
            }
          }}
        />
        {/* Real-time Invoice Bill Dialog */}
        <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice Bill</DialogTitle>
              <DialogDescription>Real-time invoice bill for sale</DialogDescription>
            </DialogHeader>
            {invoiceSale && (
              <div id="invoice-bill-content" className="bg-white p-8 rounded-lg shadow-lg border max-w-xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <div className="text-2xl font-bold text-primary mb-1">Fertilizer Store</div>
                    <div className="text-sm text-gray-500">Invoice #{invoiceSale.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">Date: {invoiceSale.date}</div>
                  </div>
                </div>
                <div className="mb-4 p-4 bg-gray-50 rounded border flex flex-col gap-1">
                  <div className="font-semibold text-lg text-gray-700">Customer Details</div>
                  <div>Name: <span className="font-bold text-primary">{invoiceSale.customer || (customers.find(c => c.id === invoiceSale.customer_id)?.name || "-")}</span></div>
                  <div>Phone: <span className="font-bold">{invoiceSale.phone}</span></div>
                </div>
                <table className="w-full mb-6 border rounded overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left py-2 px-3">Product</th>
                      <th className="text-center py-2 px-3">Qty</th>
                      <th className="text-right py-2 px-3">Price</th>
                      <th className="text-right py-2 px-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceSale.items.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2 px-3">{item.product}</td>
                        <td className="text-center py-2 px-3">{item.quantity}</td>
                        <td className="text-right py-2 px-3">₹{item.price}</td>
                        <td className="text-right py-2 px-3">₹{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <table className="w-full mb-6 border rounded overflow-hidden">
                  <tbody>
                    <tr className="bg-gray-50 font-semibold">
                      <td className="py-2 px-3 text-right">Subtotal</td>
                      <td className="py-2 px-3 text-right">₹{invoiceSale.subtotal}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-2 px-3 text-right">Tax (18% GST)</td>
                      <td className="py-2 px-3 text-right">₹{invoiceSale.tax}</td>
                    </tr>
                    <tr className="bg-gray-50 font-bold">
                      <td className="py-2 px-3 text-right">Total</td>
                      <td className="py-2 px-3 text-right">₹{invoiceSale.total}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-2 px-3 text-right">Discount</td>
                      <td className="py-2 px-3 text-right">₹{invoiceSale.discount}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-2 px-3 text-right">Payment Method</td>
                      <td className="py-2 px-3 text-right">{invoiceSale.paymentMethod}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-2 px-3 text-right">Status</td>
                      <td className="py-2 px-3 text-right">{invoiceSale.status}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt-8 text-center text-xs text-gray-400">Thank you for your business!</div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handlePrintInvoice}>Print</Button>
              <Button variant="ghost" onClick={() => setIsInvoiceDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Sale Dialog */}
        <Dialog open={isNewSaleOpen} onOpenChange={setIsNewSaleOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>New Sale</DialogTitle>
              <DialogDescription>Create a new invoice and sale</DialogDescription>
            </DialogHeader>
            {/* Customer Selection */}
            <div className="mb-4">
              <Label htmlFor="customer">Customer</Label>
              <Select
                value={currentSale.customer_id ? currentSale.customer_id.toString() : ""}
                onValueChange={(val) => {
                  const selected = customers.find(c => c.id.toString() === val)
                  setCurrentSale({
                    ...currentSale,
                    customer_id: selected ? selected.id : null,
                    customer: selected ? selected.name : "",
                    phone: selected ? selected.phone : "",
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name} ({c.phone})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Product Selection */}
            <div className="mb-4">
              <Label htmlFor="product">Product & Quantity</Label>
              <div className="flex gap-2 items-end">
                <Select
                  value={selectedProduct}
                  onValueChange={val => {
                    setSelectedProduct(val);
                    const product = products.find((p: Product) => p.id.toString() === val);
                    if (product) {
                      setCurrentSale(sale => ({
                        ...sale,
                        // Optionally update price fields if needed
                        // You may want to show MRP/Selling Price in UI only, not update sale state here
                      }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name} (₹{p.price}, {p.stock} {p.unit})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  placeholder="Qty"
                  className="w-24"
                />
                <Button variant="secondary" onClick={addItemToSale}>Add</Button>
              </div>
              {/* Show MRP and Selling Price for selected product */}
              {selectedProduct && (() => {
                const product = products.find((p: Product) => p.id.toString() === selectedProduct);
                if (!product) return null;
                return (
                  <div className="mt-2 flex gap-4">
                    <div className="text-sm text-gray-700">MRP: <span className="font-semibold">₹{product.mrp ?? product.price}</span></div>
                    <div className="text-sm text-gray-700">Selling Price: <span className="font-semibold">₹{product.sellingPrice ?? product.price}</span></div>
                  </div>
                );
              })()}
            </div>
            {/* Items List */}
            {currentSale.items.length > 0 && (
              <div className="mb-4">
                <Label>Items</Label>
                <ul className="list-disc ml-6">
                  {currentSale.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center">
                      <span>{item.product} x {item.quantity} = ₹{item.total}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeItemFromSale(idx)}>Remove</Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Payment Method */}
          <div className="mb-4">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={currentSale.paymentMethod}
              onValueChange={val => setCurrentSale({ ...currentSale, paymentMethod: val })}
            >
              <SelectTrigger id="paymentMethod">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Credit">Credit</SelectItem>
                <SelectItem value="Debt">Debt</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
            {/* Due Date for Debt */}
            {currentSale.paymentMethod === "Debt" && (
              <div className="mb-4">
                <Label htmlFor="dueDate">Debt End Date</Label>
                <DatePicker
                  date={currentSale.dueDate ? new Date(currentSale.dueDate) : null}
                  onDateChange={(date: Date | null) => setCurrentSale({ ...currentSale, dueDate: date ? date.toISOString().split('T')[0] : "" })}
                />
              </div>
            )}
            {/* Totals */}
            <div className="mb-4">
              <Label>Subtotal: ₹{currentSale.subtotal}</Label><br />
              <Label>Tax (18% GST): ₹{currentSale.tax}</Label><br />
              <Label>Total (Selling Price): ₹{currentSale.total}</Label><br />
              <Label>Discount: ₹{currentSale.discount}</Label>
            </div>
            <DialogFooter>
              <Button onClick={createSale}>Create Sale</Button>
              <Button variant="ghost" onClick={() => setIsNewSaleOpen(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* New Sale Button moved to header */}
          {/* Sales Stats */}
          {(() => {
            // ...existing code...
            const todayStr = new Date().toISOString().split('T')[0];
            const isToday = (dateStr?: string) => dateStr === todayStr;
            // ...existing code...
            const totalSalesAmount = sales
              .filter((sale: Sale) => isToday(sale.date))
              .reduce((sum: number, sale: Sale) => sum + (typeof sale.total === 'number' ? sale.total : 0), 0);
            const todaysSales = sales.filter((sale: Sale) => isToday(sale.date));
            const pendingPayments = sales.filter((s: Sale) => s.status === "Pending")
            const pendingPaymentsAmount = pendingPayments.reduce((sum: number, sale: Sale) => sum + sale.total, 0)
            const itemsSold = sales.reduce((sum: number, sale: Sale) => sum + (sale.items as SaleItem[]).reduce((itemSum: number, item: SaleItem) => itemSum + item.quantity, 0), 0)
            const avgOrderValue = sales.length > 0 ? Math.round(sales.reduce((sum: number, sale: Sale) => sum + sale.total, 0) / sales.length) : 0
            return (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{totalSalesAmount.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">{todaysSales.length} transactions</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      ₹{pendingPaymentsAmount.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {pendingPayments.length} invoices
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {itemsSold}
                    </div>
                    <p className="text-xs text-muted-foreground">Total units</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{avgOrderValue.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">Per transaction</p>
                  </CardContent>
                </Card>
              </div>
            )
          })()}

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search invoices by ID or customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sales Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>
                Showing {filteredSales.length} of {sales.length} invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale: Sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {(() => {
                              const found = customers.find(c => c.id === sale.customer_id || c.name === sale.customer);
                              return found ? found.name : sale.customer;
                            })()}
                          </div>
                          <div className="text-sm text-gray-500">{sale.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{
                        sale.date
                          ? (() => {
                              // Always format from string
                              const d = new Date(sale.date as string);
                              return !isNaN(d.getTime())
                                ? `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`
                                : sale.date;
                            })()
                          : "-"
                      }</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {(sale.items as SaleItem[]).length} item{(sale.items as SaleItem[]).length > 1 ? "s" : ""}
                          <div className="text-xs text-gray-500">
                            {(sale.items as SaleItem[]).reduce((sum: number, item: SaleItem) => sum + item.quantity, 0)} units
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>₹{sale.total.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{sale.paymentMethod}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={sale.status === "Paid" ? "default" : "destructive"}>{sale.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => viewSaleDetails(sale)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(sale)}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => downloadPDF(sale)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => sendWhatsAppInvoice(sale)}>
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteSale(sale.id!)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
      {/* Edit Sale Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Sale</DialogTitle>
            <DialogDescription>Edit invoice and sale details</DialogDescription>
          </DialogHeader>
          {editSale && (
            <>
              <div className="mb-4">
                <Label htmlFor="customer">Customer</Label>
                <Input
                  value={editSale.customer}
                  onChange={e => handleEditChange("customer", e.target.value)}
                  placeholder="Customer name"
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  value={editSale.phone}
                  onChange={e => handleEditChange("phone", e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={editSale.paymentMethod}
                  onValueChange={val => handleEditChange("paymentMethod", val)}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Credit">Credit</SelectItem>
                    <SelectItem value="Debt">Debt</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mb-4">
                <Label htmlFor="total">Total</Label>
                <Input
                  type="number"
                  value={editSale.total}
                  onChange={e => handleEditChange("total", Number(e.target.value))}
                  placeholder="Total amount"
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editSale.status || ""}
                  onValueChange={val => handleEditChange("status", val)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          <DialogFooter>
            <Button onClick={saveEditedSale}>Save</Button>
            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
