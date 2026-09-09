import { Router, type IRouter } from "express";
import { eq, ilike, and, lte, sql } from "drizzle-orm";
import { db, medicinesTable, categoriesTable, suppliersTable } from "@workspace/db";
import {
  ListMedicinesQueryParams,
  CreateMedicineBody,
  GetMedicineParams,
  UpdateMedicineParams,
  UpdateMedicineBody,
  DeleteMedicineParams,
} from "@workspace/api-zod";
import { requireAuth } from "./auth";
import { requirePermission } from "../middlewares/rbac";
import { subscriptionCheckMiddleware } from "../middlewares/subscription";

const router: IRouter = Router();

function getExpiryStatus(expiryDate: string): "valid" | "expiring_soon" | "expired" {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "expired";
  if (diffDays <= 90) return "expiring_soon";
  return "valid";
}

async function enrichMedicine(row: typeof medicinesTable.$inferSelect) {
  let categoryName: string | null = null;
  let supplierName: string | null = null;

  if (row.categoryId) {
    const [cat] = await db.select({ name: categoriesTable.name }).from(categoriesTable).where(eq(categoriesTable.id, row.categoryId));
    categoryName = cat?.name ?? null;
  }
  if (row.supplierId) {
    const [sup] = await db.select({ name: suppliersTable.name }).from(suppliersTable).where(eq(suppliersTable.id, row.supplierId));
    supplierName = sup?.name ?? null;
  }

  return {
    id: row.id,
    pharmacyId: row.pharmacyId,
    name: row.name,
    genericName: row.genericName,
    brandName: row.brandName,
    categoryId: row.categoryId,
    categoryName,
    batchNumber: row.batchNumber,
    barcode: row.barcode,
    expiryDate: row.expiryDate,
    quantity: row.quantity,
    purchasePrice: parseFloat(row.purchasePrice),
    sellingPrice: parseFloat(row.sellingPrice),
    vatPercent: parseFloat(row.vatPercent),
    supplierId: row.supplierId,
    supplierName,
    storageLocation: row.storageLocation,
    reorderLevel: row.reorderLevel,
    expiryStatus: getExpiryStatus(row.expiryDate),
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/medicines", requireAuth, subscriptionCheckMiddleware, requirePermission("medicine.view"), async (req: any, res): Promise<void> => {
  const q = ListMedicinesQueryParams.safeParse(req.query);
  if (!q.success) { res.status(400).json({ error: q.error.message }); return; }

  const pharmacyId = req.user.pharmacyId;
  const conditions: any[] = [];

  // Strictly enforce tenant scope if not superadmin
  if (!req.user.isSuperAdmin && pharmacyId) {
    conditions.push(eq(medicinesTable.pharmacyId, pharmacyId));
  }

  if (q.data.search) {
    conditions.push(ilike(medicinesTable.name, `%${q.data.search}%`));
  }
  if (q.data.categoryId) {
    conditions.push(eq(medicinesTable.categoryId, q.data.categoryId));
  }
  if (q.data.lowStock) {
    conditions.push(sql`${medicinesTable.quantity} <= ${medicinesTable.reorderLevel}`);
  }

  let rows = await db.select().from(medicinesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(medicinesTable.name);

  if (q.data.expiryDays) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + q.data.expiryDays);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    rows = rows.filter((r: any) => r.expiryDate <= cutoffStr);
  }

  const results = await Promise.all(rows.map(enrichMedicine));
  res.json(results);
});

router.post("/medicines", requireAuth, subscriptionCheckMiddleware, requirePermission("medicine.create"), async (req: any, res): Promise<void> => {
  const parsed = CreateMedicineBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const pharmacyId = req.user.pharmacyId;
  if (!pharmacyId && !req.user.isSuperAdmin) {
    res.status(403).json({ error: "Pharmacy tenant missing" });
    return;
  }

  const data = {
    ...parsed.data,
    pharmacyId: pharmacyId ?? (req.body.pharmacyId || 1),
    purchasePrice: String(parsed.data.purchasePrice),
    sellingPrice: String(parsed.data.sellingPrice),
    vatPercent: String(parsed.data.vatPercent ?? 0),
  };

  const [row] = await db.insert(medicinesTable).values(data as any).returning();
  res.status(201).json(await enrichMedicine(row));
});

router.get("/medicines/:id", requireAuth, subscriptionCheckMiddleware, requirePermission("medicine.view"), async (req: any, res): Promise<void> => {
  const params = GetMedicineParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const pharmacyId = req.user.pharmacyId;
  const conditions = [eq(medicinesTable.id, params.data.id)];
  if (!req.user.isSuperAdmin && pharmacyId) {
    conditions.push(eq(medicinesTable.pharmacyId, pharmacyId));
  }

  const [row] = await db.select().from(medicinesTable).where(and(...conditions));
  if (!row) { res.status(404).json({ error: "Medicine not found" }); return; }
  res.json(await enrichMedicine(row));
});

router.patch("/medicines/:id", requireAuth, subscriptionCheckMiddleware, requirePermission("medicine.update"), async (req: any, res): Promise<void> => {
  const params = UpdateMedicineParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateMedicineBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const pharmacyId = req.user.pharmacyId;
  const conditions = [eq(medicinesTable.id, params.data.id)];
  if (!req.user.isSuperAdmin && pharmacyId) {
    conditions.push(eq(medicinesTable.pharmacyId, pharmacyId));
  }

  const updateData: any = { ...parsed.data };
  delete updateData.pharmacyId; // Prevent changing tenant ownership
  if (updateData.purchasePrice !== undefined) updateData.purchasePrice = String(updateData.purchasePrice);
  if (updateData.sellingPrice !== undefined) updateData.sellingPrice = String(updateData.sellingPrice);
  if (updateData.vatPercent !== undefined) updateData.vatPercent = String(updateData.vatPercent);

  const [row] = await db.update(medicinesTable).set(updateData).where(and(...conditions)).returning();
  if (!row) { res.status(404).json({ error: "Medicine not found" }); return; }
  res.json(await enrichMedicine(row));
});

router.delete("/medicines/:id", requireAuth, subscriptionCheckMiddleware, requirePermission("medicine.delete"), async (req: any, res): Promise<void> => {
  const params = DeleteMedicineParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const pharmacyId = req.user.pharmacyId;
  const conditions = [eq(medicinesTable.id, params.data.id)];
  if (!req.user.isSuperAdmin && pharmacyId) {
    conditions.push(eq(medicinesTable.pharmacyId, pharmacyId));
  }

  const [existing] = await db.select().from(medicinesTable).where(and(...conditions));
  if (!existing) {
    res.status(404).json({ error: "Medicine not found" });
    return;
  }

  await db.delete(medicinesTable).where(and(...conditions));
  res.sendStatus(204);
});

export default router;
