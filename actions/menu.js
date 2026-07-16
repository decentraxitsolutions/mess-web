"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";

export async function getBusinessMenu() {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const business = await db.business.findUnique({
      where: { ownerId: user.id }
    });
    if (!business) throw new Error("Business not found");

    const menuItems = await db.menu.findMany({
      where: { businessId: business.id },
      orderBy: { day: "asc" }
    });

    return { success: true, menuItems };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function saveMenuEntry(data) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const business = await db.business.findUnique({
      where: { ownerId: user.id }
    });
    if (!business) throw new Error("Business not found");

    // Upsert: check if a menu entry for this business, type, and day/date already exists
    const queryWhere = {
      businessId: business.id,
      type: data.type,
    };
    if (data.type === "FESTIVAL") {
      queryWhere.date = data.date ? new Date(data.date) : null;
    } else {
      queryWhere.day = data.day || null;
    }

    const existing = await db.menu.findFirst({
      where: queryWhere
    });

    let menu;
    if (existing) {
      menu = await db.menu.update({
        where: { id: existing.id },
        data: {
          title: data.title,
          description: data.description,
          status: data.status || "ACTIVE"
        }
      });
    } else {
      menu = await db.menu.create({
        data: {
          businessId: business.id,
          type: data.type,
          day: data.day || null,
          date: data.date ? new Date(data.date) : null,
          title: data.title,
          description: data.description,
          status: "ACTIVE"
        }
      });
    }

    revalidatePath("/dashboard/menu");
    return { success: true, menu };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function toggleGlobalMenu(status) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const business = await db.business.findUnique({
      where: { ownerId: user.id }
    });
    if (!business) throw new Error("Business not found");

    // Update all menus to the new status (ACTIVE or INACTIVE)
    await db.menu.updateMany({
      where: { businessId: business.id },
      data: { status }
    });

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getCustomerMenu() {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CUSTOMER") throw new Error("Unauthorized");
    if (!user.businessId) throw new Error("Diner not linked to a mess");

    const menuItems = await db.menu.findMany({
      where: { businessId: user.businessId },
      orderBy: { day: "asc" }
    });

    return { success: true, menuItems };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteMenuEntry(menuId) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    await db.menu.delete({
      where: { id: menuId }
    });

    revalidatePath("/dashboard/menu");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
