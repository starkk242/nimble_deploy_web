import { type McpServer } from "@shared/schema";

export interface McpGenerationResult {
  success: boolean;
  code?: string;
  error?: string;
  endpoint?: string;
}

export class McpGenerator {
  static async generateServer(server: McpServer): Promise<McpGenerationResult> {
    try {
      const spec = server.openApiSpec as any;
      
      if (!spec || !spec.paths) {
        return {
          success: false,
          error: "Invalid OpenAPI specification",
        };
      }

      const code = this.generateExpressCode(server, spec);
      const endpoint = this.generateEndpoint(server.name, server.environment);

      return {
        success: true,
        code,
        endpoint,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during generation",
      };
    }
  }

  private static generateExpressCode(server: McpServer, spec: any): string {
    const endpoints = this.extractEndpoints(spec);
    const authMiddleware = this.generateAuthMiddleware(server.authentication);
    const rateLimitMiddleware = this.generateRateLimitMiddleware(server.rateLimit);
    
    return `
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

${rateLimitMiddleware}

${authMiddleware}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: '${server.name}',
    environment: '${server.environment}'
  });
});

// Usage endpoint
app.get('/usage', authenticateToken, (req, res) => {
  res.json({
    requestCount: ${server.requestCount},
    uptime: '${server.uptime}',
    lastCheck: new Date().toISOString()
  });
});

${endpoints.map(endpoint => this.generateEndpointCode(endpoint, spec)).join('\n\n')}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`MCP Server '${server.name}' running on port \${PORT}\`);
});

module.exports = app;
`;
  }

  private static generateAuthMiddleware(authType: string): string {
    switch (authType) {
      case 'api_key':
        return `
// API Key authentication middleware
function authenticateToken(req, res, next) {
  const apiKey = req.header('X-API-Key') || req.header('Authorization')?.replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  // In production, validate against stored API keys
  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ error: 'Invalid API key' });
  }
  
  next();
}`;
      case 'bearer_token':
        return `
// Bearer token authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Bearer token required' });
  }
  
  // In production, validate JWT or token against your auth service
  if (token !== process.env.BEARER_TOKEN) {
    return res.status(403).json({ error: 'Invalid token' });
  }
  
  next();
}`;
      case 'basic_auth':
        return `
// Basic authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Basic authentication required' });
  }
  
  const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('ascii');
  const [username, password] = credentials.split(':');
  
  // In production, validate against your user database
  if (username !== process.env.BASIC_AUTH_USER || password !== process.env.BASIC_AUTH_PASS) {
    return res.status(403).json({ error: 'Invalid credentials' });
  }
  
  next();
}`;
      default:
        return `
// No authentication middleware
function authenticateToken(req, res, next) {
  next();
}`;
    }
  }

  private static generateRateLimitMiddleware(rateLimit: number): string {
    return `
// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: ${rateLimit}, // ${rateLimit} requests per minute
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);`;
  }

  private static extractEndpoints(spec: any): Array<{
    path: string;
    method: string;
    operationId?: string;
    summary?: string;
  }> {
    const endpoints = [];
    const paths = spec.paths || {};

    for (const [path, pathItem] of Object.entries(paths)) {
      for (const [method, operation] of Object.entries(pathItem as any)) {
        if (typeof operation === 'object' && operation !== null) {
          endpoints.push({
            path,
            method: method.toLowerCase(),
            operationId: operation.operationId,
            summary: operation.summary,
          });
        }
      }
    }

    return endpoints;
  }

  private static generateEndpointCode(endpoint: any, spec: any): string {
    const { path, method, operationId, summary } = endpoint;
    const expressPath = path.replace(/{([^}]+)}/g, ':$1');
    
    return `
// ${summary || operationId || `${method.toUpperCase()} ${path}`}
app.${method}('${expressPath}', authenticateToken, (req, res) => {
  try {
    // Mock response - replace with actual implementation
    const mockResponse = ${this.generateMockResponse(endpoint, spec)};
    res.json(mockResponse);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});`;
  }

  private static generateMockResponse(endpoint: any, spec: any): string {
    // Generate a simple mock response structure
    const responses = spec.paths?.[endpoint.path]?.[endpoint.method]?.responses || {};
    const successResponse = responses['200'] || responses['201'] || Object.values(responses)[0];
    
    if (successResponse?.content?.['application/json']?.example) {
      return JSON.stringify(successResponse.content['application/json'].example, null, 2);
    }

    // Generate basic mock based on endpoint
    if (endpoint.method === 'get') {
      return JSON.stringify({
        data: [],
        message: "Mock response - implement actual logic",
        timestamp: new Date().toISOString()
      }, null, 2);
    } else if (endpoint.method === 'post') {
      return JSON.stringify({
        id: "generated-id",
        message: "Resource created successfully",
        timestamp: new Date().toISOString()
      }, null, 2);
    } else {
      return JSON.stringify({
        message: "Operation completed successfully",
        timestamp: new Date().toISOString()
      }, null, 2);
    }
  }

  private static generateEndpoint(serverName: string, environment: string): string {
    const subdomain = serverName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const envPrefix = environment !== 'production' ? `${environment}-` : '';
    return `https://${envPrefix}${subdomain}.mcp.dev`;
  }
}
