import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { accessCodes } from "../src/api/database/schema";

const client = createClient({
  url: process.env.DATABASE_URL || "file:./local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const db = drizzle(client);

// Create tables
await client.executeMultiple(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    instagram TEXT,
    answers TEXT NOT NULL DEFAULT '[]',
    profile TEXT,
    access_code TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS access_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    name TEXT,
    hotmart_order_id TEXT,
    used INTEGER NOT NULL DEFAULT 0,
    used_at TEXT,
    expires_at TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS otp_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    access_code TEXT NOT NULL,
    email TEXT NOT NULL,
    otp TEXT NOT NULL,
    verified INTEGER NOT NULL DEFAULT 0,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

console.log("✓ Tabelas criadas");

// Insert admin code
try {
  await db.insert(accessCodes).values({
    code: "DIGI-GLOB",
    email: "digitalglobal2026fil@gmail.com",
    name: "Admin Digital Global",
    hotmartOrderId: null,
    used: false,
    createdAt: new Date().toISOString(),
  });
  console.log("✓ Código DIGI-GLOB inserido");
} catch {
  console.log("✓ Código DIGI-GLOB já existe");
}

console.log("✓ Base de dados pronta");
process.exit(0);
