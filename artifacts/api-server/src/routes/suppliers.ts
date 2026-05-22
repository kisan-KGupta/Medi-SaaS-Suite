import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, suppliersTable, purchasesTable } from "@workspace/db";
import {
  CreateSupplierBody,
  GetSupplierParams,
  UpdateSupplierParams,
  UpdateSupplierBody,
  DeleteSupplierParams,
} from "@workspace/api-zod";
import { requireAuth } from "./auth";

const router: IRouter = Router();

async function supplierWithPurchases(row: typeof suppliersTable.$inferSelect) {
  const result = await db
    .select({ total: sql<string>`coalesce(sum(${purchasesTable.totalAmount}), 0)` })
    .from(purchasesTable)
    .where(eq(purchasesTable.supplierId, row.id));
  return {
    id: row.id,
    name: row.name,
    contactPerson: row.contactPerson,
    phone: row.phone,
    email: row.email,
    address: row.address,
    totalPurchases: parseFloat(result[0]?.total ?? "0"),
  };
}

router.get("/suppliers", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db.select().from(suppliersTable).orderBy(suppliersTable.name);
  const results = await Promise.all(rows.map(supplierWithPurchases));
  res.json(results);
});

router.post("/suppliers", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateSupplierBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.insert(suppliersTable).values(parsed.data).returning();
  res.status(201).json(await supplierWithPurchases(row));
});

router.get("/suppliers/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetSupplierParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [row] = await db.select().from(suppliersTable).where(eq(suppliersTable.id, params.data.id));
  if (!row) { res.status(404).json({ error: "Supplier not found" }); return; }
  res.json(await supplierWithPurchases(row));
});

router.patch("/suppliers/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateSupplierParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateSupplierBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.update(suppliersTable).set(parsed.data).where(eq(suppliersTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Supplier not found" }); return; }
  res.json(await supplierWithPurchases(row));
});

router.delete("/suppliers/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteSupplierParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(suppliersTable).where(eq(suppliersTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
