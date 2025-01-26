import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id } = await req.json();
    console.log('Attempting to delete user:', user_id);

    if (!user_id) {
      throw new Error('User ID is required');
    }

    // First, check if the user exists
    const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(user_id);
    
    if (userError || !userData.user) {
      console.error('Error finding user:', userError);
      throw new Error('User not found');
    }

    // Delete from auth.users (this will trigger the cascade delete function)
    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(
      user_id
    );

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      throw deleteError;
    }

    console.log('Successfully deleted user:', user_id);

    return new Response(
      JSON.stringify({ 
        message: 'User deleted successfully',
        userId: user_id 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Database error deleting user'
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});