import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-provider";
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
  role: z.string().min(1, "Role is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "student",
    },
  });

  const { register, handleSubmit, formState } = form;
  const { errors, isSubmitting } = formState;

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.username, data.password, data.role);
      toast({
        title: "Login successful",
        description: "Welcome to Manipal University Classroom Booking System",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
    form.setValue("role", value);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  
  // Create a titleText based on the selected role
  const titleText = `${role.charAt(0).toUpperCase() + role.slice(1)} Login`;

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
              <Label htmlFor="username" className="text-gray-300 mb-1">Email ID</Label>
              <Input
                id="username"
                placeholder="username@college.edu"
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
              <Tabs defaultValue="student" value={role} onValueChange={handleRoleChange} className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="student">Student</TabsTrigger>
                  <TabsTrigger value="teacher">Teacher</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
            
            <div className="text-center text-sm text-gray-400">
              Don't have an account? <a href="#" className="text-orange-500 hover:underline">Sign up</a>
            </div>
          </form>
        </div>
      </div>
      
      {/* Right side - Illustration */}
      <div className="hidden md:flex w-1/2 bg-orange-500 p-8 items-center justify-center">
        <div className="max-w-md text-white text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome to</h1>
          <h2 className="text-2xl font-semibold mb-4">{role} portal</h2>
          <p className="text-md mb-8">Login to access your classroom booking system</p>
          
          <div className="flex justify-center mb-8">
            <img src={loginIllustration} alt="Login Illustration" className="w-72 h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
