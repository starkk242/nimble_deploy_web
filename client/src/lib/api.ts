import { apiRequest } from "./queryClient";

export interface OpenApiValidationRequest {
  file: File;
}

export interface OpenApiValidationResponse {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  endpointCount: number;
  resourceTypes: string[];
  hasAuthentication: boolean;
  spec?: any;
}

export interface CreateServerRequest {
  name: string;
  environment: string;
  authentication: string;
  rateLimit: number;
  openApiSpec: any;
}

export const api = {
  validateOpenApi: async (file: File): Promise<OpenApiValidationResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiRequest('POST', '/api/validate-openapi', formData);
    return response.json();
  },

  createServer: async (data: CreateServerRequest) => {
    const response = await apiRequest('POST', '/api/servers', data);
    return response.json();
  },

  getServers: async () => {
    const response = await apiRequest('GET', '/api/servers');
    return response.json();
  },

  getServer: async (id: string) => {
    const response = await apiRequest('GET', `/api/servers/${id}`);
    return response.json();
  },

  updateServer: async (id: string, updates: any) => {
    const response = await apiRequest('PATCH', `/api/servers/${id}`, updates);
    return response.json();
  },

  deleteServer: async (id: string) => {
    await apiRequest('DELETE', `/api/servers/${id}`);
  },

  getStats: async () => {
    const response = await apiRequest('GET', '/api/stats');
    return response.json();
  },

  getEvents: async (limit?: number) => {
    const url = limit ? `/api/events?limit=${limit}` : '/api/events';
    const response = await apiRequest('GET', url);
    return response.json();
  },

  getServerEvents: async (serverId: string) => {
    const response = await apiRequest('GET', `/api/servers/${serverId}/events`);
    return response.json();
  },
};
