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
          level_id,
          org_id,
          levels (
            id,
            name,
            status
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

      const usersWithData = await Promise.all(
        profiles.map(async (profile) => {
          const { data: roleData, error: roleError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id)
            .single();

          if (roleError) {
            return {
              ...profile,
              user_roles: { role: "user" as const },
            };
          }

          const { data: sbuData, error: sbuError } = await supabase
            .from("user_sbus")
            .select(`
              id,
              user_id,
              sbu_id,
              is_primary,
              sbu:sbus (
                id,
                name
              )
            `)
            .eq("user_id", profile.id);

          if (sbuError) {
            return {
              ...profile,
              user_roles: roleData,
              user_sbus: [],
            };
          }

          return {
            ...profile,
            user_roles: roleData,
            user_sbus: sbuData,
          };
        })
      );

      return {
        users: usersWithData as User[],
        total: count || 0
      };
    },
  });
}