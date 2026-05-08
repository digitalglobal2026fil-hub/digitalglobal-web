import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Leads do diagnóstico
export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  instagram: text("instagram"),
  answers: text("answers").notNull(),
  profile: text("profile"),
  accessCode: text("access_code"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

// Códigos de acesso gerados pela Hotmart
export const accessCodes = sqliteTable("access_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  hotmartOrderId: text("hotmart_order_id"),
  used: integer("used", { mode: "boolean" }).notNull().default(false),
  usedAt: text("used_at"),
  expiresAt: text("expires_at"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

// Códigos OTP de 6 dígitos para verificação de email
export const otpCodes = sqliteTable("otp_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accessCode: text("access_code").notNull(),   // o XXXX-XXXX que a pessoa introduziu
  email: text("email").notNull(),
  otp: text("otp").notNull(),                  // 6 dígitos
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  expiresAt: text("expires_at").notNull(),     // válido 10 minutos
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});
