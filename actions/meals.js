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

export async function recordCustomerSelfCheckIn(qrPayload) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CUSTOMER") throw new Error("Unauthorized");
    if (user.status !== "ACTIVE") throw new Error("Your account is not active. Please contact admin.");
    if (!user.businessId) throw new Error("You are not registered with any mess.");

    // Parse payload: uniqueId:dateString:mealType
    const parts = qrPayload.split(":");
    if (parts.length < 3) {
      throw new Error("Invalid QR code format.");
    }
    const [uniqueId, qrDate, qrMealType] = parts;

    // Fetch the business the customer belongs to
    const business = await db.business.findUnique({
      where: { id: user.businessId }
    });
    if (!business) throw new Error("Registered mess not found.");
    if (business.uniqueId !== uniqueId) {
      throw new Error("This QR belongs to a different mess. You cannot check in here.");
    }

    // Verify current date matches server date (prevent old screenshots)
    const todayStr = new Date().toISOString().split("T")[0];
    if (qrDate !== todayStr) {
      throw new Error("This QR code has expired. Please scan the live QR code on the admin screen.");
    }

    // Detect/Verify active meal type
    const now = new Date();
    const hours = now.getHours();
    let currentMealType = "LUNCH";
    if (hours >= 6 && hours < 11) currentMealType = "BREAKFAST";
    else if (hours >= 11 && hours < 16) currentMealType = "LUNCH";
    else if (hours >= 16 && hours < 23) currentMealType = "DINNER";

    if (qrMealType !== currentMealType) {
      throw new Error(`This QR is for ${qrMealType}, but it is currently ${currentMealType} hours.`);
    }

    // Check customer subscription
    const subscription = await db.subscription.findFirst({
      where: { userId: user.id, businessId: business.id, status: "ACTIVE" }
    });
    if (!subscription) {
      throw new Error("No active subscription plan found. Please contact admin.");
    }

    const remainingMeals = subscription.mealCount - subscription.usedMeals;
    if (remainingMeals <= 0) {
      throw new Error("You have 0 meals remaining in your plan. Please renew.");
    }

    // Check duplicate check-in today for this meal type
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    const duplicateCheck = await db.mealLog.findFirst({
      where: {
        userId: user.id,
        businessId: business.id,
        mealType: currentMealType,
        createdAt: { gte: startOfDay, lte: endOfDay }
      }
    });

    if (duplicateCheck) {
      throw new Error(`You have already checked in for ${currentMealType} today.`);
    }

    // Update subscription count
    const updatedSub = await db.subscription.update({
      where: { id: subscription.id },
      data: { usedMeals: subscription.usedMeals + 1 }
    });

    // Create meal log
    const log = await db.mealLog.create({
      data: {
        userId: user.id,
        businessId: business.id,
        mealType: currentMealType
      }
    });

    // Send warning notification if meals are low
    const newMealsLeft = updatedSub.mealCount - updatedSub.usedMeals;
    if (newMealsLeft <= updatedSub.reminderCount) {
      await db.notification.create({
        data: {
          userId: user.id,
          type: "REMINDER",
          message: `Alert: Low meal balance! Only ${newMealsLeft} meals remaining in your plan.`,
          status: "UNREAD"
        }
      });
    }

    // Revalidate paths for real-time updates
    revalidatePath("/customer/dashboard");
    revalidatePath("/customer/meals");
    revalidatePath("/dashboard/meals");
    revalidatePath("/dashboard");

    return {
      success: true,
      mealType: currentMealType,
      remainingMeals: newMealsLeft,
      totalMeals: updatedSub.mealCount
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getScannerQRData() {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const business = await db.business.findUnique({
      where: { ownerId: user.id }
    });
    if (!business) throw new Error("Mess not found");

    // Fetch last 5 check-in logs for display on scanner screen
    const logs = await db.mealLog.findMany({
      where: { businessId: business.id },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    return { 
      success: true, 
      uniqueId: business.uniqueId, 
      name: business.name,
      logs 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
