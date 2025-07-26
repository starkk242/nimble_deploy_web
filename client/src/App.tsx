import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Upload from "@/pages/upload";
import Servers from "@/pages/servers";
import Documentation from "@/pages/documentation";
import Navbar from "@/components/layout/navbar";

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/upload" component={Upload} />
        <Route path="/servers" component={Servers} />
        <Route path="/docs" component={Documentation} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
