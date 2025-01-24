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

      // First, get profiles with their related data
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
          level:levels!left(name),
          location:locations!left(name),
          employment_type:employment_types!left(name),
          user_sbus!left(
            is_primary,
            sbu:sbus(name)
          )
        `, { count: 'exact' });

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,org_id.ilike.%${searchTerm}%`);
      }

      const { data: profiles, error: profilesError, count } = await query
        .range(start, end);

      if (profilesError) {
        throw profilesError;
      }

      // Then, get user roles for these profiles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', profiles?.map(p => p.id) || []);

      if (rolesError) {
        throw rolesError;
      }

      // Combine the data
      const usersWithData = profiles?.map((profile) => ({
        ...profile,
        level: profile.level?.[0] || null,
        location: profile.location?.[0] || null,
        employment_type: profile.employment_type?.[0] || null,
        user_roles: userRoles?.find(r => r.user_id === profile.id) || { role: "user" as const },
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