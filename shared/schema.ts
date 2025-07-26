import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  passwordHash: varchar("password_hash"),
  auth0Id: varchar("auth0_id").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const mcpServers = pgTable("mcp_servers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  status: text("status").notNull().default("pending"), // pending, deploying, active, failed, stopped
  environment: text("environment").notNull().default("production"),
  authentication: text("authentication").notNull().default("api_key"),
  rateLimit: integer("rate_limit").notNull().default(100),
  endpoint: text("endpoint"),
  openApiSpec: jsonb("openapi_spec").notNull(),
  generatedCode: text("generated_code"),
  deploymentLogs: text("deployment_logs"),
  requestCount: integer("request_count").notNull().default(0),
  uptime: text("uptime").notNull().default("0%"),
  lastHealthCheck: timestamp("last_health_check"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const deploymentEvents = pgTable("deployment_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => mcpServers.id),
  type: text("type").notNull(), // upload, validation, generation, deployment, health_check
  status: text("status").notNull(), // success, warning, error
  message: text("message").notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertMcpServerSchema = createInsertSchema(mcpServers).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  endpoint: true,
  generatedCode: true,
  deploymentLogs: true,
  requestCount: true,
  uptime: true,
  lastHealthCheck: true,
});

export const insertDeploymentEventSchema = createInsertSchema(deploymentEvents).omit({
  id: true,
  createdAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertMcpServer = z.infer<typeof insertMcpServerSchema>;
export type McpServer = typeof mcpServers.$inferSelect;

export type InsertDeploymentEvent = z.infer<typeof insertDeploymentEventSchema>;
export type DeploymentEvent = typeof deploymentEvents.$inferSelect;
