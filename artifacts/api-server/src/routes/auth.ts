import { Router, type IRouter } from "express";
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "crypto";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { LoginBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const SESSION_SECRET = process.env.SESSION_SECRET ?? "sanjay-medical-secret-key";

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
  const hashBuffer = Buffer.from(hash, "hex");
  const suppliedHash = scryptSync(password, salt, 64);
  return timingSafeEqual(hashBuffer, suppliedHash);
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

  req.user = user;
  next();
}

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));

  if (!user) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  const valid = verifyPassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  const token = generateToken(user.id);
  req.log.info({ userId: user.id }, "User logged in");

  res.json({
    user: { id: user.id, username: user.username, name: user.name, role: user.role },
    token,
  });
});

router.get("/auth/me", requireAuth, async (req: any, res): Promise<void> => {
  const user = req.user;
  res.json({ id: user.id, username: user.username, name: user.name, role: user.role });
});

router.post("/auth/logout", requireAuth, async (req: any, res): Promise<void> => {
  const authHeader = req.headers.authorization as string | undefined;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (token) tokenStore.delete(token);
  res.json({ success: true });
});

export { router as authRouter };
export default router;
