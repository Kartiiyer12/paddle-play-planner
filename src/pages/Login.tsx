
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockUsers } from "@/data/mockData";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call with timeout
    setTimeout(() => {
      const user = mockUsers.find((user) => user.email === email);
      
      if (user && password === "password") { // Simple mock auth
        // In a real app, we would store the user details in a state management solution
        localStorage.setItem("currentUser", JSON.stringify(user));
        
        toast.success("Login successful!");
        
        // Redirect based on user role
        if (user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        toast.error("Invalid email or password. Please try again.");
      }
      
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow flex items-center justify-center py-16 px-4 bg-gray-50">
        <div className="w-full max-w-md">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-pickleball-purple">Login to PicklePlay</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-sm text-pickleball-purple hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-pickleball-purple hover:bg-pickleball-purple/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-pickleball-purple hover:underline">
                    Sign up
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>For demo purposes:</p>
            <p>Admin login: admin@example.com / password</p>
            <p>User login: user@example.com / password</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
