import { getBusinessCustomers } from "@/actions/customers";
import CustomerClient from "./CustomerClient";
import { ShieldAlert } from "lucide-react";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const user = await checkUser();
  if (!user || user.role !== "CLIENT_ADMIN") {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h3 className="text-xl font-bold">Unauthorized</h3>
      </div>
    );
  }

  const business = await db.business.findUnique({
    where: { ownerId: user.id }
  });

  if (!business) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h3 className="text-xl font-bold">Business Not Found</h3>
      </div>
    );
  }

  const res = await getBusinessCustomers();
  const plans = await db.subscriptionPlan.findMany({
    where: { businessId: business.id },
    orderBy: { createdAt: "desc" }
  });

  if (!res.success) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h3 className="text-xl font-bold">Error Loading Customers</h3>
        <p className="text-muted-foreground">{res.error}</p>
      </div>
    );
  }

  return <CustomerClient initialCustomers={res.customers} plans={plans} />;
}
