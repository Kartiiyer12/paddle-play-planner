import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { registerUser } from "@/services/authService";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminCode: ""
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminOption, setShowAdminOption] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    
    setIsLoading(true);
    
    try {
      await registerUser(
        formData.email, 
        formData.password, 
        formData.name, 
        isAdmin, // Use isAdmin state
        formData.adminCode // Use admin code from form
      );
      
      // Success - redirect to login page with a message
      toast.success("Registration successful! Please log in to complete your profile setup.");
      navigate("/login");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow flex items-center justify-center py-16 px-4 bg-gray-50">
        <div className="w-full max-w-md">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-pickleball-purple">Create an Account</CardTitle>
              <CardDescription className="text-center">
                Join the PicklePlay community today
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                {/* Admin Registration Option */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="admin-toggle"
                      checked={showAdminOption}
                      onCheckedChange={(checked) => {
                        setShowAdminOption(checked as boolean);
                        if (!checked) {
                          setIsAdmin(false);
                          setFormData({ ...formData, adminCode: "" });
                        }
                      }}
                    />
                    <Label htmlFor="admin-toggle" className="text-sm text-gray-600">
                      Register as Administrator
                    </Label>
                  </div>
                  
                  {showAdminOption && (
                    <div className="space-y-2 ml-6 p-3 bg-orange-50 rounded-md border border-orange-200">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="admin"
                          checked={isAdmin}
                          onCheckedChange={(checked) => setIsAdmin(checked as boolean)}
                        />
                        <Label htmlFor="admin" className="text-sm text-orange-800 font-medium">
                          I have an admin code
                        </Label>
                      </div>
                      
                      {isAdmin && (
                        <div className="space-y-2">
                          <Label htmlFor="adminCode" className="text-sm text-orange-800">
                            Admin Code
                          </Label>
                          <Input
                            id="adminCode"
                            name="adminCode"
                            type="password"
                            placeholder="Enter admin code"
                            value={formData.adminCode}
                            onChange={handleChange}
                            className="border-orange-300 focus:border-orange-500"
                            required={isAdmin}
                          />
                          <p className="text-xs text-orange-600">
                            Enter the admin registration code to create an administrator account
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the{" "}
                    <Link to="/terms" className="text-pickleball-purple hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy-policy" className="text-pickleball-purple hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-pickleball-purple hover:bg-pickleball-purple/90"
                  disabled={isLoading || !agreeTerms}
                >
                  {isLoading ? "Creating your account..." : "Create Account"}
                </Button>
                <p className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link to="/login" className="text-pickleball-purple hover:underline">
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Register;
