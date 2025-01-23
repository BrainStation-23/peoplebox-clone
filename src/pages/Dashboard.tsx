import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default function Dashboard() {
  const navigate = useNavigate();

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
          user_sbus(
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
          <Outlet />
        </main>
      </div>
    </div>
  );
}