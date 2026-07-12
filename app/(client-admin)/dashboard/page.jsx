import { getAdminDashboardStats } from "@/actions/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Utensils, AlertCircle, Clock, ShieldAlert, ArrowRight, UserPlus } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const res = await getAdminDashboardStats();
  if (!res.success) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h3 className="text-xl font-bold">Error Loading Dashboard</h3>
        <p className="text-muted-foreground">{res.error}</p>
      </div>
    );
  }

  const { stats } = res;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-xl">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{stats.businessName}</h1>
          <p className="mt-1.5 text-indigo-100 font-medium">
            Mess ID: <span className="bg-white/20 px-2 py-0.5 rounded text-white font-mono tracking-wider">{stats.uniqueId}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/scanner">
            <Button className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold rounded-full px-5">
              Launch Scanner Console
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Customers */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Active / Total Customers</CardTitle>
            <Users className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight">
              {stats.activeCustomers} <span className="text-lg font-medium text-muted-foreground">/ {stats.totalCustomers}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingCustomers} pending registration requests
            </p>
          </CardContent>
        </Card>

        {/* Meals Served Today */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Meals Served Today</CardTitle>
            <Utensils className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight">{stats.mealsServedToday}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Fresh scans recorded today
            </p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Revenue Collected</CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-emerald-600">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total payment received from invoices
            </p>
          </CardContent>
        </Card>

        {/* Pending Dues */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Pending Balance</CardTitle>
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-amber-600">₹{stats.pendingRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Outstanding dues to be collected
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Scans */}
        <Card className="col-span-4 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Recent Scans</CardTitle>
              <CardDescription>Latest scan-ins by your customers</CardDescription>
            </div>
            <Link href="/dashboard/meals">
              <Button variant="ghost" size="sm" className="gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-semibold">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentScans.length === 0 ? (
              <div className="flex h-[200px] flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                <Clock className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No scans recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentScans.map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="font-semibold text-sm text-foreground">{scan.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(scan.time), { addSuffix: true })}
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                      {scan.mealType}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Approvals Queue */}
        <Card className="col-span-3 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Pending Approvals</CardTitle>
              <CardDescription>Verify customer accounts</CardDescription>
            </div>
            <Link href="/dashboard/customers">
              <Button variant="ghost" size="sm" className="gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-semibold">
                Manage <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.pendingApprovals.length === 0 ? (
              <div className="flex h-[200px] flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                <UserPlus className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No pending registrations.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.pendingApprovals.map((req) => (
                  <div key={req.id} className="flex flex-col gap-2 rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-sm text-foreground">{req.name}</p>
                        <p className="text-xs text-muted-foreground">{req.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t text-xs">
                      <span className="font-medium text-muted-foreground">
                        Plan: <span className="text-indigo-600 font-semibold">{req.plan}</span>
                      </span>
                      <Link href="/dashboard/customers">
                        <Button size="xs" className="h-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] px-2.5">
                          Review
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
