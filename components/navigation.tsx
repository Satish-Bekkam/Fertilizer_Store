"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  MessageSquare,
  Settings,
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  Bell,
  User,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Products", href: "/products", icon: Package, badge: "12" },
  { name: "Sales", href: "/sales", icon: ShoppingCart },
  { name: "Debt Records", href: "/debt-records", icon: BarChart3 },
  { name: "Recommendations", href: "/recommendations", icon: Lightbulb },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "WhatsApp", href: "/whatsapp", icon: MessageSquare, badge: "3" },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function Navigation() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-white shadow-lg transition-all duration-300 ease-in-out",
          isExpanded ? "w-64" : "w-16",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-green-600 flex-shrink-0" />
              {isExpanded && (
                <div className="transition-opacity duration-200">
                  <h1 className="text-xl font-bold text-gray-900">AgriStore</h1>
                  <p className="text-xs text-gray-500">Pro</p>
                </div>
              )}
            </div>
          </div>

          {/* Toggle Button */}
          <div className="flex justify-center py-2 border-b">
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8 p-0">
              {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>

          {/* User Info */}
          {isExpanded && (
            <div className="p-4 border-b bg-gray-50 transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Store Owner</p>
                  <p className="text-xs text-gray-500">Admin Access</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center text-sm font-medium rounded-md transition-colors group relative",
                    isExpanded ? "px-3 py-2" : "px-2 py-2 justify-center",
                    isActive ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  )}
                  title={!isExpanded ? item.name : undefined}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", isExpanded && "mr-3")} />
                  {isExpanded && <span className="transition-opacity duration-200">{item.name}</span>}
                  {item.badge && isExpanded && (
                    <Badge variant={item.name === "Products" ? "destructive" : "secondary"} className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  {item.badge && !isExpanded && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                  )}

                  {/* Tooltip for collapsed state */}
                  {!isExpanded && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                      {item.badge && <span className="ml-2 px-1 py-0.5 bg-red-500 rounded text-xs">{item.badge}</span>}
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Quick Actions */}
          {isExpanded && (
            <div className="p-4 border-t transition-all duration-200">
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                  <Badge variant="destructive" className="ml-auto">
                    5
                  </Badge>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Quick Message
                </Button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className={cn("border-t bg-gray-50 transition-all duration-200", isExpanded ? "p-4" : "p-2")}>
            {isExpanded ? (
              <p className="text-xs text-gray-500 text-center">AgriStore Pro v1.0</p>
            ) : (
              <div className="flex justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content margin adjustment */}
      <style jsx global>{`
        .main-content {
          margin-left: ${isExpanded ? "16rem" : "4rem"};
          transition: margin-left 300ms ease-in-out;
        }
      `}</style>
    </>
  )
}
