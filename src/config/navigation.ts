import { 
  LayoutDashboard, 
  Settings2, 
  UserRound, 
  Users, 
  FileText, 
  Grid,
  ClipboardList
} from "lucide-react";

export type NavigationItem = {
  title: string;
  icon: any;
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
    title: "My Surveys",
    icon: ClipboardList,
    path: "/admin/my-surveys",
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
  {
    title: "Settings",
    icon: Settings2,
    path: "/admin/settings",
  },
];