import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserPayload {
  email: string;
  password: string;
  first_name: string | null;
  last_name: string | null;
  is_admin: boolean;
}

interface DeleteUserPayload {
  user_id: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { method, action } = await req.json()

    if (method === 'CREATE') {
      const payload = action as CreateUserPayload
      
      // Create user in auth.users
      const { data: authUser, error: createError } = await supabaseClient.auth.admin.createUser({
        email: payload.email,
        password: payload.password,
        email_confirm: true
      })

      if (createError) throw createError

      // Update profile
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .update({
          first_name: payload.first_name,
          last_name: payload.last_name
        })
        .eq('id', authUser.user.id)

      if (profileError) throw profileError

      // Set admin role if needed
      if (payload.is_admin) {
        const { error: roleError } = await supabaseClient
          .from('user_roles')
          .update({ role: 'admin' })
          .eq('user_id', authUser.user.id)

        if (roleError) throw roleError
      }

      return new Response(
        JSON.stringify({ message: 'User created successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (method === 'DELETE') {
      const payload = action as DeleteUserPayload
      
      const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(
        payload.user_id
      )

      if (deleteError) throw deleteError

      return new Response(
        JSON.stringify({ message: 'User deleted successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid method')

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})