import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import SettingsClient from "./SettingsClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await checkUser();
  if (!user || user.role !== "CLIENT_ADMIN") {
    redirect("/sign-in");
  }

  const business = await db.business.findUnique({
    where: { ownerId: user.id }
  });

  if (!business) {
    redirect("/dashboard");
  }

  return (
    <SettingsClient 
      initialSettings={{
        name: business.name || "",
        phone: business.phone || "",
        address: business.address || "",
        logoUrl: business.logoUrl || "",
        qrScanEnabled: business.qrScanEnabled,
        breakfastEnabled: business.breakfastEnabled ?? true,
        breakfastStart: business.breakfastStart || "06:00",
        breakfastEnd: business.breakfastEnd || "11:00",
        lunchEnabled: business.lunchEnabled ?? true,
        lunchStart: business.lunchStart || "11:00",
        lunchEnd: business.lunchEnd || "16:00",
        dinnerEnabled: business.dinnerEnabled ?? true,
        dinnerStart: business.dinnerStart || "16:00",
        dinnerEnd: business.dinnerEnd || "23:00",
        dinePassDurationMins: business.dinePassDurationMins ?? 30,
        defaultGst: business.defaultGst || 0,
        invoiceDueDays: business.invoiceDueDays || 7,
        upiId: business.upiId || "",
        uniqueId: business.uniqueId || ""
      }}
    />
  );
}
