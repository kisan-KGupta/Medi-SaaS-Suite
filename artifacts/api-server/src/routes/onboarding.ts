import { Router, type IRouter } from "express";
import { randomBytes, createHmac } from "crypto";
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
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth";

const router: IRouter = Router();
const SESSION_SECRET = process.env.SESSION_SECRET ?? "medisaas-secret-session-key";

// In-memory token generator helper (shared with auth.ts logic)
function generateToken(userId: number): string {
  const payload = `${userId}:${Date.now()}:${randomBytes(16).toString("hex")}`;
  const sig = createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

router.post("/public/register-pharmacy", async (req, res): Promise<void> => {
  const { adminName, email, password, pharmacyName, address, phone, planId } = req.body;

  if (!adminName || !email || !password || !pharmacyName) {
    res.status(400).json({ error: "All required fields (adminName, email, password, pharmacyName) must be provided." });
    return;
  }

  // Check if username / email already exists
  const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.username, email));
  if (existingUser) {
    res.status(400).json({ error: "An account with this email address already exists. Please log in." });
    return;
  }

  try {
    // 1. Create Pharmacy Tenant
    const [pharmacy] = await db.insert(pharmaciesTable).values({
      name: pharmacyName,
      address: address || null,
      phone: phone || null,
      email: email,
      status: "ACTIVE",
    }).returning();

    // 2. Provision System Default Permissions for Admin Role
    const allPerms = await db.select().from(permissionsTable);
    const [adminRole] = await db.insert(rolesTable).values({
      pharmacyId: pharmacy.id,
      name: "Pharmacy Admin",
      description: "Primary Administrator with full access",
      isSystem: true,
    }).returning();

    for (const p of allPerms) {
      await db.insert(rolePermissionsTable).values({
        roleId: adminRole.id,
        permissionId: p.id,
      }).onConflictDoNothing();
    }

    // Provision Cashier Role
    const [cashierRole] = await db.insert(rolesTable).values({
      pharmacyId: pharmacy.id,
      name: "Cashier",
      description: "Checkout POS and basic sales",
      isSystem: true,
    }).returning();

    const cashierPermKeys = ["dashboard.view", "sale.view", "sale.create", "customer.view", "customer.create"];
    for (const p of allPerms) {
      if (cashierPermKeys.includes(p.key)) {
        await db.insert(rolePermissionsTable).values({
          roleId: cashierRole.id,
          permissionId: p.id,
        }).onConflictDoNothing();
      }
    }

    // 3. Create Admin User
    const [adminUser] = await db.insert(usersTable).values({
      pharmacyId: pharmacy.id,
      username: email,
      passwordHash: hashPassword(password),
      name: adminName,
      role: "admin",
      roleId: adminRole.id,
      isSuperAdmin: false,
      status: "ACTIVE",
    }).returning();

    // 4. Create 14-Day Trial Subscription
    const endDate = new Date(Date.now() + 14 * 86400000);
    const [sub] = await db.insert(subscriptionsTable).values({
      pharmacyId: pharmacy.id,
      planId: planId || "professional",
      status: "TRIAL",
      endDate,
    }).returning();

    // Generate login bearer token
    const token = generateToken(adminUser.id);

    res.status(201).json({
      success: true,
      pharmacy: { id: pharmacy.id, name: pharmacy.name },
      user: { id: adminUser.id, username: adminUser.username, name: adminUser.name },
      subscription: { status: sub.status, planId: sub.planId, endDate: sub.endDate?.toISOString() },
      token,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to register pharmacy account: " + err.message });
  }
});

export default router;
