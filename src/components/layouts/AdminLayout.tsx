import { useEffect } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Settings2, UserRound, LogOut, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useToast } from "@/hooks/use-toast";

const navigationItems = [
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

const getBreadcrumbs = (pathname: string) => {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs = [];
  
  let currentPath = '';
  
  paths.forEach((path, index) => {
    currentPath += `/${path}`;
    
    // Skip the first "admin" part
    if (index === 0 && path === 'admin') return;
    
    // Format the title
    let title = path.charAt(0).toUpperCase() + path.slice(1);
    if (path === 'sbus') title = 'SBUs';
    if (path === 'smtp') title = 'SMTP';
    
    breadcrumbs.push({
      title,
      path: currentPath,
      isLast: index === paths.length - 1
    });
  });
  
  return breadcrumbs;
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const breadcrumbs = getBreadcrumbs(location.pathname);
  
  useEffect(() => {
    const checkAdmin = async () => {
      console.log("Checking admin status...");
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please try logging in again",
        });
        navigate('/login');
        return;
      }
      
      if (!session) {
        console.log("No session found, redirecting to login");
        navigate('/login');
        return;
      }

      console.log("Session found:", session.user.id);

      try {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (roleError) {
          console.error("Role fetch error:", roleError);
          throw roleError;
        }

        console.log("User role:", roleData?.role);

        if (roleData?.role !== 'admin') {
          console.log("User is not admin, redirecting to dashboard");
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You need admin privileges to access this area",
          });
          navigate('/dashboard');
        }
      } catch (error: any) {
        console.error("Error checking admin status:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify admin access",
        });
        navigate('/dashboard');
      }
    };

    checkAdmin();
  }, [navigate, toast]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out",
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar>
          <SidebarHeader className="border-b px-6 py-3">
            <h2 className="font-semibold">Admin Portal</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-h-screen">
          <header className="border-b bg-background">
            <div className="flex items-center p-4">
              <SidebarTrigger className="mr-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <Link to="/admin" className="text-muted-foreground hover:text-foreground">
                      Admin
                    </Link>
                  </BreadcrumbItem>
                  {breadcrumbs.map((crumb, index) => (
                    <BreadcrumbItem key={crumb.path}>
                      <BreadcrumbSeparator />
                      {crumb.isLast ? (
                        <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                      ) : (
                        <Link to={crumb.path} className="text-muted-foreground hover:text-foreground">
                          {crumb.title}
                        </Link>
                      )}
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
