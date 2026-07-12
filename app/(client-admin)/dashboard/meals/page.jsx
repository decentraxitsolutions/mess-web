import { getBusinessMealLogs } from "@/actions/meals";
import MealsClient from "./MealsClient";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MealsPage() {
  const res = await getBusinessMealLogs();

  if (!res.success) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h3 className="text-xl font-bold">Error Loading Meal Logs</h3>
        <p className="text-muted-foreground">{res.error}</p>
      </div>
    );
  }

  return <MealsClient initialLogs={res.logs} />;
}
