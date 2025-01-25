import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  userId: string;
  status: 'active' | 'disabled';
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client with admin privileges
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the requesting user is an admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || roleData?.role !== 'admin') {
      throw new Error('Unauthorized - Admin access required')
    }

    // Parse request body
    const { userId, status } = await req.json() as RequestBody
    console.log(`Updating user ${userId} status to ${status}`)

    // Update profile status
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ status })
      .eq('id', userId)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      throw new Error('Failed to update profile status')
    }

    // Update auth.users banned status
    const { error: authError } = await supabaseClient.auth.admin.updateUserById(
      userId,
      { banned: status === 'disabled' }
    )

    if (authError) {
      console.error('Error updating auth user:', authError)
      throw new Error('Failed to update auth user status')
    }

    return new Response(
      JSON.stringify({ 
        message: 'User status updated successfully',
        status 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in toggle-user-status:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred while updating user status'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})