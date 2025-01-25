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
      
      // First, get the total count with filters
      let countQuery = supabase
        .from("profiles")
        .select('*', { count: 'exact', head: true });

      if (searchTerm) {
        countQuery = countQuery.or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,org_id.ilike.%${searchTerm}%`);
      }

      // If SBU is selected, first get the user IDs belonging to that SBU
      if (selectedSBU !== 'all') {
        const { data: sbuUsers } = await supabase
          .from('user_sbus')
          .select('user_id')
          .eq('sbu_id', selectedSBU);
        
        if (sbuUsers && sbuUsers.length > 0) {
          countQuery = countQuery.in('id', sbuUsers.map(u => u.user_id));
        } else {
          // If no users in the selected SBU, return empty result
          return { users: [], total: 0 };
        }
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error("Error fetching count:", countError);
        throw countError;
      }

      const total = count || 0;
      const start = (currentPage - 1) * pageSize;

      // Then, get profiles with their related data
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
        `);

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,org_id.ilike.%${searchTerm}%`);
      }

      // Apply SBU filter to the main query
      if (selectedSBU !== 'all') {
        const { data: sbuUsers } = await supabase
          .from('user_sbus')
          .select('user_id')
          .eq('sbu_id', selectedSBU);
        
        if (sbuUsers && sbuUsers.length > 0) {
          query = query.in('id', sbuUsers.map(u => u.user_id));
        } else {
          return { users: [], total: 0 };
        }
      }

      const { data: profiles, error: profilesError } = await query
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
        total
      };
    },
  });
}