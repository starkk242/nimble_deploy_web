import { z } from "zod";

// OpenAPI 3.0 schema validation
const openApiSchema = z.object({
  openapi: z.string().regex(/^3\./),
  info: z.object({
    title: z.string(),
    version: z.string(),
    description: z.string().optional(),
  }),
  servers: z.array(z.object({
    url: z.string(),
    description: z.string().optional(),
  })).optional(),
  paths: z.record(z.record(z.object({
    summary: z.string().optional(),
    description: z.string().optional(),
    operationId: z.string().optional(),
    tags: z.array(z.string()).optional(),
    parameters: z.array(z.any()).optional(),
    requestBody: z.any().optional(),
    responses: z.record(z.any()),
  }))),
  components: z.object({
    schemas: z.record(z.any()).optional(),
    parameters: z.record(z.any()).optional(),
    responses: z.record(z.any()).optional(),
    securitySchemes: z.record(z.any()).optional(),
  }).optional(),
});

export interface OpenApiValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  endpointCount: number;
  resourceTypes: string[];
  hasAuthentication: boolean;
}

export class OpenApiParser {
  static validateSpec(spec: any): OpenApiValidationResult {
    try {
      const result = openApiSchema.safeParse(spec);
      
      if (!result.success) {
        return {
          isValid: false,
          errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
          warnings: [],
          endpointCount: 0,
          resourceTypes: [],
          hasAuthentication: false,
        };
      }

      const paths = spec.paths || {};
      const endpointCount = Object.keys(paths).reduce((count, path) => {
        return count + Object.keys(paths[path]).length;
      }, 0);

      const resourceTypes = [...new Set(
        Object.keys(paths).map(path => path.split('/')[1]).filter(Boolean)
      )];

      const hasAuthentication = !!(spec.components?.securitySchemes || spec.security);

      const warnings = [];
      if (endpointCount === 0) {
        warnings.push("No endpoints found in the specification");
      }
      if (!hasAuthentication) {
        warnings.push("No authentication schemes defined");
      }

      return {
        isValid: true,
        errors: [],
        warnings,
        endpointCount,
        resourceTypes,
        hasAuthentication,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Failed to parse specification: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        endpointCount: 0,
        resourceTypes: [],
        hasAuthentication: false,
      };
    }
  }

  static extractEndpoints(spec: any): Array<{
    path: string;
    method: string;
    operationId?: string;
    summary?: string;
    tags?: string[];
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
            tags: operation.tags,
          });
        }
      }
    }

    return endpoints;
  }
}
