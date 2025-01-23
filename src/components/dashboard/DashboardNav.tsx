import { ClipboardList, Home, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "My Surveys", href: "/dashboard/my-surveys", icon: ClipboardList },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];

export function DashboardNav() {
  return (
    <nav className="w-64 border-r min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}