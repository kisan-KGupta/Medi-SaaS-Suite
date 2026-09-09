import { pgTable, text, serial, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { pharmaciesTable } from "./pharmacies";
import { rolesTable } from "./roles_permissions";

export const roleEnum = pgEnum("role", ["admin", "cashier", "inventory_manager"]);
export const userStatusEnum = pgEnum("user_status", ["ACTIVE", "SUSPENDED", "INACTIVE"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  pharmacyId: integer("pharmacy_id").references(() => pharmaciesTable.id, { onDelete: "cascade" }), // nullable ONLY for SaaS Super Admin
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: roleEnum("role").notNull().default("cashier"), // retained for backward compatibility
  roleId: integer("role_id").references(() => rolesTable.id, { onDelete: "set null" }),
  isSuperAdmin: boolean("is_super_admin").notNull().default(false),
  status: userStatusEnum("status").notNull().default("ACTIVE"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
