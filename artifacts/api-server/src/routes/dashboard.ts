import { Router, type IRouter } from "express";
import { gte, lte, and, sql, lt } from "drizzle-orm";
import { db, salesTable, saleItemsTable, medicinesTable } from "@workspace/db";
import { requireAuth } from "./auth";

const router: IRouter = Router();

function toDateString(d: Date): string {
  return d.toISOString().split("T")[0];
}

router.get("/dashboard/summary", requireAuth, async (_req, res): Promise<void> => {
  const now = new Date();
  const today = toDateString(now);

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);

  // Sales aggregates
  const [todayAgg] = await db.select({
    sales: sql<string>`coalesce(sum(${salesTable.totalAmount}), 0)`,
  }).from(salesTable).where(lte(salesTable.saleDate, today) && gte(salesTable.saleDate, today) as any);

  // Use raw SQL for date comparisons
  const todaySalesResult = await db.execute(
    sql`SELECT COALESCE(SUM(total_amount), 0) as sales, COALESCE(SUM(total_amount) - SUM(discount_amount), 0) as profit FROM sales WHERE sale_date = ${today}`
  );
  const weeklySalesResult = await db.execute(
    sql`SELECT COALESCE(SUM(total_amount), 0) as sales FROM sales WHERE sale_date >= ${toDateString(weekAgo)}`
  );
  const monthlySalesResult = await db.execute(
    sql`SELECT COALESCE(SUM(total_amount), 0) as sales FROM sales WHERE sale_date >= ${toDateString(monthAgo)}`
  );

  // Medicine counts
  const todayExpiry = toDateString(now);
  const in30 = toDateString(new Date(now.getTime() + 30 * 86400000));
  const in90 = toDateString(new Date(now.getTime() + 90 * 86400000));

  const [totalMedResult] = await db.execute(sql`SELECT COUNT(*) as count FROM medicines`);
  const [lowStockResult] = await db.execute(sql`SELECT COUNT(*) as count FROM medicines WHERE quantity <= reorder_level`);
  const [expiringResult] = await db.execute(sql`SELECT COUNT(*) as count FROM medicines WHERE expiry_date >= ${todayExpiry} AND expiry_date <= ${in30}`);
  const [expiredResult] = await db.execute(sql`SELECT COUNT(*) as count FROM medicines WHERE expiry_date < ${todayExpiry}`);
  const [invValueResult] = await db.execute(sql`SELECT COALESCE(SUM(quantity * purchase_price), 0) as value FROM medicines`);

  const todayRow = (todaySalesResult as any).rows?.[0] ?? todaySalesResult[0] ?? {};
  const weeklyRow = (weeklySalesResult as any).rows?.[0] ?? weeklySalesResult[0] ?? {};
  const monthlyRow = (monthlySalesResult as any).rows?.[0] ?? monthlySalesResult[0] ?? {};

  res.json({
    todaySales: parseFloat(todayRow.sales ?? "0"),
    weeklySales: parseFloat(weeklyRow.sales ?? "0"),
    monthlySales: parseFloat(monthlyRow.sales ?? "0"),
    todayProfit: parseFloat(todayRow.profit ?? "0"),
    totalMedicines: parseInt((totalMedResult as any).count ?? (totalMedResult as any).rows?.[0]?.count ?? "0"),
    lowStockCount: parseInt((lowStockResult as any).count ?? (lowStockResult as any).rows?.[0]?.count ?? "0"),
    expiringCount: parseInt((expiringResult as any).count ?? (expiringResult as any).rows?.[0]?.count ?? "0"),
    expiredCount: parseInt((expiredResult as any).count ?? (expiredResult as any).rows?.[0]?.count ?? "0"),
    inventoryValue: parseFloat((invValueResult as any).value ?? (invValueResult as any).rows?.[0]?.value ?? "0"),
  });
});

router.get("/dashboard/sales-chart", requireAuth, async (_req, res): Promise<void> => {
  const result = await db.execute(sql`
    SELECT 
      sale_date::text as date,
      COALESCE(SUM(total_amount), 0) as sales,
      COALESCE(SUM(total_amount - discount_amount - vat_amount), 0) as profit
    FROM sales
    WHERE sale_date >= (CURRENT_DATE - INTERVAL '30 days')
    GROUP BY sale_date
    ORDER BY sale_date ASC
  `);
  const rows = (result as any).rows ?? result;
  res.json(rows.map((r: any) => ({
    date: r.date,
    sales: parseFloat(r.sales),
    profit: parseFloat(r.profit),
  })));
});

router.get("/dashboard/top-medicines", requireAuth, async (_req, res): Promise<void> => {
  const result = await db.execute(sql`
    SELECT 
      si.medicine_id as id,
      si.medicine_name as name,
      SUM(si.quantity) as quantity_sold,
      SUM(si.total) as revenue
    FROM sale_items si
    JOIN sales s ON s.id = si.sale_id
    WHERE s.sale_date >= (CURRENT_DATE - INTERVAL '30 days')
    GROUP BY si.medicine_id, si.medicine_name
    ORDER BY quantity_sold DESC
    LIMIT 10
  `);
  const rows = (result as any).rows ?? result;
  res.json(rows.map((r: any) => ({
    id: parseInt(r.id),
    name: r.name,
    quantitySold: parseInt(r.quantity_sold),
    revenue: parseFloat(r.revenue),
  })));
});

router.get("/dashboard/expiry-alerts", requireAuth, async (_req, res): Promise<void> => {
  const today = toDateString(new Date());
  const in30 = toDateString(new Date(Date.now() + 30 * 86400000));
  const in60 = toDateString(new Date(Date.now() + 60 * 86400000));
  const in90 = toDateString(new Date(Date.now() + 90 * 86400000));

  const allResult = await db.execute(sql`
    SELECT id, name, batch_number, expiry_date::text, quantity,
      (expiry_date - CURRENT_DATE) as days_until_expiry
    FROM medicines
    WHERE expiry_date <= ${in90}
    ORDER BY expiry_date ASC
  `);
  const all = ((allResult as any).rows ?? allResult) as any[];

  const toItem = (r: any) => ({
    id: parseInt(r.id),
    name: r.name,
    batchNumber: r.batch_number,
    expiryDate: r.expiry_date,
    quantity: parseInt(r.quantity),
    daysUntilExpiry: parseInt(r.days_until_expiry),
  });

  res.json({
    expired: all.filter(r => r.expiry_date < today).map(toItem),
    within30: all.filter(r => r.expiry_date >= today && r.expiry_date <= in30).map(toItem),
    within60: all.filter(r => r.expiry_date > in30 && r.expiry_date <= in60).map(toItem),
    within90: all.filter(r => r.expiry_date > in60 && r.expiry_date <= in90).map(toItem),
  });
});

router.get("/dashboard/low-stock", requireAuth, async (_req, res): Promise<void> => {
  const result = await db.execute(sql`
    SELECT id, name, quantity, reorder_level
    FROM medicines
    WHERE quantity <= reorder_level
    ORDER BY quantity ASC
  `);
  const rows = (result as any).rows ?? result;
  res.json(rows.map((r: any) => ({
    id: parseInt(r.id),
    name: r.name,
    quantity: parseInt(r.quantity),
    reorderLevel: parseInt(r.reorder_level),
  })));
});

export default router;
