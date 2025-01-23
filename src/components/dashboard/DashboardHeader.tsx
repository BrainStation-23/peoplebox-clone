import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface DashboardHeaderProps {
  profile?: {
    first_name?: string | null;
    last_name?: string | null;
    email: string;
    profile_image_url?: string | null;
    level?: { name: string } | null;
    user_sbus?: Array<{
      is_primary: boolean;
      sbu: { name: string };
    }>;
  } | null;
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const primarySBU = profile?.user_sbus?.find(sbu => sbu.is_primary)?.sbu.name;

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Dashboard</h2>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={profile?.profile_image_url || ''} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="p-2">
                <p className="text-sm font-medium">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs text-muted-foreground">{profile?.email}</p>
                {primarySBU && (
                  <p className="text-xs text-muted-foreground">{primarySBU}</p>
                )}
              </div>
              <DropdownMenuItem onSelect={() => navigate('/profile')}>
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleSignOut}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}