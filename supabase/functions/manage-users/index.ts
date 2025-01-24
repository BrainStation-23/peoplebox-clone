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

interface BatchCreateUserPayload {
  users: Array<{
    email: string;
    first_name: string | null;
    last_name: string | null;
    is_admin: boolean;
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
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

    if (method === 'CREATE') {
      const payload = action as CreateUserPayload
      console.log('Creating user with payload:', payload)

      // Create the user in auth.users
      const { data: authUser, error: createUserError } = await supabaseClient.auth.admin.createUser({
        email: payload.email,
        password: payload.password,
        email_confirm: true
      })

      if (createUserError) {
        console.error('Error creating user:', createUserError)
        throw createUserError
      }

      console.log('User created successfully:', authUser)

      // Update the profile with additional information
      const { error: updateProfileError } = await supabaseClient
        .from('profiles')
        .update({
          first_name: payload.first_name,
          last_name: payload.last_name,
        })
        .eq('id', authUser.user.id)

      if (updateProfileError) {
        console.error('Error updating profile:', updateProfileError)
        throw updateProfileError
      }

      // If user should be admin, update their role
      if (payload.is_admin) {
        const { error: updateRoleError } = await supabaseClient
          .from('user_roles')
          .update({ role: 'admin' })
          .eq('user_id', authUser.user.id)

        if (updateRoleError) {
          console.error('Error updating role:', updateRoleError)
          throw updateRoleError
        }
      }

      return new Response(
        JSON.stringify({ message: 'User created successfully', user: authUser.user }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (method === 'BATCH_CREATE') {
      const payload = action as BatchCreateUserPayload
      console.log('Creating users in batch:', payload.users.length)

      const results = []
      const errors = []

      for (const user of payload.users) {
        try {
          // Generate a random password for each user
          const password = Math.random().toString(36).slice(-8)

          // Create the user in auth.users
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

          // Update the profile with additional information
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

          // If user should be admin, update their role
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

    if (method === 'DELETE') {
      const payload = action as DeleteUserPayload
      console.log('Attempting to delete user:', payload.user_id)
      
      // First verify the user exists
      const { data: user, error: getUserError } = await supabaseClient.auth.admin.getUserById(
        payload.user_id
      )

      if (getUserError) {
        console.error('Error fetching user:', getUserError)
        throw getUserError
      }

      if (!user) {
        console.error('User not found:', payload.user_id)
        throw new Error('User not found')
      }

      console.log('User found, proceeding with deletion')

      // Delete the user from auth.users
      const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(
        payload.user_id
      )

      if (deleteError) {
        console.error('Error deleting user:', deleteError)
        throw deleteError
      }

      console.log('User deleted successfully')

      return new Response(
        JSON.stringify({ message: 'User deleted successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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