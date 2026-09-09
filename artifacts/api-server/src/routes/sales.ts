import { Router, type IRouter } from "express";
import { eq, gte, lte, and, sql } from "drizzle-orm";
import { db, salesTable, saleItemsTable, medicinesTable, customersTable } from "@workspace/db";
import {
  ListSalesQueryParams,
  CreateSaleBody,
  GetSaleParams,
} from "@workspace/api-zod";
import { requireAuth } from "./auth";
import { requirePermission } from "../middlewares/rbac";
import { subscriptionCheckMiddleware } from "../middlewares/subscription";

const router: IRouter = Router();

async function enrichSale(row: typeof salesTable.$inferSelect) {
  const items = await db.select().from(saleItemsTable).where(eq(saleItemsTable.saleId, row.id));
  return {
    id: row.id,
    pharmacyId: row.pharmacyId,
    billNumber: row.billNumber,
    customerId: row.customerId,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    saleDate: row.saleDate,
    subtotal: parseFloat(row.subtotal),
    discountAmount: parseFloat(row.discountAmount),
    vatAmount: parseFloat(row.vatAmount),
    totalAmount: parseFloat(row.totalAmount),
    paidAmount: parseFloat(row.paidAmount),
    isCredit: row.isCredit,
    items: items.map((item: any) => ({
      id: item.id,
      medicineId: item.medicineId,
      medicineName: item.medicineName,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unitPrice),
      discount: parseFloat(item.discount),
      vatPercent: parseFloat(item.vatPercent),
      total: parseFloat(item.total),
    })),
    createdAt: row.createdAt.toISOString(),
  };
}

function generateBillNumber(pharmacyId: number): string {
  const now = new Date();
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SM-${pharmacyId}-${ymd}-${random}`;
}

router.get("/sales", requireAuth, subscriptionCheckMiddleware, requirePermission("sale.view"), async (req: any, res): Promise<void> => {
  const q = ListSalesQueryParams.safeParse(req.query);
  if (!q.success) { res.status(400).json({ error: q.error.message }); return; }

  const pharmacyId = req.user.pharmacyId;
  const conditions: any[] = [];

  if (!req.user.isSuperAdmin && pharmacyId) {
    conditions.push(eq(salesTable.pharmacyId, pharmacyId));
  }

  if (q.data.startDate) conditions.push(gte(salesTable.saleDate, q.data.startDate));
  if (q.data.endDate) conditions.push(lte(salesTable.saleDate, q.data.endDate));

  const rows = await db.select().from(salesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${salesTable.createdAt} DESC`);
  const results = await Promise.all(rows.map(enrichSale));
  res.json(results);
});

router.post("/sales", requireAuth, subscriptionCheckMiddleware, requirePermission("sale.create"), async (req: any, res): Promise<void> => {
  const parsed = CreateSaleBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const pharmacyId = req.user.pharmacyId;
  if (!pharmacyId && !req.user.isSuperAdmin) {
    res.status(403).json({ error: "Pharmacy tenant missing" });
    return;
  }

  const activePharmacyId = pharmacyId ?? (req.body.pharmacyId || 1);
  const { items, ...saleData } = parsed.data;

  // Calculate totals
  let subtotal = 0;
  let vatAmount = 0;
  const saleItems: Array<{ medicineId: number; name: string; qty: number; price: number; discount: number; vatPct: number; total: number }> = [];

  for (const item of items) {
    // Tenant check on medicine item
    const medConditions = [eq(medicinesTable.id, item.medicineId)];
    if (!req.user.isSuperAdmin && activePharmacyId) {
      medConditions.push(eq(medicinesTable.pharmacyId, activePharmacyId));
    }

    const [med] = await db.select().from(medicinesTable).where(and(...medConditions));
    if (!med) { res.status(400).json({ error: `Medicine ${item.medicineId} not found in pharmacy inventory` }); return; }
    if (med.quantity < item.quantity) { res.status(400).json({ error: `Insufficient stock for ${med.name}` }); return; }

    const discount = item.discount ?? 0;
    const vatPct = item.vatPercent ?? parseFloat(med.vatPercent);
    const lineSubtotal = item.unitPrice * item.quantity - discount;
    const lineVat = lineSubtotal * (vatPct / 100);
    const lineTotal = lineSubtotal + lineVat;
    subtotal += lineSubtotal;
    vatAmount += lineVat;
    saleItems.push({ medicineId: item.medicineId, name: med.name, qty: item.quantity, price: item.unitPrice, discount, vatPct, total: lineTotal });
  }

  const discountAmount = saleData.discountAmount ?? 0;
  const totalAmount = subtotal + vatAmount - discountAmount;
  const paidAmount = saleData.paidAmount ?? totalAmount;
  const isCredit = saleData.isCredit ?? false;
  const today = new Date().toISOString().split("T")[0];

  const [sale] = await db.insert(salesTable).values({
    pharmacyId: activePharmacyId,
    billNumber: generateBillNumber(activePharmacyId),
    customerId: saleData.customerId,
    customerName: saleData.customerName,
    customerPhone: saleData.customerPhone,
    saleDate: today,
    subtotal: subtotal.toFixed(2),
    discountAmount: discountAmount.toFixed(2),
    vatAmount: vatAmount.toFixed(2),
    totalAmount: totalAmount.toFixed(2),
    paidAmount: paidAmount.toFixed(2),
    isCredit,
  }).returning();

  for (const si of saleItems) {
    await db.insert(saleItemsTable).values({
      saleId: sale.id,
      medicineId: si.medicineId,
      medicineName: si.name,
      quantity: si.qty,
      unitPrice: String(si.price),
      discount: String(si.discount),
      vatPercent: String(si.vatPct),
      total: String(si.total),
    });
    // Decrement stock
    await db.update(medicinesTable)
      .set({ quantity: sql`${medicinesTable.quantity} - ${si.qty}` })
      .where(eq(medicinesTable.id, si.medicineId));
  }

  // If credit sale, add to customer credit balance
  if (isCredit && saleData.customerId) {
    const creditDue = totalAmount - paidAmount;
    if (creditDue > 0) {
      await db.update(customersTable)
        .set({ creditBalance: sql`${customersTable.creditBalance} + ${creditDue}` })
        .where(eq(customersTable.id, saleData.customerId));
    }
  }

  res.status(201).json(await enrichSale(sale));
});

router.get("/sales/:id", requireAuth, subscriptionCheckMiddleware, requirePermission("sale.view"), async (req: any, res): Promise<void> => {
  const params = GetSaleParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const pharmacyId = req.user.pharmacyId;
  const conditions = [eq(salesTable.id, params.data.id)];
  if (!req.user.isSuperAdmin && pharmacyId) {
    conditions.push(eq(salesTable.pharmacyId, pharmacyId));
  }

  const [row] = await db.select().from(salesTable).where(and(...conditions));
  if (!row) { res.status(404).json({ error: "Sale not found" }); return; }
  res.json(await enrichSale(row));
});

export default router;
