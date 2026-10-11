import { pgTable, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull()
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id)
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull()
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt")
});

// Our SaaS Client Table
export const clients = pgTable("clients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  metaAdsConnected: boolean("metaAdsConnected").default(false).notNull(),
  userId: text("userId").notNull().references(() => user.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Which metrics appear in a client's PDF
export const reportSettings = pgTable("report_settings", {
  clientId: text("clientId").primaryKey().references(() => clients.id, { onDelete: "cascade" }),
  totalSpend: boolean("totalSpend").default(true).notNull(),
  cpa: boolean("cpa").default(true).notNull(),
  roas: boolean("roas").default(true).notNull(),
  linkClicks: boolean("linkClicks").default(false).notNull(),
  impressions: boolean("impressions").default(false).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// One row per generated report; `cards` is the snapshot the PDF is rendered from
export const reports = pgTable("reports", {
  id: text("id").primaryKey(),
  clientId: text("clientId").notNull().references(() => clients.id, { onDelete: "cascade" }),
  period: text("period").notNull(),
  agencyName: text("agencyName").notNull(),
  clientName: text("clientName").notNull(),
  cards: jsonb("cards").$type<import("./reports/pdf").PdfCard[]>().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
