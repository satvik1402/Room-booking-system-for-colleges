import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { useAuth } from "@/hooks/use-auth";
import AuthPage from "@/pages/auth-page";
import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import PersonalDetails from "@/pages/dashboard/personal-details";
import Timetable from "@/pages/dashboard/timetable";
import AvailableRooms from "@/pages/dashboard/available-rooms";
import MyBookings from "@/pages/dashboard/my-bookings";
import AdminBookings from "@/pages/admin/bookings";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) window.location.replace("/auth");
  return <>{children}</>;
}

function AuthenticatedRoutes() {
  return (
    <Layout>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/dashboard/personal-details" component={PersonalDetails} />
        <Route path="/dashboard/timetable" component={Timetable} />
        <Route path="/dashboard/available-rooms" component={AvailableRooms} />
        <Route path="/dashboard/my-bookings" component={MyBookings} />
        <Route path="/admin/bookings" component={AdminBookings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <Route path="/*">
            <ProtectedRoute>
              <AuthenticatedRoutes />
            </ProtectedRoute>
          </Route>
        </Switch>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}