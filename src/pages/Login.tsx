import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Don't redirect if we're in the recovery flow
      const isRecoveryFlow = searchParams.get('type') === 'recovery' || 
                            searchParams.get('code') !== null;
                            
      if (!isRecoveryFlow && session) {
        // Check if user is admin
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (roleData?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/user/dashboard');
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event); // Add logging to debug auth events
      
      // Only redirect on successful sign in, not during recovery
      if (event === 'SIGNED_IN') {
        checkUser();
      }
    });

    // Only check user if not in recovery flow
    const isRecoveryFlow = searchParams.get('type') === 'recovery' || 
                          searchParams.get('code') !== null;
    if (!isRecoveryFlow) {
      checkUser();
    }

    return () => subscription.unsubscribe();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-8">Welcome Back</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2563eb',
                  brandAccent: '#1d4ed8',
                },
              },
            },
          }}
          providers={[]}
          view={searchParams.get('type') === 'recovery' ? 'update_password' : undefined}
          theme="light"
        />
      </Card>
    </div>
  );
}