# 📋 Mess-QR: Smart Mess Management System — Project Plan (Updated Version)

> **Note for the agent:** This document is the full project specification. It is written so an AI coding agent can build the system end-to-end. All original requirements are preserved. One new requirement has been added throughout the document: **customer profile creation now requires admin verification before the account becomes active.** See the highlighted **[NEW — Admin Approval Flow]** sections below; do not skip or simplify them.

---

## 1. Project Overview

### Project Name
**Mess-QR: Smart Mess Management System**

### Objective
Develop a complete digital mess management system where registered users scan a **Universal QR Code** before taking their meal. The system automatically deducts meals from their subscription, manages billing, sends reminders, allows customizable meal plans, and provides complete dashboards for both the admin and customers.

---

## 2. Problem Statement

Traditional mess management involves manual attendance, handwritten registers, manual billing, and payment tracking, which often results in:

- Manual meal tracking
- Billing errors
- Difficulty managing subscriptions
- No transparency for customers
- Manual payment reminders
- Difficult report generation
- No digital menu system

The proposed system automates the complete workflow from customer registration to billing and meal tracking.

---

## 3. Project Goals

### Primary Goals
- QR-based meal attendance
- Automatic meal deduction
- Digital billing system
- Subscription management
- Payment tracking
- User dashboard
- Admin dashboard
- Weekly/Daily menu management
- Automated reminders
- **[NEW] Admin-verified customer onboarding** — no customer profile goes live without admin approval

### Secondary Goals
- Fraud prevention
- Faster meal verification
- Paperless operations
- Mobile-friendly PWA
- Customizable subscription plans

---

## 4. User Roles

### A. Admin (Mess Owner)

#### Authentication
- Secure Login
- Forgot Password
- Change Password

#### User Management
Admin can:
- Add Customer
- Edit Customer
- Delete Customer
- Suspend Customer
- Activate Customer
- Reset Password
- **[NEW] Review Pending Registration Requests**
- **[NEW] Approve Registration Request** (creates active customer account)
- **[NEW] Reject Registration Request** (with optional reason sent back to applicant)
- **[NEW] View Registration Request Details** (name, email, phone, submitted documents/info)

#### Subscription Management
Admin can:
- Create Custom Subscription Plans
- Sell Any Number of Thalis
- Set Custom Charges
- Set Subscription Validity
- Add Extra Meals
- Extend Subscription
- Renew Subscription

**Example Plans**

| Plan    | Meals     | Amount     |
|---------|-----------|------------|
| Basic   | 30        | ₹1800      |
| Monthly | 56        | ₹3200      |
| Premium | 90        | ₹5000      |
| Custom  | Any Count | Any Amount |

#### Reminder Settings
Admin can configure:
- Reminder after remaining **2 meals**
- Reminder after remaining **5 meals**
- Reminder after remaining **10 meals**
- Custom reminder count

**Example**
```
Reminder Trigger

Remaining Meals = 5
OR
Used Meals = 51 (Out of 56)
```
The reminder count is completely configurable.

#### Billing & Invoice Management (NEW)
Admin can:
- Create Bills
- Generate Invoice
- Add Custom Charges
- Add GST (Optional)
- Add Discounts
- Add Extra Charges
- Add Notes
- Mark Bill as Paid
- Mark Bill as Partially Paid
- Mark Bill as Unpaid
- Download Invoice PDF
- Send Invoice via Email
- Send Invoice via WhatsApp

**Bill Example**
```
Customer
Rahul Patil
--------------------------
56 Meal Package     ₹3200
Extra Tiffin        ₹150
Late Fee            ₹100
Discount           -₹100
--------------------------
Total               ₹3350
```

#### Menu Management (NEW)
Menu section is **Optional**. Admin can enable or disable the menu feature.

If enabled, Admin can choose:

**Weekly Menu**
- Monday
- Tuesday
- Wednesday
- Thursday
- Friday
- Saturday
- Sunday

OR

**Daily Menu** — Admin can simply add today's menu.

**Example**
```
Today's Menu
Rice
Dal Fry
Chapati
Paneer Masala
Salad
Sweet
```

Admin can:
- Add Menu
- Edit Menu
- Delete Menu
- Schedule Menu
- Copy Previous Menu

#### Dashboard
Admin Dashboard shows:
- Total Customers
- Active Customers
- Expired Customers
- **[NEW] Pending Registration Requests (count + quick-approve list)**
- Total Revenue
- Pending Bills
- Paid Bills
- Remaining Payments
- Today's Meals
- Monthly Meals
- Subscription Expiry
- Recent QR Scans

