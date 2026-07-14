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

  // Calculate active Dine Pass on the server
  const latestLog = await db.mealLog.findFirst({
    where: { userId: user.id, businessId: business.id },
    orderBy: { createdAt: "desc" }
  });

  let activeDinePass = null;
  if (latestLog) {
    const passDurationMins = business.dinePassDurationMins || 30;
    const differenceMins = (Date.now() - new Date(latestLog.createdAt).getTime()) / (1000 * 60);
    if (differenceMins < passDurationMins) {
      const subscription = await db.subscription.findFirst({
        where: { userId: user.id, businessId: business.id, status: "ACTIVE" }
      });

      activeDinePass = {
        dinerName: user.name || user.email,
        mealType: latestLog.mealType,
        timestamp: latestLog.createdAt,
        remainingMeals: subscription ? (subscription.mealCount - subscription.usedMeals) : 0,
        totalMeals: subscription ? subscription.mealCount : 0,
        businessName: business.name
      };
    }
  }

  return (
    <ScannerClient 
      messUniqueId={business.uniqueId} 
      messName={business.name} 
      initialActivePass={activeDinePass}
    />
  );
}
