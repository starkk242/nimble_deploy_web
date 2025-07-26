import {
  users,
  mcpServers,
  deploymentEvents,
  type UpsertUser,
  type User,
  type McpServer,
  type InsertMcpServer,
  type DeploymentEvent,
  type InsertDeploymentEvent,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, avg, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // MCP Server operations
  getMcpServers(userId?: string): Promise<McpServer[]>;
  getMcpServer(id: string, userId?: string): Promise<McpServer | undefined>;
  createMcpServer(server: InsertMcpServer, userId: string): Promise<McpServer>;
  updateMcpServer(id: string, updates: Partial<McpServer>, userId: string): Promise<McpServer | undefined>;
  deleteMcpServer(id: string, userId: string): Promise<boolean>;
  
  // Deployment Event operations
  getDeploymentEvents(serverId?: string): Promise<DeploymentEvent[]>;
  createDeploymentEvent(event: InsertDeploymentEvent): Promise<DeploymentEvent>;
  getRecentDeploymentEvents(limit?: number): Promise<DeploymentEvent[]>;
  
  // Stats operations
  getStats(userId?: string): Promise<{
    totalServers: number;
    activeServers: number;
    totalRequests: number;
    avgUptime: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // MCP Server operations
  async getMcpServers(userId?: string): Promise<McpServer[]> {
    if (userId) {
      return await db.select().from(mcpServers).where(eq(mcpServers.userId, userId)).orderBy(desc(mcpServers.createdAt));
    }
    return await db.select().from(mcpServers).orderBy(desc(mcpServers.createdAt));
  }

  async getMcpServer(id: string, userId?: string): Promise<McpServer | undefined> {
    if (userId) {
      const [server] = await db.select().from(mcpServers).where(
        and(eq(mcpServers.id, id), eq(mcpServers.userId, userId))
      );
      return server;
    } else {
      const [server] = await db.select().from(mcpServers).where(eq(mcpServers.id, id));
      return server;
    }
  }

  async createMcpServer(server: InsertMcpServer, userId: string): Promise<McpServer> {
    const [newServer] = await db
      .insert(mcpServers)
      .values({
        ...server,
        userId,
      })
      .returning();
    return newServer;
  }

  async updateMcpServer(id: string, updates: Partial<McpServer>, userId: string): Promise<McpServer | undefined> {
    const [updatedServer] = await db
      .update(mcpServers)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(mcpServers.id, id), eq(mcpServers.userId, userId)))
      .returning();
    return updatedServer;
  }

  async deleteMcpServer(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(mcpServers)
      .where(and(eq(mcpServers.id, id), eq(mcpServers.userId, userId)));
    return result.rowCount > 0;
  }

  // Deployment Event operations
  async getDeploymentEvents(serverId?: string): Promise<DeploymentEvent[]> {
    if (serverId) {
      return await db.select().from(deploymentEvents).where(eq(deploymentEvents.serverId, serverId)).orderBy(desc(deploymentEvents.createdAt));
    }
    return await db.select().from(deploymentEvents).orderBy(desc(deploymentEvents.createdAt));
  }

  async createDeploymentEvent(event: InsertDeploymentEvent): Promise<DeploymentEvent> {
    const [newEvent] = await db
      .insert(deploymentEvents)
      .values(event)
      .returning();
    return newEvent;
  }

  async getRecentDeploymentEvents(limit = 10): Promise<DeploymentEvent[]> {
    return await db.select().from(deploymentEvents).orderBy(desc(deploymentEvents.createdAt)).limit(limit);
  }

  // Stats operations
  async getStats(userId?: string): Promise<{
    totalServers: number;
    activeServers: number;
    totalRequests: number;
    avgUptime: string;
  }> {
    const conditions = userId ? [eq(mcpServers.userId, userId)] : [];
    
    const totalServersResult = await db.select({ count: count() }).from(mcpServers).where(
      conditions.length > 0 ? conditions[0] : undefined
    );
    
    const activeServersResult = await db.select({ count: count() }).from(mcpServers).where(
      conditions.length > 0 ? 
        and(eq(mcpServers.userId, userId!), eq(mcpServers.status, 'active')) :
        eq(mcpServers.status, 'active')
    );

    const servers = await this.getMcpServers(userId);
    const totalRequests = servers.reduce((sum, server) => sum + server.requestCount, 0);
    
    // Calculate average uptime (simplified)
    const avgUptime = servers.length > 0 ? 
      Math.round(servers.reduce((sum, server) => {
        const uptime = parseFloat(server.uptime.replace('%', ''));
        return sum + uptime;
      }, 0) / servers.length) + '%' : '0%';

    return {
      totalServers: totalServersResult[0]?.count || 0,
      activeServers: activeServersResult[0]?.count || 0,
      totalRequests,
      avgUptime,
    };
  }
}

export const storage = new DatabaseStorage();
