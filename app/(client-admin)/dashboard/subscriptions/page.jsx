import { getSubscriptionPlans } from "@/actions/subscriptions";
import { getBusinessCustomers } from "@/actions/customers";
import SubscriptionClient from "./SubscriptionClient";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const plansRes = await getSubscriptionPlans();
  const customersRes = await getBusinessCustomers();

  if (!plansRes.success || !customersRes.success) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h3 className="text-xl font-bold">Error Loading Subscriptions</h3>
        <p className="text-muted-foreground">
          {plansRes.error || customersRes.error}
        </p>
      </div>
    );
  }

  // Filter for ACTIVE customers only
  const activeCustomers = customersRes.customers.filter(c => c.status === "ACTIVE");

  return (
    <SubscriptionClient 
      initialPlans={plansRes.plans} 
      activeCustomers={activeCustomers} 
    />
  );
}
