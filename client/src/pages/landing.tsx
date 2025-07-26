import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Zap, Shield, Globe, Code, Users, Clock } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10" />
        
        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Nimble Deploy</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Button 
              onClick={handleLogin}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Get Started
            </Button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
              Deploy Your
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> API </span>
              in Seconds
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Transform your OpenAPI specifications into production-ready MCP servers instantly. 
              No code, no complexity, just deploy.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleLogin}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                Start Deploying Now <ArrowRight className="ml-2" size={20} />
              </Button>
              
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Clock size={16} className="mr-1" />
                Free to start • No credit card required
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Why Choose Nimble Deploy?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Built for developers who value speed, security, and simplicity in API deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Lightning Fast</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Upload your OpenAPI spec and get a deployed MCP server in under 30 seconds. 
                  No waiting, no complex configurations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Enterprise Security</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Built-in authentication, rate limiting, and monitoring. 
                  Your APIs are secure by default with enterprise-grade protection.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Globe className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Global Scale</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Auto-scaling infrastructure that handles traffic spikes. 
                  Deploy globally with edge optimization out of the box.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Code className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">No Code Required</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Zero coding needed. Just upload your OpenAPI specification 
                  and we handle all the server generation and deployment.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Team Collaboration</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Built for teams with shared workspaces, deployment history, 
                  and collaborative management of all your API services.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Real-time Monitoring</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Complete visibility into your API performance with real-time 
                  monitoring, health checks, and detailed analytics.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Deploy Your First API?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who trust Nimble Deploy for their API infrastructure.
          </p>
          
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
          >
            Get Started Free <ArrowRight className="ml-2" size={20} />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Zap className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold">Nimble Deploy</span>
            </div>
            
            <div className="text-gray-400 text-sm">
              © 2024 Nimble Deploy. Built for the modern web.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}