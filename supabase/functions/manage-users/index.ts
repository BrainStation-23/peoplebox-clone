import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UpdateUserPayload {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  is_admin?: boolean;
  level?: string;
  employment_type?: string;
  employee_role?: string;
  employee_type?: string;
  sbus?: string;
  org_id?: string;
  gender?: string;
  date_of_birth?: string;
  designation?: string;
  location?: string;
}

// Helper function to convert empty strings to null
function nullIfEmpty(value: string | undefined | null): string | null {
  if (value === undefined || value === null || value.trim() === '') {
    return null;
  }
  return value.trim();
}

async function getLevelId(supabaseClient: any, levelName: string) {
  if (!levelName?.trim()) return null;
  
  const { data, error } = await supabaseClient
    .from('levels')
    .select('id')
    .eq('name', levelName)
    .single();
  
  if (error) {
    console.error('Error finding level:', levelName, error);
    return null;
  }
  return data?.id;
}

async function getEmploymentTypeId(supabaseClient: any, typeName: string) {
  if (!typeName?.trim()) return null;

  const { data, error } = await supabaseClient
    .from('employment_types')
    .select('id')
    .eq('name', typeName)
    .eq('status', 'active')
    .single();
  
  if (error) {
    console.error('Error finding employment type:', typeName, error);
    return null;
  }
  return data?.id;
}

async function getLocationId(supabaseClient: any, locationName: string) {
  if (!locationName?.trim()) return null;

  const { data, error } = await supabaseClient
    .from('locations')
    .select('id')
    .eq('name', locationName)
    .single();
  
  if (error) {
    console.error('Error finding location:', locationName, error);
    return null;
  }
  return data?.id;
}

async function getEmployeeRoleId(supabaseClient: any, roleName: string) {
  if (!roleName?.trim()) return null;

  const { data, error } = await supabaseClient
    .from('employee_roles')
    .select('id')
    .eq('name', roleName)
    .eq('status', 'active')
    .single();
  
  if (error) {
    console.error('Error finding employee role:', roleName, error);
    return null;
  }
  return data?.id;
}

async function getEmployeeTypeId(supabaseClient: any, typeName: string) {
  if (!typeName?.trim()) return null;

  const { data, error } = await supabaseClient
    .from('employee_types')
    .select('id')
    .eq('name', typeName)
    .eq('status', 'active')
    .single();
  
  if (error) {
    console.error('Error finding employee type:', typeName, error);
    return null;
  }
  return data?.id;
}

async function getSBUIds(supabaseClient: any, sbuNames: string) {
  if (!sbuNames?.trim()) return [];

  const names = sbuNames.split(',').map(name => name.trim());
  const { data, error } = await supabaseClient
    .from('sbus')
    .select('id, name')
    .in('name', names);
  
  if (error) {
    console.error('Error finding SBUs:', names, error);
    return [];
  }
  return data;
}

async function handleUserUpdate(supabaseClient: any, user: UpdateUserPayload) {
  console.log('Processing update for user:', user.id);
  
  try {
    // Get IDs for relationships
    const [levelId, employmentTypeId, locationId, employeeRoleId, employeeTypeId] = await Promise.all([
      user.level ? getLevelId(supabaseClient, user.level) : null,
      user.employment_type ? getEmploymentTypeId(supabaseClient, user.employment_type) : null,
      user.location ? getLocationId(supabaseClient, user.location) : null,
      user.employee_role ? getEmployeeRoleId(supabaseClient, user.employee_role) : null,
      user.employee_type ? getEmployeeTypeId(supabaseClient, user.employee_type) : null
    ]);

    // Update profile
    const { error: updateProfileError } = await supabaseClient
      .from('profiles')
      .update({
        first_name: nullIfEmpty(user.first_name),
        last_name: nullIfEmpty(user.last_name),
        org_id: nullIfEmpty(user.org_id),
        level_id: levelId,
        employment_type_id: employmentTypeId,
        location_id: locationId,
        employee_role_id: employeeRoleId,
        employee_type_id: employeeTypeId,
        gender: nullIfEmpty(user.gender),
        date_of_birth: nullIfEmpty(user.date_of_birth),
        designation: nullIfEmpty(user.designation)
      })
      .eq('id', user.id);

    if (updateProfileError) {
      throw updateProfileError;
    }

    // Update role if needed
    if (user.is_admin !== undefined) {
      const { error: updateRoleError } = await supabaseClient
        .from('user_roles')
        .update({ role: user.is_admin ? 'admin' : 'user' })
        .eq('user_id', user.id);

      if (updateRoleError) {
        throw updateRoleError;
      }
    }

    // Handle SBU assignments if provided
    if (user.sbus) {
      const sbuData = await getSBUIds(supabaseClient, user.sbus);
      if (sbuData.length > 0) {
        // Remove existing assignments
        await supabaseClient
          .from('user_sbus')
          .delete()
          .eq('user_id', user.id);

        // Create new assignments
        const sbuAssignments = sbuData.map((sbu, index) => ({
          user_id: user.id,
          sbu_id: sbu.id,
          is_primary: index === 0 // First SBU is primary
        }));

        const { error: sbuError } = await supabaseClient
          .from('user_sbus')
          .insert(sbuAssignments);

        if (sbuError) {
          throw sbuError;
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user } = await req.json();
    
    if (!user?.id) {
      throw new Error('User ID is required for updates');
    }

    const result = await handleUserUpdate(supabaseClient, user);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update user');
    }

    return new Response(
      JSON.stringify({ message: 'User updated successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.details || 'No additional details available'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});