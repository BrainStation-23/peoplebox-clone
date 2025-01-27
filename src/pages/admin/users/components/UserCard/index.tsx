import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../../types";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Briefcase, Users, MapPin, Building, GraduationCap, Mail, Loader } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserCardProps {
  user: User;
  selected: boolean;
  onSelect: (userId: string, checked: boolean) => void;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onPasswordChange: (userId: string) => void;
  onRoleToggle: (userId: string, isAdmin: boolean) => void;
  onStatusToggle: (userId: string, isActive: boolean) => void;
}

export const UserCard = memo(function UserCard({
  user,
  selected,
  onSelect,
  onDelete,
  onPasswordChange,
  onRoleToggle,
  onStatusToggle,
}: UserCardProps) {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(user.user_roles.role === "admin");
  const [isActive, setIsActive] = useState(user.status === "active");
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const primarySbu = user.user_sbus?.find((sbu) => sbu.is_primary)?.sbu.name;
  const otherSbus = user.user_sbus?.filter(sbu => !sbu.is_primary).map(sbu => sbu.sbu.name);

  const handleRoleToggle = async (checked: boolean) => {
    setIsUpdatingRole(true);
    // Optimistically update the UI
    setIsAdmin(checked);

    try {
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: checked ? 'admin' : 'user' })
        .eq('user_id', user.id);

      if (roleError) throw roleError;

      onRoleToggle(user.id, checked);
      toast({
        title: "Success",
        description: `User role updated to ${checked ? 'admin' : 'user'}`,
      });
    } catch (error) {
      // Revert the optimistic update on failure
      setIsAdmin(!checked);
      console.error('Error updating role:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Failed to update user role',
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleStatusToggle = async (checked: boolean) => {
    setIsUpdatingStatus(true);
    // Optimistically update the UI
    setIsActive(checked);

    try {
      const { error } = await supabase.functions.invoke('toggle-user-status', {
        body: { 
          userId: user.id,
          status: checked ? 'active' : 'disabled'
        }
      });

      if (error) throw error;

      onStatusToggle(user.id, checked);
      toast({
        title: "Success",
        description: `User ${checked ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      // Revert the optimistic update on failure
      setIsActive(!checked);
      console.error('Error updating status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Failed to update user status',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <Card 
      className={cn(
        "relative h-full transition-all duration-200 hover:shadow-md will-change-transform",
        selected ? 'ring-2 ring-primary scale-[1.02]' : '',
        !isActive && 'opacity-75'
      )}
    >
      <div className="absolute top-4 right-4 z-10">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(user.id, checked as boolean)}
          className="transition-transform duration-200 hover:scale-110"
        />
      </div>
      
      <CardHeader className="space-y-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 ring-2 ring-background transition-transform duration-200 hover:scale-110">
            <AvatarImage src={user.profile_image_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-lg">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-none truncate">
              {user.first_name} {user.last_name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            {user.org_id && (
              <Badge variant="outline" className="mt-2">
                ID: {user.org_id}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {/* Status Section */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge variant={isAdmin ? "destructive" : "outline"}>
                {isAdmin ? "Admin" : "User"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Admin</span>
                <div className="relative">
                  <Switch
                    checked={isAdmin}
                    onCheckedChange={handleRoleToggle}
                    disabled={isUpdatingRole}
                    className={cn(
                      "transition-opacity duration-200 hover:opacity-80",
                      isUpdatingRole && "opacity-50"
                    )}
                  />
                  {isUpdatingRole && (
                    <Loader className="absolute right-[-24px] top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Active</span>
                <div className="relative">
                  <Switch
                    checked={isActive}
                    onCheckedChange={handleStatusToggle}
                    disabled={isUpdatingStatus}
                    className={cn(
                      "transition-opacity duration-200 hover:opacity-80",
                      isUpdatingStatus && "opacity-50"
                    )}
                  />
                  {isUpdatingStatus && (
                    <Loader className="absolute right-[-24px] top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Employment Details Section */}
          <div className="grid gap-3">
            {primarySbu && (
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground whitespace-nowrap">Primary SBU:</span>
                <span className="font-medium truncate">{primarySbu}</span>
              </div>
            )}
            {otherSbus && otherSbus.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground whitespace-nowrap">Other SBUs:</span>
                <span className="font-medium truncate">{otherSbus.join(", ")}</span>
              </div>
            )}
            {user.designation && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground whitespace-nowrap">Designation:</span>
                <span className="font-medium truncate">{user.designation}</span>
              </div>
            )}
            {user.level && (
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground whitespace-nowrap">Level:</span>
                <span className="font-medium truncate">{user.level}</span>
              </div>
            )}
            {user.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground whitespace-nowrap">Location:</span>
                <span className="font-medium truncate">{user.location}</span>
              </div>
            )}
            {user.employment_type && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground whitespace-nowrap">Employment Type:</span>
                <span className="font-medium truncate">{user.employment_type}</span>
              </div>
            )}
            {user.employee_role && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground whitespace-nowrap">Employee Role:</span>
                <span className="font-medium truncate">{user.employee_role}</span>
              </div>
            )}
            {user.employee_type && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground whitespace-nowrap">Employee Type:</span>
                <span className="font-medium truncate">{user.employee_type}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0 transition-transform duration-200 hover:scale-110"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem 
              onClick={() => navigate(`/admin/users/${user.id}/edit`)}
              className="cursor-pointer"
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onPasswordChange(user.id)}
              className="cursor-pointer"
            >
              Change Password
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive cursor-pointer"
              onClick={() => onDelete(user.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
});
