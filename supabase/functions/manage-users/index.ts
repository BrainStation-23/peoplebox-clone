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
}

interface DeleteUserPayload {
  user_id: string;
}

interface BatchCreateUserPayload {
  users: Array<{
    id?: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    is_admin: boolean;
  }>;
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
            
            const { error: updateProfileError } = await supabaseClient
              .from('profiles')
              .update({
                first_name: user.first_name,
                last_name: user.last_name,
              })
              .eq('id', user.id)

            if (updateProfileError) {
              console.error('Error updating profile:', updateProfileError)
              errors.push({ user: user, error: updateProfileError.message })
              continue
            }

            // Update role if needed
            if (user.is_admin) {
              const { error: updateRoleError } = await supabaseClient
                .from('user_roles')
                .update({ role: 'admin' })
                .eq('user_id', user.id)

              if (updateRoleError) {
                console.error('Error updating role:', updateRoleError)
                errors.push({ user: user, error: updateRoleError.message })
                continue
              }
            }

            results.push({ user: user, success: true })
          } else {
            // Create new user
            const password = Math.random().toString(36).slice(-8)
            
            const { data: authUser, error: createUserError } = await supabaseClient.auth.admin.createUser({
              email: user.email,
              password: password,
              email_confirm: true
            })

            if (createUserError) {
              console.error('Error creating user:', createUserError)
              errors.push({ user: user, error: createUserError.message })
              continue
            }

            const { error: updateProfileError } = await supabaseClient
              .from('profiles')
              .update({
                first_name: user.first_name,
                last_name: user.last_name,
              })
              .eq('id', authUser.user.id)

            if (updateProfileError) {
              console.error('Error updating profile:', updateProfileError)
              errors.push({ user: user, error: updateProfileError.message })
              continue
            }

            if (user.is_admin) {
              const { error: updateRoleError } = await supabaseClient
                .from('user_roles')
                .update({ role: 'admin' })
                .eq('user_id', authUser.user.id)

              if (updateRoleError) {
                console.error('Error updating role:', updateRoleError)
                errors.push({ user: user, error: updateRoleError.message })
                continue
              }
            }

            results.push({ user: user, success: true })
          }
        } catch (error) {
          console.error('Error processing user:', user, error)
          errors.push({ user: user, error: error.message })
        }
      }

      return new Response(
        JSON.stringify({ 
          message: 'Batch processing completed',
          results: results,
          errors: errors
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    console.error('Invalid method received:', method)
    throw new Error('Invalid method')

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.details || 'No additional details available'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
