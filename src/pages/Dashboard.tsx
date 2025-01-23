import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import MySurveysList from "@/components/shared/surveys/MySurveysList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { usePendingSurveysCount } from "@/hooks/use-pending-surveys-count";

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

  // Fetch survey statistics
  const { data: pendingCount } = usePendingSurveysCount();

  const { data: surveyStats } = useQuery({
    queryKey: ["survey-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: completed, error: completedError } = await supabase
        .from("survey_assignments")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .not("campaign.status", "eq", "draft");

      const { data: dueSoon, error: dueSoonError } = await supabase
        .from("survey_assignments")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .not("campaign.status", "eq", "draft")
        .or(`due_date.gte.${new Date().toISOString()},due_date.lte.${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()}`);

      if (completedError || dueSoonError) throw new Error("Failed to fetch survey stats");

      return {
        completed: completed?.length || 0,
        dueSoon: dueSoon?.length || 0
      };
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
          <div className="container mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Welcome back, {profile?.first_name || 'User'}</h1>
            
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Surveys</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingCount || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{surveyStats?.completed || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{surveyStats?.dueSoon || 0}</div>
                </CardContent>
              </Card>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-6">My Surveys</h2>
                <MySurveysList />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}