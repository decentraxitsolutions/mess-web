"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";

export async function getBusinessSettings() {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const business = await db.business.findUnique({
      where: { ownerId: user.id }
    });
    if (!business) throw new Error("Mess profile not found");

    return { success: true, business };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateBusinessSettings(data) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const business = await db.business.findUnique({
      where: { ownerId: user.id }
    });
    if (!business) throw new Error("Mess profile not found");

    const updated = await db.business.update({
      where: { id: business.id },
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address,
        qrScanEnabled: data.qrScanEnabled !== undefined ? Boolean(data.qrScanEnabled) : true,
        breakfastEnabled: data.breakfastEnabled !== undefined ? Boolean(data.breakfastEnabled) : true,
        breakfastStart: data.breakfastStart,
        breakfastEnd: data.breakfastEnd,
        lunchEnabled: data.lunchEnabled !== undefined ? Boolean(data.lunchEnabled) : true,
        lunchStart: data.lunchStart,
        lunchEnd: data.lunchEnd,
        dinnerEnabled: data.dinnerEnabled !== undefined ? Boolean(data.dinnerEnabled) : true,
        dinnerStart: data.dinnerStart,
        dinnerEnd: data.dinnerEnd,
        dinePassDurationMins: parseInt(data.dinePassDurationMins) || 30,
        defaultGst: parseFloat(data.defaultGst) || 0.0,
        invoiceDueDays: parseInt(data.invoiceDueDays) || 7
      }
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/scanner");
    return { success: true, business: updated };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
