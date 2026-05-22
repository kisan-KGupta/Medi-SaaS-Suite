import { pgTable, text, serial, timestamp, integer, numeric, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";
import { suppliersTable } from "./suppliers";

export const medicinesTable = pgTable("medicines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  genericName: text("generic_name").notNull(),
  brandName: text("brand_name"),
  categoryId: integer("category_id").references(() => categoriesTable.id, { onDelete: "set null" }),
  batchNumber: text("batch_number").notNull(),
  barcode: text("barcode"),
  expiryDate: date("expiry_date").notNull(),
  quantity: integer("quantity").notNull().default(0),
  purchasePrice: numeric("purchase_price", { precision: 12, scale: 2 }).notNull(),
  sellingPrice: numeric("selling_price", { precision: 12, scale: 2 }).notNull(),
  vatPercent: numeric("vat_percent", { precision: 5, scale: 2 }).notNull().default("0"),
  supplierId: integer("supplier_id").references(() => suppliersTable.id, { onDelete: "set null" }),
  storageLocation: text("storage_location"),
  reorderLevel: integer("reorder_level").notNull().default(10),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertMedicineSchema = createInsertSchema(medicinesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMedicine = z.infer<typeof insertMedicineSchema>;
export type Medicine = typeof medicinesTable.$inferSelect;
