import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, suppliersTable } from "@workspace/db";
import {
  CreateSupplierBody,
  GetSupplierParams,
  UpdateSupplierParams,
  UpdateSupplierBody,
  DeleteSupplierParams,
} from "@workspace/api-zod";
import { requireAuth } from "./auth";
import { requirePermission } from "../middlewares/rbac";
import { subscriptionCheckMiddleware } from "../middlewares/subscription";

const router: IRouter = Router();

function formatSupplier(row: typeof suppliersTable.$inferSelect) {
  return {
    id: row.id,
    pharmacyId: row.pharmacyId,
    name: row.name,
    contactPerson: row.contactPerson,
    phone: row.phone,
    email: row.email,
    address: row.address,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/suppliers", requireAuth, subscriptionCheckMiddleware, requirePermission("supplier.view"), async (req: any, res): Promise<void> => {
  const pharmacyId = req.user.pharmacyId;
  const conditions: any[] = [];

  if (!req.user.isSuperAdmin && pharmacyId) {
    conditions.push(eq(suppliersTable.pharmacyId, pharmacyId));
  }

  const rows = await db.select().from(suppliersTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(suppliersTable.name);
  res.json(rows.map(formatSupplier));
});

router.post("/suppliers", requireAuth, subscriptionCheckMiddleware, requirePermission("supplier.create"), async (req: any, res): Promise<void> => {
  const parsed = CreateSupplierBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const pharmacyId = req.user.pharmacyId;
  if (!pharmacyId && !req.user.isSuperAdmin) {
    res.status(403).json({ error: "Pharmacy tenant missing" });
    return;
  }

  const [row] = await db.insert(suppliersTable).values({
    ...parsed.data,
    pharmacyId: pharmacyId ?? (req.body.pharmacyId || 1)
  }).returning();

  res.status(201).json(formatSupplier(row));
});

router.get("/suppliers/:id", requireAuth, subscriptionCheckMiddleware, requirePermission("supplier.view"), async (req: any, res): Promise<void> => {
  const params = GetSupplierParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const pharmacyId = req.user.pharmacyId;
  const conditions = [eq(suppliersTable.id, params.data.id)];
  if (!req.user.isSuperAdmin && pharmacyId) {
    conditions.push(eq(suppliersTable.pharmacyId, pharmacyId));
  }

  const [row] = await db.select().from(suppliersTable).where(and(...conditions));
  if (!row) { res.status(404).json({ error: "Supplier not found" }); return; }
  res.json(formatSupplier(row));
});

router.patch("/suppliers/:id", requireAuth, subscriptionCheckMiddleware, requirePermission("supplier.update"), async (req: any, res): Promise<void> => {
  const params = UpdateSupplierParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateSupplierBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const pharmacyId = req.user.pharmacyId;
  const conditions = [eq(suppliersTable.id, params.data.id)];
  if (!req.user.isSuperAdmin && pharmacyId) {
    conditions.push(eq(suppliersTable.pharmacyId, pharmacyId));
  }

  const [row] = await db.update(suppliersTable).set(parsed.data).where(and(...conditions)).returning();
  if (!row) { res.status(404).json({ error: "Supplier not found" }); return; }
  res.json(formatSupplier(row));
});

router.delete("/suppliers/:id", requireAuth, subscriptionCheckMiddleware, requirePermission("supplier.delete"), async (req: any, res): Promise<void> => {
  const params = DeleteSupplierParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const pharmacyId = req.user.pharmacyId;
  const conditions = [eq(suppliersTable.id, params.data.id)];
  if (!req.user.isSuperAdmin && pharmacyId) {
    conditions.push(eq(suppliersTable.pharmacyId, pharmacyId));
  }

  await db.delete(suppliersTable).where(and(...conditions));
  res.sendStatus(204);
});

export default router;
