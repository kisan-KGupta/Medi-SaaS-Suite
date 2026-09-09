import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { requireAuth } from "./auth";
import { requirePermission } from "../middlewares/rbac";
import { subscriptionCheckMiddleware } from "../middlewares/subscription";

const router: IRouter = Router();

function toDateString(d: Date): string {
  return d.toISOString().split("T")[0];
}

function row(result: any, index = 0): any {
  return (result as any).rows?.[index] ?? (result as any)[index] ?? {};
}

router.get("/dashboard/summary", requireAuth, subscriptionCheckMiddleware, requirePermission("dashboard.view"), async (req: any, res): Promise<void> => {
  const now = new Date();
  const today = toDateString(now);
  const weekAgo = toDateString(new Date(now.getTime() - 7 * 86400000));
  const monthAgo = toDateString(new Date(now.getTime() - 30 * 86400000));
  const in30 = toDateString(new Date(now.getTime() + 30 * 86400000));

  const pharmacyId = req.user.pharmacyId ?? 1;

  const [todayRes, weeklyRes, monthlyRes, totalMedRes, lowStockRes, expiringRes, expiredRes, invValueRes] =
    await Promise.all([
      db.execute(sql`SELECT COALESCE(SUM(total_amount),0) as sales, COALESCE(SUM(total_amount)-SUM(discount_amount),0) as profit FROM sales WHERE pharmacy_id = ${pharmacyId} AND sale_date = ${today}`),
      db.execute(sql`SELECT COALESCE(SUM(total_amount),0) as sales FROM sales WHERE pharmacy_id = ${pharmacyId} AND sale_date >= ${weekAgo}`),
      db.execute(sql`SELECT COALESCE(SUM(total_amount),0) as sales FROM sales WHERE pharmacy_id = ${pharmacyId} AND sale_date >= ${monthAgo}`),
      db.execute(sql`SELECT COUNT(*) as count FROM medicines WHERE pharmacy_id = ${pharmacyId}`),
      db.execute(sql`SELECT COUNT(*) as count FROM medicines WHERE pharmacy_id = ${pharmacyId} AND quantity <= reorder_level`),
      db.execute(sql`SELECT COUNT(*) as count FROM medicines WHERE pharmacy_id = ${pharmacyId} AND expiry_date >= ${today} AND expiry_date <= ${in30}`),
      db.execute(sql`SELECT COUNT(*) as count FROM medicines WHERE pharmacy_id = ${pharmacyId} AND expiry_date < ${today}`),
      db.execute(sql`SELECT COALESCE(SUM(quantity * purchase_price),0) as value FROM medicines WHERE pharmacy_id = ${pharmacyId}`),
    ]);

  res.json({
    todaySales:     parseFloat(row(todayRes).sales   ?? "0"),
    weeklySales:    parseFloat(row(weeklyRes).sales  ?? "0"),
    monthlySales:   parseFloat(row(monthlyRes).sales ?? "0"),
    todayProfit:    parseFloat(row(todayRes).profit  ?? "0"),
    totalMedicines: parseInt(row(totalMedRes).count  ?? "0"),
    lowStockCount:  parseInt(row(lowStockRes).count  ?? "0"),
    expiringCount:  parseInt(row(expiringRes).count  ?? "0"),
    expiredCount:   parseInt(row(expiredRes).count   ?? "0"),
    inventoryValue: parseFloat(row(invValueRes).value ?? "0"),
  });
});

router.get("/dashboard/sales-chart", requireAuth, subscriptionCheckMiddleware, requirePermission("dashboard.view"), async (req: any, res): Promise<void> => {
  const pharmacyId = req.user.pharmacyId ?? 1;

  const result = await db.execute(sql`
    SELECT
      sale_date::text as date,
      COALESCE(SUM(total_amount), 0) as sales,
      COALESCE(SUM(total_amount - discount_amount - vat_amount), 0) as profit
    FROM sales
    WHERE pharmacy_id = ${pharmacyId} AND sale_date >= (CURRENT_DATE - INTERVAL '30 days')
    GROUP BY sale_date
    ORDER BY sale_date ASC
  `);
  const rows = (result as any).rows ?? result;
  res.json(rows.map((r: any) => ({
    date:   r.date,
    sales:  parseFloat(r.sales),
    profit: parseFloat(r.profit),
  })));
});

router.get("/dashboard/top-medicines", requireAuth, subscriptionCheckMiddleware, requirePermission("dashboard.view"), async (req: any, res): Promise<void> => {
  const pharmacyId = req.user.pharmacyId ?? 1;

  const result = await db.execute(sql`
    SELECT
      si.medicine_id as id,
      si.medicine_name as name,
      SUM(si.quantity) as quantity_sold,
      SUM(si.total) as revenue
    FROM sale_items si
    JOIN sales s ON s.id = si.sale_id
    WHERE s.pharmacy_id = ${pharmacyId} AND s.sale_date >= (CURRENT_DATE - INTERVAL '30 days')
    GROUP BY si.medicine_id, si.medicine_name
    ORDER BY quantity_sold DESC
    LIMIT 10
  `);
  const rows = (result as any).rows ?? result;
  res.json(rows.map((r: any) => ({
    id:           parseInt(r.id),
    name:         r.name,
    quantitySold: parseInt(r.quantity_sold),
    revenue:      parseFloat(r.revenue),
  })));
});

router.get("/dashboard/expiry-alerts", requireAuth, subscriptionCheckMiddleware, requirePermission("dashboard.view"), async (req: any, res): Promise<void> => {
  const pharmacyId = req.user.pharmacyId ?? 1;

  const today = toDateString(new Date());
  const in30  = toDateString(new Date(Date.now() + 30 * 86400000));
  const in60  = toDateString(new Date(Date.now() + 60 * 86400000));
  const in90  = toDateString(new Date(Date.now() + 90 * 86400000));

  const result = await db.execute(sql`
    SELECT id, name, batch_number, expiry_date::text, quantity,
      (expiry_date - CURRENT_DATE) as days_until_expiry
    FROM medicines
    WHERE pharmacy_id = ${pharmacyId} AND expiry_date <= ${in90}
    ORDER BY expiry_date ASC
  `);
  const all = ((result as any).rows ?? result) as any[];

  const toItem = (r: any) => ({
    id:             parseInt(r.id),
    name:           r.name,
    batchNumber:    r.batch_number,
    expiryDate:     r.expiry_date,
    quantity:       parseInt(r.quantity),
    daysUntilExpiry: parseInt(r.days_until_expiry),
  });

  res.json({
    expired:  all.filter(r => r.expiry_date < today).map(toItem),
    within30: all.filter(r => r.expiry_date >= today && r.expiry_date <= in30).map(toItem),
    within60: all.filter(r => r.expiry_date > in30 && r.expiry_date <= in60).map(toItem),
    within90: all.filter(r => r.expiry_date > in60 && r.expiry_date <= in90).map(toItem),
  });
});

router.get("/dashboard/low-stock", requireAuth, subscriptionCheckMiddleware, requirePermission("dashboard.view"), async (req: any, res): Promise<void> => {
  const pharmacyId = req.user.pharmacyId ?? 1;

  const result = await db.execute(sql`
    SELECT id, name, quantity, reorder_level
    FROM medicines WHERE pharmacy_id = ${pharmacyId} AND quantity <= reorder_level ORDER BY quantity ASC
  `);
  const rows = (result as any).rows ?? result;
  res.json(rows.map((r: any) => ({
    id:           parseInt(r.id),
    name:         r.name,
    quantity:     parseInt(r.quantity),
    reorderLevel: parseInt(r.reorder_level),
  })));
});

export default router;
