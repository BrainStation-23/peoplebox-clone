import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFilterOptions = () => {
  const { data: levels, isLoading: isLoadingLevels } = useQuery({
    queryKey: ['levels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('levels')
        .select('id, name')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: locations, isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: employmentTypes, isLoading: isLoadingEmploymentTypes } = useQuery({
    queryKey: ['employment-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employment_types')
        .select('id, name')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: employeeRoles, isLoading: isLoadingEmployeeRoles } = useQuery({
    queryKey: ['employee-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_roles')
        .select('id, name')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: employeeTypes, isLoading: isLoadingEmployeeTypes } = useQuery({
    queryKey: ['employee-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_types')
        .select('id, name')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  return {
    levels: levels || [],
    locations: locations || [],
    employmentTypes: employmentTypes || [],
    employeeRoles: employeeRoles || [],
    employeeTypes: employeeTypes || [],
    isLoading: isLoadingLevels || isLoadingLocations || isLoadingEmploymentTypes || 
               isLoadingEmployeeRoles || isLoadingEmployeeTypes
  };
};