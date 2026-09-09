import { Response, NextFunction } from "express";
import { db, subscriptionsTable, pharmaciesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function subscriptionCheckMiddleware(req: any, res: Response, next: NextFunction): Promise<void> {
  const user = req.user;

  // Super Admin bypasses subscription checks
  if (user?.isSuperAdmin) {
    next();
    return;
  }

  const pharmacyId = req.pharmacyId ?? user?.pharmacyId;
  if (!pharmacyId) {
    next();
    return;
  }

  try {
    // Check pharmacy status
    const [pharmacy] = await db.select().from(pharmaciesTable).where(eq(pharmaciesTable.id, pharmacyId));
    if (pharmacy && pharmacy.status === "SUSPENDED") {
      res.status(403).json({ error: "Pharmacy account is suspended by SaaS Administrator." });
      return;
    }

    // Check subscription status
    const [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.pharmacyId, pharmacyId));
    if (sub) {
      if (sub.status === "SUSPENDED" || sub.status === "CANCELLED") {
        res.status(403).json({ error: "Pharmacy subscription is suspended or cancelled." });
        return;
      }
    }

    next();
  } catch (err) {
    next();
  }
}
