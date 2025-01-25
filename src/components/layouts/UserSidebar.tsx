import { Link } from "react-router-dom";
import { LogOut, LayoutDashboard, ClipboardList, UserRound, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePendingSurveysCount } from "@/hooks/use-pending-surveys-count";
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/user/dashboard",
  },
  {
    title: "My Surveys",
    icon: ClipboardList,
    path: "/user/my-surveys",
  },
  {
    title: "Profile",
    icon: UserRound,
    path: "/user/profile",
  },
  {
    title: "Settings",
    icon: Settings2,
    path: "/user/settings",
  },
];

interface UserSidebarProps {
  onSignOut: () => void;
}

export default function UserSidebar({ onSignOut }: UserSidebarProps) {
  const { data: pendingSurveysCount } = usePendingSurveysCount();

  return (
    <Sidebar>
      <div className="border-b px-6 py-3">
        <h2 className="font-semibold">User Portal</h2>
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
                    {item.path === "/user/my-surveys" && pendingSurveysCount > 0 && ` (${pendingSurveysCount})`}
                  </span>
                </Link>
              </SidebarMenuButton>
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