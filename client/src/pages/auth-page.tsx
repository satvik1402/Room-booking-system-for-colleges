import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff } from "lucide-react";
import loginIllustration from "@assets/image0_1745169248135.png";
import manipalLogo from "@assets/1_1745169307230.png";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["admin", "department_admin", "teacher", "student"]),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "student",
    },
  });

  const { register, handleSubmit, formState } = form;
  const { errors } = formState;

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync({
        username: data.username,
        password: data.password,
        role: data.role
      });
      
      setLocation("/");
    } catch (error) {
      // Error handling is done in the mutation onError callback
      console.error("Login error:", error);
    }
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
    form.setValue("role", value as any);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  
  // Format role name for display
  const getRoleDisplayText = (roleValue: string) => {
    if (roleValue === "department_admin") return "Department Admin";
    return roleValue.charAt(0).toUpperCase() + roleValue.slice(1);
  };

  const titleText = `${getRoleDisplayText(role)} Login`;

  // Constants for demo credentials based on role
  const getCredentialsForRole = (role: string) => {
    switch (role) {
      case 'admin':
        return { username: "admin", password: "admin123" };
      case 'department_admin':
        return { username: "deptadmin", password: "admin123" };
      case 'teacher':
        return { username: "teacher", password: "teacher123" };
      case 'student':
        return { username: "student", password: "student123" };
      default:
        return { username: "", password: "" };
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Left side - Login Form */}
      <div className="w-full md:w-1/2 bg-black text-white p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-2">{titleText}</h1>
            <p className="text-gray-400">Enter your account details</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-gray-300 mb-1">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                className="bg-gray-800 border-gray-700 text-white"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="password" className="text-gray-300 mb-1">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-gray-800 border-gray-700 text-white pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
              <div className="text-right">
                <a href="#" className="text-sm text-gray-400 hover:text-primary hover:underline block mt-2">
                  Forgot Password?
                </a>
              </div>
            </div>
            
            <div className="pt-2">
              <input type="hidden" {...register("role")} value={role} />
              <Label htmlFor="role" className="text-gray-300 mb-1">Select Role</Label>
              <Tabs defaultValue="student" value={role} onValueChange={handleRoleChange} className="w-full">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="student">Student</TabsTrigger>
                  <TabsTrigger value="teacher">Teacher</TabsTrigger>
                  <TabsTrigger value="department_admin">Dept Admin</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white" 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
            
            <div className="mt-2 text-center text-sm text-gray-400">
              <p>For demo, use credentials:</p>
              <p className="mt-1 font-mono text-xs">
                Username: <span className="text-orange-400">{getCredentialsForRole(role).username}</span> | 
                Password: <span className="text-orange-400">{getCredentialsForRole(role).password}</span>
              </p>
            </div>
          </form>
        </div>
      </div>
      
      {/* Right side - Illustration */}
      <div className="hidden md:flex w-1/2 bg-orange-500 p-8 items-center justify-center">
        <div className="max-w-md text-white text-center">
          <div className="mb-4">
            <img src={manipalLogo} alt="Manipal University Logo" className="h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Welcome to</h1>
            <h2 className="text-2xl font-semibold mb-4">Manipal University<br/>Classroom Booking System</h2>
          </div>
          
          <p className="text-md mb-8">Login to access the {getRoleDisplayText(role).toLowerCase()} portal</p>
          
          <div className="flex justify-center mb-8">
            <img src={loginIllustration} alt="Login Illustration" className="w-72 h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}