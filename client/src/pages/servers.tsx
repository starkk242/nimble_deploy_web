import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, ExternalLink, BarChart3, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { McpServer } from "@shared/schema";

export default function Servers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [environmentFilter, setEnvironmentFilter] = useState("all");

  const { data: servers = [], isLoading } = useQuery<McpServer[]>({
    queryKey: ["/api/servers"],
  });

  const deleteServerMutation = useMutation({
    mutationFn: async (serverId: string) => {
      await apiRequest('DELETE', `/api/servers/${serverId}`);
    },
    onSuccess: () => {
      toast({
        title: "Server Deleted",
        description: "MCP server has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/servers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete server",
        variant: "destructive",
      });
    },
  });

  const filteredServers = servers.filter((server) => {
    const matchesSearch = server.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || server.status === statusFilter;
    const matchesEnvironment = environmentFilter === "all" || server.environment === environmentFilter;
    
    return matchesSearch && matchesStatus && matchesEnvironment;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "deploying":
        return <Badge className="bg-amber-100 text-amber-800">Deploying</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case "stopped":
        return <Badge className="bg-gray-100 text-gray-800">Stopped</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
    }
  };

  const getHealthStatus = (server: McpServer) => {
    if (server.status !== "active") return null;
    
    const uptimePercent = parseFloat(server.uptime.replace('%', ''));
    if (uptimePercent >= 99) {
      return { color: "text-green-600", text: "Healthy", dot: "bg-green-500" };
    } else if (uptimePercent >= 95) {
      return { color: "text-amber-600", text: "Warning", dot: "bg-amber-500" };
    } else {
      return { color: "text-red-600", text: "Issues", dot: "bg-red-500" };
    }
  };

  const getDeploymentProgress = (server: McpServer) => {
    if (server.status === "deploying") {
      // Simulate deployment progress based on time elapsed
      const elapsed = Date.now() - new Date(server.createdAt).getTime();
      const maxTime = 5 * 60 * 1000; // 5 minutes
      return Math.min(Math.round((elapsed / maxTime) * 100), 95);
    }
    return server.status === "active" ? 100 : 0;
  };

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My MCP Servers</h1>
          <p className="text-lg text-gray-600">Manage and monitor your deployed MCP servers</p>
        </div>
        <Link href="/upload">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2" size={16} />
            New Server
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-sm mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 gap-4">
            <div className="flex space-x-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="deploying">Deploying</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="stopped">Stopped</SelectItem>
                </SelectContent>
              </Select>

              <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Environments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Environments</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
              <Input
                placeholder="Search servers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Servers List */}
      {filteredServers.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No servers found</h3>
            <p className="text-gray-600 mb-6">
              {servers.length === 0 
                ? "Get started by creating your first MCP server" 
                : "Try adjusting your filters or search terms"
              }
            </p>
            {servers.length === 0 && (
              <Link href="/upload">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2" size={16} />
                  Create Your First Server
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredServers.map((server) => {
            const healthStatus = getHealthStatus(server);
            const progress = getDeploymentProgress(server);
            
            return (
              <Card key={server.id} className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <AlertCircle className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{server.name}</h3>
                        <p className="text-sm text-gray-600">
                          Created {new Date(server.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(server.status)}
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteServerMutation.mutate(server.id)}
                          disabled={deleteServerMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {server.status === "deploying" && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Deployment Progress</span>
                        <span className="text-sm text-gray-600">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-1">Endpoint</p>
                      <p className="text-sm text-gray-900 font-mono break-all">
                        {server.endpoint || "Pending..."}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-1">Environment</p>
                      <p className="text-sm text-gray-900 capitalize">{server.environment}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-1">Requests Today</p>
                      <p className="text-sm text-gray-900">{server.requestCount.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-1">Uptime</p>
                      <p className={`text-sm font-semibold ${healthStatus?.color || 'text-gray-400'}`}>
                        {server.uptime}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-3">
                      <Button 
                        size="sm" 
                        disabled={server.status !== "active"}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Docs
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics
                      </Button>
                    </div>
                    
                    {healthStatus && (
                      <div className="flex items-center space-x-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${healthStatus.dot}`}></div>
                        <span className={healthStatus.color}>{healthStatus.text}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
