"use client";

import { useState } from "react";
import { 
  approveCustomerRegistration, 
  rejectCustomerRegistration, 
  suspendCustomer, 
  activateCustomer, 
  deleteCustomer,
  manuallyAddCustomer 
} from "@/actions/customers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, X, ShieldAlert, UserMinus, ToggleLeft, ToggleRight, UserCheck, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function CustomerClient({ initialCustomers }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(false);

  // Approval Modal States
  const [selectedApprovee, setSelectedApprovee] = useState(null);
  const [mealCount, setMealCount] = useState(56);
  const [mealPrice, setMealPrice] = useState(57.14); // 3200 / 56
  const [validityDays, setValidityDays] = useState(30);
  const [reminderCount, setReminderCount] = useState(5);

  // Manual Add Form States
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addMealCount, setAddMealCount] = useState(56);
  const [addMealPrice, setAddMealPrice] = useState(57.14);
  const [addValidityDays, setAddValidityDays] = useState(30);
  const [addReminderCount, setAddReminderCount] = useState(5);
  const [paidImmediately, setPaidImmediately] = useState(false);

  const activeUsers = customers.filter(c => c.status === "ACTIVE");
  const pendingUsers = customers.filter(c => c.status === "PENDING");
  const suspendedUsers = customers.filter(c => c.status === "SUSPENDED" || c.status === "EXPIRED");

  // Pre-fill subscription details based on selected requestedPlan
  const handleOpenApproveModal = (customer) => {
    setSelectedApprovee(customer);
    const plan = customer.requestedPlan || "";
    if (plan.includes("30")) {
      setMealCount(30);
      setMealPrice(60);
      setValidityDays(30);
    } else if (plan.includes("90")) {
      setMealCount(90);
      setMealPrice(55.55);
      setValidityDays(45);
    } else {
      // Default to Monthly 56
      setMealCount(56);
      setMealPrice(57.14);
      setValidityDays(30);
    }
    setReminderCount(5);
  };

  const handleApprove = async () => {
    if (!selectedApprovee) return;
    setLoading(true);
    try {
      const res = await approveCustomerRegistration(selectedApprovee.id, {
        mealCount,
        mealPrice,
        validityDays,
        reminderCount
      });

      if (res.success) {
        toast.success(`Approved ${selectedApprovee.name || selectedApprovee.email} successfully!`);
        // Refresh local customers list
        setCustomers(prev => 
          prev.map(c => c.id === selectedApprovee.id ? { ...c, status: "ACTIVE" } : c)
        );
        setSelectedApprovee(null);
      } else {
        toast.error(res.error || "Failed to approve customer");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (customerId, name) => {
    if (!confirm(`Are you sure you want to reject ${name}?`)) return;
    setLoading(true);
    try {
      const res = await rejectCustomerRegistration(customerId);
      if (res.success) {
        toast.success(`Rejected and unlinked registration for ${name}.`);
        setCustomers(prev => prev.filter(c => c.id !== customerId));
      } else {
        toast.error(res.error || "Failed to reject registration");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (customerId, name) => {
    setLoading(true);
    try {
      const res = await suspendCustomer(customerId);
      if (res.success) {
        toast.success(`Suspended ${name} successfully.`);
        setCustomers(prev => 
          prev.map(c => c.id === customerId ? { ...c, status: "SUSPENDED" } : c)
        );
      } else {
        toast.error(res.error || "Failed to suspend customer");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (customerId, name) => {
    setLoading(true);
    try {
      const res = await activateCustomer(customerId);
      if (res.success) {
        toast.success(`Activated ${name} successfully.`);
        setCustomers(prev => 
          prev.map(c => c.id === customerId ? { ...c, status: "ACTIVE" } : c)
        );
      } else {
        toast.error(res.error || "Failed to activate customer");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customerId, name) => {
    if (!confirm(`Are you sure you want to remove ${name} from your mess? This will unlink their profile.`)) return;
    setLoading(true);
    try {
      const res = await deleteCustomer(customerId);
      if (res.success) {
        toast.success(`Removed ${name} successfully.`);
        setCustomers(prev => prev.filter(c => c.id !== customerId));
      } else {
        toast.error(res.error || "Failed to remove customer");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await manuallyAddCustomer(
        { name: addName, email: addEmail, phone: addPhone, paidImmediately },
        { mealCount: addMealCount, mealPrice: addMealPrice, validityDays: addValidityDays, reminderCount: addReminderCount }
      );

      if (res.success) {
        toast.success("Customer added manually and subscription created!");
        // Reset forms
        setAddName("");
        setAddEmail("");
        setAddPhone("");
        setPaidImmediately(false);
        setActiveTab("active");
        
        // Reload page since we need latest relations
        window.location.reload();
      } else {
        toast.error(res.error || "Failed to add customer");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
          <p className="text-muted-foreground">Manage approvals, active users, suspensions, and manual additions.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-card border p-1 rounded-lg">
          <TabsTrigger value="active" className="rounded-md">
            Active ({activeUsers.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-md">
            Pending Approvals ({pendingUsers.length})
          </TabsTrigger>
          <TabsTrigger value="suspended" className="rounded-md">
            Suspended ({suspendedUsers.length})
          </TabsTrigger>
          <TabsTrigger value="add" className="rounded-md gap-1">
            <Plus className="h-4 w-4" /> Add Customer
          </TabsTrigger>
        </TabsList>

        {/* ACTIVE CUSTOMERS */}
        <TabsContent value="active">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Active Customers</CardTitle>
              <CardDescription>Customers currently authorized to dine and scan QR codes.</CardDescription>
            </CardHeader>
            <CardContent>
              {activeUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No active customers found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Remaining Meals</TableHead>
                        <TableHead>Bill Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeUsers.map((cust) => {
                        const activeSub = cust.subscriptions?.[0];
                        const remaining = activeSub ? (activeSub.mealCount - activeSub.usedMeals) : 0;
                        const total = activeSub ? activeSub.mealCount : 0;
                        const latestBill = cust.bills?.[0];

                        return (
                          <TableRow key={cust.id}>
                            <TableCell className="font-semibold">{cust.name || "N/A"}</TableCell>
                            <TableCell>
                              <div className="text-xs text-muted-foreground">{cust.email}</div>
                              <div className="text-xs text-foreground font-medium">{cust.phone || "No Phone"}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-bold">
                                  {remaining} / {total}
                                </span>
                                <span className="text-xs text-muted-foreground">remaining</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {latestBill ? (
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  latestBill.status === "PAID" 
                                    ? "bg-green-50 text-green-700" 
                                    : latestBill.status === "PARTIAL" 
                                    ? "bg-amber-50 text-amber-700" 
                                    : "bg-red-50 text-red-700"
                                }`}>
                                  {latestBill.status}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">No invoices</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 border-amber-300 text-amber-700 hover:bg-amber-50"
                                onClick={() => handleSuspend(cust.id, cust.name)}
                                disabled={loading}
                              >
                                Suspend
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="h-8"
                                onClick={() => handleDelete(cust.id, cust.name)}
                                disabled={loading}
                              >
                                Remove
                              </Button>
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
        </TabsContent>

        {/* PENDING APPROVALS */}
        <TabsContent value="pending">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Pending Customer Approvals</CardTitle>
              <CardDescription>Verify and assign subscription plans to approving customers.</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No pending registration requests.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer Info</TableHead>
                        <TableHead>Requested Plan</TableHead>
                        <TableHead>Submitted Contact</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingUsers.map((cust) => (
                        <TableRow key={cust.id}>
                          <TableCell className="font-semibold">{cust.name || "N/A"}</TableCell>
                          <TableCell className="font-semibold text-indigo-600">{cust.requestedPlan || "Basic (30 Meals)"}</TableCell>
                          <TableCell>
                            <div className="text-xs text-muted-foreground">{cust.email}</div>
                            <div className="text-xs text-foreground font-medium">{cust.phone}</div>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              className="h-8 bg-green-600 hover:bg-green-700 text-white" 
                              size="sm"
                              onClick={() => handleOpenApproveModal(cust)}
                              disabled={loading}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="destructive" 
                              className="h-8"
                              size="sm"
                              onClick={() => handleReject(cust.id, cust.name)}
                              disabled={loading}
                            >
                              Reject
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SUSPENDED CUSTOMERS */}
        <TabsContent value="suspended">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Suspended or Inactive Customers</CardTitle>
              <CardDescription>Diners whose scanner access has been suspended or expired.</CardDescription>
            </CardHeader>
            <CardContent>
              {suspendedUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No suspended customers found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suspendedUsers.map((cust) => (
                        <TableRow key={cust.id}>
                          <TableCell className="font-semibold text-muted-foreground">{cust.name}</TableCell>
                          <TableCell>
                            <div className="text-xs text-muted-foreground">{cust.email}</div>
                            <div className="text-xs text-foreground font-medium">{cust.phone}</div>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                              {cust.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 border-green-300 text-green-700 hover:bg-green-50"
                              onClick={() => handleActivate(cust.id, cust.name)}
                              disabled={loading}
                            >
                              Re-activate
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="h-8"
                              onClick={() => handleDelete(cust.id, cust.name)}
                              disabled={loading}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* MANUALLY ADD CUSTOMER */}
        <TabsContent value="add">
          <Card className="shadow-md max-w-xl">
            <CardHeader>
              <CardTitle>Add Diner Manually</CardTitle>
              <CardDescription>Directly register a student or employee without they having to register online first.</CardDescription>
            </CardHeader>
            <form onSubmit={handleAddCustomer}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-name">Full Name</Label>
                    <Input 
                      id="add-name" 
                      required 
                      value={addName} 
                      onChange={(e) => setAddName(e.target.value)} 
                      placeholder="E.g. Rahul Patil" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-phone">Phone Number</Label>
                    <Input 
                      id="add-phone" 
                      required 
                      value={addPhone} 
                      onChange={(e) => setAddPhone(e.target.value)} 
                      placeholder="10-digit number" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-email">Email Address</Label>
                  <Input 
                    id="add-email" 
                    type="email" 
                    required 
                    value={addEmail} 
                    onChange={(e) => setAddEmail(e.target.value)} 
                    placeholder="email@example.com" 
                  />
                </div>

                <div className="border-t pt-4 mt-2">
                  <h4 className="text-sm font-semibold mb-3 text-indigo-600">Assign Subscription Plan</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="add-meals">Meal Count</Label>
                      <Input 
                        id="add-meals" 
                        type="number" 
                        required 
                        value={addMealCount} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setAddMealCount(val);
                        }} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-price">Price Per Meal (₹)</Label>
                      <Input 
                        id="add-price" 
                        type="number" 
                        step="0.01" 
                        required 
                        value={addMealPrice} 
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setAddMealPrice(val);
                        }} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="space-y-2">
                      <Label htmlFor="add-validity">Validity (Days)</Label>
                      <Input 
                        id="add-validity" 
                        type="number" 
                        required 
                        value={addValidityDays} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setAddValidityDays(val);
                        }} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-reminder">Low Meals Alert Threshold</Label>
                      <Input 
                        id="add-reminder" 
                        type="number" 
                        required 
                        value={addReminderCount} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setAddReminderCount(val);
                        }} 
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <input 
                      id="paid-immediately" 
                      type="checkbox" 
                      checked={paidImmediately}
                      onChange={(e) => setPaidImmediately(e.target.checked)}
                      className="rounded border-input text-indigo-600 focus:ring-indigo-500 h-4 w-4" 
                    />
                    <Label htmlFor="paid-immediately" className="cursor-pointer text-sm">
                      Mark subscription invoice as **PAID** immediately (Cash/UPI received upfront)
                    </Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
                  {loading ? "Adding Diner..." : "Add Diner & Activate Plan"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      {/* APPROVAL DIALOG MODAL */}
      <Dialog open={selectedApprovee !== null} onOpenChange={(open) => !open && setSelectedApprovee(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Diner Registration</DialogTitle>
            <DialogDescription>
              Assign a subscription plan and generate an invoice for **{selectedApprovee?.name || selectedApprovee?.email}**.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-indigo-50 p-3 text-xs text-indigo-800 font-medium">
              Requested Plan: <span className="font-bold underline">{selectedApprovee?.requestedPlan || "Basic (30 Meals)"}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modal-meals">Meal Count</Label>
                <Input 
                  id="modal-meals" 
                  type="number" 
                  value={mealCount} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setMealCount(val);
                  }} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-price">Price Per Meal (₹)</Label>
                <Input 
                  id="modal-price" 
                  type="number" 
                  step="0.01" 
                  value={mealPrice} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setMealPrice(val);
                  }} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modal-validity">Validity (Days)</Label>
                <Input 
                  id="modal-validity" 
                  type="number" 
                  value={validityDays} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setValidityDays(val);
                  }} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-reminder">Low Meal Warning Threshold</Label>
                <Input 
                  id="modal-reminder" 
                  type="number" 
                  value={reminderCount} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setReminderCount(val);
                  }} 
                />
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3 text-xs">
              <div className="flex justify-between font-semibold">
                <span>Total Invoice Amount:</span>
                <span className="text-indigo-600 text-sm">₹{(mealCount * mealPrice).toFixed(2)}</span>
              </div>
              <p className="text-muted-foreground mt-1 text-[10px]">
                This will generate an UNPAID invoice. Diner can view and pay this upon approval.
              </p>
            </div>
          </div>

          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="ghost" onClick={() => setSelectedApprovee(null)} disabled={loading}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white font-medium" onClick={handleApprove} disabled={loading}>
              {loading ? "Approving..." : "Confirm & Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
