"use client"

import React, { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Edit, Trash2, Phone, MapPin, Wheat, MessageSquare, Eye } from "lucide-react"



const cropTypes = [
  "Wheat",
  "Rice",
  "Cotton",
  "Sugarcane",
  "Maize",
  "Groundnut",
  "Vegetables",
  "Fruits",
  "Pulses",
  "Oilseeds",
]

type Customer = {
  id: string;
  name: string;
  phone: string;
  address?: string;
  crop_types?: string[];
  status?: string;
  total_purchases?: number;
  last_purchase_date?: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  // Fetch customers and enrich with sales data
  React.useEffect(() => {
    Promise.all([
      fetch("/api/customers").then(res => res.json()),
      fetch("/api/sales").then(res => res.json())
    ]).then(([customerData, salesData]) => {
      if (Array.isArray(customerData)) {
        // Calculate total_purchases and last_purchase_date for each customer
        const enriched = customerData.map(cust => {
          const custSales = Array.isArray(salesData)
            ? salesData.filter(sale => {
                // Compare both as strings for robust matching
                return sale.customer_id != null && sale.customer_id.toString() === cust.id.toString();
              })
            : [];
          const total_purchases = custSales.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0);
          const last_purchase_date = custSales.length > 0
            ? custSales.reduce((latest, sale) => {
                const saleDate = sale.date ? new Date(sale.date) : null;
                return (!latest || (saleDate && saleDate > latest)) ? saleDate : latest;
              }, null)
            : null;
          return {
            ...cust,
            total_purchases,
            last_purchase_date: last_purchase_date ? last_purchase_date.toISOString().split('T')[0] : "-"
          };
        });
        setCustomers(enriched);
      } else {
        setCustomers([]);
      }
    }).catch(() => setCustomers([]));
  }, [])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [newCustomer, setNewCustomer] = useState<{
    name: string;
    phone: string;
    address: string;
    crop_types: string[];
    status: string;
  }>({
    name: "",
    phone: "",
    address: "",
    crop_types: [],
    status: "active",
  });

  const filteredCustomers = Array.isArray(customers)
    ? customers.filter((customer) => {
        const name = (customer.name || "").toLowerCase();
        const phone = customer.phone || "";
        const cropTypes = (customer.crop_types || []).join(", ").toLowerCase();
        return (
          name.includes(searchTerm.toLowerCase()) ||
          phone.includes(searchTerm) ||
          cropTypes.includes(searchTerm.toLowerCase())
        );
      })
    : [];

  const handleAddCustomer = async () => {
    if (newCustomer.name && newCustomer.phone) {
      try {
        const response = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...newCustomer,
            crop_types: Array.isArray(newCustomer.crop_types) ? newCustomer.crop_types : [newCustomer.crop_types],
            status: (newCustomer.status || "active").toLowerCase(),
          }),
        });
        if (response.ok) {
          // Refetch customers from backend
          fetch("/api/customers")
            .then((res) => res.json())
            .then(setCustomers);
          setNewCustomer({ name: "", phone: "", address: "", crop_types: [], status: "active" });
          setIsAddDialogOpen(false);
        } else {
          alert("Failed to add customer");
        }
      } catch (error) {
        alert("Error adding customer");
      }
    }
  }

  const handleDeleteCustomer = async (id: string) => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        // Refetch customers from backend
        fetch("/api/customers")
          .then((res) => res.json())
          .then(setCustomers);
      } else {
        alert("Failed to delete customer");
      }
    } catch (error) {
      alert("Error deleting customer");
    }
  }

  const sendWhatsAppMessage = (customer: Customer) => {
    // Simulate WhatsApp message sending
    alert(`WhatsApp message sent to ${customer.name} (${customer.phone})`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
              <p className="text-gray-600">Manage your customer database</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                  <DialogDescription>Enter customer details to add them to your database.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">
                      Address
                    </Label>
                    <Textarea
                      id="address"
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="crop_types" className="text-right">
                    Crops
                  </Label>
                  {/* The shadcn/ui Select does not support multiple natively. Use a workaround with checkboxes or use a single select for now. */}
                  <Select
                    value={newCustomer.crop_types && newCustomer.crop_types.length > 0 ? newCustomer.crop_types[0] : ""}
                    onValueChange={(value) => setNewCustomer({ ...newCustomer, crop_types: value ? [value] : [] })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent>
                      {cropTypes.map((crop) => (
                        <SelectItem key={crop} value={crop}>
                          {crop}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddCustomer}>Add Customer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers by name, phone, or crop type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Export CSV</Button>
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Bulk WhatsApp
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {customers.filter((c) => (c.status || "active") === "active").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{customers.reduce((sum, c) => sum + (c.total_purchases || 0), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Purchase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹
                {customers.length > 0
                  ? Math.round(
                      customers.reduce((sum, c) => sum + (c.total_purchases || 0), 0) / customers.length,
                    ).toLocaleString()
                  : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
            <CardDescription>
              Showing {filteredCustomers.length} of {customers.length} customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Crops</TableHead>
                  <TableHead>Total Purchases</TableHead>
                  <TableHead>Last Purchase</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name || "-"}</div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {(customer.address || "-").split(",")[0]}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {customer.phone || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                    <div className="flex items-center">
                      <Wheat className="h-4 w-4 mr-2 text-green-600" />
                      {(customer.crop_types && customer.crop_types.length > 0) ? customer.crop_types.join(", ") : "-"}
                    </div>
                    </TableCell>
                    <TableCell>₹{(customer.total_purchases || 0).toLocaleString()}</TableCell>
                    <TableCell>{customer.last_purchase_date || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={(customer.status || "active") === "active" ? "default" : "secondary"}>{customer.status || "active"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => { setViewCustomer(customer); setIsViewOpen(true); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
      {/* View Customer Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>View customer information.</DialogDescription>
          </DialogHeader>
          {viewCustomer && (
            <div className="space-y-2">
              <div><span className="font-semibold">Name:</span> {viewCustomer.name}</div>
              <div><span className="font-semibold">Phone:</span> {viewCustomer.phone}</div>
              <div><span className="font-semibold">Address:</span> {viewCustomer.address}</div>
              <div><span className="font-semibold">Crops:</span> {viewCustomer.crop_types && viewCustomer.crop_types.length > 0 ? viewCustomer.crop_types.join(", ") : "-"}</div>
              <div><span className="font-semibold">Status:</span> {viewCustomer.status}</div>
              <div><span className="font-semibold">Total Purchases:</span> ₹{(viewCustomer.total_purchases || 0).toLocaleString()}</div>
              <div><span className="font-semibold">Last Purchase:</span> {viewCustomer.last_purchase_date || "-"}</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
                        <Dialog open={selectedCustomer && selectedCustomer.id === customer.id} onOpenChange={open => { if (!open) setSelectedCustomer(null); }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(customer)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Edit Customer</DialogTitle>
                              <DialogDescription>Edit customer details and save changes.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">Name</Label>
                                <Input id="edit-name" value={selectedCustomer?.name || ""} onChange={e => setSelectedCustomer({ ...selectedCustomer, name: e.target.value })} className="col-span-3" />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-phone" className="text-right">Phone</Label>
                                <Input id="edit-phone" value={selectedCustomer?.phone || ""} onChange={e => setSelectedCustomer({ ...selectedCustomer, phone: e.target.value })} className="col-span-3" />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-address" className="text-right">Address</Label>
                                <Textarea id="edit-address" value={selectedCustomer?.address || ""} onChange={e => setSelectedCustomer({ ...selectedCustomer, address: e.target.value })} className="col-span-3" />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-crop_types" className="text-right">Crops</Label>
                                <Select value={selectedCustomer?.crop_types && selectedCustomer.crop_types.length > 0 ? selectedCustomer.crop_types[0] : ""} onValueChange={value => setSelectedCustomer({ ...selectedCustomer, crop_types: value ? [value] : [] })}>
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select crop type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {cropTypes.map((crop) => (
                                      <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={async () => {
                                if (!selectedCustomer) return;
                                const response = await fetch(`/api/customers/${selectedCustomer.id}`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify(selectedCustomer)
                                });
                                if (response.ok) {
                                  fetch("/api/customers")
                                    .then((res) => res.json())
                                    .then((data) => setCustomers(Array.isArray(data) ? data : []));
                                  setSelectedCustomer(null);
                                } else {
                                  alert("Failed to update customer");
                                }
                              }}>Save</Button>
                              <Button variant="ghost" onClick={() => setSelectedCustomer(null)}>Cancel</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm" onClick={() => sendWhatsAppMessage(customer)}>
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteCustomer(customer.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
