import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

interface UpdateUserData {
  id: string
  email: string
  firstName?: string
  lastName?: string
  orgId?: string
  level?: string
  role?: 'admin' | 'user'
  gender?: string
  dateOfBirth?: string
  designation?: string
  location?: string
  employmentType?: string
  employeeRole?: string
  employeeType?: string
  sbus?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, file } = await req.json()

    if (action !== 'update') {
      throw new Error('Invalid action')
    }

    const rows = file.split('\n').map((row: string) => row.split(','))
    const headers = rows[0].map((h: string) => h.replace(/"/g, '').trim())
    const users: UpdateUserData[] = []

    // Process each row (skip header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (row.length === 1 && !row[0]) continue // Skip empty rows

      const user: UpdateUserData = {
        id: row[headers.indexOf('ID')]?.replace(/"/g, '').trim(),
        email: row[headers.indexOf('Email')]?.replace(/"/g, '').trim(),
        firstName: row[headers.indexOf('First Name')]?.replace(/"/g, '').trim(),
        lastName: row[headers.indexOf('Last Name')]?.replace(/"/g, '').trim(),
        orgId: row[headers.indexOf('Org ID')]?.replace(/"/g, '').trim(),
        level: row[headers.indexOf('Level')]?.replace(/"/g, '').trim(),
        role: row[headers.indexOf('Role')]?.replace(/"/g, '').trim().toLowerCase() as 'admin' | 'user',
        gender: row[headers.indexOf('Gender')]?.replace(/"/g, '').trim(),
        dateOfBirth: row[headers.indexOf('Date of Birth')]?.replace(/"/g, '').trim(),
        designation: row[headers.indexOf('Designation')]?.replace(/"/g, '').trim(),
        location: row[headers.indexOf('Location')]?.replace(/"/g, '').trim(),
        employmentType: row[headers.indexOf('Employment Type')]?.replace(/"/g, '').trim(),
        employeeRole: row[headers.indexOf('Employee Role')]?.replace(/"/g, '').trim(),
        employeeType: row[headers.indexOf('Employee Type')]?.replace(/"/g, '').trim(),
        sbus: row[headers.indexOf('SBUs')]?.replace(/"/g, '').trim(),
      }

      if (!user.id) {
        console.error(`Row ${i + 1}: Missing ID`)
        continue
      }

      users.push(user)
    }

    console.log(`Processing ${users.length} users for update`)

    // Process updates in batches
    const batchSize = 50
    const results = []

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize)
      const updates = await Promise.all(
        batch.map(async (user) => {
          try {
            // Get reference data IDs
            const [levelData, locationData, employmentTypeData, employeeRoleData, employeeTypeData] =
              await Promise.all([
                user.level
                  ? supabaseClient
                      .from('levels')
                      .select('id')
                      .eq('name', user.level)
                      .single()
                  : null,
                user.location
                  ? supabaseClient
                      .from('locations')
                      .select('id')
                      .eq('name', user.location)
                      .single()
                  : null,
                user.employmentType
                  ? supabaseClient
                      .from('employment_types')
                      .select('id')
                      .eq('name', user.employmentType)
                      .single()
                  : null,
                user.employeeRole
                  ? supabaseClient
                      .from('employee_roles')
                      .select('id')
                      .eq('name', user.employeeRole)
                      .single()
                  : null,
                user.employeeType
                  ? supabaseClient
                      .from('employee_types')
                      .select('id')
                      .eq('name', user.employeeType)
                      .single()
                  : null,
              ])

            // Update profile
            const { error: profileError } = await supabaseClient
              .from('profiles')
              .update({
                first_name: user.firstName,
                last_name: user.lastName,
                org_id: user.orgId,
                level_id: levelData?.data?.id,
                location_id: locationData?.data?.id,
                employment_type_id: employmentTypeData?.data?.id,
                employee_role_id: employeeRoleData?.data?.id,
                employee_type_id: employeeTypeData?.data?.id,
                gender: user.gender,
                date_of_birth: user.dateOfBirth,
                designation: user.designation,
              })
              .eq('id', user.id)

            if (profileError) throw profileError

            // Update role if provided
            if (user.role) {
              const { error: roleError } = await supabaseClient
                .from('user_roles')
                .update({ role: user.role })
                .eq('user_id', user.id)

              if (roleError) throw roleError
            }

            // Update SBUs if provided
            if (user.sbus) {
              const sbuNames = user.sbus.split(';').map((s) => s.trim())
              const { data: sbus, error: sbuError } = await supabaseClient
                .from('sbus')
                .select('id, name')
                .in('name', sbuNames)

              if (sbuError) throw sbuError

              // Delete existing SBU assignments
              await supabaseClient.from('user_sbus').delete().eq('user_id', user.id)

              // Create new SBU assignments
              if (sbus) {
                const assignments = sbus.map((sbu, index) => ({
                  user_id: user.id,
                  sbu_id: sbu.id,
                  is_primary: index === 0,
                }))

                const { error: assignError } = await supabaseClient
                  .from('user_sbus')
                  .insert(assignments)

                if (assignError) throw assignError
              }
            }

            return { success: true, id: user.id }
          } catch (error) {
            console.error(`Error updating user ${user.id}:`, error)
            return { success: false, id: user.id, error }
          }
        })
      )

      results.push(...updates)
    }

    const successful = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    return new Response(
      JSON.stringify({
        message: `Updated ${successful} users successfully. ${failed} updates failed.`,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})