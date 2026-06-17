# Sanjay Medical — Pharmacy Management System
## Complete User Guide & Feature Documentation

**Pharmacy:** Sanjay Medical, Horizon Chowk, Butwal, Rupandehi, Nepal  
**System Version:** 1.0  
**Currency:** NPR (Nepalese Rupee)

---

## Table of Contents

1. [Getting Started / Login](#1-getting-started--login)
2. [Dashboard](#2-dashboard)
3. [Billing / POS](#3-billing--pos)
4. [Medicines (Inventory)](#4-medicines-inventory)
5. [Expiry Alerts](#5-expiry-alerts)
6. [Sales History](#6-sales-history)
7. [Purchases](#7-purchases)
8. [Suppliers](#8-suppliers)
9. [Customers](#9-customers)
10. [Analytics](#10-analytics)
11. [User Roles](#11-user-roles)
12. [Common Workflows](#12-common-workflows)

---

## 1. Getting Started / Login

### How to Access
Open the app URL in any web browser (Chrome, Firefox, Safari) on a computer or mobile phone. No app installation needed.

### Login
| Field | What to Enter |
|---|---|
| Username | Your assigned username |
| Password | Your assigned password |

### Default Credentials
| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Cashier | `cashier` | `cashier123` |

> **Note:** Change these passwords after first use for security.

### Session
Once logged in, you stay logged in until you click **Sign Out** from the top-right menu. Closing the browser tab does not log you out.

---

## 2. Dashboard

The Dashboard is the **home screen** that gives a live overview of the pharmacy's performance. It loads automatically after login.

### KPI Cards (Top Row)

| Card | What It Shows |
|---|---|
| **Today's Revenue** | Total sales amount collected today (NPR) |
| **Today's Profit** | Estimated profit from today's sales (selling price minus purchase price) |
| **Total Medicines** | Number of distinct medicine entries in inventory |
| **Inventory Value** | Total value of all stock at purchase price |

### Alert Cards (Second Row)

These cards are **clickable** — clicking them takes you directly to the relevant page to fix the problem.

| Card | What It Shows | Action |
|---|---|---|
| **Low Stock Items** | Count of medicines where stock has fallen below the reorder level | Click to go to Inventory |
| **Expiring / Expired** | Count of medicines expiring within 90 days or already expired | Click to go to Expiry Alerts |

### Period Summary Panel

Shows three time periods side by side:
- **This Week** — total sales for the current week (Monday to today)
- **This Month** — total sales for the current calendar month
- Three mini tiles showing: Expiring Soon count, Expired count, Low Stock count

### Top Selling Medicines

Lists the best-performing medicines ranked by revenue. Each entry shows:
- Rank number
- Medicine name
- A proportional bar showing performance relative to the top seller
- Units sold
- Total revenue earned

---

## 3. Billing / POS

The Billing page is the **Point of Sale** counter used by cashiers for every sale. It is designed for speed.

### Making a Sale — Step by Step

1. **Search for a medicine** — type the name in the search box. Results appear instantly.
2. **Add to cart** — click the medicine row or the **+** button. It appears in the cart on the right.
3. **Adjust quantity** — use the **−** and **+** buttons in the cart, or type the number directly.
4. **Remove an item** — click the trash icon next to the item in the cart.
5. **Apply discount** — enter a percentage discount (e.g. `5` for 5%) in the Discount field. The total recalculates automatically.
6. **VAT** — VAT (13%) is applied automatically based on each medicine's VAT setting.
7. **Choose payment type:**
   - **Cash** — standard payment, collected immediately
   - **Credit** — amount is added to the selected customer's outstanding balance
8. **Select customer (for credit sales)** — a dropdown appears to pick the customer from your customer list.
9. **Click "Complete Sale"** — the sale is recorded, stock is decremented automatically.

### After Sale
A printable **invoice** appears automatically. It shows:
- Pharmacy name and address
- Invoice number and date
- Itemised list with quantities and prices
- Subtotal, discount, VAT, and grand total
- Payment type

Click **Print Invoice** to print it. The invoice window can be closed and you can start the next sale immediately.

### On Mobile
- The medicine list shows full-width on mobile
- Tap the cart icon (with item count badge) to open the cart as a sliding panel
- All functions work the same as desktop

---

## 4. Medicines (Inventory)

The Inventory page lists all medicines in stock with their details and status.

### Columns Explained

| Column | Description |
|---|---|
| **Name** | Brand/commercial name of the medicine |
| **Generic Name** | Active ingredient / generic name |
| **Batch** | Batch number from the manufacturer |
| **Expiry** | Expiry date with a colour-coded status badge |
| **Stock** | Current quantity in hand (shown in amber/bold if below reorder level) |
| **Price** | Selling price per unit (NPR) |

### Expiry Status Badges

| Badge | Meaning |
|---|---|
| **Valid** (green) | Expiry is more than 90 days away |
| **Expiring Soon** (amber) | Expiry is within the next 90 days |
| **Expired** (red) | Medicine has already passed its expiry date |

### Search
Type any part of a medicine name in the search box to filter the list in real time.

### Adding a New Medicine

Click **Add Medicine** (top right). A form appears with these fields:

| Field | Required | Notes |
|---|---|---|
| Name | Yes | Full name as on packaging |
| Generic Name | Yes | Active ingredient |
| Brand Name | No | Optional commercial brand |
| Batch Number | Yes | From manufacturer label |
| Expiry Date | Yes | Select from date picker |
| Barcode | No | Optional for scanning |
| Stock Quantity | Yes | Current units in hand |
| Reorder Level | No | Alert triggers when stock falls below this (default: 10) |
| Purchase Price | Yes | Cost price per unit (NPR) |
| Selling Price | Yes | Price charged to customer (NPR) |
| VAT % | No | Default 13%. Set to 0 for VAT-exempt items |
| Storage Location | No | e.g. "Shelf A-3" |
| Category | No | Select from existing categories |
| Supplier | No | Select from existing suppliers |

Click **Add Medicine** to save. The medicine appears in the list immediately.

---

## 5. Expiry Alerts

This page helps the pharmacy team identify medicines that need attention before they become unsaleable losses.

### How It Works
Medicines are automatically grouped into these categories based on today's date:

| Section | Medicines Included |
|---|---|
| **Expired** | Expiry date has already passed |
| **Expiring in 30 Days** | Expires within the next 30 days |
| **Expiring in 31–60 Days** | Expires between 31 and 60 days from now |
| **Expiring in 61–90 Days** | Expires between 61 and 90 days from now |

### Urgency Badges
Each section has a colour-coded badge:
- Red **EXPIRED** — immediate action needed
- Red **30 days** — urgent
- Amber **60 days** — attention needed
- Yellow **90 days** — monitor

### What to Do
- **Expired medicines** — remove from shelves, record disposal
- **Expiring soon** — put them at the front, offer discounts, or return to supplier if possible

### Sidebar Alert
The sidebar navigation shows a live count badge on **Expiry Alerts** whenever there are medicines expiring within 90 days or already expired.

---

## 6. Sales History

A complete record of every sale ever processed through the system.

### What You See
Each row shows:
- Invoice number
- Date and time of sale
- Customer name (or "Walk-in" for cash customers)
- Number of items sold
- Total amount

### Filtering by Date
Use the **From** and **To** date pickers to filter sales for a specific period (e.g. this month, a specific day).

### Reprinting an Invoice
Click the **Print** button on any row to reprint that sale's invoice. Useful when a customer asks for a duplicate bill.

---

## 7. Purchases

Records all stock purchased from suppliers. Every purchase automatically increases the stock levels of the medicines included.

### Viewing Purchases
The list shows:
- Invoice number from the supplier
- Purchase date
- Supplier name
- Total amount paid

### Recording a New Purchase

Click **New Purchase**. Fill in:

**Header Information:**
| Field | Required | Notes |
|---|---|---|
| Supplier | Yes | Select from your supplier list |
| Invoice Number | Yes | The supplier's invoice/bill number |
| Purchase Date | Yes | Date of purchase (defaults to today) |

**Adding Medicines:**
1. Type a medicine name in the search box
2. Click **Add** on the result
3. The medicine appears as a row in the items table
4. Edit each row:
   - **Qty** — number of units purchased
   - **Price (NPR)** — purchase price per unit (pre-filled from last purchase)
   - **Batch No.** — batch number on this delivery
   - **Expiry** — expiry date on this delivery

5. Repeat for all medicines in the purchase
6. The **Total** updates automatically

Click **Record Purchase** to save. Stock is immediately updated — quantities go up for each medicine added.

---

## 8. Suppliers

The directory of all medicine suppliers and distributors.

### What You See
| Column | Description |
|---|---|
| **Name** | Company name |
| **Contact Person** | Name of the sales representative |
| **Contact Info** | Phone number and email |
| **Total Purchases** | Total NPR value purchased from this supplier |

### Adding a New Supplier

Click **Add Supplier** and fill in:

| Field | Required |
|---|---|
| Supplier Name | Yes |
| Contact Person | No |
| Phone | No |
| Email | No |
| Address | No |

---

## 9. Customers

Tracks customers who make purchases on credit. Walk-in cash customers do not need to be in this list.

### What You See
| Column | Description |
|---|---|
| **Name** | Customer full name |
| **Contact** | Phone or email |
| **Member Since** | Date when the customer was first registered |
| **Credit Balance** | Outstanding amount the customer owes (shown in red if > 0) |
| **Actions** | Record Payment button (appears only when balance > 0) |

### Adding a New Customer

Click **Add Customer**:

| Field | Required |
|---|---|
| Customer Name | Yes |
| Phone | No |
| Email | No |
| Address | No |

Once added, this customer appears in the Billing page's credit customer dropdown.

### Recording a Payment (Collecting Due Amount)

When a customer comes to pay their outstanding credit:

1. Find the customer in the list
2. Click **Record Payment** in their row
3. A dialog shows their name and current outstanding balance
4. Enter the amount being paid
5. Click **Record Payment**

The credit balance reduces immediately. The system prevents entering more than the outstanding amount.

---

## 10. Analytics

The Analytics page is for the **owner/manager** to review business performance. It is data-only — no changes can be made here.

### KPI Cards

| Card | Description |
|---|---|
| **30-Day Revenue** | Total sales collected over the last 30 days |
| **30-Day Profit** | Estimated profit over the last 30 days |
| **Daily Average** | Average daily revenue over the last 30 days |
| **Inventory Value** | Current total stock value at purchase price |

### Revenue & Profit Chart

A dual-line area chart showing the last 30 days:
- **Teal line** — daily revenue (sales collected)
- **Green line** — daily profit (revenue minus cost)

Hover over any point to see the exact figures for that day. Also shows the **peak day** (highest revenue day in the period).

### Top Medicines by Revenue

A horizontal bar chart showing the top-selling medicines ranked by total revenue earned. Each medicine is shown in a different colour. Hover for exact NPR values.

### Units Sold Breakdown

A detailed list of top medicines showing:
- Proportional progress bar (relative to the top seller)
- Units sold count
- Revenue earned
- Totals row at the bottom

---

## 11. User Roles

| Feature | Admin | Cashier |
|---|---|---|
| Dashboard | Yes | Yes |
| Billing / POS | Yes | Yes |
| Medicines — view | Yes | Yes |
| Medicines — add new | Yes | No |
| Expiry Alerts | Yes | Yes |
| Sales History | Yes | Yes |
| Purchases — view | Yes | No |
| Purchases — record new | Yes | No |
| Suppliers | Yes | No |
| Customers | Yes | Yes |
| Analytics | Yes | No |

---

## 12. Common Workflows

### Daily Opening Routine
1. Log in as Admin
2. Check **Dashboard** — note today's starting stock alerts
3. Check **Expiry Alerts** — any expired items to remove?
4. Begin the day — cashiers log in and use **Billing**

### Processing a Sale
1. Go to **Billing**
2. Search medicine → Add to cart
3. Set quantity, apply discount if any
4. Choose Cash or Credit
5. Click **Complete Sale** → Print invoice if needed

### Receiving New Stock from Supplier
1. Go to **Purchases**
2. Click **New Purchase**
3. Select supplier, enter their invoice number and date
4. Search and add each medicine with qty, price, batch, and expiry
5. Click **Record Purchase** — stock updates automatically

### Customer Pays Their Dues
1. Go to **Customers**
2. Find the customer (use search)
3. Click **Record Payment**
4. Enter amount collected → Save

### End-of-Month Review
1. Go to **Analytics**
2. Check 30-day revenue, profit, and daily average
3. Review top-selling medicines
4. Go to **Sales History** and filter by the month for a full transaction log

---

*Documentation prepared for Sanjay Medical, Butwal, Nepal.*
