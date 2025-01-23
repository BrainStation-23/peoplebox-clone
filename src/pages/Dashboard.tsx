import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default function Dashboard() {
  const navigate = useNavigate();

  // Fetch user profile data
  const { data: profile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return null;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          level:levels(name),
          user_sbus!inner(
            is_primary,
            sbu:sbus(name)
          )
        `)
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Check authentication
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      }
    };

    checkUser();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />
      <div className="flex">
        <DashboardNav />
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6">Welcome back, {profile?.first_name || 'User'}</h1>
            {/* Content will be added in Phase 2 */}
            <div className="text-muted-foreground">
              Your surveys and activities will appear here.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}