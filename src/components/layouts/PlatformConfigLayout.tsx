import { Outlet, Link, useLocation } from "react-router-dom";
import { Database, Mail, Layers } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const navigationItems = [
  {
    title: "SBUs",
    icon: Database,
    path: "/admin/config/sbus",
  },
  {
    title: "SMTP",
    icon: Mail,
    path: "/admin/config/smtp",
  },
  {
    title: "Level",
    icon: Layers,
    path: "/admin/config/level",
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