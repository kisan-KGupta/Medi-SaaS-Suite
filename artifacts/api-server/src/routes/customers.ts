import { Router, type IRouter } from "express";
import { eq, ilike, and, sql } from "drizzle-orm";
import { db, customersTable } from "@workspace/db";
import {
  ListCustomersQueryParams,
  CreateCustomerBody,
  GetCustomerParams,
  UpdateCustomerParams,
  UpdateCustomerBody,
  RecordCustomerPaymentParams,
  RecordCustomerPaymentBody,
} from "@workspace/api-zod";
import { requireAuth } from "./auth";
import { requirePermission } from "../middlewares/rbac";
import { subscriptionCheckMiddleware } from "../middlewares/subscription";

const router: IRouter = Router();

function formatCustomer(row: typeof customersTable.$inferSelect) {
  return {
    id: row.id,
    pharmacyId: row.pharmacyId,
    name: row.name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    creditBalance: parseFloat(row.creditBalance),
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/customers", requireAuth, subscriptionCheckMiddleware, requirePermission("customer.view"), async (req: any, res): Promise<void> => {
  const q = ListCustomersQueryParams.safeParse(req.query);
  if (!q.success) { res.status(400).json({ error: q.error.message }); return; }

  const pharmacyId = req.user.pharmacyId;
  const conditions: any[] = [];

  if (!req.user.isSuperAdmin && pharmacyId) {
    conditions.push(eq(customersTable.pharmacyId, pharmacyId));
  }

  if (q.data.search) {
    conditions.push(ilike(customersTable.name, `%${q.data.search}%`));
  }

  const rows = await db.select().from(customersTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(customersTable.name);

  res.json(rows.map(formatCustomer));
});

router.post("/customers", requireAuth, subscriptionCheckMiddleware, requirePermission("customer.create"), async (req: any, res): Promise<void> => {
  const parsed = CreateCustomerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const pharmacyId = req.user.pharmacyId;
  if (!pharmacyId && !req.user.isSuperAdmin) {
    res.status(403).json({ error: "Pharmacy tenant missing" });
    return;
  }

  const [row] = await db.insert(customersTable).values({
    ...parsed.data,
    pharmacyId: pharmacyId ?? (req.body.pharmacyId || 1),
    creditBalance: "0.00"
  }).returning();

  res.status(201).json(formatCustomer(row));
});

router.get("/customers/:id", requireAuth, subscriptionCheckMiddleware, requirePermission("customer.view"), async (req: any, res): Promise<void> => {
  const params = GetCustomerParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const pharmacyId = req.user.pharmacyId;
  const conditions = [eq(customersTable.id, params.data.id)];
  if (!req.user.isSuperAdmin && pharmacyId) {
    conditions.push(eq(customersTable.pharmacyId, pharmacyId));
  }

  const [row] = await db.select().from(customersTable).where(and(...conditions));
  if (!row) { res.status(404).json({ error: "Customer not found" }); return; }
  res.json(formatCustomer(row));
});

router.patch("/customers/:id", requireAuth, subscriptionCheckMiddleware, requirePermission("customer.update"), async (req: any, res): Promise<void> => {
  const params = UpdateCustomerParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateCustomerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const pharmacyId = req.user.pharmacyId;
  const conditions = [eq(customersTable.id, params.data.id)];
  if (!req.user.isSuperAdmin && pharmacyId) {
    conditions.push(eq(customersTable.pharmacyId, pharmacyId));
  }

  const [row] = await db.update(customersTable).set(parsed.data).where(and(...conditions)).returning();
  if (!row) { res.status(404).json({ error: "Customer not found" }); return; }
  res.json(formatCustomer(row));
});

router.post("/customers/:id/payment", requireAuth, subscriptionCheckMiddleware, requirePermission("customer.update"), async (req: any, res): Promise<void> => {
  const params = RecordCustomerPaymentParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = RecordCustomerPaymentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const pharmacyId = req.user.pharmacyId;
  const conditions = [eq(customersTable.id, params.data.id)];
  if (!req.user.isSuperAdmin && pharmacyId) {
    conditions.push(eq(customersTable.pharmacyId, pharmacyId));
  }

  const [cust] = await db.select().from(customersTable).where(and(...conditions));
  if (!cust) { res.status(404).json({ error: "Customer not found" }); return; }

  const amount = parsed.data.amount;
  await db.update(customersTable)
    .set({ creditBalance: sql`GREATEST(0, ${customersTable.creditBalance} - ${amount})` })
    .where(and(...conditions));

  const [updated] = await db.select().from(customersTable).where(and(...conditions));
  res.json(formatCustomer(updated));
});

export default router;
