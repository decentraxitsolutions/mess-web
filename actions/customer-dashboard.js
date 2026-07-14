"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

export async function getCustomerDashboardData() {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CUSTOMER") throw new Error("Unauthorized");
    if (!user.businessId) throw new Error("Not linked to any mess");

    const business = await db.business.findUnique({
      where: { id: user.businessId }
    });

    if (!business) throw new Error("Mess not found");

    // Fetch active subscription
    const subscription = await db.subscription.findFirst({
      where: {
        userId: user.id,
        businessId: business.id,
        status: "ACTIVE"
      }
    });

    // Fetch recent meal logs (last 5)
    const logs = await db.mealLog.findMany({
      where: { userId: user.id, businessId: business.id },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    // Fetch invoices
    const bills = await db.bill.findMany({
      where: { userId: user.id, businessId: business.id },
      orderBy: { createdAt: "desc" }
    });

    // Fetch recent notifications
    const notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    // Fetch today's menu broadcast (if any)
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const dailyMenu = await db.menu.findFirst({
      where: {
        businessId: business.id,
        type: "DAILY",
        status: "ACTIVE"
      }
    });

    const latestLog = logs[0] || null;
    let activeDinePass = null;
    if (latestLog) {
      const passDurationMins = business.dinePassDurationMins || 30;
      const differenceMins = (Date.now() - new Date(latestLog.createdAt).getTime()) / (1000 * 60);
      if (differenceMins < passDurationMins) {
        activeDinePass = {
          dinerName: user.name || user.email,
          mealType: latestLog.mealType,
          timestamp: latestLog.createdAt,
          remainingMeals: subscription ? (subscription.mealCount - subscription.usedMeals) : 0,
          totalMeals: subscription ? subscription.mealCount : 0,
          businessName: business.name,
          expiresInMins: Math.max(1, Math.round(passDurationMins - differenceMins))
        };
      }
    }

    return {
      success: true,
      data: {
        userName: user.name || user.email,
        clerkUserId: user.clerkUserId,
        businessName: business.name,
        uniqueId: business.uniqueId,
        subscription,
        logs,
        bills,
        notifications,
        dailyMenu,
        activeDinePass,
        businessSettings: {
          qrScanEnabled: business.qrScanEnabled,
          breakfastEnabled: business.breakfastEnabled,
          breakfastStart: business.breakfastStart,
          breakfastEnd: business.breakfastEnd,
          lunchEnabled: business.lunchEnabled,
          lunchStart: business.lunchStart,
          lunchEnd: business.lunchEnd,
          dinnerEnabled: business.dinnerEnabled,
          dinnerStart: business.dinnerStart,
          dinnerEnd: business.dinnerEnd,
        }
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
