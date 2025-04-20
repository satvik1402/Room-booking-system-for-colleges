import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/auth-provider";

// Pages
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import AvailableRooms from "@/pages/dashboard/available-rooms";
import Timetable from "@/pages/dashboard/timetable";
import PersonalDetails from "@/pages/dashboard/personal-details";
import MyBookings from "@/pages/dashboard/my-bookings";
import AdminBookings from "@/pages/admin/bookings";

// Create a client
const queryClient = new QueryClient();

// Protected route component
function ProtectedRoute({ 
  component: Component, 
  roles = ['admin', 'department_admin', 'teacher', 'student'],
  ...rest 
}: { 
  component: React.ComponentType<any>, 
  roles?: string[] 
  [key: string]: any 
}) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/auth");
    } else if (user && !roles.includes(user.role)) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation, roles]);

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <Component {...rest} />;
}

// Auth-aware router component
function AuthenticatedRoutes() {
  return (
    <Switch>
      <Route path="/">
        <Layout>
          <ProtectedRoute component={Dashboard} />
        </Layout>
      </Route>
      <Route path="/available-rooms">
        <Layout>
          <ProtectedRoute 
            component={AvailableRooms} 
            roles={['admin', 'department_admin', 'teacher', 'student']} 
          />
        </Layout>
      </Route>
      <Route path="/timetable">
        <Layout>
          <ProtectedRoute 
            component={Timetable} 
            roles={['admin', 'department_admin', 'teacher', 'student']} 
          />
        </Layout>
      </Route>
      <Route path="/personal-details">
        <Layout>
          <ProtectedRoute component={PersonalDetails} />
        </Layout>
      </Route>
      <Route path="/my-bookings">
        <Layout>
          <ProtectedRoute 
            component={MyBookings} 
            roles={['admin', 'department_admin', 'teacher']} 
          />
        </Layout>
      </Route>
      <Route path="/admin/bookings">
        <Layout>
          <ProtectedRoute 
            component={AdminBookings} 
            roles={['admin', 'department_admin']} 
          />
        </Layout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

// Main router
function Router() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          <Route path="/auth">
            <AuthPage />
          </Route>
          <Route>
            <AuthenticatedRoutes />
          </Route>
        </Switch>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;