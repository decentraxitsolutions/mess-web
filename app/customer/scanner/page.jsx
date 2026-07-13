import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import ScannerClient from "./ScannerClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CustomerScannerPage() {
  const user = await checkUser();
  if (!user) {
    redirect("/sign-in");
  }
  
  if (!user.businessId) {
    redirect("/customer/dashboard");
  }

  const business = await db.business.findUnique({
    where: { id: user.businessId }
  });

  if (!business) {
    redirect("/customer/dashboard");
  }

  return (
    <ScannerClient 
      messUniqueId={business.uniqueId} 
      messName={business.name} 
    />
  );
}
