import { Response, NextFunction } from "express";
import { db, rolePermissionsTable, permissionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

export function requirePermission(permissionKey: string) {
  return async (req: any, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Super Admin bypasses permission checks
    if (user.isSuperAdmin) {
      next();
      return;
    }

    // If user has no assigned roleId, deny access
    if (!user.roleId) {
      res.status(403).json({ error: `Forbidden: No role assigned. Required permission: ${permissionKey}` });
      return;
    }

    try {
      // Find if role has the requested permission
      const [perm] = await db
        .select({ id: permissionsTable.id })
        .from(permissionsTable)
        .where(eq(permissionsTable.key, permissionKey));

      if (!perm) {
        // System permission key not registered yet, default allow or log warning
        next();
        return;
      }

      const [rel] = await db
        .select()
        .from(rolePermissionsTable)
        .where(
          and(
            eq(rolePermissionsTable.roleId, user.roleId),
            eq(rolePermissionsTable.permissionId, perm.id)
          )
        );

      if (!rel) {
        res.status(403).json({ error: `Forbidden: Insufficient permissions (${permissionKey} required)` });
        return;
      }

      next();
    } catch (err) {
      res.status(500).json({ error: "Internal server error during authorization check" });
    }
  };
}
