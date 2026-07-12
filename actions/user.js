"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";

export async function setUserRole(role) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { role }
    });

    revalidatePath("/");
    return { success: true, user: updatedUser };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function registerCustomerProfile(data) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    // Find the business by uniqueId
    const business = await db.business.findUnique({
      where: { uniqueId: data.messId }
    });

    if (!business) {
      throw new Error("Mess not found with this ID.");
    }
    
    if (business.status !== "APPROVED") {
      throw new Error("This mess is not yet approved by the platform administrator.");
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        name: data.name,
        phone: data.phone,
        businessId: business.id,
        requestedPlan: data.requestedPlan,
        role: "CUSTOMER", // Explicitly set role to CUSTOMER
        status: "PENDING" // Explicitly set status to PENDING
      }
    });

    revalidatePath("/");
    return { success: true, user: updatedUser };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getUserRedirectPathHelper(user) {
  if (!user) return "/";
  
  if (user.role === "SUPER_ADMIN") {
    return "/super-admin";
  }
  
  if (user.role === "CLIENT_ADMIN") {
    if (!user.ownedBusiness) {
      return "/choose-role";
    }
    if (user.ownedBusiness.status === "PENDING") {
      return "/pending-approval";
    }
    if (user.ownedBusiness.status === "APPROVED") {
      return "/dashboard";
    }
  }
  
  if (user.role === "CUSTOMER") {
    if (!user.businessId) {
      return "/customer/register";
    }
    if (user.status === "PENDING") {
      return "/pending-approval";
    }
    if (user.status === "ACTIVE") {
      return "/customer/dashboard";
    }
  }
  
  return "/";
}
