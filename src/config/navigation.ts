import { 
  LayoutDashboard, 
  Settings2, 
  UserRound, 
  Users, 
  FileText, 
  Grid 
} from "lucide-react";

export type NavigationItem = {
  title: string;
  icon: any; // Using any here since Lucide icons don't share a common type
  path: string;
  children?: NavigationItem[];
};

export const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
  },
  {
    title: "Users",
    icon: Users,
    path: "/admin/users",
  },
  {
    title: "Surveys",
    icon: FileText,
    path: "/admin/surveys",
    children: [
      {
        title: "Campaigns",
        icon: Grid,
        path: "/admin/surveys/campaigns",
      },
    ],
  },
  {
    title: "Platform Config",
    icon: Settings2,
    path: "/admin/config",
  },
  {
    title: "Profile",
    icon: UserRound,
    path: "/admin/profile",
  },
];