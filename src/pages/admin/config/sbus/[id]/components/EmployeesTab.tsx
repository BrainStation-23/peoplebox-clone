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
          profile:profiles!inner(
            id,
            first_name,
            last_name,
            email,
            profile_image_url,
            level:levels(
              id,
              name
            ),
            user_roles(
              role
            ),
            user_supervisors(
              is_primary,
              supervisor:profiles!user_supervisors_supervisor_id_fkey(
                id,
                first_name,
                last_name
              )
            )
          )
        `)
        .eq("sbu_id", sbuId);

      if (search) {
        query = query.or(
          `profile.first_name.ilike.%${search}%,profile.last_name.ilike.%${search}%,profile.email.ilike.%${search}%`
        );
      }

      if (roleFilter) {
        query = query.eq("profile.user_roles.role", roleFilter);
      }

      if (levelFilter) {
        query = query.eq("profile.level.id", levelFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform the data to match the expected type
      return data.map((employee) => ({
        ...employee,
        profile: {
          first_name: employee.profile.first_name,
          last_name: employee.profile.last_name,
          email: employee.profile.email,
          profile_image_url: employee.profile.profile_image_url,
          level: employee.profile.level?.[0] || null,
          user_roles: Array.isArray(employee.profile.user_roles) 
            ? employee.profile.user_roles 
            : [],
          user_supervisors: employee.profile.user_supervisors.map((sup) => ({
            supervisor: sup.supervisor,
            is_primary: sup.is_primary || false,
          })),
        },
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