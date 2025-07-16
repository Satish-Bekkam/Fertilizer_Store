"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  MessageSquare,
  Send,
  Users,
  FileText,
  Megaphone,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"



type Customer = {
  id: number;
  name: string;
  phone: string;
  lastMessage?: string;
  status?: string;
};

type Invoice = {
  id: string;
  customer_id?: number;
  customer?: string;
  phone?: string;
  amount: number;
  date: string;
  sent?: boolean;
  items?: Array<{
    product: string;
    quantity: number;
    price: number;
    total: number;
  }>;
};

// --- State and Effects for Dynamic Data ---


// --- Message Templates ---
const messageTemplates = [
  {
    id: 1,
    name: "Invoice Notification",
    type: "invoice",
    template:
      "Dear {customer_name}, your invoice {invoice_id} for ₹{amount} has been generated. Please find the details attached. Thank you for your business!",
    variables: ["customer_name", "invoice_id", "amount"],
  },
  {
    id: 2,
    name: "Payment Reminder",
    type: "reminder",
    template:
      "Hi {customer_name}, this is a friendly reminder that your payment of ₹{amount} for invoice {invoice_id} is due. Please make payment at your earliest convenience.",
    variables: ["customer_name", "invoice_id", "amount"],
  },
  {
    id: 3,
    name: "Seasonal Offer",
    type: "promotion",
    template:
      "🌾 Special Offer Alert! Get {discount}% off on all {product_category} this {season}. Limited time offer. Visit our store or call us now!",
    variables: ["discount", "product_category", "season"],
  },
  {
    id: 4,
    name: "New Stock Arrival",
    type: "notification",
    template:
      "📦 New stock has arrived! Fresh supply of {product_name} now available. Contact us for bulk orders and special pricing.",
    variables: ["product_name"],
  },
]


// TODO: Make messageHistory dynamic (from DB/API) in future
const messageHistory: any[] = [];

