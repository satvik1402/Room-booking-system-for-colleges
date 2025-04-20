import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/auth-provider";

type SidebarNavProps = {
  className?: string;
};

export function SidebarNav({ className }: SidebarNavProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const adminLinks = [
    {
      href: "/",
      icon: "grid-2",
      label: "Dashboard",
    },
    {
      href: "/available-rooms",
      icon: "layout-dashboard",
      label: "Room Availability",
    },
    {
      href: "/admin/bookings",
      icon: "clipboard-list",
      label: "Booking Requests",
    },
    {
      href: "/personal-details",
      icon: "user",
      label: "Personal Details",
    },
  ];

  const teacherLinks = [
    {
      href: "/",
      icon: "grid-2",
      label: "Dashboard",
    },
    {
      href: "/available-rooms",
      icon: "layout-dashboard",
      label: "Room Availability",
    },
    {
      href: "/my-bookings",
      icon: "calendar",
      label: "My Bookings",
    },
    {
      href: "/personal-details",
      icon: "user",
      label: "Personal Details",
    },
  ];

  const studentLinks = [
    {
      href: "/",
      icon: "grid-2",
      label: "Dashboard",
    },
    {
      href: "/available-rooms",
      icon: "layout-dashboard",
      label: "Available Rooms",
    },
    {
      href: "/timetable",
      icon: "calendar-clock",
      label: "Timetable",
    },
    {
      href: "/personal-details",
      icon: "user",
      label: "Personal Details",
    },
  ];

  const links = user?.role === "admin" 
    ? adminLinks 
    : user?.role === "teacher" 
    ? teacherLinks 
    : studentLinks;

  return (
    <nav className={cn("space-y-1", className)}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "flex items-center px-4 py-3 text-sm text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors",
            location === link.href && "bg-sidebar-accent font-medium"
          )}
        >
          <i className={`ri-${link.icon} mr-3 text-xl ${location === link.href ? 'text-sidebar-primary' : 'text-gray-500'}`}></i>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
