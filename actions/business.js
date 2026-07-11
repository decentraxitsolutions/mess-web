"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";

export async function submitBusinessProfile(data) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const business = await db.business.create({
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        ownerId: user.id,
      }
    });

    await db.user.update({
      where: { id: user.id },
      data: { businessId: business.id }
    });

    revalidatePath("/");
    return { success: true, businessId: business.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getPendingBusinesses() {
  const user = await checkUser();
  if (!user || user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  return await db.business.findMany({
    where: { status: "PENDING" },
    include: { owner: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function approveBusiness(businessId, uniqueId) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

    const updatedBusiness = await db.business.update({
      where: { id: businessId },
      data: { status: "APPROVED", uniqueId }
    });

    // Also update the business owner's user status to ACTIVE
    await db.user.update({
      where: { id: updatedBusiness.ownerId },
      data: { status: "ACTIVE" }
    });

    revalidatePath("/super-admin/requests");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function rejectBusiness(businessId) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

    await db.business.update({
      where: { id: businessId },
      data: { status: "REJECTED" }
    });

    revalidatePath("/super-admin/requests");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getApprovedBusinesses() {
  try {
    const businesses = await db.business.findMany({
      where: { status: "APPROVED" },
      orderBy: { name: "asc" }
    });
    return { success: true, businesses };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
