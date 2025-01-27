import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

interface CreateUserPayload {
  email: string
  password?: string
  first_name?: string
  last_name?: string
  is_admin?: boolean
  org_id?: string
  level?: string
  location?: string
  employment_type?: string
  employee_role?: string
  employee_type?: string
  gender?: string
  date_of_birth?: string
  designation?: string
  sbus?: string
  method?: 'SINGLE' | 'BATCH'
  users?: CreateUserPayload[]
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

async function getLocationId(locationName?: string): Promise<string | null> {
  if (!locationName) return null;
  
  const { data } = await supabase
    .from("locations")
    .select("id")
    .eq("name", locationName)
    .maybeSingle();

  return data?.id || null;
}

async function getLevelId(levelName?: string): Promise<string | null> {
  if (!levelName) return null;
  
  const { data } = await supabase
    .from("levels")
    .select("id")
    .eq("name", levelName)
    .eq("status", "active")
    .maybeSingle();

  return data?.id || null;
}

async function getEmploymentTypeId(typeName?: string): Promise<string | null> {
  if (!typeName) return null;

  const { data } = await supabase
    .from("employment_types")
    .select("id")
    .eq("name", typeName)
    .eq("status", "active")
    .maybeSingle();

  return data?.id || null;
}

async function getEmployeeRoleId(roleName?: string): Promise<string | null> {
  if (!roleName) return null;

  const { data } = await supabase
    .from("employee_roles")
    .select("id")
    .eq("name", roleName)
    .eq("status", "active")
    .maybeSingle();

  return data?.id || null;
}

async function getEmployeeTypeId(typeName?: string): Promise<string | null> {
  if (!typeName) return null;

  const { data } = await supabase
    .from("employee_types")
    .select("id")
    .eq("name", typeName)
    .eq("status", "active")
    .maybeSingle();

  return data?.id || null;
}

async function assignSBUs(userId: string, sbuString?: string): Promise<void> {
  if (!sbuString) return;

  const sbuNames = sbuString.split(";").map(s => s.trim());
  
  const { data: sbus } = await supabase
    .from("sbus")
    .select("id, name")
    .in("name", sbuNames);

  if (!sbus?.length) return;

  const assignments = sbus.map((sbu, index) => ({
    user_id: userId,
    sbu_id: sbu.id,
    is_primary: index === 0,
  }));

  await supabase.from("user_sbus").insert(assignments);
}

async function createSingleUser(payload: CreateUserPayload) {
  console.log('Creating single user:', payload);

  try {
    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: payload.email,
      password: payload.password || Math.random().toString(36).slice(-8),
      email_confirm: true,
    });

    if (authError) {
      console.error('Auth user creation failed:', authError);
      throw authError;
    }

    console.log('Auth user created:', authUser);

    // Get IDs for related entities
    const [levelId, locationId, employmentTypeId, employeeRoleId, employeeTypeId] = 
      await Promise.all([
        getLevelId(payload.level),
        getLocationId(payload.location),
        getEmploymentTypeId(payload.employment_type),
        getEmployeeRoleId(payload.employee_role),
        getEmployeeTypeId(payload.employee_type)
      ]);

    // Update profile with additional info
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        first_name: payload.first_name,
        last_name: payload.last_name,
        org_id: payload.org_id,
        level_id: levelId,
        location_id: locationId,
        employment_type_id: employmentTypeId,
        employee_role_id: employeeRoleId,
        employee_type_id: employeeTypeId,
        gender: payload.gender,
        date_of_birth: payload.date_of_birth,
        designation: payload.designation,
      })
      .eq("id", authUser.user.id);

    if (profileError) {
      console.error('Profile update failed:', profileError);
      throw profileError;
    }

    // Set user role
    if (payload.is_admin) {
      const { error: roleError } = await supabase
        .from("user_roles")
        .update({ role: 'admin' })
        .eq("user_id", authUser.user.id);

      if (roleError) {
        console.error('Role update failed:', roleError);
        throw roleError;
      }
    }

    // Assign SBUs if provided
    if (payload.sbus) {
      await assignSBUs(authUser.user.id, payload.sbus);
    }

    return { success: true, userId: authUser.user.id };
  } catch (error) {
    console.error('User creation failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error 
    };
  }
}

async function createBatchUsers(users: CreateUserPayload[]) {
  console.log('Creating batch users:', users.length);
  
  const results = [];
  for (const user of users) {
    const result = await createSingleUser(user);
    results.push({ ...result, email: user.email });
  }
  
  return results;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: CreateUserPayload = await req.json();
    console.log('Received payload:', payload);

    let result;
    if (payload.method === 'BATCH' && payload.users) {
      result = await createBatchUsers(payload.users);
    } else {
      result = await createSingleUser(payload);
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result.success ? 200 : 400
      }
    );
  } catch (error) {
    console.error('Request failed:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
})