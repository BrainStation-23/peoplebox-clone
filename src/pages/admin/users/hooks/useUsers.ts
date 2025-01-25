import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";

interface UseUsersProps {
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  selectedSBU: string;
}

export function useUsers({ currentPage, pageSize, searchTerm, selectedSBU }: UseUsersProps) {
  return useQuery({
    queryKey: ["users", currentPage, pageSize, searchTerm, selectedSBU],
    queryFn: async () => {
      console.log("Fetching users with params:", { currentPage, pageSize, searchTerm, selectedSBU });
      
      let baseQuery = supabase
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
        `);

      // Apply search filter if provided
      if (searchTerm) {
        baseQuery = baseQuery.or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,org_id.ilike.%${searchTerm}%`);
      }

      // Apply SBU filter if selected
      if (selectedSBU !== 'all') {
        // First get the user IDs for the selected SBU
        const { data: sbuUsers } = await supabase
          .from('user_sbus')
          .select('user_id')
          .eq('sbu_id', selectedSBU);

        const userIds = sbuUsers?.map(u => u.user_id) || [];
        
        // If no users found in the SBU, return empty result
        if (userIds.length === 0) {
          return { users: [], total: 0 };
        }
        
        baseQuery = baseQuery.in('id', userIds);
      }

      // First get the total count
      const countQuery = await baseQuery.count();

      if (countQuery.error) {
        console.error("Error fetching count:", countQuery.error);
        throw countQuery.error;
      }

      // Then get the paginated data using the same base query
      const { data: profiles, error: profilesError } = await baseQuery
        .range(pageSize * (currentPage - 1), pageSize * currentPage - 1);

      console.log("Fetched profiles:", profiles);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      // Get user roles for these profiles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', profiles?.map(p => p.id) || []);

      console.log("Fetched user roles:", userRoles);

      if (rolesError) {
        console.error("Error fetching user roles:", rolesError);
        throw rolesError;
      }

      // Combine the data
      const usersWithData = profiles?.map((profile) => {
        const userData = {
          ...profile,
          level: profile.level?.name || null,
          location: profile.location?.name || null,
          employment_type: profile.employment_type?.name || null,
          user_roles: userRoles?.find(r => r.user_id === profile.id) || { role: "user" as const },
          user_sbus: profile.user_sbus?.map(sbu => ({
            ...sbu,
            sbu: sbu.sbu
          }))
        };
        console.log("Transformed user data:", userData);
        return userData;
      });

      return {
        users: usersWithData as User[],
        total: countQuery.count || 0
      };
    },
  });
}