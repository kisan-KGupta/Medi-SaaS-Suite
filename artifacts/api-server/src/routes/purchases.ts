import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, purchasesTable, purchaseItemsTable, suppliersTable, medicinesTable } from "@workspace/db";
import {
  CreatePurchaseBody,
  GetPurchaseParams,
} from "@workspace/api-zod";
import { requireAuth } from "./auth";
import { requirePermission } from "../middlewares/rbac";
import { subscriptionCheckMiddleware } from "../middlewares/subscription";

const router: IRouter = Router();

async function enrichPurchase(row: typeof purchasesTable.$inferSelect) {
  let supplierName: string | null = null;
  if (row.supplierId) {
    const [sup] = await db.select({ name: suppliersTable.name }).from(suppliersTable).where(eq(suppliersTable.id, row.supplierId));
    supplierName = sup?.name ?? null;
  }
  const items = await db.select().from(purchaseItemsTable).where(eq(purchaseItemsTable.purchaseId, row.id));

  return {
    id: row.id,
    pharmacyId: row.pharmacyId,
    supplierId: row.supplierId,
    supplierName,
    invoiceNumber: row.invoiceNumber,
    purchaseDate: row.purchaseDate,
    totalAmount: parseFloat(row.totalAmount),
    items: items.map((item: any) => ({
      id: item.id,
      medicineId: item.medicineId,
      medicineName: item.medicineName,
      quantity: item.quantity,
      purchasePrice: parseFloat(item.purchasePrice),
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate,
    })),
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/purchases", requireAuth, subscriptionCheckMiddleware, requirePermission("purchase.view"), async (req: any, res): Promise<void> => {
  const pharmacyId = req.user.pharmacyId;
  const conditions: any[] = [];

  if (!req.user.isSuperAdmin && pharmacyId) {
    conditions.push(eq(purchasesTable.pharmacyId, pharmacyId));
  }

  const rows = await db.select().from(purchasesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${purchasesTable.createdAt} DESC`);
  const results = await Promise.all(rows.map(enrichPurchase));
  res.json(results);
});

router.post("/purchases", requireAuth, subscriptionCheckMiddleware, requirePermission("purchase.create"), async (req: any, res): Promise<void> => {
  const parsed = CreatePurchaseBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const pharmacyId = req.user.pharmacyId;
  if (!pharmacyId && !req.user.isSuperAdmin) {
    res.status(403).json({ error: "Pharmacy tenant missing" });
    return;
  }

  const activePharmacyId = pharmacyId ?? (req.body.pharmacyId || 1);
  const { items, ...purchaseData } = parsed.data;

  let totalAmount = 0;
  for (const item of items) {
    totalAmount += item.purchasePrice * item.quantity;
  }

  const today = new Date().toISOString().split("T")[0];

  const [purchase] = await db.insert(purchasesTable).values({
    pharmacyId: activePharmacyId,
    supplierId: purchaseData.supplierId,
    invoiceNumber: purchaseData.invoiceNumber,
    purchaseDate: today,
    totalAmount: totalAmount.toFixed(2),
  }).returning();

  for (const item of items) {
    const [med] = await db.select({ name: medicinesTable.name }).from(medicinesTable).where(eq(medicinesTable.id, item.medicineId));
    const medicineName = (item as any).medicineName || med?.name || "Medicine";

    await db.insert(purchaseItemsTable).values({
      purchaseId: purchase.id,
      medicineId: item.medicineId,
      medicineName,
      quantity: item.quantity,
      purchasePrice: String(item.purchasePrice),
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate,
    });

    // Auto-increment stock in medicine table
    await db.update(medicinesTable)
      .set({
        quantity: sql`${medicinesTable.quantity} + ${item.quantity}`,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
        purchasePrice: String(item.purchasePrice),
      })
      .where(eq(medicinesTable.id, item.medicineId));
  }

  res.status(201).json(await enrichPurchase(purchase));
});

router.get("/purchases/:id", requireAuth, subscriptionCheckMiddleware, requirePermission("purchase.view"), async (req: any, res): Promise<void> => {
  const params = GetPurchaseParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const pharmacyId = req.user.pharmacyId;
  const conditions = [eq(purchasesTable.id, params.data.id)];
  if (!req.user.isSuperAdmin && pharmacyId) {
    conditions.push(eq(purchasesTable.pharmacyId, pharmacyId));
  }

  const [row] = await db.select().from(purchasesTable).where(and(...conditions));
  if (!row) { res.status(404).json({ error: "Purchase not found" }); return; }
  res.json(await enrichPurchase(row));
});

export default router;
