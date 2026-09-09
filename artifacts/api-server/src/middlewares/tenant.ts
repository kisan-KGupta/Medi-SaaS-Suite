import { Response, NextFunction } from "express";

export interface AuthenticatedUser {
  id: number;
  username: string;
  name: string;
  role: string;
  pharmacyId: number | null;
  roleId: number | null;
  isSuperAdmin: boolean;
  status: string;
}

export function tenantIsolationMiddleware(req: any, res: Response, next: NextFunction): void {
  const user = req.user as AuthenticatedUser | undefined;

  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Super Admin has platform-wide access
  if (user.isSuperAdmin) {
    req.pharmacyId = null;
    next();
    return;
  }

  // Pharmacy User MUST have an assigned pharmacyId
  if (!user.pharmacyId) {
    res.status(403).json({ error: "Forbidden: Account is not associated with any pharmacy tenant." });
    return;
  }

  if (user.status === "SUSPENDED" || user.status === "INACTIVE") {
    res.status(403).json({ error: "Forbidden: User account is suspended or inactive." });
    return;
  }

  // Attach pharmacyId for database query scoping
  req.pharmacyId = user.pharmacyId;
  next();
}
