import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

interface CreateUserPayload {
  email: string
  password?: string
  first_name?: string
  last_name?: string
  is_admin?: boolean
  method?: 'SINGLE' | 'BATCH'
  users?: CreateUserPayload[]
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

async function createSingleUser(payload: CreateUserPayload) {
  console.log('Creating single user with payload:', {
    ...payload,
    password: payload.password ? '[REDACTED]' : undefined
  });

  if (!payload.email) {
    console.error('Email is required');
    return { 
      success: false, 
      error: 'Email is required',
      details: { email: payload.email }
    };
  }

  try {
    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: payload.email,
      password: payload.password || Math.random().toString(36).slice(-8),
      email_confirm: true,
      user_metadata: {
        first_name: payload.first_name,
        last_name: payload.last_name
      }
    });

    if (authError) {
      console.error('Auth user creation failed:', authError);
      return { 
        success: false, 
        error: authError.message,
        details: authError
      };
    }

    console.log('Auth user created:', authUser);

    // Set admin role if requested
    if (payload.is_admin) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: 'admin' })
        .eq('user_id', authUser.user.id);

      if (roleError) {
        console.error('Role update failed:', roleError);
        // Don't throw here, the user is still created
      }
    }

    return { 
      success: true, 
      userId: authUser.user.id, 
      email: payload.email 
    };
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
    results.push(result);
  }
  
  // Check if any operations were successful
  const hasSuccessfulOperations = results.some(result => result.success);
  
  return {
    success: hasSuccessfulOperations,
    results
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: CreateUserPayload = await req.json();
    console.log('Received payload:', {
      ...payload,
      password: payload.password ? '[REDACTED]' : undefined
    });

    let result;
    if (payload.method === 'BATCH' && payload.users) {
      result = await createBatchUsers(payload.users);
      return new Response(
        JSON.stringify(result.results),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: result.success ? 200 : 400
        }
      );
    } else {
      result = await createSingleUser(payload);
      return new Response(
        JSON.stringify(result),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: result.success ? 200 : 400
        }
      );
    }
  } catch (error) {
    console.error('Request failed:', error);
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
    );
  }
})