// --- Main Component ---
export default function WhatsAppPage() {
  // --- Data State ---
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);

  // --- UI State ---
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [messageType, setMessageType] = useState("individual");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("send");

  // Fetch customers
  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(Array.isArray(data) ? data : []))
      .catch(() => setCustomers([]));
  }, []);

  // Fetch recent invoices (sales)
  useEffect(() => {
    fetch("/api/sales")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRecentInvoices(
            data.slice(0, 10).map((sale) => {
              const cust = customers.find((c) => c.id === sale.customer_id);
              return {
                id: sale.id || sale.invoice_id,
                customer_id: sale.customer_id,
                customer: cust ? cust.name : sale.customer,
                phone: cust ? cust.phone : sale.phone,
                amount: sale.total,
                date: sale.date,
                sent: sale.status === "Paid",
                items: Array.isArray(sale.items) ? sale.items : [],
              };
            })
          );
        } else {
          setRecentInvoices([]);
        }
      })
      .catch(() => setRecentInvoices([]));
  }, [customers]);

  const filteredCustomers = customers.filter(
    (customer) => customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || customer.phone.includes(searchTerm),
  )

  const handleCustomerSelect = (customerId: number, checked: boolean) => {
    if (checked) {
      setSelectedCustomers([...selectedCustomers, customerId])
    } else {
      setSelectedCustomers(selectedCustomers.filter((id) => id !== customerId))
    }
  }

  const sendInvoice = (invoice: Invoice) => {
    const template = messageTemplates.find((t) => t.type === "invoice")

    const message = template?.template
      .replace("{customer_name}", invoice.customer || "")
      .replace("{invoice_id}", invoice.id)
      .replace("{amount}", invoice.amount?.toLocaleString?.() ?? "")

    alert(`Invoice sent to ${invoice.customer}:\n\n${message}`)
  }

  const sendBulkMessage = () => {
    if (selectedCustomers.length === 0) {
      alert("Please select at least one customer");
      return;
    }

    // Get the selected template object
    const templateObj = messageTemplates.find((t) => t.id.toString() === selectedTemplate);
    if (!templateObj && !customMessage) {
      alert("Please select a template or enter a custom message.");
      return;
    }

    // For each selected customer, generate the message and open WhatsApp Web
    customers
      .filter((c) => selectedCustomers.includes(c.id))
      .forEach((customer) => {
        let message = customMessage;
        if (templateObj) {
          message = templateObj.template;
          // Replace variables in the template
          message = message.replace("{customer_name}", customer.name || "");
          message = message.replace("{phone}", customer.phone || "");
          // Add more replacements as needed
        }
        // Encode message for URL
        const encodedMsg = encodeURIComponent(message);
        // Remove any non-digit characters from phone
        const phone = customer.phone.replace(/\D/g, "");
        // Open WhatsApp Web in a new tab
        window.open(`https://wa.me/${phone}?text=${encodedMsg}`, "_blank");
      });

    setSelectedCustomers([]);
    setIsComposeOpen(false);
  } 

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "sent":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">WhatsApp Business</h1>
              <p className="text-gray-600">Send invoices, offers, and communicate with customers</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Messages
              </Button>
              <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Compose Message
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Compose WhatsApp Message</DialogTitle>
                    <DialogDescription>
                      Send messages to individual customers or broadcast to multiple customers
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Message Type</Label>
                      <Select value={messageType} onValueChange={setMessageType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual Message</SelectItem>
                          <SelectItem value="bulk">Bulk Message</SelectItem>
                          <SelectItem value="broadcast">Broadcast to All</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {messageType !== "broadcast" && (
                      <div>
                        <Label>Select Customers</Label>
                        <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                          {customers.map((customer) => (
                            <div key={customer.id} className="flex items-center space-x-2 py-2">
                              <Checkbox
                                id={`customer-${customer.id}`}
                                checked={selectedCustomers.includes(customer.id)}
                                onCheckedChange={(checked) => handleCustomerSelect(customer.id, checked === true)}
                              />
                              <label htmlFor={`customer-${customer.id}`} className="flex-1 cursor-pointer">
                                <div className="font-medium">{customer.name}</div>
                                <div className="text-sm text-gray-500">{customer.phone}</div>
                              </label>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{selectedCustomers.length} customer(s) selected</p>
                      </div>
                    )}

                    <div>
                      <Label>Message Template</Label>
                      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a template or write custom message" />
                        </SelectTrigger>
                        <SelectContent>
                          {messageTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id.toString()}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Message Content</Label>
                      <Textarea
                        placeholder="Type your message here..."
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        rows={4}
                      />
                      {selectedTemplate && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-800">Template Preview:</p>
                          <p className="text-sm text-blue-700 mt-1">
                            {messageTemplates.find((t) => t.id.toString() === selectedTemplate)?.template}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={sendBulkMessage}>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">+5 from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">98%</div>
              <p className="text-xs text-muted-foreground">22 of 23 delivered</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.filter((c) => c.status === "Active").length}</div>
              <p className="text-xs text-muted-foreground">WhatsApp enabled</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{recentInvoices.filter((i) => !i.sent).length}</div>
              <p className="text-xs text-muted-foreground">Ready to send</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="send">Send Messages</TabsTrigger>
            <TabsTrigger value="invoices">Invoice Delivery</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="history">Message History</TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Customer Directory
                  </CardTitle>
                  <CardDescription>Select customers to send messages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {filteredCustomers.map((customer) => (
                        <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={selectedCustomers.includes(customer.id)}
                              onCheckedChange={(checked) => handleCustomerSelect(customer.id, checked === true)}
                            />
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-sm text-gray-500">{customer.phone}</p>
                            </div>
                          </div>
                          <Badge variant={customer.status === "Active" ? "default" : "secondary"}>
                            {customer.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-gray-500">{selectedCustomers.length} selected</span>
                      <Button size="sm" onClick={() => setSelectedCustomers(customers.map((c) => c.id))}>
                        Select All
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Megaphone className="h-5 w-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Send common messages quickly</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start bg-transparent" variant="outline" onClick={() => {
                    // Send Payment Reminders to all customers with pending invoices
                    recentInvoices.filter(i => !i.sent).forEach(invoice => sendInvoice(invoice));
                  }}>
                    <FileText className="h-4 w-4 mr-2" />
                    Send Payment Reminders
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline" onClick={() => {
                    // Broadcast Seasonal Offers to all customers
                    customers.forEach(customer => {
                      const templateObj = messageTemplates.find(t => t.type === "promotion");
                      if (templateObj) {
                        let message = templateObj.template.replace("{discount}", "10").replace("{product_category}", "fertilizers").replace("{season}", "monsoon");
                        const encodedMsg = encodeURIComponent(message);
                        const phone = customer.phone.replace(/\D/g, "");
                        window.open(`https://wa.me/${phone}?text=${encodedMsg}`, "_blank");
                      }
                    });
                  }}>
                    <Megaphone className="h-4 w-4 mr-2" />
                    Broadcast Seasonal Offers
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline" onClick={() => {
                    // New Stock Notifications to all customers
                    customers.forEach(customer => {
                      const templateObj = messageTemplates.find(t => t.type === "notification");
                      if (templateObj) {
                        let message = templateObj.template.replace("{product_name}", "Urea");
                        const encodedMsg = encodeURIComponent(message);
                        const phone = customer.phone.replace(/\D/g, "");
                        window.open(`https://wa.me/${phone}?text=${encodedMsg}`, "_blank");
                      }
                    });
                  }}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    New Stock Notifications
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline" onClick={() => {
                    // Crop Care Tips to all customers
                    customers.forEach(customer => {
                      const message = "🌱 Crop Care Tip: Water your crops early in the morning for best results!";
                      const encodedMsg = encodeURIComponent(message);
                      const phone = customer.phone.replace(/\D/g, "");
                      window.open(`https://wa.me/${phone}?text=${encodedMsg}`, "_blank");
                    });
                  }}>
                    <Users className="h-4 w-4 mr-2" />
                    Crop Care Tips
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Recent Invoices
                </CardTitle>
                <CardDescription>Send invoices directly to customers via WhatsApp</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{invoice.customer}</div>
                            <div className="text-sm text-gray-500">{invoice.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>₹{invoice.amount.toLocaleString()}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>
                          {invoice.sent ? (
                            <Badge variant="default">Sent</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Open WhatsApp Web for invoice delivery
                                const template = messageTemplates.find((t) => t.type === "invoice");
                                let message = (template && template.template)
                                  ? template.template
                                      .replace("{customer_name}", invoice.customer || "")
                                      .replace("{invoice_id}", invoice.id)
                                      .replace("{amount}", invoice.amount?.toLocaleString?.() ?? "")
                                  : "";
                                const encodedMsg = encodeURIComponent(message || "");
                                const phone = invoice.phone ? invoice.phone.replace(/\D/g, "") : "";
                                if (phone) {
                                  window.open(`https://wa.me/${phone}?text=${encodedMsg}`, "_blank");
                                } else {
                                  alert("No phone number available for this customer.");
                                }
                              }}
                              disabled={invoice.sent}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Invoice Bill</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-2 text-sm">
                                  <div><strong>ID:</strong> {invoice.id}</div>
                                  <div><strong>Customer:</strong> {invoice.customer}</div>
                                  <div><strong>Phone:</strong> {invoice.phone}</div>
                                  <div><strong>Amount:</strong> ₹{invoice.amount}</div>
                                  <div><strong>Date:</strong> {invoice.date}</div>
                                  {/* Product purchase details */}
                                  {invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0 && (
                                    <div className="mt-4">
                                      <strong>Products Purchased:</strong>
                                      <table className="min-w-full text-xs mt-2 border border-gray-200">
                                        <thead className="bg-gray-100">
                                          <tr>
                                            <th className="px-2 py-1 border-b">Product</th>
                                            <th className="px-2 py-1 border-b">Qty</th>
                                            <th className="px-2 py-1 border-b">Unit Price</th>
                                            <th className="px-2 py-1 border-b">Total</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {invoice.items.map((item: any, idx: number) => (
                                            <tr key={idx}>
                                              <td className="px-2 py-1 border-b">{item.product}</td>
                                              <td className="px-2 py-1 border-b">{item.quantity}</td>
                                              <td className="px-2 py-1 border-b">₹{item.price}</td>
                                              <td className="px-2 py-1 border-b">₹{item.total}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                                <DialogFooter>
                                  <Button variant="ghost">Close</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Message Templates</CardTitle>
                <CardDescription>Manage your WhatsApp message templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messageTemplates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{template.name}</h4>
                          <Badge variant="outline" className="mt-1">
                            {template.type}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.template}</p>
                      <div className="flex flex-wrap gap-2">
                        {template.variables.map((variable) => (
                          <Badge key={variable} variant="secondary" className="text-xs">
                            {`{${variable}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Message History</CardTitle>
                <CardDescription>Track all sent WhatsApp messages</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Read At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messageHistory.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{message.customer}</div>
                            <div className="text-sm text-gray-500">{message.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{message.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={message.message}>
                            {message.message}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(message.status)}
                            <span className="capitalize">{message.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>{message.sentAt}</TableCell>
                        <TableCell>{message.readAt || "Not read"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
