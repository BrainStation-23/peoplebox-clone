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
  primary_sbu?: {
    name: string;
  };
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
      const { data: assignments, error } = await supabase
        .from("survey_assignments")
        .select(`
          id,
          user:profiles!survey_assignments_user_id_fkey (
            id,
            email,
            first_name,
            last_name,
            user_sbus (
              is_primary,
              sbu:sbus (
                name
              )
            )
          )
        `)
        .eq("campaign_id", campaignId)
        .eq("status", "pending");

      if (error) throw error;

      // Transform the data
      return assignments.map((assignment): Respondent => {
        const primarySbu = assignment.user.user_sbus?.find(us => us.is_primary);
        return {
          id: assignment.user.id,
          email: assignment.user.email,
          first_name: assignment.user.first_name,
          last_name: assignment.user.last_name,
          primary_sbu: primarySbu ? { name: primarySbu.sbu.name } : undefined,
        };
      });
    },
  });

  const handleSendReminder = (email: string) => {
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
                  {respondent.primary_sbu && (
                    <p className="text-sm text-gray-500">{respondent.primary_sbu.name}</p>
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