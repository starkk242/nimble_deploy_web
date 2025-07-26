import { useQuery } from "@tanstack/react-query";
import { Plus, List, Book, Server, CheckCircle, BarChart3, HeartPulse, Upload, TriangleAlert } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardStats {
  totalServers: number;
  activeServers: number;
  totalRequests: number;
  avgUptime: string;
}

interface DeploymentEvent {
  id: string;
  type: string;
  status: string;
  message: string;
  createdAt: string;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: recentEvents, isLoading: eventsLoading } = useQuery<DeploymentEvent[]>({
    queryKey: ["/api/events"],
  });

  const getEventIcon = (type: string, status: string) => {
    if (status === "error") return <TriangleAlert className="text-red-600" size={16} />;
    if (status === "warning") return <TriangleAlert className="text-amber-600" size={16} />;
    
    switch (type) {
      case "upload": return <Upload className="text-blue-600" size={16} />;
      case "deployment": return <CheckCircle className="text-green-600" size={16} />;
      default: return <CheckCircle className="text-green-600" size={16} />;
    }
  };

  const getEventBadgeClass = (status: string) => {
    switch (status) {
      case "success": return "bg-green-100 text-green-800";
      case "warning": return "bg-amber-100 text-amber-800";
      case "error": return "bg-red-100 text-red-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Transform OpenAPI to Live MCP Servers
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Upload your Swagger/OpenAPI definitions and instantly generate production-ready MCP servers with auto-deployment, health checks, and monitoring included.
        </p>
        <Link href="/upload">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center">
            <Upload className="mr-2" size={16} />
            Start Generating
          </button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Servers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : stats?.totalServers || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Server className="text-blue-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Deployments</p>
                <p className="text-2xl font-bold text-green-600">
                  {statsLoading ? "..." : stats?.activeServers || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">API Calls Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : stats?.totalRequests?.toLocaleString() || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-amber-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-green-600">
                  {statsLoading ? "..." : stats?.avgUptime || "0%"}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <HeartPulse className="text-green-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-sm mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <CardContent className="p-6">
          {eventsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentEvents && recentEvents.length > 0 ? (
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getEventIcon(event.type, event.status)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{event.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.createdAt).toRelativeTimeString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventBadgeClass(event.status)}`}>
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent activity</p>
              <p className="text-sm text-gray-400">Start by creating your first MCP server</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/upload">
          <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Plus className="text-blue-600" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate New Server</h3>
              <p className="text-gray-600">Upload your OpenAPI specification to create a new MCP server</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/servers">
          <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <List className="text-green-600" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Servers</h3>
              <p className="text-gray-600">View and manage your deployed MCP servers and their status</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/docs">
          <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Book className="text-purple-600" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Documentation</h3>
              <p className="text-gray-600">Learn how to integrate and use your MCP servers</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </main>
  );
}
