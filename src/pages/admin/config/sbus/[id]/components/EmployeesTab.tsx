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
import { Database } from "@/integrations/supabase/types";

interface EmployeesTabProps {
  sbuId: string | undefined;
}

type Employee = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  profile_image_url: string | null;
  level: {
    name: string;
  } | null;
  user_roles: {
    role: Database["public"]["Enums"]["user_role"];
  }[];
  user_supervisors: {
    supervisor: {
      id: string;
      first_name: string | null;
      last_name: string | null;
    };
    is_primary: boolean | null;
  }[];
  user_sbus?: {
    sbu: {
      id: string;
      name: string;
    };
    is_primary: boolean | null;
  }[];
};

type EmployeeResponse = {
  id: string;
  is_primary: boolean | null;
  profile: Employee;
};

export default function EmployeesTab({ sbuId }: EmployeesTabProps) {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const { data: employees, isLoading } = useQuery({
    queryKey: ["sbu-employees", sbuId, search, levelFilter],
    queryFn: async () => {
      console.log("Fetching employees for SBU:", sbuId);
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
              name
            ),
            user_supervisors!user_supervisors_user_id_fkey(
              is_primary,
              supervisor:profiles!user_supervisors_supervisor_id_fkey(
                id,
                first_name,
                last_name
              )
            ),
            user_sbus(
              is_primary,
              sbu:sbus(
                id,
                name
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

      if (levelFilter && levelFilter !== "all") {
        query = query.eq("profile.level_id", levelFilter);
      }

      const { data: employeesData, error } = await query;
      if (error) throw error;

      // Fetch user roles separately for each employee
      const employeesWithRoles = await Promise.all(
        (employeesData as any[])?.map(async (employee) => {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", employee.profile.id);

          return {
            ...employee,
            profile: {
              ...employee.profile,
              user_roles: roles || [],
            },
          };
        }) || []
      );

      return employeesWithRoles as EmployeeResponse[];
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
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
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