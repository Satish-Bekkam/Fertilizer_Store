"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Download,
  MessageSquare,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  User,
  Package,
  Receipt,
  Send,
  Printer,
} from "lucide-react"

interface SaleDetailsDialogProps {
  sale: any
  isOpen: boolean
  onClose: () => void
  printInvoice?: () => void
}

export default function SaleDetailsDialog({ sale, isOpen, onClose, printInvoice }: SaleDetailsDialogProps) {
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false)

  if (!sale) return null

  const handleSendWhatsApp = async () => {
    setIsSendingWhatsApp(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    alert(`Invoice ${sale.id} sent to ${sale.customer} via WhatsApp`)
    setIsSendingWhatsApp(false)
  }

  const handleDownloadPDF = () => {
    alert(`Downloading PDF for invoice ${sale.id}`)
  }

  const handlePrint = () => {
    if (printInvoice) {
      printInvoice();
    } else {
      window.print();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>Invoice Details - {sale.id}</span>
          </DialogTitle>
          <DialogDescription>Complete invoice information and customer details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownloadPDF} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleSendWhatsApp} variant="outline" size="sm" disabled={isSendingWhatsApp}>
              <MessageSquare className="h-4 w-4 mr-2" />
              {isSendingWhatsApp ? "Sending..." : "Send WhatsApp"}
            </Button>
            <Button variant="outline" size="sm">
              <Send className="h-4 w-4 mr-2" />
              Email Invoice
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Invoice Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Invoice Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Invoice Information</span>
                    <Badge variant={sale.status === "Paid" ? "default" : "destructive"}>{sale.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Invoice Number</p>
                      <p className="text-lg font-semibold">{sale.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date</p>
                      <p className="text-lg font-semibold">{sale.date}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Payment Method</p>
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4" />
                        <span>{sale.paymentMethod}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Amount</p>
                      <p className="text-lg font-semibold text-green-600">₹{sale.total.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Items Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Items Purchased
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sale.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.product}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₹{item.price.toLocaleString()}</TableCell>
                          <TableCell>₹{item.total.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <Separator className="my-4" />

                  {/* Invoice Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{sale.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (18%):</span>
                      <span>₹{sale.tax.toLocaleString()}</span>
                    </div>
                    {sale.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-₹{sale.discount.toLocaleString()}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>₹{sale.total.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Customer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold text-lg">{sale.customer}</p>
                    <div className="flex items-center space-x-2 text-gray-600 mt-1">
                      <Phone className="h-4 w-4" />
                      <span>{sale.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4 mt-1" />
                    <span className="text-sm">Village Rampur, District Meerut, UP</span>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Customer since Jan 2023</span>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Purchase Summary</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total Orders:</span>
                        <span className="font-medium">15</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Spent:</span>
                        <span className="font-medium">₹45,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Purchase:</span>
                        <span className="font-medium">{sale.date}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Payment Reminder
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Customer
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <Receipt className="h-4 w-4 mr-2" />
                    Create Return
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <User className="h-4 w-4 mr-2" />
                    View Customer Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Payment Status */}
              {sale.status === "Pending" && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-orange-800">Payment Pending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-orange-700 mb-3">
                      Payment of ₹{sale.total.toLocaleString()} is pending since {sale.date}
                    </p>
                    <Button size="sm" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Reminder
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
