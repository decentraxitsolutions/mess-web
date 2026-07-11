"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";

export async function getBusinessMealLogs() {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const business = await db.business.findUnique({
      where: { ownerId: user.id }
    });
    if (!business) throw new Error("Business not found");

    const logs = await db.mealLog.findMany({
      where: { businessId: business.id },
      include: {
        user: true
      },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, logs };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function recordMealAttendance(customerIdOrClerkId, selectedMealType) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const business = await db.business.findUnique({
      where: { ownerId: user.id }
    });
    if (!business) throw new Error("Business not found");

    // Find the diner by either internal ID or clerkUserId (from QR code scan)
    const diner = await db.user.findFirst({
      where: {
        OR: [
          { id: customerIdOrClerkId },
          { clerkUserId: customerIdOrClerkId }
        ],
        businessId: business.id,
        role: "CUSTOMER"
      }
    });

    if (!diner) {
      throw new Error("Diner not found or not registered with this mess.");
    }

    if (diner.status === "SUSPENDED") {
      throw new Error("Diner's account is suspended. Please contact admin.");
    }

    // Determine current active subscription
    const subscription = await db.subscription.findFirst({
      where: {
        userId: diner.id,
        businessId: business.id,
        status: "ACTIVE"
      }
    });

    if (!subscription) {
      throw new Error("No active subscription found. Please purchase a meal package.");
    }

    // Check validity expiration
    if (subscription.validityDays) {
      const expiryDate = new Date(subscription.createdAt.getTime() + subscription.validityDays * 24 * 60 * 60 * 1000);
      if (Date.now() > expiryDate.getTime()) {
        // Expired subscription
        await db.subscription.update({
          where: { id: subscription.id },
          data: { status: "EXPIRED" }
        });
        throw new Error("Diner's subscription has expired.");
      }
    }

    // Check remaining meals
    const remaining = subscription.mealCount - subscription.usedMeals;
    if (remaining <= 0) {
      // Expire subscription
      await db.subscription.update({
        where: { id: subscription.id },
        data: { status: "EXPIRED" }
      });
      throw new Error("Zero meals remaining. Please renew package.");
    }

    // Determine meal type (auto-calculate based on current hour if not selected)
    let mealType = selectedMealType;
    if (!mealType || mealType === "AUTO") {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 11) {
        mealType = "BREAKFAST";
      } else if (hour >= 11 && hour < 16) {
        mealType = "LUNCH";
      } else {
        mealType = "DINNER";
      }
    }

    // Duplicate scan prevention (same meal type today)
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const duplicateLog = await db.mealLog.findFirst({
      where: {
        userId: diner.id,
        businessId: business.id,
        mealType,
        createdAt: {
          gte: today
        }
      }
    });

    if (duplicateLog) {
      throw new Error(`Duplicate Scan: Already checked-in for ${mealType} today.`);
    }

    // All validation passed: DEDUCT meal!
    const newUsedMeals = subscription.usedMeals + 1;
    let subStatus = "ACTIVE";
    if (newUsedMeals >= subscription.mealCount) {
      subStatus = "EXPIRED";
    }

    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        usedMeals: newUsedMeals,
        status: subStatus
      }
    });

    // Create log
    const log = await db.mealLog.create({
      data: {
        userId: diner.id,
        businessId: business.id,
        mealType,
        device: "Dashboard Scanner Console"
      }
    });

    // Create Notification
    const mealsLeft = subscription.mealCount - newUsedMeals;
    let notifyMsg = `1 meal consumed (${mealType}). Remaining: ${mealsLeft}/${subscription.mealCount}.`;
    
    await db.notification.create({
      data: {
        userId: diner.id,
        type: "REMINDER",
        message: notifyMsg,
        status: "UNREAD"
      }
    });

    // If remaining is low, notify again
    if (mealsLeft <= subscription.reminderCount && mealsLeft > 0) {
      await db.notification.create({
        data: {
          userId: diner.id,
          type: "REMINDER",
          message: `Alert: Low meal balance! Only ${mealsLeft} meals remaining in your plan.`,
          status: "UNREAD"
        }
      });
    }

    revalidatePath("/dashboard/meals");
    revalidatePath("/dashboard");
    return { 
      success: true, 
      dinerName: diner.name || diner.email,
      mealType,
      remainingMeals: mealsLeft,
      totalMeals: subscription.mealCount
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getCustomerMealLogs() {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CUSTOMER") throw new Error("Unauthorized");

    const logs = await db.mealLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, logs };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
