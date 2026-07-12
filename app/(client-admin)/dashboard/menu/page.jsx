import { getBusinessMenu } from "@/actions/menu";
import MenuClient from "./MenuClient";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const res = await getBusinessMenu();

  if (!res.success) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h3 className="text-xl font-bold">Error Loading Menu Console</h3>
        <p className="text-muted-foreground">{res.error}</p>
      </div>
    );
  }

  return <MenuClient initialMenuItems={res.menuItems} />;
}
