import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/auth-provider";

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
          <ProtectedRoute component={Timetable} />
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
          <ProtectedRoute component={AdminBookings} />
        </Layout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Switch>
            <Route path="/auth" component={AuthPage} />
            <Route>
              <AuthenticatedRoutes />
            </Route>
          </Switch>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;