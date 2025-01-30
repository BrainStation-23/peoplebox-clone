import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper functions for ID lookups
async function getLevelIdByName(supabase: any, name: string): Promise<string | null> {
  if (!name?.trim()) return null;
  
  const { data, error } = await supabase
    .from('levels')
    .select('id')
    .eq('name', name.trim())
    .eq('status', 'active')
    .maybeSingle();
  
  if (error) {
    console.error('Error finding level:', name, error);
    return null;
  }
  return data?.id;
}

async function getLocationIdByName(supabase: any, name: string): Promise<string | null> {
  if (!name?.trim()) return null;
  
  const { data, error } = await supabase
    .from('locations')
    .select('id')
    .eq('name', name.trim())
    .maybeSingle();
  
  if (error) {
    console.error('Error finding location:', name, error);
    return null;
  }
  return data?.id;
}

async function getEmploymentTypeIdByName(supabase: any, name: string): Promise<string | null> {
  if (!name?.trim()) return null;
  
  const { data, error } = await supabase
    .from('employment_types')
    .select('id')
    .eq('name', name.trim())
    .eq('status', 'active')
    .maybeSingle();
  
  if (error) {
    console.error('Error finding employment type:', name, error);
    return null;
  }
  return data?.id;
}

async function getEmployeeRoleIdByName(supabase: any, name: string): Promise<string | null> {
  if (!name?.trim()) return null;
  
  const { data, error } = await supabase
    .from('employee_roles')
    .select('id')
    .eq('name', name.trim())
    .eq('status', 'active')
    .maybeSingle();
  
  if (error) {
    console.error('Error finding employee role:', name, error);
    return null;
  }
  return data?.id;
}

async function getEmployeeTypeIdByName(supabase: any, name: string): Promise<string | null> {
  if (!name?.trim()) return null;
  
  const { data, error } = await supabase
    .from('employee_types')
    .select('id')
    .eq('name', name.trim())
    .eq('status', 'active')
    .maybeSingle();
  
  if (error) {
    console.error('Error finding employee type:', name, error);
    return null;
  }
  return data?.id;
}

async function getSbuIdByName(supabase: any, name: string): Promise<string | null> {
  if (!name?.trim()) return null;
  
  const { data, error } = await supabase
    .from('sbus')
    .select('id')
    .eq('name', name.trim())
    .maybeSingle();
  
  if (error) {
    console.error('Error finding SBU:', name, error);
    return null;
  }
  return data?.id;
}

async function getSupervisorIdByEmail(supabase: any, email: string): Promise<string | null> {
  if (!email?.trim()) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.trim())
    .maybeSingle();

  if (error) {
    console.error('Error finding supervisor:', email, error);
    return null;
  }
  return data?.id;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { users } = await req.json()

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as any[],
    }

    for (const user of users) {
      try {
        console.log('Processing user update:', user)

        // Lookup all required IDs
        const [
          levelId,
          locationId,
          employmentTypeId,
          employeeRoleId,
          employeeTypeId,
          supervisorId,
        ] = await Promise.all([
          getLevelIdByName(supabase, user.level),
          getLocationIdByName(supabase, user.location),
          getEmploymentTypeIdByName(supabase, user.employment_type),
          getEmployeeRoleIdByName(supabase, user.employee_role),
          getEmployeeTypeIdByName(supabase, user.employee_type),
          getSupervisorIdByEmail(supabase, user.supervisor_email),
        ]);

        console.log('Looked up IDs:', {
          levelId,
          locationId,
          employmentTypeId,
          employeeRoleId,
          employeeTypeId,
          supervisorId,
        });

        // Prepare update data with found IDs
        const updateData: any = {
          first_name: user.first_name,
          last_name: user.last_name,
          org_id: user.org_id,
          gender: user.gender,
          date_of_birth: user.date_of_birth,
          designation: user.designation,
        };

        // Only add IDs that were successfully looked up
        if (levelId) updateData.level_id = levelId;
        if (locationId) updateData.location_id = locationId;
        if (employmentTypeId) updateData.employment_type_id = employmentTypeId;
        if (employeeRoleId) updateData.employee_role_id = employeeRoleId;
        if (employeeTypeId) updateData.employee_type_id = employeeTypeId;

        console.log('Updating profile with data:', updateData);

        // Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);

        if (profileError) {
          throw profileError;
        }

        // Update role if provided
        if (user.role) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .update({ role: user.role })
            .eq('user_id', user.id);

          if (roleError) {
            throw roleError;
          }
        }

        // Handle supervisor assignment if provided
        if (supervisorId) {
          // Prevent self-supervision
          if (supervisorId === user.id) {
            console.warn('Attempted self-supervision:', user.email);
          } else {
            // Remove existing primary supervisor
            await supabase
              .from('user_supervisors')
              .update({ is_primary: false })
              .eq('user_id', user.id)
              .eq('is_primary', true);

            // Check if relationship exists
            const { data: existingRelation } = await supabase
              .from('user_supervisors')
              .select()
              .eq('user_id', user.id)
              .eq('supervisor_id', supervisorId)
              .maybeSingle();

            if (existingRelation) {
              // Update existing to primary
              const { error: updateError } = await supabase
                .from('user_supervisors')
                .update({ is_primary: true })
                .eq('id', existingRelation.id);

              if (updateError) {
                console.error('Error updating supervisor relation:', updateError);
              }
            } else {
              // Create new primary relationship
              const { error: insertError } = await supabase
                .from('user_supervisors')
                .insert({
                  user_id: user.id,
                  supervisor_id: supervisorId,
                  is_primary: true
                });

              if (insertError) {
                console.error('Error creating supervisor relation:', insertError);
              }
            }
          }
        }

        // Handle SBU assignments if provided
        if (user.sbus) {
          // Delete existing SBU assignments
          await supabase
            .from('user_sbus')
            .delete()
            .eq('user_id', user.id);

          // Create new SBU assignments
          const sbuList = user.sbus.split(';').map((sbu: string) => sbu.trim());
          
          for (let i = 0; i < sbuList.length; i++) {
            const sbuId = await getSbuIdByName(supabase, sbuList[i]);
            
            if (sbuId) {
              const { error: sbuError } = await supabase
                .from('user_sbus')
                .insert({
                  user_id: user.id,
                  sbu_id: sbuId,
                  is_primary: i === 0,
                });

              if (sbuError) {
                console.error('Error assigning SBU:', sbuList[i], sbuError);
              }
            } else {
              console.error('Could not find SBU:', sbuList[i]);
            }
          }
        }

        results.successful++;
      } catch (error) {
        console.error('Error updating user:', error);
        results.failed++;
        results.errors.push({
          user,
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
})