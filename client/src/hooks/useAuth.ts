import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, isError, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: (failureCount, error) => {
      // Don't retry on 401 (unauthorized) or 403 (forbidden)
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    queryFn: async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("🔑 Token exists:", !!token);
        
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        
        console.log("📡 Making request to /api/auth/user");
        const res = await fetch("/api/auth/user", { 
          method: "GET",
          headers 
        });
        
        console.log("📊 Response status:", res.status);
        
        // Parse response first to check for error format
        const responseData = await res.json();
        console.log("📊 Response data:", responseData);
        
        // Handle authentication errors (both by status code and response content)
        if (res.status === 401 || 
            responseData?.error === "Not authenticated" || 
            responseData?.error === "Missing or invalid token") {
          console.log("❌ User not authenticated, returning null");
          return null;
        }
        
        // Handle other errors
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${responseData?.error || 'Unknown error'}`);
        }
        
        console.log("✅ User authenticated:", responseData);
        return responseData;
        
      } catch (err) {
        console.error("❌ Auth check failed:", err);
        // If it's a network error, you might want to handle it differently
        if (err instanceof TypeError && err.message.includes('fetch')) {
          throw new Error("Network error - API server might be down");
        }
        throw err;
      }
    },
  });

  const queryClient = useQueryClient();

  const refreshAuth = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  };

  // Debug logging
  console.log("🔍 Auth Hook State:", { 
    user: !!user, 
    isLoading, 
    isError, 
    error: error?.message,
    isAuthenticated: !!user && !isError 
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !isError,
    isError,
    error,
    refreshAuth, // Add this to manually refresh auth state
  };
}