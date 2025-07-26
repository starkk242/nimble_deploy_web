import { CheckCircle, Shield, HeartPulse, Gauge, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const navItems = [
  { id: "getting-started", label: "Getting Started" },
  { id: "openapi-support", label: "OpenAPI Support" },
  { id: "mcp-protocol", label: "MCP Protocol" },
  { id: "authentication", label: "Authentication" },
  { id: "deployment", label: "Deployment" },
  { id: "monitoring", label: "Monitoring" },
  { id: "api-reference", label: "API Reference" },
];

export default function Documentation() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Documentation</h1>
        <p className="text-lg text-gray-600">Learn how to integrate and use your MCP servers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="shadow-sm sticky top-24">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Documentation</h3>
              <nav className="space-y-2">
                {navItems.map((item, index) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`block text-sm transition-colors ${
                      index === 0 
                        ? "text-blue-600 font-medium" 
                        : "text-gray-600 hover:text-blue-600"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="shadow-sm">
            <CardContent className="p-8">
              <div id="getting-started">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Getting Started</h2>
                
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
                  <p className="text-gray-600 mb-6">
                    The MCP Server Generator automatically converts your OpenAPI specifications into fully functional MCP (Model Context Protocol) servers. These servers are deployed instantly and include built-in authentication, health checks, and monitoring.
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Start</h3>
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <ol className="list-decimal list-inside space-y-3 text-gray-700">
                      <li>Upload your OpenAPI 3.0+ specification (JSON or YAML format)</li>
                      <li>Configure your server settings (name, environment, authentication)</li>
                      <li>Click "Generate & Deploy" to create your MCP server</li>
                      <li>Use the provided endpoint URL to integrate with your applications</li>
                    </ol>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                        <CheckCircle className="mr-2" size={16} />
                        OpenAPI 3.0+
                      </h4>
                      <p className="text-sm text-blue-700">Full support for OpenAPI specifications</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2 flex items-center">
                        <Shield className="mr-2" size={16} />
                        Authentication
                      </h4>
                      <p className="text-sm text-green-700">Built-in API key and token auth</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2 flex items-center">
                        <HeartPulse className="mr-2" size={16} />
                        Health Checks
                      </h4>
                      <p className="text-sm text-purple-700">Automatic monitoring and alerts</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <h4 className="font-medium text-amber-900 mb-2 flex items-center">
                        <Gauge className="mr-2" size={16} />
                        Rate Limiting
                      </h4>
                      <p className="text-sm text-amber-700">Configurable request throttling</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Usage</h3>
                  <div className="bg-gray-900 rounded-lg p-6 mb-6">
                    <pre className="text-green-400 text-sm overflow-x-auto">
                      <code>{`curl -X GET "https://api-petstore.mcp.dev/pets" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Accept: application/json"`}</code>
                    </pre>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication Methods</h3>
                  <div className="space-y-4 mb-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">API Key Authentication</h4>
                      <p className="text-sm text-gray-600 mb-2">Pass your API key in the request headers:</p>
                      <code className="text-sm bg-gray-100 p-2 rounded block">
                        X-API-Key: your_api_key_here
                      </code>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Bearer Token</h4>
                      <p className="text-sm text-gray-600 mb-2">Include the bearer token in the Authorization header:</p>
                      <code className="text-sm bg-gray-100 p-2 rounded block">
                        Authorization: Bearer your_token_here
                      </code>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Basic Authentication</h4>
                      <p className="text-sm text-gray-600 mb-2">Use HTTP Basic authentication:</p>
                      <code className="text-sm bg-gray-100 p-2 rounded block">
                        Authorization: Basic base64(username:password)
                      </code>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Limiting</h3>
                  <p className="text-gray-600 mb-4">
                    All MCP servers include configurable rate limiting to protect your resources. Rate limits are applied per client and reset every minute.
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Rate Limit Headers</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><code>X-RateLimit-Limit</code>: Maximum requests per minute</li>
                      <li><code>X-RateLimit-Remaining</code>: Remaining requests in current window</li>
                      <li><code>X-RateLimit-Reset</code>: Time when the rate limit resets</li>
                    </ul>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monitoring & Health Checks</h3>
                  <p className="text-gray-600 mb-4">
                    Every MCP server includes built-in health check and usage endpoints:
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="bg-gray-50 rounded p-3">
                      <code className="font-mono text-sm">GET /health</code>
                      <p className="text-sm text-gray-600 mt-1">Returns server health status and uptime information</p>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <code className="font-mono text-sm">GET /usage</code>
                      <p className="text-sm text-gray-600 mt-1">Returns usage statistics and request counts (requires authentication)</p>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <h4 className="font-medium text-blue-900 mb-1">Need Help?</h4>
                      <p className="text-sm text-blue-700">
                        Check out our API reference or contact support if you have questions about integrating your MCP servers.
                      </p>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
