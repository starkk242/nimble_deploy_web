import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertMcpServerSchema, insertDeploymentEventSchema } from "@shared/schema";
import { OpenApiParser } from "./services/openapi-parser";
import { McpGenerator } from "./services/mcp-generator";
import { DeploymentService } from "./services/deployment";
import multer from "multer";
import { z } from "zod";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json' || 
        file.mimetype === 'text/yaml' || 
        file.mimetype === 'application/x-yaml' ||
        file.originalname.endsWith('.yaml') ||
        file.originalname.endsWith('.yml') ||
        file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON and YAML files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get all MCP servers (authenticated)
  app.get("/api/servers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const servers = await storage.getMcpServers(userId);
      res.json(servers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch servers" });
    }
  });

  // Get specific MCP server (authenticated)
  app.get("/api/servers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const server = await storage.getMcpServer(req.params.id, userId);
      if (!server) {
        return res.status(404).json({ error: "Server not found" });
      }
      res.json(server);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch server" });
    }
  });

  // Upload and validate OpenAPI spec (authenticated)
  app.post("/api/validate-openapi", isAuthenticated, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      let spec;
      try {
        const content = req.file.buffer.toString('utf-8');
        
        if (req.file.originalname.endsWith('.json')) {
          spec = JSON.parse(content);
        } else {
          // For YAML files, we'll need to parse them
          // For now, assume JSON format or implement YAML parser
          spec = JSON.parse(content);
        }
      } catch (parseError) {
        return res.status(400).json({ error: "Invalid file format. Please upload a valid JSON or YAML file." });
      }

      const validation = OpenApiParser.validateSpec(spec);
      res.json({
        ...validation,
        spec: validation.isValid ? spec : undefined
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to validate OpenAPI specification" });
    }
  });

  // Create and deploy MCP server (authenticated)
  app.post("/api/servers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertMcpServerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid server configuration",
          details: validation.error.errors 
        });
      }

      const serverData = validation.data;

      // Validate OpenAPI spec
      const specValidation = OpenApiParser.validateSpec(serverData.openApiSpec);
      if (!specValidation.isValid) {
        return res.status(400).json({ 
          error: "Invalid OpenAPI specification",
          details: specValidation.errors 
        });
      }

      // Create server record
      const server = await storage.createMcpServer(serverData, userId);

      // Log upload event
      await storage.createDeploymentEvent({
        serverId: server.id,
        type: "upload",
        status: "success",
        message: "OpenAPI specification uploaded and validated",
        details: { 
          endpointCount: specValidation.endpointCount,
          resourceTypes: specValidation.resourceTypes 
        }
      });

      // Generate MCP server code
      const generationResult = await McpGenerator.generateServer(server);
      if (!generationResult.success) {
        await storage.updateMcpServer(server.id, { status: "failed" });
        await storage.createDeploymentEvent({
          serverId: server.id,
          type: "generation",
          status: "error",
          message: `Code generation failed: ${generationResult.error}`,
          details: { error: generationResult.error }
        });
        
        return res.status(500).json({ error: generationResult.error });
      }

      // Update server with generated code
      await storage.updateMcpServer(server.id, {
        generatedCode: generationResult.code,
        status: "deploying"
      }, userId);

      await storage.createDeploymentEvent({
        serverId: server.id,
        type: "generation",
        status: "success",
        message: "MCP server code generated successfully",
        details: { codeLength: generationResult.code?.length }
      });

      // Start deployment process (async)
      DeploymentService.deployServer(server.id).catch(error => {
        console.error("Deployment failed:", error);
      });

      res.status(201).json(server);
    } catch (error) {
      res.status(500).json({ error: "Failed to create server" });
    }
  });

  // Update MCP server (authenticated)
  app.patch("/api/servers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;
      const server = await storage.updateMcpServer(req.params.id, updates, userId);
      
      if (!server) {
        return res.status(404).json({ error: "Server not found" });
      }

      res.json(server);
    } catch (error) {
      res.status(500).json({ error: "Failed to update server" });
    }
  });

  // Delete MCP server (authenticated)
  app.delete("/api/servers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deleted = await storage.deleteMcpServer(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({ error: "Server not found" });
      }

      await storage.createDeploymentEvent({
        serverId: req.params.id,
        type: "deployment",
        status: "success",
        message: "Server deleted successfully",
        details: { deletedAt: new Date().toISOString() }
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete server" });
    }
  });

  // Get deployment events for a server (authenticated)
  app.get("/api/servers/:id/events", isAuthenticated, async (req, res) => {
    try {
      const events = await storage.getDeploymentEvents(req.params.id);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deployment events" });
    }
  });

  // Get recent deployment events (for dashboard) (authenticated)
  app.get("/api/events", isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const events = await storage.getRecentDeploymentEvents(limit);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deployment events" });
    }
  });

  // Get dashboard stats (authenticated)
  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Start health check service
  DeploymentService.startHealthCheckInterval();

  const httpServer = createServer(app);
  return httpServer;
}
