"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Receipt, FileText, Printer, ShieldAlert } from "lucide-react";

export default function BillingClient({ initialBills }) {
  const [bills, setBills] = useState(initialBills);
  const [selectedBillForPrint, setSelectedBillForPrint] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Invoices & Payments</h1>
        <p className="text-muted-foreground">View package fees, verify transaction payments, and print invoice receipts.</p>
      </div>

      <Card className="shadow-md bg-card">
        <CardHeader>
          <CardTitle>Invoices Ledger</CardTitle>
          <CardDescription>Records of your subscription billings.</CardDescription>
        </CardHeader>
        <CardContent>
          {bills.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl">
              <Receipt className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <h3 className="font-bold text-lg">No Invoices Found</h3>
              <p className="text-muted-foreground text-sm">Your bills will appear here once assigned by the Mess Owner.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Charge Amount</TableHead>
                    <TableHead>Amount Paid</TableHead>
                    <TableHead>Due Balance</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-mono font-bold text-indigo-600">{bill.invoiceNumber}</TableCell>
                      <TableCell className="font-semibold">₹{bill.totalAmount}</TableCell>
                      <TableCell className="text-emerald-600 font-semibold">₹{bill.paidAmount}</TableCell>
                      <TableCell className="text-amber-600 font-semibold">₹{bill.remainingAmount}</TableCell>
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
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                          onClick={() => setSelectedBillForPrint(bill)}
                        >
                          <FileText className="h-4 w-4 mr-1" /> View Invoice
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
