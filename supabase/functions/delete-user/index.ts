import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id } = await req.json()

    if (!user_id) {
      throw new Error('User ID is required');
    }

    // Check if user exists
    const { data: user, error: userError } = await supabaseClient.auth.admin.getUserById(user_id);

    if (userError || !user) {
      console.error('Error fetching user:', userError);
      throw new Error('User not found');
    }

    console.log('Starting manual database cleanup...');

    // Delete surveys created by the user
    const { error: surveysError } = await supabaseClient
      .from('surveys')
      .delete()
      .eq('created_by', user_id);
    
    if (surveysError) {
      console.error('Error deleting surveys:', surveysError);
      throw surveysError;
    }

    // Delete user_roles
    const { error: rolesError } = await supabaseClient
      .from('user_roles')
      .delete()
      .eq('user_id', user_id);
    
    if (rolesError) {
      console.error('Error deleting user roles:', rolesError);
      throw rolesError;
    }

    // Delete user_sbus
    const { error: sbusError } = await supabaseClient
      .from('user_sbus')
      .delete()
      .eq('user_id', user_id);
    
    if (sbusError) {
      console.error('Error deleting user sbus:', sbusError);
      throw sbusError;
    }

    // Delete user_supervisors
    const { error: supervisorsError } = await supabaseClient
      .from('user_supervisors')
      .delete()
      .or(`user_id.eq.${user_id},supervisor_id.eq.${user_id}`);
    
    if (supervisorsError) {
      console.error('Error deleting user supervisors:', supervisorsError);
      throw supervisorsError;
    }

    // Delete survey_assignments
    const { error: assignmentsError } = await supabaseClient
      .from('survey_assignments')
      .delete()
      .eq('user_id', user_id);
    
    if (assignmentsError) {
      console.error('Error deleting survey assignments:', assignmentsError);
      throw assignmentsError;
    }

    // Delete survey_responses
    const { error: responsesError } = await supabaseClient
      .from('survey_responses')
      .delete()
      .eq('user_id', user_id);
    
    if (responsesError) {
      console.error('Error deleting survey responses:', responsesError);
      throw responsesError;
    }

    // Update SBUs where user is head
    const { error: sbusHeadError } = await supabaseClient
      .from('sbus')
      .update({ head_id: null })
      .eq('head_id', user_id);
    
    if (sbusHeadError) {
      console.error('Error updating sbus head:', sbusHeadError);
      throw sbusHeadError;
    }

    // Update profile to remove foreign key references
    const { error: profileUpdateError } = await supabaseClient
      .from('profiles')
      .update({
        employee_role_id: null,
        employee_type_id: null,
        employment_type_id: null,
        level_id: null,
        location_id: null
      })
      .eq('id', user_id);
    
    if (profileUpdateError) {
      console.error('Error updating profile:', profileUpdateError);
      throw profileUpdateError;
    }

    // Delete profile
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .delete()
      .eq('id', user_id);
    
    if (profileError) {
      console.error('Error deleting profile:', profileError);
      throw profileError;
    }

    console.log('Database cleanup completed successfully');

    // Finally, delete from auth.users
    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(user_id);

    if (deleteError) {
      console.error('Error deleting auth user:', deleteError);
      throw deleteError;
    }

    return new Response(
      JSON.stringify({ 
        message: 'User deleted successfully'
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error deleting user'
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    )
  }
})