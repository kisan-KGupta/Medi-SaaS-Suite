import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";
import { eq } from "drizzle-orm";
import { randomBytes, scryptSync } from "crypto";
import * as schema from "./schema";

const { Pool } = pg;

export let db: any;
export let pool: any = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzlePg(pool, { schema });
} else {
  console.log("ℹ️ DATABASE_URL not set — Initializing PGLite (in-memory Postgres DB)...");
  const pglite = new PGlite();
  db = drizzlePglite({ client: pglite, schema });
  
  // Provision schema DDL for in-memory PGLite and auto-seed
  initPgliteSchema(pglite)
    .then(() => seedPgliteData())
    .catch((err) => {
      console.error("Failed to initialize PGLite schema:", err);
    });
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export async function initPgliteSchema(pglite: PGlite) {
  await pglite.exec(`
    CREATE TYPE pharmacy_status AS ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE');
    CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE');
    CREATE TYPE role_enum AS ENUM ('admin', 'cashier', 'inventory_manager');
    CREATE TYPE subscription_status AS ENUM ('TRIAL', 'ACTIVE', 'EXPIRED', 'SUSPENDED', 'CANCELLED');

    CREATE TABLE IF NOT EXISTS pharmacies (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      email TEXT,
      logo TEXT,
      status pharmacy_status NOT NULL DEFAULT 'ACTIVE',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      pharmacy_id INTEGER REFERENCES pharmacies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      is_system BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id SERIAL PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      module TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
      PRIMARY KEY (role_id, permission_id)
    );

    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price_monthly NUMERIC(12, 2) NOT NULL,
      price_yearly NUMERIC(12, 2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      features TEXT[],
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      pharmacy_id INTEGER NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
      plan_id TEXT NOT NULL REFERENCES plans(id),
      status subscription_status NOT NULL DEFAULT 'TRIAL',
      start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      end_date TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      pharmacy_id INTEGER REFERENCES pharmacies(id) ON DELETE CASCADE,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role role_enum NOT NULL DEFAULT 'cashier',
      role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
      is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
      status user_status NOT NULL DEFAULT 'ACTIVE',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      pharmacy_id INTEGER NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id SERIAL PRIMARY KEY,
      pharmacy_id INTEGER NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS medicines (
      id SERIAL PRIMARY KEY,
      pharmacy_id INTEGER NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      generic_name TEXT NOT NULL,
      brand_name TEXT,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      batch_number TEXT NOT NULL,
      barcode TEXT,
      expiry_date DATE NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      purchase_price NUMERIC(12, 2) NOT NULL,
      selling_price NUMERIC(12, 2) NOT NULL,
      vat_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
      supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
      storage_location TEXT,
      reorder_level INTEGER NOT NULL DEFAULT 10,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      pharmacy_id INTEGER NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      credit_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id SERIAL PRIMARY KEY,
      pharmacy_id INTEGER NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
      supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
      invoice_number TEXT NOT NULL,
      purchase_date DATE NOT NULL,
      total_amount NUMERIC(12, 2) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS purchase_items (
      id SERIAL PRIMARY KEY,
      purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
      medicine_id INTEGER NOT NULL REFERENCES medicines(id) ON DELETE RESTRICT,
      medicine_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      purchase_price NUMERIC(12, 2) NOT NULL,
      batch_number TEXT NOT NULL,
      expiry_date DATE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sales (
      id SERIAL PRIMARY KEY,
      pharmacy_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
      bill_number TEXT NOT NULL,
      customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
      customer_name TEXT,
      customer_phone TEXT,
      sale_date DATE NOT NULL,
      subtotal NUMERIC(12, 2) NOT NULL,
      discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
      vat_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
      total_amount NUMERIC(12, 2) NOT NULL,
      paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
      is_credit BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id SERIAL PRIMARY KEY,
      sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
      medicine_id INTEGER NOT NULL REFERENCES medicines(id) ON DELETE RESTRICT,
      medicine_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price NUMERIC(12, 2) NOT NULL,
      discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
      vat_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
      total NUMERIC(12, 2) NOT NULL
    );
  `);
  console.log("✓ PGLite schema initialized");
}

async function seedPgliteData() {
  const {
    pharmaciesTable,
    rolesTable,
    permissionsTable,
    rolePermissionsTable,
    plansTable,
    subscriptionsTable,
    usersTable,
    categoriesTable,
    suppliersTable,
    medicinesTable
  } = schema;

  // 1. Seed Permissions
  const permissionsData = [
    { key: "dashboard.view", name: "View Dashboard", module: "dashboard", description: "Access dashboard stats and sales analytics" },
    { key: "medicine.view", name: "View Medicines", module: "medicines", description: "View medicine list and details" },
    { key: "medicine.create", name: "Create Medicine", module: "medicines", description: "Add new medicines to inventory" },
    { key: "medicine.update", name: "Update Medicine", module: "medicines", description: "Edit existing medicine info and prices" },
    { key: "medicine.delete", name: "Delete Medicine", module: "medicines", description: "Remove medicines from inventory" },
    { key: "inventory.view", name: "View Inventory", module: "inventory", description: "View stock levels and expiry alerts" },
    { key: "inventory.adjust", name: "Adjust Stock", module: "inventory", description: "Manually adjust stock quantities" },
    { key: "sale.view", name: "View Sales", module: "sales", description: "View sales history and bill details" },
    { key: "sale.create", name: "Create Sale (POS)", module: "sales", description: "Process sales transactions at checkout" },
    { key: "sale.cancel", name: "Cancel Sale", module: "sales", description: "Cancel or void completed sales" },
    { key: "sale.return", name: "Process Return", module: "sales", description: "Process customer item returns" },
    { key: "purchase.view", name: "View Purchases", module: "purchases", description: "View supplier purchase orders" },
    { key: "purchase.create", name: "Create Purchase", module: "purchases", description: "Log new shipment purchases" },
    { key: "customer.view", name: "View Customers", module: "customers", description: "View customer profiles and credit balances" },
    { key: "customer.create", name: "Create Customer", module: "customers", description: "Add new customers" },
    { key: "customer.update", name: "Update Customer", module: "customers", description: "Edit customer details and record payments" },
    { key: "supplier.view", name: "View Suppliers", module: "suppliers", description: "View supplier directory" },
    { key: "supplier.create", name: "Create Supplier", module: "suppliers", description: "Add new suppliers" },
    { key: "report.view", name: "View Analytics", module: "reports", description: "View financial reports and top medicine sales" },
    { key: "staff.view", name: "View Staff", module: "staff", description: "View list of pharmacy users" },
    { key: "staff.create", name: "Create Staff", module: "staff", description: "Create staff user accounts" },
    { key: "staff.update", name: "Update Staff", module: "staff", description: "Edit staff details and active status" },
    { key: "settings.view", name: "View Settings", module: "settings", description: "Access pharmacy settings" },
    { key: "settings.update", name: "Update Settings", module: "settings", description: "Modify pharmacy profile" },
    { key: "role.view", name: "View Roles", module: "roles", description: "View custom staff roles" },
    { key: "role.create", name: "Create Role", module: "roles", description: "Create custom roles with permissions" },
    { key: "role.update", name: "Update Role", module: "roles", description: "Modify role permissions" },
    { key: "role.delete", name: "Delete Role", module: "roles", description: "Remove custom roles" },
  ];

  for (const p of permissionsData) {
    await db.insert(permissionsTable).values(p).onConflictDoNothing();
  }
  const allPermRows = await db.select().from(permissionsTable);
  const permMap = new Map<string, number>();
  for (const p of allPermRows) {
    permMap.set(p.key, p.id);
  }

  // 2. Seed Plans
  const plansData = [
    { id: "starter", name: "Starter", description: "Small retail pharmacy", priceMonthly: "29.00", priceYearly: "24.00", features: ["1 Location", "Up to 3 Staff Accounts", "POS & Billing", "Inventory Tracking"] },
    { id: "professional", name: "Professional", description: "Growing pharmacy with full RBAC", priceMonthly: "59.00", priceYearly: "49.00", features: ["1 Location", "Unlimited Staff", "Dynamic RBAC", "POS & Expiry Alerts", "Analytics"] },
    { id: "business", name: "Business", description: "High-volume pharmacy chain", priceMonthly: "99.00", priceYearly: "79.00", features: ["Multi-Location Ready", "Unlimited Staff & Roles", "SLA Guarantee", "Custom Branding"] },
  ];
  for (const pl of plansData) {
    await db.insert(plansTable).values(pl).onConflictDoNothing();
  }

  // 3. Seed Pharmacy #1
  const [pharmacy] = await db.insert(pharmaciesTable).values({
    name: "Sanjay Medical Pharmacy",
    address: "Horizon Chowk, Butwal, Nepal",
    phone: "+977 9800000000",
    email: "contact@sanjaymedical.com",
    status: "ACTIVE"
  }).onConflictDoNothing().returning();

  const pharmId = pharmacy ? pharmacy.id : 1;

  // 4. Seed Subscription
  await db.insert(subscriptionsTable).values({
    pharmacyId: pharmId,
    planId: "professional",
    status: "ACTIVE"
  }).onConflictDoNothing();

  // 5. Seed Roles
  const [adminRole] = await db.insert(rolesTable).values({
    pharmacyId: pharmId,
    name: "Pharmacy Admin",
    description: "Full administrative access to all pharmacy operations and staff settings",
    isSystem: true
  }).onConflictDoNothing().returning();

  const [cashierRole] = await db.insert(rolesTable).values({
    pharmacyId: pharmId,
    name: "Cashier",
    description: "Process checkout sales and view basic customer profiles",
    isSystem: true
  }).onConflictDoNothing().returning();

  const existingRoles = await db.select().from(rolesTable).where(eq(rolesTable.pharmacyId, pharmId));
  const adminRoleId = adminRole?.id ?? existingRoles.find((r: any) => r.name === "Pharmacy Admin")?.id ?? 1;
  const cashierRoleId = cashierRole?.id ?? existingRoles.find((r: any) => r.name === "Cashier")?.id ?? 2;

  // Assign permissions to Pharmacy Admin
  for (const permId of permMap.values()) {
    await db.insert(rolePermissionsTable).values({ roleId: adminRoleId, permissionId: permId }).onConflictDoNothing();
  }

  // Assign permissions to Cashier
  const cashierKeys = ["dashboard.view", "sale.view", "sale.create", "customer.view", "customer.create"];
  for (const key of cashierKeys) {
    const permId = permMap.get(key);
    if (permId) {
      await db.insert(rolePermissionsTable).values({ roleId: cashierRoleId, permissionId: permId }).onConflictDoNothing();
    }
  }

  // 6. Seed Users
  // Super Admin
  await db.insert(usersTable).values({
    pharmacyId: null,
    username: "superadmin",
    passwordHash: hashPassword("admin123"),
    name: "SaaS Super Admin",
    role: "admin",
    isSuperAdmin: true,
    status: "ACTIVE"
  }).onConflictDoNothing();

  // Pharmacy Admin user
  await db.insert(usersTable).values({
    pharmacyId: pharmId,
    username: "admin",
    passwordHash: hashPassword("admin123"),
    name: "Sanjay Medical Admin",
    role: "admin",
    roleId: adminRoleId,
    isSuperAdmin: false,
    status: "ACTIVE"
  }).onConflictDoNothing();

  // Cashier user
  await db.insert(usersTable).values({
    pharmacyId: pharmId,
    username: "cashier",
    passwordHash: hashPassword("cashier123"),
    name: "Main Counter Cashier",
    role: "cashier",
    roleId: cashierRoleId,
    isSuperAdmin: false,
    status: "ACTIVE"
  }).onConflictDoNothing();

  // 7. Seed Demo Category, Supplier, Medicines
  const [cat] = await db.insert(categoriesTable).values({
    pharmacyId: pharmId,
    name: "Painkillers",
    description: "Analgesics and pain relief medicines"
  }).onConflictDoNothing().returning();

  const [sup] = await db.insert(suppliersTable).values({
    pharmacyId: pharmId,
    name: "Nepal Pharma Distributors",
    contactPerson: "Ramesh Thapa",
    phone: "+977-9841234567",
    email: "supply@nepalpharma.com",
    address: "Kathmandu, Nepal"
  }).onConflictDoNothing().returning();

  const today = new Date();
  const expiry6Months = new Date(today.getTime() + 180 * 86400000).toISOString().split("T")[0];

  await db.insert(medicinesTable).values([
    {
      pharmacyId: pharmId,
      name: "Paracetamol 500mg Tablet",
      genericName: "Paracetamol",
      brandName: "Cetamol",
      categoryId: cat?.id ?? 1,
      batchNumber: "PAR-2026-09",
      barcode: "8901234567890",
      expiryDate: expiry6Months,
      quantity: 150,
      purchasePrice: "8.00",
      sellingPrice: "12.50",
      vatPercent: "13.00",
      supplierId: sup?.id ?? 1,
      storageLocation: "Shelf A-1",
      reorderLevel: 20
    }
  ]).onConflictDoNothing();

  console.log("✓ Seeded PGLite demo users, roles, plans, and inventory");
}

export * from "./schema";
