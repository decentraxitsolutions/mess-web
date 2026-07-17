"use client";

import { useState } from "react";
import { 
  createSubscriptionPlan, 
  deleteSubscriptionPlan, 
  assignSubscriptionToCustomer,
  approveSubscriptionRequest,
  rejectSubscriptionRequest
} from "@/actions/subscriptions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, ShieldAlert, Award, Calendar, DollarSign, Layers } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SubscriptionClient({ initialPlans, activeCustomers, pendingRequests }) {
  const router = useRouter();
  const [plans, setPlans] = useState(initialPlans);
  const [pendingRequestsList, setPendingRequestsList] = useState(pendingRequests || []);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("plans");

  // Create Plan Form States
  const [planName, setPlanName] = useState("");
  const [mealCount, setMealCount] = useState(56);
  const [mealPrice, setMealPrice] = useState(60);
  const [totalAmount, setTotalAmount] = useState(3360);
  const [validityDays, setValidityDays] = useState(30);
  const [reminderCount, setReminderCount] = useState(5);

  const handleMealCountChange = (val) => {
    setMealCount(val);
    setTotalAmount(val * mealPrice);
  };
  const handleMealPriceChange = (val) => {
    setMealPrice(val);
    setTotalAmount(mealCount * val);
  };
  const handleTotalAmountChange = (val) => {
    setTotalAmount(val);
    if (mealCount > 0) {
      setMealPrice(val / mealCount);
    }
  };

  // Assign Subscription Form States
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [assignMealCount, setAssignMealCount] = useState(56);
  const [assignMealPrice, setAssignMealPrice] = useState(60);
  const [assignTotalAmount, setAssignTotalAmount] = useState(3360);
  const [assignValidityDays, setAssignValidityDays] = useState(30);
  const [assignReminderCount, setAssignReminderCount] = useState(5);
  const [paidImmediately, setPaidImmediately] = useState(false);

  const handleAssignMealCountChange = (val) => {
    setAssignMealCount(val);
    setAssignTotalAmount(val * assignMealPrice);
  };
  const handleAssignMealPriceChange = (val) => {
    setAssignMealPrice(val);
    setAssignTotalAmount(assignMealCount * val);
  };
  const handleAssignTotalAmountChange = (val) => {
    setAssignTotalAmount(val);
    if (assignMealCount > 0) {
      setAssignMealPrice(val / assignMealCount);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createSubscriptionPlan({
        name: planName,
        mealCount,
        mealPrice,
        totalAmount,
        validityDays,
        reminderCount
      });

      if (res.success) {
        toast.success(`Plan "${planName}" created successfully!`);
        setPlans(prev => [res.plan, ...prev]);
        setPlanName("");
        setMealCount(56);
        setMealPrice(60);
        setValidityDays(30);
        setReminderCount(5);
      } else {
        toast.error(res.error || "Failed to create plan");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId, name) => {
    if (!confirm(`Are you sure you want to delete plan "${name}"?`)) return;
    setLoading(true);
    try {
      const res = await deleteSubscriptionPlan(planId);
      if (res.success) {
        toast.success(`Plan "${name}" deleted.`);
        setPlans(prev => prev.filter(p => p.id !== planId));
      } else {
        toast.error(res.error || "Failed to delete plan");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlanForAssignment = (planId) => {
    setSelectedPlanId(planId);
    if (!planId) return;
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setAssignMealCount(plan.mealCount);
      setAssignMealPrice(plan.mealPrice);
      setAssignTotalAmount(plan.totalAmount);
      setAssignValidityDays(plan.validityDays);
      setAssignReminderCount(plan.reminderCount);
    }
  };

  const handleAssignSubscription = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      toast.error("Please select a customer.");
      return;
    }
    setLoading(true);
    try {
      const res = await assignSubscriptionToCustomer(selectedCustomerId, {
        mealCount: assignMealCount,
        mealPrice: assignMealPrice,
        totalAmount: assignTotalAmount,
        validityDays: assignValidityDays,
        reminderCount: assignReminderCount,
        paidImmediately
      });

      if (res.success) {
        toast.success("Subscription assigned and invoice generated successfully!");
        setSelectedCustomerId("");
        setSelectedPlanId("");
        setPaidImmediately(false);
        setActiveTab("plans");
      } else {
        toast.error(res.error || "Failed to assign subscription");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (reqId) => {
    setLoading(true);
    try {
      const res = await approveSubscriptionRequest(reqId);
      if (res.success) {
        toast.success("Subscription request approved and activated!");
        setPendingRequestsList(prev => prev.filter(r => r.id !== reqId));
        router.refresh();
      } else {
        toast.error(res.error || "Failed to approve request.");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (reqId) => {
    if (!confirm("Are you sure you want to decline this plan request?")) return;
    setLoading(true);
    try {
      const res = await rejectSubscriptionRequest(reqId);
      if (res.success) {
        toast.success("Subscription request declined.");
        setPendingRequestsList(prev => prev.filter(r => r.id !== reqId));
        router.refresh();
      } else {
        toast.error(res.error || "Failed to decline request.");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
        <p className="text-muted-foreground">Define your pricing tiers and assign plans to active diners.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-card border p-1.5 rounded-lg flex-wrap h-auto gap-1">
          <TabsTrigger value="plans" className="rounded-md text-sm font-bold md:text-base px-5 py-2.5">Subscription Plans ({plans.length})</TabsTrigger>
          <TabsTrigger value="create" className="rounded-md text-sm font-bold md:text-base px-5 py-2.5">Create Plan</TabsTrigger>
          <TabsTrigger value="assign" className="rounded-md text-sm font-bold md:text-base px-5 py-2.5">Assign Subscriptions</TabsTrigger>
          <TabsTrigger value="requests" className="rounded-md text-sm font-bold md:text-base px-5 py-2.5 relative flex items-center gap-1.5">
            Requests
            {pendingRequestsList.length > 0 ? (
              <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-extrabold text-white animate-pulse">
                {pendingRequestsList.length}
              </span>
            ) : (
              <span>(0)</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* LIST PLANS */}
        <TabsContent value="plans">
          {plans.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl bg-card">
              <Layers className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <h3 className="font-bold text-lg">No Plans Created Yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
                You haven't defined any custom meal plans yet. Go to the "Create Plan" tab to define pricing.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <Card key={plan.id} className="relative overflow-hidden shadow-md hover:shadow-xl transition-all border-l-4 border-l-indigo-600 bg-card">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-bold text-foreground">{plan.name}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeletePlan(plan.id, plan.name)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                    <CardDescription>Template plan for your mess</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-2 text-sm">
                    <div className="flex items-center justify-between font-mono bg-muted/40 p-2 rounded">
                      <span className="text-muted-foreground text-xs font-sans">Cost:</span>
                      <span className="font-bold text-indigo-600 text-lg">₹{plan.totalAmount}</span>
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Award className="h-3.5 w-3.5" /> Meal Count:
                        </span>
                        <span className="font-semibold">{plan.mealCount} Meals</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" /> Price / Meal:
                        </span>
                        <span className="font-semibold">₹{plan.mealPrice}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> Validity:
                        </span>
                        <span className="font-semibold">{plan.validityDays} Days</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 border-t text-[10px] text-muted-foreground">
                    Low balance alert at {plan.reminderCount} meals remaining.
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* CREATE PLAN FORM */}
        <TabsContent value="create">
          <Card className="shadow-md max-w-xl">
            <CardHeader>
              <CardTitle>Create Subscription Template</CardTitle>
              <CardDescription>Save reusable plan templates so you can assign them quickly to clients.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreatePlan}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="plan-name">Plan Name</Label>
                  <Input 
                    id="plan-name" 
                    required 
                    value={planName} 
                    onChange={(e) => setPlanName(e.target.value)} 
                    placeholder="E.g. Monthly Premium, Basic 30 Thali" 
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan-meals">Meal Count</Label>
                    <Input 
                      id="plan-meals" 
                      type="number" 
                      required 
                      value={mealCount} 
                      onChange={(e) => handleMealCountChange(parseInt(e.target.value) || 0)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan-price">Price Per Meal (₹)</Label>
                    <Input 
                      id="plan-price" 
                      type="number" 
                      step="0.01" 
                      required 
                      value={mealPrice} 
                      onChange={(e) => handleMealPriceChange(parseFloat(e.target.value) || 0)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan-total">Total Price (₹)</Label>
                    <Input 
                      id="plan-total" 
                      type="number" 
                      step="0.01" 
                      required 
                      value={totalAmount} 
                      onChange={(e) => handleTotalAmountChange(parseFloat(e.target.value) || 0)} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan-validity">Validity (Days)</Label>
                    <Input 
                      id="plan-validity" 
                      type="number" 
                      required 
                      value={validityDays} 
                      onChange={(e) => setValidityDays(parseInt(e.target.value) || 0)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan-reminder">Low Meal Warning Threshold</Label>
                    <Input 
                      id="plan-reminder" 
                      type="number" 
                      required 
                      value={reminderCount} 
                      onChange={(e) => setReminderCount(parseInt(e.target.value) || 0)} 
                    />
                  </div>
                </div>

                <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3 text-xs flex justify-between items-center mt-2">
                  <span className="font-semibold text-indigo-900">Total Subscription Pricing:</span>
                  <span className="font-mono font-bold text-indigo-700 text-lg">₹{(mealCount * mealPrice).toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-4 border-t gap-2">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium" disabled={loading}>
                  {loading ? "Saving Plan..." : "Save Plan Template"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* ASSIGN PLAN TO CUSTOMER */}
        <TabsContent value="assign">
          <Card className="shadow-md max-w-xl">
            <CardHeader>
              <CardTitle>Renew or Assign Subscription</CardTitle>
              <CardDescription>Add fresh meals or extend validity for an existing diner.</CardDescription>
            </CardHeader>
            <form onSubmit={handleAssignSubscription}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="assign-customer">Select Diner</Label>
                  <select
                    id="assign-customer"
                    required
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">-- Choose Diner --</option>
                    {activeCustomers.map((cust) => (
                      <option key={cust.id} value={cust.id}>
                        {cust.name} ({cust.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assign-plan">Pre-fill from Plan Template (Optional)</Label>
                  <select
                    id="assign-plan"
                    value={selectedPlanId}
                    onChange={(e) => handleSelectPlanForAssignment(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none"
                  >
                    <option value="">-- Custom (No Template) --</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.mealCount} Meals @ ₹{p.totalAmount})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="assign-meals-count">Meal Count</Label>
                    <Input 
                      id="assign-meals-count" 
                      type="number" 
                      required 
                      value={assignMealCount} 
                      onChange={(e) => handleAssignMealCountChange(parseInt(e.target.value) || 0)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assign-meals-price">Price Per Meal (₹)</Label>
                    <Input 
                      id="assign-meals-price" 
                      type="number" 
                      step="0.01" 
                      required 
                      value={assignMealPrice} 
                      onChange={(e) => handleAssignMealPriceChange(parseFloat(e.target.value) || 0)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assign-meals-total">Total Price (₹)</Label>
                    <Input 
                      id="assign-meals-total" 
                      type="number" 
                      step="0.01" 
                      required 
                      value={assignTotalAmount} 
                      onChange={(e) => handleAssignTotalAmountChange(parseFloat(e.target.value) || 0)} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assign-meals-validity">Validity (Days)</Label>
                    <Input 
                      id="assign-meals-validity" 
                      type="number" 
                      required 
                      value={assignValidityDays} 
                      onChange={(e) => setAssignValidityDays(parseInt(e.target.value) || 0)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assign-meals-reminder">Low Meal Warning Threshold</Label>
                    <Input 
                      id="assign-meals-reminder" 
                      type="number" 
                      required 
                      value={assignReminderCount} 
                      onChange={(e) => setAssignReminderCount(parseInt(e.target.value) || 0)} 
                    />
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs flex justify-between items-center mt-2">
                  <span className="font-semibold text-indigo-900">Total Subscription Charge:</span>
                  <span className="font-mono font-bold text-indigo-700 text-lg">₹{assignTotalAmount}</span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <input 
                    id="assign-paid" 
                    type="checkbox" 
                    checked={paidImmediately}
                    onChange={(e) => setPaidImmediately(e.target.checked)}
                    className="rounded border-input text-indigo-600 focus:ring-indigo-500 h-4 w-4" 
                  />
                  <Label htmlFor="assign-paid" className="cursor-pointer text-sm font-normal">
                    Mark invoice as **PAID** immediately (Cash/UPI received upfront)
                  </Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-4 border-t gap-2">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium" disabled={loading}>
                  {loading ? "Assigning..." : "Assign Subscription"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* PENDING REQUESTS APPROVAL TAB */}
        <TabsContent value="requests">
          {pendingRequestsList.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl bg-card">
              <Layers className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <h3 className="font-bold text-lg">No Pending Requests</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
                All customer subscription requests have been processed.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {pendingRequestsList.map((req) => (
                <Card key={req.id} className="shadow-md border-l-4 border-l-amber-500 bg-card">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-bold text-foreground">{req.user.name || req.user.email}</CardTitle>
                        <CardDescription className="text-xs">{req.user.email}</CardDescription>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-extrabold text-amber-700">
                        PENDING REVIEW
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-2 text-xs">
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3 text-xs flex justify-between items-center">
                      <span className="font-semibold text-indigo-950">Requested Plan:</span>
                      <span className="font-bold text-indigo-700">{req.plan.name}</span>
                    </div>
                    <div className="space-y-1.5 font-semibold text-neutral-700">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Meals Count:</span>
                        <span>{req.plan.mealCount} Meals</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Price:</span>
                        <span>₹{req.plan.totalAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Validity Limit:</span>
                        <span>{req.plan.validityDays} Days</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 border-t flex justify-end gap-2 px-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold hover:bg-red-50 hover:text-red-700 border-neutral-200 cursor-pointer"
                      onClick={() => handleRejectRequest(req.id)}
                      disabled={loading}
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer border-none shadow-md shadow-indigo-100"
                      onClick={() => handleApproveRequest(req.id)}
                      disabled={loading}
                    >
                      Approve & Activate
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
