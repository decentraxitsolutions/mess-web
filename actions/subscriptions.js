"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";

export async function getSubscriptionPlans() {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const business = await db.business.findUnique({
      where: { ownerId: user.id }
    });
    if (!business) throw new Error("Business not found");

    const plans = await db.subscriptionPlan.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, plans };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function createSubscriptionPlan(data) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const business = await db.business.findUnique({
      where: { ownerId: user.id }
    });
    if (!business) throw new Error("Business not found");

    const mealCount = parseInt(data.mealCount);
    const mealPrice = parseFloat(data.mealPrice);
    const totalAmount = mealCount * mealPrice;
    const validityDays = parseInt(data.validityDays);

    const plan = await db.subscriptionPlan.create({
      data: {
        businessId: business.id,
        name: data.name,
        mealCount,
        mealPrice,
        totalAmount,
        validityDays,
        reminderCount: parseInt(data.reminderCount || 2)
      }
    });

    revalidatePath("/dashboard/subscriptions");
    return { success: true, plan };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteSubscriptionPlan(planId) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    await db.subscriptionPlan.delete({
      where: { id: planId }
    });

    revalidatePath("/dashboard/subscriptions");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function assignSubscriptionToCustomer(customerId, planDetails) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const business = await db.business.findUnique({
      where: { ownerId: user.id }
    });
    if (!business) throw new Error("Business not found");

    const mealCount = parseInt(planDetails.mealCount);
    const mealPrice = parseFloat(planDetails.mealPrice);
    const totalAmount = mealCount * mealPrice;
    const validityDays = parseInt(planDetails.validityDays);

    // Deactivate previous active subscriptions for this customer
    await db.subscription.updateMany({
      where: { userId: customerId, businessId: business.id, status: "ACTIVE" },
      data: { status: "EXPIRED" }
    });

    // Create new subscription
    await db.subscription.create({
      data: {
        userId: customerId,
        businessId: business.id,
        mealCount,
        usedMeals: 0,
        mealPrice,
        totalAmount,
        validityDays,
        reminderCount: parseInt(planDetails.reminderCount || 2),
        status: "ACTIVE"
      }
    });

    // Generate Bill
    const billCount = await db.bill.count();
    const invoiceNumber = `INV-${1000 + billCount + 1}`;

    await db.bill.create({
      data: {
        invoiceNumber,
        userId: customerId,
        businessId: business.id,
        totalAmount,
        paidAmount: planDetails.paidImmediately ? totalAmount : 0,
        remainingAmount: planDetails.paidImmediately ? 0 : totalAmount,
        status: planDetails.paidImmediately ? "PAID" : "UNPAID",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    // Create Notification
    await db.notification.create({
      data: {
        userId: customerId,
        type: "SYSTEM",
        message: `Your subscription has been updated. ${mealCount} meals added. Status: ACTIVE.`,
        status: "UNREAD"
      }
    });

    revalidatePath("/dashboard/subscriptions");
    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
