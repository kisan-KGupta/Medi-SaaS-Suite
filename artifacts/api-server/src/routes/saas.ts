import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import {
  db,
  pharmaciesTable,
  plansTable,
  subscriptionsTable,
  usersTable,
  rolesTable,
  permissionsTable,
  rolePermissionsTable
} from "@workspace/db";
import { requireAuth, hashPassword } from "./auth";

const router: IRouter = Router();

// Middleware to ensure user is SaaS Super Admin
function requireSuperAdmin(req: any, res: any, next: any): void {
  if (!req.user || !req.user.isSuperAdmin) {
    res.status(403).json({ error: "Forbidden: SaaS Super Admin access required." });
    return;
  }
  next();
}

// GET /api/saas/dashboard - SaaS Super Admin Stats
router.get("/saas/dashboard", requireAuth, requireSuperAdmin, async (_req, res): Promise<void> => {
  const [totalRes, activeRes, suspendedRes, activeSubRes] = await Promise.all([
    db.execute(sql`SELECT COUNT(*) as count FROM pharmacies`),
    db.execute(sql`SELECT COUNT(*) as count FROM pharmacies WHERE status = 'ACTIVE'`),
    db.execute(sql`SELECT COUNT(*) as count FROM pharmacies WHERE status = 'SUSPENDED'`),
    db.execute(sql`SELECT COUNT(*) as count FROM subscriptions WHERE status = 'ACTIVE' OR status = 'TRIAL'`),
  ]);

  const row = (r: any) => (r as any).rows?.[0] ?? (r as any)[0] ?? {};

  res.json({
    totalPharmacies: parseInt(row(totalRes).count ?? "0"),
    activePharmacies: parseInt(row(activeRes).count ?? "0"),
    suspendedPharmacies: parseInt(row(suspendedRes).count ?? "0"),
    activeSubscriptions: parseInt(row(activeSubRes).count ?? "0"),
  });
});

// GET /api/saas/pharmacies - List all pharmacies
router.get("/saas/pharmacies", requireAuth, requireSuperAdmin, async (_req, res): Promise<void> => {
  const pharmacies = await db.select().from(pharmaciesTable).orderBy(sql`${pharmaciesTable.createdAt} DESC`);

  const results = await Promise.all(
    pharmacies.map(async (p: any) => {
      const [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.pharmacyId, p.id));
      const [adminUser] = await db.select().from(usersTable).where(eq(usersTable.pharmacyId, p.id));
      let planName = "Trial / None";
      if (sub) {
        const [plan] = await db.select().from(plansTable).where(eq(plansTable.id, sub.planId));
        if (plan) planName = plan.name;
      }

      return {
        id: p.id,
        name: p.name,
        address: p.address,
        phone: p.phone,
        email: p.email,
        status: p.status,
        planName,
        subscriptionStatus: sub?.status ?? "TRIAL",
        adminEmail: adminUser?.username ?? p.email,
        createdAt: p.createdAt.toISOString(),
      };
    })
  );

  res.json(results);
});

// POST /api/saas/pharmacies - Create new pharmacy (Onboarding by Super Admin)
router.post("/saas/pharmacies", requireAuth, requireSuperAdmin, async (req, res): Promise<void> => {
  const { name, address, phone, email, adminName, adminEmail, adminPassword, planId } = req.body;

  if (!name || !adminEmail || !adminPassword) {
    res.status(400).json({ error: "Pharmacy name, admin email, and password are required" });
    return;
  }

  // 1. Create pharmacy
  const [pharmacy] = await db.insert(pharmaciesTable).values({
    name,
    address: address || null,
    phone: phone || null,
    email: email || adminEmail,
    status: "ACTIVE",
  }).returning();

  // 2. Create default Admin Role for this pharmacy
  const allPerms = await db.select().from(permissionsTable);
  const [adminRole] = await db.insert(rolesTable).values({
    pharmacyId: pharmacy.id,
    name: "Pharmacy Admin",
    description: "Full pharmacy administrator privileges",
    isSystem: true,
  }).returning();

  for (const p of allPerms) {
    await db.insert(rolePermissionsTable).values({
      roleId: adminRole.id,
      permissionId: p.id,
    }).onConflictDoNothing();
  }

  // 3. Create Admin User
  const [adminUser] = await db.insert(usersTable).values({
    pharmacyId: pharmacy.id,
    username: adminEmail,
    passwordHash: hashPassword(adminPassword),
    name: adminName || "Pharmacy Admin",
    role: "admin",
    roleId: adminRole.id,
    isSuperAdmin: false,
    status: "ACTIVE",
  }).returning();

  // 4. Create Subscription
  const [sub] = await db.insert(subscriptionsTable).values({
    pharmacyId: pharmacy.id,
    planId: planId || "professional",
    status: "ACTIVE",
  }).returning();

  res.status(201).json({
    pharmacy: { id: pharmacy.id, name: pharmacy.name, status: pharmacy.status },
    admin: { id: adminUser.id, username: adminUser.username },
    subscription: { id: sub.id, status: sub.status, planId: sub.planId },
  });
});

