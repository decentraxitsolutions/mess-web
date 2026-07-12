"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";

export async function getBusinessBills() {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const business = await db.business.findUnique({
      where: { ownerId: user.id }
    });
    if (!business) throw new Error("Business not found");

    const bills = await db.bill.findMany({
      where: { businessId: business.id },
      include: {
        user: true,
        payments: true
      },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, bills };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function createCustomBill(data) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const business = await db.business.findUnique({
      where: { ownerId: user.id }
    });
    if (!business) throw new Error("Business not found");

    const customerId = data.userId;
    const baseAmount = parseFloat(data.amount);
    const extraCharges = parseFloat(data.extraCharges || 0);
    const discount = parseFloat(data.discount || 0);
    const gst = parseFloat(data.gst || 0);

    const totalAmount = baseAmount + extraCharges + gst - discount;

    const billCount = await db.bill.count();
    const invoiceNumber = `INV-${1000 + billCount + 1}`;

    const bill = await db.bill.create({
      data: {
        invoiceNumber,
        userId: customerId,
        businessId: business.id,
        totalAmount,
        paidAmount: 0,
        remainingAmount: totalAmount,
        discount,
        extraCharges,
        gst,
        status: "UNPAID",
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    // Notify customer
    await db.notification.create({
      data: {
        userId: customerId,
        type: "BILL",
        message: `New bill ${invoiceNumber} generated for ₹${totalAmount}. Due date: ${bill.dueDate.toLocaleDateString()}.`,
        status: "UNREAD"
      }
    });

    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard");
    return { success: true, bill };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function recordBillPayment(billId, paymentDetails) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CLIENT_ADMIN") throw new Error("Unauthorized");

    const bill = await db.bill.findUnique({
      where: { id: billId }
    });
    if (!bill) throw new Error("Bill not found");

    const paymentAmount = parseFloat(paymentDetails.amount);
    if (paymentAmount <= 0) throw new Error("Amount must be greater than zero");
    if (paymentAmount > bill.remainingAmount) throw new Error("Amount exceeds remaining due balance");

    // 1. Create Payment record
    await db.payment.create({
      data: {
        billId,
        amount: paymentAmount,
        paymentMethod: paymentDetails.paymentMethod, // CASH, UPI, BANK_TRANSFER
        transactionId: paymentDetails.transactionId || null
      }
    });

    // 2. Update Bill details
    const newPaidAmount = bill.paidAmount + paymentAmount;
    const newRemainingAmount = bill.remainingAmount - paymentAmount;
    let status = "PARTIAL";
    if (newRemainingAmount <= 0) {
      status = "PAID";
    }

    await db.bill.update({
      where: { id: billId },
      data: {
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        status
      }
    });

    // 3. Notify customer
    await db.notification.create({
      data: {
        userId: bill.userId,
        type: "BILL",
        message: `Payment of ₹${paymentAmount} recorded for bill ${bill.invoiceNumber}. Remaining balance: ₹${newRemainingAmount}.`,
        status: "UNREAD"
      }
    });

    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getCustomerBills() {
  try {
    const user = await checkUser();
    if (!user || user.role !== "CUSTOMER") throw new Error("Unauthorized");

    const bills = await db.bill.findMany({
      where: { userId: user.id },
      include: {
        user: true,
        payments: true
      },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, bills };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
