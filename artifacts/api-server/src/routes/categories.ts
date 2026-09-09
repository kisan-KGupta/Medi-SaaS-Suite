import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, categoriesTable } from "@workspace/db";
import {
  CreateCategoryBody,
  UpdateCategoryParams,
  UpdateCategoryBody,
  DeleteCategoryParams,
} from "@workspace/api-zod";
import { requireAuth } from "./auth";
import { requirePermission } from "../middlewares/rbac";
import { subscriptionCheckMiddleware } from "../middlewares/subscription";

const router: IRouter = Router();

function formatCategory(row: typeof categoriesTable.$inferSelect) {
  return {
    id: row.id,
    pharmacyId: row.pharmacyId,
    name: row.name,
    description: row.description,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/categories", requireAuth, subscriptionCheckMiddleware, requirePermission("medicine.view"), async (req: any, res): Promise<void> => {
  const pharmacyId = req.user.pharmacyId;
  const conditions: any[] = [];

  if (!req.user.isSuperAdmin && pharmacyId) {
    conditions.push(eq(categoriesTable.pharmacyId, pharmacyId));
  }

  const rows = await db.select().from(categoriesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(categoriesTable.name);
  res.json(rows.map(formatCategory));
});

router.post("/categories", requireAuth, subscriptionCheckMiddleware, requirePermission("medicine.create"), async (req: any, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const pharmacyId = req.user.pharmacyId;
  if (!pharmacyId && !req.user.isSuperAdmin) {
    res.status(403).json({ error: "Pharmacy tenant missing" });
    return;
  }

  const [row] = await db.insert(categoriesTable).values({
    ...parsed.data,
    pharmacyId: pharmacyId ?? (req.body.pharmacyId || 1)
  }).returning();

  res.status(201).json(formatCategory(row));
});

router.patch("/categories/:id", requireAuth, subscriptionCheckMiddleware, requirePermission("medicine.update"), async (req: any, res): Promise<void> => {
  const params = UpdateCategoryParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateCategoryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const pharmacyId = req.user.pharmacyId;
  const conditions = [eq(categoriesTable.id, params.data.id)];
  if (!req.user.isSuperAdmin && pharmacyId) {
    conditions.push(eq(categoriesTable.pharmacyId, pharmacyId));
  }

  const [row] = await db.update(categoriesTable).set(parsed.data).where(and(...conditions)).returning();
  if (!row) { res.status(404).json({ error: "Category not found" }); return; }
  res.json(formatCategory(row));
});

router.delete("/categories/:id", requireAuth, subscriptionCheckMiddleware, requirePermission("medicine.delete"), async (req: any, res): Promise<void> => {
  const params = DeleteCategoryParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const pharmacyId = req.user.pharmacyId;
  const conditions = [eq(categoriesTable.id, params.data.id)];
  if (!req.user.isSuperAdmin && pharmacyId) {
    conditions.push(eq(categoriesTable.pharmacyId, pharmacyId));
  }

  await db.delete(categoriesTable).where(and(...conditions));
  res.sendStatus(204);
});

export default router;
