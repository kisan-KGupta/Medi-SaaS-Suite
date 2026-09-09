import { pgTable, text, serial, timestamp, integer, numeric, date, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { suppliersTable } from "./suppliers";
import { medicinesTable } from "./medicines";
import { pharmaciesTable } from "./pharmacies";

export const purchasesTable = pgTable(
  "purchases",
  {
    id: serial("id").primaryKey(),
    pharmacyId: integer("pharmacy_id").notNull().references(() => pharmaciesTable.id, { onDelete: "cascade" }),
    supplierId: integer("supplier_id").notNull().references(() => suppliersTable.id, { onDelete: "restrict" }),
    invoiceNumber: text("invoice_number").notNull(),
    purchaseDate: date("purchase_date").notNull(),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_purchases_pharmacy_id").on(table.pharmacyId),
  ]
);

export const purchaseItemsTable = pgTable("purchase_items", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").notNull().references(() => purchasesTable.id, { onDelete: "cascade" }),
  medicineId: integer("medicine_id").notNull().references(() => medicinesTable.id, { onDelete: "restrict" }),
  medicineName: text("medicine_name").notNull(),
  quantity: integer("quantity").notNull(),
  purchasePrice: numeric("purchase_price", { precision: 12, scale: 2 }).notNull(),
  batchNumber: text("batch_number").notNull(),
  expiryDate: date("expiry_date").notNull(),
});

export const insertPurchaseSchema = createInsertSchema(purchasesTable).omit({ id: true, createdAt: true });
export const insertPurchaseItemSchema = createInsertSchema(purchaseItemsTable).omit({ id: true });
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type InsertPurchaseItem = z.infer<typeof insertPurchaseItemSchema>;
export type Purchase = typeof purchasesTable.$inferSelect;
export type PurchaseItem = typeof purchaseItemsTable.$inferSelect;
