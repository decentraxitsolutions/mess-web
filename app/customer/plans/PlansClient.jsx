"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, AlertCircle, Clock, ShieldCheck, Tag, ArrowUpRight, Check, Loader2 } from "lucide-react";
import { requestSubscriptionPlan } from "@/actions/subscriptions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function PlansClient({ plans, requests, activeSub }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState(null);

  // Check if customer already has a pending request
  const hasPendingRequest = requests.some(r => r.status === "PENDING");
  const remainingMeals = activeSub ? (activeSub.mealCount - activeSub.usedMeals) : 0;
  const isRenewalLocked = activeSub && remainingMeals > activeSub.reminderCount;

  const handleRequestPlan = async (planId) => {
    setLoadingId(planId);
    try {
      const res = await requestSubscriptionPlan(planId);
      if (res.success) {
        toast.success("Subscription plan requested successfully! The owner will review and activate it shortly.");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to request plan.");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Introduction Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Tag className="h-7 w-7 text-indigo-600 animate-pulse" /> Dine Plans & Packages
        </h1>
        <p className="text-muted-foreground">Select a subscription package to renew or upgrade your mess thalis balance.</p>
      </div>

      {/* Active Subscription Banner */}
      {activeSub ? (
        <Card className="border-2 border-emerald-500 bg-emerald-50/20 shadow-md">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-emerald-950 font-bold text-lg flex items-center gap-1.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> Your Current Plan is Active
              </CardTitle>
              <CardDescription className="text-emerald-800">
                You have active thalis left. You can request a renewal package below.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="text-muted-foreground block mb-0.5">Remaining Thalis</span>
              <span className="text-xl font-extrabold text-emerald-950">{activeSub.mealCount - activeSub.usedMeals}</span>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="text-muted-foreground block mb-0.5">Total Package Thalis</span>
              <span className="text-xl font-bold text-neutral-800">{activeSub.mealCount}</span>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="text-muted-foreground block mb-0.5">Dine Price / Thali</span>
              <span className="text-xl font-bold text-neutral-800">₹{activeSub.mealPrice}</span>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100 col-span-2 sm:col-span-1">
              <span className="text-muted-foreground block mb-0.5">Validity Limit</span>
              <span className="text-sm font-semibold text-neutral-800">
                {activeSub.validityDays ? `${activeSub.validityDays} Days` : "Lifetime"}
              </span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-amber-500 bg-amber-50/20 shadow-md">
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <CardTitle className="text-amber-950 font-bold text-sm">No Active Plan Assigned</CardTitle>
              <CardDescription className="text-amber-800 text-xs">
                Please request a package below to start dining at this mess.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Available Plans Grid */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-1.5 text-indigo-950">
          <ShieldCheck className="h-5 w-5 text-indigo-600" /> Available Packages
        </h2>
        {plans.length === 0 ? (
          <div className="text-center py-12 bg-white/50 border border-dashed rounded-2xl">
            <Tag className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">This mess has not created any subscription plans yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const isPendingForThis = requests.some(r => r.planId === plan.id && r.status === "PENDING");
              return (
                <Card key={plan.id} className="shadow-lg border border-indigo-50 flex flex-col justify-between hover:shadow-xl transition-all duration-300 relative overflow-hidden bg-white/95">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
                  <CardHeader className="pb-4 border-b">
                    <CardTitle className="text-lg font-extrabold text-indigo-950">{plan.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {plan.validityDays} Days Validity Window
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4 flex-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-indigo-950">₹{plan.totalAmount}</span>
                      <span className="text-xs text-muted-foreground font-semibold">Total package price</span>
                    </div>
                    
                    <div className="space-y-2 border-t pt-4 text-xs font-semibold text-neutral-800">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Thalis Count:</span>
                        <span className="font-bold text-indigo-900">{plan.mealCount} Meals</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Per Thali Rate:</span>
                        <span>₹{plan.mealPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Low Limit Alert:</span>
                        <span className="text-amber-600">At {plan.reminderCount} remaining</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-2 pb-4 border-t px-6">
                    {isPendingForThis ? (
                      <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold gap-1.5 h-10 border-none cursor-default">
                        <Clock className="h-4 w-4 animate-spin" /> Pending Approval
                      </Button>
                    ) : isRenewalLocked ? (
                      <div className="w-full text-center space-y-1.5">
                        <Button
                          disabled
                          className="w-full bg-neutral-200 text-neutral-400 text-xs font-bold gap-1.5 h-10 border-none cursor-not-allowed"
                        >
                          Request Package <ArrowUpRight className="h-4 w-4" />
                        </Button>
                        <span className="text-[10px] text-amber-600 font-bold block">
                          Locked (Requires balance ≤ {activeSub.reminderCount} thalis)
                        </span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleRequestPlan(plan.id)}
                        disabled={hasPendingRequest || loadingId !== null}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5 h-10 cursor-pointer border-none shadow-md shadow-indigo-100"
                      >
                        {loadingId === plan.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Requesting...
                          </>
                        ) : (
                          <>
                            Request Package <ArrowUpRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Plan Request History */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-1.5 text-indigo-950">
          <Clock className="h-5 w-5 text-indigo-600" /> Package Request History
        </h2>
        <Card className="shadow-md bg-white/90">
          <CardContent className="p-0">
            {requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                You have not submitted any package requests yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requested Plan</TableHead>
                      <TableHead>Total Price</TableHead>
                      <TableHead>Thalis Count</TableHead>
                      <TableHead>Requested On</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req) => (
                      <TableRow key={req.id} className="text-xs">
                        <TableCell className="font-semibold text-indigo-950">{req.plan.name}</TableCell>
                        <TableCell className="font-bold">₹{req.plan.totalAmount}</TableCell>
                        <TableCell>{req.plan.mealCount} Meals</TableCell>
                        <TableCell>
                          {new Date(req.createdAt).toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" })}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            req.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : req.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {req.status === "PENDING" ? "● PENDING" : req.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
