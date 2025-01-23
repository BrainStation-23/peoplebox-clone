import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type Respondent = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  sbu_name: string | null;
};

type Props = {
  campaignId: string;
  instanceId?: string;
};

export function PendingRespondents({ campaignId, instanceId }: Props) {
  const { toast } = useToast();

  const { data: pendingRespondents, isLoading } = useQuery({
    queryKey: ["pending-respondents", campaignId, instanceId],
    queryFn: async () => {
      const query = supabase
        .from("survey_assignments")
        .select(`
          id,
          user:profiles!survey_assignments_user_id_fkey (
            id,
            email,
            first_name,
            last_name
          ),
          sbu_assignments:survey_sbu_assignments (
            sbu:sbus (
              name
            )
          )
        `)
        .eq("campaign_id", campaignId)
        .eq("status", "pending");

      const { data: assignments, error } = await query;
      if (error) throw error;

      // Transform the data
      return assignments.map((assignment): Respondent => ({
        id: assignment.user.id,
        email: assignment.user.email,
        first_name: assignment.user.first_name,
        last_name: assignment.user.last_name,
        sbu_name: assignment.sbu_assignments?.[0]?.sbu?.name || null,
      }));
    },
  });

  const handleSendReminder = (email: string) => {
    // In a real implementation, this would send an actual email
    toast({
      title: "Reminder Sent",
      description: `A reminder has been sent to ${email}`,
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Respondents</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {pendingRespondents?.map((respondent) => (
              <div
                key={respondent.id}
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {respondent.first_name} {respondent.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{respondent.email}</p>
                  {respondent.sbu_name && (
                    <p className="text-sm text-gray-500">{respondent.sbu_name}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSendReminder(respondent.email)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Reminder
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}