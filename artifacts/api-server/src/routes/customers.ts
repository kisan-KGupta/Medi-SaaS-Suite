import { Router, type IRouter } from "express";
import { eq, sql, ilike } from "drizzle-orm";
import { db, customersTable, salesTable } from "@workspace/db";
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

const router: IRouter = Router();

async function customerWithStats(row: typeof customersTable.$inferSelect) {
  const result = await db
    .select({ total: sql<string>`coalesce(sum(${salesTable.totalAmount}), 0)` })
    .from(salesTable)
    .where(eq(salesTable.customerId, row.id));
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    creditBalance: parseFloat(row.creditBalance),
    totalPurchases: parseFloat(result[0]?.total ?? "0"),
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/customers", requireAuth, async (req, res): Promise<void> => {
  const q = ListCustomersQueryParams.safeParse(req.query);
  if (!q.success) { res.status(400).json({ error: q.error.message }); return; }
  let query = db.select().from(customersTable).$dynamic();
  if (q.data.search) {
    query = query.where(ilike(customersTable.name, `%${q.data.search}%`));
  }
  const rows = await query.orderBy(customersTable.name);
  const results = await Promise.all(rows.map(customerWithStats));
  res.json(results);
});

router.post("/customers", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateCustomerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.insert(customersTable).values(parsed.data).returning();
  res.status(201).json(await customerWithStats(row));
});

router.get("/customers/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetCustomerParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [row] = await db.select().from(customersTable).where(eq(customersTable.id, params.data.id));
  if (!row) { res.status(404).json({ error: "Customer not found" }); return; }
  res.json(await customerWithStats(row));
});

router.patch("/customers/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateCustomerParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateCustomerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.update(customersTable).set(parsed.data).where(eq(customersTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Customer not found" }); return; }
  res.json(await customerWithStats(row));
});

router.post("/customers/:id/payment", requireAuth, async (req, res): Promise<void> => {
  const params = RecordCustomerPaymentParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = RecordCustomerPaymentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [existing] = await db.select().from(customersTable).where(eq(customersTable.id, params.data.id));
  if (!existing) { res.status(404).json({ error: "Customer not found" }); return; }
  const newBalance = Math.max(0, parseFloat(existing.creditBalance) - parsed.data.amount);
  const [row] = await db.update(customersTable)
    .set({ creditBalance: newBalance.toFixed(2) })
    .where(eq(customersTable.id, params.data.id))
    .returning();
  res.json(await customerWithStats(row));
});

export default router;
