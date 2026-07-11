import { getCustomerBills } from "@/actions/billing";
import BillingClient from "./BillingClient";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerBillingPage() {
  const res = await getCustomerBills();

  if (!res.success) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h3 className="text-xl font-bold">Error Loading Bills</h3>
        <p className="text-muted-foreground">{res.error}</p>
      </div>
    );
  }

  return <BillingClient initialBills={res.bills} />;
}
