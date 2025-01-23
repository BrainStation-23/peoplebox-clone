import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserRow {
  email: string;
  first_name?: string;
  last_name?: string;
  org_id?: string;
  level?: string;
  primary_sbu?: string;
  is_admin?: boolean;
  action: 'create' | 'update';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const formData = await req.formData()
    const file = formData.get('file')

    if (!file) {
      throw new Error('No file provided')
    }

    const text = await file.text()
    const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim()))
    const headers = rows[0]
    const users: UserRow[] = rows.slice(1).map(row => {
      const user: Record<string, string> = {}
      headers.forEach((header, i) => {
        user[header] = row[i]?.replace(/^"|"$/g, '') || ''
      })
      return user as unknown as UserRow
    })

    // Process each user
    const results = await Promise.all(
      users.map(async (user) => {
        try {
          // Look up level ID
          let levelId = null
          if (user.level) {
            const { data: levelData } = await supabase
              .from('levels')
              .select('id')
              .eq('name', user.level)
              .single()
            
            if (!levelData) {
              throw new Error(`Level "${user.level}" not found`)
            }
            levelId = levelData.id
          }

          // Look up SBU ID
          let sbuId = null
          if (user.primary_sbu) {
            const { data: sbuData } = await supabase
              .from('sbus')
              .select('id')
              .eq('name', user.primary_sbu)
              .single()
            
            if (!sbuData) {
              throw new Error(`SBU "${user.primary_sbu}" not found`)
            }
            sbuId = sbuData.id
          }

          if (user.action === 'create') {
            // Create auth user
            const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
              email: user.email,
              email_confirm: true,
              password: crypto.randomUUID().slice(0, 8)
            })

            if (createError) throw createError

            // Update profile
            const { error: profileError } = await supabase
              .from('profiles')
              .update({
                first_name: user.first_name,
                last_name: user.last_name,
                org_id: user.org_id,
                level_id: levelId
              })
              .eq('id', authUser.user.id)

            if (profileError) throw profileError

            // Set role
            if (user.is_admin) {
              const { error: roleError } = await supabase
                .from('user_roles')
                .update({ role: 'admin' })
                .eq('user_id', authUser.user.id)

              if (roleError) throw roleError
            }

            // Set primary SBU
            if (sbuId) {
              const { error: sbuError } = await supabase
                .from('user_sbus')
                .insert({
                  user_id: authUser.user.id,
                  sbu_id: sbuId,
                  is_primary: true
                })

              if (sbuError) throw sbuError
            }
          } else {
            // Update existing user
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', user.email)
              .single()

            if (userError || !userData) {
              throw new Error(`User with email "${user.email}" not found`)
            }

            const userId = userData.id

            // Update profile
            const { error: profileError } = await supabase
              .from('profiles')
              .update({
                first_name: user.first_name,
                last_name: user.last_name,
                org_id: user.org_id,
                level_id: levelId
              })
              .eq('id', userId)

            if (profileError) throw profileError

            // Update role
            const { error: roleError } = await supabase
              .from('user_roles')
              .update({ role: user.is_admin ? 'admin' : 'user' })
              .eq('user_id', userId)

            if (roleError) throw roleError

            // Update primary SBU
            if (sbuId) {
              const { error: sbuDeleteError } = await supabase
                .from('user_sbus')
                .delete()
                .eq('user_id', userId)
                .eq('is_primary', true)

              if (sbuDeleteError) throw sbuDeleteError

              const { error: sbuError } = await supabase
                .from('user_sbus')
                .insert({
                  user_id: userId,
                  sbu_id: sbuId,
                  is_primary: true
                })

              if (sbuError) throw sbuError
            }
          }

          return { email: user.email, success: true }
        } catch (error) {
          console.error(`Error processing user ${user.email}:`, error)
          return { email: user.email, success: false, error: error.message }
        }
      })
    )

    const failures = results.filter(r => !r.success)
    if (failures.length > 0) {
      return new Response(
        JSON.stringify({ 
          message: 'Some users failed to process', 
          failures 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    return new Response(
      JSON.stringify({ message: 'All users processed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})