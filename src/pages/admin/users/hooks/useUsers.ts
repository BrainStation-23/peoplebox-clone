import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";

interface UseUsersProps {
  currentPage: number;
  pageSize: number;
  searchTerm: string;
}

export function useUsers({ currentPage, pageSize, searchTerm }: UseUsersProps) {
  return useQuery({
    queryKey: ["users", currentPage, pageSize, searchTerm],
    queryFn: async () => {
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize - 1;

      let query = supabase
        .from("profiles")
        .select(`
          id,
          email,
          first_name,
          last_name,
          profile_image_url,
          org_id,
          gender,
          date_of_birth,
          designation,
          level:levels(name),
          location:locations(name),
          employment_type:employment_types(name),
          user_roles(role),
          user_sbus!inner(
            is_primary,
            sbu:sbus(name)
          )
        `, { count: 'exact' });

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,org_id.ilike.%${searchTerm}%`);
      }

      query = query.range(start, end);

      const { data: profiles, error: profilesError, count } = await query;

      if (profilesError) {
        throw profilesError;
      }

      const usersWithData = profiles.map((profile) => ({
        ...profile,
        level: profile.level?.[0] || null,
        location: profile.location?.[0] || null,
        employment_type: profile.employment_type?.[0] || null,
        user_roles: profile.user_roles?.[0] || { role: "user" as const },
        user_sbus: profile.user_sbus?.map(sbu => ({
          ...sbu,
          sbu: sbu.sbu
        }))
      }));

      return {
        users: usersWithData as User[],
        total: count || 0
      };
    },
  });
}