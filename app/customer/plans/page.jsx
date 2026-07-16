import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getMessSubscriptionPlansForCustomer, getCustomerSubscriptionRequests } from "@/actions/subscriptions";
import PlansClient from "./PlansClient";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerPlansPage() {
  const user = await checkUser();
  if (!user || user.role !== "CUSTOMER") {
    redirect("/sign-in");
  }

  if (!user.businessId) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center max-w-md mx-auto">
        <ShieldAlert className="h-12 w-12 text-amber-500 animate-bounce" />
        <h3 className="text-xl font-bold">No Mess Associated</h3>
        <p className="text-muted-foreground text-sm">
          You are not associated with any mess yet. Please link a mess from your dashboard first to view subscription plans.
        </p>
      </div>
    );
  }

  const plansRes = await getMessSubscriptionPlansForCustomer();
  const requestsRes = await getCustomerSubscriptionRequests();

  if (!plansRes.success || !requestsRes.success) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h3 className="text-xl font-bold">Error Loading Plans</h3>
        <p className="text-muted-foreground">{plansRes.error || requestsRes.error}</p>
      </div>
    );
  }

  // Fetch current active subscription if any
  const activeSubscription = await db.subscription.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
    orderBy: { createdAt: "desc" }
  });

  return (
    <PlansClient 
      plans={plansRes.plans} 
      requests={requestsRes.requests} 
      activeSub={activeSubscription} 
    />
  );
}
