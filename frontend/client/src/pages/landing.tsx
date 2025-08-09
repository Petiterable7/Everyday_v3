import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Mail, Lock, User } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [, navigate] = useLocation();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/login" : "/api/register";
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          // Login successful, redirect to home
          navigate("/");
        } else {
          // Registration successful, switch to login
          setIsLogin(true);
          setFormData({ email: formData.email, password: "", firstName: "", lastName: "" });
          setError("Registration successful! Please log in.");
        }
      } else {
        setError(data.message || "An error occurred");
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/70 backdrop-blur-md border-purple-100 shadow-lg shadow-purple-100/50">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Everyday
          </h1>
          
          <p className="text-gray-600 text-sm">
            Everyday counts.
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="flex mb-6">
            <Button
              variant={isLogin ? "default" : "outline"}
              onClick={() => setIsLogin(true)}
              className="flex-1 mr-1"
            >
              Login
            </Button>
            <Button
              variant={!isLogin ? "default" : "outline"}
              onClick={() => setIsLogin(false)}
              className="flex-1 ml-1"
            >
              Register
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="John"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className={`text-sm p-3 rounded-md ${
                error === "Registration successful! Please log in." 
                  ? "bg-green-50 text-green-700 border border-green-200" 
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {error}
              </div>
            )}
            
            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              {loading ? "Loading..." : (isLogin ? "Sign In" : "Create Account")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
