import { int, mysqlEnum, mysqlTable, text, varchar, timestamp, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Organizations: Hospitals, NGOs, Counties, etc.
 */
export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  type: varchar("type", { length: 100 }), // Hospital, NGO, County, etc.
  country: varchar("country", { length: 100 }).default("Kenya"),
  ownerId: int("ownerId").notNull().references(() => users.id),
  policy: text("policy"), // JSON string for organization policies
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

/**
 * Organization Members
 */
export const organizationMembers = mysqlTable("organization_members", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().references(() => organizations.id),
  userId: int("userId").notNull().references(() => users.id),
  role: mysqlEnum("role", ["admin", "member"]).default("member").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Enhanced Agents: Rich metadata for Federated Agent Marketplace
 */
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  agentUid: varchar("agentUid", { length: 100 }).notNull().unique(), // e.g., bpu-t1-v4.3-001
  name: varchar("name", { length: 255 }).notNull(),
  organizationId: int("organizationId").references(() => organizations.id),
  type: varchar("type", { length: 100 }), // Nurse, Finance, Logistics, etc.
  version: varchar("version", { length: 50 }).notNull(),
  description: text("description"),
  capabilities: text("capabilities"), // JSON array of strings
  permissions: text("permissions"), // JSON array of strings
  status: mysqlEnum("status", ["Draft", "Verified", "Published", "Installed", "Running", "Suspended", "Retired"]).default("Draft").notNull(),
  isFederated: boolean("isFederated").default(false).notNull(),
  signature: text("signature"), // Digital signature
  manifest: text("manifest"), // Full agent manifest as JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

/**
 * Agent Deployments: Tracks which agents are installed in which organizations
 */
export const agentDeployments = mysqlTable("agent_deployments", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull().references(() => agents.id),
  organizationId: int("organizationId").notNull().references(() => organizations.id),
  status: varchar("status", { length: 50 }).default("Running").notNull(),
  installedAt: timestamp("installedAt").defaultNow().notNull(),
  lastSync: timestamp("lastSync").defaultNow().notNull(),
});

export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  telegramChatId: varchar("telegramChatId", { length: 255 }).notNull(),
  organizationId: int("organizationId").references(() => organizations.id),
  agentId: int("agentId").references(() => agents.id),
  history: text("history"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  organizationId: int("organizationId").references(() => organizations.id),
  conversationId: int("conversationId").references(() => conversations.id),
  fileKey: varchar("fileKey", { length: 255 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 255 }),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});
