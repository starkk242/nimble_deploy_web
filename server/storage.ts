import { type User, type InsertUser, type McpServer, type InsertMcpServer, type DeploymentEvent, type InsertDeploymentEvent } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getMcpServer(id: string): Promise<McpServer | undefined>;
  getMcpServers(): Promise<McpServer[]>;
  createMcpServer(server: InsertMcpServer): Promise<McpServer>;
  updateMcpServer(id: string, updates: Partial<McpServer>): Promise<McpServer | undefined>;
  deleteMcpServer(id: string): Promise<boolean>;
  
  getDeploymentEvents(serverId: string): Promise<DeploymentEvent[]>;
  createDeploymentEvent(event: InsertDeploymentEvent): Promise<DeploymentEvent>;
  getRecentDeploymentEvents(limit?: number): Promise<DeploymentEvent[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private mcpServers: Map<string, McpServer>;
  private deploymentEvents: Map<string, DeploymentEvent>;

  constructor() {
    this.users = new Map();
    this.mcpServers = new Map();
    this.deploymentEvents = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getMcpServer(id: string): Promise<McpServer | undefined> {
    return this.mcpServers.get(id);
  }

  async getMcpServers(): Promise<McpServer[]> {
    return Array.from(this.mcpServers.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createMcpServer(insertServer: InsertMcpServer): Promise<McpServer> {
    const id = randomUUID();
    const now = new Date();
    const server: McpServer = {
      ...insertServer,
      id,
      endpoint: null,
      generatedCode: null,
      deploymentLogs: null,
      requestCount: 0,
      uptime: "0%",
      lastHealthCheck: null,
      createdAt: now,
      updatedAt: now,
    };
    this.mcpServers.set(id, server);
    return server;
  }

  async updateMcpServer(id: string, updates: Partial<McpServer>): Promise<McpServer | undefined> {
    const server = this.mcpServers.get(id);
    if (!server) return undefined;
    
    const updatedServer = {
      ...server,
      ...updates,
      updatedAt: new Date(),
    };
    this.mcpServers.set(id, updatedServer);
    return updatedServer;
  }

  async deleteMcpServer(id: string): Promise<boolean> {
    return this.mcpServers.delete(id);
  }

  async getDeploymentEvents(serverId: string): Promise<DeploymentEvent[]> {
    return Array.from(this.deploymentEvents.values())
      .filter(event => event.serverId === serverId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createDeploymentEvent(insertEvent: InsertDeploymentEvent): Promise<DeploymentEvent> {
    const id = randomUUID();
    const event: DeploymentEvent = {
      ...insertEvent,
      id,
      createdAt: new Date(),
    };
    this.deploymentEvents.set(id, event);
    return event;
  }

  async getRecentDeploymentEvents(limit = 10): Promise<DeploymentEvent[]> {
    return Array.from(this.deploymentEvents.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
