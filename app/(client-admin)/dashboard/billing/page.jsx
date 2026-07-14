import { getBusinessBills } from "@/actions/billing";
import { getBusinessCustomers } from "@/actions/customers";
import BillingClient from "./BillingClient";
import { ShieldAlert } from "lucide-react";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const user = await checkUser();
  const business = await db.business.findUnique({
    where: { ownerId: user?.id }
  });

  const billsRes = await getBusinessBills();
  const customersRes = await getBusinessCustomers();

  if (!billsRes.success || !customersRes.success) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h3 className="text-xl font-bold">Error Loading Billing Console</h3>
        <p className="text-muted-foreground">
          {billsRes.error || customersRes.error}
        </p>
      </div>
    );
  }

  // Filter for ACTIVE customers only
  const activeCustomers = customersRes.customers.filter(c => c.status === "ACTIVE");

  return (
    <BillingClient 
      initialBills={billsRes.bills} 
      activeCustomers={activeCustomers} 
      businessSettings={business}
    />
  );
}
