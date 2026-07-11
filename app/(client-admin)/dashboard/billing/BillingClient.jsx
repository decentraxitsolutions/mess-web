"use client";

import { useState } from "react";
import { createCustomBill, recordBillPayment } from "@/actions/billing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, Plus, DollarSign, CreditCard, Clock, Printer, FileText } from "lucide-react";
import { toast } from "sonner";

export default function BillingClient({ initialBills, activeCustomers }) {
  const [bills, setBills] = useState(initialBills);
  const [activeTab, setActiveTab] = useState("invoices");
  const [loading, setLoading] = useState(false);

  // Custom Bill Form States
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [extraCharges, setExtraCharges] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [gst, setGst] = useState("0");
  const [dueDate, setDueDate] = useState("");

  // Record Payment Modal States
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [transactionId, setTransactionId] = useState("");

  // Invoice Print View State
  const [selectedBillForPrint, setSelectedBillForPrint] = useState(null);

  const handleCreateBill = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      toast.error("Please select a diner.");
      return;
    }
    setLoading(true);
    try {
      const res = await createCustomBill({
        userId: selectedCustomerId,
        amount: parseFloat(billAmount),
        extraCharges: parseFloat(extraCharges || 0),
        discount: parseFloat(discount || 0),
        gst: parseFloat(gst || 0),
        dueDate
      });

      if (res.success) {
        toast.success(`Invoice ${res.bill.invoiceNumber} created successfully!`);
        // Reload or update list
        window.location.reload();
      } else {
        toast.error(res.error || "Failed to create invoice");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPaymentModal = (bill) => {
    setSelectedBillForPayment(bill);
    setPayAmount(bill.remainingAmount.toString());
  };

  const handleRecordPayment = async () => {
    if (!selectedBillForPayment) return;
    setLoading(true);
    try {
      const res = await recordBillPayment(selectedBillForPayment.id, {
        amount: parseFloat(payAmount),
        paymentMethod,
        transactionId
      });

      if (res.success) {
        toast.success("Payment recorded successfully!");
        setSelectedBillForPayment(null);
        setPayAmount("");
        setTransactionId("");
        
        // Reload page to refresh calculations
        window.location.reload();
      } else {
        toast.error(res.error || "Failed to record payment");
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
          <h1 className="text-3xl font-bold tracking-tight">Billing & Invoices</h1>
          <p className="text-muted-foreground">Manage invoices, collect outstanding payments, and record transactions.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-card border p-1 rounded-lg">
          <TabsTrigger value="invoices" className="rounded-md">All Invoices ({bills.length})</TabsTrigger>
          <TabsTrigger value="create" className="rounded-md gap-1">
            <Plus className="h-4 w-4" /> Create Custom Bill
          </TabsTrigger>
        </TabsList>

        {/* LIST INVOICES */}
        <TabsContent value="invoices">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Invoices Ledger</CardTitle>
              <CardDescription>Comprehensive record of all diner billing history.</CardDescription>
            </CardHeader>
            <CardContent>
              {bills.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                  <Receipt className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <h3 className="font-bold text-lg">No Invoices Found</h3>
                  <p className="text-muted-foreground text-sm">Create a custom bill or assign a subscription to generate invoices.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Diner</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Paid Balance</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bills.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell className="font-mono font-bold text-indigo-600">{bill.invoiceNumber}</TableCell>
                          <TableCell>
                            <div className="font-semibold">{bill.user.name}</div>
                            <div className="text-[10px] text-muted-foreground">{bill.user.email}</div>
                          </TableCell>
                          <TableCell className="font-semibold">₹{bill.totalAmount}</TableCell>
                          <TableCell>
                            <div className="text-xs font-semibold text-emerald-600">Paid: ₹{bill.paidAmount}</div>
                            <div className="text-[10px] text-amber-600">Remaining: ₹{bill.remainingAmount}</div>
                          </TableCell>
                          <TableCell className="text-xs">
                            {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              bill.status === "PAID" 
                                ? "bg-green-50 text-green-700" 
                                : bill.status === "PARTIAL" 
                                ? "bg-amber-50 text-amber-700" 
                                : "bg-red-50 text-red-700"
                            }`}>
                              {bill.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                              onClick={() => setSelectedBillForPrint(bill)}
                            >
                              <FileText className="h-4 w-4" /> Invoice
                            </Button>
                            {bill.status !== "PAID" && (
                              <Button 
                                size="sm" 
                                className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                onClick={() => handleOpenPaymentModal(bill)}
                                disabled={loading}
                              >
                                Record Payment
                              </Button>
                            )}
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

        {/* CREATE CUSTOM BILL */}
        <TabsContent value="create">
          <Card className="shadow-md max-w-xl">
            <CardHeader>
              <CardTitle>Generate Custom Invoice</CardTitle>
              <CardDescription>Generate a bill for custom expenses (e.g. extra meals, special events, guest entry).</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateBill}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bill-customer">Select Diner</Label>
                  <select
                    id="bill-customer"
                    required
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
                  >
                    <option value="">-- Choose Diner --</option>
                    {activeCustomers.map((cust) => (
                      <option key={cust.id} value={cust.id}>
                        {cust.name} ({cust.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bill-base">Base Amount (₹)</Label>
                    <Input 
                      id="bill-base" 
                      type="number" 
                      required 
                      value={billAmount} 
                      onChange={(e) => setBillAmount(e.target.value)} 
                      placeholder="E.g. 500" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bill-due">Due Date</Label>
                    <Input 
                      id="bill-due" 
                      type="date" 
                      required 
                      value={dueDate} 
                      onChange={(e) => setDueDate(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 border-t pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="bill-gst">GST (₹)</Label>
                    <Input 
                      id="bill-gst" 
                      type="number" 
                      value={gst} 
                      onChange={(e) => setGst(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bill-extra">Extra Charges (₹)</Label>
                    <Input 
                      id="bill-extra" 
                      type="number" 
                      value={extraCharges} 
                      onChange={(e) => setExtraCharges(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bill-discount">Discount (₹)</Label>
                    <Input 
                      id="bill-discount" 
                      type="number" 
                      value={discount} 
                      onChange={(e) => setDiscount(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs flex justify-between items-center mt-2">
                  <span className="font-semibold text-indigo-900">Total Calculated Invoice:</span>
                  <span className="font-mono font-bold text-indigo-700 text-lg">
                    ₹{((parseFloat(billAmount || 0) + parseFloat(extraCharges || 0) + parseFloat(gst || 0)) - parseFloat(discount || 0)).toFixed(2)}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-4 border-t gap-2">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium" disabled={loading}>
                  {loading ? "Generating..." : "Generate Invoice"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      {/* RECORD PAYMENT MODAL */}
      <Dialog open={selectedBillForPayment !== null} onOpenChange={(open) => !open && setSelectedBillForPayment(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Diner Payment</DialogTitle>
            <DialogDescription>
              Log manual payments received from **{selectedBillForPayment?.user.name}**.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-muted-foreground">Invoice Reference:</span>
              <span className="font-mono font-bold text-indigo-600">{selectedBillForPayment?.invoiceNumber}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-muted-foreground">Total Dues Outstanding:</span>
              <span className="font-semibold text-amber-600 text-sm">₹{selectedBillForPayment?.remainingAmount}</span>
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="pay-amount">Payment Amount Received (₹)</Label>
              <Input 
                id="pay-amount" 
                type="number" 
                value={payAmount} 
                onChange={(e) => setPayAmount(e.target.value)} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pay-method">Payment Method</Label>
                <select
                  id="pay-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
                >
                  <option value="CASH">CASH</option>
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="BANK_TRANSFER">BANK TRANSFER</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pay-txid">Transaction ID (Optional)</Label>
                <Input 
                  id="pay-txid" 
                  value={transactionId} 
                  onChange={(e) => setTransactionId(e.target.value)} 
                  placeholder="E.g. Ref #12345"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="ghost" onClick={() => setSelectedBillForPayment(null)} disabled={loading}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium" onClick={handleRecordPayment} disabled={loading}>
              {loading ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PRINT PREVIEW INVOICE MODAL */}
      <Dialog open={selectedBillForPrint !== null} onOpenChange={(open) => !open && setSelectedBillForPrint(null)}>
        <DialogContent className="sm:max-w-2xl bg-white text-black p-8 rounded-xl print:p-0 print:border-none print:shadow-none">
          {selectedBillForPrint && (
            <div className="space-y-6">
              {/* Invoice Banner */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-indigo-700 uppercase">INVOICE</h2>
                  <p className="text-xs text-muted-foreground mt-1">Invoice Number: <span className="font-mono font-bold text-black">{selectedBillForPrint.invoiceNumber}</span></p>
                  <p className="text-xs text-muted-foreground">Date: {new Date(selectedBillForPrint.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-sm">MessApp Operations</h3>
                  <p className="text-xs text-muted-foreground">Premium dining management</p>
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-semibold uppercase text-muted-foreground tracking-wider mb-1">Billed To:</h4>
                  <p className="font-bold text-sm">{selectedBillForPrint.user.name}</p>
                  <p className="text-muted-foreground">{selectedBillForPrint.user.email}</p>
                  <p className="text-muted-foreground">{selectedBillForPrint.user.phone}</p>
                </div>
                <div className="text-right">
                  <h4 className="font-semibold uppercase text-muted-foreground tracking-wider mb-1">Payment Status:</h4>
                  <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold ${
                    selectedBillForPrint.status === "PAID" 
                      ? "bg-green-100 text-green-800" 
                      : selectedBillForPrint.status === "PARTIAL" 
                      ? "bg-amber-100 text-amber-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {selectedBillForPrint.status}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-1.5">Due Date: {selectedBillForPrint.dueDate ? new Date(selectedBillForPrint.dueDate).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>

              {/* Bill Details Table */}
              <table className="w-full border-collapse text-xs mt-6">
                <thead>
                  <tr className="border-b-2 border-black bg-neutral-50 font-bold">
                    <th className="py-2 text-left">Description</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2.5">
                      <p className="font-bold">Mess Subscription package</p>
                      <p className="text-[10px] text-muted-foreground">Standard meals assignment</p>
                    </td>
                    <td className="py-2.5 text-right font-semibold">₹{(selectedBillForPrint.totalAmount + selectedBillForPrint.discount - selectedBillForPrint.extraCharges - selectedBillForPrint.gst).toFixed(2)}</td>
                  </tr>
                  {selectedBillForPrint.gst > 0 && (
                    <tr className="border-b text-[11px]">
                      <td className="py-1.5 text-muted-foreground">Taxes & GST</td>
                      <td className="py-1.5 text-right">₹{selectedBillForPrint.gst}</td>
                    </tr>
                  )}
                  {selectedBillForPrint.extraCharges > 0 && (
                    <tr className="border-b text-[11px]">
                      <td className="py-1.5 text-muted-foreground">Additional Service Charges</td>
                      <td className="py-1.5 text-right">₹{selectedBillForPrint.extraCharges}</td>
                    </tr>
                  )}
                  {selectedBillForPrint.discount > 0 && (
                    <tr className="border-b text-[11px] text-red-600">
                      <td className="py-1.5">Discount Offer Applied</td>
                      <td className="py-1.5 text-right">-₹{selectedBillForPrint.discount}</td>
                    </tr>
                  )}
                  <tr className="font-bold text-sm bg-neutral-50">
                    <td className="py-2.5 px-2">Grand Total:</td>
                    <td className="py-2.5 px-2 text-right text-indigo-700">₹{selectedBillForPrint.totalAmount}</td>
                  </tr>
                </tbody>
              </table>

              {/* Payments History */}
              {selectedBillForPrint.payments.length > 0 && (
                <div className="space-y-2 border-t pt-4 text-xs">
                  <h4 className="font-bold text-neutral-800">Transaction Payments Log:</h4>
                  <div className="space-y-1">
                    {selectedBillForPrint.payments.map((pm, idx) => (
                      <div key={pm.id} className="flex justify-between items-center text-[11px] border-b pb-1">
                        <span className="text-muted-foreground">
                          Payment #{idx+1} ({pm.paymentMethod} {pm.transactionId ? `[TXID: ${pm.transactionId}]` : ""}) - {new Date(pm.paymentDate).toLocaleDateString()}
                        </span>
                        <span className="font-semibold text-emerald-600">+₹{pm.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Dues summary block */}
              <div className="flex justify-between items-center border-t pt-4 text-xs font-semibold bg-neutral-50 p-3 rounded-lg">
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-[10px]">TOTAL COLLECTED BALANCE</p>
                  <p className="text-emerald-700 text-base font-bold">₹{selectedBillForPrint.paidAmount}</p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-muted-foreground text-[10px]">NET DUES OUTSTANDING</p>
                  <p className="text-amber-700 text-base font-bold">₹{selectedBillForPrint.remainingAmount}</p>
                </div>
              </div>

              {/* Print Footer buttons */}
              <div className="flex justify-end gap-2 pt-6 border-t print:hidden">
                <Button variant="ghost" onClick={() => setSelectedBillForPrint(null)}>
                  Close
                </Button>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium gap-1.5"
                  onClick={() => window.print()}
                >
                  <Printer className="h-4 w-4" /> Print Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
