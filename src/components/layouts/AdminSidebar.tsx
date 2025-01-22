import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePendingSurveysCount } from "@/hooks/use-pending-surveys-count";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { navigationItems } from "@/config/navigation";

interface AdminSidebarProps {
  onSignOut: () => void;
}

export default function AdminSidebar({ onSignOut }: AdminSidebarProps) {
  const { data: pendingSurveysCount } = usePendingSurveysCount();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-3">
        <h2 className="font-semibold">Admin Portal</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link to={item.path} className="relative flex items-center">
                  <item.icon className="h-4 w-4" />
                  <span className="relative">
                    {item.title}
                    {item.path === "/admin/my-surveys" && pendingSurveysCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-3 -right-6 h-5 min-w-5 flex items-center justify-center p-0.5 text-xs"
                      >
                        {pendingSurveysCount}
                      </Badge>
                    )}
                  </span>
                </Link>
              </SidebarMenuButton>
              {item.children?.map((child) => (
                <SidebarMenuItem key={child.title} className="pl-4">
                  <SidebarMenuButton asChild>
                    <Link to={child.path}>
                      <child.icon className="h-4 w-4" />
                      <span>{child.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}