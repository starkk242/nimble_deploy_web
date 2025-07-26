import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [location, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed");
        return;
      }
      
      const data = await res.json();
      // Store the token (consider using httpOnly cookies in production)
      localStorage.setItem('token', data.token);
      setLocation("/dashboard");
    } catch (err) {
      setError("Network error");
    }
  };

  const handleAuth0Login = () => {
    // Redirect to Auth0 login endpoint
    window.location.href = "/api/auth0/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full">
              Login with Email
            </Button>
          </form>
          <div className="text-center my-4 text-sm text-gray-500">or</div>
          <Button 
            onClick={handleAuth0Login} 
            variant="outline" 
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white border-none hover:from-orange-600 hover:to-red-600"
          >
            Continue with Auth0
          </Button>
          <p className="text-center mt-4 text-sm">
            Don't have an account?{" "}
            <button
              onClick={() => setLocation("/auth/register")}
              className="text-blue-600 hover:underline"
            >
              Register
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}