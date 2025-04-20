import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/auth-provider";

// Pages
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import AvailableRooms from "@/pages/dashboard/available-rooms";
import Timetable from "@/pages/dashboard/timetable";
import PersonalDetails from "@/pages/dashboard/personal-details";
import MyBookings from "@/pages/dashboard/my-bookings";
import AdminBookings from "@/pages/admin/bookings";

// Protected route component
function ProtectedRoute({ 
  component: Component, 
  roles = ['admin', 'teacher', 'student'],
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
      setLocation("/login");
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
          <ProtectedRoute component={AvailableRooms} />
        </Layout>
      </Route>
      <Route path="/timetable">
        <Layout>
          <ProtectedRoute component={Timetable} roles={['student']} />
        </Layout>
      </Route>
      <Route path="/personal-details">
        <Layout>
          <ProtectedRoute component={PersonalDetails} />
        </Layout>
      </Route>
      <Route path="/my-bookings">
        <Layout>
          <ProtectedRoute component={MyBookings} />
        </Layout>
      </Route>
      <Route path="/admin/bookings">
        <Layout>
          <ProtectedRoute component={AdminBookings} roles={['admin']} />
        </Layout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

// Main router
function Router() {
  return (
    <Switch>
      <Route path="/login">
        <AuthProvider>
          <Login />
        </AuthProvider>
      </Route>
      <Route>
        <AuthProvider>
          <AuthenticatedRoutes />
        </AuthProvider>
      </Route>
    </Switch>
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