**Charts**
- Revenue
- Meal Consumption
- Customer Growth
- Subscription Statistics

#### Reports
Admin can generate:
- Customer Report
- Revenue Report
- Meal Report
- Subscription Report
- Payment Report
- QR Scan Report
- **[NEW] Registration Requests Report** (approved / rejected / pending, with timestamps and approving admin)

**Export**
- PDF
- Excel

---

### B. Customer

#### Authentication
- **[NEW] Create Profile / Register** — submits a registration request; account is **not active** until admin approves (see §4.C below)
- **[NEW] View "Pending Approval" status screen** — shown after registering, while awaiting admin decision
- Login *(only available after admin approval)*
- Forgot Password
- Change Password

#### Dashboard
Customer can view:
- Remaining Meals
- Used Meals
- Total Purchased Meals
- Subscription Status
- Expiry Date
- Recent Meals

**Progress Bar**
```
Remaining
34 / 56 Meals
```

#### QR Scan
Customer can:
- Scan Universal QR
- Confirm Meal
- Meal Deducted
- Success Message

#### Meal History
Customer can see:
- Date
- Time
- Meal Type

#### Billing Section (NEW)
Customer can view **All Bills**:
- Paid Bills
- Pending Bills
- Partially Paid Bills

Customer can also see:
- Invoice Number
- Amount
- Due Date
- Paid Amount
- Remaining Amount
- Payment Status

**Example**
```
Invoice
INV-1005
Total       ₹3200
Paid        ₹2000
Remaining   ₹1200
Status      Partial
```

Customer can:
- Download Invoice
- View Invoice PDF

#### Menu Section (NEW)
If admin has enabled the menu, customer can see **Weekly Menu** or **Today's Menu**.

**Example**
```
Monday
Rice
Dal
Chapati
Paneer
Salad
```

#### Notifications
Customer receives:
- Remaining Meal Reminder
- Subscription Expiry
- Bill Generated
- Bill Paid Confirmation
- Payment Reminder
- New Menu Available
- Subscription Renewal Reminder
- **[NEW] Registration Approved** notification
- **[NEW] Registration Rejected** notification (with reason, if provided)

**Notification Channels**
- WhatsApp
- Email
- In-App Notification

---

### C. [NEW] Registration / Admin Approval Flow

This is the new addition to the system. It sits in front of customer account creation.

**Flow**
```
User fills "Create Profile" form
        ↓
Request saved as PENDING (not a live account yet)
        ↓
Admin notified of new pending request
        ↓
Admin reviews details (name, email, phone, any submitted info)
        ↓
   ┌────────────┴────────────┐
   ↓                         ↓
Admin APPROVES           Admin REJECTS
   ↓                         ↓
Customer account          Applicant notified
created & activated       of rejection (+ optional reason)
   ↓
Customer notified
(Email / WhatsApp / In-App)
   ↓
Customer can now Login
```

**Rules**
- A registration request cannot log in or access any customer dashboard/QR features while in `pending` status.
- Only one admin identity exists in this system (the mess owner) and all approvals/rejections route to that admin.
- Admin can approve/reject individually, and should be able to see a queue of all pending requests.
- Rejected applicants may be allowed to resubmit (configurable) — flag this as an open decision for the admin to confirm during build.
- All approve/reject actions are logged with timestamp and admin identity for audit purposes.

---

## 5. Functional Requirements

### Authentication Module
- Admin Login
- Customer Login *(blocked until profile approved — see registration flow)*
- **[NEW] Customer Registration Request submission**
- **[NEW] Admin Approve/Reject Registration endpoint**
- JWT Authentication
- Role Based Access

### QR Module
**Universal QR**
```
https://messqr.com/scan
```

**Flow**
```
Scan QR
   ↓
Login
   ↓
Confirm Meal
   ↓
Meal Deducted
   ↓
History Updated
   ↓
Dashboard Updated
```

### Meal Deduction Rules
Admin defines the countdown logic:
```
Purchased Meals
   ↓
   80
   ↓
   79
   ↓
   78
   ↓
   ...
```
The system supports **any meal count**, not only 56.

### Duplicate Scan Prevention
Admin Settings:
```
One Scan Every 3 Hours
OR
Lunch Once
Dinner Once
OR
Custom Time
```

### Billing Module
```
Admin creates bill
   ↓
Bill stored
   ↓
Customer notified
   ↓
Customer views bill
   ↓
Admin updates payment
   ↓
Customer sees remaining balance
```

### Menu Module
```
Admin chooses
Weekly Menu
OR
Daily Menu
OR
Disable Menu
```
Customers only see menu if enabled.

