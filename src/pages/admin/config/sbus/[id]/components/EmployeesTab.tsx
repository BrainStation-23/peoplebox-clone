import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import EmployeeCard from "./EmployeeCard";
import { UserRole } from "@/pages/admin/users/types";

interface EmployeesTabProps {
  sbuId: string | undefined;
}

export default function EmployeesTab({ sbuId }: EmployeesTabProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [levelFilter, setLevelFilter] = useState<string>("");

  const { data: employees, isLoading } = useQuery({
    queryKey: ["sbu-employees", sbuId, search, roleFilter, levelFilter],
    queryFn: async () => {
      let query = supabase
        .from("user_sbus")
        .select(`
          id,
          is_primary,
          profile:profiles!user_sbus_user_id_fkey(
            id,
            first_name,
            last_name,
            email,
            profile_image_url,
            level:levels(
              id,
              name
            )
          )
        `)
        .eq("sbu_id", sbuId);

      if (search) {
        query = query.or(
          `profile.first_name.ilike.%${search}%,profile.last_name.ilike.%${search}%,profile.email.ilike.%${search}%`
        );
      }

      if (levelFilter) {
        query = query.eq("profile.level_id", levelFilter);
      }

      const { data: userSBUs, error: userSBUsError } = await query;
      if (userSBUsError) throw userSBUsError;

      // Fetch user roles separately for each user
      const employeesWithRoles = await Promise.all(
        userSBUs.map(async (userSBU) => {
          const { data: userRoles, error: rolesError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", userSBU.profile.id);
          
          if (rolesError) throw rolesError;

          // Fetch user supervisors
          const { data: supervisors, error: supervisorsError } = await supabase
            .from("user_supervisors")
            .select(`
              is_primary,
              supervisor:profiles!user_supervisors_supervisor_id_fkey(
                id,
                first_name,
                last_name
              )
            `)
            .eq("user_id", userSBU.profile.id);

          if (supervisorsError) throw supervisorsError;

          // Apply role filter if specified
          if (roleFilter && !userRoles?.some(ur => ur.role === roleFilter)) {
            return null;
          }

          return {
            ...userSBU,
            profile: {
              ...userSBU.profile,
              level: userSBU.profile.level?.[0] || null,
              user_roles: userRoles || [],
              user_supervisors: supervisors || []
            }
          };
        })
      );

      // Filter out null values (from role filter) and transform data
      return employeesWithRoles
        .filter((employee): employee is NonNullable<typeof employee> => employee !== null)
        .map(employee => ({
          id: employee.id,
          is_primary: employee.is_primary,
          profile: {
            first_name: employee.profile.first_name,
            last_name: employee.profile.last_name,
            email: employee.profile.email,
            profile_image_url: employee.profile.profile_image_url,
            level: employee.profile.level,
            user_roles: employee.profile.user_roles,
            user_supervisors: employee.profile.user_supervisors
          }
        }));
    },
    enabled: !!sbuId,
  });

  const { data: levels } = useQuery({
    queryKey: ["levels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("levels")
        .select("*")
        .eq("status", "active");
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select value={roleFilter} onValueChange={(value: UserRole | "") => setRoleFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All levels</SelectItem>
            {levels?.map((level) => (
              <SelectItem key={level.id} value={level.id}>
                {level.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees?.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee.profile}
            isPrimarySBU={employee.is_primary}
          />
        ))}
      </div>
    </div>
  );
}