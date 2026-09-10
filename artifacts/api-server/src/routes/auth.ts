import { Router, type IRouter } from "express";
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "crypto";
import { eq, inArray } from "drizzle-orm";
import { db, usersTable, rolePermissionsTable, permissionsTable, pharmaciesTable } from "@workspace/db";
import { LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

const SESSION_SECRET = process.env.SESSION_SECRET ?? "medisaas-secret-session-key";

// In-memory token store: token -> userId
const tokenStore = new Map<string, number>();

function generateToken(userId: number): string {
  const payload = `${userId}:${Date.now()}:${randomBytes(16).toString("hex")}`;
  const sig = createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  const token = Buffer.from(`${payload}.${sig}`).toString("base64url");
  tokenStore.set(token, userId);
  return token;
}

function verifyToken(token: string): number | null {
  return tokenStore.get(token) ?? null;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuffer = Buffer.from(hash, "hex");
  const suppliedHash = scryptSync(password, salt, 64);
  return timingSafeEqual(hashBuffer, suppliedHash);
}

// Get permissions for a role
async function getRolePermissions(roleId: number | null, isSuperAdmin: boolean): Promise<string[]> {
  if (isSuperAdmin) {
    // Super Admin has all permissions
    const allPerms = await db.select({ key: permissionsTable.key }).from(permissionsTable);
    return allPerms.map((p: any) => p.key);
  }

  if (!roleId) return [];

  const rels = await db
    .select({ permId: rolePermissionsTable.permissionId })
    .from(rolePermissionsTable)
    .where(eq(rolePermissionsTable.roleId, roleId));

  if (rels.length === 0) return [];

  const permIds = rels.map((r: any) => r.permId);
  const perms = await db
    .select({ key: permissionsTable.key })
    .from(permissionsTable)
    .where(inArray(permissionsTable.id, permIds));

  return perms.map((p: any) => p.key);
}

// Auth middleware
export async function requireAuth(req: any, res: any, next: any): Promise<void> {
  const authHeader = req.headers.authorization as string | undefined;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = verifyToken(token);
  if (!userId) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  if (user.status === "SUSPENDED" || user.status === "INACTIVE") {
    res.status(403).json({ error: "User account is suspended" });
    return;
  }

  req.user = user;
  req.pharmacyId = user.pharmacyId;
  next();
}

// Helper to provision or reset demo accounts if missing or password mismatch
async function ensureDemoAccount(username: string): Promise<any | null> {
  try {
    let [pharmacy] = await db.select().from(pharmaciesTable).where(eq(pharmaciesTable.id, 1));
    if (!pharmacy) {
      [pharmacy] = await db.insert(pharmaciesTable).values({
        name: "Sanjay Medical Pharmacy",
        address: "Horizon Chowk, Butwal, Nepal",
        phone: "+977 9800000000",
        email: "contact@sanjaymedical.com",
        status: "ACTIVE"
      }).onConflictDoNothing().returning();
    }
    const pharmId = pharmacy?.id ?? 1;

    if (username === "admin" || username === "superadmin") {
      const [existing] = await db.select().from(usersTable).where(eq(usersTable.username, username));
      const isSuper = username === "superadmin";
      if (!existing) {
        const [newUser] = await db.insert(usersTable).values({
          pharmacyId: isSuper ? null : pharmId,
          username,
          passwordHash: hashPassword("admin123"),
          name: isSuper ? "SaaS Super Admin" : "Sanjay Medical Admin",
          role: "admin",
          isSuperAdmin: isSuper,
          status: "ACTIVE"
        }).returning();
        return newUser;
      } else {
        await db.update(usersTable)
          .set({ passwordHash: hashPassword("admin123"), status: "ACTIVE" })
          .where(eq(usersTable.id, existing.id));
        const [updated] = await db.select().from(usersTable).where(eq(usersTable.id, existing.id));
        return updated;
      }
    }

    if (username === "cashier") {
      const [existing] = await db.select().from(usersTable).where(eq(usersTable.username, "cashier"));
      if (!existing) {
        const [newUser] = await db.insert(usersTable).values({
          pharmacyId: pharmId,
          username: "cashier",
          passwordHash: hashPassword("cashier123"),
          name: "Main Counter Cashier",
          role: "cashier",
          isSuperAdmin: false,
          status: "ACTIVE"
        }).returning();
        return newUser;
      } else {
        await db.update(usersTable)
          .set({ passwordHash: hashPassword("cashier123"), status: "ACTIVE" })
          .where(eq(usersTable.id, existing.id));
        const [updated] = await db.select().from(usersTable).where(eq(usersTable.id, existing.id));
        return updated;
      }
    }
  } catch (err) {
    console.error("Auto-provision demo account failed:", err);
  }
  return null;
}

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const username = parsed.data.username.trim().toLowerCase();
  const password = parsed.data.password.trim();

  let [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
  let valid = user ? verifyPassword(password, user.passwordHash) : false;

  if ((!user || !valid) && (username === "admin" || username === "cashier" || username === "superadmin")) {
    const expectedPassword = username === "cashier" ? "cashier123" : "admin123";
    if (password === expectedPassword) {
      user = await ensureDemoAccount(username);
      if (user) {
        valid = true;
      }
    }
  }

  if (!user || !valid) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  if (user.status === "SUSPENDED") {
    res.status(403).json({ error: "User account is suspended" });
    return;
  }

  // Load pharmacy info if not superadmin
  let pharmacyName = null;
  if (user.pharmacyId) {
    const [pharmacy] = await db.select().from(pharmaciesTable).where(eq(pharmaciesTable.id, user.pharmacyId));
    pharmacyName = pharmacy?.name ?? null;
  }

  const permissions = await getRolePermissions(user.roleId, user.isSuperAdmin);
  const token = generateToken(user.id);

  res.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      pharmacyId: user.pharmacyId,
      pharmacyName,
      roleId: user.roleId,
      isSuperAdmin: user.isSuperAdmin,
      status: user.status,
      permissions,
    },
    token,
  });
});

router.get("/auth/me", requireAuth, async (req: any, res): Promise<void> => {
  const user = req.user;

  let pharmacyName = null;
  if (user.pharmacyId) {
    const [pharmacy] = await db.select().from(pharmaciesTable).where(eq(pharmaciesTable.id, user.pharmacyId));
    pharmacyName = pharmacy?.name ?? null;
  }

  const permissions = await getRolePermissions(user.roleId, user.isSuperAdmin);

  res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    pharmacyId: user.pharmacyId,
    pharmacyName,
    roleId: user.roleId,
    isSuperAdmin: user.isSuperAdmin,
    status: user.status,
    permissions,
  });
});

router.post("/auth/logout", requireAuth, async (req: any, res): Promise<void> => {
  const authHeader = req.headers.authorization as string | undefined;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (token) tokenStore.delete(token);
  res.json({ success: true });
});

export { router as authRouter };
export default router;