// PATCH /api/saas/pharmacies/:id/status - Update Pharmacy Status (Activate / Suspend)
router.patch("/saas/pharmacies/:id/status", requireAuth, requireSuperAdmin, async (req, res): Promise<void> => {
  const pharmacyId = parseInt(req.params.id);
  const { status } = req.body;

  if (!["ACTIVE", "SUSPENDED", "INACTIVE"].includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const [pharmacy] = await db.update(pharmaciesTable)
    .set({ status })
    .where(eq(pharmaciesTable.id, pharmacyId))
    .returning();

  if (!pharmacy) {
    res.status(404).json({ error: "Pharmacy not found" });
    return;
  }

  // Also update subscription status if suspended
  if (status === "SUSPENDED") {
    await db.update(subscriptionsTable)
      .set({ status: "SUSPENDED" })
      .where(eq(subscriptionsTable.pharmacyId, pharmacyId));
  } else if (status === "ACTIVE") {
    await db.update(subscriptionsTable)
      .set({ status: "ACTIVE" })
      .where(eq(subscriptionsTable.pharmacyId, pharmacyId));
  }

  res.json(pharmacy);
});

// GET /api/saas/plans - List subscription plans
router.get("/saas/plans", requireAuth, requireSuperAdmin, async (_req, res): Promise<void> => {
  const plans = await db.select().from(plansTable).orderBy(plansTable.priceMonthly);
  res.json(plans);
});

// POST /api/saas/plans - Create/Update Plan
router.post("/saas/plans", requireAuth, requireSuperAdmin, async (req, res): Promise<void> => {
  const { id, name, description, priceMonthly, priceYearly, features } = req.body;
  if (!id || !name || !priceMonthly) {
    res.status(400).json({ error: "Plan ID, name, and priceMonthly are required" });
    return;
  }

  const [plan] = await db.insert(plansTable).values({
    id,
    name,
    description: description || null,
    priceMonthly: String(priceMonthly),
    priceYearly: String(priceYearly || priceMonthly),
    features: Array.isArray(features) ? features : [],
    status: "ACTIVE"
  }).onConflictDoUpdate({
    target: plansTable.id,
    set: {
      name,
      description,
      priceMonthly: String(priceMonthly),
      priceYearly: String(priceYearly),
      features,
    }
  }).returning();

  res.json(plan);
});

// GET /api/saas/subscriptions - List subscriptions
router.get("/saas/subscriptions", requireAuth, requireSuperAdmin, async (_req, res): Promise<void> => {
  const subs = await db.select().from(subscriptionsTable);

  const results = await Promise.all(
    subs.map(async (s: any) => {
      const [p] = await db.select({ name: pharmaciesTable.name }).from(pharmaciesTable).where(eq(pharmaciesTable.id, s.pharmacyId));
      const [pl] = await db.select({ name: plansTable.name, priceMonthly: plansTable.priceMonthly }).from(plansTable).where(eq(plansTable.id, s.planId));
      return {
        id: s.id,
        pharmacyId: s.pharmacyId,
        pharmacyName: p?.name ?? "Unknown",
        planId: s.planId,
        planName: pl?.name ?? s.planId,
        priceMonthly: pl?.priceMonthly ?? "0.00",
        status: s.status,
        startDate: s.startDate.toISOString(),
      };
    })
  );

  res.json(results);
});

export default router;
