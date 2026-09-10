import { randomBytes, scryptSync } from "crypto";
import {
  db,
  pharmaciesTable,
  rolesTable,
  permissionsTable,
  rolePermissionsTable,
  plansTable,
  subscriptionsTable,
  usersTable,
  categoriesTable,
  suppliersTable,
  medicinesTable,
  customersTable
} from "@workspace/db";
import { eq } from "drizzle-orm";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export async function seedDatabase() {
  console.log("🌱 Starting Database Seeding...");

  // 1. Seed System Permissions
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

  const permissionMap = new Map<string, number>();
  for (const p of permissionsData) {
    let [existing] = await db.select().from(permissionsTable).where(eq(permissionsTable.key, p.key));
    if (!existing) {
      [existing] = await db.insert(permissionsTable).values(p).returning();
    }
    permissionMap.set(p.key, existing.id);
  }
  console.log(`✓ Seeded ${permissionMap.size} permissions`);

  // 2. Seed Default Plans
  const plansData = [
    {
      id: "starter",
      name: "Starter",
      description: "Small retail pharmacy",
      priceMonthly: "29.00",
      priceYearly: "24.00",
      features: ["1 Location", "Up to 3 Staff Accounts", "POS & Billing", "Inventory Tracking"]
    },
    {
      id: "professional",
      name: "Professional",
      description: "Growing pharmacy with full RBAC",
      priceMonthly: "59.00",
      priceYearly: "49.00",
      features: ["1 Location", "Unlimited Staff", "Dynamic RBAC", "POS & Expiry Alerts", "Analytics"]
    },
    {
      id: "business",
      name: "Business",
      description: "High-volume pharmacy chain",
      priceMonthly: "99.00",
      priceYearly: "79.00",
      features: ["Multi-Location Ready", "Unlimited Staff & Roles", "SLA Guarantee", "Custom Branding"]
    },
  ];

  for (const pl of plansData) {
    const [existing] = await db.select().from(plansTable).where(eq(plansTable.id, pl.id));
    if (!existing) {
      await db.insert(plansTable).values(pl);
    }
  }
  console.log("✓ Seeded default subscription plans");

  // 3. Seed Default Pharmacy (Sanjay Medical Pharmacy)
  let [pharmacy] = await db.select().from(pharmaciesTable).where(eq(pharmaciesTable.id, 1));
  if (!pharmacy) {
    [pharmacy] = await db.insert(pharmaciesTable).values({
      name: "Sanjay Medical Pharmacy",
      address: "Horizon Chowk, Butwal, Nepal",
      phone: "+977 9800000000",
      email: "contact@sanjaymedical.com",
      status: "ACTIVE"
    }).returning();
  }
  console.log(`✓ Default pharmacy ready (ID: ${pharmacy.id})`);

  // 4. Seed Default Subscription for Pharmacy 1
  let [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.pharmacyId, pharmacy.id));
  if (!sub) {
    [sub] = await db.insert(subscriptionsTable).values({
      pharmacyId: pharmacy.id,
      planId: "professional",
      status: "ACTIVE"
    }).returning();
  }

  // 5. Seed System Default Roles for Pharmacy 1
  const rolesToCreate = [
    {
      name: "Pharmacy Admin",
      description: "Full administrative access to all pharmacy operations and staff settings",
      isSystem: true,
      allKeys: Array.from(permissionMap.keys())
    },
    {
      name: "Pharmacist",
      description: "Manage medicines, inventory, purchases, sales, and customers",
      isSystem: true,
      allKeys: [
        "dashboard.view", "medicine.view", "medicine.create", "medicine.update",
        "inventory.view", "inventory.adjust", "sale.view", "sale.create", "sale.return",
        "purchase.view", "purchase.create", "customer.view", "customer.create", "customer.update",
        "supplier.view", "supplier.create", "report.view"
      ]
    },
    {
      name: "Cashier",
      description: "Process checkout sales and view basic customer profiles",
      isSystem: true,
      allKeys: [
        "dashboard.view", "sale.view", "sale.create", "customer.view", "customer.create"
      ]
    }
  ];

  const roleIdMap = new Map<string, number>();

  for (const r of rolesToCreate) {
    let [roleRow] = await db.select().from(rolesTable)
      .where(eq(rolesTable.pharmacyId, pharmacy.id));
    
    // Find role by name
    const [existingRole] = await db.select().from(rolesTable)
      .where(eq(rolesTable.name, r.name));
    
    if (!existingRole) {
      [roleRow] = await db.insert(rolesTable).values({
        pharmacyId: pharmacy.id,
        name: r.name,
        description: r.description,
        isSystem: r.isSystem
      }).returning();
    } else {
      roleRow = existingRole;
    }

    roleIdMap.set(r.name, roleRow.id);

    // Assign permissions
    for (const key of r.allKeys) {
      const permId = permissionMap.get(key);
      if (permId) {
        const [existRel] = await db.select().from(rolePermissionsTable)
          .where(eq(rolePermissionsTable.roleId, roleRow.id));
        
        try {
          await db.insert(rolePermissionsTable).values({
            roleId: roleRow.id,
            permissionId: permId
          }).onConflictDoNothing();
        } catch (_) {}
      }
    }
  }
  console.log("✓ Seeded default roles & role permissions");

  // 6. Seed Users
  // Super Admin
  const [superadmin] = await db.select().from(usersTable).where(eq(usersTable.username, "superadmin"));
  if (!superadmin) {
    await db.insert(usersTable).values({
      pharmacyId: null,
      username: "superadmin",
      passwordHash: hashPassword("admin123"),
      name: "SaaS Super Admin",
      role: "admin",
      isSuperAdmin: true,
      status: "ACTIVE"
    });
  } else {
    await db.update(usersTable)
      .set({ passwordHash: hashPassword("admin123"), status: "ACTIVE" })
      .where(eq(usersTable.id, superadmin.id));
  }

  // Pharmacy Admin user
  const adminRoleId = roleIdMap.get("Pharmacy Admin");
  const [adminUser] = await db.select().from(usersTable).where(eq(usersTable.username, "admin"));
  if (!adminUser) {
    await db.insert(usersTable).values({
      pharmacyId: pharmacy.id,
      username: "admin",
      passwordHash: hashPassword("admin123"),
      name: "Sanjay Medical Admin",
      role: "admin",
      roleId: adminRoleId,
      isSuperAdmin: false,
      status: "ACTIVE"
    });
  } else {
    await db.update(usersTable)
      .set({ pharmacyId: pharmacy.id, roleId: adminRoleId, passwordHash: hashPassword("admin123"), status: "ACTIVE" })
      .where(eq(usersTable.id, adminUser.id));
  }

  // Cashier user
  const cashierRoleId = roleIdMap.get("Cashier");
  const [cashierUser] = await db.select().from(usersTable).where(eq(usersTable.username, "cashier"));
  if (!cashierUser) {
    await db.insert(usersTable).values({
      pharmacyId: pharmacy.id,
      username: "cashier",
      passwordHash: hashPassword("cashier123"),
      name: "Main Counter Cashier",
      role: "cashier",
      roleId: cashierRoleId,
      isSuperAdmin: false,
      status: "ACTIVE"
    });
  } else {
    await db.update(usersTable)
      .set({ pharmacyId: pharmacy.id, roleId: cashierRoleId, passwordHash: hashPassword("cashier123"), status: "ACTIVE" })
      .where(eq(usersTable.id, cashierUser.id));
  }

  console.log("✓ Seeded superadmin, admin, and cashier users");

  // 7. Seed Categories for Pharmacy 1
  const categoriesList = ["Antibiotics", "Painkillers", "Vitamins & Supplements", "Cardiovascular", "First Aid"];
  const catIdMap = new Map<string, number>();
  for (const catName of categoriesList) {
    let [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.name, catName));
    if (!cat) {
      [cat] = await db.insert(categoriesTable).values({
        pharmacyId: pharmacy.id,
        name: catName,
        description: `${catName} category`
      }).returning();
    } else if (!cat.pharmacyId) {
      await db.update(categoriesTable).set({ pharmacyId: pharmacy.id }).where(eq(categoriesTable.id, cat.id));
    }
    catIdMap.set(catName, cat.id);
  }

  // 8. Seed Suppliers for Pharmacy 1
  let [sup] = await db.select().from(suppliersTable).where(eq(suppliersTable.name, "Nepal Pharma Distributors"));
  if (!sup) {
    [sup] = await db.insert(suppliersTable).values({
      pharmacyId: pharmacy.id,
      name: "Nepal Pharma Distributors",
      contactPerson: "Ramesh Thapa",
      phone: "+977-9841234567",
      email: "supply@nepalpharma.com",
      address: "Kathmandu, Nepal"
    }).returning();
  }

  // 9. Seed Medicines for Pharmacy 1 if empty
  const [medCount] = await db.select().from(medicinesTable).where(eq(medicinesTable.pharmacyId, pharmacy.id));
  if (!medCount) {
    const today = new Date();
    const expiry6Months = new Date(today.getTime() + 180 * 86400000).toISOString().split("T")[0];
    const expiry45Days = new Date(today.getTime() + 45 * 86400000).toISOString().split("T")[0];

    await db.insert(medicinesTable).values([
      {
        pharmacyId: pharmacy.id,
        name: "Paracetamol 500mg Tablet",
        genericName: "Paracetamol",
        brandName: "Cetamol",
        categoryId: catIdMap.get("Painkillers"),
        batchNumber: "PAR-2026-09",
        barcode: "8901234567890",
        expiryDate: expiry6Months,
        quantity: 150,
        purchasePrice: "8.00",
        sellingPrice: "12.50",
        vatPercent: "13.00",
        supplierId: sup.id,
        storageLocation: "Shelf A-1",
        reorderLevel: 20
      },
      {
        pharmacyId: pharmacy.id,
        name: "Amoxicillin 250mg Capsule",
        genericName: "Amoxicillin Trihydrate",
        brandName: "Mox 250",
        categoryId: catIdMap.get("Antibiotics"),
        batchNumber: "AMX-2026-01",
        barcode: "8901234567891",
        expiryDate: expiry45Days,
        quantity: 80,
        purchasePrice: "12.00",
        sellingPrice: "18.00",
        vatPercent: "13.00",
        supplierId: sup.id,
        storageLocation: "Shelf B-3",
        reorderLevel: 15
      },
      {
        pharmacyId: pharmacy.id,
        name: "Vitamin C 500mg Chewable",
        genericName: "Ascorbic Acid",
        brandName: "C-Vitam",
        categoryId: catIdMap.get("Vitamins & Supplements"),
        batchNumber: "VTC-2026-12",
        barcode: "8901234567892",
        expiryDate: expiry6Months,
        quantity: 200,
        purchasePrice: "5.00",
        sellingPrice: "9.50",
        vatPercent: "0.00",
        supplierId: sup.id,
        storageLocation: "Counter Shelf C",
        reorderLevel: 25
      },
    ]);
    console.log("✓ Seeded demo medicines for Sanjay Medical Pharmacy");
  }

  console.log("✅ Seeding completed successfully!");
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].includes("seed")) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seeding failed:", err);
      process.exit(1);
    });
}

