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
import { Search, Plus, Edit, Trash2, AlertTriangle, Calendar, Barcode, TrendingUp, TrendingDown } from "lucide-react"



const categories = [
  "Chemical Fertilizer",
  "Organic Fertilizer",
  "Pesticide",
  "Herbicide",
  "Fungicide",
  "Seeds",
  "Tools",
]

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [editProduct, setEditProduct] = useState<any | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  // Fetch products from Next.js API
  React.useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      })
      .catch(() => setProducts([]));
  }, [])

  // Fix: Add state for breakdown dialog
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    brand: "",
    mrp: "",
    sellingPrice: "",
    stock: "",
    minStock: "",
    unit: "kg",
    expiryDate: "",
    barcode: "",
    description: "",
  })

  const filteredProducts = products.filter((product) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      (product.name && product.name.toLowerCase().includes(term)) ||
      (product.brand && product.brand.toLowerCase().includes(term)) ||
      (product.barcode && product.barcode.toLowerCase().includes(term)) ||
      (product.category && product.category.toLowerCase().includes(term));
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  })

  const lowStockProducts = products.filter((product) => product.stock <= product.minStock)
  const expiringProducts = products.filter((product) => {
    const expiryDate = new Date(product.expiryDate)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expiryDate <= thirtyDaysFromNow
  })

  const handleAddProduct = async () => {
    if (newProduct.name && newProduct.mrp && newProduct.sellingPrice && newProduct.stock) {
      try {
        const response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...newProduct,
            mrp: Number.parseFloat(newProduct.mrp),
            sellingPrice: Number.parseFloat(newProduct.sellingPrice),
            stock: Number.parseInt(newProduct.stock),
            minStock: Number.parseInt(newProduct.minStock) || 10,
            status: "active"
          }),
        });
        if (response.ok) {
          // Refetch products from backend
          fetch("/api/products")
            .then((res) => res.json())
            .then(setProducts);
          setNewProduct({
            name: "",
            category: "",
            brand: "",
            mrp: "",
            sellingPrice: "",
            stock: "",
            minStock: "",
            unit: "kg",
            expiryDate: "",
            barcode: "",
            description: "",
          });
          setIsAddDialogOpen(false);
        } else {
          alert("Failed to add product");
        }
      } catch (error) {
        alert("Error adding product");
      }
    }
  }

  const handleDeleteProduct = async (id: number) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        // Refetch products from backend
        fetch("/api/products")
          .then((res) => res.json())
          .then(setProducts);
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      alert("Error deleting product");
    }
  }

  const getStockStatus = (product) => {
    if (product.stock <= product.minStock) return "low"
    if (product.stock <= product.minStock * 1.5) return "medium"
    return "good"
  }

  const getStockBadge = (product) => {
    const status = getStockStatus(product)
    if (status === "low") return <Badge variant="destructive">Low Stock</Badge>
    if (status === "medium") return <Badge variant="outline">Medium</Badge>
    return <Badge variant="secondary">Good</Badge>
  }

  // Edit product logic
  const openEditDialog = (product: any) => {
    setEditProduct(product);
    setIsEditOpen(true);
  };

  const handleEditChange = (field: string, value: any) => {
    if (!editProduct) return;
    setEditProduct({ ...editProduct, [field]: value });
  };

  const saveEditedProduct = async () => {
    if (!editProduct) return;
    try {
      const response = await fetch(`/api/products/${editProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editProduct),
      });
      if (response.ok) {
        fetch("/api/products")
          .then((res) => res.json())
          .then(setProducts);
        setIsEditOpen(false);
      } else {
        alert("Failed to update product");
      }
    } catch (err) {
      alert("Error updating product");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600">Manage your inventory and product catalog</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Barcode className="h-4 w-4 mr-2" />
                Scan Barcode
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>Enter product details to add to your inventory.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        Category
                      </Label>
                      <Select onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="brand" className="text-right">
                        Brand
                      </Label>
                      <Input
                        id="brand"
                        value={newProduct.brand}
                        onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="mrp" className="text-right">
                        MRP (₹)
                      </Label>
                      <Input
                        id="mrp"
                        type="number"
                        value={newProduct.mrp}
                        onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="sellingPrice" className="text-right">
                        Selling Price (₹)
                      </Label>
                      <Input
                        id="sellingPrice"
                        type="number"
                        value={newProduct.sellingPrice}
                        onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stock" className="text-right">
                        Stock
                      </Label>
                      <Input
                        id="stock"
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="minStock" className="text-right">
                        Min Stock
                      </Label>
                      <Input
                        id="minStock"
                        type="number"
                        value={newProduct.minStock}
                        onChange={(e) => setNewProduct({ ...newProduct, minStock: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="expiryDate" className="text-right">
                        Expiry Date
                      </Label>
                      <Input
                        id="expiryDate"
                        type="date"
                        value={newProduct.expiryDate}
                        onChange={(e) => setNewProduct({ ...newProduct, expiryDate: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="barcode" className="text-right">
                        Barcode
                      </Label>
                      <Input
                        id="barcode"
                        value={newProduct.barcode}
                        onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddProduct}>Add Product</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center text-red-800">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-700 mb-3">{lowStockProducts.length} products are running low on stock</p>
              <div className="space-y-2">
                {lowStockProducts.slice(0, 3).map((product) => (
                  <div key={product.id} className="flex justify-between items-center text-sm">
                    <span>{product.name}</span>
                    <Badge variant="destructive">{product.stock} left</Badge>
                  </div>
                ))}
              </div>
              {lowStockProducts.length > 3 && (
                <p className="text-xs text-red-600 mt-2">+{lowStockProducts.length - 3} more items</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-800">
                <Calendar className="h-5 w-5 mr-2" />
                Expiring Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-700 mb-3">{expiringProducts.length} products expiring within 30 days</p>
              <div className="space-y-2">
                {expiringProducts.slice(0, 3).map((product) => (
                  <div key={product.id} className="flex justify-between items-center text-sm">
                    <span>{product.name}</span>
                    <Badge variant="outline">{product.expiryDate}</Badge>
                  </div>
                ))}
              </div>
              {expiringProducts.length > 3 && (
                <p className="text-xs text-orange-600 mt-2">+{expiringProducts.length - 3} more items</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products by name, brand, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline">Export CSV</Button>
            </div>
          </CardContent>
        </Card>

        {/* Product Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{lowStockProducts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{products.reduce((sum, p) => {
                  let price = 0;
                  if (p.sellingPrice !== undefined && p.sellingPrice !== null && p.sellingPrice !== "" && !isNaN(Number(p.sellingPrice))) {
                    price = Number(p.sellingPrice);
                  } else if (p.mrp !== undefined && p.mrp !== null && p.mrp !== "" && !isNaN(Number(p.mrp))) {
                    price = Number(p.mrp);
                  } else if (p.price !== undefined && p.price !== null && p.price !== "" && !isNaN(Number(p.price))) {
                    price = Number(p.price);
                  }
                  const stock = typeof p.stock === 'number' ? p.stock : (!isNaN(Number(p.stock)) ? Number(p.stock) : 0);
                  return sum + (stock * price);
                }, 0).toLocaleString()}
              </div>
              <Button className="mt-2" variant="outline" onClick={() => setIsBreakdownOpen(true)}>
                Show Breakdown
              </Button>
              <Dialog open={isBreakdownOpen} onOpenChange={setIsBreakdownOpen}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Product Value Breakdown</DialogTitle>
                  </DialogHeader>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left border border-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 border-b">Product</th>
                          <th className="px-3 py-2 border-b">Stock</th>
                          <th className="px-3 py-2 border-b">Unit Price</th>
                          <th className="px-3 py-2 border-b">Total Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => {
                          let price = 0;
                          if (p.sellingPrice !== undefined && p.sellingPrice !== null && p.sellingPrice !== "" && !isNaN(Number(p.sellingPrice))) {
                            price = Number(p.sellingPrice);
                          } else if (p.mrp !== undefined && p.mrp !== null && p.mrp !== "" && !isNaN(Number(p.mrp))) {
                            price = Number(p.mrp);
                          } else if (p.price !== undefined && p.price !== null && p.price !== "" && !isNaN(Number(p.price))) {
                            price = Number(p.price);
                          }
                          const stock = typeof p.stock === 'number' ? p.stock : (!isNaN(Number(p.stock)) ? Number(p.stock) : 0);
                          return (
                            <tr key={p.id}>
                              <td className="px-3 py-2 border-b">{p.name}</td>
                              <td className="px-3 py-2 border-b">{stock}</td>
                              <td className="px-3 py-2 border-b">₹{price}</td>
                              <td className="px-3 py-2 border-b">₹{(stock * price).toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsBreakdownOpen(false)}>Close</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(products.map((p) => p.category)).size}</div>
            </CardContent>
          </Card>
        </div>

        {/* Product Table */}
        <Card>
          <CardHeader>
            <CardTitle>Product Inventory</CardTitle>
            <CardDescription>
              Showing {filteredProducts.length} of {products.length} products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.brand}</div>
                        <div className="text-xs text-gray-400">{product.barcode}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell>
                      ₹{product.price}/{product.unit}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>
                          {product.stock} {product.unit}
                        </span>
                        {product.stock <= product.minStock && <TrendingDown className="h-4 w-4 text-red-500" />}
                        {product.stock > product.minStock * 1.5 && <TrendingUp className="h-4 w-4 text-green-500" />}
                      </div>
                    </TableCell>
                    <TableCell>{getStockBadge(product)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {product.expiryDate}
                        {expiringProducts.some((p) => p.id === product.id) && (
                          <div className="text-xs text-orange-600">Expiring soon</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
      {/* Edit Product Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Edit product details and save changes.</DialogDescription>
          </DialogHeader>
          {editProduct && (
            <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Name</Label>
                <Input id="edit-name" value={editProduct.name} onChange={e => handleEditChange("name", e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">Category</Label>
                <Select value={editProduct.category} onValueChange={val => handleEditChange("category", val)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-brand" className="text-right">Brand</Label>
                <Input id="edit-brand" value={editProduct.brand} onChange={e => handleEditChange("brand", e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-mrp" className="text-right">MRP (₹)</Label>
                <Input id="edit-mrp" type="number" value={editProduct.mrp} onChange={e => handleEditChange("mrp", e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-sellingPrice" className="text-right">Selling Price (₹)</Label>
                <Input id="edit-sellingPrice" type="number" value={editProduct.sellingPrice} onChange={e => handleEditChange("sellingPrice", e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stock" className="text-right">Stock</Label>
                <Input id="edit-stock" type="number" value={editProduct.stock} onChange={e => handleEditChange("stock", e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-minStock" className="text-right">Min Stock</Label>
                <Input id="edit-minStock" type="number" value={editProduct.minStock} onChange={e => handleEditChange("minStock", e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-expiryDate" className="text-right">Expiry Date</Label>
                <Input id="edit-expiryDate" type="date" value={editProduct.expiryDate} onChange={e => handleEditChange("expiryDate", e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-barcode" className="text-right">Barcode</Label>
                <Input id="edit-barcode" value={editProduct.barcode} onChange={e => handleEditChange("barcode", e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">Description</Label>
                <Textarea id="edit-description" value={editProduct.description} onChange={e => handleEditChange("description", e.target.value)} className="col-span-3" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={saveEditedProduct}>Save</Button>
            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
