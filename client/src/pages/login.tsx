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
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff } from "lucide-react";

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

  return (
    <div className="h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 bg-secondary text-white p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-2">Classroom Portal</h1>
            <p className="text-gray-400">Enter your account details to access the classroom booking system</p>
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
              <a href="#" className="text-sm text-primary hover:underline block mt-2">
                Forgot Password?
              </a>
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
              className="w-full bg-primary hover:bg-primary/90" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
      
      <div className="hidden md:flex w-1/2 bg-primary p-8 items-center justify-center">
        <div className="max-w-md text-white">
          <h1 className="text-3xl font-bold mb-4">Welcome to Manipal University</h1>
          <p className="text-xl mb-8">Classroom Booking System</p>
          
          <div className="mb-8">
            <svg className="w-full max-w-md" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="120" y="40" width="160" height="220" rx="10" fill="#FFFFFF" stroke="#CCCCCC" strokeWidth="2"/>
              <rect x="140" y="60" width="120" height="10" rx="2" fill="#EEEEEE"/>
              <rect x="140" y="80" width="120" height="10" rx="2" fill="#EEEEEE"/>
              <rect x="140" y="100" width="80" height="10" rx="2" fill="#EEEEEE"/>
              <rect x="140" y="140" width="120" height="80" rx="4" fill="#F3F4F6"/>
              <circle cx="150" cy="180" r="5" fill="#FF7F2A"/>
              <rect x="160" y="175" width="70" height="10" rx="2" fill="#EEEEEE"/>
              
              <g transform="translate(50, 140)">
                <circle cx="25" cy="25" r="25" fill="#1A1A1A"/>
                <circle cx="15" cy="20" r="3" fill="white"/>
                <circle cx="35" cy="20" r="3" fill="white"/>
                <path d="M15 35C15 35 20 40 35 35" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <rect x="0" y="60" width="50" height="60" rx="5" fill="#1A1A1A"/>
                <rect x="10" y="130" width="10" height="30" rx="2" fill="#1A1A1A"/>
                <rect x="30" y="130" width="10" height="30" rx="2" fill="#1A1A1A"/>
              </g>
              
              <g transform="translate(300, 120)">
                <circle cx="25" cy="25" r="25" fill="#1A1A1A"/>
                <circle cx="15" cy="20" r="3" fill="white"/>
                <circle cx="35" cy="20" r="3" fill="white"/>
                <path d="M15 35C15 35 20 40 35 35" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <rect x="0" y="60" width="50" height="60" rx="5" fill="#1A1A1A"/>
                <rect x="10" y="130" width="10" height="30" rx="2" fill="#1A1A1A"/>
                <rect x="30" y="130" width="10" height="30" rx="2" fill="#1A1A1A"/>
                <rect x="-10" y="70" width="30" height="10" rx="5" fill="#1A1A1A"/>
              </g>
              
              <g transform="translate(250, 190)">
                <rect x="0" y="0" width="60" height="40" rx="5" fill="#1A1A1A"/>
                <rect x="5" y="5" width="50" height="30" rx="2" fill="#FFFFFF"/>
                <rect x="-10" y="40" width="80" height="5" rx="2" fill="#1A1A1A"/>
              </g>
              
              <g transform="translate(200, 30)">
                <circle cx="15" cy="15" r="15" fill="#F3F4F6" stroke="#CCCCCC" strokeWidth="1"/>
                <line x1="15" y1="15" x2="15" y2="8" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round"/>
                <line x1="15" y1="15" x2="20" y2="15" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round"/>
              </g>
            </svg>
          </div>
          
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-4 text-center">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4 flex flex-col items-center">
                <div className="rounded-full bg-white p-2 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-medium">Easy Booking</h3>
                <p className="text-sm text-white/70">Book rooms with ease</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4 flex flex-col items-center">
                <div className="rounded-full bg-white p-2 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-medium">Timetables</h3>
                <p className="text-sm text-white/70">View your schedules</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