### [NEW] Registration Approval Module
```
Customer submits registration request
   ↓
Request stored with status = "pending"
   ↓
Admin dashboard/notification shows new pending request
   ↓
Admin approves → status = "approved" → User record activated
        OR
Admin rejects  → status = "rejected" → Applicant notified with reason
```

---

## 6. Database Design

### User Table
```
id
name
email
phone
password
totalMeals
usedMeals
remainingMeals
subscriptionStart
subscriptionEnd
status              // active / suspended / expired
```

### [NEW] Registration Requests Table
```
id
name
email
phone
requestedPlan          // optional, if user selects a plan at signup
status                 // pending / approved / rejected
submittedAt
reviewedAt
reviewedBy             // adminId
rejectionReason         // nullable
linkedUserId            // set once approved and User record is created
```

### Subscription Table
```
id
userId
mealCount
mealPrice
totalAmount
validity
reminderCount
status
```

### Meal Log Table
```
id
userId
mealType
date
time
device
ipAddress
```

### Bills Table (NEW)
```
id
invoiceNumber
userId
totalAmount
paidAmount
remainingAmount
discount
extraCharges
gst
status
dueDate
createdAt
```

### Payments Table
```
id
billId
amount
paymentMethod
transactionId
paymentDate
```

### Menu Table (NEW)
```
id
type              // Weekly / Daily
day
date
title
description
status
createdBy
updatedAt
```

### Notification Table
```
id
userId
type
message
status
sentAt
```

---

## 7. Recommended Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- ShadCN UI
- React Hook Form
- PWA

### Backend
- Next.js API / Express.js
- Prisma ORM
- JWT Authentication

### Database
- PostgreSQL

### QR
- `qrcode` npm package

### Authentication
- Clerk / NextAuth

### Notifications
**Email**
- Nodemailer
- SendGrid

**WhatsApp**
- Twilio
- UltraMsg
- Green API

### PDF Invoice
- React PDF
- PDFKit

### Deployment
- **Frontend:** Vercel
- **Backend:** Railway / Render
- **Database:** Neon PostgreSQL

---

## 8. Development Roadmap

### Week 1
- Requirement Analysis
- UI Design
- Database Design
- Authentication
- User Roles
- **[NEW] Design registration-request schema & admin approval UI**

### Week 2
- Customer Management
- Subscription Module
- Custom Meal Plans
- QR Module
- **[NEW] Build registration request submission + pending-status screen**

### Week 3
- Admin Dashboard
- Customer Dashboard
- Billing Module
- Invoice PDF Generation
- Payment Tracking
- **[NEW] Build admin approve/reject workflow + notifications**

### Week 4
- Menu Module
- Daily Menu
- Weekly Menu
- Reminder Configuration
- WhatsApp Integration
- Email Integration

### Week 5
- Reports
- Excel Export
- PDF Export
- Security Testing
- Load Testing
- Deployment

---

## 9. Future Enhancements

- Online Payment Gateway (UPI, Razorpay, Stripe)
- Auto Payment Receipts
- Multiple Mess Branch Management
- Multi-Admin Support
- Face Recognition Check-in
- NFC/RFID Meal Verification
- AI-Based Meal Consumption Analytics
- Student Attendance Reports
- Diet Preference Menus (Veg/Jain/Non-Veg)
- Feedback & Rating System
- Mobile Apps (Android & iOS)
- Offline QR Scan Sync
- Geofencing for On-Premises QR Validation
- Coupon & Referral System
- Wallet and Advance Balance Management

---

## 10. Success Criteria

The project will be considered successful when:

- ✅ Admins can create flexible subscription plans with any number of meals, custom pricing, validity periods, and configurable reminder thresholds.
- ✅ Customers can scan a Universal QR code to consume meals, with secure duplicate-scan prevention.
- ✅ Admins can generate, send, and manage invoices, while customers can view paid, unpaid, and partially paid bills along with downloadable invoice PDFs.
- ✅ Weekly or daily menus can be optionally published by the admin and viewed by customers.
- ✅ Automated reminders are delivered via WhatsApp, email, and in-app notifications for low meal balance, bill due dates, and subscription renewals.
- ✅ Comprehensive dashboards, analytics, and exportable reports are available for effective mess management.
- ✅ The application is secure, responsive, scalable, and deployable as a Progressive Web App (PWA), making it accessible from any modern mobile device or desktop browser.
- ✅ **[NEW]** No customer profile becomes active without explicit admin approval — every "Create Profile" request is routed to a pending queue that only the admin can approve or reject, and customers cannot log in or use any feature until approved.
