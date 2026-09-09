import { Router, type IRouter } from "express";
import { eq, and, inArray } from "drizzle-orm";
import {
  db,
  rolesTable,
  permissionsTable,
  rolePermissionsTable,
  usersTable,
  pharmaciesTable
} from "@workspace/db";
import { requireAuth, hashPassword } from "./auth";
import { requirePermission } from "../middlewares/rbac";
import { subscriptionCheckMiddleware } from "../middlewares/subscription";

const router: IRouter = Router();

// GET /api/permissions - List all system permissions
router.get("/permissions", requireAuth, subscriptionCheckMiddleware, async (req: any, res): Promise<void> => {
  const perms = await db.select().from(permissionsTable).orderBy(permissionsTable.module, permissionsTable.name);
  res.json(perms);
});

// GET /api/roles - List roles for current pharmacy
router.get("/roles", requireAuth, subscriptionCheckMiddleware, requirePermission("role.view"), async (req: any, res): Promise<void> => {
  const pharmacyId = req.user.pharmacyId;
  if (!pharmacyId && !req.user.isSuperAdmin) {
    res.status(403).json({ error: "Tenant context missing" });
    return;
  }

  const conditions = [];
  if (!req.user.isSuperAdmin && pharmacyId) {
    conditions.push(eq(rolesTable.pharmacyId, pharmacyId));
  }

  const roles = await db.select().from(rolesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(rolesTable.name);

  const enrichedRoles = await Promise.all(
    roles.map(async (role: any) => {
      // Get permissions assigned to this role
      const rels = await db.select().from(rolePermissionsTable).where(eq(rolePermissionsTable.roleId, role.id));
      const permIds = rels.map((r: any) => r.permissionId);
      
      let permKeys: string[] = [];
      if (permIds.length > 0) {
        const pList = await db.select({ key: permissionsTable.key }).from(permissionsTable).where(inArray(permissionsTable.id, permIds));
        permKeys = pList.map((p: any) => p.key);
      }

      // Count assigned staff members
      const [userCountRes] = await db.select().from(usersTable).where(eq(usersTable.roleId, role.id));

      return {
        id: role.id,
        pharmacyId: role.pharmacyId,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        permissions: permKeys,
        permissionIds: permIds,
        userCount: userCountRes ? 1 : 0,
        createdAt: role.createdAt.toISOString(),
      };
    })
  );

  res.json(enrichedRoles);
});

// POST /api/roles - Create custom role
router.post("/roles", requireAuth, subscriptionCheckMiddleware, requirePermission("role.create"), async (req: any, res): Promise<void> => {
  const pharmacyId = req.user.pharmacyId;
  if (!pharmacyId && !req.user.isSuperAdmin) {
    res.status(403).json({ error: "Tenant context missing" });
    return;
  }

  const { name, description, permissionKeys } = req.body;
  if (!name) {
    res.status(400).json({ error: "Role name is required" });
    return;
  }

  const activePharmacyId = pharmacyId ?? (req.body.pharmacyId || 1);

  const [newRole] = await db.insert(rolesTable).values({
    pharmacyId: activePharmacyId,
    name,
    description: description || null,
    isSystem: false,
  }).returning();

  // Assign permissions
  if (Array.isArray(permissionKeys) && permissionKeys.length > 0) {
    const permRows = await db.select().from(permissionsTable).where(inArray(permissionsTable.key, permissionKeys));
    for (const p of permRows) {
      await db.insert(rolePermissionsTable).values({
        roleId: newRole.id,
        permissionId: p.id,
      }).onConflictDoNothing();
    }
  }

  res.status(201).json({
    id: newRole.id,
    pharmacyId: newRole.pharmacyId,
    name: newRole.name,
    description: newRole.description,
    isSystem: newRole.isSystem,
    permissions: permissionKeys || [],
    createdAt: newRole.createdAt.toISOString(),
  });
});

// PUT /api/roles/:id - Update role & permissions
router.put("/roles/:id", requireAuth, subscriptionCheckMiddleware, requirePermission("role.update"), async (req: any, res): Promise<void> => {
  const roleId = parseInt(req.params.id);
  const pharmacyId = req.user.pharmacyId;

  const conditions = [eq(rolesTable.id, roleId)];
  if (!req.user.isSuperAdmin && pharmacyId) {
    conditions.push(eq(rolesTable.pharmacyId, pharmacyId));
  }

  const [existingRole] = await db.select().from(rolesTable).where(and(...conditions));
  if (!existingRole) {
    res.status(404).json({ error: "Role not found" });
    return;
  }

  const { name, description, permissionKeys } = req.body;

  const [updatedRole] = await db.update(rolesTable)
    .set({
      name: name ?? existingRole.name,
      description: description !== undefined ? description : existingRole.description,
    })
    .where(and(...conditions))
    .returning();

  // Update permissions
  if (Array.isArray(permissionKeys)) {
    // Delete existing permissions for role
    await db.delete(rolePermissionsTable).where(eq(rolePermissionsTable.roleId, roleId));

    if (permissionKeys.length > 0) {
      const permRows = await db.select().from(permissionsTable).where(inArray(permissionsTable.key, permissionKeys));
      for (const p of permRows) {
        await db.insert(rolePermissionsTable).values({
          roleId: roleId,
          permissionId: p.id,
        }).onConflictDoNothing();
      }
    }
  }

  res.json({
    id: updatedRole.id,
    pharmacyId: updatedRole.pharmacyId,
    name: updatedRole.name,
    description: updatedRole.description,
    isSystem: updatedRole.isSystem,
    permissions: permissionKeys || [],
    createdAt: updatedRole.createdAt.toISOString(),
  });
});

// DELETE /api/roles/:id - Delete custom role
router.delete("/roles/:id", requireAuth, subscriptionCheckMiddleware, requirePermission("role.delete"), async (req: any, res): Promise<void> => {
  const roleId = parseInt(req.params.id);
  const pharmacyId = req.user.pharmacyId;

  const conditions = [eq(rolesTable.id, roleId)];
  if (!req.user.isSuperAdmin && pharmacyId) {
    conditions.push(eq(rolesTable.pharmacyId, pharmacyId));
  }

  const [existingRole] = await db.select().from(rolesTable).where(and(...conditions));
  if (!existingRole) {
    res.status(404).json({ error: "Role not found" });
    return;
  }

  if (existingRole.isSystem) {
    res.status(400).json({ error: "System default roles cannot be deleted" });
    return;
  }

  await db.delete(rolesTable).where(and(...conditions));
  res.sendStatus(204);
});

// GET /api/users - List staff users for pharmacy
router.get("/users", requireAuth, subscriptionCheckMiddleware, requirePermission("staff.view"), async (req: any, res): Promise<void> => {
  const pharmacyId = req.user.pharmacyId;
  const conditions = [];

  if (!req.user.isSuperAdmin && pharmacyId) {
    conditions.push(eq(usersTable.pharmacyId, pharmacyId));
  }

  const users = await db.select().from(usersTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(usersTable.name);

  const result = await Promise.all(
    users.map(async (u: any) => {
      let roleName = "Unassigned";
      if (u.roleId) {
        const [r] = await db.select({ name: rolesTable.name }).from(rolesTable).where(eq(rolesTable.id, u.roleId));
        if (r) roleName = r.name;
      }
      return {
        id: u.id,
        pharmacyId: u.pharmacyId,
        username: u.username,
        name: u.name,
        role: u.role,
        roleId: u.roleId,
        roleName,
        isSuperAdmin: u.isSuperAdmin,
        status: u.status,
        createdAt: u.createdAt.toISOString(),
      };
    })
  );

  res.json(result);
});

// POST /api/users - Create new staff user
router.post("/users", requireAuth, subscriptionCheckMiddleware, requirePermission("staff.create"), async (req: any, res): Promise<void> => {
  const pharmacyId = req.user.pharmacyId;
  if (!pharmacyId && !req.user.isSuperAdmin) {
    res.status(403).json({ error: "Tenant context missing" });
    return;
  }

  const { username, password, name, roleId } = req.body;
  if (!username || !password || !name) {
    res.status(400).json({ error: "Username, password, and name are required" });
    return;
  }

  const activePharmacyId = pharmacyId ?? (req.body.pharmacyId || 1);

  // Check username uniqueness
  const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.username, username));
  if (existingUser) {
    res.status(400).json({ error: "Username already taken" });
    return;
  }

  const [newUser] = await db.insert(usersTable).values({
    pharmacyId: activePharmacyId,
    username,
    passwordHash: hashPassword(password),
    name,
    role: "cashier",
    roleId: roleId ? parseInt(roleId) : null,
    isSuperAdmin: false,
    status: "ACTIVE",
  }).returning();

  res.status(201).json({
    id: newUser.id,
    pharmacyId: newUser.pharmacyId,
    username: newUser.username,
    name: newUser.name,
    roleId: newUser.roleId,
    status: newUser.status,
    createdAt: newUser.createdAt.toISOString(),
  });
});

export default router;
