import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { useAuth } from "../../context/auth-provider";

export function SidebarNav() {
  const { user } = useAuth();
  const [location] = useLocation();

  const navigation = [
    {
      title: "Dashboard",
      href: "/",
      icon: "ri-dashboard-line",
      roles: ["admin", "department_admin", "teacher", "student"],
    },
    {
      title: "Available Rooms",
      href: "/available-rooms",
      icon: "ri-door-open-line",
      roles: ["admin", "department_admin", "teacher", "student"],
    },
    {
      title: "Timetable",
      href: "/timetable",
      icon: "ri-calendar-2-line",
      roles: ["admin", "department_admin", "teacher", "student"],
    },
    {
      title: "My Bookings",
      href: "/my-bookings",
      icon: "ri-calendar-check-line",
      roles: ["admin", "department_admin", "teacher"],
    },
    {
      title: "All Bookings",
      href: "/admin/bookings",
      icon: "ri-calendar-todo-line",
      roles: ["admin", "department_admin"],
    },
    {
      title: "Personal Details",
      href: "/personal-details",
      icon: "ri-user-settings-line",
      roles: ["admin", "department_admin", "teacher", "student"],
    },
  ];

  return (
    <nav className="space-y-1">
      {navigation
        .filter((item) => item.roles.includes(user?.role || ""))
        .map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center py-2 px-4 text-sm font-medium rounded-md transition-colors",
              location === item.href
                ? "bg-sidebar-accent text-sidebar-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            <i className={cn(item.icon, "mr-3 text-xl")} />
            {item.title}
          </Link>
        ))}
    </nav>
  );
}