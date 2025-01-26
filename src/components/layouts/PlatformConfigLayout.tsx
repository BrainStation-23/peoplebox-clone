import { Outlet, Link, useLocation } from "react-router-dom";
import { Database, Mail, Layers, MapPin, Briefcase, UserRound, Shield } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const navigationItems = [
  {
    title: "SBUs",
    icon: Database,
    path: "/admin/config/sbus",
  },
  {
    title: "Email",
    icon: Mail,
    path: "/admin/config/email",
  },
  {
    title: "Level",
    icon: Layers,
    path: "/admin/config/level",
  },
  {
    title: "Location",
    icon: MapPin,
    path: "/admin/config/location",
  },
  {
    title: "Employment Type",
    icon: Briefcase,
    path: "/admin/config/employment-type",
  },
  {
    title: "Employee Type",
    icon: UserRound,
    path: "/admin/config/employee-type",
  },
  {
    title: "Employee Role",
    icon: Shield,
    path: "/admin/config/employee-role",
  },
];

export default function PlatformConfigLayout() {
  const location = useLocation();
  
  return (
    <div className="space-y-6">
      <NavigationMenu>
        <NavigationMenuList>
          {navigationItems.map((item) => (
            <NavigationMenuItem key={item.title}>
              <Link to={item.path}>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  active={location.pathname === item.path}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <Outlet />
    </div>
  );
}