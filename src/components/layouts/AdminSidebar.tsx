import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePendingSurveysCount } from "@/hooks/use-pending-surveys-count";
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { navigationItems } from "@/config/navigation";

interface AdminSidebarProps {
  onSignOut: () => void;
}

export default function AdminSidebar({ onSignOut }: AdminSidebarProps) {
  const { data: pendingSurveysCount } = usePendingSurveysCount();

  return (
    <Sidebar>
      <div className="border-b px-6 py-3">
        <h2 className="font-semibold">Admin Portal</h2>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link to={item.path} className="flex items-center">
                  <item.icon className="h-4 w-4" />
                  <span>
                    {item.title}
                    {item.path === "/admin/my-surveys" && pendingSurveysCount > 0 && ` (${pendingSurveysCount})`}
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
      </div>
      <div className="p-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </Sidebar>
  );
}