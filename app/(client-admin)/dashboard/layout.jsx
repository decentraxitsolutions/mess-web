"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Receipt, 
  Utensils, 
  History, 
  QrCode,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";

const menuItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Scanner Console", href: "/dashboard/scanner", icon: QrCode, highlight: true },
  { label: "Customers", href: "/dashboard/customers", icon: Users },
  { label: "Subscriptions", href: "/dashboard/subscriptions", icon: CreditCard },
  { label: "Billing & Invoices", href: "/dashboard/billing", icon: Receipt },
  { label: "Menu Planner", href: "/dashboard/menu", icon: Utensils },
  { label: "Meal Logs", href: "/dashboard/meals", icon: History },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col md:flex-row">
      {/* Sidebar for desktop */}
      <aside className="hidden w-64 border-r bg-card md:block">
        <div className="flex h-full flex-col justify-between py-6">
          <div className="space-y-4 px-4">
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Mess Management
              </h2>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                          : item.highlight
                          ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      <div className="flex items-center border-b bg-card px-4 py-3 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "mr-2")}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-full flex-col py-6 px-4">
              <div className="flex items-center justify-between mb-8 px-4">
                <span className="text-lg font-bold text-indigo-600">Console Menu</span>
              </div>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-indigo-600 text-white shadow-md"
                          : item.highlight
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
        <span className="text-sm font-semibold text-foreground">
          {menuItems.find(item => item.href === pathname)?.label || "Dashboard"}
        </span>
      </div>

      {/* Main dashboard content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </div>
    </div>
  );
}
