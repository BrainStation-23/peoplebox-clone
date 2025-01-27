import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateBasicUserPayload {
  email: string
  password: string
  first_name: string
  last_name: string
  is_admin: boolean
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const payload: CreateBasicUserPayload = await req.json()
    console.log('Creating basic user:', { email: payload.email, is_admin: payload.is_admin })

    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
    })

    if (authError) {
      console.error('Auth user creation failed:', authError)
      throw authError
    }

    console.log('Auth user created:', authUser)

    // Update profile with name
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        first_name: payload.first_name,
        last_name: payload.last_name,
      })
      .eq("id", authUser.user.id)

    if (profileError) {
      console.error('Profile update failed:', profileError)
      throw profileError
    }

    // Set admin role if needed
    if (payload.is_admin) {
      const { error: roleError } = await supabase
        .from("user_roles")
        .update({ role: 'admin' })
        .eq("user_id", authUser.user.id)

      if (roleError) {
        console.error('Role update failed:', roleError)
        throw roleError
      }
    }

    return new Response(
      JSON.stringify({ success: true, userId: authUser.user.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('User creation failed:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})