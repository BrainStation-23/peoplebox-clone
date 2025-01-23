import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import MySurveysList from "@/components/shared/surveys/MySurveysList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Clock, ArrowRight, Eye, List } from "lucide-react";
import { usePendingSurveysCount } from "@/hooks/use-pending-surveys-count";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  // Fetch survey statistics
  const { data: pendingCount } = usePendingSurveysCount();

  const { data: surveyStats } = useQuery({
    queryKey: ["survey-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: completed, error: completedError } = await supabase
        .from("survey_assignments")
        .select("id, campaign:survey_campaigns!inner(status)")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .neq("campaign.status", "draft");

      const { data: dueSoon, error: dueSoonError } = await supabase
        .from("survey_assignments")
        .select("id, campaign:survey_campaigns!inner(status)")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .neq("campaign.status", "draft")
        .or(`due_date.gte.${new Date().toISOString()},due_date.lte.${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()}`);

      if (completedError || dueSoonError) throw new Error("Failed to fetch survey stats");

      return {
        completed: completed?.length || 0,
        dueSoon: dueSoon?.length || 0
      };
    },
  });

  // Fetch latest survey assignment
  const { data: latestSurvey } = useQuery({
    queryKey: ["latest-survey"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("survey_assignments")
        .select(`
          id,
          survey:surveys (name),
          campaign:survey_campaigns (name)
        `)
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) return null;
      return data;
    },
  });

  // Fetch recent notifications
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("survey_assignments")
        .select(`
          id,
          survey:surveys (name),
          campaign:survey_campaigns (name),
          due_date,
          status
        `)
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("due_date", { ascending: true })
        .limit(5);

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

  const handleQuickAction = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />
      <div className="flex">
        <DashboardNav />
        <main className="flex-1 p-6">
          <div className="container mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Welcome back, {profile?.first_name || 'User'}</h1>
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {latestSurvey && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-between"
                      onClick={() => handleQuickAction(`/admin/my-surveys/${latestSurvey.id}`)}
                    >
                      Latest Survey: {latestSurvey.campaign?.name || latestSurvey.survey.name}
                      <ArrowRight />
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={() => handleQuickAction("/admin/my-surveys")}
                  >
                    View All Surveys
                    <List />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={() => handleQuickAction("/admin/profile")}
                  >
                    Profile Settings
                    <Eye />
                  </Button>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-4">
                      {notifications?.map((notification) => {
                        const dueDate = notification.due_date ? new Date(notification.due_date) : null;
                        const daysUntilDue = dueDate 
                          ? Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                          : null;

                        return (
                          <div 
                            key={notification.id}
                            className="flex items-start space-x-4 text-sm"
                          >
                            {daysUntilDue !== null && daysUntilDue <= 3 ? (
                              <AlertCircle className="h-5 w-5 text-orange-500 shrink-0" />
                            ) : (
                              <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                            )}
                            <div>
                              <p className="font-medium">
                                {notification.campaign?.name || notification.survey.name}
                              </p>
                              <p className="text-muted-foreground">
                                {daysUntilDue !== null
                                  ? daysUntilDue <= 0
                                    ? "Overdue"
                                    : `Due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`
                                  : "No due date"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {(!notifications || notifications.length === 0) && (
                        <p className="text-muted-foreground text-center py-8">
                          No pending notifications
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Statistics Cards */}
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

            {/* Surveys List */}
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
