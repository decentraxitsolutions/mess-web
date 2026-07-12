import { getCustomerDashboardData } from "@/actions/customer-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { QrCode, ShieldAlert, Clock, Utensils, CheckCircle2, AlertCircle, Calendar, Receipt, Scan } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CustomerDashboardPage() {
  const res = await getCustomerDashboardData();

  if (!res.success) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h3 className="text-xl font-bold">Error Loading Dashboard</h3>
        <p className="text-muted-foreground">{res.error}</p>
      </div>
    );
  }

  const { data } = res;
  const activeSub = data.subscription;
  const remainingMeals = activeSub ? (activeSub.mealCount - activeSub.usedMeals) : 0;
  const totalMeals = activeSub ? activeSub.mealCount : 0;
  const usedMeals = activeSub ? activeSub.usedMeals : 0;

  // Calculate percentage of remaining meals
  const mealPct = totalMeals > 0 ? Math.round((remainingMeals / totalMeals) * 100) : 0;

  // Check for unpaid bills
  const unpaidBills = data.bills.filter(b => b.status !== "PAID");
  const totalDueAmount = unpaidBills.reduce((sum, b) => sum + b.remainingAmount, 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome, {data.userName}</h1>
          <p className="mt-1 text-indigo-100 font-medium">Diner of {data.businessName} (ID: {data.uniqueId})</p>
        </div>
        {activeSub && (
          <div className="bg-white/10 px-4 py-2 rounded-xl text-xs font-semibold backdrop-blur-sm">
            Status: <span className="text-green-300 font-bold">ACTIVE PACKAGE</span>
          </div>
        )}
      </div>

      {/* Dues Alert Banner */}
      {totalDueAmount > 0 && (
        <Alert variant="destructive" className="bg-red-50/70 border-red-200 text-red-900 shadow-md">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertTitle className="font-bold text-sm">Outstanding Dues Alert</AlertTitle>
          <AlertDescription className="text-xs mt-1">
            You have {unpaidBills.length} unpaid invoice(s) totaling <span className="font-bold">₹{totalDueAmount}</span>. Please clear your balance at the counter.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-5">
        
        {/* Left Column: Progress, Plan details, Notifications */}
        <div className="md:col-span-3 space-y-6">
          
          {/* Meals Progress Card */}
          <Card className="shadow-md bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Subscription Balance</CardTitle>
              <CardDescription>Remaining thalis count in your current cycle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeSub ? (
                <>
                  <div className="flex justify-between items-baseline">
                    <span className="text-4xl font-extrabold tracking-tight text-indigo-600">{remainingMeals}</span>
                    <span className="text-sm font-semibold text-muted-foreground">/ {totalMeals} Meals Remaining</span>
                  </div>
                  <Progress value={mealPct} className="h-3.5 bg-muted" />
                  <div className="flex justify-between text-xs text-muted-foreground pt-1">
                    <span>Used: {usedMeals} meals</span>
                    <span className={`${remainingMeals <= activeSub.reminderCount ? "text-red-500 font-bold" : ""}`}>
                      {mealPct}% remaining
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-xl">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active package. Please contact admin to renew.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Special Broadcast */}
          {data.dailyMenu && (
            <Card className="shadow-md border-orange-100 bg-orange-50/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                  <Utensils className="h-4 w-4" /> Today's Menu Alert
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs">
                <h4 className="font-bold text-foreground text-sm">{data.dailyMenu.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{data.dailyMenu.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Package Details */}
          {activeSub && (
            <Card className="shadow-sm">
              <CardHeader className="py-3.5 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Calendar className="h-4.5 w-4.5 text-indigo-500" /> Plan Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs divide-y">
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground">Start Date:</span>
                  <span className="font-semibold">{new Date(activeSub.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground">Validity Duration:</span>
                  <span className="font-semibold">{activeSub.validityDays ? `${activeSub.validityDays} Days` : "Lifetime"}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground">Price/Meal Rate:</span>
                  <span className="font-semibold">₹{activeSub.mealPrice}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground">Warning Limit:</span>
                  <span className="font-semibold text-red-500">{activeSub.reminderCount} meals remaining</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: QR Code & Recent dine logs */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Scan & Dine Quick Link */}
          <Card className="shadow-lg border-2 border-indigo-100/50 bg-card text-center overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Scan & Dine</CardTitle>
              <CardDescription>Scan the Mess owner's QR code at the counter</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6 bg-indigo-50/30 space-y-4">
              <div className="bg-white p-4 rounded-full shadow-md border-2 border-indigo-100 animate-pulse">
                <Scan className="w-12 h-12 text-indigo-600" />
              </div>
              <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                Ready to eat? Use your camera scanner to check in and deduct one thali.
              </p>
              <Link href="/customer/scanner" className="w-full">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5 shadow-md">
                  <Scan className="h-4 w-4" /> Open Camera Scanner
                </Button>
              </Link>
            </CardContent>
            <CardFooter className="text-[10px] text-muted-foreground py-2.5 justify-center border-t bg-neutral-50">
              Quickly check in and log your meal instantly
            </CardFooter>
          </Card>

          {/* Recent Dine Logs */}
          <Card className="shadow-md">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Dine History</CardTitle>
                <CardDescription>Last 5 check-ins</CardDescription>
              </div>
              <Clock className="h-4 w-4 text-muted-foreground opacity-50" />
            </CardHeader>
            <CardContent>
              {data.logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs border border-dashed rounded-lg">
                  No meals recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.logs.map((log) => (
                    <div key={log.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0 text-xs">
                      <div>
                        <span className="font-semibold text-foreground block">
                          {log.mealType} check-in
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        Deducted
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
