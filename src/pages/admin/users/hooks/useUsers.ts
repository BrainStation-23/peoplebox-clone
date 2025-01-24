import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";

interface UseUsersProps {
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  selectedSBU?: string;
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

      // Apply SBU filter if selected and not "all"
      if (selectedSBU && selectedSBU !== "all") {
        // First get the user_ids for the selected SBU
        const { data: sbuUsers } = await supabase
          .from('user_sbus')
          .select('user_id')
          .eq('sbu_id', selectedSBU);
        
        const userIds = sbuUsers?.map(item => item.user_id) || [];
        
        // Then filter profiles by these user_ids
        if (userIds.length > 0) {
          baseQuery = baseQuery.in('id', userIds);
        } else {
          // If no users found for SBU, return empty result
          return { users: [], total: 0 };
        }
      }

      // Get the total count with filters applied
      const countQuery = baseQuery.count();
      const { count: total, error: countError } = await countQuery;

      if (countError) {
        console.error("Error fetching count:", countError);
        throw countError;
      }

      // Calculate pagination
      const totalPages = Math.ceil((total || 0) / pageSize);
      const safePage = Math.min(currentPage, totalPages || 1);
      const start = (safePage - 1) * pageSize;

      // Get profiles with pagination
      const { data: profiles, error: profilesError } = await baseQuery
        .range(start, start + pageSize - 1);

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
        total: total || 0
      };
    },
  });
}