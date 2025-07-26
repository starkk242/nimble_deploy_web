// Updated routes.ts - Integration with your existing route structure
import type { Express, Request, Response, NextFunction } from "express";
import type { FileFilterCallback } from "multer";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { register, login, auth0Login, auth0Callback, logout, jwtMiddleware, getKey } from "./auth";
import { insertMcpServerSchema, insertDeploymentEventSchema } from "@shared/schema";
import { OpenApiParser } from "./services/openapi-parser";
import { McpGenerator } from "./services/mcp-generator";
import { DeploymentService } from "./services/deployment";
import multer from "multer";
import { z } from "zod";
import jwt from "jsonwebtoken";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
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

// Helper function to extract user ID from both local and Auth0 tokens
function getUserId(user: any): string {
  // For local tokens, user ID is in 'sub' field
  if (user.sub && !user.sub.startsWith('auth0|')) {
    return user.sub;
  }
  // For Auth0 tokens, user ID might be in 'sub' field with auth0| prefix
  if (user.sub && user.sub.startsWith('auth0|')) {
    return user.sub;
  }
  // Fallback
  return user.sub || user.id;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // PUBLIC ROUTES (no authentication required)
  
  // Auth endpoints
  app.post("/api/register", register);
  app.post("/api/login", login);
  app.post("/api/logout", logout);

  // Auth0 endpoints
  app.get("/api/auth0/login", auth0Login);
  app.get("/api/auth/callback", auth0Callback);

  // Auth user route (handles its own token verification for both local and Auth0)
  app.get('/api/auth/user', async (req: any, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid token" });
    }
    
    const token = authHeader.split(" ")[1];
    
    // Try to decode without verification first to check issuer
    const decoded = jwt.decode(token, { complete: true }) as any;
    
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    // Check if it's an Auth0 token
    const isAuth0Token = decoded.payload.iss && decoded.payload.iss.includes(process.env.AUTH0_DOMAIN);

    if (isAuth0Token) {
      jwt.verify(token, getKey, {
        audience: process.env.AUTH0_AUDIENCE,
        issuer: `https://${process.env.AUTH0_DOMAIN}/`,
        algorithms: ['RS256']
      }, (err, decoded: any) => {
        if (err) {
          return res.status(401).json({ error: "Invalid Auth0 token" });
        }
        return res.json({
          id: getUserId(decoded),
          email: decoded.email,
          authType: 'auth0'
        });
      });
    } else {
      try {
        const user = jwt.verify(token, process.env.JWT_SECRET || "dev_secret_change_me") as any;
        return res.json({
          id: getUserId(user),
          email: user.email,
          authType: 'local'
        });
      } catch (err) {
        return res.status(401).json({ error: "Invalid local token" });
      }
    }
  });

  // Health check endpoint (public)
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0"
    });
  });

  // PROTECTED ROUTES (require authentication - now supporting both local and Auth0)
  
  // Get all MCP servers (authenticated)
  app.get("/api/servers", jwtMiddleware, async (req: any, res) => {
    try {
      const userId = getUserId(req.user);
      const servers = await storage.getMcpServers(userId);
      res.json(servers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch servers" });
    }
  });

  // Get specific MCP server (authenticated)
  app.get("/api/servers/:id", jwtMiddleware, async (req: any, res) => {
    try {
      const userId = getUserId(req.user);
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
  app.post("/api/validate-openapi", jwtMiddleware, upload.single('file'), async (req: any, res: Response) => {
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
  app.post("/api/servers", jwtMiddleware, async (req: any, res) => {
    try {
      const userId = getUserId(req.user);
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
        await storage.updateMcpServer(server.id, { status: "failed" }, userId);
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
  app.patch("/api/servers/:id", jwtMiddleware, async (req: any, res) => {
    try {
      const userId = getUserId(req.user);
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
  app.delete("/api/servers/:id", jwtMiddleware, async (req: any, res) => {
    try {
      const userId = getUserId(req.user);
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
  app.get("/api/servers/:id/events", jwtMiddleware, async (req, res) => {
    try {
      const events = await storage.getDeploymentEvents(req.params.id);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deployment events" });
    }
  });

  // Get recent deployment events (for dashboard) (authenticated)
  app.get("/api/events", jwtMiddleware, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const events = await storage.getRecentDeploymentEvents(limit);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deployment events" });
    }
  });

  // Get dashboard stats (authenticated)
  app.get("/api/stats", jwtMiddleware, async (req: any, res) => {
    try {
      const userId = getUserId(req.user);
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
