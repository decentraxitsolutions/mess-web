import { getCustomerMealLogs } from "@/actions/meals";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerMealsPage() {
  const res = await getCustomerMealLogs();

  if (!res.success) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h3 className="text-xl font-bold">Error Loading Dine History</h3>
        <p className="text-muted-foreground">{res.error}</p>
      </div>
    );
  }

  const { logs } = res;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Dine History</h1>
        <p className="text-muted-foreground">Log of your past checked-in meals at this mess.</p>
      </div>

      <Card className="shadow-md bg-card">
        <CardHeader>
          <CardTitle>Meal Logs Ledger</CardTitle>
          <CardDescription>Track all deduction scans performed on your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl bg-card">
              <History className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <h3 className="font-bold text-lg">No Diner Logs Yet</h3>
              <p className="text-muted-foreground text-sm">Your dine logs will appear here as soon as you scan your QR ticket.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meal Event Type</TableHead>
                    <TableHead>Check-in Date</TableHead>
                    <TableHead>Check-in Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const dateObj = new Date(log.createdAt);
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            log.mealType === "BREAKFAST" 
                              ? "bg-amber-50 text-amber-700" 
                              : log.mealType === "LUNCH" 
                              ? "bg-indigo-50 text-indigo-700" 
                              : "bg-orange-50 text-orange-700"
                          }`}>
                            {log.mealType}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {dateObj.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" })}
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground text-xs">
                          {dateObj.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                            ● Verified check-in
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
