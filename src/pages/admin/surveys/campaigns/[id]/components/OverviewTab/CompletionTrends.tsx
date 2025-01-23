import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

type Props = {
  campaignId: string;
  instanceId?: string;
};

export function CompletionTrends({ campaignId, instanceId }: Props) {
  const { data: trends, isLoading } = useQuery({
    queryKey: ["completion-trends", campaignId, instanceId],
    queryFn: async () => {
      const query = supabase
        .from("survey_responses")
        .select(`
          created_at,
          assignment:survey_assignments!inner(
            campaign_id
          )
        `)
        .eq("assignment.campaign_id", campaignId)
        .order("created_at");

      if (instanceId) {
        query.eq("campaign_instance_id", instanceId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group responses by date
      const responsesByDate = data.reduce((acc: Record<string, number>, response) => {
        const date = format(parseISO(response.created_at), "MMM d");
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      // Convert to array format for chart
      return Object.entries(responsesByDate).map(([date, count]) => ({
        date,
        responses: count,
      }));
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Completion Trends</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="responses" 
              stroke="#8884d8" 
              name="Responses"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}