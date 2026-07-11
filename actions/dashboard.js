"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { startOfDay, endOfDay } from "date-fns";

export async function getAdminDashboardStats() {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const business = await db.business.findUnique({
      where: { ownerId: user.id }
    });

    if (!business) throw new Error("Business profile not found");

    const businessId = business.id;

    // 1. Customer counts
    const customers = await db.user.findMany({
      where: { businessId, role: "CUSTOMER" }
    });

    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === "ACTIVE").length;
    const pendingCustomers = customers.filter(c => c.status === "PENDING").length;

    // 2. Revenue (paidAmount in all Bills)
    const bills = await db.bill.findMany({
      where: { businessId }
    });
    const totalRevenue = bills.reduce((sum, b) => sum + b.paidAmount, 0);
    const pendingRevenue = bills.reduce((sum, b) => sum + b.remainingAmount, 0);

    // 3. Today's meals served
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const mealsServedToday = await db.mealLog.count({
      where: {
        businessId,
        createdAt: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    // 4. Recent scans (last 5)
    const recentScans = await db.mealLog.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: true
      }
    });

    // 5. Pending approvals (limit 3 for quick view)
    const pendingApprovals = await db.user.findMany({
      where: { businessId, status: "PENDING", role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
      take: 3
    });

    // 6. Subscription plans statistics (count of active subscriptions per plan)
    const activeSubscriptions = await db.subscription.findMany({
      where: { businessId, status: "ACTIVE" }
    });

    return {
      success: true,
      stats: {
        businessName: business.name,
        uniqueId: business.uniqueId,
        totalCustomers,
        activeCustomers,
        pendingCustomers,
        totalRevenue,
        pendingRevenue,
        mealsServedToday,
        recentScans: recentScans.map(s => ({
          id: s.id,
          userName: s.user.name || s.user.email,
          mealType: s.mealType,
          time: s.createdAt
        })),
        pendingApprovals: pendingApprovals.map(p => ({
          id: p.id,
          name: p.name,
          email: p.email,
          plan: p.requestedPlan,
          time: p.createdAt
        })),
        activeSubscriptionCount: activeSubscriptions.length
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
