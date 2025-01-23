import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

type Respondent = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  primary_sbu?: {
    name: string;
  };
  assignment_id: string;
  last_reminder_sent: string | null;
};

type Props = {
  campaignId: string;
  instanceId?: string;
};

export function PendingRespondents({ campaignId, instanceId }: Props) {
  const { toast } = useToast();
  const [sendingReminders, setSendingReminders] = useState<Record<string, boolean>>({});

  const { data: pendingRespondents, isLoading } = useQuery({
    queryKey: ["pending-respondents", campaignId, instanceId],
    queryFn: async () => {
      const { data: assignments, error } = await supabase
        .from("survey_assignments")
        .select(`
          id,
          last_reminder_sent,
          due_date,
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
          ),
          survey:surveys (
            name
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
          assignment_id: assignment.id,
          last_reminder_sent: assignment.last_reminder_sent,
        };
      });
    },
  });

  const handleSendReminder = async (respondent: Respondent) => {
    setSendingReminders(prev => ({ ...prev, [respondent.id]: true }));
    
    try {
      const { data: assignment } = await supabase
        .from("survey_assignments")
        .select("due_date, survey:surveys(name)")
        .eq("id", respondent.assignment_id)
        .single();

      if (!assignment) throw new Error("Assignment not found");

      const response = await supabase.functions.invoke("send-survey-reminder", {
        body: {
          assignmentId: respondent.assignment_id,
          surveyName: assignment.survey.name,
          dueDate: assignment.due_date,
          recipientEmail: respondent.email,
          recipientName: `${respondent.first_name || ''} ${respondent.last_name || ''}`.trim() || 'Participant',
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to send reminder");
      }

      toast({
        title: "Reminder Sent",
        description: `A reminder has been sent to ${respondent.email}`,
      });
    } catch (error: any) {
      console.error("Error sending reminder:", error);
      toast({
        title: "Error",
        description: error.message === "A reminder was already sent in the last 24 hours"
          ? "A reminder was already sent in the last 24 hours"
          : "Failed to send reminder. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSendingReminders(prev => ({ ...prev, [respondent.id]: false }));
    }
  };

  const canSendReminder = (lastReminderSent: string | null) => {
    if (!lastReminderSent) return true;
    const hoursSinceLastReminder = (Date.now() - new Date(lastReminderSent).getTime()) / (1000 * 60 * 60);
    return hoursSinceLastReminder >= 24;
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
                  {respondent.last_reminder_sent && (
                    <p className="text-xs text-gray-400">
                      Last reminder: {new Date(respondent.last_reminder_sent).toLocaleString()}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSendReminder(respondent)}
                  disabled={sendingReminders[respondent.id] || !canSendReminder(respondent.last_reminder_sent)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {sendingReminders[respondent.id] ? "Sending..." : "Send Reminder"}
                </Button>
              </div>
            ))}
            {(!pendingRespondents || pendingRespondents.length === 0) && (
              <div className="text-center text-gray-500">
                No pending respondents found
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}