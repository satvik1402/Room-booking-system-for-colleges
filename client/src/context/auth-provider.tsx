
import { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to check auth status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string, role: string) => {
    try {
      setIsLoading(true);
      const res = await apiRequest('POST', '/api/auth/login', { username, password, role });
      
      if (!res.ok) {
        throw new Error('Login failed');
      }
      
      const data = await res.json();
      setUser(data.user);
      
      toast({
        title: "Login successful",
        description: "Welcome to Manipal University Classroom Booking System",
      });
    } catch (err) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await apiRequest('POST', '/api/auth/logout', {});
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
