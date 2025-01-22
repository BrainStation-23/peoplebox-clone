import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

type BreadcrumbItem = {
  title: string;
  path: string;
  isLast: boolean;
};

const getBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = '';
  
  paths.forEach((path, index) => {
    currentPath += `/${path}`;
    
    if (index === 0 && path === 'admin') return;
    
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

export default function AdminHeader() {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
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
            {breadcrumbs.map((crumb) => (
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
  );
}