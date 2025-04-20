
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../context/auth-provider";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bell, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();
  
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [pageTitle, setPageTitle] = useState("Dashboard");
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/auth");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-background">
      <aside 
        className={`bg-sidebar fixed md:relative z-40 md:z-auto w-64 h-full transition-all duration-300 ease-in-out transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-sidebar-border flex items-center">
            <Link href="/" className="flex items-center">
              <svg width="30" height="30" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3">
                <circle cx="50" cy="40" r="20" fill="#FF7F2A"/>
                <path d="M30 60H70C70 70 60 80 50 80C40 80 30 70 30 60Z" fill="#FF7F2A"/>
                <path d="M25 90C25 85 35 80 50 80C65 80 75 85 75 90" stroke="#9E4718" strokeWidth="2"/>
                <path d="M20 95C20 90 35 85 50 85C65 85 80 90 80 95" stroke="#9E4718" strokeWidth="2"/>
                <path d="M15 100C15 95 35 90 50 90C65 90 85 95 85 100" stroke="#9E4718" strokeWidth="2"/>
              </svg>
              <h1 className="text-lg font-semibold text-sidebar-foreground">Classroom Portal</h1>
            </Link>
          </div>
          
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center mr-3">
                <span className="text-white font-medium">
                  {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="font-medium text-sidebar-foreground">{user?.username}</h2>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <SidebarNav />
          </div>
          
          <div className="p-4 border-t border-sidebar-border">
            <Button 
              variant="outline" 
              className="w-full justify-start text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-foreground"
              onClick={handleLogout}
            >
              <i className="ri-logout-box-line mr-3 text-xl"></i>
              Logout
            </Button>
          </div>
        </div>
      </aside>
      
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="md:hidden mr-4"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-white text-xs flex items-center justify-center rounded-full">3</span>
            </Button>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
