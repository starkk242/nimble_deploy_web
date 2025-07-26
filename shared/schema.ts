import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const mcpServers = pgTable("mcp_servers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMcpServerSchema = createInsertSchema(mcpServers).omit({
  id: true,
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMcpServer = z.infer<typeof insertMcpServerSchema>;
export type McpServer = typeof mcpServers.$inferSelect;

export type InsertDeploymentEvent = z.infer<typeof insertDeploymentEventSchema>;
export type DeploymentEvent = typeof deploymentEvents.$inferSelect;
