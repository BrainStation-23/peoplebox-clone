import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

        // Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: user.first_name,
            last_name: user.last_name,
            org_id: user.org_id,
            level_id: user.level_id,
            location_id: user.location_id,
            employment_type_id: user.employment_type_id,
            employee_role_id: user.employee_role_id,
            employee_type_id: user.employee_type_id,
            gender: user.gender,
            date_of_birth: user.date_of_birth,
            designation: user.designation,
          })
          .eq('id', user.id)

        if (profileError) {
          throw profileError
        }

        // Update role if provided
        if (user.role) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .update({ role: user.role })
            .eq('user_id', user.id)

          if (roleError) {
            throw roleError
          }
        }

        // Handle SBU assignments if provided
        if (user.sbus) {
          // Delete existing SBU assignments
          await supabase
            .from('user_sbus')
            .delete()
            .eq('user_id', user.id)

          // Create new SBU assignments
          const sbuList = user.sbus.split(';').map((sbu: string) => sbu.trim())
          for (let i = 0; i < sbuList.length; i++) {
            const { data: sbuData } = await supabase
              .from('sbus')
              .select('id')
              .eq('name', sbuList[i])
              .single()

            if (sbuData) {
              await supabase
                .from('user_sbus')
                .insert({
                  user_id: user.id,
                  sbu_id: sbuData.id,
                  is_primary: i === 0,
                })
            }
          }
        }

        results.successful++
      } catch (error) {
        console.error('Error updating user:', error)
        results.failed++
        results.errors.push({
          user,
          error: error.message,
        })
      }
    }

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})