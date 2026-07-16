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

    // Fetch customer's current active subscription
    const activeSub = await db.subscription.findFirst({
      where: { userId: customerId, businessId: business.id, status: "ACTIVE" }
    });

    let carryOverMeals = 0;
    if (activeSub) {
      const remainingMeals = activeSub.mealCount - activeSub.usedMeals;
      if (remainingMeals > activeSub.reminderCount) {
        throw new Error(`Cannot assign plan. Diner's remaining thalis balance (${remainingMeals}) is above the renewal threshold (${activeSub.reminderCount}).`);
      }
      carryOverMeals = remainingMeals;
    }

    const baseMealCount = parseInt(planDetails.mealCount);
    const mealCount = baseMealCount + carryOverMeals;
    const mealPrice = parseFloat(planDetails.mealPrice);
    const totalAmount = baseMealCount * mealPrice;
    const validityDays = parseInt(planDetails.validityDays);

    // Deactivate previous active subscriptions for this customer
    if (activeSub) {
      await db.subscription.update({
        where: { id: activeSub.id },
        data: { status: "EXPIRED" }
      });
    }

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
        dueDate: new Date(Date.now() + (business.invoiceDueDays || 7) * 24 * 60 * 60 * 1000)
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

export async function getMessSubscriptionPlansForCustomer() {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CUSTOMER") throw new Error("Unauthorized");
    if (!user.businessId) throw new Error("Diner is not associated with any mess.");

    const plans = await db.subscriptionPlan.findMany({
      where: { businessId: user.businessId },
      orderBy: { totalAmount: "asc" }
    });

    return { success: true, plans };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function requestSubscriptionPlan(planId) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CUSTOMER") throw new Error("Unauthorized");
    if (!user.businessId) throw new Error("Diner is not associated with any mess.");

    // Check if customer has an active subscription above the alert threshold
    const activeSub = await db.subscription.findFirst({
      where: { userId: user.id, businessId: user.businessId, status: "ACTIVE" }
    });
    if (activeSub) {
      const remainingMeals = activeSub.mealCount - activeSub.usedMeals;
      if (remainingMeals > activeSub.reminderCount) {
        throw new Error(`You cannot request a new plan until your remaining thalis balance is ${activeSub.reminderCount} or less.`);
      }
    }

    const existingRequest = await db.subscriptionRequest.findFirst({
      where: {
        userId: user.id,
        businessId: user.businessId,
        status: "PENDING"
      }
    });
    if (existingRequest) {
      throw new Error("You already have a pending subscription request. Please wait for the owner to approve it.");
    }

    const request = await db.subscriptionRequest.create({
      data: {
        userId: user.id,
        businessId: user.businessId,
        planId: planId,
        status: "PENDING"
      }
    });

    revalidatePath("/customer/plans");
    return { success: true, request };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getCustomerSubscriptionRequests() {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CUSTOMER") throw new Error("Unauthorized");

    const requests = await db.subscriptionRequest.findMany({
      where: { userId: user.id },
      include: {
        plan: true
      },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, requests };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getBusinessSubscriptionRequests() {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const business = await db.business.findUnique({
      where: { ownerId: user.id }
    });
    if (!business) throw new Error("Business not found");

    const requests = await db.subscriptionRequest.findMany({
      where: { businessId: business.id, status: "PENDING" },
      include: {
        user: true,
        plan: true
      },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, requests };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function approveSubscriptionRequest(requestId) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const request = await db.subscriptionRequest.findUnique({
      where: { id: requestId },
      include: {
        plan: true,
        user: true
      }
    });
    if (!request) throw new Error("Subscription request not found");
    if (request.status !== "PENDING") throw new Error("Request already processed");

    // 1. Fetch current active subscription and calculate carry over meals
    const activeSub = await db.subscription.findFirst({
      where: { userId: request.userId, businessId: request.businessId, status: "ACTIVE" }
    });
    const carryOverMeals = activeSub ? (activeSub.mealCount - activeSub.usedMeals) : 0;

    // Deactivate previous active subscriptions for this customer
    if (activeSub) {
      await db.subscription.update({
        where: { id: activeSub.id },
        data: { status: "EXPIRED" }
      });
    }

    // 2. Create the new active subscription with carried over meals
    await db.subscription.create({
      data: {
        userId: request.userId,
        businessId: request.businessId,
        mealCount: request.plan.mealCount + carryOverMeals,
        usedMeals: 0,
        mealPrice: request.plan.mealPrice,
        totalAmount: request.plan.totalAmount,
        validityDays: request.plan.validityDays,
        reminderCount: request.plan.reminderCount,
        status: "ACTIVE"
      }
    });

    // 3. Generate Bill
    const billCount = await db.bill.count();
    const invoiceNumber = `INV-${1000 + billCount + 1}`;
    
    const business = await db.business.findUnique({
      where: { id: request.businessId }
    });

    await db.bill.create({
      data: {
        invoiceNumber,
        userId: request.userId,
        businessId: request.businessId,
        totalAmount: request.plan.totalAmount,
        paidAmount: 0,
        remainingAmount: request.plan.totalAmount,
        status: "UNPAID",
        dueDate: new Date(Date.now() + (business.invoiceDueDays || 7) * 24 * 60 * 60 * 1000)
      }
    });

    // 4. Update request status to APPROVED
    await db.subscriptionRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" }
    });

    // 5. Send Notification
    await db.notification.create({
      data: {
        userId: request.userId,
        type: "SYSTEM",
        message: `Your requested plan "${request.plan.name}" has been approved! ${request.plan.mealCount} meals active.`,
        status: "UNREAD"
      }
    });

    revalidatePath("/dashboard/subscriptions");
    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard");
    revalidatePath("/customer/dashboard");
    revalidatePath("/customer/plans");

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function rejectSubscriptionRequest(requestId) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const request = await db.subscriptionRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
      include: {
        plan: true
      }
    });

    // Send Notification
    await db.notification.create({
      data: {
        userId: request.userId,
        type: "SYSTEM",
        message: `Your requested plan "${request.plan.name}" was declined by the mess owner.`,
        status: "UNREAD"
      }
    });

    revalidatePath("/dashboard/subscriptions");
    revalidatePath("/customer/plans");

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
