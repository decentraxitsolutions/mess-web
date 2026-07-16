import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import Header from "@/components/HeaderComponents/Header";
import Link from "next/link";
import { LayoutDashboard, Utensils, History, Receipt, Home, Scan, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerLayout({ children }) {
  const user = await checkUser();

  if (!user) {
    redirect("/");
  }

  if (user.role !== "CUSTOMER") {
    redirect(user.role === "SUPER_ADMIN" ? "/super-admin" : "/dashboard");
  }

  if (user.status === "PENDING" && user.businessId) {
    redirect("/pending-approval");
  }

  const navItems = [
    { label: "My Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
    { label: "Scan & Dine", href: "/customer/scanner", icon: Scan },
    { label: "Dine Plans", href: "/customer/plans", icon: Package },
    { label: "Daily Menu", href: "/customer/menu", icon: Utensils },
    { label: "Dine History", href: "/customer/meals", icon: History },
    { label: "My Invoices", href: "/customer/billing", icon: Receipt },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Header user={user} />
      
      {/* Sub-nav banner for Customers */}
      <div className="border-b bg-card py-2">
        <div className="container mx-auto flex gap-1 overflow-x-auto px-4 sm:px-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 shrink-0"
              >
                <Icon className="h-4 w-4 text-indigo-500" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 sm:px-8 max-w-5xl">
        {children}
      </main>
    </div>
  );
}
