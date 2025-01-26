import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserPayload {
  id?: string;
  email: string;
  password?: string;
  first_name: string | null;
  last_name: string | null;
  is_admin: boolean;
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

interface BatchCreateUserPayload {
  users: CreateUserPayload[];
}

interface DeleteUserPayload {
  user_id: string;
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

async function handleUserRelationships(supabaseClient: any, userId: string, user: CreateUserPayload) {
  console.log('Processing relationships for user:', user.email);
  
  try {
    // Get IDs for relationships
    const [levelId, employmentTypeId, locationId, employeeRoleId, employeeTypeId] = await Promise.all([
      user.level ? getLevelId(supabaseClient, user.level) : null,
      user.employment_type ? getEmploymentTypeId(supabaseClient, user.employment_type) : null,
      user.location ? getLocationId(supabaseClient, user.location) : null,
      user.employee_role ? getEmployeeRoleId(supabaseClient, user.employee_role) : null,
      user.employee_type ? getEmployeeTypeId(supabaseClient, user.employee_type) : null
    ]);

    // Update profile with all fields, converting empty strings to null
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
      .eq('id', userId);

    if (updateProfileError) {
      throw updateProfileError;
    }

    // Handle SBU assignments if provided
    if (user.sbus) {
      const sbuData = await getSBUIds(supabaseClient, user.sbus);
      if (sbuData.length > 0) {
        // Remove existing assignments
        await supabaseClient
          .from('user_sbus')
          .delete()
          .eq('user_id', userId);

        // Create new assignments
        const sbuAssignments = sbuData.map((sbu, index) => ({
          user_id: userId,
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

    return null;
  } catch (error) {
    console.error('Error handling relationships:', error);
    return error;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Creating Supabase client...')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { method, action } = await req.json()
    console.log(`Received request with method: ${method}`)

    if (method === 'BATCH_CREATE') {
      const payload = action as BatchCreateUserPayload
      console.log('Processing users in batch:', payload.users.length)

      const results = []
      const errors = []

      for (const user of payload.users) {
        try {
          if (user.id) {
            // Update existing user
            console.log('Updating existing user:', user.id)
            
            // Handle all relationships and profile updates
            const relationshipError = await handleUserRelationships(supabaseClient, user.id, user);
            
            if (relationshipError) {
              errors.push({ user: user, error: relationshipError.message });
              continue;
            }

            // Update role if needed
            if (user.is_admin) {
              const { error: updateRoleError } = await supabaseClient
                .from('user_roles')
                .update({ role: 'admin' })
                .eq('user_id', user.id);

              if (updateRoleError) {
                errors.push({ user: user, error: updateRoleError.message });
                continue;
              }
            }

            results.push({ user: user, success: true });
          } else {
            // Create new user
            console.log('Creating new user:', user.email);
            const password = user.password || Math.random().toString(36).slice(-8);
            
            const { data: authUser, error: createUserError } = await supabaseClient.auth.admin.createUser({
              email: user.email,
              password: password,
              email_confirm: true
            });

            if (createUserError) {
              console.error('Error creating user:', createUserError);
              errors.push({ user: user, error: createUserError.message });
              continue;
            }

            // Handle all relationships and profile updates
            const relationshipError = await handleUserRelationships(supabaseClient, authUser.user.id, user);
            
            if (relationshipError) {
              errors.push({ user: user, error: relationshipError.message });
              continue;
            }

            // Set admin role if needed
            if (user.is_admin) {
              const { error: updateRoleError } = await supabaseClient
                .from('user_roles')
                .update({ role: 'admin' })
                .eq('user_id', authUser.user.id);

              if (updateRoleError) {
                errors.push({ user: user, error: updateRoleError.message });
                continue;
              }
            }

            results.push({ user: user, success: true });
          }
        } catch (error) {
          console.error('Error processing user:', user, error);
          errors.push({ user: user, error: error.message });
        }
      }

      return new Response(
        JSON.stringify({ 
          message: 'Batch processing completed',
          results: results,
          errors: errors
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    console.error('Invalid method received:', method);
    throw new Error('Invalid method');

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
})
