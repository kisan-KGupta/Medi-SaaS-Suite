import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, purchasesTable, purchaseItemsTable, suppliersTable, medicinesTable } from "@workspace/db";
import {
  CreatePurchaseBody,
  GetPurchaseParams,
} from "@workspace/api-zod";
import { requireAuth } from "./auth";

const router: IRouter = Router();

async function enrichPurchase(row: typeof purchasesTable.$inferSelect) {
  const [supplier] = await db.select({ name: suppliersTable.name }).from(suppliersTable).where(eq(suppliersTable.id, row.supplierId));
  const items = await db.select().from(purchaseItemsTable).where(eq(purchaseItemsTable.purchaseId, row.id));
  return {
    id: row.id,
    supplierId: row.supplierId,
    supplierName: supplier?.name ?? "Unknown",
    invoiceNumber: row.invoiceNumber,
    purchaseDate: row.purchaseDate,
    totalAmount: parseFloat(row.totalAmount),
    items: items.map(item => ({
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

router.get("/purchases", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db.select().from(purchasesTable).orderBy(sql`${purchasesTable.createdAt} DESC`);
  const results = await Promise.all(rows.map(enrichPurchase));
  res.json(results);
});

router.post("/purchases", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreatePurchaseBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { items, ...purchaseData } = parsed.data;

  // Calculate total
  const total = items.reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0);

  const [purchase] = await db.insert(purchasesTable).values({
    ...purchaseData,
    totalAmount: total.toFixed(2),
  }).returning();

  // Insert items and update stock
  for (const item of items) {
    const [medicine] = await db.select({ name: medicinesTable.name }).from(medicinesTable).where(eq(medicinesTable.id, item.medicineId));
    await db.insert(purchaseItemsTable).values({
      purchaseId: purchase.id,
      medicineId: item.medicineId,
      medicineName: medicine?.name ?? "Unknown",
      quantity: item.quantity,
      purchasePrice: String(item.purchasePrice),
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate,
    });
    // Increment stock
    await db.update(medicinesTable)
      .set({ quantity: sql`${medicinesTable.quantity} + ${item.quantity}` })
      .where(eq(medicinesTable.id, item.medicineId));
  }

  res.status(201).json(await enrichPurchase(purchase));
});

router.get("/purchases/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetPurchaseParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [row] = await db.select().from(purchasesTable).where(eq(purchasesTable.id, params.data.id));
  if (!row) { res.status(404).json({ error: "Purchase not found" }); return; }
  res.json(await enrichPurchase(row));
});

export default router;
